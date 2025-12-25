import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import SubscriptionCard from '@/components/settings/SubscriptionCard'
import ProfileSettings from '@/components/settings/ProfileSettings'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const userData = await getCurrentUser()

  if (!userData) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData.user.id)

  const { count: sessionsThisMonth } = await supabase
    .from('work_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData.user.id)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account and subscription</p>
      </div>

      <div className="space-y-6">
        <ProfileSettings profile={userData.profile} />

        <SubscriptionCard
          profile={userData.profile}
          projectsCount={projectsCount || 0}
          sessionsThisMonth={sessionsThisMonth || 0}
        />
      </div>
    </div>
  )
}
