import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  useSingleContactQuery,
  useUpdateContactMutation,
  useSendDefaultEmailMutation,
} from '@/hooks/useContactHooks'
import { debounce } from '@/lib/utils'
import {
  Loader2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  CheckCircle2,
  BadgeCheck,
  Briefcase,
  Plus,
  Trash2,
  Info,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_app/extracted/$contactId')({
  component: ExtractedPage,
})

function ExtractedPage() {
  const { contactId } = Route.useParams()
  const [formData, setFormData] = useState<any>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    additionalDetails: {},
  })
  const [isSaving, setIsSaving] = useState(false)
  const isInitialLoad = useRef(true)

  const {
    data: contact,
    isLoading,
    isError,
  } = useSingleContactQuery(contactId, {
    refetchInterval: (query: any) =>
      query.state.data?.status === 'processing' ? 3000 : false,
  })

  const updateMutation = useUpdateContactMutation(contactId)
  const sendEmailMutation = useSendDefaultEmailMutation()

  const handleSendDefaultEmail = async () => {
    try {
      await sendEmailMutation.mutateAsync(contactId)
      window.history.back()
    } catch (error) {
      // Error handled by mutation toast
    }
  }

  useEffect(() => {
    if (contact && isInitialLoad.current) {
      setFormData({
        name: contact.name || '',
        title: contact.title || '',
        company: contact.company || '',
        email: contact.email || '',
        phone: contact.phone || '',
        address: contact.address || '',
        website: contact.website || '',
        additionalDetails: contact.additionalDetails || {},
      })
      if (contact.status === 'completed') {
        isInitialLoad.current = false
      }
    }
  }, [contact])

  const debouncedSave = useCallback(
    debounce(async (data: any) => {
      setIsSaving(true)
      try {
        await updateMutation.mutateAsync(data)
      } finally {
        setIsSaving(false)
      }
    }, 1500),
    [],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)
    if (contact?.status === 'completed') debouncedSave(updatedData)
  }

  const handleAdditionalChange = (key: string, value: string) => {
    const updatedDetails = { ...formData.additionalDetails, [key]: value }
    const updatedData = { ...formData, additionalDetails: updatedDetails }
    setFormData(updatedData)
    if (contact?.status === 'completed') debouncedSave(updatedData)
  }

  const addAdditionalField = () => {
    const newKey = `Field ${Object.keys(formData.additionalDetails).length + 1}`
    handleAdditionalChange(newKey, '')
  }

  const removeAdditionalField = (key: string) => {
    const updatedDetails = { ...formData.additionalDetails }
    delete updatedDetails[key]
    const updatedData = { ...formData, additionalDetails: updatedDetails }
    setFormData(updatedData)
    if (contact?.status === 'completed') debouncedSave(updatedData)
  }

  if (isLoading && isInitialLoad.current) return <LoadingSkeleton />

  if (isError) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <BadgeCheck className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold font-sans">Contact not found</h2>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    )
  }

  const isProcessing = contact?.status === 'processing'

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-foreground font-sans uppercase">
              Review Extraction
            </h1>
            {isProcessing ? (
              <Badge
                variant="secondary"
                className="animate-pulse bg-amber-500/10 text-amber-500 border-amber-500/20"
              >
                Processing...
              </Badge>
            ) : (
              <Badge
                variant="default"
                className="bg-green-500/10 text-green-500 border-green-500/20"
              >
                Completed
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground font-sans">
            Refine the data extracted from the business card.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSaving ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Synced
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Image Preview */}
        <Card className="rounded-3xl border-border bg-card/50 backdrop-blur overflow-hidden shadow-2xl h-fit sticky top-8">
          <CardHeader className="border-b border-border bg-accent/30 py-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Original Card Scan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex items-center justify-center bg-zinc-950 min-h-[300px]">
            {contact?.rawImage ? (
              <img
                src={contact.rawImage}
                alt="Card Scan"
                className="max-h-[500px] w-auto object-contain"
              />
            ) : (
              <Skeleton className="h-[300px] w-full" />
            )}
          </CardContent>
        </Card>

        {/* Right Column: Fields */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-border shadow-xl bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="font-heading font-black text-xl flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-[#4fb8b2]" />
                Primary Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FieldGroup
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={User}
                disabled={isProcessing}
              />
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup
                  label="Job Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  icon={Briefcase}
                  disabled={isProcessing}
                />
                <FieldGroup
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  icon={Building2}
                  disabled={isProcessing}
                />
              </div>
              <FieldGroup
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                disabled={isProcessing}
              />
              <FieldGroup
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
                disabled={isProcessing}
              />
              <FieldGroup
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                icon={Globe}
                disabled={isProcessing}
              />
              <FieldGroup
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                icon={MapPin}
                disabled={isProcessing}
              />
            </CardContent>
          </Card>

          {/* Additional Details Section */}
          <Card className="rounded-3xl border-border shadow-xl bg-card/40 backdrop-blur-sm border-dashed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="font-heading font-black text-xl flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[#4fb8b2]" />
                  Additional Details
                </CardTitle>
                <CardDescription>Extra info found by AI</CardDescription>
              </div>
              <Button
                onClick={addAdditionalField}
                variant="outline"
                size="sm"
                className="rounded-xl border-[#4fb8b2]/30 text-[#4fb8b2] hover:bg-[#4fb8b2] hover:text-white"
                disabled={isProcessing}
              >
                Add Field
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(formData.additionalDetails).length > 0 ? (
                Object.entries(formData.additionalDetails).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="group relative flex gap-3 animate-in slide-in-from-right-2 duration-300"
                    >
                      <div className="flex-1 space-y-1">
                        <Input
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value
                            const updatedDetails = {
                              ...formData.additionalDetails,
                            }
                            delete updatedDetails[key]
                            updatedDetails[newKey] = value
                            setFormData({
                              ...formData,
                              additionalDetails: updatedDetails,
                            })
                            if (contact?.status === 'completed')
                              debouncedSave({
                                ...formData,
                                additionalDetails: updatedDetails,
                              })
                          }}
                          className="h-7 text-[10px] font-black uppercase tracking-widest bg-transparent border-none p-0 focus-visible:ring-0 text-muted-foreground w-fit"
                          disabled={isProcessing}
                        />
                        <div className="relative">
                          <Info className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                          <Input
                            value={value as string}
                            onChange={(e) =>
                              handleAdditionalChange(key, e.target.value)
                            }
                            className="pl-10 h-11 bg-accent/20 border-border focus:ring-[#4fb8b2] rounded-xl font-sans"
                            disabled={isProcessing}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-8 text-muted-foreground hover:text-destructive transition-colors h-11 w-11 rounded-xl"
                        onClick={() => removeAdditionalField(key)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                )
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-border rounded-2xl bg-accent/5">
                  <p className="text-xs text-muted-foreground font-sans">
                    No additional details extracted.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-2xl font-bold font-sans"
              onClick={() => window.history.back()}
            >
              Back
            </Button>
            <Button
              className="flex-[2] h-12 rounded-2xl bg-[#4fb8b2] hover:bg-lagoon-deep text-white font-bold font-sans shadow-lg shadow-[#4fb8b2]/20 transition-all active:scale-[0.98]"
              onClick={handleSendDefaultEmail}
              disabled={
                isProcessing || sendEmailMutation.isPending || !formData.email
              }
            >
              {sendEmailMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Finish and Send Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldGroup({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  disabled,
}: any) {
  return (
    <div className="space-y-2 group">
      <Label
        htmlFor={name}
        className="text-xs font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-[#4fb8b2] transition-colors"
      >
        {label}
      </Label>
      <div className="relative">
        <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-[#4fb8b2] transition-colors" />
        <Input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="pl-10 h-11 bg-accent/20 border-border focus:ring-[#4fb8b2] rounded-xl font-sans"
        />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Skeleton className="h-10 w-[300px]" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="h-[400px] rounded-3xl" />
        <Skeleton className="h-[600px] rounded-3xl" />
      </div>
    </div>
  )
}
