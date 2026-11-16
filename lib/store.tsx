'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { AppState, AppAction } from './types'
import {
  defaultXPosts,
  defaultRedditPosts,
  defaultLinkedInPosts,
  defaultExperiments,
  defaultLeads,
  defaultSavedIdeas,
} from './data'

const STORAGE_KEY = 'genesis_state_v1'

const initialState: AppState = {
  xPosts: defaultXPosts,
  redditPosts: defaultRedditPosts,
  linkedinPosts: defaultLinkedInPosts,
  experiments: defaultExperiments,
  leads: defaultLeads,
  savedIdeas: defaultSavedIdeas,
  patternSummary: { x: '', reddit: '', linkedin: '' },
  signups: 143,
  budgetUsed: 8400,
  lastRefreshed: null,
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'REFRESH_POSTS':
      return {
        ...state,
        ...(action.platform === 'x' && { xPosts: action.posts }),
        ...(action.platform === 'reddit' && { redditPosts: action.posts }),
        ...(action.platform === 'linkedin' && { linkedinPosts: action.posts }),
        lastRefreshed: new Date().toISOString(),
      }
    case 'ADD_TEARDOWN':
      return {
        ...state,
        xPosts:
          action.platform === 'x'
            ? state.xPosts.map(p =>
                p.id === action.postId ? { ...p, teardown: action.teardown, teardownRatings: action.ratings } : p
              )
            : state.xPosts,
        redditPosts:
          action.platform === 'reddit'
            ? state.redditPosts.map(p =>
                p.id === action.postId ? { ...p, teardown: action.teardown, teardownRatings: action.ratings } : p
              )
            : state.redditPosts,
        linkedinPosts:
          action.platform === 'linkedin'
            ? state.linkedinPosts.map(p =>
                p.id === action.postId ? { ...p, teardown: action.teardown, teardownRatings: action.ratings } : p
              )
            : state.linkedinPosts,
      }
    case 'SET_PATTERN':
      return {
        ...state,
        patternSummary: { ...state.patternSummary, [action.platform]: action.summary },
      }
    case 'ADD_EXPERIMENT':
      return { ...state, experiments: [action.experiment, ...state.experiments] }
    case 'UPDATE_EXPERIMENT':
      return {
        ...state,
        experiments: state.experiments.map(e =>
          e.id === action.id ? { ...e, ...action.updates } : e
        ),
      }
    case 'ADD_LEAD':
      return { ...state, leads: [action.lead, ...state.leads] }
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(l => (l.id === action.id ? { ...l, ...action.updates } : l)),
      }
    case 'SAVE_IDEA':
      return { ...state, savedIdeas: [action.idea, ...state.savedIdeas] }
    case 'REMOVE_IDEA':
      return { ...state, savedIdeas: state.savedIdeas.filter(i => i.id !== action.id) }
    case 'SET_SIGNUPS':
      return { ...state, signups: action.count }
    case 'SET_BUDGET_USED':
      return { ...state, budgetUsed: action.amount }
    case 'LOAD_STATE':
      return action.state
    default:
      return state
  }
}

const StoreContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as AppState
        dispatch({ type: 'LOAD_STATE', state: parsed })
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
