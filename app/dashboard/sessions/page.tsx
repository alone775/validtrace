import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface Session {
  id: string
  title: string
  status: string
  projects?: { name: string }
  duration_minutes: number
  started_at: string
}

export default async function SessionsPage() {
  const userData = await getCurrentUser()

  if (!userData) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('work_sessions')
    .select('*, projects(name)')
    .eq('user_id', userData.user.id)
    .order('started_at', { ascending: false })

  const inProgressSessions = sessions?.filter(s => s.status === 'in_progress') || []

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Work Sessions</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Track and manage your work sessions</p>
        </div>
        <Link
          href="/dashboard/sessions/new"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + New Session
        </Link>
      </div>

      {inProgressSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">In Progress</h2>
          <div className="grid grid-cols-1 gap-4">
            {inProgressSessions.map((session: Session) => (
              <Link
                key={session.id}
                href={`/dashboard/sessions/${session.id}`}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border-2 border-blue-500 dark:border-blue-500 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                        In Progress
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{session.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">📁 {session.projects?.name}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                      <span>⏱️ {session.duration_minutes} min</span>
                      <span>📅 {new Date(session.started_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!sessions || sessions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="text-6xl mb-4">⏱️</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No sessions yet</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Start your first work session to track proof of work</p>
          <Link
            href="/dashboard/sessions/new"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Start Your First Session
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">All Sessions</h2>
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session: Session) => (
              <Link
                key={session.id}
                href={`/dashboard/sessions/${session.id}`}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        session.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                        {session.status === 'in_progress' ? 'In Progress' :
                          session.status === 'completed' ? 'Completed' : 'Draft'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{session.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">📁 {session.projects?.name}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                      <span>⏱️ {session.duration_minutes} min</span>
                      <span>📅 {new Date(session.started_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
