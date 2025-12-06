'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Send,
  Trash2,
  Users,
  Mail,
  Eye,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  MoreVertical,
  UserMinus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  getCampaign,
  deleteCampaign,
  sendCampaign,
  removeCampaignRecipient,
  type Campaign,
  type CampaignRecipient,
} from '../actions'

interface PageProps {
  params: Promise<{ id: string }>
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string
  value: number | string
  icon: typeof Users
  description?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function RecipientStatusBadge({ status }: { status: CampaignRecipient['status'] }) {
  const variants: Record<CampaignRecipient['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
    pending: { variant: 'secondary', icon: Clock },
    sent: { variant: 'outline', icon: Mail },
    failed: { variant: 'destructive', icon: XCircle },
    opened: { variant: 'default', icon: Eye },
    replied: { variant: 'default', icon: MessageSquare },
  }

  const { variant, icon: Icon } = variants[status]

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export default function CampaignDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([])
  const [stats, setStats] = useState({ total: 0, sent: 0, opened: 0, replied: 0, failed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sendResult, setSendResult] = useState<{ sentCount: number; failedCount: number } | null>(null)
  const [campaignId, setCampaignId] = useState<string | null>(null)

  // Unwrap params
  useEffect(() => {
    params.then((p) => setCampaignId(p.id))
  }, [params])

  // Load campaign data
  useEffect(() => {
    if (!campaignId) return

    async function loadCampaign() {
      setLoading(true)
      const data = await getCampaign(campaignId!)
      if (data.campaign) {
        setCampaign(data.campaign)
        setRecipients(data.recipients)
        setStats(data.stats)
      } else {
        setError('Campaign not found')
      }
      setLoading(false)
    }

    loadCampaign()
  }, [campaignId])

  const handleDelete = () => {
    if (!campaignId) return
    startTransition(async () => {
      const result = await deleteCampaign(campaignId)
      if (result.success) {
        router.push('/recruiter/campaigns')
      } else {
        setError(result.error || 'Failed to delete campaign')
      }
    })
  }

  const handleSend = () => {
    if (!campaignId) return
    startTransition(async () => {
      setError(null)
      setSendResult(null)
      const result = await sendCampaign(campaignId)
      if (result.success) {
        setSendResult({ sentCount: result.sentCount || 0, failedCount: result.failedCount || 0 })
        // Reload campaign data
        const data = await getCampaign(campaignId)
        if (data.campaign) {
          setCampaign(data.campaign)
          setRecipients(data.recipients)
          setStats(data.stats)
        }
      } else {
        setError(result.error || 'Failed to send campaign')
      }
    })
  }

  const handleRemoveRecipient = (recipientId: string) => {
    if (!campaignId) return
    startTransition(async () => {
      const result = await removeCampaignRecipient(campaignId, recipientId)
      if (result.success) {
        setRecipients(prev => prev.filter(r => r.id !== recipientId))
        setStats(prev => ({ ...prev, total: prev.total - 1 }))
      } else {
        setError(result.error || 'Failed to remove recipient')
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/recruiter/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Campaign Not Found</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!campaign) return null

  const openRate = stats.sent > 0 ? Math.round((stats.opened / stats.sent) * 100) : 0
  const replyRate = stats.sent > 0 ? Math.round((stats.replied / stats.sent) * 100) : 0
  const isDraft = campaign.status === 'draft'
  const isSent = campaign.status === 'sent'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/recruiter/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">{campaign.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              campaign.status === 'draft' ? 'secondary' :
              campaign.status === 'sent' ? 'default' :
              campaign.status === 'sending' ? 'default' :
              'outline'
            }
          >
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </Badge>

          {isDraft && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isPending || stats.total === 0}>
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send Campaign
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Send Campaign?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will send your message to {stats.total} recipient{stats.total !== 1 ? 's' : ''}.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSend}>
                      Send Campaign
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" disabled={isPending}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this campaign and all its recipients.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {sendResult && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Campaign sent! {sendResult.sentCount} message{sendResult.sentCount !== 1 ? 's' : ''} delivered
            {sendResult.failedCount > 0 && `, ${sendResult.failedCount} failed`}.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Recipients"
          value={stats.total}
          icon={Users}
        />
        <StatCard
          title="Messages Sent"
          value={stats.sent}
          icon={Mail}
          description={isSent ? `${stats.failed} failed` : undefined}
        />
        <StatCard
          title="Open Rate"
          value={isSent ? `${openRate}%` : '-'}
          icon={Eye}
          description={isSent ? `${stats.opened} opened` : 'Send to see stats'}
        />
        <StatCard
          title="Reply Rate"
          value={isSent ? `${replyRate}%` : '-'}
          icon={MessageSquare}
          description={isSent ? `${stats.replied} replied` : 'Send to see stats'}
        />
      </div>

      {/* Message Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Message Template</CardTitle>
          <CardDescription>
            Template variables will be replaced with each recipient&apos;s information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md font-mono">
            {campaign.message_template}
          </div>
        </CardContent>
      </Card>

      {/* Recipients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recipients ({recipients.length})
          </CardTitle>
          <CardDescription>
            {isDraft
              ? 'Candidates who will receive this campaign'
              : 'Campaign recipients and their status'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recipients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recipients added yet. Go back and add some candidates.
            </div>
          ) : (
            <div className="divide-y">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{recipient.candidate?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {recipient.candidate?.school_name}
                        {recipient.candidate?.graduation_year && ` · ${recipient.candidate.graduation_year}`}
                        {recipient.candidate?.major && ` · ${recipient.candidate.major}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <RecipientStatusBadge status={recipient.status} />

                    {isDraft && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRemoveRecipient(recipient.id)}
                            className="text-destructive"
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {recipient.status === 'replied' && recipient.candidate && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/messages`}>
                          View Reply
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {new Date(campaign.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {campaign.sent_at && (
              <div>
                <p className="text-sm font-medium">Sent</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(campaign.sent_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>

          {campaign.filters && Object.keys(campaign.filters).length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Filters Used</p>
              <div className="flex flex-wrap gap-2">
                {campaign.filters.schools && campaign.filters.schools.length > 0 && (
                  <Badge variant="outline">
                    Schools: {campaign.filters.schools.join(', ')}
                  </Badge>
                )}
                {campaign.filters.graduationYears && campaign.filters.graduationYears.length > 0 && (
                  <Badge variant="outline">
                    Years: {campaign.filters.graduationYears.join(', ')}
                  </Badge>
                )}
                {campaign.filters.minGpa && (
                  <Badge variant="outline">
                    Min GPA: {campaign.filters.minGpa}
                  </Badge>
                )}
                {campaign.filters.majors && campaign.filters.majors.length > 0 && (
                  <Badge variant="outline">
                    Majors: {campaign.filters.majors.join(', ')}
                  </Badge>
                )}
                {campaign.filters.targetRoles && campaign.filters.targetRoles.length > 0 && (
                  <Badge variant="outline">
                    Roles: {campaign.filters.targetRoles.join(', ')}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
