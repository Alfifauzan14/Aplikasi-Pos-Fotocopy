'use client'

import { useState, useEffect, useRef } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { formatRupiah } from '@/lib/utils'
import { Package, Plus, ShoppingCart, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProdukATK {
  id: string
  nama: string
  deskripsi: string | null
  harga: number
  stok: number
  satuan: string
  gambar: string | null
}

interface CartItem {
  produkId: string
  nama: string
  harga: number
  jumlah: number
  subtotal: number
  type: 'atk'
}

export default function KatalogATKPage() {
  const router = useRouter()
  const [produks, setProduks] = useState<ProdukATK[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [isPayment, setIsPayment] = useState(false)
  const [qrisImage, setQrisImage] = useState('')
  const [buktiBayar, setBuktiBayar] = useState<{ url: string; uploading: boolean; error?: string } | null>(null)
  const buktiInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/produk-atk').then(r => r.json()).then(data => {
      setProduks(data)
      setLoading(false)
    })
    fetch('/api/pengaturan?key=qris_image_url').then(r => r.json()).then(d => setQrisImage(d?.value || ''))
  }, [])

  const addToCart = (produk: ProdukATK) => {
    setCart(prev => {
      const existing = prev.findIndex(c => c.produkId === produk.id)
      if (existing >= 0) {
        return prev.map((c, i) => i === existing ? { ...c, jumlah: c.jumlah + 1, subtotal: (c.jumlah + 1) * c.harga } : c)
      }
      return [...prev, { produkId: produk.id, nama: produk.nama, harga: Number(produk.harga), jumlah: 1, subtotal: Number(produk.harga), type: 'atk' }]
    })
  }

  const removeFromCart = (produkId: string) => {
    setCart(prev => prev.filter(c => c.produkId !== produkId))
  }

  const updateQty = (produkId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.produkId !== produkId) return c
      const newQty = Math.max(1, c.jumlah + delta)
      return { ...c, jumlah: newQty, subtotal: newQty * c.harga }
    }))
  }

  const total = cart.reduce((sum, c) => sum + c.subtotal, 0)

  const handleUploadBukti = async (file: File) => {
    setBuktiBayar({ url: '', uploading: true })
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (res.ok) setBuktiBayar({ url: data.url, uploading: false })
    else setBuktiBayar({ url: '', uploading: false, error: data.message })
  }

  const handleOrder = async () => {
    if (cart.length === 0) return
    if (!buktiBayar?.url) {
      alert('Upload bukti pembayaran terlebih dahulu!')
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/orders/online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cart: cart.map(c => ({ ...c, produkId: c.produkId })),
        buktiBayar: buktiBayar.url
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      setSuccess(true)
      setCart([])
      setIsPayment(false)
    } else {
      alert('Gagal membuat order')
    }
  }

  if (success) {
    return (
      <div>
        <Topbar title="Katalog ATK" role="customer" />
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Order Berhasil! 🎉</h2>
            <p className="text-gray-500 mb-6">Pesanan ATK Anda sedang diproses oleh admin.</p>
            <a href="/customer/riwayat" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">
              Lihat Riwayat Order
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar title="Katalog Produk ATK" role="customer" />
      <div className="p-6">
        {/* Cart button */}
        {cart.length > 0 && !isPayment && (
          <div className="mb-4 flex justify-end">
            <button onClick={() => setShowCart(!showCart)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700">
              <ShoppingCart className="w-4 h-4" /> Keranjang ({cart.length}) - {formatRupiah(total)}
            </button>
          </div>
        )}

        {/* Payment Panel */}
        {isPayment && (
          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-lg mx-auto">
            <h3 className="font-bold text-gray-900 mb-4 text-center">Pembayaran QRIS</h3>
            
            {qrisImage ? (
              <img src={qrisImage} alt="QRIS" className="max-w-xs mx-auto rounded-xl shadow-md mb-4" />
            ) : (
              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl mb-4">
                <p className="text-gray-400 text-sm">Gambar QRIS belum diatur</p>
              </div>
            )}
            
            <div className="bg-blue-50 rounded-xl p-4 mb-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total yang harus dibayar:</p>
              <p className="text-2xl font-extrabold text-blue-600">{formatRupiah(total)}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Upload Bukti Bayar</p>
              {!buktiBayar?.url && !buktiBayar?.uploading ? (
                <div onClick={() => buktiInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                  <p className="text-sm text-gray-500">Klik untuk upload bukti bayar</p>
                </div>
              ) : buktiBayar?.uploading ? (
                <div className="p-4 text-center text-blue-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Mengupload...
                </div>
              ) : (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Bukti terupload
                </div>
              )}
              <input ref={buktiInputRef} type="file" className="hidden" accept="image/*"
                onChange={e => { if (e.target.files?.[0]) handleUploadBukti(e.target.files[0]) }} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsPayment(false)} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                Kembali
              </button>
              <button onClick={handleOrder} disabled={submitting || !buktiBayar?.url}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Konfirmasi
              </button>
            </div>
          </div>
        )}

        {/* Cart Panel */}
        {showCart && cart.length > 0 && !isPayment && (
          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Keranjang</h3>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.produkId} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.nama}</p>
                    <p className="text-xs text-gray-400">{formatRupiah(item.harga)}/pcs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.produkId, -1)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-sm font-bold">-</button>
                    <span className="w-6 text-center text-sm font-semibold">{item.jumlah}</span>
                    <button onClick={() => updateQty(item.produkId, 1)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-sm font-bold">+</button>
                  </div>
                  <p className="text-sm font-bold text-blue-600 w-24 text-right">{formatRupiah(item.subtotal)}</p>
                  <button onClick={() => removeFromCart(item.produkId)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
              <span className="font-bold text-lg">Total: {formatRupiah(total)}</span>
              <button onClick={() => setIsPayment(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90">
                Checkout Pembayaran →
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {produks.map(p => {
              const inCart = cart.find(c => c.produkId === p.id)
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{p.nama}</h4>
                  {p.deskripsi && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{p.deskripsi}</p>}
                  <p className="font-bold text-green-600 mb-3">{formatRupiah(Number(p.harga))}</p>
                  <p className="text-xs text-gray-400 mb-3">Stok: {p.stok} {p.satuan}</p>
                  {inCart ? (
                    <div className="flex items-center justify-between">
                      <button onClick={() => updateQty(p.id, -1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200">-</button>
                      <span className="font-bold text-sm">{inCart.jumlah}</span>
                      <button onClick={() => addToCart(p)} className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold hover:bg-blue-700">+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(p)} disabled={p.stok === 0}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
