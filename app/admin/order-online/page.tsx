'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { formatRupiah, formatDate, getStatusColor, getStatusLabel, generateNomorAntrian } from '@/lib/utils'
import { CheckCircle, XCircle, Eye, RefreshCw, Loader2, FileText, Clock } from 'lucide-react'

interface Order {
  id: string
  nomorOrder: string
  namaCustomer: string
  tipeOrder: string
  status: string
  totalHarga: number
  metodeBayar: string
  buktiBayar: string | null
  createdAt: string
  customer: { name: string; email: string; phone: string } | null
  antrian: { nomorAntrian: string; status: string } | null
  orderDetailLayanan: Array<{
    jumlahLembar: number
    jumlahCopy: number
    subtotal: number
    namaFile: string | null
    fileUrl: string | null
    layanan: { nama: string }
  }>
  orderDetailATK: Array<{
    jumlah: number
    subtotal: number
    produk: { nama: string }
  }>
}

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'MENUNGGU_PEMBAYARAN', label: 'Menunggu Pembayaran' },
  { value: 'PEMBAYARAN_DIKONFIRMASI', label: 'Pembayaran Dikonfirmasi' },
  { value: 'SEDANG_DIPROSES', label: 'Sedang Diproses' },
  { value: 'SIAP_DIAMBIL', label: 'Siap Diambil' },
  { value: 'SELESAI', label: 'Selesai' },
]

export default function OrderOnlinePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const url = filterStatus ? `/api/orders/online?status=${filterStatus}` : '/api/orders/online'
    const res = await fetch(url)
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [filterStatus])

  const updateStatus = async (orderId: string, status: string, konfirmasiBayar = false) => {
    setUpdatingId(orderId)
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, konfirmasiBayar }),
    })
    setUpdatingId(null)
    if (res.ok) {
      fetchOrders()
      setSelectedOrder(null)
    } else {
      const data = await res.json()
      alert(data.message || 'Gagal memperbarui status')
    }
  }

  return (
    <div>
      <Topbar title="Order Online" role="admin" />
      <div className="p-6 space-y-6">
        {/* Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 flex-wrap">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <span className="text-sm text-gray-500 ml-auto">{orders.length} order ditemukan</span>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Tidak ada order ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">No. Order</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Antrian</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600">{order.nomorOrder}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{order.namaCustomer}</p>
                        <p className="text-xs text-gray-400">{order.customer?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatRupiah(Number(order.totalHarga))}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-700">{order.antrian?.nomorAntrian || '-'}</td>
                      <td className="px-6 py-4 text-xs text-gray-400">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.status === 'MENUNGGU_PEMBAYARAN' && order.buktiBayar && (
                            <button onClick={() => updateStatus(order.id, 'PEMBAYARAN_DIKONFIRMASI', true)}
                              disabled={updatingId === order.id}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50">
                              {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          )}
                          {order.status === 'PEMBAYARAN_DIKONFIRMASI' && (
                            <button onClick={() => updateStatus(order.id, 'SEDANG_DIPROSES')}
                              disabled={updatingId === order.id}
                              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium disabled:opacity-50">
                              Proses
                            </button>
                          )}
                          {order.status === 'SEDANG_DIPROSES' && (
                            <button onClick={() => updateStatus(order.id, 'SIAP_DIAMBIL')}
                              disabled={updatingId === order.id}
                              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium disabled:opacity-50">
                              Siap
                            </button>
                          )}
                          {order.status === 'SIAP_DIAMBIL' && (
                            <button onClick={() => updateStatus(order.id, 'SELESAI')}
                              disabled={updatingId === order.id}
                              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50">
                              Selesai
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Detail Order</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">No. Order</p><p className="font-mono font-bold text-blue-600">{selectedOrder.nomorOrder}</p></div>
                <div><p className="text-gray-500">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div><p className="text-gray-500">Customer</p><p className="font-semibold">{selectedOrder.namaCustomer}</p></div>
                <div><p className="text-gray-500">No. Antrian</p><p className="font-mono font-bold">{selectedOrder.antrian?.nomorAntrian || '-'}</p></div>
              </div>

              {selectedOrder.orderDetailLayanan.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Layanan Print/Fotocopy:</p>
                  {selectedOrder.orderDetailLayanan.map((d, i) => (
                    <div key={i} className="p-3 bg-blue-50 rounded-xl mb-2">
                      <p className="font-medium text-sm text-gray-900">{d.layanan.nama}</p>
                      <p className="text-xs text-gray-500">{d.jumlahLembar} lembar × {d.jumlahCopy} copy</p>
                      {d.namaFile && <p className="text-xs text-blue-600 mt-1">📎 {d.namaFile}</p>}
                      {d.fileUrl && <a href={d.fileUrl} target="_blank" className="text-xs text-blue-600 underline">Lihat file</a>}
                      <p className="font-semibold text-sm text-blue-700 mt-1">{formatRupiah(Number(d.subtotal))}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedOrder.orderDetailATK.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Produk ATK:</p>
                  {selectedOrder.orderDetailATK.map((d, i) => (
                    <div key={i} className="p-3 bg-green-50 rounded-xl mb-2">
                      <p className="font-medium text-sm text-gray-900">{d.produk.nama}</p>
                      <p className="text-xs text-gray-500">{d.jumlah} pcs</p>
                      <p className="font-semibold text-sm text-green-700 mt-1">{formatRupiah(Number(d.subtotal))}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedOrder.buktiBayar && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Bukti Pembayaran:</p>
                  <img src={selectedOrder.buktiBayar} alt="Bukti bayar" className="rounded-xl max-h-48 object-cover" />
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-4">
                <span>Total</span>
                <span className="text-blue-600">{formatRupiah(Number(selectedOrder.totalHarga))}</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {selectedOrder.status === 'MENUNGGU_PEMBAYARAN' && selectedOrder.buktiBayar && (
                  <button onClick={() => updateStatus(selectedOrder.id, 'PEMBAYARAN_DIKONFIRMASI', true)}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
                    ✅ Konfirmasi Pembayaran
                  </button>
                )}
                {selectedOrder.status === 'PEMBAYARAN_DIKONFIRMASI' && (
                  <button onClick={() => updateStatus(selectedOrder.id, 'SEDANG_DIPROSES')}
                    className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700">
                    🖨️ Mulai Proses
                  </button>
                )}
                {selectedOrder.status === 'SEDANG_DIPROSES' && (
                  <button onClick={() => updateStatus(selectedOrder.id, 'SIAP_DIAMBIL')}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
                    📦 Tandai Siap Diambil
                  </button>
                )}
                {selectedOrder.status === 'SIAP_DIAMBIL' && (
                  <button onClick={() => updateStatus(selectedOrder.id, 'SELESAI')}
                    className="flex-1 py-2.5 bg-gray-600 text-white rounded-xl text-sm font-semibold hover:bg-gray-700">
                    ✔️ Selesai
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
