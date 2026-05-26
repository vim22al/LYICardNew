import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplateEditor } from '@/components/TemplateEditor'
import type { TemplateFormValues } from '@/components/TemplateEditor'
import {
  useTemplateByIdQuery,
  useUpdateTemplateMutation,
} from '@/hooks/useTemplateHooks'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/templates/$templateId')({
  component: EditTemplatePage,
})

function EditTemplatePage() {
  const { templateId } = Route.useParams()
  const navigate = useNavigate()
  const { data: template, isLoading: isFetching } =
    useTemplateByIdQuery(templateId)
  const updateMutation = useUpdateTemplateMutation()

  const handleUpdate = async (data: FormData) => {
    try {
      await updateMutation.mutateAsync({ id: templateId, data })
      toast.success('Template updated successfully!')
      navigate({ to: '/templates' })
    } catch (error) {
      toast.error('Failed to update template')
      console.error(error)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lagoon"></div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Template not found.</p>
        <Button asChild variant="link">
          <Link to="/templates">Back to templates</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full bg-card border border-border hover:bg-accent transition-colors"
        >
          <Link to="/templates">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Edit Template
          </h1>
        </div>
      </div>

      <TemplateEditor
        initialValues={template}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
      />
    </div>
  )
}
