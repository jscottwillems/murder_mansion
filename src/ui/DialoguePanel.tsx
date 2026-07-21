import { useCallback, useEffect, useRef, useState } from 'react'
import type { Game } from '@/game/game'
import type { Snapshot } from '@/game/types'
import { GuestPortrait } from '@/ui/GuestPortrait'
import { GothicFrame } from '@/ui/GothicFrame'

export function DialoguePanel({ game, snap }: { game: Game; snap: Snapshot }) {
  const [confirmAccuse, setConfirmAccuse] = useState(false)
  const iv = snap.interview
  const answer = iv?.thinking ? '' : (iv?.lastAnswer ?? '')
  const { printedAnswer, isPrinting, skipPrinting } = useSentenceTypewriter(game, answer, Boolean(iv?.thinking))
  useEffect(() => {
    if (!isPrinting) return
    const skipOnEnter = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.repeat) return
      event.preventDefault()
      event.stopPropagation()
      skipPrinting()
    }
    window.addEventListener('keydown', skipOnEnter, true)
    return () => window.removeEventListener('keydown', skipOnEnter, true)
  }, [isPrinting, skipPrinting])
  if (!iv) return null
  const guest = snap.guests.find(g => g.id === iv.guestId)
  if (!guest) return null
  const mood = iv.thinking ? 'thoughtful' : iv.emotion

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 flex max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] justify-start overflow-hidden xl:max-w-[calc(100vw-25rem)]">
      <div className="gothic-frame gothic-frame--chat pointer-events-auto relative flex h-[min(36rem,calc(100vh-2rem))] w-[55rem] max-w-full flex-col overflow-hidden shadow-2xl backdrop-blur">
        <GothicFrame variant="chat" />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-[13.5%] pb-4 pt-[11.5%]">
          <div className="flex shrink-0 items-start gap-5">
            <GuestPortrait archetypeId={guest.archetypeId} name={guest.name} alive={guest.alive} size="dialog" dialogueMood={mood} />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start gap-3">
                <div className="min-w-0">
                  <div className="font-serif text-lg text-[#e8d8a0]">{guest.name}</div>
                  <div className="text-xs uppercase tracking-widest text-[#8a8478]">{guest.archetypeName}</div>
                </div>
                <div className="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-[#6a6458]">
                  <div>Time stands still</div>
                  <div className={`mt-1 text-right ${iv.responseSource === 'fallback' ? 'text-[#e86a5a]' : 'text-[#8a8478]'}`}>
                    {iv.responseSource === 'llm' ? 'LLM dialogue'
                      : iv.responseSource === 'fallback' ? 'LLM failed · built-in fallback'
                        : 'Built-in dialogue'}
                  </div>
                </div>
              </div>

              <div className="relative mt-3 h-28 shrink-0 overflow-y-auto rounded border border-[#2a2822] bg-black/40 p-4 pb-7">
                {iv.lastQuestion && (
                  <div className="mb-2 text-xs italic text-[#7a8ab0]">You: {iv.lastQuestion}</div>
                )}
                <div aria-live="polite" className="font-serif text-[15px] leading-relaxed text-[#d8d0c0]">
                  {iv.thinking ? '…' : printedAnswer}
                  {isPrinting && <span aria-hidden="true" className="ml-0.5 animate-pulse text-[#c9a227]">▌</span>}
                </div>
                {isPrinting && (
                  <button
                    type="button"
                    onClick={skipPrinting}
                    className="absolute bottom-1.5 right-2 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-[#665f52] transition-colors hover:text-[#b5a77e] focus-visible:text-[#d8c895] focus-visible:outline-none"
                    aria-label="Reveal full reply"
                  >
                    Enter ↵ reveal
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3">
            {iv.questions.map(q => (
              <button
                key={q.id}
                disabled={iv.thinking || isPrinting || q.disabled}
                onClick={() => game.ask(q.id)}
                className="rounded border border-[#3a352a] bg-[#16151d] px-2.5 py-2 text-left text-xs leading-snug text-[#c9b98a] transition-colors hover:border-[#c9a227] hover:text-[#e8d8a0] disabled:opacity-40"
              >
                {q.label}
              </button>
            ))}
          </div>
          {iv.activeThreadId && !iv.thinking && !isPrinting && iv.threadStatus !== 'active' && (
            <button
              onClick={() => game.returnToInterviewTopics()}
              className="mt-2 self-start text-xs text-[#7a8ab0] hover:text-[#b8c6e8]"
            >
              ← Back to other topics
            </button>
          )}
        </div>

        <div className="mx-[13.5%] mb-[11.5%] flex shrink-0 gap-2 border-t border-[#2a2822] bg-[#0a090e]/95 p-2">
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

function useSentenceTypewriter(game: Game, answer: string, thinking: boolean) {
  const [printedAnswer, setPrintedAnswer] = useState('')
  const [isPrinting, setIsPrinting] = useState(false)
  const skipRef = useRef<() => void>(() => undefined)
  const skipPrinting = useCallback(() => skipRef.current(), [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let cancelled = false
    skipRef.current = () => undefined
    game.setDialogueTyping(false)

    if (thinking || !answer) {
      timer = setTimeout(() => {
        setPrintedAnswer('')
        setIsPrinting(false)
      }, 0)
      return () => {
        if (timer) clearTimeout(timer)
        skipRef.current = () => undefined
        game.setDialogueTyping(false)
      }
    }

    const sentences = answer.match(/[^.!?]+(?:[.!?]+[”"']*|$)/g) ?? [answer]
    let sentenceIndex = 0
    let charIndex = 0
    let rendered = ''
    let firstCharacter = true

    skipRef.current = () => {
      if (cancelled) return
      cancelled = true
      if (timer) clearTimeout(timer)
      setPrintedAnswer(answer)
      setIsPrinting(false)
      game.setDialogueTyping(false)
      skipRef.current = () => undefined
    }

    const typeNext = () => {
      if (cancelled) return
      const sentence = sentences[sentenceIndex]
      if (charIndex < sentence.length) {
        const char = sentence[charIndex++]
        rendered += char
        setPrintedAnswer(rendered)
        game.setDialogueTyping(true, firstCharacter)
        firstCharacter = false
        const delay = char === ',' || char === ';' || char === ':' ? 85
          : char === '—' ? 120
            : char === ' ' ? 20
              : 31
        timer = setTimeout(typeNext, delay)
        return
      }

      sentenceIndex++
      charIndex = 0
      if (sentenceIndex < sentences.length) {
        game.setDialogueTyping(false)
        timer = setTimeout(() => {
          if (cancelled) return
          game.setDialogueTyping(true)
          typeNext()
        }, 280)
      } else {
        setIsPrinting(false)
        game.setDialogueTyping(false)
        skipRef.current = () => undefined
      }
    }

    timer = setTimeout(() => {
      setPrintedAnswer('')
      setIsPrinting(true)
      timer = setTimeout(typeNext, 70)
    }, 0)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      skipRef.current = () => undefined
      game.setDialogueTyping(false)
    }
  }, [answer, game, thinking])

  return { printedAnswer, isPrinting, skipPrinting }
}
