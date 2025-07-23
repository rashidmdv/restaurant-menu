import { createFileRoute, redirect } from '@tanstack/react-router'
import SignIn from '@/features/auth/sign-in'
import { useAuthStore } from '@/stores/authStore'

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: async () => {
    // If user is already authenticated, redirect to dashboard
    const { auth } = useAuthStore.getState()
    if (auth.accessToken && auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: SignIn,
})
