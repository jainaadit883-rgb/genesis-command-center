import type { Platform, ViralPost, Experiment, Lead, SavedIdea, TeardownRatings } from './types'

export function generateRatings(post: Omit<ViralPost, 'viralityScore' | 'hitViralTarget'> | ViralPost): TeardownRatings {
  const { metrics, content, platform } = post
  const totalEng = metrics.likes + metrics.comments + metrics.shares
  const engRate = metrics.views > 0 ? totalEng / metrics.views : 0

  const hookWords = ['hot take', 'we just', 'i made', 'watch this', 'honest', 'real talk', 'nobody is', 'can you tell', 'quiz', 'spoiler']
  const hookScore = Math.min(10, 5 + hookWords.filter(w => content.toLowerCase().includes(w)).length * 1.5 + (content.length < 160 ? 1 : 0))

  const isDemo = /demo|watch|made|generated|created|built/.test(content.toLowerCase())
  const isThread = /🧵|thread|here's|step/.test(content.toLowerCase())
  const isList = /\d\s+(ways|things|reasons|steps)/.test(content.toLowerCase())
  const isComparison = /vs|compare|versus|difference/.test(content.toLowerCase())
  const formatType = isThread ? 'Thread' : isDemo ? 'Demo' : isList ? 'List' : isComparison ? 'Comparison' : 'Post'
  const formatScore = isThread ? 8 : isDemo ? 9 : isList ? 7 : isComparison ? 8 : 5

  const triggerWords: Record<string, number> = { surprise: 9, disbelief: 8, curiosity: 7, excitement: 8, aspiration: 7 }
  const hasPrice = /₹|cost|free|budget/.test(content)
  const hasClaim = /first|only|never|no one|nobody/.test(content.toLowerCase())
  const triggerScore = Math.min(10, 5 + (hasPrice ? 2 : 0) + (hasClaim ? 2 : 0) + (isDemo ? 1 : 0))
  const triggerLabel = hasPrice ? 'Surprise (cost)' : hasClaim ? 'Disbelief (bold claim)' : isDemo ? 'Excitement' : 'Curiosity'

  const distribScore = platform === 'linkedin' ? 7 : platform === 'reddit' ? 6 : metrics.shares > 10000 ? 9 : metrics.shares > 5000 ? 8 : 6

  const mechScore = isThread ? 9 : platform === 'reddit' ? 8 : metrics.comments > 5000 ? 9 : metrics.shares > 10000 ? 9 : 7
  const mechLabel = isThread ? 'Thread reshares' : platform === 'reddit' ? 'Community upvotes + cross-posts' : 'Organic retweets + communities'

  const engScore = Math.min(10, Math.round(engRate * 500 + 3))

  const hasGenesis = /genesis/.test(content.toLowerCase())
  const hasSignup = /beta|sign.?up|access|link/.test(content.toLowerCase())
  const convScore = hasGenesis && hasSignup ? 10 : hasGenesis ? 8 : hasSignup ? 7 : 5

  return {
    openingHook: { score: Math.round(hookScore), note: `${Math.round(hookScore) >= 8 ? 'Strong' : 'Moderate'} hook`, detail: 'What made someone stop scrolling?' },
    contentFormat: { score: formatScore, note: formatType, detail: 'Demo, controversy, humour, tutorial, experiment?' },
    emotionalTrigger: { score: Math.round(triggerScore), note: triggerLabel, detail: 'Surprise, curiosity, excitement, disbelief?' },
    firstDistributor: { score: distribScore, note: platform === 'linkedin' ? 'Professional network' : platform === 'reddit' ? 'Community post' : 'Creator account', detail: 'Who initially amplified it?' },
    distributionMechanism: { score: mechScore, note: mechLabel, detail: 'Reposts, comments, communities, influencers?' },
    engagement: { score: Math.min(10, engScore), note: `${(engRate * 100).toFixed(1)}% eng rate`, detail: 'Views, likes, comments, shares, upvotes' },
    conversionPotential: { score: convScore, note: convScore >= 8 ? 'High — direct CTA to GENESIS' : convScore >= 6 ? 'Medium — implied product' : 'Low — topic awareness only', detail: 'Would someone actually try the tool?' },
  }
}

function cleanUrl(p: Omit<ViralPost, 'viralityScore' | 'hitViralTarget'>): string {
  if (p.platform === 'x') return `https://x.com/${p.handle.replace('@', '')}`
  if (p.platform === 'reddit') return `https://www.reddit.com/${p.handle}/`
  // linkedin: deep-link to content search (requires login, but no 404)
  return `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent('GENESIS AI film India SuperLiving')}`
}

