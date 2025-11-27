'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Check, X } from 'lucide-react'
import Link from 'next/link'

// Discord brand icon component
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [profile, setProfile] = useState<{
    role: string
    full_name: string
    discord_id: string | null
    discord_username: string | null
    discord_verified_at: string | null
  } | null>(null)

  // Check for connect parameter or success/error states
  const connectParam = searchParams.get('connect')
  const discordStatus = searchParams.get('discord')
  const errorMessage = searchParams.get('message')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, full_name, discord_id, discord_username, discord_verified_at')
        .eq('id', user.id)
        .single()

      setProfile(profileData)
      setLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  // Show toast messages based on URL params
  useEffect(() => {
    if (discordStatus === 'linked') {
      toast.success('Discord account connected successfully!')
      // Clean up URL
      router.replace('/dashboard/settings')
    } else if (discordStatus === 'error') {
      const errorMessages: Record<string, string> = {
        missing_params: 'Discord authorization failed. Please try again.',
        invalid_state: 'Session expired. Please try again.',
        invalid_state_format: 'Authorization failed. Please try again.',
        state_expired: 'Session expired. Please try again.',
        user_mismatch: 'Account mismatch. Please log in and try again.',
        already_linked: 'This Discord account is already linked to another user.',
        update_failed: 'Failed to link account. Please try again.',
        oauth_failed: 'Discord authorization failed. Please try again.',
        access_denied: 'Discord authorization was cancelled.',
      }
      toast.error(errorMessages[errorMessage || ''] || 'Failed to connect Discord account.')
      router.replace('/dashboard/settings')
    }
  }, [discordStatus, errorMessage, router])

  // Auto-redirect to Discord auth if connect=discord
  useEffect(() => {
    if (connectParam === 'discord' && profile && !profile.discord_id && !loading) {
      // Redirect to Discord OAuth
      window.location.href = '/api/discord/auth'
    }
  }, [connectParam, profile, loading])

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      const response = await fetch('/api/discord/unlink', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect Discord')
      }

      toast.success('Discord account disconnected')
      setProfile(prev => prev ? {
        ...prev,
        discord_id: null,
        discord_username: null,
        discord_verified_at: null,
      } : null)
    } catch (err) {
      toast.error('Failed to disconnect Discord account')
    } finally {
      setDisconnecting(false)
    }
  }

  function handleConnect() {
    window.location.href = '/api/discord/auth'
  }

  // Get back link based on role
  const getBackLink = () => {
    switch (profile?.role) {
      case 'recruiter':
        return '/recruiter/settings'
      case 'candidate':
        return '/candidate/edit-profile'
      case 'school_admin':
        return '/school/settings'
      case 'admin':
        return '/admin'
      default:
        return '/'
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={getBackLink()}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your account integrations
          </p>
        </div>
      </div>

      {/* Discord Integration Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[#5865F2] p-3">
            <DiscordIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Discord Integration</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Connect your Discord account to access our community server with verified channels.
            </p>

            {profile?.discord_id ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Connected as {profile.discord_username}
                    </p>
                    {profile.discord_verified_at && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Verified on {new Date(profile.discord_verified_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {disconnecting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    Disconnect Discord
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800 p-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Link your Discord account to:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Access verified-only Discord channels
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Connect with {profile?.role === 'recruiter' ? 'candidates and other recruiters' : 'recruiters and peers'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Get your verified {profile?.role === 'candidate' ? 'Candidate' : profile?.role === 'recruiter' ? 'Recruiter' : 'Career Services'} role
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleConnect}
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                >
                  <DiscordIcon className="mr-2 h-5 w-5" />
                  Connect Discord Account
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-4">
        <h3 className="font-medium text-blue-800 dark:text-blue-200">
          About our Discord Community
        </h3>
        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
          Our Discord server is a private community for verified members of Coastal Haven Partners.
          Connect your account to get access to networking channels, job postings, and industry discussions
          with verified {profile?.role === 'candidate' ? 'recruiters and fellow candidates' : 'candidates and fellow professionals'}.
        </p>
      </div>
    </div>
  )
}
