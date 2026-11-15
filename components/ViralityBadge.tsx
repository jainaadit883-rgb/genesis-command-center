import { Tooltip } from './Tooltip'

interface ViralityBadgeProps {
  score: number
  hitTarget: boolean
}

export function ViralityBadge({ score, hitTarget }: ViralityBadgeProps) {
  const color =
    score >= 80
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : score >= 50
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-slate-700/50 text-slate-400 border-slate-600'

  return (
    <div className="flex items-center gap-1.5">
      <Tooltip
        text={`Virality score: views×0.0001 + likes×0.5 + comments×1 + shares×2, then normalised so 100 = the strongest post currently loaded. This is a relative rank, not an absolute measure.`}
        position="bottom"
      >
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold cursor-help ${color}`}
        >
          {score}
        </span>
      </Tooltip>
      {hitTarget && (
        <Tooltip
          text="This post hit the viral threshold for its platform (X: 1k+ likes / 500+ shares / 100k+ views; Reddit: 5k+ upvotes; LinkedIn: 50k+ impressions or 1k+ reactions)."
          position="bottom"
        >
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-300 cursor-help">
            ✦ viral
          </span>
        </Tooltip>
      )}
    </div>
  )
}
