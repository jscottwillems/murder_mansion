import { useState } from 'react'
import type { Game } from '@/game/game'
import type { Snapshot } from '@/game/types'
import { GuestPortrait } from '@/ui/GuestPortrait'

export function DialoguePanel({ game, snap }: { game: Game; snap: Snapshot }) {
  const [confirmAccuse, setConfirmAccuse] = useState(false)
  const iv = snap.interview
  if (!iv) return null
  const guest = snap.guests.find(g => g.id === iv.guestId)
  if (!guest) return null
  const mood = iv.thinking ? 'thoughtful' : iv.emotion

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 flex max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] justify-end">
      <div className="pointer-events-auto flex h-[min(26.375rem,calc(100vh-2rem))] w-[48rem] max-w-full flex-col overflow-hidden rounded-lg border border-[#3a352a] bg-[#0d0c12]/95 shadow-2xl backdrop-blur">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-6">
          <div className="flex min-h-0 flex-1 items-start gap-5">
            <GuestPortrait archetypeId={guest.archetypeId} name={guest.name} alive={guest.alive} size="dialog" dialogueMood={mood} />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col self-stretch">
              <div className="flex items-start gap-3">
                <div className="min-w-0">
                  <div className="font-serif text-lg text-[#e8d8a0]">{guest.name}</div>
                  <div className="text-xs uppercase tracking-widest text-[#8a8478]">{guest.archetypeName}</div>
                </div>
                <div className="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-[#6a6458]">
                  The night moves on
                </div>
              </div>

              <div className="mt-3 h-[9.375rem] shrink-0 overflow-y-auto rounded border border-[#2a2822] bg-black/40 p-4">
                {iv.lastQuestion && (
                  <div className="mb-2 text-xs italic text-[#7a8ab0]">You: {iv.lastQuestion}</div>
                )}
                <div className="font-serif text-[15px] leading-relaxed text-[#d8d0c0]">
                  {iv.thinking ? '…' : iv.lastAnswer}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid shrink-0 grid-cols-2 gap-2">
            {iv.questions.map(q => (
              <button
                key={q.topic}
                disabled={iv.thinking}
                onClick={() => game.ask(q.topic)}
                className="rounded border border-[#3a352a] bg-[#16151d] px-3 py-2 text-left text-sm text-[#c9b98a] transition-colors hover:border-[#c9a227] hover:text-[#e8d8a0] disabled:opacity-40"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-[#2a2822] bg-[#0a090e]/95 p-4">
          <button
            onClick={() => game.endInterview()}
            className="flex-1 rounded border border-[#3a352a] bg-black/50 py-1.5 font-serif text-xs uppercase tracking-widest text-[#8a8478] hover:border-[#c9a227] hover:text-[#e8d8a0]"
          >
            End Interview [Esc]
          </button>
          {confirmAccuse ? (
            <button
              onClick={() => game.accuse(guest.id)}
              className="flex-1 rounded border border-[#e86a5a] bg-[#e86a5a]/30 py-1.5 font-serif text-xs font-semibold uppercase tracking-widest text-[#e86a5a] hover:bg-[#e86a5a]/50"
            >
              Confirm: {guest.name} is the killer
            </button>
          ) : (
            <button
              onClick={() => setConfirmAccuse(true)}
              className="flex-1 rounded border border-[#6a2a22] bg-[#2a0d0a]/60 py-1.5 font-serif text-xs uppercase tracking-widest text-[#e86a5a] hover:border-[#e86a5a]"
            >
              ⚖ Accuse {guest.name.split(' ')[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
