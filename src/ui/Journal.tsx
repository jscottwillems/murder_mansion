import { useState } from 'react'
import type { Game } from '@/game/game'
import type { Snapshot } from '@/game/types'
import { EVIDENCE_BY_ARCHETYPE } from '@/game/data'
import { GuestPortrait } from '@/ui/GuestPortrait'

type Tab = 'leads' | 'evidence' | 'guests' | 'interviews'

export function Journal({ game, snap }: { game: Game; snap: Snapshot }) {
  const [tab, setTab] = useState<Tab>('leads')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [openTranscript, setOpenTranscript] = useState<string | null>(null)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'leads', label: `Leads (${snap.leads.length})` },
    { id: 'evidence', label: `Evidence (${snap.evidence.length})` },
    { id: 'guests', label: 'Guests' },
    { id: 'interviews', label: 'Interviews' },
  ]

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex h-[34rem] max-h-[94vh] w-[46rem] max-w-[94vw] flex-col rounded border border-[#3a352a] bg-[#0d0c12]/95 shadow-2xl">
        <div className="grid grid-cols-[1fr_auto] items-center gap-y-2 border-b border-[#2a2822] px-3 py-3 sm:flex sm:px-5">
          <div className="order-1 font-serif text-xl text-[#e8d8a0] sm:order-none">Case Journal</div>
          <div className="order-3 col-span-2 row-start-2 flex justify-center gap-1 sm:order-none sm:row-auto sm:ml-6">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded px-3 py-1.5 font-serif text-sm transition-colors ${
                  tab === t.id ? 'bg-[#c9a227]/20 text-[#e8d8a0]' : 'text-[#8a8478] hover:text-[#c9b98a]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => game.setPhase('playing')}
            className="order-2 ml-auto rounded border border-[#3a352a] px-3 py-1 font-serif text-xs text-[#8a8478] hover:border-[#c9a227] hover:text-[#e8d8a0] sm:order-none"
          >
            Close [J]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'leads' && (
            <div className="space-y-2">
              {snap.leads.length === 0 && <div className="text-sm italic text-[#6a6458]">No leads yet. Interview guests, eavesdrop on conversations.</div>}
              {[...snap.leads].reverse().map(l => (
                <div key={l.id} className="rounded border border-[#242220] bg-black/30 px-3 py-2">
                  <div className="flex gap-2 text-[10px] uppercase tracking-wider">
                    <span className="text-[#6a6458]">{fmtMin(l.atMin)}</span>
                    <span className={l.kind === 'discovery' ? 'text-[#e86a5a]' : l.kind === 'evidence' ? 'text-[#8ab8a0]' : l.kind === 'rumor' ? 'text-[#7a8ab0]' : l.kind === 'interview' ? 'text-[#c9b98a]' : 'text-[#6a6458]'}>
                      {l.kind}
                    </span>
                    <span className="text-[#6a6458]">via {l.source}</span>
                  </div>
                  <div className="mt-0.5 text-sm text-[#d8d0c0]">{l.text}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'evidence' && (
            <div>
              {snap.evidence.length === 0 && (
                <div className="rounded border border-dashed border-[#3a352a] bg-black/20 px-5 py-10 text-center">
                  <div className="font-serif text-base text-[#8a8478]">No physical evidence collected</div>
                  <div className="mt-1 text-xs italic text-[#5f5a50]">Investigate a discovered body to preserve its scene trace.</div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[...snap.evidence].reverse().map(item => (
                  <article key={item.id} className="overflow-hidden rounded border border-[#3b3528] bg-black/35">
                    <div className="flex gap-3 p-3">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded border border-[#4b4330] bg-[#111016] shadow-inner">
                        <img
                          src={`${import.meta.env.BASE_URL}assets/evidence/${item.evidenceId}.png`}
                          alt={item.label}
                          className="h-[5.5rem] w-[5.5rem] object-contain [image-rendering:pixelated]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[9px] uppercase tracking-[0.16em] text-[#8ab8a0]">Physical evidence</div>
                        <h3 className="mt-0.5 font-serif text-sm leading-tight text-[#e8d8a0]">{item.label}</h3>
                        <div className="mt-1 text-[10px] text-[#6f695e]">{fmtMin(item.atMin)} · {item.source}</div>
                      </div>
                    </div>
                    <div className="border-t border-[#2a2822] px-3 py-2.5">
                      <p className="text-xs leading-relaxed text-[#c7c0b3]">{item.description}</p>
                      <div className="mt-2 text-[10px] uppercase tracking-wider text-[#6a6458]">Possible sources</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.candidateNames.map(name => <Badge key={name} text={name} tone="info" />)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === 'guests' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {snap.guests.map(g => (
                <div key={g.id} className={`rounded border p-3 ${g.alive ? 'border-[#2a2822] bg-black/30' : 'border-[#4a2a22] bg-[#1a0d0a]/50'}`}>
                  <div className="flex gap-3">
                    <GuestPortrait archetypeId={g.archetypeId} name={g.name} alive={g.alive} />
                    <div className="min-w-0 flex-1">
                      <div className={`font-serif text-sm ${g.alive ? 'text-[#e8d8a0]' : 'text-[#8a6a62] line-through'}`}>{g.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-[#8a8478]">{g.archetypeName}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge text={g.alive ? 'Alive' : 'Dead'} tone={g.alive ? 'ok' : 'bad'} />
                        {g.interviewed && <Badge text="Interviewed" tone="info" />}
                        {g.visible && <Badge text="Visible" tone="gold" />}
                        {g.recentlyActive && !g.visible && <Badge text="Recently Active" tone="dim" />}
                        {g.roomName && <Badge text={g.roomName} tone="dim" />}
                      </div>
                      {g.alive && (
                        <>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-[#6a6458]">Suspicion</span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded bg-[#242220]">
                              <div
                                className={`h-full ${g.suspicion > 0.66 ? 'bg-[#e86a5a]' : g.suspicion > 0.33 ? 'bg-[#c9862a]' : 'bg-[#6a8a5a]'}`}
                                style={{ width: `${Math.round(g.suspicion * 100)}%` }}
                              />
                            </div>
                          </div>
                          {confirmId === g.id ? (
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => { setConfirmId(null); game.accuse(g.id) }}
                                className="flex-1 rounded border border-[#e86a5a] bg-[#e86a5a]/20 px-2 py-1 font-serif text-xs text-[#e86a5a] hover:bg-[#e86a5a]/40"
                              >
                                Confirm Accusation
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                className="rounded border border-[#3a352a] px-2 py-1 text-xs text-[#8a8478] hover:text-[#e8d8a0]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmId(g.id)}
                              className="mt-2 w-full rounded border border-[#3a352a] px-2 py-1 font-serif text-xs uppercase tracking-wider text-[#c9b98a] hover:border-[#e86a5a] hover:text-[#e86a5a]"
                            >
                              Accuse
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div data-guest-evidence={g.archetypeId} className="mt-2.5 border-t border-[#2a2822] pt-2">
                    <div className="mb-1.5 text-[8px] uppercase tracking-[0.16em] text-[#6a6458]">Associated evidence</div>
                    <div className="grid grid-cols-3 gap-1">
                      {EVIDENCE_BY_ARCHETYPE[g.archetypeId].map(evidence => (
                        <div
                          key={evidence.id}
                          data-evidence-id={evidence.id}
                          title={evidence.description}
                          className="flex h-[4.5rem] min-w-0 flex-col items-center justify-center rounded border border-[#353025] bg-[#111016]/80 px-1 py-1 text-center"
                        >
                          <img
                            src={`${import.meta.env.BASE_URL}assets/evidence/${evidence.id}.png`}
                            alt=""
                            aria-hidden="true"
                            className="h-8 w-8 shrink-0 object-contain [image-rendering:pixelated]"
                          />
                          <span className="mt-1 flex h-6 w-full items-center justify-center overflow-hidden text-[8px] leading-[0.65rem] text-[#a9a093] [overflow-wrap:anywhere]">{evidence.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'interviews' && (
            <div className="space-y-2">
              {snap.guests.filter(g => g.interviewed).length === 0 && (
                <div className="text-sm italic text-[#6a6458]">No interviews yet. Walk up to a guest and press E.</div>
              )}
              {snap.guests.filter(g => g.interviewed).map(g => {
                const entries = snap.transcripts[g.id] ?? []
                const open = openTranscript === g.id
                return (
                  <div key={g.id} className="rounded border border-[#242220] bg-black/30">
                    <button
                      onClick={() => setOpenTranscript(open ? null : g.id)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left"
                    >
                      <GuestPortrait archetypeId={g.archetypeId} name={g.name} alive={g.alive} size="compact" />
                      <span className="min-w-0">
                        <span className="block font-serif text-sm text-[#e8d8a0]">{g.name}</span>
                        <span className="block text-xs text-[#6a6458]">{entries.length} exchange{entries.length === 1 ? '' : 's'}</span>
                      </span>
                      <span className="ml-auto text-[#6a6458]">{open ? '▾' : '▸'}</span>
                    </button>
                    {open && (
                      <div className="space-y-2 border-t border-[#242220] p-3">
                        {entries.map((e, i) => (
                          <div key={i}>
                            <div className="text-xs italic text-[#7a8ab0]">[{fmtMin(e.atMin)}] You: {e.q}</div>
                            <div className="font-serif text-sm text-[#d8d0c0]">{e.a}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Badge({ text, tone }: { text: string; tone: 'ok' | 'bad' | 'info' | 'gold' | 'dim' }) {
  const cls = {
    ok: 'border-[#4a6a3a] text-[#8ab86a]',
    bad: 'border-[#6a2a22] text-[#e86a5a]',
    info: 'border-[#3a4a6a] text-[#8aa8d8]',
    gold: 'border-[#8a6a20] text-[#c9a227]',
    dim: 'border-[#3a352a] text-[#8a8478]',
  }[tone]
  return <span className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${cls}`}>{text}</span>
}

function fmtMin(min: number): string {
  const m = Math.max(0, Math.floor(min))
  const h = Math.floor(m / 60) % 24
  const h12 = h % 12 === 0 ? 12 : h % 12
  const ampm = h < 12 ? 'AM' : 'PM'
  return `${h12}:${String(m % 60).padStart(2, '0')} ${ampm}`
}
