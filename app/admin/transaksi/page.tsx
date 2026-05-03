'use client'

import { useState, useEffect, useRef } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { formatRupiah } from '@/lib/utils'
import { Plus, Search, Loader2, Receipt, ShoppingCart, Trash2 } from 'lucide-react'

interface Layanan {
  id: string
  nama: string
  jenis: string
  ukuran: string
  hargaPerLembar: number
}

interface ProdukATK {
  id: string
  nama: string
  harga: number
  stok: number
  satuan: string
}

interface CartItem {
  type: 'layanan' | 'atk'
  id: string
  nama: string
  harga: number
  qty: number
  jumlahLembar?: number
  subtotal: number
}

export default function TransaksiLangsungPage() {
  const [layanans, setLayanans] = useState<Layanan[]>([])
  const [produks, setProduks] = useState<ProdukATK[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [namaCustomer, setNamaCustomer] = useState('')
  const [metodeBayar, setMetodeBayar] = useState<'CASH' | 'QRIS'>('CASH')
  const [activeTab, setActiveTab] = useState<'layanan' | 'atk'>('layanan')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [successOrder, setSuccessOrder] = useState<any>(null)
  const [selectedLayanan, setSelectedLayanan] = useState<Layanan | null>(null)
  const [lembar, setLembar] = useState(1)
  const [copy, setCopy] = useState(1)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoadingData(true)
    const [layananRes, produkRes] = await Promise.all([
      fetch('/api/layanan'),
      fetch('/api/produk-atk'),
    ])
    const layananData = await layananRes.json()
    const produkData = await produkRes.json()
    setLayanans(layananData)
    setProduks(produkData)
    setLoadingData(false)
  }

  const addLayananToCart = () => {
    if (!selectedLayanan) return
    const hargaNum = Number(selectedLayanan.hargaPerLembar)
    const subtotal = hargaNum * lembar * copy
    const existing = cart.findIndex(c => c.id === selectedLayanan.id + `-${lembar}-${copy}`)
    if (existing >= 0) {
      setCart(prev => prev.map((c, i) => i === existing ? { ...c, qty: c.qty + 1, subtotal: c.subtotal + subtotal } : c))
    } else {
      setCart(prev => [...prev, {
        type: 'layanan',
        id: selectedLayanan.id + `-${lembar}-${copy}`,
        nama: `${selectedLayanan.nama} (${lembar} lembar × ${copy} copy)`,
        harga: hargaNum,
        qty: 1,
        jumlahLembar: lembar * copy,
        subtotal,
      }])
    }
    setSelectedLayanan(null)
    setLembar(1)
    setCopy(1)
  }

  const addATKToCart = (produk: ProdukATK) => {
    const hargaNum = Number(produk.harga)
    const existing = cart.findIndex(c => c.id === produk.id)
    if (existing >= 0) {
      setCart(prev => prev.map((c, i) => i === existing ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * hargaNum } : c))
    } else {
      setCart(prev => [...prev, {
        type: 'atk',
        id: produk.id,
        nama: produk.nama,
        harga: hargaNum,
        qty: 1,
        subtotal: hargaNum,
      }])
    }
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.id !== id))
  }

  const total = cart.reduce((sum, c) => sum + c.subtotal, 0)

  const handleCheckout = async () => {
    if (!namaCustomer.trim()) {
      alert('Masukkan nama customer!')
      return
    }
    if (cart.length === 0) {
      alert('Keranjang masih kosong!')
      return
    }

    setLoading(true)
    const res = await fetch('/api/orders/langsung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namaCustomer, metodeBayar, cart }),
    })
    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccessOrder(data)
      setCart([])
      setNamaCustomer('')
    } else {
      alert(data.message || 'Gagal membuat transaksi')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (successOrder) {
    return (
      <div>
        <Topbar title="Transaksi Langsung" role="admin" />
        <div className="p-6">
          <div className="max-w-md mx-auto">
            <div ref={printRef} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Transaksi Berhasil!</h2>
                <p className="text-gray-500 text-sm mt-1">Struk dicetak otomatis</p>
              </div>

              <div className="border-t border-b border-dashed border-gray-200 py-4 my-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">No. Order</span>
                  <span className="font-mono font-bold">{successOrder.nomorOrder}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Antrian</span>
                  <span className="font-mono font-bold text-blue-600">{successOrder.nomorAntrian}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-semibold">{successOrder.namaCustomer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Metode Bayar</span>
                  <span className="font-semibold">{successOrder.metodeBayar}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {successOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600 flex-1 mr-4">{item.nama}</span>
                    <span className="font-semibold">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-xl text-blue-600">{formatRupiah(successOrder.total)}</span>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                Terima kasih telah berbelanja di Fotocopy & ATK SMAKZIE
              </p>
            </div>

            <div className="flex gap-3 mt-4 no-print">
              <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                <Receipt className="w-4 h-4" /> Cetak Struk
              </button>
              <button onClick={() => setSuccessOrder(null)} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar title="Transaksi Langsung" role="admin" />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Product Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Info Customer</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={namaCustomer}
                  onChange={e => setNamaCustomer(e.target.value)}
                  placeholder="Nama customer (opsional)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <select
                  value={metodeBayar}
                  onChange={e => setMetodeBayar(e.target.value as any)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="CASH">Cash</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('layanan')}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'layanan' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Print & Fotocopy
                </button>
                <button
                  onClick={() => setActiveTab('atk')}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'atk' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Produk ATK
                </button>
              </div>

              <div className="p-5">
                {loadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : activeTab === 'layanan' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {layanans.map(l => (
                        <div
                          key={l.id}
                          className={`p-4 rounded-xl border-2 transition-all ${selectedLayanan?.id === l.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300 cursor-pointer'}`}
                          onClick={() => { if (selectedLayanan?.id !== l.id) setSelectedLayanan(l) }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{l.nama}</p>
                              <p className="text-blue-600 font-bold mt-1">{formatRupiah(Number(l.hargaPerLembar))}/lembar</p>
                            </div>
                            {selectedLayanan?.id === l.id && (
                              <button onClick={(e) => { e.stopPropagation(); setSelectedLayanan(null) }} className="text-gray-400 hover:text-gray-600 text-xs">✕ Tutup</button>
                            )}
                          </div>

                          {selectedLayanan?.id === l.id && (
                            <div className="mt-4 pt-4 border-t border-blue-200 cursor-default" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-3 flex-wrap">
                                <div>
                                  <label className="text-xs text-gray-600 font-medium">Jumlah Lembar</label>
                                  <input type="number" min={1} value={lembar} onChange={e => setLembar(Number(e.target.value))}
                                    className="block mt-1 w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 font-medium">Jumlah Copy</label>
                                  <input type="number" min={1} value={copy} onChange={e => setCopy(Number(e.target.value))}
                                    className="block mt-1 w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="flex-1 min-w-[100px]">
                                  <p className="text-xs text-gray-600">Subtotal:</p>
                                  <p className="font-bold text-blue-700">{formatRupiah(Number(selectedLayanan.hargaPerLembar) * lembar * copy)}</p>
                                </div>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); addLayananToCart() }}
                                className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                                <Plus className="w-4 h-4" /> Tambah ke Keranjang
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {produks.map(p => (
                      <div key={p.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{p.nama}</p>
                            <p className="text-green-600 font-bold mt-0.5">{formatRupiah(Number(p.harga))}/{p.satuan}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Stok: {p.stok} {p.satuan}</p>
                          </div>
                          <button onClick={() => addATKToCart(p)} disabled={p.stok === 0}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-6">
              <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                <h3 className="font-bold text-gray-900">Keranjang ({cart.length})</h3>
              </div>

              <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">Keranjang kosong</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.nama}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                        <p className="text-sm font-bold text-blue-600">{formatRupiah(item.subtotal)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-5 border-t border-gray-100 space-y-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">{formatRupiah(total)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Receipt className="w-5 h-5" />}
                  {loading ? 'Memproses...' : 'Proses Transaksi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
