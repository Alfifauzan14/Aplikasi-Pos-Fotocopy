'use client'

import { useState, useEffect, useRef } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { formatRupiah } from '@/lib/utils'
import { Upload, X, Loader2, FileText, Plus, Minus, ShoppingCart, CheckCircle, QrCode } from 'lucide-react'

interface Layanan {
  id: string
  nama: string
  jenis: string
  ukuran: string
  hargaPerLembar: number
}

interface FileItem {
  file: File
  url?: string
  publicId?: string
  uploading: boolean
  error?: string
}

interface CartItem {
  layananId: string
  layananNama: string
  jumlahLembar: number
  jumlahCopy: number
  hargaPerLembar: number
  subtotal: number
  fileUrl?: string
  filePublicId?: string
  namaFile?: string
  catatan?: string
  type: 'layanan'
}

export default function PesanLayananPage() {
  const [layanans, setLayanans] = useState<Layanan[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState(1)
  const [selectedLayanan, setSelectedLayanan] = useState<Layanan | null>(null)
  const [lembar, setLembar] = useState(1)
  const [copy, setCopy] = useState(1)
  const [fileItem, setFileItem] = useState<FileItem | null>(null)
  const [catatan, setCatatan] = useState('')
  const [qrisImage, setQrisImage] = useState('')
  const [buktiBayar, setBuktiBayar] = useState<FileItem | null>(null)
  const [catatanOrder, setCatatanOrder] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const buktiInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/layanan').then(r => r.json()).then(setLayanans)
    fetch('/api/pengaturan?key=qris_image_url').then(r => r.json()).then(d => setQrisImage(d?.value || ''))
  }, [])

  const handleFileUpload = async (file: File) => {
    setFileItem({ file, uploading: true })
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (res.ok) {
      setFileItem({ file, url: data.url, publicId: data.publicId, uploading: false })
    } else {
      setFileItem({ file, uploading: false, error: data.message })
    }
  }

  const addToCart = () => {
    if (!selectedLayanan) return
    const subtotal = Number(selectedLayanan.hargaPerLembar) * lembar * copy
    setCart(prev => [...prev, {
      type: 'layanan',
      layananId: selectedLayanan.id,
      layananNama: selectedLayanan.nama,
      jumlahLembar: lembar,
      jumlahCopy: copy,
      hargaPerLembar: Number(selectedLayanan.hargaPerLembar),
      subtotal,
      fileUrl: fileItem?.url,
      filePublicId: fileItem?.publicId,
      namaFile: fileItem?.file.name,
      catatan,
    }])
    setSelectedLayanan(null)
    setLembar(1)
    setCopy(1)
    setFileItem(null)
    setCatatan('')
  }

  const removeFromCart = (i: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== i))
  }

  const total = cart.reduce((sum, c) => sum + c.subtotal, 0)

  const handleUploadBukti = async (file: File) => {
    setBuktiBayar({ file, uploading: true })
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (res.ok) setBuktiBayar({ file, url: data.url, publicId: data.publicId, uploading: false })
    else setBuktiBayar({ file, uploading: false, error: data.message })
  }

  const handleSubmit = async () => {
    if (!buktiBayar?.url) {
      alert('Upload bukti pembayaran terlebih dahulu!')
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/orders/online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: cart.map(c => ({ ...c, hargaPerLembar: c.hargaPerLembar })),
        catatanOrder,
        buktiBayar: buktiBayar.url,
      }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (res.ok) {
      setOrderResult(data)
      setCart([])
      setStep(4)
    } else {
      alert(data.message || 'Gagal membuat order')
    }
  }

  if (step === 4 && orderResult) {
    return (
      <div>
        <Topbar title="Pesan Layanan" role="customer" />
        <div className="p-6">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Berhasil! 🎉</h2>
            <p className="text-gray-500 mb-6">Pesanan Anda sedang diproses oleh admin</p>
            <div className="bg-blue-50 rounded-2xl p-5 text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">No. Order</span>
                <span className="font-mono font-bold text-blue-600">{orderResult.nomorOrder}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-medium">Menunggu Konfirmasi Admin</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold">{formatRupiah(total)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep(1); setOrderResult(null) }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                Pesan Lagi
              </button>
              <a href="/customer/riwayat" className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 text-center">
                Lihat Riwayat
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const jenisGroups = ['PRINT_HITAM_PUTIH', 'PRINT_BERWARNA', 'FOTOCOPY']
  const jenisLabels: Record<string, string> = {
    PRINT_HITAM_PUTIH: 'Print Hitam Putih',
    PRINT_BERWARNA: 'Print Berwarna',
    FOTOCOPY: 'Fotocopy',
  }

  return (
    <div>
      <Topbar title="Pesan Layanan Print" role="customer" />
      <div className="p-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['Pilih Layanan', 'Keranjang', 'Pembayaran'].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
              {i < 2 && <div className={`h-px w-8 ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Service Selection */}
            {jenisGroups.map(jenis => {
              const group = layanans.filter(l => l.jenis === jenis)
              if (!group.length) return null
              return (
                <div key={jenis} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <h3 className="font-bold text-blue-900">{jenisLabels[jenis]}</h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {group.map(l => (
                      <button key={l.id} onClick={() => setSelectedLayanan(selectedLayanan?.id === l.id ? null : l)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedLayanan?.id === l.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}>
                        <p className="font-semibold text-sm">Ukuran {l.ukuran}</p>
                        <p className="text-blue-600 font-bold mt-1">{formatRupiah(Number(l.hargaPerLembar))}/lembar</p>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Configuration Panel */}
            {selectedLayanan && (
              <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Konfigurasi: {selectedLayanan.nama}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Lembar</label>
                    <input type="number" min={1} value={lembar} onChange={e => setLembar(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Copy</label>
                    <input type="number" min={1} value={copy} onChange={e => setCopy(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload File (PDF, Word, Excel, PPT, JPG, PNG - maks 25MB)</label>
                  {!fileItem ? (
                    <div onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Klik untuk upload file</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                      {fileItem.uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      ) : fileItem.error ? (
                        <X className="w-5 h-5 text-red-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                        {fileItem.error && <p className="text-xs text-red-500">{fileItem.error}</p>}
                        {fileItem.url && <p className="text-xs text-green-600">Berhasil diupload</p>}
                      </div>
                      <button onClick={() => setFileItem(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                    onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]) }} />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan (opsional)</label>
                  <input type="text" value={catatan} onChange={e => setCatatan(e.target.value)}
                    placeholder="Misal: Print bolak-balik, margin 2cm, dsb"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Subtotal estimasi:</p>
                    <p className="text-xl font-bold text-blue-600">{formatRupiah(Number(selectedLayanan.hargaPerLembar) * lembar * copy)}</p>
                  </div>
                  <button onClick={addToCart} disabled={!fileItem?.url && selectedLayanan.jenis !== 'FOTOCOPY'}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Plus className="w-4 h-4" /> Tambah ke Keranjang
                  </button>
                </div>
                {!fileItem?.url && <p className="text-xs text-amber-600 mt-2">⚠️ Upload file diperlukan sebelum menambahkan ke keranjang</p>}
              </div>
            )}

            {cart.length > 0 && (
              <div className="flex justify-end">
                <button onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90">
                  <ShoppingCart className="w-4 h-4" /> Lanjut ke Keranjang ({cart.length})
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Keranjang ({cart.length} item)</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {cart.map((item, i) => (
                  <div key={i} className="p-5 flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.layananNama}</p>
                      <p className="text-sm text-gray-500">{item.jumlahLembar} lembar × {item.jumlahCopy} copy</p>
                      {item.namaFile && <p className="text-xs text-blue-600 mt-1">📎 {item.namaFile}</p>}
                      {item.catatan && <p className="text-xs text-gray-400 mt-0.5">📝 {item.catatan}</p>}
                      <p className="font-bold text-blue-600 mt-1">{formatRupiah(item.subtotal)}</p>
                    </div>
                    <button onClick={() => removeFromCart(i)} className="text-red-400 hover:text-red-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-gray-100">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Order (opsional)</label>
                  <textarea value={catatanOrder} onChange={e => setCatatanOrder(e.target.value)}
                    placeholder="Catatan tambahan untuk admin..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                </div>
                <div className="flex justify-between font-bold text-xl mb-4">
                  <span>Total</span>
                  <span className="text-blue-600">{formatRupiah(total)}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                    ← Tambah Layanan
                  </button>
                  <button onClick={() => setStep(3)} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:opacity-90">
                    Bayar Sekarang →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <QrCode className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-gray-900">Scan QRIS untuk Membayar</h3>
              </div>

              {qrisImage ? (
                <div className="flex justify-center mb-4">
                  <img src={qrisImage} alt="QRIS" className="max-w-xs rounded-xl shadow-md" />
                </div>
              ) : (
                <div className="flex items-center justify-center p-12 bg-gray-50 rounded-xl mb-4">
                  <p className="text-gray-400 text-sm">Gambar QRIS belum diatur oleh admin</p>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 mb-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Total yang harus dibayar:</p>
                <p className="text-2xl font-extrabold text-blue-600">{formatRupiah(total)}</p>
              </div>

              <p className="text-sm text-gray-600 mb-3 font-medium">Upload bukti pembayaran:</p>
              {!buktiBayar ? (
                <div onClick={() => buktiInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors mb-4">
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Klik untuk upload screenshot bukti bayar</p>
                </div>
              ) : (
                <div className="mb-4">
                  {buktiBayar.url && <img src={buktiBayar.url} alt="Bukti bayar" className="w-full rounded-xl max-h-48 object-contain bg-gray-50 mb-2" />}
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    {buktiBayar.uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {buktiBayar.uploading ? 'Mengupload...' : 'Bukti berhasil diupload'}
                  </div>
                </div>
              )}
              <input ref={buktiInputRef} type="file" className="hidden" accept="image/*"
                onChange={e => { if (e.target.files?.[0]) handleUploadBukti(e.target.files[0]) }} />

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                  ← Kembali
                </button>
                <button onClick={handleSubmit} disabled={submitting || !buktiBayar?.url}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
