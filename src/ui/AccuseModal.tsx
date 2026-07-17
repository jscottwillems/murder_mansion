import { useState } from 'react'
import type { Game } from '@/game/game'
import type { Snapshot } from '@/game/types'

export function AccuseModal({ game, snap }: { game: Game; snap: Snapshot }) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const suspects = snap.guests.filter(g => g.alive)
  const confirmed = suspects.find(g => g.id === confirmId)

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[36rem] max-w-[92vw] rounded border border-[#3a352a] bg-[#0d0c12]/95 p-6 shadow-2xl">
        <h2 className="font-serif text-2xl text-[#e8d8a0]">Name the Murderer</h2>
        <p className="mt-1 text-xs italic text-[#8a8478]">
          There is no taking this back. A correct accusation closes the case — a wrong one lets the killer walk free.
        </p>

        {!confirmed ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {suspects.map(g => (
              <button
                key={g.id}
                onClick={() => setConfirmId(g.id)}
                className="flex items-center gap-2 rounded border border-[#2a2822] bg-black/40 p-2 text-left transition-colors hover:border-[#e86a5a]"
              >
                <div className="h-8 w-8 shrink-0 rounded-sm" style={{ background: g.color }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-serif text-sm text-[#e8d8a0]">{g.name}</div>
                  <div className="text-[9px] uppercase tracking-wider text-[#8a8478]">{g.archetypeName}</div>
                  <div className="mt-1 h-1 overflow-hidden rounded bg-[#242220]">
                    <div
                      className={`h-full ${g.suspicion > 0.66 ? 'bg-[#e86a5a]' : g.suspicion > 0.33 ? 'bg-[#c9862a]' : 'bg-[#6a8a5a]'}`}
                      style={{ width: `${Math.round(g.suspicion * 100)}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded border border-[#6a2a22] bg-[#1a0d0a]/60 p-4 text-center">
            <div className="mx-auto mb-2 h-10 w-10 rounded-sm" style={{ background: confirmed.color }} />
            <div className="font-serif text-lg text-[#e8d8a0]">{confirmed.name}</div>
            <div className="text-[10px] uppercase tracking-widest text-[#8a8478]">{confirmed.archetypeName}</div>
            <p className="mt-3 font-serif text-sm italic text-[#c9c0b0]">
              “The murderer in this house… is you.”
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => game.accuse(confirmed.id)}
                className="flex-1 rounded border border-[#e86a5a] bg-[#e86a5a]/20 px-4 py-2 font-serif text-sm text-[#e86a5a] transition-colors hover:bg-[#e86a5a]/40"
              >
                Make the Accusation
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="rounded border border-[#3a352a] px-4 py-2 font-serif text-sm text-[#8a8478] hover:text-[#e8d8a0]"
              >
                Not yet
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => game.setPhase('playing')}
          className="mt-4 w-full rounded border border-[#3a352a] bg-black/50 py-1.5 font-serif text-xs uppercase tracking-widest text-[#8a8478] hover:border-[#c9a227] hover:text-[#e8d8a0]"
        >
          Keep Investigating [Esc]
        </button>
      </div>
    </div>
  )
}
