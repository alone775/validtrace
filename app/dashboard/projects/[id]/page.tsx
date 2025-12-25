import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import ProjectActions from '@/components/projects/ProjectActions'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userData = await getCurrentUser()

  if (!userData) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (!project) {
    notFound()
  }

  const { data: sessions } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('project_id', id)
    .order('started_at', { ascending: false })

  const totalHours = sessions?.reduce((acc: number, session: { duration_minutes: number | null }) => acc + (session.duration_minutes || 0), 0) / 60 || 0

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <Link href="/dashboard/projects" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
              ← Back to Projects
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-slate-600 mt-2">Client: {project.client_name}</p>
          </div>
          <ProjectActions projectId={project.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-2xl">
              ⏱️
            </div>
            <div>
              <p className="text-sm text-slate-600">Work Sessions</p>
              <p className="text-2xl font-bold text-slate-900">{sessions?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">
              🕐
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Hours</p>
              <p className="text-2xl font-bold text-slate-900">{totalHours.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-2xl">
              📊
            </div>
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <p className="text-lg font-bold text-slate-900 capitalize">{project.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Project Details</h2>
        <div className="space-y-4">
          {project.description && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Description</p>
              <p className="text-slate-600">{project.description}</p>
            </div>
          )}
          {project.client_email && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Client Email</p>
              <p className="text-slate-600">{project.client_email}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Created</p>
            <p className="text-slate-600">{new Date(project.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Work Sessions</h2>
          <Link
            href={`/dashboard/sessions/new?project=${project.id}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Session
          </Link>
        </div>

        {!sessions || sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏱️</div>
            <p className="text-slate-600 mb-4">No work sessions yet</p>
            <Link
              href={`/dashboard/sessions/new?project=${project.id}`}
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Start First Session
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session: {
              id: string
              title: string
              duration_minutes: number
              started_at: string
              status: string
            }) => (
              <Link
                key={session.id}
                href={`/dashboard/sessions/${session.id}`}
                className="block p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{session.title}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <span>🕐 {session.duration_minutes} min</span>
                      <span>📅 {new Date(session.started_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.status === 'completed' ? 'bg-green-100 text-green-700' :
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
  )
}
