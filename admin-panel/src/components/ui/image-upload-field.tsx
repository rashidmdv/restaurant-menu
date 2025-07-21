import React, { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadFieldProps {
  value?: string
  onChange: (value: string) => void
  onUpload: (file: File) => Promise<{ url: string }>
  label?: string
  accept?: string
  disabled?: boolean
  className?: string
}

export function ImageUploadField({
  value,
  onChange,
  onUpload,
  label = "Image",
  accept = "image/*",
  disabled = false,
  className
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputId = React.useMemo(() => `file-upload-${Math.random().toString(36).substr(2, 9)}`, [])

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    try {
      const result = await onUpload(file)
      onChange(result.url)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const clearImage = () => {
    onChange('')
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}
      
      {/* Image Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-20 w-20 rounded-lg object-cover border border-border"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={clearImage}
            disabled={disabled || isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Drop image here or click to upload</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              <Input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={disabled || isUploading}
                className="sr-only"
                id={fileInputId}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => {
                  const input = document.getElementById(fileInputId) as HTMLInputElement
                  input?.click()
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </>
          )}
        </div>
      </div>

    </div>
  )
}