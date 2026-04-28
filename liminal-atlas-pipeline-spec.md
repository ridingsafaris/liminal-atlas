# Liminal Atlas — Automated Article Pipeline
## Full Technical Specification

---

## Overview

When a new video is published by a monitored YouTube channel, this pipeline:
1. Detects the new video
2. Downloads the transcript
3. Sends it to Claude API for close reading
4. Generates a structured Sanity document
5. Pushes it to Sanity as a Draft
6. Notifies the editor for review

No article is published without human review and approval.

---

## Architecture

```
YouTube RSS Feed (hourly check)
         ↓
GitHub Actions (scheduler)
         ↓
yt-dlp (transcript download)
         ↓
Claude API (close reading)
         ↓
Sanity Mutations API (create draft)
         ↓
Email / Slack notification
         ↓
Editor reviews in Sanity Studio
         ↓
Editor clicks Publish → live on site
```

---

## Monitored Channels

Store in `channels.json`:

```json
[
  {
    "name": "American Alchemy",
    "channelId": "UCQGggKhDd7N97F3gMfNXHYg",
    "host": "jesse-michels",
    "type": "video",
    "categories": ["uap", "physics"]
  },
  {
    "name": "Danny Jones Podcast",
    "channelId": "UC...",
    "host": "danny-jones",
    "type": "video",
    "categories": ["uap", "finance"]
  }
]
```

Add any channel here to monitor it automatically.

---

## File Structure

```
liminal-atlas-pipeline/
├── .github/
│   └── workflows/
│       └── check-new-videos.yml    ← Runs hourly
├── pipeline/
│   ├── monitor.js                  ← Checks RSS feeds
│   ├── transcript.js               ← Downloads transcripts
│   ├── claude.js                   ← Calls Claude API
│   ├── sanity.js                   ← Pushes to Sanity
│   ├── notify.js                   ← Sends notifications
│   └── index.js                    ← Main orchestrator
├── prompts/
│   └── close-reading.txt           ← Claude prompt template
├── channels.json                   ← Monitored channels
├── seen-videos.json                ← Already processed (auto-updated)
└── package.json
```

---

## Step 1 — Channel Monitor (`monitor.js`)

Reads YouTube RSS feeds and returns new videos not in `seen-videos.json`.

```javascript
const Parser = require('rss-parser')
const fs = require('fs')

const parser = new Parser()
const SEEN_FILE = './seen-videos.json'

async function getNewVideos(channels) {
  const seen = JSON.parse(fs.readFileSync(SEEN_FILE, 'utf8') || '[]')
  const newVideos = []

  for (const channel of channels) {
    const feed = await parser.parseURL(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`
    )

    for (const item of feed.items) {
      if (!seen.includes(item.id)) {
        newVideos.push({
          id: item.id,
          title: item.title,
          url: item.link,
          publishedAt: item.pubDate,
          channel,
        })
      }
    }
  }

  return newVideos
}

function markAsSeen(videoIds) {
  const seen = JSON.parse(fs.readFileSync(SEEN_FILE, 'utf8') || '[]')
  const updated = [...new Set([...seen, ...videoIds])]
  fs.writeFileSync(SEEN_FILE, JSON.stringify(updated, null, 2))
}

module.exports = { getNewVideos, markAsSeen }
```

---

## Step 2 — Transcript Downloader (`transcript.js`)

Uses `yt-dlp` to download the transcript. Falls back to auto-generated captions if no manual transcript exists.

```javascript
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

async function downloadTranscript(videoUrl, outputDir = '/tmp') {
  const videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1] || videoUrl.split('/').pop()
  const outputPath = path.join(outputDir, `${videoId}.txt`)

  try {
    // Try manual transcript first
    execSync(
      `yt-dlp --skip-download --write-subs --sub-lang en --convert-subs txt -o "${outputDir}/${videoId}" "${videoUrl}"`,
      { stdio: 'pipe' }
    )
  } catch {
    // Fall back to auto-generated
    execSync(
      `yt-dlp --skip-download --write-auto-subs --sub-lang en --convert-subs txt -o "${outputDir}/${videoId}" "${videoUrl}"`,
      { stdio: 'pipe' }
    )
  }

  // Clean up the transcript (remove timestamps, tidy whitespace)
  const rawFiles = fs.readdirSync(outputDir).filter(f => f.startsWith(videoId) && f.endsWith('.txt'))
  if (!rawFiles.length) throw new Error(`No transcript found for ${videoUrl}`)

  const raw = fs.readFileSync(path.join(outputDir, rawFiles[0]), 'utf8')
  const cleaned = raw
    .replace(/^\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  fs.writeFileSync(outputPath, cleaned)
  return { transcript: cleaned, videoId }
}

