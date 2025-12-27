'use client'

import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'

interface ReportData {
  session: {
    id: string
    title: string
    started_at: string
    ended_at?: string
    duration_minutes: number
    projects?: {
      name: string
      client_name: string
      description?: string
    }
  }
  evidence: {
    id: string
    type: string
    title: string
    timestamp: string
    description?: string
  }[]
  profile?: {
    full_name: string
    company_name?: string
  }
}

export default function ReportView({ data }: { data: ReportData }) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [viewMode, setViewMode] = useState<'theme' | 'print'>('theme')
  const isThemeMode = viewMode === 'theme'

  const { session, evidence, profile } = data

  const handleExportPDF = async () => {
    if (!reportRef.current) return

    setExporting(true)

    try {
      // 1. Force a fixed width capture to simulate A4 width at high resolution
      // A4 width in px at 96 DPI is ~794px. Let's use 2x for quality (1587px)
      // We will capture the element as if it were this wide.
      const scale = 2
      const a4WidthPx = 794

      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        pixelRatio: scale,
        width: a4WidthPx, // Force width to match A4
        style: {
          transform: 'none', // Prevent external transforms
          margin: '0',
          width: `${a4WidthPx}px`, // Explicitly set width in styles
          height: 'auto' // Allow height to grow
        }
      })

      // 2. Create PDF with dimensions matching the captured image's aspect ratio
      // instead of forcing it into a fixed A4 page which squashes content
      const img = new Image()
      img.src = dataUrl
      await new Promise((resolve) => { img.onload = resolve })

      // Calculate the PDF page height needed to fit the content without distortion
      // A4 width is 210mm.
      const pdfWidth = 210
      const pdfHeight = (img.height / img.width) * pdfWidth

      // Create PDF with custom height if content is longer than standard A4
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight] // Custom format to fit content perfectly
      })

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`proof-of-work-${session.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'task': return '✓'
      case 'commit': return '💾'
      case 'milestone': return '🎯'
      case 'note': return '📝'
      default: return '📌'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div>
      <div className="mb-6 flex gap-4 print:hidden justify-end items-center">
        {/* View Mode Toggle */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-sm font-medium mr-auto">
          <button
            onClick={() => setViewMode('theme')}
            className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'theme'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            Theme
          </button>
          <button
            onClick={() => setViewMode('print')}
            className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'print'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            Print View
          </button>
        </div>

        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
        >
          {exporting ? (
            <>
              <span className="animate-spin">⏳</span> Generating...
            </>
          ) : (
            <>
              📄 Export PDF
            </>
          )}
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          🖨️ Print
        </button>
      </div>

      <div ref={reportRef} className={`bg-white ${isThemeMode ? 'dark:bg-slate-950' : ''} print:bg-white min-h-[297mm] mx-auto max-w-[210mm] shadow-2xl print:shadow-none mb-10 overflow-hidden relative`}>
        {/* Header */}
        <div className={`p-12 print:p-10 ${isThemeMode ? 'bg-slate-900 dark:bg-slate-950 text-white' : 'bg-white border-b-2 border-slate-900 text-slate-900'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Proof of Work</h1>
              <p className={`${isThemeMode ? 'text-slate-400' : 'text-slate-600'} font-medium`}>Session Report</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-1">{session.title}</div>
              <div className={`text-sm ${isThemeMode ? 'text-slate-400' : 'text-slate-600'} font-mono`}>ID: {session.id.slice(0, 8)}</div>
            </div>
          </div>
        </div>

        <div className="p-12 print:p-10">
          {/* Overview Grid */}
          <div className="mb-12">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
              Session Overview
            </h2>
            <div className="grid grid-cols-3 gap-y-8 gap-x-12">
              <div>
                <p className="text-xs text-slate-500 mb-1">Project</p>
                <p className={`font-semibold ${isThemeMode ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900'}`}>{session.projects?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Client</p>
                <p className={`font-semibold ${isThemeMode ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900'}`}>{session.projects?.client_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Freelancer</p>
                <p className={`font-semibold ${isThemeMode ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900'}`}>{profile?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Duration</p>
                <p className={`font-semibold ${isThemeMode ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900'} font-mono`}>{formatDuration(session.duration_minutes)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Started</p>
                <p className={`font-semibold ${isThemeMode ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900'}`}>
                  {new Date(session.started_at).toLocaleDateString()} <span className="text-slate-400 text-xs ml-1">{new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Completed</p>
                <p className={`font-semibold ${isThemeMode ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900'}`}>
                  {session.ended_at ? (
                    <>
                      {new Date(session.ended_at).toLocaleDateString()} <span className="text-slate-400 text-xs ml-1">{new Date(session.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </>
                  ) : 'In Progress'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {session.projects?.description && (
            <div className="mb-12">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                Project Scope
              </h2>
              <div className={`text-sm leading-relaxed ${isThemeMode ? 'text-slate-600 dark:text-slate-300' : 'text-slate-600'}`}>
                {session.projects.description}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="mb-12">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">
              Work Summary
            </h2>
            <div className="grid grid-cols-4 gap-6">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {evidence.filter((e) => e.type === 'task').length}
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tasks</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {evidence.filter((e) => e.type === 'commit').length}
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Commits</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {evidence.filter((e) => e.type === 'milestone').length}
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Milestones</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900 mb-1">{evidence.length}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Items</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-8 border-b border-slate-100 pb-2">
              Activity Timeline
            </h2>
            {evidence.length === 0 ? (
              <p className="text-slate-400 italic text-sm text-center py-8">
                No activity recorded for this session.
              </p>
            ) : (
              <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                {evidence.map((entry) => (
                  <div key={entry.id} className="relative flex gap-6 items-start">
                    <div className="absolute left-0 mt-1.5 w-2 h-2 rounded-full bg-slate-200 ring-4 ring-white"></div>

                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs
                            ${entry.type === 'task' ? 'bg-emerald-100 text-emerald-700' :
                              entry.type === 'commit' ? 'bg-blue-100 text-blue-700' :
                                entry.type === 'milestone' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-700'}`}>
                            {getEvidenceIcon(entry.type)}
                          </span>
                          <h3 className="text-sm font-semibold text-slate-900">{entry.title}</h3>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {entry.description && (
                        <div className="ml-9 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">
                          {entry.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-8 print:p-6 text-center text-xs text-slate-400">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            <span>Generated by ValidTrace</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>{profile?.company_name || 'Freelance Report'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
