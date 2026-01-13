/**
 * Supabase Integration Module
 *
 * Central export for all Supabase-related functionality.
 * Import from this module for consistent access to Supabase features.
 *
 * @example
 * ```ts
 * import { supabase, useAuth, useRealtimeTable, uploadFile } from '@/lib/supabase'
 * ```
 */

// Client
export { supabase, getSupabase, isSupabaseConfigured, getSupabaseStatus } from './client'

// Types
export type {
  Database,
  Tables,
  InsertTables,
  UpdateTables,
  Transaction,
  SalesData,
  ConsumerData,
  Profile,
  Store,
  UserRole,
  Json,
} from './types'

// Auth
export {
  useAuth,
  useRole,
  useProtectedRoute,
  getCurrentUser,
  getCurrentSession,
  isAuthenticated,
} from './auth'
export type { AuthState, SignUpOptions, SignInOptions } from './auth'

// Realtime
export {
  useRealtimeTable,
  useBroadcast,
  usePresence,
  createRealtimeChannel,
  removeRealtimeChannel,
  getActiveChannels,
  removeAllChannels,
} from './realtime'
export type { RealtimeEvent, RealtimePayload, PresenceState } from './realtime'

// Queries (React Query integration)
export {
  queryKeys,
  useTransactions,
  useTransactionKpis,
  useSalesData,
  useConsumerData,
  useRegions,
  useCities,
  useBarangays,
  useCategories,
  useBrands,
  useSkus,
  useStores,
  useStore,
  useProfile,
  useUpdateProfile,
  useExecuteQuery,
} from './queries'
export type {
  TransactionFilters,
  SalesFilters,
  ConsumerFilters,
  StoreFilters,
  KpiSummary,
} from './queries'

// Storage
export {
  uploadFile,
  uploadFiles,
  downloadFile,
  getPublicUrl,
  getSignedUrl,
  getTransformedImageUrl,
  listFiles,
  deleteFile,
  deleteFiles,
  moveFile,
  copyFile,
  uploadExport,
  uploadAvatar,
  getBucketInfo,
  listBuckets,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_EXPORT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
  MAX_EXPORT_SIZE,
} from './storage'
export type {
  UploadOptions,
  UploadResult,
  ImageTransformOptions,
  ListFilesOptions,
  StorageFile,
} from './storage'

// Re-export commonly used Supabase types
export type {
  User,
  Session,
  AuthError,
  AuthChangeEvent,
  Provider,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
