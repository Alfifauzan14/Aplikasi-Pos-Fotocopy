import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Topbar } from '@/components/layout/Sidebar'
import { formatRupiah, formatDate } from '@/lib/utils'
import { ShoppingCart, Clock, CheckCircle, AlertTriangle, Package, TrendingUp, Printer } from 'lucide-react'
import Link from 'next/link'

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    totalOrderHariIni,
    pendapatanHariIni,
    antrianAktif,
    orderTerbaru,
    orderOnlineMenunggu,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow }, status: 'SELESAI' },
      _sum: { totalHarga: true },
    }),
    prisma.antrian.count({ where: { status: { in: ['MENUNGGU', 'DIPROSES'] } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { antrian: true },
    }),
    prisma.order.count({
      where: { tipeOrder: 'ONLINE', status: 'MENUNGGU_PEMBAYARAN' },
    }),
  ])

  // Check stok menipis manually (Correct way)
  const allStok = await prisma.stokBahan.findMany()
  const stokMenipisManual = allStok.filter(s => s.stokSaat <= s.stokMinimum)

  return {
    totalOrderHariIni,
    pendapatanHariIni: Number(pendapatanHariIni._sum.totalHarga || 0),
    antrianAktif,
    stokMenipis: stokMenipisManual,
    orderTerbaru,
    orderOnlineMenunggu,
  }
}

const statusColors: Record<string, string> = {
  MENUNGGU_PEMBAYARAN: 'bg-yellow-100 text-yellow-700',
  PEMBAYARAN_DIKONFIRMASI: 'bg-blue-100 text-blue-700',
  SEDANG_DIPROSES: 'bg-purple-100 text-purple-700',
  SIAP_DIAMBIL: 'bg-green-100 text-green-700',
  SELESAI: 'bg-gray-100 text-gray-600',
  DIBATALKAN: 'bg-red-100 text-red-600',
}

const statusLabels: Record<string, string> = {
  MENUNGGU_PEMBAYARAN: 'Menunggu Bayar',
  PEMBAYARAN_DIKONFIRMASI: 'Bayar Dikonfirmasi',
  SEDANG_DIPROSES: 'Diproses',
  SIAP_DIAMBIL: 'Siap Diambil',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const stats = [
    {
      title: 'Order Hari Ini',
      value: data.totalOrderHariIni.toString(),
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-700',
      bg: 'bg-blue-50',
    },
    {
      title: 'Pendapatan Hari Ini',
      value: formatRupiah(data.pendapatanHariIni),
      icon: TrendingUp,
      color: 'from-green-500 to-green-700',
      bg: 'bg-green-50',
    },
    {
      title: 'Antrian Aktif',
      value: data.antrianAktif.toString(),
      icon: Clock,
      color: 'from-orange-500 to-orange-700',
      bg: 'bg-orange-50',
    },
    {
      title: 'Order Online Menunggu',
      value: data.orderOnlineMenunggu.toString(),
      icon: Printer,
      color: 'from-violet-500 to-violet-700',
      bg: 'bg-violet-50',
    },
  ]

  return (
    <div>
      <Topbar title="Dashboard Admin" role="admin" />
      <div className="p-6 space-y-6">
        {/* Alert Stok */}
        {data.stokMenipis.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-800">⚠️ Stok Menipis ({data.stokMenipis.length} item)</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.stokMenipis.map(s => (
                <span key={s.id} className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                  {s.nama}: {s.stokSaat} {s.satuan} (min: {s.stokMinimum})
                </span>
              ))}
            </div>
            <Link href="/admin/stok" className="inline-block mt-3 text-xs text-amber-700 font-semibold underline">
              Kelola Stok →
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Order Terbaru</h2>
            <Link href="/admin/order-online" className="text-sm text-blue-600 font-semibold hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">No. Order</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipe</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Antrian</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {data.orderTerbaru.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-sm">
                      Belum ada order hari ini
                    </td>
                  </tr>
                ) : (
                  data.orderTerbaru.map(order => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600">{order.nomorOrder}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{order.namaCustomer}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.tipeOrder === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {order.tipeOrder === 'ONLINE' ? 'Online' : 'Langsung'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatRupiah(Number(order.totalHarga))}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-700">{order.antrian?.nomorAntrian || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/transaksi" className="flex items-center gap-4 p-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors shadow-lg">
            <ShoppingCart className="w-8 h-8" />
            <div>
              <p className="font-bold">Transaksi Langsung</p>
              <p className="text-blue-200 text-sm">Input transaksi di toko</p>
            </div>
          </Link>
          <Link href="/admin/order-online" className="flex items-center gap-4 p-5 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-colors shadow-lg">
            <Printer className="w-8 h-8" />
            <div>
              <p className="font-bold">Kelola Order Online</p>
              <p className="text-violet-200 text-sm">{data.orderOnlineMenunggu} menunggu konfirmasi</p>
            </div>
          </Link>
          <Link href="/admin/stok" className="flex items-center gap-4 p-5 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-colors shadow-lg">
            <Package className="w-8 h-8" />
            <div>
              <p className="font-bold">Kelola Stok</p>
              <p className="text-amber-100 text-sm">{data.stokMenipis.length} item menipis</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