function computeScores(
  posts: Omit<ViralPost, 'viralityScore' | 'hitViralTarget'>[],
  platform: Platform
): ViralPost[] {
  const raw = posts.map(
    p =>
      p.metrics.views * 0.0001 +
      p.metrics.likes * 0.5 +
      p.metrics.comments * 1 +
      p.metrics.shares * 2
  )
  const max = Math.max(...raw) || 1
  const hitTarget: Record<Platform, (m: ViralPost['metrics']) => boolean> = {
    x: m => m.likes >= 1000 || m.shares >= 500 || m.views >= 100000,
    reddit: m => m.likes >= 5000,
    linkedin: m => m.views >= 50000 || m.likes >= 1000,
  }
  return posts.map((p, i) => ({
    ...p,
    url: cleanUrl(p),
    viralityScore: Math.round((raw[i] / max) * 100),
    hitViralTarget: hitTarget[platform](p.metrics),
    // pre-compute ratings for all posts that have teardown text
    teardownRatings: p.teardownRatings ?? (p.teardown ? generateRatings(p) : undefined),
  }))
}

const rawXPosts: Omit<ViralPost, 'viralityScore' | 'hitViralTarget'>[] = [
  {
    id: 'x1',
    platform: 'x',
    author: 'Aryan Mehta',
    handle: '@aryanbuilds',
    content:
      'We just generated a full Bollywood-style scene from a single text prompt using GENESIS. No actors, no camera, no crew. This is the future of Indian cinema. 🎬🧵',
    url: 'https://x.com/aryanbuilds/status/x1',
    postedAt: '2026-11-10T14:32:00Z',
    metrics: { views: 2100000, likes: 48200, comments: 8300, shares: 15400 },
    teardown:
      'This post hit because it led with a bold claim ("no actors, no crew") that directly challenged the status quo of Indian filmmaking. The Bollywood-specific framing made it hyper-relevant to a large audience. The thread format drove sustained engagement as people read on. High-quality demo content embedded in the thread was shareable on its own. The 🎬 emoji in the first line anchors the topic visually before people read a word.',
  },
  {
    id: 'x2',
    platform: 'x',
    author: 'Priya Nair',
    handle: '@priya_creates',
    content:
      'I made a 90-second Hindi music video using only text prompts. Total time: 3 hours. Total cost: ₹0. Here\'s every step I took 👇',
    url: 'https://x.com/priya_creates/status/x2',
    postedAt: '2026-11-08T09:15:00Z',
    metrics: { views: 1820000, likes: 32100, comments: 5200, shares: 12300 },
    teardown:
      'The "Total cost: ₹0" line is a pattern-interrupt that stops scrollers cold. Specifying ₹0 (not $0) anchors it to Indian creators — immediately relevant. The step-by-step thread promise ("Here\'s every step") signals educational value and drives replies. 90-second run time lowers the barrier to actually watching the demo.',
  },
  {
    id: 'x3',
    platform: 'x',
    author: 'Deepak Sharma',
    handle: '@deepak_ai',
    content:
      'Hot take: AI will produce more regional language films in India than Hollywood does English films — within 5 years. Here are 5 reasons I believe this. 🧵',
    url: 'https://x.com/deepak_ai/status/x3',
    postedAt: '2026-11-07T11:00:00Z',
    metrics: { views: 1210000, likes: 25400, comments: 4600, shares: 8900 },
    teardown:
      '"Hot take:" is one of the highest-performing thread openers on X — it primes readers for disagreement and therefore discussion. The 5-year claim is specific enough to be credible but short enough to feel urgent. Regional language specificity (not just "Indian cinema") signals expertise and targets a narrower, more passionate audience that over-shares within their communities.',
  },
  {
    id: 'x4',
    platform: 'x',
    author: 'Meera Iyer',
    handle: '@meera_tech',
    content:
      'Watch this: same 30-second scene dubbed into Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, and Gujarati — all from one AI generation. GENESIS is real.',
    url: 'https://x.com/meera_tech/status/x4',
    postedAt: '2026-11-06T16:45:00Z',
    metrics: { views: 950000, likes: 18200, comments: 3400, shares: 7100 },
    teardown:
      'The power here is the specific list of 8 languages — it makes the claim concrete and lets every regional Indian viewer self-identify ("that\'s my language!"). "GENESIS is real" as a closing statement resolves the implicit disbelief the demo creates. The video evidence format outperforms text-only because viewers share the video clip natively.',
  },
  {
    id: 'x5',
    platform: 'x',
    author: 'GENESIS',
    handle: '@genesis_ai',
    content:
      'GENESIS beta is live. 1,000 spots. No waitlist — first come first served. Create your first AI film in Hindi or any regional Indian language in under 10 minutes. Link below 🔗',
    url: 'https://x.com/genesis_ai/status/x5',
    postedAt: '2026-11-05T10:00:00Z',
    metrics: { views: 820000, likes: 12800, comments: 9700, shares: 21200 },
    teardown:
      'Scarcity ("1,000 spots") + immediacy ("no waitlist") is a proven launch formula. The "10 minutes" promise lowers the activation cost. The high share count comes from people tagging friends — "first come first served" creates social urgency. Comments skew high because people ask questions and tag others.',
  },
  {
    id: 'x6',
    platform: 'x',
    author: 'Rohit Verma',
    handle: '@rohit_films',
    content:
      'AI-generated VFX vs ₹50 lakh traditional VFX on the same scene. Can you tell which is which? 👇 (Most people get it wrong)',
    url: 'https://x.com/rohit_films/status/x6',
    postedAt: '2026-11-04T13:20:00Z',
    metrics: { views: 760000, likes: 15600, comments: 4300, shares: 5800 },
    teardown:
      '"Can you tell which is which?" is an irresistible quiz format. "Most people get it wrong" adds social proof that makes trying it feel low-risk. The ₹ amount (50 lakh, not generic "expensive") grounds it in Indian production context. Comments explode because everyone wants to post their guess.',
  },
  {
    id: 'x7',
    platform: 'x',
    author: 'Ankita Rao',
    handle: '@ankita_startup',
    content:
      'The honest reason we built GENESIS as an AI film studio for Indian regional languages: English-first AI tools don\'t understand our culture, dialects, or storytelling. A thread on what we got wrong first.',
    url: 'https://x.com/ankita_startup/status/x7',
    postedAt: '2026-11-03T08:30:00Z',
    metrics: { views: 510000, likes: 10200, comments: 2900, shares: 3900 },
    teardown:
      'Vulnerability ("what we got wrong") combined with cultural specificity ("our culture, dialects") builds authentic founder credibility. The implicit critique of English-first AI is resonant with Indian tech builders. "The honest reason" framing signals depth and drives reads.',
  },
  {
    id: 'x8',
    platform: 'x',
    author: 'Vishal Kumar',
    handle: '@vishal_code',
    content:
      'Just watched GENESIS generate a full 2-minute Hindi short film. The script, voices, visuals, music — all AI. I\'ve seen Sora. I\'ve seen Runway. This is different. Here\'s why:',
    url: 'https://x.com/vishal_code/status/x8',
    postedAt: '2026-11-02T15:00:00Z',
    metrics: { views: 430000, likes: 8800, comments: 2000, shares: 3200 },
    teardown:
      '"I\'ve seen X. I\'ve seen Y. This is different." is a classic comparison opener that exploits name recognition while positioning the new thing. Listing every component (script, voices, visuals, music) makes the claim feel complete and credible. The "Here\'s why:" thread promise drives reads.',
  },
  {
    id: 'x9',
    platform: 'x',
    author: 'Kavitha Reddy',
    handle: '@kavitha_builds',
    content:
      'AI content in Marathi is here and it\'s actually usable. I generated 5 reels this week for my brand. Each took 20 minutes. Comments + saves on my Insta are up 3x. Not kidding.',
    url: 'https://x.com/kavitha_builds/status/x9',
    postedAt: '2026-11-01T10:45:00Z',
    metrics: { views: 380000, likes: 7400, comments: 1700, shares: 2900 },
    teardown:
      'First-person results data ("3x comments + saves") is the most shareable format after demos — it\'s proof without requiring the reader to watch a video. "Not kidding" adds authenticity. Marathi specificity targets a large but underserved regional audience who rarely see tools built for them.',
  },
  {
    id: 'x10',
    platform: 'x',
    author: 'Suresh Patel',
    handle: '@suresh_ai_biz',
    content:
      'Everyone is talking about Sora and Runway for AI video. Nobody is talking about regional Indian language AI video — a 1.4 billion person market. GENESIS is the only one doing it properly.',
    url: 'https://x.com/suresh_ai_biz/status/x10',
    postedAt: '2026-10-30T12:00:00Z',
    metrics: { views: 310000, likes: 6100, comments: 1400, shares: 2400 },
  },
]

