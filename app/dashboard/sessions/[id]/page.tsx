import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import SessionTimer from '@/components/sessions/SessionTimer'
import EvidenceList from '@/components/sessions/EvidenceList'
import AddEvidenceForm from '@/components/sessions/AddEvidenceForm'

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userData = await getCurrentUser()

  if (!userData) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { data: session } = await supabase
    .from('work_sessions')
    .select('*, projects(name, client_name)')
    .eq('id', id)
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (!session) {
    notFound()
  }

  const { data: evidence } = await supabase
    .from('evidence_entries')
    .select('*')
    .eq('session_id', id)
    .order('timestamp', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/sessions" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
          ← Back to Sessions
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{session.title}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              📁 {session.projects?.name} - {session.projects?.client_name}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${session.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
              session.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
            {session.status === 'in_progress' ? 'In Progress' :
              session.status === 'completed' ? 'Completed' : 'Draft'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {session.status === 'in_progress' && (
            <SessionTimer session={session} />
          )}

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Session Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Started:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {new Date(session.started_at).toLocaleString()}
                </span>
              </div>
              {session.ended_at && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Ended:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {new Date(session.ended_at).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Evidence Entries:</span>
                <span className="font-medium text-slate-900 dark:text-white">{evidence?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Evidence Timeline</h2>
            <EvidenceList evidence={evidence || []} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <AddEvidenceForm sessionId={session.id} />

          {session.status === 'completed' && (
            <Link
              href={`/dashboard/reports/${session.id}`}
              className="block mt-4 w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              📄 View Report
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
