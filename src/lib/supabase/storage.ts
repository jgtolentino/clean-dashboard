/**
 * Supabase Storage Utilities
 *
 * Provides functions for file upload, download, and management.
 * Includes image transformation and signed URL generation.
 *
 * @see https://supabase.com/docs/guides/storage
 */

import { supabase } from './client'

// Default bucket for dashboard assets
const DEFAULT_BUCKET = 'dashboard-assets'

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/csv', 'application/json']
export const ALLOWED_EXPORT_TYPES = ['image/png', 'application/pdf', 'text/csv']

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_EXPORT_SIZE = 50 * 1024 * 1024 // 50MB

export interface UploadOptions {
  bucket?: string
  path?: string
  cacheControl?: string
  upsert?: boolean
  contentType?: string
}

export interface UploadResult {
  path: string
  fullPath: string
  publicUrl: string | null
}

/**
 * Upload a file to Supabase Storage
 *
 * @example
 * ```ts
 * const result = await uploadFile(file, {
 *   bucket: 'avatars',
 *   path: `users/${userId}/avatar.png`
 * })
 * ```
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    bucket = DEFAULT_BUCKET,
    path = `${Date.now()}-${file.name}`,
    cacheControl = '3600',
    upsert = false,
    contentType,
  } = options

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl,
    upsert,
    contentType: contentType || file.type,
  })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return {
    path: data.path,
    fullPath: data.fullPath || `${bucket}/${data.path}`,
    publicUrl: urlData.publicUrl,
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map((file) => uploadFile(file, options))
  )
  return results
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFile(
  path: string,
  bucket: string = DEFAULT_BUCKET
): Promise<Blob> {
  const { data, error } = await supabase.storage.from(bucket).download(path)

  if (error) {
    throw new Error(`Download failed: ${error.message}`)
  }

  return data
}

/**
 * Get a public URL for a file
 */
export function getPublicUrl(
  path: string,
  bucket: string = DEFAULT_BUCKET
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get a signed URL for temporary access to a private file
 *
 * @param path - Path to the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600,
  bucket: string = DEFAULT_BUCKET
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Get a transformed image URL
 *
 * @example
 * ```ts
 * const url = getTransformedImageUrl('photos/image.jpg', {
 *   width: 200,
 *   height: 200,
 *   resize: 'cover'
 * })
 * ```
 */
export interface ImageTransformOptions {
  width?: number
  height?: number
  resize?: 'cover' | 'contain' | 'fill'
  format?: 'origin' | 'webp'
  quality?: number
}

export function getTransformedImageUrl(
  path: string,
  transform: ImageTransformOptions,
  bucket: string = DEFAULT_BUCKET
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform,
  })
  return data.publicUrl
}

/**
 * List files in a bucket/folder
 */
export interface ListFilesOptions {
  limit?: number
  offset?: number
  sortBy?: { column: 'name' | 'created_at' | 'updated_at'; order: 'asc' | 'desc' }
  search?: string
}

export interface StorageFile {
  name: string
  id: string | null
  updated_at: string | null
  created_at: string | null
  last_accessed_at: string | null
  metadata: Record<string, any> | null
}

export async function listFiles(
  folder: string = '',
  options: ListFilesOptions = {},
  bucket: string = DEFAULT_BUCKET
): Promise<StorageFile[]> {
  const {
    limit = 100,
    offset = 0,
    sortBy = { column: 'name', order: 'asc' },
    search,
  } = options

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit,
    offset,
    sortBy,
    search,
  })

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data || []
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  path: string,
  bucket: string = DEFAULT_BUCKET
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Delete multiple files
 */
export async function deleteFiles(
  paths: string[],
  bucket: string = DEFAULT_BUCKET
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove(paths)

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Move/rename a file
 */
export async function moveFile(
  fromPath: string,
  toPath: string,
  bucket: string = DEFAULT_BUCKET
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).move(fromPath, toPath)

  if (error) {
    throw new Error(`Move failed: ${error.message}`)
  }
}

/**
 * Copy a file
 */
export async function copyFile(
  fromPath: string,
  toPath: string,
  bucket: string = DEFAULT_BUCKET
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).copy(fromPath, toPath)

  if (error) {
    throw new Error(`Copy failed: ${error.message}`)
  }
}

/**
 * Upload a dashboard export (chart image, PDF report, etc.)
 */
export async function uploadExport(
  file: Blob,
  filename: string,
  type: 'chart' | 'report' | 'data'
): Promise<UploadResult> {
  const folder = `exports/${type}s`
  const timestamp = Date.now()
  const path = `${folder}/${timestamp}-${filename}`

  const fileObj = new File([file], filename, { type: file.type })

  return uploadFile(fileObj, {
    bucket: DEFAULT_BUCKET,
    path,
    upsert: false,
  })
}

/**
 * Upload a user avatar
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an image (PNG, JPEG, GIF, or WebP)')
  }

  // Validate file size
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB')
  }

  const ext = file.name.split('.').pop() || 'png'
  const path = `avatars/${userId}/avatar.${ext}`

  return uploadFile(file, {
    bucket: DEFAULT_BUCKET,
    path,
    upsert: true,
    cacheControl: '86400', // 24 hours
  })
}

/**
 * Get bucket info
 */
export async function getBucketInfo(bucket: string = DEFAULT_BUCKET) {
  const { data, error } = await supabase.storage.getBucket(bucket)

  if (error) {
    throw new Error(`Failed to get bucket info: ${error.message}`)
  }

  return data
}

/**
 * List all buckets
 */
export async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets()

  if (error) {
    throw new Error(`Failed to list buckets: ${error.message}`)
  }

  return data
}
