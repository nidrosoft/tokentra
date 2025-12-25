export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "TokenTRA",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  api: {
    baseUrl: "/api/v1",
    timeout: 30000,
  },
  auth: {
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
  },
  features: {
    smartRouting: process.env.NEXT_PUBLIC_ENABLE_SMART_ROUTING === "true",
    cachingAnalysis: process.env.NEXT_PUBLIC_ENABLE_CACHING_ANALYSIS === "true",
  },
  pagination: {
    defaultPageSize: 50,
    maxPageSize: 100,
  },
  cache: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
} as const;
