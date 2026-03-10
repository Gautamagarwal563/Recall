import { NextRequest, NextResponse } from 'next/server'
import { extractContent } from '@/lib/firecrawl'
import { generateSummaryAndTags, generateImageTagsAndSummary } from '@/lib/anthropic'

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'That doesn\'t look like a valid URL' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ error: 'URL must start with http or https' }, { status: 400 })
  }

  const domain = parsed.hostname.replace('www.', '')
  const favicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`

  try {
    if (IMAGE_EXT.test(parsed.pathname)) {
      const { summary, tags } = await generateImageTagsAndSummary(url, url)
      return NextResponse.json({
        type: 'image',
        title: `Image from ${domain}`,
        domain,
        favicon,
        imageUrl: url,
        summary,
        tags,
      })
    }

    const fullContent = await extractContent(url)
    if (!fullContent) {
      return NextResponse.json({ error: 'Couldn\'t read that page — it may be paywalled or bot-protected' }, { status: 422 })
    }

    const titleGuess = domain
    const { summary, tags } = await generateSummaryAndTags(titleGuess, fullContent, url)

    // Try to extract a better title from the content
    const titleMatch = fullContent.match(/^#\s+(.+)/m)
    const title = titleMatch ? titleMatch[1].trim() : `Article from ${domain}`

    return NextResponse.json({
      type: 'page',
      title,
      domain,
      favicon,
      summary,
      tags,
    })
  } catch (err) {
    console.error('Demo save error:', err)
    return NextResponse.json({ error: 'Failed to process that URL — try another one' }, { status: 500 })
  }
}
