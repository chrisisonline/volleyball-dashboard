import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      retry: 1,
    },
  },
})

export const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? sessionStorage : undefined,
})
