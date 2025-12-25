import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">404 - Page Not Found</h2>
        <p className="text-slate-600 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
