import Link from 'next/link'
import { Printer, CheckCircle, Clock, Package, Star, Phone, MapPin, Mail, ArrowRight, Zap, Shield, FileText } from 'lucide-react'

export default function LandingPage() {
  const services = [
    { name: 'Print Hitam Putih', items: [{ size: 'A4', price: 500 }, { size: 'F4', price: 600 }, { size: 'A3', price: 1000 }] },
    { name: 'Print Berwarna', items: [{ size: 'A4', price: 2000 }, { size: 'F4', price: 2500 }, { size: 'A3', price: 4000 }] },
    { name: 'Fotocopy', items: [{ size: 'A4', price: 300 }, { size: 'F4', price: 400 }, { size: 'A3', price: 800 }] },
  ]

  const features = [
    { icon: Zap, title: 'Order Online 24/7', desc: 'Pesan kapan saja, file diproses saat toko buka' },
    { icon: Shield, title: 'Pembayaran Aman', desc: 'Pembayaran via QRIS yang mudah dan terpercaya' },
    { icon: Clock, title: 'Antrian Realtime', desc: 'Pantau status pesanan Anda secara realtime' },
    { icon: FileText, title: 'Struk Digital', desc: 'Download struk/invoice PDF kapan saja' },
  ]

  const steps = [
    { step: '01', title: 'Daftar / Login', desc: 'Buat akun gratis atau login jika sudah punya akun' },
    { step: '02', title: 'Upload File', desc: 'Upload file PDF, Word, Excel, PPT, atau gambar (maks 25MB)' },
    { step: '03', title: 'Pilih Layanan', desc: 'Pilih jenis print, ukuran kertas, dan jumlah lembar' },
    { step: '04', title: 'Bayar via QRIS', desc: 'Scan QR code dan upload bukti pembayaran' },
    { step: '05', title: 'Pantau Status', desc: 'Terima notifikasi realtime update status pesanan' },
    { step: '06', title: 'Ambil di Toko', desc: 'Ambil dokumen saat status "Siap Diambil"' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">Fotocopy & ATK</h1>
                <p className="text-xs text-blue-600 font-medium">SMAKZIE</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#layanan" className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">Layanan & Harga</a>
              <a href="#cara-pesan" className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">Cara Pesan</a>
              <a href="#kontak" className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">Kontak</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2">
                Masuk
              </Link>
              <Link href="/register" className="text-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-blue-200 hover:shadow-lg">
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-100 rounded-full blur-3xl opacity-40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Layanan Print & Fotocopy Online Terpercaya
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Print & Fotocopy
              <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Mudah & Cepat
              </span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Pesan layanan print dan fotocopy secara online. Upload file, bayar QRIS,
              dan ambil dokumen di toko. Mudah, cepat, dan terpercaya!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl hover:shadow-blue-300 hover:shadow-2xl hover:-translate-y-0.5">
                Mulai Pesan Sekarang
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#layanan" className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all shadow-md hover:-translate-y-0.5">
                Lihat Daftar Harga
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
              <div>
                <p className="text-3xl font-bold text-blue-600">500+</p>
                <p className="text-sm text-gray-500 mt-1">Transaksi/Bulan</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-violet-600">5★</p>
                <p className="text-sm text-gray-500 mt-1">Rating Pelanggan</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">Fast</p>
                <p className="text-sm text-gray-500 mt-1">Layanan Cepat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daftar Harga */}
      <section id="layanan" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Daftar Harga Layanan
            </h2>
            <p className="text-lg text-gray-500">Harga terjangkau, kualitas terjamin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, i) => {
              const gradients = [
                'from-blue-500 to-blue-700',
                'from-violet-500 to-violet-700',
                'from-emerald-500 to-emerald-700',
              ]
              const bgLights = ['bg-blue-50', 'bg-violet-50', 'bg-emerald-50']
              return (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100">
                  <div className={`bg-gradient-to-br ${gradients[i]} p-6 text-white`}>
                    <Printer className="w-8 h-8 mb-3 opacity-90" />
                    <h3 className="text-xl font-bold">{service.name}</h3>
                    <p className="text-white/75 text-sm mt-1">Harga per lembar</p>
                  </div>
                  <div className="p-6 space-y-3">
                    {service.items.map((item, j) => (
                      <div key={j} className={`flex items-center justify-between p-3 ${bgLights[i]} rounded-xl`}>
                        <span className="font-semibold text-gray-700">Ukuran {item.size}</span>
                        <span className="font-bold text-gray-900">
                          Rp {item.price.toLocaleString('id-ID')}/lembar
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ATK Note */}
          <div className="mt-10 p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center">
            <p className="text-amber-800 font-semibold text-lg">📦 Produk ATK tersedia di toko kami</p>
            <p className="text-amber-600 mt-1">Pulpen, Pensil, Penggaris, Staples, Map, Buku Tulis, Amplop, dan lainnya</p>
            <Link href="/register" className="inline-block mt-4 bg-amber-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-amber-600 transition-colors">
              Order ATK Online →
            </Link>
          </div>
        </div>
      </section>

      {/* Cara Pesan */}
      <section id="cara-pesan" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Cara Pesan Online</h2>
            <p className="text-lg text-gray-500">Mudah, cepat, 6 langkah saja!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative group">
                <div className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="text-5xl font-black text-blue-100 group-hover:text-blue-200 transition-colors mb-4">{s.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Order */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-violet-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h2 className="text-3xl font-extrabold mb-3">Pantau Status Pesanan Realtime</h2>
            <p className="text-blue-200">Dapatkan notifikasi langsung di akun Anda</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { emoji: '⏳', label: 'Menunggu Pembayaran', color: 'bg-yellow-400/20 border-yellow-300' },
              { emoji: '✅', label: 'Pembayaran Dikonfirmasi', color: 'bg-blue-400/20 border-blue-300' },
              { emoji: '🖨️', label: 'Sedang Diproses', color: 'bg-purple-400/20 border-purple-300' },
              { emoji: '📦', label: 'Siap Diambil', color: 'bg-green-400/20 border-green-300' },
              { emoji: '✔️', label: 'Selesai', color: 'bg-white/20 border-white/30' },
            ].map((s, i) => (
              <div key={i} className={`px-5 py-3 rounded-xl border ${s.color} text-white text-sm font-semibold flex items-center gap-2`}>
                <span>{s.emoji}</span> {s.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
            Siap Mulai Order?
          </h2>
          <p className="text-lg text-gray-500 mb-10">
            Daftar akun gratis sekarang dan nikmati kemudahan layanan print & fotocopy online.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-2xl hover:shadow-blue-300 hover:-translate-y-0.5">
            Daftar Sekarang – Gratis!
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-gray-400">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <Printer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Fotocopy & ATK</h3>
                  <p className="text-xs text-blue-400">SMAKZIE</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Layanan print, fotocopy, dan alat tulis kantor terpercaya. Kualitas terjamin, harga terjangkau.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Layanan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Print Hitam Putih (A4, F4, A3)</li>
                <li>Print Berwarna (A4, F4, A3)</li>
                <li>Fotocopy (A4, F4, A3)</li>
                <li>Penjualan Produk ATK</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Kontak</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  Jl. Contoh No. 123, Kota Anda
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  081234567890
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  admin@fotocopy.com
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  Senin - Sabtu: 08:00 - 17:00
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>© 2024 Fotocopy & ATK SMAKZIE. Dibuat dengan ❤️ untuk kemudahan pelanggan.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
