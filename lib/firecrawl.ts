import FirecrawlApp from '@mendable/firecrawl-js'

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! })

export async function extractContent(url: string): Promise<string> {
  // Firecrawl v1 API: access via the .v1 getter which initializes the instance
  const v1 = (app as any).v1
  const result = await v1.scrapeUrl(url, { formats: ['markdown'] })
  if (!result.success) return ''
  return result.markdown ?? result.data?.markdown ?? ''
}
