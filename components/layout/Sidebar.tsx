'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, ClipboardList, ShoppingCart, Package, Printer,
  Settings, LogOut, Menu, X, Bell, ChevronDown, BarChart3,
  FileText, AlertTriangle, Users, Truck
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItem {
  href: string
  label: string
  icon: React.ElementType
}

interface SidebarProps {
  role: 'admin' | 'manajer' | 'customer'
  userName: string
  userEmail: string
}

const menuByRole: Record<string, SidebarItem[]> = {
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/transaksi', label: 'Transaksi Langsung', icon: ShoppingCart },
    { href: '/admin/order-online', label: 'Order Online', icon: ClipboardList },
    { href: '/admin/antrian', label: 'Antrian', icon: Printer },
    { href: '/admin/stok', label: 'Stok Bahan', icon: Package },
    { href: '/admin/produk-atk', label: 'Produk ATK', icon: Truck },
    { href: '/admin/pengaturan', label: 'Pengaturan', icon: Settings },
  ],
  manajer: [
    { href: '/manajer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/manajer/laporan', label: 'Laporan Keuangan', icon: BarChart3 },
    { href: '/manajer/log-aktivitas', label: 'Log Aktivitas', icon: FileText },
    { href: '/manajer/pengaturan', label: 'Pengaturan', icon: Settings },
  ],
  customer: [
    { href: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/customer/pesan-layanan', label: 'Pesan Layanan', icon: Printer },
    { href: '/customer/katalog-atk', label: 'Katalog ATK', icon: Package },
    { href: '/customer/riwayat', label: 'Riwayat Order', icon: ClipboardList },
    { href: '/customer/profil', label: 'Profil', icon: Users },
  ],
}

const roleColors: Record<string, string> = {
  admin: 'from-red-500 to-orange-500',
  manajer: 'from-violet-500 to-purple-600',
  customer: 'from-blue-500 to-blue-700',
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manajer: 'Manajer',
  customer: 'Customer',
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const menus = menuByRole[role] || []
  const gradient = roleColors[role]
  const roleLabel = roleLabels[role]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-6 bg-gradient-to-br ${gradient}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm leading-tight">Fotocopy & ATK</h2>
            <p className="text-white/70 text-xs">SMAKZIE - {roleLabel}</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className={`w-9 h-9 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menus.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-gray-400')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        {isOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside className={cn(
        'lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-100 shadow-sm fixed top-0 bottom-0 left-0 z-30">
        <SidebarContent />
      </aside>
    </>
  )
}

interface TopbarProps {
  title: string
  role: string
}

export function Topbar({ title, role }: TopbarProps) {
  const gradient = roleColors[role] || 'from-blue-500 to-blue-700'
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900 ml-10 lg:ml-0">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  )
}
