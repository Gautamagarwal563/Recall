import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { extractContent } from '@/lib/firecrawl'
import { generateSummaryAndTags } from '@/lib/anthropic'

export async function GET(req: NextRequest) {
  const userId = await getUserFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const tag = searchParams.get('tag')

  let query = supabase
    .from('saves')
    .select('id, url, title, faviconUrl, summary, tags, status, isRead, createdAt')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })

  if (q) {
    query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%,fullContent.ilike.%${q}%`)
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

  const { url, title } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`

  const { data, error } = await supabase
    .from('saves')
    .insert({ userId, url, title: title || url, faviconUrl, status: 'pending' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Process async — don't await so response is fast
  processAsync(data.id, url, title || url).catch(console.error)

  return NextResponse.json({ id: data.id, status: 'pending' })
}

async function processAsync(saveId: string, url: string, title: string) {
  try {
    const [fullContent] = await Promise.all([extractContent(url)])
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
