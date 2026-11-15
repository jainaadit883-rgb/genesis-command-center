import { PlatformPage } from '@/components/PlatformPage'

const HELP = [
  'Shows the top AI-video posts from Reddit, ranked by virality score.',
  'Reddit virality threshold: 5,000+ upvotes. Posts above this are marked ✦ viral.',
  '"Explain why top posts went viral" analyses the top 8 posts. Reddit teardowns focus on what made the post replicable or educational — the main drivers of Reddit shares.',
  '"Summarise what works on Reddit" distils the teardowns into a single posting pattern you can follow.',
]

export default function RedditPage() {
  return (
    <PlatformPage
      platform="reddit"
      label="Reddit"
      icon="◉"
      helpLines={HELP}
    />
  )
}