const rawRedditPosts: Omit<ViralPost, 'viralityScore' | 'hitViralTarget'>[] = [
  {
    id: 'r1',
    platform: 'reddit',
    author: 'u/filmbuilder_ai',
    handle: 'r/AIVideoProduction',
    content:
      'I made a full 5-minute Hindi short film with AI — no actors, no crew, no location shoots. Total budget: ₹2,500. Here\'s the complete breakdown with all the prompts I used.',
    url: 'https://reddit.com/r/AIVideoProduction/r1',
    postedAt: '2026-11-09T18:00:00Z',
    metrics: { views: 285000, likes: 12400, comments: 1890, shares: 3200 },
    teardown:
      'The "complete breakdown with prompts" framing is Reddit gold — it promises replicable value, not just a flex. ₹2,500 is specific enough to feel real. The specificity of "5-minute Hindi" targets both AI enthusiasts and Indian filmmaking communities simultaneously, maximising cross-posting.',
  },
  {
    id: 'r2',
    platform: 'reddit',
    author: 'u/indiatech_watcher',
    handle: 'r/india',
    content:
      'This AI called GENESIS is making Bollywood-style films from text prompts, in Hindi and 11 other regional languages. The demo reels are genuinely impressive. Worth watching.',
    url: 'https://reddit.com/r/india/r2',
    postedAt: '2026-11-07T14:30:00Z',
    metrics: { views: 190000, likes: 8600, comments: 2200, shares: 1400 },
    teardown:
      '"Genuinely impressive" from an apparently neutral third party carries more weight than brand marketing. r/india has 1M+ subscribers and loves Indian tech stories. The 12-language count is a proof point that lands well in a community that cares about regional inclusion.',
  },
  {
    id: 'r3',
    platform: 'reddit',
    author: 'u/aivideo_compare',
    handle: 'r/AIContentCreators',
    content:
      'I tested GENESIS vs Sora vs Runway for regional Indian language content. Same prompt, all three. The difference in cultural accuracy and dialogue quality is not even close. Screenshots inside.',
    url: 'https://reddit.com/r/AIContentCreators/r3',
    postedAt: '2026-11-06T10:15:00Z',
    metrics: { views: 165000, likes: 7300, comments: 980, shares: 1100 },
    teardown:
      'Comparison posts with screenshots consistently outperform standalone demos on Reddit. Naming competitors (Sora, Runway) triggers curiosity in their existing fanbases who want to dispute or validate the claim. "Not even close" is provocative enough to drive comments from both sides.',
  },
  {
    id: 'r4',
    platform: 'reddit',
    author: 'u/indieprod_mumbai',
    handle: 'r/filmmaking',
    content:
      'The economics of AI film production in India: a real cost breakdown comparing traditional production vs GENESIS for a 10-minute short. Spoiler: the difference is 400x.',
    url: 'https://reddit.com/r/filmmaking/r4',
    postedAt: '2026-11-05T09:00:00Z',
    metrics: { views: 140000, likes: 6200, comments: 590, shares: 820 },
    teardown:
      'Cost comparison posts with real numbers are evergreen in filmmaking communities. "400x" is a dramatic enough multiplier to drive shares. r/filmmaking has a global audience interested in production economics regardless of geography.',
  },
  {
    id: 'r5',
    platform: 'reddit',
    author: 'u/tamil_creator',
    handle: 'r/tamil',
    content:
      'AI-generated Tamil short film dropped today. I watched all 8 minutes. The dialogue sounds natural, the cultural references land correctly. This is the first time I\'ve seen AI content in Tamil that doesn\'t feel like a bad translation.',
    url: 'https://reddit.com/r/tamil/r5',
    postedAt: '2026-11-04T16:00:00Z',
    metrics: { views: 120000, likes: 5900, comments: 1250, shares: 680 },
    teardown:
      '"First time I\'ve seen AI content in Tamil that doesn\'t feel like a bad translation" directly addresses the #1 objection Tamil speakers have to AI tools. Authentic community voice (not brand) in a language-specific subreddit generates strong upvote velocity from a highly engaged niche.',
  },
  {
    id: 'r6',
    platform: 'reddit',
    author: 'u/ml_researcher_in',
    handle: 'r/artificial',
    content:
      'Technical explainer: how GENESIS achieves coherent dialogue and cultural context in 12 Indian languages without fine-tuning per language. The architecture is surprisingly elegant.',
    url: 'https://reddit.com/r/artificial/r6',
    postedAt: '2026-11-03T11:30:00Z',
    metrics: { views: 98000, likes: 4900, comments: 440, shares: 590 },
    teardown:
      '"Surprisingly elegant" primes technically curious readers. r/artificial skews toward ML practitioners who share technical content widely within professional networks. Architecture explainers outperform feature showcases in this sub.',
  },
  {
    id: 'r7',
    platform: 'reddit',
    author: 'u/viral_pattern_guy',
    handle: 'r/AIVideoProduction',
    content:
      'I analysed the top 50 viral AI video posts from the last 6 months. Here\'s the pattern: demo + cost breakdown + regional specificity = 10x engagement. No exceptions.',
    url: 'https://reddit.com/r/AIVideoProduction/r7',
    postedAt: '2026-11-02T14:00:00Z',
    metrics: { views: 88000, likes: 4600, comments: 330, shares: 520 },
    teardown:
      'Meta-analysis posts (analysing viral posts) are irresistible to marketers and content creators. The formula format ("X + Y + Z = result") is memorable and highly shareable. "No exceptions" adds bold certainty that invites comment.',
  },
  {
    id: 'r8',
    platform: 'reddit',
    author: 'u/hindi_marketing_pro',
    handle: 'r/marketing',
    content:
      'Using AI video for regional language ad campaigns in India — a case study. We ran identical campaigns in English and in Marathi/Gujarati using AI-generated content. The regional campaigns outperformed by 2.8x.',
    url: 'https://reddit.com/r/marketing/r8',
    postedAt: '2026-11-01T09:45:00Z',
    metrics: { views: 72000, likes: 3800, comments: 290, shares: 410 },
    teardown:
      'Case study format with specific ROI data (2.8x) is highly shareable in marketing communities. The regional language angle is novel to a Western-dominated marketing subreddit, increasing save rates from curious readers.',
  },
  {
    id: 'r9',
    platform: 'reddit',
    author: 'u/genesis_official',
    handle: 'r/india',
    content:
      'GENESIS beta is open — 500 free credits for the first 1,000 users from r/india. We\'re specifically looking for creators making content in regional Indian languages. No English-only content please.',
    url: 'https://reddit.com/r/india/r9',
    postedAt: '2026-10-31T10:00:00Z',
    metrics: { views: 65000, likes: 3300, comments: 870, shares: 420 },
    teardown:
      'The "No English-only content please" line is counterintuitive and therefore memorable — it signals genuine commitment to regional language creators, which builds immediate trust and drives comments from people who want to participate.',
  },
  {
    id: 'r10',
    platform: 'reddit',
    author: 'u/indiebollywood_dev',
    handle: 'r/learnmachinelearning',
    content:
      'How I fine-tuned a video generation model to understand Hinglish, code-switching, and Indian cultural idioms. The key insight that changed everything was treating dialogue as cultural context, not just text.',
    url: 'https://reddit.com/r/learnmachinelearning/r10',
    postedAt: '2026-10-29T12:30:00Z',
    metrics: { views: 58000, likes: 2900, comments: 215, shares: 380 },
  },
]

