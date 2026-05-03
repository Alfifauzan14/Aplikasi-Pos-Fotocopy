import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateNomorOrder, generateNomorAntrian, generateNomorStruk } from '@/lib/utils'
import { pusherServer } from '@/lib/pusher'

interface CartItem {
  type: 'layanan' | 'atk'
  id: string
  nama: string
  harga: number
  qty: number
  jumlahLembar?: number
  subtotal: number
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { namaCustomer, metodeBayar, cart } = body as {
      namaCustomer: string
      metodeBayar: 'CASH' | 'QRIS'
      cart: CartItem[]
    }

    if (!cart || cart.length === 0) {
      return NextResponse.json({ message: 'Keranjang kosong' }, { status: 400 })
    }

    // Get last antrian number
    const lastAntrian = await prisma.antrian.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { nomorAntrian: true },
    })
    const lastNum = lastAntrian ? parseInt(lastAntrian.nomorAntrian.split('-')[1]) : 0

    const nomorOrder = generateNomorOrder()
    const nomorAntrian = generateNomorAntrian(lastNum)
    const nomorStruk = generateNomorStruk()
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0)

    // Create order in transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          nomorOrder,
          namaCustomer: namaCustomer || 'Customer Umum',
          tipeOrder: 'LANGSUNG',
          status: 'SELESAI',
          totalHarga: total,
          metodeBayar,
        },
      })

      // Create order details
      for (const item of cart) {
        if (item.type === 'layanan') {
          const layananId = item.id.split('-')[0]
          await tx.orderDetailLayanan.create({
            data: {
              orderId: newOrder.id,
              layananId,
              jumlahLembar: item.jumlahLembar || 1,
              jumlahCopy: 1,
              hargaPerLembar: item.harga,
              subtotal: item.subtotal,
            },
          })

          // Reduce Kertas stock
          const layanan = await tx.layanan.findUnique({ where: { id: layananId } })
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
                  data: { stokSaat: { decrement: item.jumlahLembar || 1 } }
                })
              }
            }
          }
        } else {
          await tx.orderDetailATK.create({
            data: {
              orderId: newOrder.id,
              produkId: item.id,
              jumlah: item.qty,
              harga: item.harga,
              subtotal: item.subtotal,
            },
          })

          // Reduce ATK stock
          await tx.produkATK.update({
            where: { id: item.id },
            data: { stok: { decrement: item.qty } },
          })
        }
      }

      // Create antrian
      const antrian = await tx.antrian.create({
        data: {
          orderId: newOrder.id,
          nomorAntrian,
          status: 'SELESAI',
        },
      })

      // Create struk
      await tx.struk.create({
        data: { orderId: newOrder.id, nomorStruk },
      })

      // Log aktivitas
      const session = await auth()
      if (session?.user) {
        await tx.logAktivitas.create({
          data: {
            userId: session.user.id,
            aksi: 'BUAT_TRANSAKSI',
            entitas: 'Order',
            entitasId: newOrder.id,
            dataAfter: { nomorOrder, total, namaCustomer, metodeBayar },
            keterangan: `Transaksi langsung - ${nomorOrder} - ${namaCustomer}`,
          },
        })
      }

      return { order: newOrder, antrian }
    })

    // Trigger pusher for new order
    try {
      await pusherServer.trigger('admin-channel', 'new-order', {
        nomorOrder,
        nomorAntrian,
        namaCustomer: namaCustomer || 'Customer Umum',
        total,
      })
    } catch (err) {
      console.warn('Pusher failed:', err)
    }

    return NextResponse.json({
      success: true,
      nomorOrder,
      nomorAntrian,
      nomorStruk,
      namaCustomer: namaCustomer || 'Customer Umum',
      metodeBayar,
      total,
      items: cart,
    })
  } catch (error) {
    console.error('Error creating langsung order:', error)
    return NextResponse.json({ message: 'Gagal membuat transaksi' }, { status: 500 })
  }
}
