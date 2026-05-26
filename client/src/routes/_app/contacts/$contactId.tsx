import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  useSingleContactQuery,
  useDeleteContactMutation,
} from '@/hooks/useContactHooks'
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  Briefcase,
  ChevronLeft,
  Trash2,
  Edit3,
  ExternalLink,
  Calendar,
  ShieldCheck,
  MoreVertical,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/_app/contacts/$contactId')({
  component: ContactDetailsPage,
})

function ContactDetailsPage() {
  const { contactId } = Route.useParams()
  const navigate = useNavigate()
  const { data: contact, isLoading, isError } = useSingleContactQuery(contactId)
  const deleteMutation = useDeleteContactMutation()

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${contact?.name}?`)) {
      try {
        await deleteMutation.mutateAsync(contactId)
        navigate({ to: '/contacts' })
      } catch (err) {}
    }
  }

  if (isLoading) return <LoadingSkeleton />
  if (isError || !contact) return <ErrorView />

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 md:px-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="rounded-xl gap-2 hover:bg-accent/50 -ml-2"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Contacts
        </Button>

        <div className="flex items-center gap-3">
          <Link to="/extracted/$contactId" params={{ contactId }}>
            <Button
              variant="outline"
              className="rounded-xl gap-2 border-border shadow-sm"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-border"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-48">
              <DropdownMenuItem className="gap-2 px-3 py-2">
                <Download className="h-4 w-4" /> Export VCard
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 px-3 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" /> Delete Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Hero section */}
      <div className="bg-card/30 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-primary/5">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] border-4 border-background shadow-2xl">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-[#4fb8b2] to-[#2a7a76] text-white text-5xl font-black">
              {contact.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground font-sans uppercase">
                  {contact.name}
                </h1>
                <Badge className="bg-green-500/10 text-green-500 border-none font-bold uppercase tracking-widest text-[10px] px-3">
                  {contact.status}
                </Badge>
              </div>
              <p className="text-xl md:text-2xl font-semibold text-[#4fb8b2] font-sans">
                {contact.title || 'Professional'} @{' '}
                {contact.company || 'Private'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-muted-foreground bg-background/50 px-4 py-2 rounded-2xl border border-border/50 text-sm font-medium">
                <Calendar className="h-4 w-4 text-[#4fb8b2]" />
                Added{' '}
                {new Date(contact.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground bg-background/50 px-4 py-2 rounded-2xl border border-border/50 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 text-[#4fb8b2]" />
                Identity Verified
              </div>
            </div>

            <div className="flex gap-3 justify-center md:justify-start pt-2">
              {contact.email && (
                <Button
                  className="rounded-2xl bg-[#4fb8b2] hover:bg-lagoon-deep text-white font-bold px-6 shadow-lg shadow-[#4fb8b2]/20 border-none h-12"
                  asChild
                >
                  <a href={`mailto:${contact.email}`}>Email Now</a>
                </Button>
              )}
              {contact.phone && (
                <Button
                  variant="outline"
                  className="rounded-2xl border-border h-12 font-bold px-6 shadow-sm"
                  asChild
                >
                  <a href={`tel:${contact.phone}`}>Call</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-border shadow-xl bg-card/40 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-[#4fb8b2]" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-8 pt-6">
              <InfoItem
                icon={Mail}
                label="Email Address"
                value={contact.email}
                link={`mailto:${contact.email}`}
              />
              <InfoItem
                icon={Phone}
                label="Phone Number"
                value={contact.phone}
                link={`tel:${contact.phone}`}
              />
              <InfoItem
                icon={Building2}
                label="Company"
                value={contact.company}
              />
              <InfoItem
                icon={Briefcase}
                label="Job Title"
                value={contact.title}
              />
              <InfoItem
                icon={Globe}
                label="Website"
                value={contact.website}
                link={contact.website}
              />
              <InfoItem
                icon={MapPin}
                label="Office Address"
                value={contact.address}
              />
            </CardContent>
          </Card>

          {/* Additional Details */}
          {contact.additionalDetails &&
            Object.keys(contact.additionalDetails).length > 0 && (
              <Card className="rounded-[2.5rem] border-border border-dashed bg-accent/5 backdrop-blur-sm shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Additional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {Object.entries(contact.additionalDetails).map(
                      ([key, value]) => (
                        <div key={key} className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            {key}
                          </p>
                          <p className="font-sans font-bold text-foreground/90">
                            {value as string}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Card Image column */}
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-border shadow-2xl bg-card overflow-hidden h-fit sticky top-8">
            <CardHeader className="bg-accent/40 py-4 px-6 border-b border-border">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                Source Document
                <ExternalLink className="h-3 w-3" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-zinc-950 flex items-center justify-center min-h-[300px]">
              {contact.rawImage ? (
                <img
                  src={contact.rawImage}
                  alt="Original Scan"
                  className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                  <User className="h-12 w-12" />
                  <p className="text-xs uppercase font-bold tracking-widest">
                    No Image Available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#4fb8b2]/10 to-transparent border border-[#4fb8b2]/20">
            <h4 className="font-black text-sm uppercase tracking-widest mb-2 text-[#4fb8b2]">
              AI Insight
            </h4>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed italic">
              "This contact was parsed with high confidence from a standard
              landscape business card."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value, link }: any) {
  if (!value) return null

  return (
    <div className="space-y-2 group">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[#4fb8b2] transition-colors">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      {link ? (
        <a
          href={link.startsWith('http') ? link : link}
          target={link.startsWith('http') ? '_blank' : undefined}
          className="text-lg font-bold text-foreground/90 hover:text-[#4fb8b2] transition-colors font-sans block truncate"
        >
          {value}
        </a>
      ) : (
        <p className="text-lg font-bold text-foreground/90 font-sans truncate">
          {value}
        </p>
      )}
      <Separator className="bg-border/40 group-hover:bg-[#4fb8b2]/30 transition-colors" />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-10">
      <Skeleton className="h-40 w-full rounded-[2.5rem]" />
      <div className="grid grid-cols-3 gap-8">
        <Skeleton className="col-span-2 h-[400px] rounded-[2.5rem]" />
        <Skeleton className="h-[400px] rounded-[2.5rem]" />
      </div>
    </div>
  )
}

function ErrorView() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <User className="h-16 w-16 text-muted-foreground/20" />
      <h2 className="text-2xl font-black font-sans uppercase tracking-widest text-foreground">
        Contact not found
      </h2>
      <Button
        onClick={() => window.history.back()}
        variant="outline"
        className="rounded-xl"
      >
        Go Back
      </Button>
    </div>
  )
}
