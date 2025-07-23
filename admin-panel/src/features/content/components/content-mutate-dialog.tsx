import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

import { useContentContext } from '../context/content-context'
import { 
  CreateContentRequest, 
  UpdateContentRequest, 
  createContentSchema,
  updateContentSchema 
} from '../data/schema'
import { CONTENT_SECTION_TYPES } from '../data/schema'

export function ContentMutateDialog() {
  const { 
    selectedContent, 
    mutateDialogOpen, 
    setMutateDialogOpen,
    createContent,
    updateContent 
  } = useContentContext()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!selectedContent

  // Use create schema for new content, update schema for editing
  const form = useForm<CreateContentRequest | UpdateContentRequest>({
    resolver: zodResolver(isEditing ? updateContentSchema : createContentSchema),
    defaultValues: {
      section_name: '',
      title: '',
      content: '',
      image_url: '',
      metadata: {},
      ...(isEditing && { active: true }),
    },
  })

  // Reset form when dialog opens/closes or selected content changes
  useEffect(() => {
    if (mutateDialogOpen) {
      if (selectedContent) {
        // Editing mode - populate form with existing data
        form.reset({
          section_name: selectedContent.section_name,
          title: selectedContent.title,
          content: selectedContent.content,
          image_url: selectedContent.image_url,
          metadata: selectedContent.metadata,
          active: selectedContent.active,
        })
      } else {
        // Create mode - reset to defaults
        form.reset({
          section_name: '',
          title: '',
          content: '',
          image_url: '',
          metadata: {},
        })
      }
    }
  }, [mutateDialogOpen, selectedContent, form])

  const handleSubmit = async (data: CreateContentRequest | UpdateContentRequest) => {
    try {
      setIsSubmitting(true)
      
      if (isEditing && selectedContent) {
        await updateContent(selectedContent.id, data as UpdateContentRequest)
      } else {
        await createContent(data as CreateContentRequest)
      }
    } catch (error) {
      // Error is handled in context
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={mutateDialogOpen} onOpenChange={setMutateDialogOpen}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Content Section' : 'Create Content Section'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the content section details below.'
              : 'Fill in the details to create a new content section.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className='flex-1 overflow-y-auto px-1'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='section_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isEditing} // Don't allow changing section type when editing
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a section type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONTENT_SECTION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {isEditing 
                          ? 'Section type cannot be changed after creation'
                          : 'Choose the type of content section'
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditing && (
                  <FormField
                    control={form.control}
                    name='active'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>Active Status</FormLabel>
                          <FormDescription>
                            Enable or disable this content section
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter section title' {...field} />
                    </FormControl>
                    <FormDescription>
                      The main title for this content section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter the main content text'
                        className='min-h-[120px]'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The main text content for this section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='image_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='https://example.com/image.jpg' 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional image URL for this content section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div>
                <h3 className='text-lg font-medium'>Metadata</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Additional configuration specific to this content section type
                </p>
                {/* TODO: Add dynamic metadata editor based on section type */}
                <div className='text-sm text-muted-foreground italic'>
                  Metadata editor will be available in a future update
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className='mt-6'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setMutateDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Content' : 'Create Content')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}