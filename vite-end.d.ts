/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_CACHE_MAX_AGE: number
  readonly VITE_IMAGEKIT_PUBLIC_KEY: string
  readonly VITE_IMAGEKIT_URL_ENDPOINT: string
  readonly IMAGEKIT_KEY: string
  readonly FIREBASE_SERVICE_ACCOUNT_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
