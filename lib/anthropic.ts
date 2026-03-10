import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function generateSummaryAndTags(
  title: string,
  content: string,
  url: string
): Promise<{ summary: string; tags: string[] }> {
  const truncated = content.slice(0, 8000)

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a saved web page. Return ONLY valid JSON with no markdown.

Title: ${title}
URL: ${url}
Content:
${truncated}

Return this exact JSON shape:
{
  "summary": "2-3 sentence summary of what this page is about and why someone would save it",
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
- summary: 2-3 sentences, plain text
- tags: 3-5 lowercase single-word or hyphenated tags (e.g. "ai", "startup", "dev-tools", "research")
- Return ONLY the JSON object, no other text`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  // Strip markdown code fences if present (e.g. ```json ... ```)
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  const parsed = JSON.parse(cleaned)
  return { summary: parsed.summary, tags: parsed.tags }
}

export async function generateImageTagsAndSummary(
  imageUrl: string,
  sourceUrl: string
): Promise<{ summary: string; tags: string[] }> {
  const domain = new URL(sourceUrl).hostname.replace('www.', '')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a saved image from a web page. Return ONLY valid JSON with no markdown.

Image URL: ${imageUrl}
Source domain: ${domain}

Infer what this image likely contains based on the URL path and source domain. Return this exact JSON shape:
{
  "summary": "1-2 sentence description of what this image likely shows and why it was saved",
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
- summary: 1-2 sentences, plain text
- tags: 3-5 lowercase single-word or hyphenated tags
- Return ONLY the JSON object, no other text`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  const parsed = JSON.parse(cleaned)
  return { summary: parsed.summary, tags: parsed.tags }
}

export async function generateSnippetTagsAndSummary(
  snippet: string,
  sourceUrl: string
): Promise<{ summary: string; tags: string[] }> {
  const truncated = snippet.slice(0, 4000)
  const domain = new URL(sourceUrl).hostname.replace('www.', '')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a text selection saved from a web page. Return ONLY valid JSON with no markdown.

Source domain: ${domain}
Selected text:
${truncated}

Return this exact JSON shape:
{
  "summary": "1-2 sentence summary of what this text is about and why it was saved",
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
- summary: 1-2 sentences, plain text
- tags: 3-5 lowercase single-word or hyphenated tags
- Return ONLY the JSON object, no other text`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  const parsed = JSON.parse(cleaned)
  return { summary: parsed.summary, tags: parsed.tags }
}
