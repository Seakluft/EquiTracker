import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EquiTracker',
    short_name: 'EquiTracker',
    description: 'Suivi de séances d\'équitation premium',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#78350f',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
