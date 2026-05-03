import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateNomorAntrian, generateNomorStruk } from '@/lib/utils'
import { pusherServer } from '@/lib/pusher'
import { deleteFile } from '@/lib/cloudinary'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { status, konfirmasiBayar } = await req.json()
    const { id: orderId } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { antrian: true, orderDetailLayanan: true, orderDetailATK: { include: { produk: true } } },
    })

    if (!order) return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 })

    const oldStatus = order.status
    let antrianNomor = order.antrian?.nomorAntrian

    const updatedOrder = await prisma.$transaction(async (tx: any) => {
      // Update status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status },
      })

      // Jika konfirmasi pembayaran, buat antrian
      if (konfirmasiBayar && !order.antrian) {
        const lastAntrian = await tx.antrian.findFirst({
          orderBy: { createdAt: 'desc' },
        })
        const lastNum = lastAntrian ? parseInt(lastAntrian.nomorAntrian.split('-')[1]) : 0
        antrianNomor = generateNomorAntrian(lastNum)

        await tx.antrian.create({
          data: { orderId, nomorAntrian: antrianNomor!, status: 'MENUNGGU' },
        })

        // Create struk
        const nomorStruk = generateNomorStruk()
        await tx.struk.create({ data: { orderId, nomorStruk } })
      }

      // Jika SEDANG_DIPROSES, update antrian
      if (status === 'SEDANG_DIPROSES' && order.antrian) {
        await tx.antrian.update({ where: { orderId }, data: { status: 'DIPROSES' } })
      }

      // Jika SELESAI - kurangi stok, hapus file Cloudinary
      if (status === 'SELESAI') {
        // Reduce ATK stock
        for (const detail of order.orderDetailATK) {
          await tx.produkATK.update({
            where: { id: detail.produkId },
            data: { stok: { decrement: detail.jumlah } },
          })
        }

        // Reduce Kertas stock
        for (const detail of order.orderDetailLayanan) {
          const layanan = await tx.layanan.findUnique({ where: { id: detail.layananId } })
          if (layanan) {
            let jenisBahan = null
            if (layanan.ukuran === 'A4') jenisBahan = 'KERTAS_A4'
            else if (layanan.ukuran === 'F4') jenisBahan = 'KERTAS_F4'
            else if (layanan.ukuran === 'A3') jenisBahan = 'KERTAS_A3'

            if (jenisBahan) {
              const bahan = await tx.stokBahan.findFirst({ where: { jenis: jenisBahan } })
              if (bahan) {
                await tx.stokBahan.update({
                  where: { id: bahan.id },
                  data: { stokSaat: { decrement: detail.jumlahLembar * detail.jumlahCopy } }
                })
              }
            }
          }
        }

        // Update antrian
        if (order.antrian) {
          await tx.antrian.update({ where: { orderId }, data: { status: 'SELESAI' } })
        }

        // Delete files from Cloudinary
        for (const detail of order.orderDetailLayanan) {
          if (detail.filePublicId) {
            try { await deleteFile(detail.filePublicId) } catch (e) { console.error('Failed to delete file:', e) }
          }
        }
      }

      // Log aktivitas
      await tx.logAktivitas.create({
        data: {
          userId: session.user.id,
          aksi: konfirmasiBayar ? 'KONFIRMASI_PEMBAYARAN' : 'UPDATE_STATUS_ORDER',
          entitas: 'Order',
          entitasId: orderId,
          dataBefore: { status: oldStatus },
          dataAfter: { status },
          keterangan: `Status order ${order.nomorOrder} diubah: ${oldStatus} → ${status}`,
        },
      })

      return updated
    })

    // Notify customer via Pusher
    if (order.customerId) {
      try {
        await pusherServer.trigger(`customer-${order.customerId}`, 'order-status-update', {
          orderId,
          nomorOrder: order.nomorOrder,
          status,
          nomorAntrian: antrianNomor,
        })
      } catch (err) { console.warn('Pusher failed:', err) }
    }

    // Notify admin channel
    try {
      await pusherServer.trigger('admin-channel', 'order-updated', { orderId, status })
    } catch (err) { console.warn('Pusher failed:', err) }

    return NextResponse.json({ success: true, order: updatedOrder, nomorAntrian: antrianNomor })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ message: 'Gagal memperbarui order' }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        antrian: true,
        orderDetailLayanan: { include: { layanan: true } },
        orderDetailATK: { include: { produk: true } },
        struk: true,
      },
    })

    if (!order) return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 })
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data order' }, { status: 500 })
  }
}
