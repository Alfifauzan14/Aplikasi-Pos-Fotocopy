import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'MANAJER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const aksi = searchParams.get('aksi')

    const where: any = {}
    if (aksi) where.aksi = aksi

    const [logs, total] = await Promise.all([
      prisma.logAktivitas.findMany({
        where,
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.logAktivitas.count({ where }),
    ])

    return NextResponse.json({ logs, total, page, limit })
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil log aktivitas' }, { status: 500 })
  }
}
