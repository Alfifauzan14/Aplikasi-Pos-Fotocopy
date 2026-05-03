'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { formatRupiah, formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, ShoppingCart, Package, BarChart3, Loader2 } from 'lucide-react'

interface LaporanData {
  summary: {
    totalRevenue: number
    totalOrders: number
    onlineOrders: number
    langsungOrders: number
  }
  chartData: Array<{ date: string; total: number }>
  layananBreakdown: Array<{ nama: string; count: number; revenue: number }>
}

export default function ManajerDashboard() {
  const [data, setData] = useState<LaporanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('bulanan')

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch(`/api/laporan?periode=${periode}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [periode])

  return (
    <div>
      <Topbar title="Dashboard Manajer" role="manajer" />
      <div className="p-6 space-y-6">
        {/* Filter Periode */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          {['harian', 'mingguan', 'bulanan'].map(p => (
            <button key={p} onClick={() => setPeriode(p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${periode === p ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {p}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Total Pendapatan', value: formatRupiah(data.summary.totalRevenue), icon: TrendingUp, color: 'from-violet-500 to-violet-700' },
                { title: 'Total Order', value: data.summary.totalOrders.toString(), icon: ShoppingCart, color: 'from-blue-500 to-blue-700' },
                { title: 'Order Online', value: data.summary.onlineOrders.toString(), icon: Package, color: 'from-green-500 to-green-700' },
                { title: 'Order Langsung', value: data.summary.langsungOrders.toString(), icon: BarChart3, color: 'from-orange-500 to-orange-700' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6">Grafik Pendapatan</h3>
              {data.chartData.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Tidak ada data untuk periode ini</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `Rp ${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [formatRupiah(v), 'Pendapatan']} />
                    <Bar dataKey="total" fill="url(#gradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Layanan Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Rincian Layanan</h3>
              <div className="space-y-3">
                {data.layananBreakdown.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">Tidak ada data layanan</p>
                ) : (
                  data.layananBreakdown.sort((a, b) => b.revenue - a.revenue).map((l, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{l.nama}</p>
                        <p className="text-xs text-gray-400">{l.count} lembar</p>
                      </div>
                      <p className="font-bold text-violet-600">{formatRupiah(l.revenue)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
