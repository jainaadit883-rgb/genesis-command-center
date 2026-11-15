import { PlatformPage } from '@/components/PlatformPage'

const HELP = [
  'Shows the top AI-video posts from X, ranked by virality score (0–100, where 100 is the best post currently loaded).',
  'Click "Explain why top posts went viral" to get an AI breakdown of the top 8. Each teardown explains the hook, format, and sharing mechanics.',
  'Once you have 3+ teardowns, click "Summarise what works on X" to get a single pattern you can apply when writing new posts.',
  'Posts marked ✦ viral crossed the platform threshold: 1,000+ likes, 500+ shares, or 100k+ views.',
]

export default function XPage() {
  return (
    <PlatformPage
      platform="x"
      label="X (Twitter)"
      icon="𝕏"
      helpLines={HELP}
    />
  )
}
