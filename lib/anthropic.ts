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
