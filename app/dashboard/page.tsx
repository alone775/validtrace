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
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back, {userData?.profile?.full_name || 'User'}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">
              📁
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900">{totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-2xl">
              ⏱️
            </div>
            <div>
              <p className="text-sm text-slate-600">Work Sessions</p>
              <p className="text-2xl font-bold text-slate-900">{totalSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-2xl">
              🕐
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Hours</p>
              <p className="text-2xl font-bold text-slate-900">{totalHours.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Link
              href="/dashboard/projects/new"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-2xl">➕</span>
              <div>
                <p className="font-medium text-slate-900">Create New Project</p>
                <p className="text-sm text-slate-600">Start tracking work for a new client</p>
              </div>
            </Link>
            <Link
              href="/dashboard/sessions/new"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <span className="text-2xl">▶️</span>
              <div>
                <p className="font-medium text-slate-900">Start Work Session</p>
                <p className="text-sm text-slate-600">Begin tracking your work with evidence</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Sessions</h2>
            <Link href="/dashboard/sessions" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          {recentSessions.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No sessions yet. Start your first session!</p>
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
                  className="block p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <p className="font-medium text-slate-900">{session.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span>📁 {session.projects?.name}</span>
                    <span>⏱️ {session.duration_minutes} min</span>
                    <span className={`px-2 py-1 rounded text-xs ${session.status === 'completed' ? 'bg-green-100 text-green-700' :
                      session.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
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
