import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { extractContent } from '@/lib/firecrawl'
import { generateSummaryAndTags, generateImageTagsAndSummary, generateSnippetTagsAndSummary } from '@/lib/anthropic'

export async function GET(req: NextRequest) {
  const userId = await getUserFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const tag = searchParams.get('tag')
  const type = searchParams.get('type')

  let query = supabase
    .from('saves')
    .select('id, url, title, faviconUrl, summary, tags, status, isRead, createdAt, type, imageUrl, snippet')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%,fullContent.ilike.%${q}%,snippet.ilike.%${q}%`)
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ saves: data })
}

export async function POST(req: NextRequest) {
  const userId = await getUserFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Enforce free tier limit
  const { data: userRecord } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single()

  if (!userRecord?.plan || userRecord.plan === 'free') {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('saves')
      .select('id', { count: 'exact', head: true })
      .eq('userId', userId)
      .gte('createdAt', startOfMonth.toISOString())

    if ((count ?? 0) >= 10) {
      return NextResponse.json(
        { error: 'Free plan limit reached', upgrade: true },
        { status: 403 }
      )
    }
  }

  const body = await req.json()
  const saveType = body.type ?? 'page'

  if (saveType === 'image') {
    const { imageUrl, sourceUrl } = body
    if (!imageUrl || !sourceUrl) {
      return NextResponse.json({ error: 'imageUrl and sourceUrl required' }, { status: 400 })
    }
    // Validate absolute URL (prevents SSRF with relative paths)
    let parsedImage: URL
    try {
      parsedImage = new URL(imageUrl)
    } catch {
      return NextResponse.json({ error: 'imageUrl must be an absolute URL' }, { status: 400 })
    }
    if (!['http:', 'https:'].includes(parsedImage.protocol)) {
      return NextResponse.json({ error: 'imageUrl must use http or https' }, { status: 400 })
    }

    const hostname = new URL(sourceUrl).hostname
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    const title = `Image from ${hostname.replace('www.', '')}`

    const { data, error } = await supabase
      .from('saves')
      .insert({ userId, type: 'image', imageUrl, url: sourceUrl, title, faviconUrl, status: 'pending' })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    processImageAsync(data.id, imageUrl, sourceUrl).catch(console.error)

    return NextResponse.json({ id: data.id, status: 'pending' })
  }

  if (saveType === 'text') {
    const { snippet, sourceUrl } = body
    if (!snippet || !sourceUrl) {
      return NextResponse.json({ error: 'snippet and sourceUrl required' }, { status: 400 })
    }

    const hostname = new URL(sourceUrl).hostname
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    const title = `Selection from ${hostname.replace('www.', '')}`

    const { data, error } = await supabase
      .from('saves')
      .insert({ userId, type: 'text', snippet, url: sourceUrl, title, faviconUrl, status: 'pending' })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    processSnippetAsync(data.id, snippet, sourceUrl).catch(console.error)

    return NextResponse.json({ id: data.id, status: 'pending' })
  }

  // Default: page save
  const { url, title } = body
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`

  const { data, error } = await supabase
    .from('saves')
    .insert({ userId, type: 'page', url, title: title || url, faviconUrl, status: 'pending' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  processPageAsync(data.id, url, title || url).catch(console.error)

  return NextResponse.json({ id: data.id, status: 'pending' })
}

async function processPageAsync(saveId: string, url: string, title: string) {
  try {
    const fullContent = await extractContent(url)
    const { summary, tags } = await generateSummaryAndTags(title, fullContent, url)

    await supabase
      .from('saves')
      .update({ fullContent, summary, tags, status: 'processed' })
      .eq('id', saveId)
  } catch (err) {
    console.error('Processing failed for save', saveId, err)
    await supabase.from('saves').update({ status: 'failed' }).eq('id', saveId)
  }
}

async function processImageAsync(saveId: string, imageUrl: string, sourceUrl: string) {
  try {
    const { summary, tags } = await generateImageTagsAndSummary(imageUrl, sourceUrl)

    await supabase
      .from('saves')
      .update({ summary, tags, status: 'processed' })
      .eq('id', saveId)
  } catch (err) {
    console.error('Processing failed for image save', saveId, err)
    await supabase.from('saves').update({ status: 'failed' }).eq('id', saveId)
  }
}

async function processSnippetAsync(saveId: string, snippet: string, sourceUrl: string) {
  try {
    const { summary, tags } = await generateSnippetTagsAndSummary(snippet, sourceUrl)

    await supabase
      .from('saves')
      .update({ summary, tags, status: 'processed' })
      .eq('id', saveId)
  } catch (err) {
    console.error('Processing failed for snippet save', saveId, err)
    await supabase.from('saves').update({ status: 'failed' }).eq('id', saveId)
  }
}
