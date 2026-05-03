import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const stokList = await prisma.stokBahan.findMany({
      orderBy: { jenis: 'asc' },
      include: {
        riwayatStok: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    return NextResponse.json(stokList)
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data stok' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { stokBahanId, jumlah, keterangan } = await req.json()

    const stok = await prisma.stokBahan.findUnique({ where: { id: stokBahanId } })
    if (!stok) return NextResponse.json({ message: 'Stok tidak ditemukan' }, { status: 404 })

    const stokBaru = stok.stokSaat + jumlah

    await prisma.$transaction([
      prisma.stokBahan.update({
        where: { id: stokBahanId },
        data: { stokSaat: stokBaru },
      }),
      prisma.riwayatStok.create({
        data: {
          stokBahanId,
          jenis: 'MASUK',
          jumlah,
          stokSebelum: stok.stokSaat,
          stokSesudah: stokBaru,
          keterangan,
        },
      }),
    ])

    return NextResponse.json({ success: true, stokBaru })
  } catch (error) {
    return NextResponse.json({ message: 'Gagal melakukan restok' }, { status: 500 })
  }
}
