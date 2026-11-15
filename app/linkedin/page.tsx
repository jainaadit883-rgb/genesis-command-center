import { PlatformPage } from '@/components/PlatformPage'

const HELP = [
  'Shows the top AI-video posts from LinkedIn, ranked by virality score.',
  'LinkedIn virality threshold: 50,000+ impressions or 1,000+ reactions. Posts above this are marked ✦ viral.',
  'LinkedIn audiences respond more strongly to business ROI data and founder stories than to pure demos — teardowns will reflect this.',
  '"Summarise what works on LinkedIn" gives you a posting strategy tuned for professional audiences and B2B reach.',
]

export default function LinkedInPage() {
  return (
    <PlatformPage
      platform="linkedin"
      label="LinkedIn"
      icon="🔗"
      helpLines={HELP}
    />
  )
}