const rawLinkedInPosts: Omit<ViralPost, 'viralityScore' | 'hitViralTarget'>[] = [
  {
    id: 'li1',
    platform: 'linkedin',
    author: 'Anjali Sharma',
    handle: 'Co-founder, SuperLiving',
    content:
      'We just produced a 5-minute Hindi film with zero production crew. No actors. No location. No camera. Just prompts and GENESIS. Total cost: ₹4,800. The traditional equivalent would have cost ₹18 lakh. Here\'s everything we learned.',
    url: 'https://linkedin.com/posts/li1',
    postedAt: '2026-11-10T09:00:00Z',
    metrics: { views: 152000, likes: 8400, comments: 1150, shares: 2100 },
    teardown:
      'The specific cost comparison (₹4,800 vs ₹18 lakh) is the hook — LinkedIn audiences respond strongly to precise business ROI data. "Here\'s everything we learned" is a credible founder narrative that outperforms product pitches. The zero-production-crew framing challenges assumptions about film production in one sentence.',
  },
  {
    id: 'li2',
    platform: 'linkedin',
    author: 'Rajan Mehta',
    handle: 'CEO, SuperLiving',
    content:
      'Indian regional language content is a ₹70,000 crore market. AI tools built for English-first audiences are leaving it untouched. That gap is exactly why we built GENESIS — an AI film studio designed from the ground up for Bharat.',
    url: 'https://linkedin.com/posts/li2',
    postedAt: '2026-11-08T08:30:00Z',
    metrics: { views: 124000, likes: 6600, comments: 920, shares: 1800 },
    teardown:
      'Market size framing (₹70,000 crore) positions GENESIS as a category creator, not a feature. "Bharat" rather than "India" signals cultural authenticity to Indian LinkedIn audiences. The gap-and-solution structure is LinkedIn\'s most shared narrative format.',
  },
  {
    id: 'li3',
    platform: 'linkedin',
    author: 'Priya Krishnan',
    handle: 'Head of Product, SuperLiving',
    content:
      'Why AI film generation for Indian languages is a fundamentally different problem than English. It\'s not translation. It\'s not dubbing. It\'s cultural fluency — and that changes every part of the stack.',
    url: 'https://linkedin.com/posts/li3',
    postedAt: '2026-11-07T10:15:00Z',
    metrics: { views: 96000, likes: 4900, comments: 670, shares: 1200 },
    teardown:
      '"It\'s not X. It\'s not Y. It\'s Z" is a classic LinkedIn framing that creates clarity through contrast. The technical depth ("every part of the stack") signals genuine expertise, which drives shares from product and engineering leaders.',
  },
  {
    id: 'li4',
    platform: 'linkedin',
    author: 'Anjali Sharma',
    handle: 'Co-founder, SuperLiving',
    content:
      'From idea to finished Hindi film in 4 hours using GENESIS. I documented every step. This post has timestamps, prompts, and the actual output. For anyone building AI content for Indian audiences — this is the playbook.',
    url: 'https://linkedin.com/posts/li4',
    postedAt: '2026-11-06T07:45:00Z',
    metrics: { views: 87000, likes: 5200, comments: 740, shares: 1500 },
    teardown:
      '"This is the playbook" is a high-performing LinkedIn phrase — it promises transferable value. Timestamps + prompts + actual output is a documentation format that LinkedIn professionals save and return to, boosting engagement over time.',
  },
  {
    id: 'li5',
    platform: 'linkedin',
    author: 'Deepak Nair',
    handle: 'CFO, SuperLiving',
    content:
      'The numbers: AI-generated film production at ₹5,000 vs traditional production at ₹5,00,000. For the same 10-minute Hindi short. Here\'s the full breakdown — what AI covers, what it can\'t yet, and where the real savings come from.',
    url: 'https://linkedin.com/posts/li5',
    postedAt: '2026-11-05T09:30:00Z',
    metrics: { views: 76000, likes: 7400, comments: 1010, shares: 2200 },
    teardown:
      'Cost breakdown posts consistently rank among the highest-saved content on LinkedIn. "What AI can\'t yet" shows intellectual honesty that increases trust and therefore shares. The 100x cost difference is provocative enough to drive comments from skeptics and believers alike.',
  },
  {
    id: 'li6',
    platform: 'linkedin',
    author: 'GENESIS AI',
    handle: '@genesis_ai',
    content:
      'We\'re opening 500 GENESIS beta spots for LinkedIn creators this week. Priority for content creators producing in regional Indian languages. DM "GENESIS" for early access.',
    url: 'https://linkedin.com/posts/li6',
    postedAt: '2026-11-04T10:00:00Z',
    metrics: { views: 69000, likes: 4000, comments: 2200, shares: 1100 },
    teardown:
      'DM-based access requests generate comment engagement because every interested person must comment "GENESIS" to participate, algorithmically boosting the post. 500-spot scarcity creates urgency. The regional language priority signals selectivity, which makes early access feel more valuable.',
  },
  {
    id: 'li7',
    platform: 'linkedin',
    author: 'Meera Joshi',
    handle: 'Content Strategy, SuperLiving',
    content:
      'Indian content creators: AI video is your new competitive advantage — but only if you understand what makes regional language content work culturally. Here are the 7 things we\'ve learned building GENESIS.',
    url: 'https://linkedin.com/posts/li7',
    postedAt: '2026-11-03T08:00:00Z',
    metrics: { views: 55000, likes: 4400, comments: 590, shares: 980 },
    teardown:
      '"7 things we\'ve learned" is a proven LinkedIn list format. Framing it as "competitive advantage" speaks directly to creator aspirations. The cultural specificity elevates it above generic AI tool posts.',
  },
  {
    id: 'li8',
    platform: 'linkedin',
    author: 'Suresh Reddy',
    handle: 'CTO, SuperLiving',
    content:
      'How AI dubbing actually works across 12 Indian languages — the technical reality behind natural-sounding dialogue, regional accents, and cultural idioms. A thread for anyone building in this space.',
    url: 'https://linkedin.com/posts/li8',
    postedAt: '2026-11-02T11:00:00Z',
    metrics: { views: 49000, likes: 3200, comments: 440, shares: 860 },
    teardown:
      '"The technical reality" framing attracts senior technical audiences who share educational content to establish their own expertise. Calling out regional accents and idioms specifically signals depth that generic AI posts lack.',
  },
  {
    id: 'li9',
    platform: 'linkedin',
    author: 'Kavya Pillai',
    handle: 'Strategy, SuperLiving',
    content:
      'AI film vs Bollywood for independent filmmakers: a real cost and capability breakdown. The goal isn\'t to replace traditional production. It\'s to open the door for creators who couldn\'t afford to make films at all.',
    url: 'https://linkedin.com/posts/li9',
    postedAt: '2026-11-01T09:00:00Z',
    metrics: { views: 43000, likes: 2900, comments: 400, shares: 750 },
  },
  {
    id: 'li10',
    platform: 'linkedin',
    author: 'Rajan Mehta',
    handle: 'CEO, SuperLiving',
    content:
      'Real talk: 5 things AI still can\'t do in Indian film production. I\'m building GENESIS so I\'m allowed to say this. Knowing the limits is what makes the wins land.',
    url: 'https://linkedin.com/posts/li10',
    postedAt: '2026-10-30T08:30:00Z',
    metrics: { views: 38000, likes: 3600, comments: 530, shares: 820 },
    teardown:
      '"I\'m building X so I\'m allowed to say this" is an authenticity signal that disarms skepticism. Admitting limitations publicly builds more trust than feature lists. This format consistently outperforms promotional content on LinkedIn for founder accounts.',
  },
]

