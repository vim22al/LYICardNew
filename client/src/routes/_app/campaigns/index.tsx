import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Send,
  TrendingUp,
  Users,
  Calendar,
  ArrowUpRight,
  Loader2,
  Play,
  CheckCircle2,
  Clock,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  useCampaignsQuery,
  useDeleteCampaignMutation,
  useSendCampaignMutation,
} from '@/hooks/useCampaignHooks'

export const Route = createFileRoute('/_app/campaigns/')({
  component: CampaignsPage,
})

function CampaignsPage() {
  const { data: campaigns, isLoading } = useCampaignsQuery()
  const deleteMutation = useDeleteCampaignMutation()
  const sendMutation = useSendCampaignMutation()

  const activeCampaigns = campaigns || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            Campaigns
          </h1>
          <p className="text-muted-foreground font-sans">
            Track and manage your automated outreach efforts.
          </p>
        </div>
        <Link to="/campaigns/create">
          <Button className="bg-[#4fb8b2] hover:bg-lagoon-deep text-white rounded-xl shadow-lg shadow-[#4fb8b2]/20 px-8 font-bold border-none transition-all">
            <Send className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            label: 'Total Campaigns',
            value: activeCampaigns.length.toString(),
            icon: Send,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Total Reach',
            value: activeCampaigns
              .reduce((acc, curr) => acc + curr.contacts.length, 0)
              .toString(),
            icon: Users,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
          },
          {
            label: 'Completed',
            value: activeCampaigns
              .filter((c) => c.status === 'completed')
              .length.toString(),
            icon: CheckCircle2,
            color: 'text-[#4fb8b2]',
            bg: 'bg-[#4fb8b2]/10',
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="rounded-2xl border-border shadow-sm bg-card overflow-hidden border-b-4 border-b-[#4fb8b2]/20 transition-all hover:-translate-y-1"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground font-sans">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-foreground font-sans mt-1">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-border bg-accent/30">
          <h3 className="font-bold text-foreground font-sans">All Campaigns</h3>
        </div>
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activeCampaigns.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No campaigns found. Create one to get started!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activeCampaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-accent/40 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center font-bold text-muted-foreground group-hover:bg-card transition-colors">
                    {campaign.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : campaign.status === 'running' ? (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    ) : campaign.status === 'failed' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Link
                      to="/campaigns/$campaignId"
                      params={{ campaignId: campaign._id }}
                    >
                      <h4 className="font-bold text-foreground font-sans group-hover:text-[#4fb8b2] transition-colors cursor-pointer">
                        {campaign.name}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-sans">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {campaign.contacts.length}{' '}
                        contacts
                      </span>
                      <span className="flex items-center gap-1">
                        {campaign.lastSentAt ? (
                          <>
                            Last Sent:{' '}
                            {new Date(campaign.lastSentAt).toLocaleDateString()}
                          </>
                        ) : (
                          <>
                            Created:{' '}
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4 w-24">
                    <Badge
                      variant="outline"
                      className={`rounded-full border-none w-full justify-center ${
                        campaign.status === 'completed'
                          ? 'bg-green-500/10 text-green-500'
                          : campaign.status === 'running'
                            ? 'bg-blue-500/10 text-blue-500'
                            : campaign.status === 'failed'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {campaign.status}
                    </Badge>
                  </div>

                  {['draft', 'completed', 'failed'].includes(
                    campaign.status,
                  ) && (
                    <Button
                      variant="ghost"
                      onClick={() => sendMutation.mutate(campaign._id)}
                      disabled={sendMutation.isPending}
                      className={`rounded-xl ${campaign.status === 'draft' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'}`}
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {campaign.status === 'draft' ? 'Start' : 'Resend'}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Delete campaign?'))
                        deleteMutation.mutate(campaign._id)
                    }}
                    disabled={deleteMutation.isPending}
                    className="h-10 w-10 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
