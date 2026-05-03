'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { formatRupiah, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Download, RefreshCw, Loader2, FileText, TrendingUp } from 'lucide-react'

export default function LaporanPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('bulanan')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (startDate && endDate) { params.set('start', startDate); params.set('end', endDate) }
    else params.set('periode', periode)
    const res = await fetch(`/api/laporan?${params}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [periode])

  const handleExportExcel = async () => {
    const { utils, writeFile } = await import('xlsx')
    if (!data?.orders) return
    const ws = utils.json_to_sheet(data.orders.map((o: any) => ({
      'No. Order': o.nomorOrder,
      'Customer': o.namaCustomer,
      'Tipe': o.tipeOrder,
      'Total': Number(o.totalHarga),
      'Metode Bayar': o.metodeBayar,
      'Tanggal': formatDate(o.createdAt),
    })))
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Laporan')
    writeFile(wb, `Laporan_${periode}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    if (!data) return
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Laporan Keuangan - Fotocopy & ATK SMAKZIE', 20, 20)
    doc.setFontSize(12)
    doc.text(`Periode: ${periode}`, 20, 35)
    doc.text(`Total Pendapatan: ${formatRupiah(data.summary?.totalRevenue)}`, 20, 45)
    doc.text(`Total Order: ${data.summary?.totalOrders}`, 20, 55)
    doc.text(`Order Online: ${data.summary?.onlineOrders}`, 20, 65)
    doc.text(`Order Langsung: ${data.summary?.langsungOrders}`, 20, 75)

    let y = 90
    doc.setFontSize(10)
    doc.text('No. Order | Customer | Total | Tipe | Tanggal', 20, y)
    y += 8
    for (const order of (data.orders || []).slice(0, 30)) {
      doc.text(`${order.nomorOrder} | ${order.namaCustomer} | Rp ${Number(order.totalHarga).toLocaleString('id-ID')} | ${order.tipeOrder} | ${formatDate(order.createdAt)}`, 20, y)
      y += 7
      if (y > 270) break
    }

    doc.save(`Laporan_${periode}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div>
      <Topbar title="Laporan Keuangan" role="manajer" />
      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 flex-wrap">
          {['harian', 'mingguan', 'bulanan'].map(p => (
            <button key={p} onClick={() => { setPeriode(p); setStartDate(''); setEndDate('') }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${periode === p && !startDate ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {p}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
            <span className="text-gray-400">—</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
            <button onClick={fetchData} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700">
              Cari
            </button>
          </div>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : data && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Pendapatan', value: formatRupiah(data.summary?.totalRevenue), color: 'text-violet-600' },
                { label: 'Total Order', value: data.summary?.totalOrders, color: 'text-blue-600' },
                { label: 'Order Online', value: data.summary?.onlineOrders, color: 'text-green-600' },
                { label: 'Order Langsung', value: data.summary?.langsungOrders, color: 'text-orange-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Daftar Transaksi ({data.orders?.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['No. Order', 'Customer', 'Tipe', 'Total', 'Metode', 'Tanggal'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders?.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data</td></tr>
                    ) : data.orders?.map((o: any) => (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-mono font-semibold text-blue-600">{o.nomorOrder}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{o.namaCustomer}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${o.tipeOrder === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {o.tipeOrder}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm font-bold text-gray-900">{formatRupiah(Number(o.totalHarga))}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{o.metodeBayar}</td>
                        <td className="px-6 py-3 text-xs text-gray-400">{formatDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
