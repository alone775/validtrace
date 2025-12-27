import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const userData = await getCurrentUser()

  if (!userData) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const [projectsResult, sessionsResult, recentSessionsResult] = await Promise.all([
    supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('user_id', userData.user.id),
    supabase
      .from('work_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', userData.user.id)
      .eq('status', 'completed'),
    supabase
      .from('work_sessions')
      .select('*, projects(name)')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalProjects = projectsResult.count || 0
  const totalSessions = sessionsResult.count || 0
  const recentSessions = recentSessionsResult.data || []

  const totalHours = recentSessions.reduce((acc: number, session: { duration_minutes: number | null }) => {
    return acc + (session.duration_minutes || 0)
  }, 0) / 60

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Welcome back, {userData?.profile?.full_name || 'User'}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
              📁
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
              ⏱️
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Work Sessions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl">
              🕐
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Hours</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalHours.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Link
              href="/dashboard/projects/new"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <span className="text-2xl">➕</span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Create New Project</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Start tracking work for a new client</p>
              </div>
            </Link>
            <Link
              href="/dashboard/sessions/new"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <span className="text-2xl">▶️</span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Start Work Session</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Begin tracking your work with evidence</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Sessions</h2>
            <Link href="/dashboard/sessions" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          {recentSessions.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No sessions yet. Start your first session!</p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session: {
                id: string
                title: string
                duration_minutes: number
                status: string
                projects?: {
                  name: string
                }
              }) => (
                <Link
                  key={session.id}
                  href={`/dashboard/sessions/${session.id}`}
                  className="block p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <p className="font-medium text-slate-900 dark:text-white">{session.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>📁 {session.projects?.name}</span>
                    <span>⏱️ {session.duration_minutes} min</span>
                    <span className={`px-2 py-1 rounded text-xs ${session.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      session.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                      {session.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
