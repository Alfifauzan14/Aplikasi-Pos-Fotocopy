'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { Users, MonitorPlay, Loader2, ArrowRight } from 'lucide-react'

interface Antrian {
  id: string
  nomorAntrian: string
  status: string
  order: { namaCustomer: string; tipeOrder: string }
}

export default function AntrianPage() {
  const [antrians, setAntrians] = useState<Antrian[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAntrian = () => {
    fetch('/api/antrian')
      .then(r => r.json())
      .then(data => {
        setAntrians(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAntrian()
    // Poll every 5 seconds for live updates
    const interval = setInterval(fetchAntrian, 5000)
    return () => clearInterval(interval)
  }, [])

  const diproses = antrians.filter(a => a.status === 'DIPROSES')
  const menunggu = antrians.filter(a => a.status === 'MENUNGGU')

  return (
    <div>
      <Topbar title="Monitor Antrian Aktif" role="admin" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6 bg-blue-50 text-blue-800 px-5 py-4 rounded-2xl border border-blue-100">
          <MonitorPlay className="w-6 h-6 text-blue-600" />
          <p className="font-medium text-sm">Halaman ini diperbarui otomatis setiap 5 detik. Anda dapat menggunakannya sebagai layar tampilan untuk pelanggan (Live Display).</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : antrians.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Users className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400">Antrian Kosong</h2>
            <p className="text-gray-400 mt-2">Belum ada pelanggan dalam antrian saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sedang Diproses */}
            <div className="space-y-4">
              <div className="bg-purple-600 rounded-2xl p-4 text-white text-center shadow-lg">
                <h2 className="text-xl font-bold tracking-widest uppercase mb-1">SEDANG DIPROSES</h2>
                <p className="text-purple-200 text-sm">{diproses.length} antrian</p>
              </div>
              <div className="space-y-3">
                {diproses.map(a => (
                  <div key={a.id} className="bg-white p-5 rounded-2xl border-l-8 border-purple-500 shadow-sm flex justify-between items-center animate-in slide-in-from-left">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{a.order.tipeOrder}</p>
                      <p className="text-lg font-bold text-gray-900">{a.order.namaCustomer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-0.5">Nomor Antrian</p>
                      <p className="text-4xl font-black text-purple-600 tracking-tighter">{a.nomorAntrian}</p>
                    </div>
                  </div>
                ))}
                {diproses.length === 0 && (
                  <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-400 font-medium">Tidak ada antrian yang sedang diproses</p>
                  </div>
                )}
              </div>
            </div>

            {/* Menunggu Giliran */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-2xl p-4 text-gray-700 text-center border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold tracking-widest uppercase mb-1">MENUNGGU GILIRAN</h2>
                <p className="text-gray-500 text-sm">{menunggu.length} antrian</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {menunggu.map((a, i) => (
                  <div key={a.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-50" />
                    <p className="text-2xl font-black text-gray-900 mb-1">{a.nomorAntrian}</p>
                    <p className="text-sm font-medium text-gray-600 truncate w-full px-2">{a.order.namaCustomer}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">{a.order.tipeOrder}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