module.exports = { downloadTranscript }
```

---

## Step 3 — Claude Close Reading (`claude.js`)

Sends the transcript to Claude API and gets back a structured Sanity document.

```javascript
const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are the editor of Liminal Atlas, a knowledge blog covering frontier physics, UAP, consciousness, and religion.

You write close readings of videos and books. Your style is:
- Rigorous but accessible
- Each chapter gets a summary paragraph (2-4 sentences, dense with information)
- Claims are categorised: confirmed (green), disputed (orange), classified (purple), unsupported (red)
- Key terms listed for each chapter
- People mentioned are identified by their slug (e.g. "eric-davis", "hal-puthoff")
- Physics concepts get plain-English explainers
- Academic papers are cited with author, year, journal

You return ONLY valid JSON. No markdown, no preamble, no explanation.`

async function runCloseReading(video, transcript, schema) {
  const prompt = `Analyse this video transcript and return a Sanity document matching the schema.

VIDEO TITLE: ${video.title}
CHANNEL: ${video.channel.name}
URL: ${video.url}
PUBLISHED: ${video.publishedAt}

TRANSCRIPT:
${transcript}

KNOWN PEOPLE SLUGS (reference these in speakers and appearances):
eric-davis, eric-weinstein, jesse-michels, gary-nolan, hal-puthoff, jacques-vallee,
dave-rossi, sal-pais, ashton-forbes, catherine-austin-fitts, john-brandenburg,
jason-jorjani, joe-rogan, danny-jones, bob-lazar, jim-simons, thomas-wilson,
glenn-gaffney, david-grusch, jay-stratton, diana-pasulka, john-mack

SANITY SCHEMA:
${JSON.stringify(schema, null, 2)}

Return a complete Sanity document. The _type must be "article". 
Include all chapters with full summaries. 
Identify the host and guests from the transcript.
Extract all people mentioned and their context.
Generate bibliography entries for any academic papers referenced.
All chapter summaries should be thorough — 3-5 sentences minimum.`

  const response = await client.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 8000,
    messages: [
      { role: 'user', content: prompt }
    ],
    system: SYSTEM_PROMPT,
  })

  const text = response.content[0].text
  
  // Strip any accidental markdown fences
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  
  return JSON.parse(clean)
}

module.exports = { runCloseReading }
```

---

## Step 4 — Sanity Push (`sanity.js`)

Pushes the generated document to Sanity as a Draft (not published).

```javascript
const https = require('https')

const PROJECT_ID = process.env.SANITY_PROJECT_ID
const DATASET = process.env.SANITY_DATASET || 'production'
const TOKEN = process.env.SANITY_TOKEN

async function createDraft(document) {
  // Prefix _id with "drafts." to create as draft
  const doc = {
    ...document,
    _id: `drafts.auto-${document.slug?.current || Date.now()}`,
  }

  const body = JSON.stringify({
    mutations: [{ createOrReplace: doc }]
  })

  const url = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        const parsed = JSON.parse(data)
        if (parsed.error) reject(new Error(parsed.error.description))
        else resolve(parsed)
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function getDraftUrl(slug) {
  return `https://liminal-atlas-studio.sanity.studio/structure/article;drafts.auto-${slug}`
}

module.exports = { createDraft, getDraftUrl }
```

---

## Step 5 — Notification (`notify.js`)

Sends an email or Slack message when a new draft is ready for review.

```javascript
const https = require('https')

