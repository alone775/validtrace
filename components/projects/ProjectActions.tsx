'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProjectActions({ projectId }: { projectId: string }) {
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated work sessions.')) {
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      alert('Error deleting project: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/projects')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
      >
        ⋮
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
