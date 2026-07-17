import type { Game } from '@/game/game'
import type { Snapshot } from '@/game/types'
import { Minimap } from './Minimap'

const toneColor: Record<string, string> = {
  info: 'text-[#b8b0a0]',
  rumor: 'text-[#a8b8d8]',
  danger: 'text-[#e86a5a]',
  system: 'text-[#c9a227]',
}

export function HUD({ game, snap }: { game: Game; snap: Snapshot }) {
  const hourProgress = Math.min(1, snap.clockMin / 360)
  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* top-left: clock + room */}
      <div className="absolute left-4 top-4 rounded border border-[#3a352a] bg-black/70 px-4 py-3 backdrop-blur-sm">
        <div className="font-serif text-2xl tracking-wide text-[#e8d8a0]">{snap.clockText}</div>
        <div className="mt-1 h-1 w-40 overflow-hidden rounded bg-[#242220]">
          <div className="h-full bg-gradient-to-r from-[#3a4a6a] to-[#c9a227]" style={{ width: `${hourProgress * 100}%` }} />
        </div>
        <div className="mt-2 font-serif text-sm text-[#c9b98a]">{snap.playerRoomName}</div>
        <div className="max-w-52 text-xs italic text-[#8a8478]">{snap.playerRoomBrief}</div>
        <div className="mt-2 flex gap-3 text-[10px] uppercase tracking-wider text-[#8a8478]">
          <span>{snap.aliveCount} alive</span>
          <span className={snap.bodiesFound > 0 ? 'text-[#e86a5a]' : ''}>{snap.bodiesFound} bodies</span>
          <span>{snap.llmActive ? 'AI: LLM' : 'AI: built-in'}</span>
        </div>
      </div>

      {/* top-right: minimap + buttons */}
      <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
        <Minimap snap={snap} />
        <div className="pointer-events-auto flex gap-2">
          <button
            onClick={() => game.setPhase('journal')}
            className="rounded border border-[#3a352a] bg-black/70 px-3 py-1.5 font-serif text-xs text-[#c9b98a] hover:border-[#c9a227] hover:text-[#e8d8a0]"
          >
            Journal <span className="text-[#8a8478]">[J]</span>
          </button>
          <button
            onClick={() => game.setPhase('accuse')}
            className="rounded border border-[#6a2a22] bg-[#2a0d0a]/80 px-3 py-1.5 font-serif text-xs font-semibold text-[#e86a5a] hover:border-[#e86a5a] hover:bg-[#e86a5a]/20"
          >
            ⚖ Accuse
          </button>
          <button
            onClick={() => game.updateSettings({ muted: !snap.settings.muted })}
            className="rounded border border-[#3a352a] bg-black/70 px-3 py-1.5 font-serif text-xs text-[#c9b98a] hover:border-[#c9a227] hover:text-[#e8d8a0]"
          >
            {snap.settings.muted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={() => game.setPhase('paused')}
            className="rounded border border-[#3a352a] bg-black/70 px-3 py-1.5 font-serif text-xs text-[#c9b98a] hover:border-[#c9a227] hover:text-[#e8d8a0]"
          >
            Pause <span className="text-[#8a8478]">[Esc]</span>
          </button>
        </div>
      </div>

      {/* bottom-left: event log */}
      <div className="absolute bottom-4 left-4 w-96 space-y-1">
        {snap.log.map(l => (
          <div key={l.id} className={`text-xs leading-snug ${toneColor[l.tone]} drop-shadow-[0_1px_2px_#000]`}>
            <span className="text-[#6a6458]">{fmt(l.atMin)}</span> — {l.text}
          </div>
        ))}
      </div>

      {/* bottom-center: interaction hint */}
      {snap.interactHint && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded border border-[#c9a227]/60 bg-black/80 px-4 py-2 font-serif text-sm text-[#e8d8a0]">
          {snap.interactHint}
        </div>
      )}
    </div>
  )
}

function fmt(min: number): string {
  const m = Math.max(0, Math.floor(min))
  const h = Math.floor(m / 60) % 24
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m % 60).padStart(2, '0')}`
}