export const defaultXPosts = computeScores(rawXPosts, 'x')
export const defaultRedditPosts = computeScores(rawRedditPosts, 'reddit')
export const defaultLinkedInPosts = computeScores(rawLinkedInPosts, 'linkedin')

export const defaultExperiments: Experiment[] = [
  {
    id: 'exp1',
    platform: 'x',
    content:
      'We turned a customer testimonial into a full Hindi film scene with GENESIS. Here\'s the prompt we used. 🧵',
    postedAt: '2026-11-11T10:00:00Z',
    impressions: 42000,
    engagements: 1800,
    clicks: 340,
    signups: 28,
    status: 'done',
    notes: 'Strong opening day, tapered after 48h. Try posting at 8am next time.',
  },
  {
    id: 'exp2',
    platform: 'linkedin',
    content:
      'The economics of AI film production — why ₹5,000 beats ₹5,00,000 for regional language content.',
    postedAt: '2026-11-12T09:00:00Z',
    impressions: 18000,
    engagements: 920,
    clicks: 180,
    signups: 12,
    status: 'live',
    notes: 'Still gaining traction. Check in 48h.',
  },
]

export const defaultLeads: Lead[] = [
  {
    id: 'lead1',
    platform: 'Upwork',
    author: 'FinTech Startup — Upwork',
    content:
      'Looking for a video creator to produce 3 Hindi explainer videos for our fintech app. 60–90 seconds each. Must understand Indian financial audience. Budget: $250–400 per video. AI tools welcome.',
    url: 'https://www.upwork.com/nx/search/jobs/?q=Hindi+explainer+video&sort=recency',
    postedAt: '2026-11-14T09:30:00Z',
    status: 'new',
    scraperSource: 'upwork.com — search: "Hindi explainer video" (posted this week)',
    contactType: 'upwork_bid',
    contactHandle: 'upwork.com/jobs/hindi-explainer-fintech',
    emailSubject: 'Hindi explainer videos for your fintech — GENESIS',
  },
  {
    id: 'lead2',
    platform: 'Upwork',
    author: 'FMCG Brand Manager — Upwork',
    content:
      'Need 5 short product reels (30 sec) in Hindi and Marathi for a new FMCG brand launch. AI-generated video tools welcome. Must have cultural authenticity. Budget: $100–200 per reel.',
    url: 'https://www.upwork.com/nx/search/jobs/?q=Marathi+Hindi+product+video&sort=recency',
    postedAt: '2026-11-13T14:00:00Z',
    status: 'new',
    scraperSource: 'upwork.com — search: "Marathi Hindi video production"',
    contactType: 'upwork_bid',
    contactHandle: 'upwork.com/jobs/fmcg-regional-reels',
    emailSubject: 'Hindi + Marathi FMCG reels — GENESIS AI production',
  },
  {
    id: 'lead3',
    platform: 'Freelancer',
    author: 'South India E-commerce — Freelancer',
    content:
      'We need 10 product explainer videos in Tamil and Telugu for our upcoming product launch. Looking for someone familiar with South Indian consumer culture. Budget: ₹8,000–15,000 per video.',
    url: 'https://www.freelancer.com/jobs/video-production-1/',
    postedAt: '2026-11-12T11:00:00Z',
    status: 'drafted',
    scraperSource: 'freelancer.com — category: Video Production, language: Tamil/Telugu',
    contactType: 'freelancer_bid',
    contactHandle: 'freelancer.com/projects/tamil-telugu-explainer',
    emailSubject: 'Tamil & Telugu explainer videos — GENESIS can deliver 10',
    pitch:
      'Hi, saw your Freelancer project for Tamil and Telugu explainer videos! GENESIS was built specifically for South Indian regional languages — the dialogue sounds natural, not translated. We can deliver all 10 videos within your budget with built-in cultural accuracy. Happy to send sample outputs in Tamil first. Want to see them before you decide?',
  },
  {
    id: 'lead4',
    platform: 'Upwork',
    author: 'Gujarati YouTuber — Upwork',
    content:
      'My YouTube channel needs consistent AI-generated video content in Gujarati — 2 videos per week. Looking for a production partner who can maintain voice and style consistency over time.',
    url: 'https://www.upwork.com/nx/search/jobs/?q=Gujarati+YouTube+video+AI&sort=recency',
    postedAt: '2026-11-11T16:00:00Z',
    status: 'new',
    scraperSource: 'upwork.com — search: "Gujarati video content" "YouTube"',
    contactType: 'upwork_bid',
    contactHandle: 'upwork.com/jobs/gujarati-youtube-weekly',
    emailSubject: 'Consistent Gujarati YouTube content — GENESIS weekly production',
  },
  {
    id: 'lead5',
    platform: 'Freelancer',
    author: 'OTT Production House — Freelancer',
    content:
      'Seeking production partner for a 6-episode pilot in Odia language for OTT distribution. Open to AI-first production approach. Each episode 20–25 mins. Serious inquiries only.',
    url: 'https://www.freelancer.com/jobs/video-services-1/',
    postedAt: '2026-11-10T10:00:00Z',
    status: 'new',
    scraperSource: 'freelancer.com — category: Video Services, keyword: "Odia" "OTT"',
    contactType: 'freelancer_bid',
    contactHandle: 'freelancer.com/projects/odia-ott-pilot',
    emailSubject: 'Odia OTT pilot (6 episodes) — GENESIS AI production',
  },
  {
    id: 'lead6',
    platform: 'Upwork',
    author: 'SaaS Company — Upwork',
    content:
      'Looking for multilingual video content creator for SaaS product. Need 8 explainer videos across Hindi, Tamil, Telugu, and Kannada. AI tools preferred. Budget: $3,000–5,000 for all 8.',
    url: 'https://www.upwork.com/nx/search/jobs/?q=multilingual+Indian+language+SaaS+video&sort=recency',
    postedAt: '2026-11-09T08:30:00Z',
    status: 'sent',
    scraperSource: 'upwork.com — search: "Hindi Tamil Telugu Kannada video" "SaaS"',
    contactType: 'upwork_bid',
    contactHandle: 'upwork.com/jobs/multilingual-saas-explainer',
    emailSubject: 'Multilingual SaaS explainers (8 videos) — GENESIS proposal',
    pitch:
      'Hi, saw your Upwork post for multilingual SaaS explainers across 4 Indian languages. GENESIS was built for exactly this — natural-sounding Hindi, Tamil, Telugu, and Kannada from one brief, with consistent terminology across all 8 videos. Within your $3,000–5,000 budget you get broadcast-ready outputs with 2 revision rounds. Can I send sample outputs in each language this week?',
  },
]

