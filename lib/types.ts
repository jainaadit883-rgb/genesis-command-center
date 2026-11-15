export type Platform = 'x' | 'reddit' | 'linkedin'

export interface ViralPost {
  id: string
  platform: Platform
  author: string
  handle: string
  content: string
  url: string
  postedAt: string
  metrics: {
    views: number
    likes: number
    comments: number
    shares: number
  }
  viralityScore: number
  hitViralTarget: boolean
  teardown?: string
}

export interface Experiment {
  id: string
  platform: Platform
  content: string
  postedAt: string
  impressions: number
  engagements: number
  clicks: number
  signups: number
  status: 'draft' | 'pending' | 'live' | 'done'
  notes?: string
}

export interface Lead {
  id: string
  platform: string
  author: string
  content: string
  url: string
  postedAt: string
  pitch?: string
  status: 'new' | 'drafted' | 'sent'
}

export interface SavedIdea {
  id: string
  platform: Platform
  content: string
  angle: string
  createdAt: string
}

export interface AppState {
  xPosts: ViralPost[]
  redditPosts: ViralPost[]
  linkedinPosts: ViralPost[]
  experiments: Experiment[]
  leads: Lead[]
  savedIdeas: SavedIdea[]
  patternSummary: { x: string; reddit: string; linkedin: string }
  signups: number
  budgetUsed: number
  lastRefreshed: string | null
}

export type AppAction =
  | { type: 'REFRESH_POSTS'; platform: Platform; posts: ViralPost[] }
  | { type: 'ADD_TEARDOWN'; platform: Platform; postId: string; teardown: string }
  | { type: 'SET_PATTERN'; platform: Platform; summary: string }
  | { type: 'ADD_EXPERIMENT'; experiment: Experiment }
  | { type: 'UPDATE_EXPERIMENT'; id: string; updates: Partial<Experiment> }
  | { type: 'ADD_LEAD'; lead: Lead }
  | { type: 'UPDATE_LEAD'; id: string; updates: Partial<Lead> }
  | { type: 'SAVE_IDEA'; idea: SavedIdea }
  | { type: 'REMOVE_IDEA'; id: string }
  | { type: 'SET_SIGNUPS'; count: number }
  | { type: 'SET_BUDGET_USED'; amount: number }
  | { type: 'LOAD_STATE'; state: AppState }
