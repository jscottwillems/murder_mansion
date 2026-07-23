import { useCallback, useEffect, useRef, useState } from 'react'
import type { Game } from '@/game/game'
import type { Snapshot } from '@/game/types'
import { GuestPortrait } from '@/ui/GuestPortrait'
import { GothicFrame } from '@/ui/GothicFrame'
import { INTENT_COLORS, INTENT_DEFAULT_COLOR } from '@/ui/intents'

export function DialoguePanel({ game, snap }: { game: Game; snap: Snapshot }) {
  const [confirmAccuse, setConfirmAccuse] = useState(false)
  const iv = snap.interview
  const answer = iv?.thinking ? '' : (iv?.lastAnswer ?? '')
  const { printedAnswer, isPrinting, skipPrinting } = useSentenceTypewriter(game, answer, Boolean(iv?.thinking))
  const answerScrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = answerScrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [printedAnswer])
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
  const showBackToTopics = Boolean(iv.activeThreadId && !iv.thinking && !isPrinting && iv.concluded)

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 flex max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] justify-start overflow-hidden xl:max-w-[calc(100vw-23rem)]">
      <div className="gothic-frame gothic-frame--chat pointer-events-auto relative flex h-[min(36rem,calc(100vh-2rem))] w-[58rem] max-w-full flex-col overflow-hidden shadow-2xl">
        <GothicFrame variant="chat" />
        <div className="dialogue-window-content flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-1">
            <div className="grid h-[12.5rem] shrink-0 grid-cols-[12.5rem_minmax(0,1fr)] gap-2">
              <div className="h-full w-full overflow-hidden">
                <div className="origin-top-left scale-125">
                  <GuestPortrait archetypeId={guest.archetypeId} name={guest.name} alive={guest.alive} size="dialog" dialogueMood={mood} />
                </div>
              </div>
              <div className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)]">
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <div className="font-serif text-lg text-[#e8d8a0]">{guest.name}</div>
                    <div className="text-xs uppercase tracking-widest text-[#8a8478]">{guest.archetypeName}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-[#6f796f]">
                      Trust {iv.trust >= 3 ? 'high' : iv.trust > 0 ? 'steady' : iv.trust < 0 ? 'strained' : 'guarded'}
                      {' · '}Pressure {iv.pressure >= 5 ? 'severe' : iv.pressure > 0 ? 'rising' : 'low'}
                      {' · '}{iv.threadStatus === 'topics' ? 'topics' : iv.threadStatus.replace('-', ' ')}
                    </div>
                  </div>
                  <div className="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-[#6a6458]">
                    <div>Time stands still</div>
                    <div className={`mt-1 text-right ${iv.responseSource === 'fallback' ? 'text-[#e86a5a]' : 'text-[#8a8478]'}`}>
                      {iv.responseSource === 'llm' ? 'LLM dialogue'
                        : iv.responseSource === 'repair' ? 'LLM repaired'
                        : iv.responseSource === 'fallback' ? 'LLM failed · built-in fallback'
                          : 'Built-in dialogue'}
                    </div>
                  </div>
                </div>

                <div ref={answerScrollRef} className="relative mt-1.5 min-h-0 overflow-y-auto overscroll-contain rounded border border-[#2a2822] bg-black/40 p-3 pb-6">
                  {iv.lastQuestion && (
                    <div className="mb-2 text-xs italic text-[#7a8ab0]">You: {iv.lastQuestion}</div>
                  )}
                  <div aria-live="polite" className="font-serif text-sm leading-relaxed text-[#d8d0c0]">
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

            {!showBackToTopics && (
              <div className="mt-auto grid h-[7.5rem] shrink-0 auto-rows-[3.625rem] grid-cols-1 content-start gap-1 overflow-hidden sm:grid-cols-3">
                {iv.questions.map(q => (
                  <button
                    key={q.id}
                    disabled={iv.thinking || isPrinting || q.disabled}
                    onClick={() => game.ask(q.id)}
                    style={{ borderColor: (q.intent && INTENT_COLORS[q.intent]) || INTENT_DEFAULT_COLOR }}
                    className="flex items-center rounded border-l-2 border border-[#3a352a] bg-[#16151d] px-2 py-1 text-left text-xs leading-tight text-[#c9b98a] transition hover:bg-[#1f1d28] hover:text-[#e8d8a0] hover:brightness-110 disabled:opacity-40"
                  >
                    <span className="line-clamp-3">{q.label}</span>
                  </button>
                ))}
              </div>
            )}
            {showBackToTopics && (
              <div className="mt-auto flex h-[7.5rem] shrink-0 flex-col justify-between gap-1">
                {iv.conclusion && (
                  <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain rounded border-l-2 border bg-black/30 px-3 py-2 text-xs leading-relaxed ${
                    iv.conclusion.kind === 'evidence'
                      ? 'border-[#547564] text-[#9fc4ae]'
                      : iv.conclusion.kind === 'information' || iv.conclusion.kind === 'cleared'
                        ? 'border-[#5a6175] text-[#aeb8d3]'
                        : 'border-[#6d5149] text-[#c49d91]'
                  }`}>
                    <div className="mb-1 uppercase tracking-[0.14em] text-[#8a8478]">Detective's conclusion</div>
                    {iv.conclusion.summary}
                  </div>
                )}
                <button
                  onClick={() => game.returnToInterviewTopics()}
                  className="shrink-0 self-start py-1 text-xs text-[#7a8ab0] hover:text-[#b8c6e8]"
                >
                  ← Back to other topics
                </button>
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-1 bg-[#0a090e]/95 py-1.5">
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
                Confirm accuse {guest.name}
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
