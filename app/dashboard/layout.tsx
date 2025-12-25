import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userData = await getCurrentUser()

  if (!userData) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav user={userData.user} profile={userData.profile} />
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
