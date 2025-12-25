'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  subscription_tier?: string
}

export default function SubscriptionCard({
  profile,
  projectsCount,
  sessionsThisMonth,
}: {
  profile: Profile
  projectsCount: number
  sessionsThisMonth: number
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const tier = profile?.subscription_tier || 'free'

  const tiers = {
    free: {
      name: 'Free',
      price: '$0/month',
      limits: {
        projects: 5,
        sessions: 10,
      },
      features: ['5 projects', '10 sessions/month', 'Basic reports'],
    },
    pro: {
      name: 'Pro',
      price: '$5/month',
      limits: {
        projects: Infinity,
        sessions: Infinity,
      },
      features: ['Unlimited projects', 'Unlimited sessions', 'PDF exports', 'Full history'],
    },
    enterprise: {
      name: 'Enterprise',
      price: '$15/month',
      limits: {
        projects: Infinity,
        sessions: Infinity,
      },
      features: [
        'Everything in Pro',
        'Priority support',
        'Custom branding',
        'API access',
      ],
    },
  }

  const currentTier = tiers[tier as keyof typeof tiers]

  const handleUpgrade = async (newTier: string) => {
    setLoading(true)

    try {
      if (newTier === 'free') {
        // Handle downgrade or cancellation management
        // Ideally redirect to customer portal
        alert('To manage or cancel your subscription, please check your email for the Lemon Squeezy customer portal link.')
        setLoading(false)
        return
      }

      // Get variant ID from env or hardcoded mapping
      // You should set these in your .env.local file
      const variantIds = {
        pro: process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_PRO,
        enterprise: process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_ENTERPRISE,
      }

      const variantId = variantIds[newTier as keyof typeof variantIds]

      if (!variantId) {
        throw new Error(`Variant ID for ${newTier} is not configured. Please set NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_${newTier.toUpperCase()} in .env`)
      }

      const response = await fetch('/api/lemon/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('Upgrade error:', error)
      alert('Error initiating upgrade: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getUsageColor = (current: number, limit: number) => {
    if (limit === Infinity) return 'text-green-600'
    const percentage = (current / limit) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Subscription & Usage</h2>

      <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{currentTier.name} Plan</h3>
            <p className="text-lg text-slate-600">{currentTier.price}</p>
          </div>
          {tier === 'free' && (
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              Current Plan
            </span>
          )}
          {tier !== 'free' && (
            <span className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
              Active
            </span>
          )}
        </div>

        <div className="space-y-2">
          {currentTier.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-slate-700">
              <span className="text-green-600">✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <h3 className="font-bold text-slate-900">Usage This Month</h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Projects</span>
              <span className={`font-medium ${getUsageColor(projectsCount, currentTier.limits.projects)}`}>
                {projectsCount} / {currentTier.limits.projects === Infinity ? '∞' : currentTier.limits.projects}
              </span>
            </div>
            {currentTier.limits.projects !== Infinity && (
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${projectsCount >= currentTier.limits.projects
                    ? 'bg-red-600'
                    : projectsCount >= currentTier.limits.projects * 0.75
                      ? 'bg-orange-600'
                      : 'bg-green-600'
                    }`}
                  style={{
                    width: `${Math.min((projectsCount / currentTier.limits.projects) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Sessions This Month</span>
              <span className={`font-medium ${getUsageColor(sessionsThisMonth, currentTier.limits.sessions)}`}>
                {sessionsThisMonth} / {currentTier.limits.sessions === Infinity ? '∞' : currentTier.limits.sessions}
              </span>
            </div>
            {currentTier.limits.sessions !== Infinity && (
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${sessionsThisMonth >= currentTier.limits.sessions
                    ? 'bg-red-600'
                    : sessionsThisMonth >= currentTier.limits.sessions * 0.75
                      ? 'bg-orange-600'
                      : 'bg-green-600'
                    }`}
                  style={{
                    width: `${Math.min((sessionsThisMonth / currentTier.limits.sessions) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {tier === 'free' && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              {sessionsThisMonth >= currentTier.limits.sessions
                ? '⚠️ You have reached your monthly session limit. Upgrade to continue tracking.'
                : projectsCount >= currentTier.limits.projects
                  ? '⚠️ You have reached your project limit. Upgrade to create more projects.'
                  : '💡 Upgrade to Pro for unlimited projects and sessions!'}
            </p>
          </div>
        )}
      </div>

      {tier === 'free' && (
        <div className="space-y-3">
          <button
            onClick={() => handleUpgrade('pro')}
            disabled={loading}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upgrade to Pro - $5/month'}
          </button>
          <button
            onClick={() => handleUpgrade('enterprise')}
            disabled={loading}
            className="w-full py-3 px-6 border-2 border-slate-300 text-slate-700 font-medium rounded-lg hover:border-slate-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upgrade to Enterprise - $15/month'}
          </button>
        </div>
      )}

      {tier !== 'free' && (
        <button
          onClick={() => handleUpgrade('free')}
          disabled={loading}
          className="w-full py-3 px-6 border-2 border-slate-300 text-slate-700 font-medium rounded-lg hover:border-slate-400 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Manage Subscription'}
        </button>
      )}
    </div>
  )
}
