'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  UserCheck,
  Copy,
  Check,
  Trash2,
  Gift,
  Share2,
  Loader2
} from 'lucide-react'
import type { ReferralStats, Referral } from '@/app/(portal)/candidate/referral-actions'
import { createReferral, deleteReferral } from '@/app/(portal)/candidate/referral-actions'

interface ReferralsProps {
  referralCode: string
  initialStats: ReferralStats | null
  initialReferrals: Referral[]
}

export function Referrals({ referralCode, initialStats, initialReferrals }: ReferralsProps) {
  const [stats, setStats] = useState(initialStats)
  const [referrals, setReferrals] = useState(initialReferrals)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup/candidate?ref=${referralCode}`

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = referralLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    const result = await createReferral(email.trim().toLowerCase())

    if (result.success) {
      // Add to local state
      const newReferral: Referral = {
        id: crypto.randomUUID(),
        referrer_id: '',
        referred_email: email.trim().toLowerCase(),
        referred_user_id: null,
        status: 'pending',
        signed_up_at: null,
        verified_at: null,
        created_at: new Date().toISOString()
      }
      setReferrals([newReferral, ...referrals])
      setStats(prev => prev ? {
        ...prev,
        total_referrals: prev.total_referrals + 1,
        pending: prev.pending + 1
      } : null)
      setEmail('')
    } else {
      setError(result.error || 'Failed to send invite')
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteReferral(id)

    if (result.success) {
      const deletedReferral = referrals.find(r => r.id === id)
      setReferrals(referrals.filter(r => r.id !== id))
      if (deletedReferral && stats) {
        setStats({
          ...stats,
          total_referrals: stats.total_referrals - 1,
          [deletedReferral.status]: stats[deletedReferral.status] - 1
        })
      }
    }

    setDeletingId(null)
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    signed_up: {
      icon: UserCheck,
      label: 'Signed Up',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/20'
    },
    verified: {
      icon: CheckCircle2,
      label: 'Verified',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20'
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
          <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Invite Classmates</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Grow the network and earn rewards
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">Pending</div>
          </div>
          <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
            <div className="text-2xl font-bold text-blue-600">{stats.signed_up}</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">Signed Up</div>
          </div>
          <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800/50">
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">Verified</div>
          </div>
        </div>
      )}

      {/* Referral Link */}
      <div className="mb-6">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
          Your referral link
        </label>
        <div className="flex gap-2">
          <Input
            value={referralLink}
            readOnly
            className="font-mono text-sm bg-neutral-50 dark:bg-neutral-800/50"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopyLink}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Share this link with classmates. Code: <span className="font-mono font-semibold">{referralCode}</span>
        </p>
      </div>

      {/* Invite by Email */}
      <form onSubmit={handleInvite} className="mb-6">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
          Or invite by email
        </label>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="classmate@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !email.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>

      {/* Referral List */}
      {referrals.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Your Referrals ({referrals.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {referrals.map((referral) => {
              const config = statusConfig[referral.status]
              const StatusIcon = config.icon

              return (
                <div
                  key={referral.id}
                  className="flex items-center justify-between rounded-lg border p-3 dark:border-neutral-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${config.bg}`}>
                      <StatusIcon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {referral.referred_user?.full_name || referral.referred_email}
                      </p>
                      {referral.referred_user && (
                        <p className="text-xs text-neutral-500 truncate">
                          {referral.referred_email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium ${config.color}`}>
                      {config.label}
                    </span>
                    {referral.status === 'pending' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-400 hover:text-red-600"
                        onClick={() => handleDelete(referral.id)}
                        disabled={deletingId === referral.id}
                      >
                        {deletingId === referral.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rewards Info */}
      <div className="mt-6 rounded-lg bg-linear-to-r from-purple-50 to-blue-50 p-4 dark:from-purple-900/10 dark:to-blue-900/10">
        <div className="flex items-start gap-3">
          <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-purple-900 dark:text-purple-100">
              Earn priority verification
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              For every 3 classmates who sign up and verify, you'll receive priority verification status and a verified referrer badge on your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
