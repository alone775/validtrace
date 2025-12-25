'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Session {
  id: string
  duration_minutes: number
}

export default function SessionTimer({ session }: { session: Session }) {
  const [seconds, setSeconds] = useState(session.duration_minutes * 60)
  const [isRunning, setIsRunning] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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

  useEffect(() => {
    if (!isRunning) return

    const updateInterval = setInterval(async () => {
      await supabase
        .from('work_sessions')
        .update({ duration_minutes: Math.floor(seconds / 60) })
        .eq('id', session.id)
    }, 30000)

    return () => clearInterval(updateInterval)
  }, [seconds, isRunning, session.id, supabase])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleComplete = async () => {
    setLoading(true)

    const { error } = await supabase
      .from('work_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        duration_minutes: Math.floor(seconds / 60),
      })
      .eq('id', session.id)

    if (error) {
      alert('Error completing session: ' + error.message)
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border-2 border-blue-200 p-8 mb-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-blue-700">Session in Progress</span>
        </div>
        <div className="text-6xl font-mono font-bold text-slate-900 mb-6">
          {formatTime(seconds)}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-3 text-white font-medium rounded-lg transition-colors ${
              isRunning
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRunning ? '⏸ Pause' : '▶️ Resume'}
          </button>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Completing...' : '✓ Complete Session'}
          </button>
        </div>
      </div>
    </div>
  )
}
