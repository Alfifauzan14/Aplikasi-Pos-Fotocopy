'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { formatRupiah } from '@/lib/utils'
import { Loader2, Save, Settings, QrCode, DollarSign, Printer } from 'lucide-react'

interface Layanan {
  id: string
  nama: string
  jenis: string
  ukuran: string
  hargaPerLembar: number
}

export default function ManajerPengaturanPage() {
  const [layanans, setLayanans] = useState<Layanan[]>([])
  const [pengaturan, setPengaturan] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [editedHarga, setEditedHarga] = useState<Record<string, number>>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/layanan').then(r => r.json()),
      fetch('/api/pengaturan').then(r => r.json()),
    ]).then(([layananData, settingData]) => {
      setLayanans(layananData)
      setPengaturan(settingData)
      setLoading(false)
    })
  }, [])

  const handleSavePengaturan = async () => {
    setSaving(true)
    await fetch('/api/pengaturan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pengaturan),
    })
    setSaving(false)
    setSavedMsg('Pengaturan disimpan!')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  const handleUpdateHarga = async (id: string) => {
    if (!editedHarga[id]) return
    setSaving(true)
    await fetch('/api/layanan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, hargaPerLembar: editedHarga[id] }),
    })
    setSaving(false)
    const res = await fetch('/api/layanan')
    setLayanans(await res.json())
    setSavedMsg('Harga diperbarui!')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  if (loading) return (
    <div>
      <Topbar title="Pengaturan" role="manajer" />
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    </div>
  )

  return (
    <div>
      <Topbar title="Pengaturan Sistem" role="manajer" />
      <div className="p-6 space-y-6">
        {savedMsg && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium text-sm">
            ✅ {savedMsg}
          </div>
        )}

        {/* Info Toko */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Settings className="w-5 h-5 text-violet-600" />
            <h3 className="font-bold text-gray-900">Informasi Toko</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'nama_toko', label: 'Nama Toko' },
              { key: 'alamat_toko', label: 'Alamat' },
              { key: 'telepon_toko', label: 'No. Telepon' },
              { key: 'jam_buka', label: 'Jam Buka' },
              { key: 'jam_tutup', label: 'Jam Tutup' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
                <input
                  type="text"
                  value={pengaturan[field.key] || ''}
                  onChange={e => setPengaturan(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* QRIS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <QrCode className="w-5 h-5 text-violet-600" />
            <h3 className="font-bold text-gray-900">Gambar QRIS</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL Gambar QRIS</label>
              <input
                type="url"
                value={pengaturan['qris_image_url'] || ''}
                onChange={e => setPengaturan(prev => ({ ...prev, qris_image_url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
            {pengaturan['qris_image_url'] && (
              <img src={pengaturan['qris_image_url']} alt="QRIS Preview" className="max-w-xs rounded-xl border border-gray-200" />
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSavePengaturan} disabled={saving}
            className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Pengaturan
          </button>
        </div>

        {/* Harga Layanan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <DollarSign className="w-5 h-5 text-violet-600" />
            <h3 className="font-bold text-gray-900">Harga Layanan Print/Fotocopy</h3>
          </div>
          <div className="space-y-3">
            {layanans.map(l => (
              <div key={l.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{l.nama}</p>
                  <p className="text-xs text-gray-400">Harga saat ini: {formatRupiah(Number(l.hargaPerLembar))}/lembar</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editedHarga[l.id] ?? Number(l.hargaPerLembar)}
                    onChange={e => setEditedHarga(prev => ({ ...prev, [l.id]: Number(e.target.value) }))}
                    className="w-32 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                  <button onClick={() => handleUpdateHarga(l.id)} disabled={saving}
                    className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50">
                    Simpan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
