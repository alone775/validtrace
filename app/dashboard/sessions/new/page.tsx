'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function NewSessionPage() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const router = useRouter()

  interface Project {
    id: string
    name: string
    client_name: string
  }

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState(() => searchParams.get('project') || '')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const loadProjects = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('name')

      setProjects(data || [])
    }
    loadProjects()
  }, [supabase])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartStop = () => {
    setIsRunning(!isRunning)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a session title')
      return
    }

    if (!selectedProject) {
      setError('Please select a project')
      return
    }

    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    const { data: session, error: insertError } = await supabase
      .from('work_sessions')
      .insert({
        user_id: user.id,
        project_id: selectedProject,
        title,
        started_at: new Date(Date.now() - seconds * 1000).toISOString(),
        duration_minutes: Math.floor(seconds / 60),
        status: 'in_progress',
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/sessions/${session.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/sessions" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
          ← Back to Sessions
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">New Work Session</h1>
        <p className="text-slate-600 mt-2">Start tracking your work with a timer</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="text-6xl font-mono font-bold text-slate-900 mb-6">
              {formatTime(seconds)}
            </div>
            <button
              onClick={handleStartStop}
              className={`px-8 py-4 text-white font-medium rounded-lg transition-colors text-lg ${isRunning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              {isRunning ? '⏸ Pause' : '▶️ Start Timer'}
            </button>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Session Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="What are you working on?"
            />
          </div>

          <div>
            <label htmlFor="project" className="block text-sm font-medium text-slate-700 mb-2">
              Project *
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.client_name}
                </option>
              ))}
            </select>
          </div>

          {projects.length === 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
              No active projects found.{' '}
              <Link href="/dashboard/projects/new" className="font-medium underline">
                Create a project first
              </Link>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading || !title || !selectedProject}
            className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Save & Continue'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
