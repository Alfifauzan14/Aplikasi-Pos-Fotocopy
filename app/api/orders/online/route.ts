import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateNomorOrder, generateNomorAntrian } from '@/lib/utils'
import { pusherServer } from '@/lib/pusher'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')

    const where: any = { tipeOrder: 'ONLINE' }
    if (status) where.status = status
    if (customerId) where.customerId = customerId

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        antrian: true,
        orderDetailLayanan: { include: { layanan: true } },
        orderDetailATK: { include: { produk: true } },
        struk: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data orders' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { cart, catatanOrder, buktiBayar } = body

    if (!cart || cart.length === 0) {
      return NextResponse.json({ message: 'Keranjang kosong' }, { status: 400 })
    }

    const total = cart.reduce((sum: number, item: any) => sum + item.subtotal, 0)
    const nomorOrder = generateNomorOrder()

    const order = await prisma.order.create({
      data: {
        nomorOrder,
        customerId: session.user.id,
        namaCustomer: session.user.name,
        tipeOrder: 'ONLINE',
        status: 'MENUNGGU_PEMBAYARAN',
        totalHarga: total,
        metodeBayar: 'QRIS',
        buktiBayar,
        catatan: catatanOrder,
      },
    })

    // Create order details
    for (const item of cart) {
      if (item.type === 'layanan') {
        await prisma.orderDetailLayanan.create({
          data: {
            orderId: order.id,
            layananId: item.layananId,
            jumlahLembar: item.jumlahLembar,
            jumlahCopy: item.jumlahCopy || 1,
            hargaPerLembar: item.hargaPerLembar,
            subtotal: item.subtotal,
            fileUrl: item.fileUrl,
            filePublicId: item.filePublicId,
            namaFile: item.namaFile,
            catatan: item.catatan,
          },
        })
      } else {
        await prisma.orderDetailATK.create({
          data: {
            orderId: order.id,
            produkId: item.produkId,
            jumlah: item.jumlah,
            harga: item.harga,
            subtotal: item.subtotal,
          },
        })
      }
    }

    // Notify admin
    try {
      await pusherServer.trigger('admin-channel', 'new-online-order', {
        nomorOrder,
        namaCustomer: session.user.name,
        total,
      })
    } catch (err) {
      console.warn('Pusher trigger failed (invalid keys):', err)
    }

    return NextResponse.json({ success: true, nomorOrder, orderId: order.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating online order:', error)
    return NextResponse.json({ message: 'Gagal membuat order' }, { status: 500 })
  }
}
