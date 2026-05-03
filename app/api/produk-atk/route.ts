import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const produks = await prisma.produkATK.findMany({
      where: { isActive: true },
      orderBy: { nama: 'asc' },
    })
    return NextResponse.json(produks)
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data produk' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const produk = await prisma.produkATK.create({ data })
    return NextResponse.json(produk, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Gagal membuat produk' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...data } = await req.json()
    const updated = await prisma.produkATK.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui produk' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 })
    await prisma.produkATK.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ message: 'Produk dinonaktifkan' })
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus produk' }, { status: 500 })
  }
}
