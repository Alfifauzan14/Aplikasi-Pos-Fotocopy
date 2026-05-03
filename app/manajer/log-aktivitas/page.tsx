'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { formatDate } from '@/lib/utils'
import { Loader2, Activity, Search } from 'lucide-react'

interface Log {
  id: string
  aksi: string
  entitas: string
  entitasId: string | null
  dataBefore: any
  dataAfter: any
  keterangan: string | null
  createdAt: string
  user: { name: string; role: string }
}

const aksiColors: Record<string, string> = {
  BUAT_TRANSAKSI: 'bg-blue-100 text-blue-700',
  EDIT_TRANSAKSI: 'bg-yellow-100 text-yellow-700',
  HAPUS_TRANSAKSI: 'bg-red-100 text-red-700',
  KONFIRMASI_PEMBAYARAN: 'bg-green-100 text-green-700',
  UPDATE_STATUS_ORDER: 'bg-purple-100 text-purple-700',
  INPUT_RESTOK: 'bg-orange-100 text-orange-700',
}

export default function LogAktivitasPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterAksi, setFilterAksi] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const fetchLogs = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString(), limit: '20' })
    if (filterAksi) params.set('aksi', filterAksi)
    const res = await fetch(`/api/log-aktivitas?${params}`)
    const data = await res.json()
    setLogs(data.logs || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [filterAksi, page])

  return (
    <div>
      <Topbar title="Log Aktivitas Admin" role="manajer" />
      <div className="p-6 space-y-6">
        {/* Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 flex-wrap">
          <select value={filterAksi} onChange={e => { setFilterAksi(e.target.value); setPage(1) }}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="">Semua Aktivitas</option>
            <option value="BUAT_TRANSAKSI">Buat Transaksi</option>
            <option value="EDIT_TRANSAKSI">Edit Transaksi</option>
            <option value="HAPUS_TRANSAKSI">Hapus Transaksi</option>
            <option value="KONFIRMASI_PEMBAYARAN">Konfirmasi Pembayaran</option>
            <option value="UPDATE_STATUS_ORDER">Update Status Order</option>
            <option value="INPUT_RESTOK">Input Restok</option>
          </select>
          <span className="text-sm text-gray-500 ml-auto">{total} log ditemukan</span>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Tidak ada log aktivitas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {logs.map(log => (
                <div key={log.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${aksiColors[log.aksi] || 'bg-gray-100 text-gray-700'}`}>
                          {log.aksi.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{log.entitas}</span>
                        <span className="text-sm font-semibold text-gray-800">{log.user.name}</span>
                        <span className="text-xs text-gray-400">({log.user.role})</span>
                      </div>
                      {log.keterangan && (
                        <p className="text-sm text-gray-600 mb-2">{log.keterangan}</p>
                      )}
                      <p className="text-xs text-gray-400">{formatDate(log.createdAt)}</p>
                    </div>

                    {(log.dataBefore || log.dataAfter) && (
                      <button onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                        className="text-xs text-violet-600 hover:underline font-medium flex-shrink-0">
                        {expanded === log.id ? 'Sembunyikan' : 'Lihat Detail'}
                      </button>
                    )}
                  </div>

                  {expanded === log.id && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {log.dataBefore && (
                        <div className="bg-red-50 rounded-xl p-3">
                          <p className="text-xs font-semibold text-red-700 mb-1">Sebelum:</p>
                          <pre className="text-xs text-red-600 overflow-auto">{JSON.stringify(log.dataBefore, null, 2)}</pre>
                        </div>
                      )}
                      {log.dataAfter && (
                        <div className="bg-green-50 rounded-xl p-3">
                          <p className="text-xs font-semibold text-green-700 mb-1">Sesudah:</p>
                          <pre className="text-xs text-green-600 overflow-auto">{JSON.stringify(log.dataAfter, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              ← Sebelumnya
            </button>
            <span className="text-sm text-gray-500">Halaman {page} dari {Math.ceil(total / 20)}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / 20)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              Berikutnya →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
