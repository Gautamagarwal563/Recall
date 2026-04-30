import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { generateScreenshotSummary } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  const userId = await getUserFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
      return NextResponse.json({ error: 'Free plan limit reached', upgrade: true }, { status: 403 })
    }
  }

  const formData = await req.formData()
  const file = formData.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const mimeType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

  // Upload to Supabase Storage so the app can display the screenshot
  let imageUrl: string | null = null
  const filename = `${userId}/${Date.now()}.jpg`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('screenshots')
    .upload(filename, buffer, { contentType: mimeType, upsert: false })

  if (!uploadError && uploadData) {
    const { data: { publicUrl } } = supabase.storage.from('screenshots').getPublicUrl(filename)
    imageUrl = publicUrl
  }

  const { data, error } = await supabase
    .from('saves')
    .insert({
      userId,
      type: 'screenshot',
      url: imageUrl ?? `rekawl://screenshot/${Date.now()}`,
      title: 'Screenshot',
      imageUrl,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  processScreenshotAsync(data.id, buffer, mimeType).catch(console.error)

  return NextResponse.json({ id: data.id, status: 'pending' })
}

async function processScreenshotAsync(
  saveId: string,
  buffer: Buffer,
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
) {
  try {
    const base64 = buffer.toString('base64')
    const { title, summary, tags } = await generateScreenshotSummary(base64, mimeType)
    await supabase
      .from('saves')
      .update({ title, summary, tags, status: 'processed' })
      .eq('id', saveId)
  } catch (err) {
    console.error('Screenshot processing failed', saveId, err)
    await supabase.from('saves').update({ status: 'failed' }).eq('id', saveId)
  }
}
