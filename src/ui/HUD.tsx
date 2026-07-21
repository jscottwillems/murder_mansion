import { useEffect, useState } from 'react'
import type { Game } from '@/game/game'
import type { Snapshot } from '@/game/types'
import { Minimap } from './Minimap'
import { GothicFrame } from './GothicFrame'

export function HUD({ game, snap }: { game: Game; snap: Snapshot }) {
  const [mapOpen, setMapOpen] = useState(true)
  const hourProgress = Math.min(1, snap.clockMin / 360)

  useEffect(() => {
    const toggleMap = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'm' || event.repeat) return
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return
      event.preventDefault()
      setMapOpen(open => !open)
    }
    window.addEventListener('keydown', toggleMap)
    return () => window.removeEventListener('keydown', toggleMap)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* top-left: clock + room */}
      <div className="designer-frame-surface hud-gothic-info-frame absolute left-4 top-4 backdrop-blur-sm">
        <GothicFrame />
        <div className="font-serif text-2xl tracking-wide text-[#e8d8a0]">{snap.clockText}</div>
        <div className="mt-1 h-1 w-40 overflow-hidden rounded bg-[#242220]">
          <div className="h-full bg-gradient-to-r from-[#3a4a6a] to-[#c9a227]" style={{ width: `${hourProgress * 100}%` }} />
        </div>
        <div className="mt-2 font-serif text-sm text-[#c9b98a]">{snap.playerRoomName}</div>
        <div className="max-w-52 text-xs italic text-[#8a8478]">{snap.playerRoomBrief}</div>
        <div className="mt-2 flex gap-3 text-[10px] uppercase tracking-wider text-[#8a8478]">
          <span>{snap.aliveCount} alive</span>
          <span className={snap.bodiesFound > 0 ? 'text-[#e86a5a]' : ''}>{snap.bodiesFound} bodies</span>
          <span>{snap.settings.director === 'llm' ? 'Dialogue: LLM' : 'Dialogue: built-in'}</span>
        </div>
      </div>

      {/* bottom-right: minimap + buttons */}
      <div className="absolute bottom-4 right-4 flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-1">
        {mapOpen && (
          <div className="designer-frame-surface hud-gothic-map-frame relative">
            <GothicFrame />
            <Minimap snap={snap} />
          </div>
        )}
        <div className="designer-frame-surface hud-gothic-action-frame pointer-events-auto relative flex gap-1.5">
          <GothicFrame variant="chat" />
          <button
            type="button"
            onClick={() => setMapOpen(open => !open)}
            aria-expanded={mapOpen}
            className="min-w-0 flex-1 rounded border border-[#3a352a] bg-black/70 px-2 py-1.5 font-serif text-xs text-[#c9b98a] hover:border-[#c9a227] hover:text-[#e8d8a0]"
          >
            {mapOpen ? 'Hide' : 'Map'} <span className="text-[#8a8478]">[M]</span>
          </button>
          <button
            onClick={() => game.setPhase('journal')}
            className="min-w-0 flex-1 rounded border border-[#3a352a] bg-black/70 px-2 py-1.5 font-serif text-xs text-[#c9b98a] hover:border-[#c9a227] hover:text-[#e8d8a0]"
          >
            Journal <span className="text-[#8a8478]">[J]</span>
          </button>
          <button
            onClick={() => game.setPhase('accuse')}
            className="min-w-0 flex-1 rounded border border-[#6a2a22] bg-[#2a0d0a]/80 px-2 py-1.5 font-serif text-xs font-semibold text-[#e86a5a] hover:border-[#e86a5a] hover:bg-[#e86a5a]/20"
          >
            ⚖ Accuse
          </button>
          <button
            onClick={() => game.updateSettings({ muted: !snap.settings.muted })}
            className="min-w-0 rounded border border-[#3a352a] bg-black/70 px-2 py-1.5 font-serif text-xs text-[#c9b98a] hover:border-[#c9a227] hover:text-[#e8d8a0]"
          >
            {snap.settings.muted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={() => game.setPhase('paused')}
            className="min-w-0 flex-1 rounded border border-[#3a352a] bg-black/70 px-2 py-1.5 font-serif text-xs text-[#c9b98a] hover:border-[#c9a227] hover:text-[#e8d8a0]"
          >
            Pause <span className="text-[#8a8478]">[Esc]</span>
          </button>
        </div>
      </div>

      {snap.evidenceDiscovery && (
        <div
          key={snap.evidenceDiscovery.id}
          data-evidence-discovery
          className="absolute left-1/2 top-6 z-[60] w-[24rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded border border-[#8ab8a0]/70 bg-[#0b1110]/95 shadow-[0_0_36px_rgba(76,132,108,0.3)] backdrop-blur-md"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-[#8ab8a0] to-transparent" />
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-[#49685b] bg-[#111816] shadow-inner">
              <img
                src={`${import.meta.env.BASE_URL}assets/evidence/${snap.evidenceDiscovery.evidenceId}.png`}
                alt=""
                aria-hidden="true"
                className="h-12 w-12 object-contain [image-rendering:pixelated]"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-[0.24em] text-[#8ab8a0]">Evidence type discovered</div>
              <div className="mt-0.5 font-serif text-base leading-tight text-[#e8d8a0]">{snap.evidenceDiscovery.label}</div>
              <div className="mt-1 text-[11px] text-[#8f9c93]">Associated with {snap.evidenceDiscovery.guestName} · revealed in the journal</div>
            </div>
          </div>
        </div>
      )}

      {/* bottom-center: interaction hint */}
      {snap.interactHint && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded border border-[#c9a227]/60 bg-black/80 px-4 py-2 font-serif text-sm text-[#e8d8a0]">
          {snap.interactHint}
        </div>
      )}
    </div>
  )
}
