'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Evidence {
  id: string
  type: string
  title: string
  timestamp: string
  description?: string
}

export default function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evidence?')) {
      return
    }

    const { error } = await supabase
      .from('evidence_entries')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting evidence: ' + error.message)
      return
    }

    router.refresh()
  }

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '✓'
      case 'commit':
        return '💾'
      case 'milestone':
        return '🎯'
      case 'note':
        return '📝'
      default:
        return '📌'
    }
  }

  const getEvidenceColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'commit':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'milestone':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
      case 'note':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }
  }

  if (evidence.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-slate-600 dark:text-slate-400">No evidence entries yet</p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Add your first piece of evidence to start building your proof of work</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {evidence.map((entry, index) => (
        <div
          key={entry.id}
          className={`relative pl-8 pb-6 ${index === evidence.length - 1 ? '' : 'border-l-2 border-slate-200 dark:border-slate-800'}`}
        >
          <div className={`absolute -left-4 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg ${getEvidenceColor(entry.type)}`}>
            {getEvidenceIcon(entry.type)}
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white">{entry.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(entry.timestamp).toLocaleTimeString()} - {new Date(entry.timestamp).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                className="text-slate-400 hover:text-red-600 transition-colors ml-2"
              >
                ×
              </button>
            </div>
            {entry.description && (
              <p className="text-sm text-slate-600 mt-2">{entry.description}</p>
            )}
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${getEvidenceColor(entry.type)}`}>
              {entry.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
