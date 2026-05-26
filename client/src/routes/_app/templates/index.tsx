import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Plus,
  Search,
  Mail,
  MessageSquare,
  MoreVertical,
  Copy,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import {
  useTemplatesQuery,
  useDeleteTemplateMutation,
} from '@/hooks/useTemplateHooks'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/templates/')({
  component: TemplatesPage,
})

function TemplatesPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')

  const { data: templates, isLoading } = useTemplatesQuery({
    search: search.length > 2 ? search : undefined,
    type: type !== 'all' ? type : undefined,
  })

  const deleteMutation = useDeleteTemplateMutation()

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success('Template deleted successfully')
      } catch (error) {
        toast.error('Failed to delete template')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            Message Templates
          </h1>
          <p className="text-muted-foreground font-sans">
            Create and manage your outreach templates.
          </p>
        </div>
        <Button
          asChild
          className="bg-[#4fb8b2] hover:bg-lagoon-deep text-white rounded-xl shadow-lg shadow-[#4fb8b2]/20 border-none transition-all"
        >
          <Link to="/templates/create">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10 h-10 bg-card border-border focus-visible:ring-[#4fb8b2]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'email', 'whatsapp'].map((t) => (
            <Badge
              key={t}
              variant={type === t ? 'default' : 'outline'}
              className={`px-3 py-1 cursor-pointer transition-colors capitalize ${type === t ? 'bg-[#4fb8b2] text-white hover:bg-lagoon-deep' : 'bg-card hover:bg-accent border-border'}`}
              onClick={() => setType(t)}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-accent/20 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : templates?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-dashed border-border">
          <Mail className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">
            No templates found.
          </p>
          <Button variant="link" asChild className="text-lagoon mt-2">
            <Link to="/templates/create">Create your first template</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <Card
              key={template._id}
              className="p-0 gap-0 rounded-2xl border-border shadow-sm hover:shadow-md transition-all group overflow-hidden bg-card flex flex-col h-full"
            >
              <CardHeader className="bg-accent/30 flex flex-row items-center justify-between py-4 shrink-0">
                <div className="flex items-center gap-2">
                  {template.type === 'email' ? (
                    <Mail className="h-4 w-4 text-[#4fb8b2]" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-green-500" />
                  )}
                  <CardTitle className="text-md font-bold text-foreground font-sans truncate max-w-[150px]">
                    {template.name}
                  </CardTitle>
                  {template.isDefault && (
                    <Badge
                      variant="secondary"
                      className="bg-[#4fb8b2]/10 text-[#4fb8b2] border-[#4fb8b2]/20 text-[10px] h-5 py-0 px-1.5"
                    >
                      Default
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4 pb-4 flex flex-col flex-1">
                <div className="text-sm text-muted-foreground italic line-clamp-2 font-sans overflow-hidden mb-4">
                  {template.body
                    ?.replace(/<[^>]*>?/gm, '')
                    .replace(/&nbsp;/g, ' ') || 'No content...'}
                </div>
                <div className="mt-auto">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    Updated {formatDistanceToNow(new Date(template.updatedAt))}{' '}
                    ago
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-accent/10 border-t border-border py-3 flex gap-2 shrink-0">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-muted-foreground hover:text-[#4fb8b2] hover:bg-[#4fb8b2]/10 h-8 rounded-lg transition-colors"
                >
                  <Link
                    to="/templates/$templateId"
                    params={{ templateId: template._id }}
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 rounded-lg transition-colors"
                  onClick={() => handleDelete(template._id)}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
