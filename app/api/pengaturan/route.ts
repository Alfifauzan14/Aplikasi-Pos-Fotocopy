import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const pengaturanKey = searchParams.get('key')

    if (pengaturanKey) {
      const setting = await prisma.pengaturan.findUnique({ where: { key: pengaturanKey } })
      return NextResponse.json(setting)
    }

    const settings = await prisma.pengaturan.findMany()
    const result: Record<string, string> = {}
    settings.forEach(s => { result[s.key] = s.value })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil pengaturan' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session || !['ADMIN', 'MANAJER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const updates = await req.json() as Record<string, string>

    const promises = Object.entries(updates).map(([key, value]) =>
      prisma.pengaturan.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )

    await Promise.all(promises)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menyimpan pengaturan' }, { status: 500 })
  }
}
