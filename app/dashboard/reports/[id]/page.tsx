import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import ReportView from '@/components/reports/ReportView'

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userData = await getCurrentUser()

  if (!userData) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { data: session } = await supabase
    .from('work_sessions')
    .select('*, projects(name, client_name, client_email, description)')
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

  const reportData = {
    session,
    evidence: evidence || [],
    profile: userData.profile,
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/sessions" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
          ← Back to Sessions
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Proof of Work Report</h1>
            <p className="text-slate-600 mt-2">{session.title}</p>
          </div>
        </div>
      </div>

      <ReportView data={reportData} />
    </div>
  )
}
