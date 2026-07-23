import { useState } from 'react'
import type { Game } from '@/game/game'
import type { Snapshot } from '@/game/types'
import { GothicFrame } from '@/ui/GothicFrame'
import { GuestPortrait } from '@/ui/GuestPortrait'
import type { ArchiveDisposition } from '@/game/narrative/types'

export function AccuseModal({ game, snap }: { game: Game; snap: Snapshot }) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [disposition, setDisposition] = useState<ArchiveDisposition>('seal')
  const suspects = snap.guests.filter(g => g.alive)
  const confirmed = suspects.find(g => g.id === confirmId)

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black/70 backdrop-blur-sm">
      <div className="gothic-frame gothic-frame--popup relative flex h-[43rem] max-h-[94vh] w-[58rem] max-w-[94vw] flex-col overflow-hidden shadow-2xl">
        <GothicFrame />
        <header className="border-b border-[#2a2822] px-20 pb-4 pt-36 sm:px-36">
          <h2 className="font-serif text-xl text-[#e8d8a0]">Name the Murderer</h2>
          <p className="mt-1 max-w-xl text-xs italic text-[#8a8478]">
            There is no taking this back. A correct accusation closes the case — a wrong one lets the killer walk free.
          </p>
        </header>

        <div className="mx-16 mb-24 mt-6 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain sm:mx-36 sm:mb-36">
          {!confirmed ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {suspects.map(g => (
              <button
                key={g.id}
                onClick={() => setConfirmId(g.id)}
                data-accuse-guest={g.archetypeId}
                className="flex min-h-28 items-start gap-3 rounded border border-[#2a2822] bg-black/30 p-3 text-left transition-colors hover:border-[#e86a5a] hover:bg-[#1a0d0a]/50"
              >
                <GuestPortrait archetypeId={g.archetypeId} name={g.name} alive={g.alive} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-serif text-sm text-[#e8d8a0]">{g.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#8a8478]">{g.archetypeName}</div>
                  <div className="mt-3 text-[10px] uppercase tracking-wider text-[#6a6458]">Suspicion</div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded bg-[#242220]">
                    <div
                      className={`h-full ${g.suspicion > 0.66 ? 'bg-[#e86a5a]' : g.suspicion > 0.33 ? 'bg-[#c9862a]' : 'bg-[#6a8a5a]'}`}
                      style={{ width: `${Math.round(g.suspicion * 100)}%` }}
                    />
                  </div>
                  <div className="mt-3 font-serif text-xs uppercase tracking-wider text-[#c9b98a]">Select suspect</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded border border-[#6a2a22] bg-[#1a0d0a]/60 p-5">
            <div className="flex items-center justify-center gap-4">
              <GuestPortrait archetypeId={confirmed.archetypeId} name={confirmed.name} alive={confirmed.alive} />
              <div>
                <div className="font-serif text-lg text-[#e8d8a0]">{confirmed.name}</div>
                <div className="text-[10px] uppercase tracking-widest text-[#8a8478]">{confirmed.archetypeName}</div>
                <p className="mt-3 font-serif text-sm italic text-[#c9c0b0]">“The murderer in this house… is you.”</p>
              </div>
            </div>
            <div className="mx-auto mt-5 flex max-w-md gap-2">
              <div className="w-full">
                <div className="mb-2 text-center text-[10px] uppercase tracking-widest text-[#8a8478]">Final archive disposition</div>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {(['publish', 'seal', 'destroy'] as const).map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDisposition(value)}
                      className={`rounded border px-2 py-1.5 font-serif text-xs capitalize ${disposition === value ? 'border-[#c9a227] bg-[#c9a227]/15 text-[#e8d8a0]' : 'border-[#3a352a] text-[#8a8478]'}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              <button
                onClick={() => game.accuse(confirmed.id, disposition)}
                className="w-full rounded border border-[#e86a5a] bg-[#e86a5a]/20 px-4 py-2 font-serif text-sm text-[#e86a5a] transition-colors hover:bg-[#e86a5a]/40"
              >
                Accuse and {disposition} the archive
              </button>
              </div>
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
    </div>
  )
}
