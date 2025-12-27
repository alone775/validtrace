import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <h1 className="text-2xl font-bold text-slate-900">ProofWork</h1>
            </div>
            <div className="flex gap-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-20 text-center">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Evidence-Based Proof of Work
            <br />
            for Freelancers
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Stop relying on screenshots and invasive tracking. Build trust with clients through
            structured evidence and professional reports. Privacy-first, client-shareable proof of work.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-lg font-medium rounded-lg hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>

        <section className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-3xl mb-4">
                🔒
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Privacy-First</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                No screenshots, no keylogging, no invasive monitoring. Track your work with structured
                evidence you control.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-3xl mb-4">
                📊
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Evidence-Based Trust</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Build credibility with timestamped evidence entries, task completions, milestones, and
                detailed work logs.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-3xl mb-4">
                📄
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Professional Reports</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Generate beautiful, shareable proof-of-work reports. Export as PDF or share secure web
                links with clients.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Create Projects</h4>
                <p className="text-sm text-slate-600">Set up projects for each client and track work separately</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Track Sessions</h4>
                <p className="text-sm text-slate-600">Start work sessions with built-in timer and real-time tracking</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Add Evidence</h4>
                <p className="text-sm text-slate-600">Document tasks, commits, milestones, and notes as you work</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Share Reports</h4>
                <p className="text-sm text-slate-600">Generate professional reports and share with clients</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Build Trust with Your Clients?</h3>
            <p className="text-xl mb-8 text-blue-100">
              Join freelancers who are proving their work without compromising privacy
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Start Free Trial
            </Link>
            <p className="text-sm text-blue-200 mt-4">No credit card required • 14-day free trial</p>
          </div>
        </section>

        <section className="py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-8 text-center">Simple Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="border-2 border-slate-200 rounded-xl p-8">
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Free</h4>
                <p className="text-4xl font-bold text-slate-900 mb-4">$0<span className="text-lg text-slate-600">/mo</span></p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-slate-600">5 projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-slate-600">10 sessions/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-slate-600">Basic reports</span>
                  </li>
                </ul>
                <Link
                  href="/auth/signup"
                  className="block w-full py-3 px-6 border-2 border-slate-300 text-slate-700 font-medium rounded-lg text-center hover:border-slate-400 transition-colors"
                >
                  Get Started
                </Link>
              </div>

              <div className="border-2 border-blue-600 rounded-xl p-8 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Pro</h4>
                <p className="text-4xl font-bold text-slate-900 mb-4">$5<span className="text-lg text-slate-600">/mo</span></p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-slate-600">Unlimited projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-slate-600">Unlimited sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-slate-600">PDF exports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-slate-600">Full history</span>
                  </li>
                </ul>
                <Link
                  href="/auth/signup"
                  className="block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-8">
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h4>
                <p className="text-4xl font-bold text-slate-900 mb-4">$15<span className="text-lg text-slate-600">/mo</span></p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-slate-600">Everything in Pro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-slate-600">Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-slate-600">Custom branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-slate-600">API access</span>
                  </li>
                </ul>
                <Link
                  href="/auth/signup"
                  className="block w-full py-3 px-6 border-2 border-slate-300 text-slate-700 font-medium rounded-lg text-center hover:border-slate-400 transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600">
          <p>&copy; {new Date().getFullYear()} ValidTrace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
