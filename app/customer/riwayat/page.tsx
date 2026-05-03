'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { formatRupiah, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Loader2, ClipboardList, Download } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Order {
  id: string
  nomorOrder: string
  status: string
  totalHarga: number
  tipeOrder: string
  metodeBayar: string
  createdAt: string
  antrian: { nomorAntrian: string } | null
  struk: { nomorStruk: string } | null
  orderDetailLayanan: Array<{ layanan: { nama: string }; jumlahLembar: number; subtotal: number }>
  orderDetailATK: Array<{ produk: { nama: string }; jumlah: number; subtotal: number }>
}

export default function RiwayatPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/orders/online?customerId=${session.user.id}`)
        .then(r => r.json())
        .then(data => { setOrders(data); setLoading(false) })
    }
  }, [session])

  const handleDownloadStruk = async (order: Order) => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ format: 'a5' })

    doc.setFontSize(14)
    doc.text('STRUK PEMBAYARAN', 75, 20, { align: 'center' })
    doc.text('Fotocopy & ATK SMAKZIE', 75, 30, { align: 'center' })

    doc.setFontSize(10)
    doc.text(`No. Order: ${order.nomorOrder}`, 15, 45)
    doc.text(`No. Antrian: ${order.antrian?.nomorAntrian || '-'}`, 15, 52)
    doc.text(`No. Struk: ${order.struk?.nomorStruk || '-'}`, 15, 59)
    doc.text(`Customer: ${session?.user?.name}`, 15, 66)
    doc.text(`Tanggal: ${formatDate(order.createdAt)}`, 15, 73)
    doc.text(`Metode Bayar: ${order.metodeBayar}`, 15, 80)

    doc.line(15, 85, 135, 85)

    let y = 92
    doc.text('Layanan:', 15, y); y += 7
    for (const d of order.orderDetailLayanan) {
      doc.text(`  ${d.layanan.nama} (${d.jumlahLembar} lbr): Rp ${Number(d.subtotal).toLocaleString('id-ID')}`, 15, y)
      y += 7
    }
    for (const d of order.orderDetailATK) {
      doc.text(`  ${d.produk.nama} (${d.jumlah} pcs): Rp ${Number(d.subtotal).toLocaleString('id-ID')}`, 15, y)
      y += 7
    }

    doc.line(15, y, 135, y); y += 8
    doc.setFontSize(12)
    doc.text(`TOTAL: Rp ${Number(order.totalHarga).toLocaleString('id-ID')}`, 15, y)
    y += 10
    doc.setFontSize(9)
    doc.text('Terima kasih telah berbelanja di Fotocopy & ATK SMAKZIE', 75, y + 10, { align: 'center' })

    doc.save(`Struk_${order.nomorOrder}.pdf`)
  }

  return (
    <div>
      <Topbar title="Riwayat Order" role="customer" />
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Belum ada order</p>
            <p className="text-gray-300 text-sm mt-1">Buat order pertama Anda!</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-mono font-bold text-blue-600 text-sm">{order.nomorOrder}</span>
                    {order.antrian && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        Antrian: {order.antrian.nomorAntrian}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-gray-900">{formatRupiah(Number(order.totalHarga))}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.metodeBayar}</p>
                </div>
              </div>

              {/* Items preview */}
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                {order.orderDetailLayanan.map((d, i) => (
                  <p key={i} className="text-sm text-gray-600">• {d.layanan.nama} ({d.jumlahLembar} lembar)</p>
                ))}
                {order.orderDetailATK.map((d, i) => (
                  <p key={i} className="text-sm text-gray-600">• {d.produk.nama} ({d.jumlah} pcs)</p>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <button onClick={() => setSelectedOrder(order)}
                  className="text-sm text-blue-600 hover:underline font-medium">
                  Lihat Detail
                </button>
                {(order.status === 'PEMBAYARAN_DIKONFIRMASI' || order.status === 'SEDANG_DIPROSES' || order.status === 'SIAP_DIAMBIL' || order.status === 'SELESAI') && (
                  <button onClick={() => handleDownloadStruk(order)}
                    className="flex items-center gap-1.5 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-xl hover:bg-green-100 font-medium">
                    <Download className="w-3.5 h-3.5" /> Download Struk
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold">Detail Order</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500">No. Order</p><p className="font-mono font-bold text-blue-600">{selectedOrder.nomorOrder}</p></div>
                <div><p className="text-gray-500">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div><p className="text-gray-500">No. Antrian</p><p className="font-mono font-bold">{selectedOrder.antrian?.nomorAntrian || '-'}</p></div>
                <div><p className="text-gray-500">Metode Bayar</p><p className="font-semibold">{selectedOrder.metodeBayar}</p></div>
              </div>

              <div className="border-t pt-4">
                <p className="font-semibold mb-3">Item:</p>
                {selectedOrder.orderDetailLayanan.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span>{d.layanan.nama} ({d.jumlahLembar} lbr)</span>
                    <span className="font-semibold">{formatRupiah(Number(d.subtotal))}</span>
                  </div>
                ))}
                {selectedOrder.orderDetailATK.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span>{d.produk.nama} ({d.jumlah} pcs)</span>
                    <span className="font-semibold">{formatRupiah(Number(d.subtotal))}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">{formatRupiah(Number(selectedOrder.totalHarga))}</span>
              </div>

              {(selectedOrder.status !== 'MENUNGGU_PEMBAYARAN' && selectedOrder.status !== 'DIBATALKAN') && (
                <button onClick={() => handleDownloadStruk(selectedOrder)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
                  <Download className="w-4 h-4" /> Download Struk PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
