'use client'

import { Topbar } from '@/components/layout/Sidebar'
import { useSession } from 'next-auth/react'
import { User, Mail } from 'lucide-react'

export default function CustomerProfilPage() {
  const { data: session } = useSession()
  
  return (
    <div>
      <Topbar title="Profil Saya" role="customer" />
      <div className="p-6 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
            {session?.user?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{session?.user?.name}</h2>
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-8">
            <Mail className="w-4 h-4" />
            <span>{session?.user?.email}</span>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 text-left border border-blue-100">
            <p className="text-sm text-blue-800">
              Saat ini fitur ubah profil sedang dalam tahap pengembangan. Jika Anda membutuhkan bantuan terkait pesanan atau akun, silakan hubungi admin toko.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
