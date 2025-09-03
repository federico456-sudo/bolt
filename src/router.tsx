import React from 'react'
import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { useAuthStore } from './stores/authStore'
import { RootLayout } from './components/layout/RootLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ChannelPage } from './pages/ChannelPage'
import { ProjectEditionPage } from './pages/ProjectEditionPage'
import { SceneCreationPage } from './pages/SceneCreationPage'
import { VideoPage } from './pages/VideoPage'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: async () => {
    const { user } = useAuthStore.getState()
    if (user) {
      throw redirect({ to: '/' })
    }
  }
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
  beforeLoad: async () => {
    const { user } = useAuthStore.getState()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  }
})

const channelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/canal/$canalId',
  component: ChannelPage,
  beforeLoad: async () => {
    const { user } = useAuthStore.getState()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  }
})

const editionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/canal/$canalId/edicion/$proyectoId',
  component: ProjectEditionPage,
  beforeLoad: async () => {
    const { user } = useAuthStore.getState()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  }
})

const creationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/canal/$canalId/edicion/$proyectoId/creacion/$escenaId',
  component: SceneCreationPage,
  beforeLoad: async () => {
    const { user } = useAuthStore.getState()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  }
})

const videoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/proyecto/$proyectoId/video',
  component: VideoPage,
  beforeLoad: async ({ params }) => {
    const { user } = useAuthStore.getState()
    if (!user) {
      throw redirect({ to: '/login' })
    }

    // Verify all scenes are completed
    const { data: escenas, error } = await supabase
      .from('escenas')
      .select('status')
      .eq('proyecto_id', params.proyectoId)

    if (error || !escenas || escenas.some(escena => escena.status !== 'success')) {
      throw redirect({ to: '/' })
    }
  }
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  channelRoute,
  editionRoute,
  creationRoute,
  videoRoute
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}