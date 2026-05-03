'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { formatRupiah } from '@/lib/utils'
import { Plus, Pencil, Trash2, Loader2, Package } from 'lucide-react'

interface ProdukATK {
  id: string
  nama: string
  deskripsi: string | null
  harga: number
  stok: number
  stokMinimum: number
  satuan: string
  gambar: string | null
  isActive: boolean
}

const emptyForm = { nama: '', deskripsi: '', harga: 0, stok: 0, stokMinimum: 10, satuan: 'pcs', gambar: '' }

export default function ProdukATKPage() {
  const [produks, setProduks] = useState<ProdukATK[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchProduks = async () => {
    setLoading(true)
    const res = await fetch('/api/produk-atk')
    const data = await res.json()
    setProduks(data)
    setLoading(false)
  }

  useEffect(() => { fetchProduks() }, [])

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (p: ProdukATK) => {
    setEditId(p.id)
    setForm({ nama: p.nama, deskripsi: p.deskripsi || '', harga: Number(p.harga), stok: p.stok, stokMinimum: p.stokMinimum, satuan: p.satuan, gambar: p.gambar || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const method = editId ? 'PUT' : 'POST'
    const body = editId ? { id: editId, ...form } : form
    const res = await fetch('/api/produk-atk', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (res.ok) { setShowModal(false); fetchProduks() }
    else alert('Gagal menyimpan produk')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menonaktifkan produk ini?')) return
    await fetch(`/api/produk-atk?id=${id}`, { method: 'DELETE' })
    fetchProduks()
  }

  return (
    <div>
      <Topbar title="Produk ATK" role="admin" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">{produks.length} produk aktif</p>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Tambah Produk
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Produk</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Harga</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stok</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stok Min</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Satuan</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {produks.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{p.nama}</p>
                          {p.deskripsi && <p className="text-xs text-gray-400 truncate max-w-xs">{p.deskripsi}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-700">{formatRupiah(Number(p.harga))}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${p.stok <= p.stokMinimum ? 'text-red-600' : 'text-gray-900'}`}>
                        {p.stok}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.stokMinimum}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.satuan}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editId ? 'Edit Produk' : 'Tambah Produk ATK'}</h3>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Nama Produk', field: 'nama', type: 'text', placeholder: 'Nama produk' },
                { label: 'Deskripsi', field: 'deskripsi', type: 'text', placeholder: 'Deskripsi singkat' },
                { label: 'Harga (Rp)', field: 'harga', type: 'number', placeholder: '0' },
                { label: 'Stok', field: 'stok', type: 'number', placeholder: '0' },
                { label: 'Stok Minimum', field: 'stokMinimum', type: 'number', placeholder: '10' },
                { label: 'Satuan', field: 'satuan', type: 'text', placeholder: 'pcs / kotak / lusin' },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.field]}
                    onChange={e => setForm(prev => ({ ...prev, [f.field]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