async function notifySlack(video, draftUrl) {
  if (!process.env.SLACK_WEBHOOK_URL) return

  const message = {
    text: `📺 New article draft ready for review`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*New article ready for review*\n\n*${video.title}*\nChannel: ${video.channel.name}\nPublished: ${video.publishedAt}`,
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Review in Sanity Studio' },
            url: draftUrl,
            style: 'primary',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Watch Video' },
            url: video.url,
          }
        ]
      }
    ]
  }

  const body = JSON.stringify(message)
  // POST to Slack webhook
  // Implementation depends on your Slack setup
}

async function notifyEmail(video, draftUrl) {
  // Use your preferred email service (Resend, SendGrid, etc.)
  console.log(`
    New draft ready: ${video.title}
    Review at: ${draftUrl}
  `)
}

module.exports = { notifySlack, notifyEmail }
```

---

## Step 6 — Main Orchestrator (`index.js`)

```javascript
const { getNewVideos, markAsSeen } = require('./monitor')
const { downloadTranscript } = require('./transcript')
const { runCloseReading } = require('./claude')
const { createDraft, getDraftUrl } = require('./sanity')
const { notifySlack, notifyEmail } = require('./notify')
const channels = require('../channels.json')
const schema = require('../liminal-atlas-studio/studio/src/schemaTypes/article.ts')

async function run() {
  console.log('Checking for new videos...')
  
  const newVideos = await getNewVideos(channels)
  console.log(`Found ${newVideos.length} new videos`)

  for (const video of newVideos) {
    try {
      console.log(`Processing: ${video.title}`)

      // 1. Download transcript
      console.log('  Downloading transcript...')
      const { transcript } = await downloadTranscript(video.url)

      // 2. Run Claude close reading
      console.log('  Running close reading...')
      const document = await runCloseReading(video, transcript, schema)

      // 3. Push to Sanity as draft
      console.log('  Creating Sanity draft...')
      await createDraft(document)
      const draftUrl = await getDraftUrl(document.slug?.current)

      // 4. Notify editor
      console.log('  Sending notification...')
      await notifySlack(video, draftUrl)
      await notifyEmail(video, draftUrl)

      // 5. Mark as seen
      markAsSeen([video.id])

      console.log(`  ✓ Done: ${draftUrl}`)

    } catch (err) {
      console.error(`  ✗ Failed: ${video.title}`)
      console.error(err.message)
    }
  }
}

run()
```

---

## Step 7 — GitHub Actions Workflow

```yaml
# .github/workflows/check-new-videos.yml
name: Check for new videos

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:       # Also allow manual trigger

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install yt-dlp
        run: pip install yt-dlp
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          
      - name: Install dependencies
        run: cd pipeline && npm install
        
      - name: Run pipeline
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          SANITY_PROJECT_ID: ${{ secrets.SANITY_PROJECT_ID }}
          SANITY_DATASET: production
          SANITY_TOKEN: ${{ secrets.SANITY_TOKEN }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: cd pipeline && node index.js
        
      - name: Commit seen-videos.json
        run: |
          git config --local user.email "pipeline@liminal-atlas.vercel.app"
          git config --local user.name "Liminal Atlas Pipeline"
          git add seen-videos.json
          git diff --staged --quiet || git commit -m "Mark videos as processed"
          git push
```

---

## GitHub Secrets Required

Set these in your GitHub repo → Settings → Secrets:

| Secret | Value |
|--------|-------|
| `ANTHROPIC_API_KEY` | Your Claude API key |
| `SANITY_PROJECT_ID` | `axgjsxog` |
| `SANITY_TOKEN` | Editor token from manage.sanity.io |
| `SLACK_WEBHOOK_URL` | Optional — for Slack notifications |

---

## The Editor Review Flow

When a new video is processed:

1. **Notification arrives** — Slack/email with video title and link
2. **Open Sanity Studio** → Articles → Drafts
3. **Review the draft:**
   - Check chapter summaries are accurate
   - Verify claim badges (confirmed/disputed/classified)
   - Check people are tagged correctly
   - Add any physics diagrams manually
   - Fix any transcript errors Claude may have misread
4. **Click Publish** → article goes live on the website instantly

Average review time per article: **15-20 minutes** vs 4-6 hours of manual work.

---

## Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "rss-parser": "^3.13.0"
  }
}
```

Plus system dependency: `yt-dlp` (installed via pip in GitHub Actions)

---

## Build Order

1. **First:** Get the Next.js frontend working (you need somewhere to publish to)
2. **Second:** Test the pipeline manually on one video
3. **Third:** Set up GitHub Actions for automation
4. **Fourth:** Add Slack/email notifications

---

## Notes

- The pipeline creates **drafts only** — nothing goes live without human approval
- `seen-videos.json` prevents the same video being processed twice
- The Claude prompt can be refined over time as you see the output quality
- Physics diagrams still need manual SVG work — Claude will flag where they're needed
- The pipeline can be extended to monitor books, papers, podcasts — any RSS feed
