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
    const periode = searchParams.get('periode') || 'bulanan'
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    let dateFilter: any = {}

    if (startDate && endDate) {
      dateFilter = { gte: new Date(startDate), lte: new Date(endDate) }
    } else if (periode === 'harian') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      dateFilter = { gte: today, lt: tomorrow }
    } else if (periode === 'mingguan') {
      const now = new Date()
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter = { gte: weekAgo, lte: now }
    } else {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      dateFilter = { gte: monthStart, lte: now }
    }

    const orders = await prisma.order.findMany({
      where: {
        status: 'SELESAI',
        createdAt: dateFilter,
      },
      include: {
        orderDetailLayanan: { include: { layanan: true } },
        orderDetailATK: { include: { produk: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group by date for chart
    const dailyData: Record<string, number> = {}
    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      dailyData[dateKey] = (dailyData[dateKey] || 0) + Number(order.totalHarga)
    }

    const chartData = Object.entries(dailyData).map(([date, total]) => ({ date, total }))

    // Service breakdown
    const layananBreakdown: Record<string, { count: number; revenue: number }> = {}
    for (const order of orders) {
      for (const detail of order.orderDetailLayanan) {
        const key = detail.layanan.nama
        if (!layananBreakdown[key]) layananBreakdown[key] = { count: 0, revenue: 0 }
        layananBreakdown[key].count += detail.jumlahLembar
        layananBreakdown[key].revenue += Number(detail.subtotal)
      }
    }

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalHarga), 0)
    const totalOrders = orders.length
    const onlineOrders = orders.filter(o => o.tipeOrder === 'ONLINE').length
    const langsungOrders = orders.filter(o => o.tipeOrder === 'LANGSUNG').length

    return NextResponse.json({
      summary: { totalRevenue, totalOrders, onlineOrders, langsungOrders },
      chartData,
      layananBreakdown: Object.entries(layananBreakdown).map(([nama, data]) => ({ nama, ...data })),
      orders: orders.map(o => ({
        id: o.id,
        nomorOrder: o.nomorOrder,
        namaCustomer: o.namaCustomer,
        tipeOrder: o.tipeOrder,
        totalHarga: o.totalHarga,
        metodeBayar: o.metodeBayar,
        createdAt: o.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error generating laporan:', error)
    return NextResponse.json({ message: 'Gagal mengambil data laporan' }, { status: 500 })
  }
}
