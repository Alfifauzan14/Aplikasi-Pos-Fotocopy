'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/Sidebar'
import { useSession } from 'next-auth/react'
import { Save, User, KeyRound } from 'lucide-react'

export default function AdminPengaturanPage() {
  const { data: session } = useSession()
  const [saving, setSaving] = useState(false)
  
  return (
    <div>
      <Topbar title="Pengaturan Akun" role="admin" />
      <div className="p-6 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-gray-500" />
            <h3 className="font-bold text-gray-900">Profil Admin</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                defaultValue={session?.user?.name || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>
            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Pengaturan sistem utama (Harga, QRIS, Info Toko) hanya dapat diubah oleh <strong>Manajer</strong> melalui dashboard Manajer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
