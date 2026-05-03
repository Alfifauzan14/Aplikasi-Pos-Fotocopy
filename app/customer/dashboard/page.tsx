import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Topbar } from '@/components/layout/Sidebar'
import { formatRupiah, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import Link from 'next/link'
import { Printer, Package, ClipboardList, ArrowRight, Clock, CheckCircle } from 'lucide-react'

export default async function CustomerDashboard() {
  const session = await auth()
  if (!session) return null

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: { antrian: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const totalOrder = await prisma.order.count({ where: { customerId: session.user.id } })
  const orderAktif = await prisma.order.count({
    where: { customerId: session.user.id, status: { in: ['MENUNGGU_PEMBAYARAN', 'PEMBAYARAN_DIKONFIRMASI', 'SEDANG_DIPROSES', 'SIAP_DIAMBIL'] } },
  })

  return (
    <div>
      <Topbar title="Dashboard Customer" role="customer" />
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold">Halo, {session.user.name}! 👋</h2>
          <p className="text-blue-200 mt-1">Selamat datang di Fotocopy & ATK SMAKZIE</p>
          <div className="flex items-center gap-6 mt-4">
            <div>
              <p className="text-3xl font-extrabold">{totalOrder}</p>
              <p className="text-blue-200 text-sm">Total Order</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">{orderAktif}</p>
              <p className="text-blue-200 text-sm">Order Aktif</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/customer/pesan-layanan" className="group flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Pesan Layanan Print</p>
              <p className="text-sm text-gray-500">Upload file dan pilih layanan</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </Link>

          <Link href="/customer/katalog-atk" className="group flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-green-200 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Beli Produk ATK</p>
              <p className="text-sm text-gray-500">Alat tulis kantor lengkap</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
          </Link>
        </div>

        {/* Active Orders */}
        {orderAktif > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">Order Aktif Anda</h3>
            </div>
            {orders.filter(o => ['MENUNGGU_PEMBAYARAN', 'PEMBAYARAN_DIKONFIRMASI', 'SEDANG_DIPROSES', 'SIAP_DIAMBIL'].includes(o.status)).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2">
                <div>
                  <span className="font-mono text-sm font-bold text-blue-700">{order.nomorOrder}</span>
                  {order.antrian && <span className="ml-2 text-xs text-blue-500">#{order.antrian.nomorAntrian}</span>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Order Terbaru</h3>
            <Link href="/customer/riwayat" className="text-sm text-blue-600 hover:underline">Lihat Semua →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Belum ada order</p>
                <Link href="/customer/pesan-layanan" className="text-blue-600 text-sm font-medium hover:underline">Buat order pertama →</Link>
              </div>
            ) : orders.map(order => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono font-semibold text-blue-600">{order.nomorOrder}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatRupiah(Number(order.totalHarga))}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
