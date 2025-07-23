import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'sonner'
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
import { useAuthStore } from '@/stores/authStore'
import { AuthService } from '@/services/auth-service'

const profileFormSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: 'Name is required.',
    })
    .max(100, {
      message: 'Name must not be longer than 100 characters.',
    }),
  email: z
    .string({
      required_error: 'Email is required.',
    })
    .email({
      message: 'Please enter a valid email address.',
    }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
  const { auth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: auth.user?.name || '',
      email: auth.user?.email || '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (data: ProfileFormValues) => {
    if (!auth.user) return

    setIsLoading(true)
    try {
      const updatedUser = await AuthService.updateProfile(data)
      auth.setUser(updatedUser)
      toast.success('Profile updated successfully!')
      form.reset(data) // Reset form with new data to clear dirty state
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update profile. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder='Enter your full name' 
                  disabled={isLoading}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                This is your display name. It will be shown in the navigation and other parts of the application.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type='email'
                  placeholder='Enter your email address'
                  disabled={isLoading}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                This email address will be used for notifications and account recovery.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type='submit' 
          disabled={isLoading || !form.formState.isDirty}
          className='w-full sm:w-auto'
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  )
}
