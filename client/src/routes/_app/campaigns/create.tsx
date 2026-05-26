import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Send, Users, FileText, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useContactsQuery } from '@/hooks/useContactHooks'
import { useTemplatesQuery } from '@/hooks/useTemplateHooks'
import { useCreateCampaignMutation } from '@/hooks/useCampaignHooks'
import { toast } from 'sonner'
import { Badge } from '#/components/ui/badge'

export const Route = createFileRoute('/_app/campaigns/create')({
  component: CreateCampaignPage,
})

function CreateCampaignPage() {
  const navigate = useNavigate()

  const { data: contacts } = useContactsQuery()
  const { data: templates } = useTemplatesQuery()
  const createMutation = useCreateCampaignMutation()

  const [name, setName] = useState('')
  const [templateId, setTemplateId] = useState<string>('')
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    new Set(),
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked && contacts) {
      setSelectedContacts(new Set(contacts.map((c) => c._id)))
    } else {
      setSelectedContacts(new Set())
    }
  }

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSet = new Set(selectedContacts)
    if (checked) {
      newSet.add(contactId)
    } else {
      newSet.delete(contactId)
    }
    setSelectedContacts(newSet)
  }

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Campaign name is required')
    if (!templateId) return toast.error('Please select a template')
    if (selectedContacts.size === 0)
      return toast.error('Please select at least one contact')

    try {
      await createMutation.mutateAsync({
        name,
        templateId: templateId as any,
        contacts: Array.from(selectedContacts) as any,
      })
      toast.success('Campaign created successfully!')
      navigate({ to: '/campaigns' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to create campaign')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/campaigns">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
              New Campaign
            </h1>
            <p className="text-muted-foreground font-sans">
              Create a targeted outreach sequence.
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="bg-[#4fb8b2] hover:bg-lagoon-deep text-white rounded-xl shadow-lg px-8 font-bold border-none transition-all"
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Create Campaign
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Left Col - Settings */}
        <Card className="md:col-span-1 rounded-2xl border-border shadow-sm bg-card overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground font-sans flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#4fb8b2]" />
                Campaign Name
              </label>
              <Input
                placeholder="e.g. Q4 Executive Follow-up"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-accent/40 border-none rounded-xl h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground font-sans flex items-center gap-2">
                <Send className="h-4 w-4 text-[#4fb8b2]" />
                Message Template
              </label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger className="w-full bg-accent/40 border-none rounded-xl h-12">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}{' '}
                      <span className="text-muted-foreground text-xs ml-2">
                        ({t.type})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Right Col - Contacts */}
        <Card className="md:col-span-2 rounded-2xl border-border shadow-sm bg-card overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-border bg-accent/30 flex justify-between items-center">
            <h3 className="font-bold text-foreground font-sans flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Select Contacts
            </h3>
            <Badge
              variant="outline"
              className="rounded-full bg-background border-border"
            >
              {selectedContacts.size} / {contacts?.length || 0} selected
            </Badge>
          </div>
          <div className="p-4 border-b border-border bg-background flex items-center gap-3">
            <Checkbox
              id="select-all"
              checked={
                contacts &&
                contacts.length > 0 &&
                selectedContacts.size === contacts.length
              }
              onCheckedChange={handleSelectAll}
              className="border-muted-foreground data-[state=checked]:bg-[#4fb8b2]"
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium cursor-pointer"
            >
              Select All
            </label>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {contacts?.map((contact) => (
              <div
                key={contact._id}
                className="p-4 flex items-center gap-4 hover:bg-accent/40 transition-colors"
              >
                <Checkbox
                  id={`contact-${contact._id}`}
                  checked={selectedContacts.has(contact._id)}
                  onCheckedChange={(c) =>
                    handleSelectContact(contact._id, c as boolean)
                  }
                  className="border-muted-foreground data-[state=checked]:bg-[#4fb8b2]"
                />
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <label
                      htmlFor={`contact-${contact._id}`}
                      className="font-medium font-sans cursor-pointer"
                    >
                      {contact.firstName} {contact.lastName}
                    </label>
                    <p className="text-xs text-muted-foreground font-sans">
                      {contact.company || 'No company'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {contact.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!contacts || contacts.length === 0) && (
              <div className="p-12 text-center text-muted-foreground">
                No contacts found. Scan some cards first!
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
