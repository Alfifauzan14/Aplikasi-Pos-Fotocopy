'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { formatDate, formatRupiah } from '@/lib/utils'
import { Loader2, Plus, RefreshCw, Package, AlertTriangle } from 'lucide-react'

interface StokBahan {
  id: string
  nama: string
  jenis: string
  satuan: string
  stokSaat: number
  stokMinimum: number
  riwayatStok: Array<{
    jenis: string
    jumlah: number
    stokSebelum: number
    stokSesudah: number
    createdAt: string
    keterangan: string | null
  }>
}

export default function StokPage() {
  const [stokList, setStokList] = useState<StokBahan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStok, setSelectedStok] = useState<StokBahan | null>(null)
  const [jumlahRestok, setJumlahRestok] = useState(1)
  const [keterangan, setKeterangan] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchStok = async () => {
    setLoading(true)
    const res = await fetch('/api/stok')
    const data = await res.json()
    setStokList(data)
    setLoading(false)
  }

  useEffect(() => { fetchStok() }, [])

  const handleRestok = async () => {
    if (!selectedStok || jumlahRestok <= 0) return
    setSaving(true)
    const res = await fetch('/api/stok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stokBahanId: selectedStok.id, jumlah: jumlahRestok, keterangan }),
    })
    setSaving(false)
    if (res.ok) {
      setSelectedStok(null)
      setJumlahRestok(1)
      setKeterangan('')
      fetchStok()
    } else {
      alert('Gagal melakukan restok')
    }
  }

  const getStokPercentage = (stok: StokBahan) => {
    return Math.min(100, (stok.stokSaat / (stok.stokMinimum * 3)) * 100)
  }

  const isLow = (stok: StokBahan) => stok.stokSaat <= stok.stokMinimum * 1.2

  return (
    <div>
      <Topbar title="Kelola Stok Bahan" role="admin" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">{stokList.filter(isLow).length} item stok menipis</p>
          <button onClick={fetchStok} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stokList.map(stok => {
              const pct = getStokPercentage(stok)
              const low = isLow(stok)
              return (
                <div key={stok.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${low ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {low && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      <Package className={`w-4 h-4 ${low ? 'text-amber-600' : 'text-blue-500'}`} />
                    </div>
                    <button
                      onClick={() => { setSelectedStok(stok); setJumlahRestok(1); setKeterangan('') }}
                      className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-3 h-3" /> Restok
                    </button>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1">{stok.nama}</h3>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className={`font-bold text-lg ${low ? 'text-amber-600' : 'text-gray-900'}`}>
                      {stok.stokSaat} {stok.satuan}
                    </span>
                    <span className="text-gray-400 text-xs">min: {stok.stokMinimum} {stok.satuan}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${pct < 30 ? 'bg-red-500' : pct < 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Recent history */}
                  {stok.riwayatStok.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-gray-400 font-medium">Riwayat Terbaru:</p>
                      {stok.riwayatStok.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-500">
                          <span className={r.jenis === 'MASUK' ? 'text-green-600' : 'text-red-600'}>
                            {r.jenis === 'MASUK' ? '+' : '-'}{r.jumlah}
                          </span>
                          <span>{formatDate(r.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Restok Modal */}
      {selectedStok && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Restok - {selectedStok.nama}</h3>
              <p className="text-sm text-gray-500 mt-1">Stok saat ini: {selectedStok.stokSaat} {selectedStok.satuan}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Restok</label>
                <input
                  type="number"
                  min={1}
                  value={jumlahRestok}
                  onChange={e => setJumlahRestok(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Stok setelah restok: <strong>{selectedStok.stokSaat + jumlahRestok} {selectedStok.satuan}</strong>
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Keterangan (opsional)</label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  placeholder="Misal: Beli di toko ABC"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedStok(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={handleRestok} disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Simpan Restok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
