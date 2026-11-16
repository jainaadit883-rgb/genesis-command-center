import { NextResponse } from 'next/server'

// LinkedIn's post API requires OAuth (3-legged auth) — there is no public
// unauthenticated endpoint for posts. The setup steps below guide the user
// through getting a Partner token.
export async function GET() {
  return NextResponse.json({
    posts: [],
    needsSetup: true,
    platform: 'linkedin',
    steps: [
      'Go to linkedin.com/developers and create a free app.',
      'Request the "Share on LinkedIn" and "Sign In with LinkedIn" products.',
      'Generate a user access token (OAuth 2.0) with r_liteprofile + w_member_social scopes.',
      'Add LINKEDIN_ACCESS_TOKEN=your_token to .env.local (expires every 60 days — refresh it).',
      'Restart the dev server or add the var to Vercel, then click Refresh.',
    ],
  })
}
