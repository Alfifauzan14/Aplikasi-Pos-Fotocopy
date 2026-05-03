import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const antrians = await prisma.antrian.findMany({
      where: {
        status: { in: ['MENUNGGU', 'DIPROSES'] }
      },
      include: {
        order: { select: { namaCustomer: true, tipeOrder: true } }
      },
      orderBy: { createdAt: 'asc' }
    })
    
    return NextResponse.json(antrians)
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data antrian' }, { status: 500 })
  }
}
