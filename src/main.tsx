import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './styles/index.css'

// React Query client with optimized defaults for dashboard
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 60s - data stays fresh for 1 minute
      gcTime: 5 * 60_000, // 5 minutes garbage collection (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      retry: 2, // Retry failed requests twice
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)