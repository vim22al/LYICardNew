import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsApi } from '@/api/contacts.api'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'

export const useContactsQuery = (
  params: Record<string, any> = {},
  options = {},
) => {
  const { token } = useAuthStore()

  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => contactsApi.getContacts(token!, params),
    enabled: !!token,
    ...options,
  })
}

export const useSingleContactQuery = (id: string, options = {}) => {
  const { token } = useAuthStore()

  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsApi.getContactById(id, token!),
    enabled: !!token && !!id,
    ...options,
  })
}

export const useUpdateContactMutation = (id: string) => {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => contactsApi.updateContact(id, data, token!),
    onSuccess: () => {
      // Invalidate both the list and the specific contact queries
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['contacts', id] })
    },
  })
}

export const useDeleteContactMutation = () => {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contactsApi.deleteContact(id, token!),
    onSuccess: () => {
      toast.success('Contact deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export const useScanCardMutation = () => {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => contactsApi.scanCard(formData, token!),
    onSuccess: () => {
      toast.success('Extraction started! Your contact will appear shortly.')
      // Invalidate contacts early so they refresh when user goes to contacts page
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export const useSendDefaultEmailMutation = () => {
  const { token } = useAuthStore()

  return useMutation({
    mutationFn: (id: string) => contactsApi.sendDefaultEmail(id, token!),
    onSuccess: (data) => {
      toast.success(data.message || 'Email queued successfully!')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || error.message || 'Failed to send email'
      toast.error(message)
    },
  })
}
