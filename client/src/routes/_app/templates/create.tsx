import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplateEditor } from '@/components/TemplateEditor'
import type { TemplateFormValues } from '@/components/TemplateEditor'
import { useCreateTemplateMutation } from '@/hooks/useTemplateHooks'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/templates/create')({
  component: CreateTemplatePage,
})

function CreateTemplatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateTemplateMutation()

  const handleSave = async (data: FormData) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success('Template created successfully!')
      navigate({ to: '/templates' })
    } catch (error) {
      toast.error('Failed to create template')
      console.error(error)
    }
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
            Create Template
          </h1>
        </div>
      </div>

      <TemplateEditor
        onSubmit={handleSave}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