export const defaultSavedIdeas: SavedIdea[] = [
  {
    id: 'idea1',
    platform: 'x',
    content:
      'We turned a customer testimonial into a full Hindi film scene with GENESIS. Here\'s the exact prompt. 🧵',
    angle: 'Case study + prompt reveal',
    createdAt: '2026-11-10T10:00:00Z',
  },
  {
    id: 'idea2',
    platform: 'reddit',
    content:
      'Detailed breakdown: why AI dialogue sounds natural in regional languages (and when it doesn\'t). Every failure I hit building GENESIS and what fixed it.',
    angle: 'Technical honesty post',
    createdAt: '2026-11-09T14:00:00Z',
  },
  {
    id: 'idea3',
    platform: 'linkedin',
    content:
      'The 3 biggest myths about AI-generated content in Indian cinema — and what the data actually shows.',
    angle: 'Myth-busting',
    createdAt: '2026-11-08T09:00:00Z',
  },
]

export const IDEA_TEMPLATES: Array<{ content: string; angle: string; platform: Platform }> = [
  {
    platform: 'x',
    content: 'Hot take: the first AI-generated Bollywood blockbuster will come from a 2-person team, not a studio. Here\'s why the economics make this inevitable. 🧵',
    angle: 'Contrarian prediction + economics',
  },
  {
    platform: 'x',
    content: 'I generated the same scene 10 times with different prompts. The difference in output quality was 10x based on this one prompt change. Here\'s what it was:',
    angle: 'Prompt engineering reveal',
  },
  {
    platform: 'reddit',
    content: 'What I wish I knew before using AI to make content in my regional language — a list of things the marketing doesn\'t tell you.',
    angle: 'Honest limitations post',
  },
  {
    platform: 'reddit',
    content: 'I ran a poll: 500 viewers watched an AI-generated Tamil film without knowing it was AI. Here are their reactions.',
    angle: 'Social experiment + data',
  },
  {
    platform: 'linkedin',
    content: 'If you\'re a brand spending money on traditional Hindi ad production in 2026, I need you to see this cost comparison. The gap is bigger than you think.',
    angle: 'B2B cost argument',
  },
  {
    platform: 'linkedin',
    content: '6 months building GENESIS. Here are the 6 things that worked, the 3 things that failed, and the 1 insight that changed everything.',
    angle: 'Founder reflection',
  },
  {
    platform: 'x',
    content: 'Quiz: which of these 3 clips was shot on a real camera and which are AI? Most filmmakers got it wrong in our test. Drop your guesses 👇',
    angle: 'Interactive quiz',
  },
  {
    platform: 'linkedin',
    content: 'Regional Indian language content gets 60% more engagement per follower than English-language content on the same topics. Here\'s the data and why it matters for your brand.',
    angle: 'Data-driven content argument',
  },
]
