import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Save, Paperclip, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'
import { toast } from 'sonner'

const templateSchema = z.object({
  name: z.string().min(1, 'Title is required'),
  type: z.enum(['email', 'whatsapp']),
  isDefault: z.boolean(),
  subject: z.string().optional(),
  header: z.string().optional(),
  body: z.string().min(1, 'Content is required'),
  attachments: z.array(z.any()), // Can be existing metadata or new File objects
})

export type TemplateFormValues = z.infer<typeof templateSchema>

interface TemplateEditorProps {
  initialValues?: Partial<TemplateFormValues>
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.rtf',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.jpg',
  '.png',
  '.gif',
  '.bmp',
  '.tiff',
  '.zip',
  '.rar',
]

export function TemplateEditor({
  initialValues,
  onSubmit,
  isLoading,
}: TemplateEditorProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialValues?.name || '',
      type: initialValues?.type || 'email',
      isDefault: initialValues?.isDefault || false,
      subject: initialValues?.subject || '',
      header: initialValues?.header || '',
      body: initialValues?.body || '',
      attachments: initialValues?.attachments || [],
    },
  })

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name || '',
        type: initialValues.type || 'email',
        isDefault: initialValues.isDefault || false,
        subject: initialValues.subject || '',
        header: initialValues.header || '',
        body: initialValues.body || '',
        attachments: initialValues.attachments || [],
      })
    }
  }, [initialValues, reset])

  const type = watch('type')
  const body = watch('body')
  const attachments = watch('attachments')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles: File[] = []

    files.forEach((file) => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`File type ${ext} is not supported`)
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 10MB limit`)
        return
      }
      validFiles.push(file)
    })

    if (validFiles.length > 0) {
      setValue('attachments', [...attachments, ...validFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setValue(
      'attachments',
      attachments.filter((_, i) => i !== index),
    )
  }

  const onInternalSubmit = (values: TemplateFormValues) => {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('type', values.type)
    formData.append('isDefault', values.isDefault ? 'true' : 'false')
    if (values.subject) formData.append('subject', values.subject)
    if (values.header) formData.append('header', values.header)
    formData.append('body', values.body)

    // Separate new files from existing attachments
    values.attachments.forEach((att) => {
      if (att instanceof File) {
        formData.append('files', att)
      } else if (att._id) {
        // This is an existing attachment from the backend
        formData.append('existingAttachmentIds', att._id)
      }
    })

    onSubmit(formData)
  }

  const insertVariable = (variable: string) => {
    const currentBody = body || ''
    setValue('body', currentBody + ` {{${variable}}}`)
  }

  return (
    <form onSubmit={handleSubmit(onInternalSubmit)} className="space-y-6">
      <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card">
        <Tabs defaultValue="edit" className="w-full">
          <CardHeader className="p-6 border-b border-border bg-accent/30 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground">
              Template Editor
            </CardTitle>
            <TabsList className="bg-muted/50 rounded-xl p-1">
              <TabsTrigger
                value="edit"
                className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 shadow-sm"
              >
                Edit
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 shadow-sm"
              >
                Preview
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="edit">
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">
                      Template Name
                    </label>
                    <Input
                      {...register('name')}
                      placeholder="e.g. Intro Networking"
                      className="bg-accent border-none focus-visible:ring-[#4fb8b2] h-11 rounded-xl"
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">
                      Channel
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={type === 'email' ? 'default' : 'outline'}
                        onClick={() => setValue('type', 'email')}
                        className={`flex-1 rounded-xl transition-all ${type === 'email' ? 'bg-[#4fb8b2] text-white' : 'border-border hover:bg-accent'}`}
                      >
                        Email
                      </Button>
                      <Button
                        type="button"
                        variant={type === 'whatsapp' ? 'default' : 'outline'}
                        onClick={() => setValue('type', 'whatsapp')}
                        className={`flex-1 rounded-xl transition-all ${type === 'whatsapp' ? 'bg-green-500 text-white' : 'border-border hover:bg-accent'}`}
                      >
                        WhatsApp
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-accent/50 p-3 rounded-xl border border-border/50">
                    <Controller
                      name="isDefault"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="isDefault"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-[#4fb8b2] data-[state=checked]:bg-[#4fb8b2]"
                        />
                      )}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="isDefault"
                        className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Set as default template
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        This template will be selected by default for new
                        campaigns.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {type === 'email' && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">
                        Email Subject
                      </label>
                      <Input
                        {...register('subject')}
                        placeholder="Hello from LYICard!"
                        className="bg-accent border-none focus-visible:ring-[#4fb8b2] h-11 rounded-xl"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">
                      Custom Header
                    </label>
                    <Input
                      {...register('header')}
                      placeholder="Optional banner text or title"
                      className="bg-accent border-none focus-visible:ring-[#4fb8b2] h-11 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground">
                    Message Content
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['name', 'company', 'title', 'email'].map((field) => (
                      <Badge
                        key={field}
                        variant="secondary"
                        className="cursor-pointer hover:bg-lagoon hover:text-white transition-colors text-[10px] py-0 px-2"
                        onClick={() => insertVariable(field)}
                      >
                        {`{{${field}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-border">
                  <Controller<TemplateFormValues>
                    name="body"
                    control={control}
                    render={({ field }) => (
                      <ReactQuill
                        theme="snow"
                        value={(field.value as string) || ''}
                        onChange={field.onChange}
                        className="bg-card min-h-[250px]"
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['link', 'clean'],
                          ],
                        }}
                      />
                    )}
                  />
                </div>
                {errors.body && (
                  <p className="text-xs text-destructive">
                    {errors.body.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">
                  Attachments (Max 10MB)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept={ALLOWED_EXTENSIONS.join(',')}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full h-11 px-4 bg-accent/50 border border-dashed border-border rounded-xl cursor-pointer hover:bg-accent transition-all text-sm text-muted-foreground"
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Select local files...
                    </label>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {attachments.map((att, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="flex items-center gap-2 py-1.5 px-3 bg-[#4fb8b2]/5 border-[#4fb8b2]/20 text-[#4fb8b2]"
                    >
                      <Paperclip className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">
                        {att instanceof File
                          ? att.name
                          : att.filename || 'Attachment'}
                      </span>
                      {att instanceof File && (
                        <span className="text-[10px] opacity-60">
                          ({(att.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      )}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeAttachment(i)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-[#4fb8b2] font-bold hover:bg-[#4fb8b2]/10 rounded-xl transition-colors"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Writing Assistant
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#4fb8b2] hover:bg-lagoon-deep text-white rounded-xl px-10 shadow-lg shadow-[#4fb8b2]/20 border-none transition-all"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="preview">
            <CardContent className="p-8">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="bg-accent/20 rounded-2xl p-6 border border-border shadow-inner min-h-[400px]">
                  {watch('header') && (
                    <div className="border-b border-border pb-4 mb-4 text-xs font-bold uppercase tracking-widest text-[#4fb8b2]">
                      {watch('header')}
                    </div>
                  )}
                  {type === 'email' && watch('subject') && (
                    <div className="mb-6">
                      <span className="text-xs text-muted-foreground font-bold uppercase">
                        Subject:
                      </span>
                      <h3 className="text-lg font-bold">{watch('subject')}</h3>
                    </div>
                  )}
                  <div
                    className="prose dark:prose-invert prose-lagoon max-w-none"
                    dangerouslySetInnerHTML={{
                      __html:
                        body ||
                        '<p class="text-muted-foreground italic">Add some content to see a preview...</p>',
                    }}
                  />
                  {attachments.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
                        Attachments:
                      </p>
                      <div className="space-y-1">
                        {attachments.map((att, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-lagoon font-sans"
                          >
                            <Paperclip className="h-3 w-3" />
                            {att instanceof File
                              ? att.name
                              : att.filename || 'Attachment'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-center text-[10px] text-muted-foreground italic">
                  This is a preview. Variables like {'{{name}}'} will be
                  replaced with recipient data when sending.
                </p>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </form>
  )
}
