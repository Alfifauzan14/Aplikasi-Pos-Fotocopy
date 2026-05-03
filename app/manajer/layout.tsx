import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function ManajerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'MANAJER') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="manajer" userName={session.user.name} userEmail={session.user.email} />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  )
}
