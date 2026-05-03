import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const layanans = await prisma.layanan.findMany({
      where: { isActive: true },
      orderBy: [{ jenis: 'asc' }, { ukuran: 'asc' }],
    })
    return NextResponse.json(layanans)
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data layanan' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { id, hargaPerLembar } = await req.json()
    const updated = await prisma.layanan.update({
      where: { id },
      data: { hargaPerLembar },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui harga' }, { status: 500 })
  }
}
