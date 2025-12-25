import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ProjectsPage() {
  const userData = await getCurrentUser()

  if (!userData) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*, work_sessions(count)')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-2">Manage your client projects</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + New Project
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No projects yet</h2>
          <p className="text-slate-600 mb-6">Create your first project to start tracking work sessions</p>
          <Link
            href="/dashboard/projects/new"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: {
            id: string
            name: string
            status: string
            client_name: string
            description?: string
            work_sessions: { count: number }[]
          }) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {project.name[0].toUpperCase()}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-700' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                  }`}>
                  {project.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{project.name}</h3>
              <p className="text-sm text-slate-600 mb-4">Client: {project.client_name}</p>
              {project.description && (
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description}</p>
              )}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  {project.work_sessions?.[0]?.count || 0} work sessions
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
