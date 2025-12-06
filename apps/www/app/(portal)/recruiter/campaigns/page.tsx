import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Send, FileEdit, Clock, CheckCircle2, XCircle, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCampaigns, type CampaignWithStats } from './actions'

function CampaignStatusBadge({ status }: { status: CampaignWithStats['status'] }) {
  const variants: Record<CampaignWithStats['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Send }> = {
    draft: { variant: 'secondary', icon: FileEdit },
    scheduled: { variant: 'outline', icon: Clock },
    sending: { variant: 'default', icon: Send },
    sent: { variant: 'default', icon: CheckCircle2 },
    paused: { variant: 'outline', icon: Pause },
    cancelled: { variant: 'destructive', icon: XCircle },
  }

  const { variant, icon: Icon } = variants[status]

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function CampaignStats({ campaign }: { campaign: CampaignWithStats }) {
  if (campaign.status === 'draft') {
    return (
      <p className="text-sm text-muted-foreground">
        {campaign.total_recipients} recipient{campaign.total_recipients !== 1 ? 's' : ''} selected
      </p>
    )
  }

  const openRate = campaign.sent_count > 0
    ? Math.round((campaign.opened_count / campaign.sent_count) * 100)
    : 0

  const replyRate = campaign.sent_count > 0
    ? Math.round((campaign.replied_count / campaign.sent_count) * 100)
    : 0

  return (
    <div className="flex gap-4 text-sm">
      <span className="text-muted-foreground">
        Sent: <span className="font-medium text-foreground">{campaign.sent_count}</span>
      </span>
      <span className="text-muted-foreground">
        Opened: <span className="font-medium text-foreground">{campaign.opened_count}</span> ({openRate}%)
      </span>
      <span className="text-muted-foreground">
        Replied: <span className="font-medium text-foreground">{campaign.replied_count}</span> ({replyRate}%)
      </span>
      {campaign.failed_count > 0 && (
        <span className="text-destructive">
          Failed: {campaign.failed_count}
        </span>
      )}
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: CampaignWithStats }) {
  const formattedDate = campaign.sent_at
    ? new Date(campaign.sent_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(campaign.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

  return (
    <Link href={`/recruiter/campaigns/${campaign.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{campaign.name}</CardTitle>
              <CardDescription>{campaign.subject}</CardDescription>
            </div>
            <CampaignStatusBadge status={campaign.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <CampaignStats campaign={campaign} />
            <span className="text-xs text-muted-foreground">
              {campaign.sent_at ? 'Sent' : 'Created'} {formattedDate}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

async function CampaignsList() {
  const campaigns = await getCampaigns()

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Send className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No campaigns yet</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Create your first campaign to reach out to multiple candidates at once.
          </p>
          <Button asChild className="mt-4">
            <Link href="/recruiter/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const drafts = campaigns.filter(c => c.status === 'draft')
  const active = campaigns.filter(c => ['scheduled', 'sending'].includes(c.status))
  const completed = campaigns.filter(c => ['sent', 'paused', 'cancelled'].includes(c.status))

  return (
    <div className="space-y-8">
      {drafts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Drafts</h2>
          <div className="grid gap-4">
            {drafts.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active</h2>
          <div className="grid gap-4">
            {active.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Completed</h2>
          <div className="grid gap-4">
            {completed.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Send templated messages to multiple candidates at once
          </p>
        </div>
        <Button asChild>
          <Link href="/recruiter/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      <Suspense fallback={
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-48 bg-muted rounded" />
                <div className="h-4 w-64 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <CampaignsList />
      </Suspense>
    </div>
  )
}
