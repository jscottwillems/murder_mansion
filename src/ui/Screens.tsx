import type { ReactNode } from 'react'
import type { Game } from '@/game/game'
import type { Settings, Snapshot } from '@/game/types'
import type { ArchiveDisposition, CaseOutcome } from '@/game/narrative/types'
import { GothicFrame } from '@/ui/GothicFrame'
import { INTENT_COLORS, INTENT_LEGEND } from '@/ui/intents'

const serifBtn =
  'w-72 rounded border border-[#3a352a] bg-black/60 px-6 py-3 font-serif text-lg text-[#c9b98a] transition-colors hover:border-[#c9a227] hover:text-[#e8d8a0]'

// Temporarily disabled: LLM dialogue mode is hidden from the setup and settings UI.
const LLM_ENABLED = false

export function TitleScreen({ game }: { game: Game }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/70 via-black/40 to-black/80">
      <div
        className="designer-frame-surface title-gothic-frame relative flex max-h-[94vh] w-[76rem] max-w-[94vw] flex-col items-center overflow-hidden"
      >
        <GothicFrame />
        <div className="mb-2 text-xs uppercase tracking-[0.5em] text-[#8a8478]">A noir deduction simulation</div>
        <h1 className="font-serif text-5xl tracking-wide text-[#e8d8a0] drop-shadow-[0_4px_12px_#000] lg:text-6xl">
          MURDER <span className="text-[#c9a227]">MANSION</span>
        </h1>
        <div className="mt-3 max-w-lg text-center font-serif text-sm italic leading-relaxed text-[#a8a090]">
          A guest is dead. You arrived to investigate moments before the storm sealed the mansion.
          Nine suspects remain — and one is the killer.
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <button className={serifBtn} onClick={() => game.setPhase('setup')}>Start the Case</button>
          <button className={serifBtn} onClick={() => game.setPhase('howto')}>How to Play</button>
          <button className={serifBtn} onClick={() => game.openSettings('title')}>Settings</button>
        </div>
        <div className="mt-5 text-[10px] uppercase tracking-widest text-[#5a5448]">
          WASD move · E interview · J journal · Esc pause
        </div>
      </div>
    </div>
  )
}

export function CaseSetupScreen({ game, snap }: { game: Game; snap: Snapshot }) {
  const s = snap.settings
  const director = s.director
  const llmReady = s.llmProvider === 'ollama' || Boolean(s.llmApiKey)
  const selectProvider = (provider: Settings['llmProvider']) => {
    if (provider === 'groq') {
      game.updateSettings({ llmProvider: provider, llmBaseUrl: 'https://api.groq.com/openai/v1', llmModel: 'openai/gpt-oss-20b' })
    } else if (provider === 'ollama') {
      game.updateSettings({ llmProvider: provider, llmBaseUrl: 'http://localhost:11434/v1', llmModel: 'llama3.2' })
    } else {
      game.updateSettings({ llmProvider: provider })
    }
  }

  return (
    <Overlay ornate taller>
      <div className="text-xs uppercase tracking-[0.35em] text-[#8a8478]">Before the case begins</div>
      <h2 className="mt-2 font-serif text-3xl text-[#e8d8a0]">Choose the guests' minds</h2>
      <p className="mt-2 max-w-lg text-center font-serif text-sm italic leading-relaxed text-[#8a8478]">
        Movement and case logic always run locally. This choice controls interview dialogue.
      </p>

      <div className={`mt-6 grid w-full max-w-lg gap-3 ${LLM_ENABLED ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <button
          type="button"
          aria-pressed={director === 'builtin'}
          onClick={() => game.updateSettings({ director: 'builtin' })}
          className={`rounded border p-5 text-left transition-colors ${director === 'builtin' ? 'border-[#c9a227] bg-[#c9a227]/15' : 'border-[#3a352a] bg-black/40 hover:border-[#786a43]'}`}
        >
          <div className="font-serif text-lg text-[#e8d8a0]">Built-in Dialogue</div>
          <div className="mt-2 text-xs leading-relaxed text-[#8a8478]">Fast, reliable, and fully offline. Interviews stay grounded in this case.</div>
        </button>
        {LLM_ENABLED && (
          <button
            type="button"
            aria-pressed={director === 'llm'}
            onClick={() => game.updateSettings({ director: 'llm' })}
            className={`rounded border p-5 text-left transition-colors ${director === 'llm' ? 'border-[#c9a227] bg-[#c9a227]/15' : 'border-[#3a352a] bg-black/40 hover:border-[#786a43]'}`}
          >
            <div className="font-serif text-lg text-[#e8d8a0]">LLM Dialogue</div>
            <div className="mt-2 text-xs leading-relaxed text-[#8a8478]">Authored beats appear instantly; the model may only rewrite the visible line and choice labels.</div>
          </button>
        )}
      </div>

      {LLM_ENABLED && director === 'llm' && (
        <div className="mt-4 w-full max-w-lg space-y-3 rounded border border-[#3a352a] bg-black/50 p-4 text-sm text-[#c9c0b0]">
          <div className="font-serif text-[#c9b98a]">Configure LLM</div>
          <div>
            <div className="mb-1 text-xs uppercase tracking-wider text-[#6a6458]">Provider</div>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                ['groq', 'Groq Free'],
                ['ollama', 'Ollama Local'],
                ['custom', 'Custom'],
              ] as const).map(([provider, label]) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => selectProvider(provider)}
                  className={`rounded border px-2 py-1.5 text-xs ${s.llmProvider === provider ? 'border-[#c9a227] bg-[#c9a227]/15 text-[#e8d8a0]' : 'border-[#3a352a] text-[#8a8478] hover:text-[#c9b98a]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Field label="Base URL" value={s.llmBaseUrl} placeholder="https://api.openai.com/v1"
            onChange={v => game.updateSettings({ llmBaseUrl: v })} />
          {s.llmProvider !== 'ollama' && (
            <Field label="API Key" value={s.llmApiKey} placeholder={s.llmProvider === 'groq' ? 'gsk_…' : 'API key'} type="password"
              onChange={v => game.updateSettings({ llmApiKey: v })} />
          )}
          <Field label="Model" value={s.llmModel} placeholder="gpt-4o-mini"
            onChange={v => game.updateSettings({ llmModel: v })} />
          {s.llmProvider === 'groq' && <div className="text-xs text-[#8a8478]">Create a free Groq key, then paste it above.</div>}
          {s.llmProvider === 'ollama' && <div className="text-xs text-[#8a8478]">Ollama must be running locally with this model and browser access enabled.</div>}
          {!llmReady && <div className="text-xs text-[#e86a5a]">Enter an API key before starting the LLM case.</div>}
        </div>
      )}

      <button
        className={`${serifBtn} mt-6 disabled:cursor-not-allowed disabled:opacity-40`}
        disabled={LLM_ENABLED && director === 'llm' && !llmReady}
        onClick={() => {
          if (!LLM_ENABLED && director === 'llm') game.updateSettings({ director: 'builtin' })
          game.startCase()
        }}
      >
        Begin Case
      </button>
      <button className="mt-3 text-xs uppercase tracking-widest text-[#6a6458] hover:text-[#c9b98a]" onClick={() => game.setPhase('title')}>
        Back to title
      </button>
    </Overlay>
  )
}

export function HowToPlay({ game }: { game: Game }) {
  return (
    <Overlay ornate>
      <h2 className="font-serif text-3xl text-[#e8d8a0]">How to Play</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#c9c0b0]">
        <p><b className="text-[#c9a227]">The situation.</b> You are a detective trapped by a storm with ten guests until 6:00 AM. One of them — chosen at random each case — is the murderer.</p>
        <p><b className="text-[#c9a227]">Move & observe.</b> WASD / arrow keys to walk between the nine rooms. You can only see your current room. Guests wander, gossip, and trade rumors; linger in a room to overhear them.</p>
        <p><b className="text-[#c9a227]">Interview.</b> Press <b>E</b> near a guest. Time stops while you talk. Choose a canonical subject, then decide how to approach it. Each response is edged with a color marking its intent — some options only appear once trust or pressure is high enough. Progress and relationship costs persist between visits.</p>
        <div className="rounded border border-[#2a2822] bg-black/40 p-3">
          <div className="mb-2 text-xs uppercase tracking-wider text-[#6a6458]">Response intent key</div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {INTENT_LEGEND.map(entry => (
              <div key={entry.intent} className="flex items-center gap-2">
                <span
                  className="h-4 w-4 shrink-0 rounded-sm border-l-2 border"
                  style={{ borderColor: INTENT_COLORS[entry.intent], backgroundColor: '#16151d' }}
                />
                <span className="text-[#e8d8a0]">{entry.label}</span>
                <span className="text-xs text-[#8a8478]">— {entry.hint}</span>
              </div>
            ))}
          </div>
        </div>
        <p><b className="text-[#c9a227]">Build proof.</b> An association never proves guilt. A sound case needs material evidence, opportunity, and deception or motive. Closed or fatal testimony reroutes to pre-seeded records and confidants in the journal.</p>
        <p><b className="text-[#c9a227]">Journal.</b> Press <b>J</b> to review leads, recovered routes, trust, pressure, thread outcomes, evidence associations, and cross-thread circuit progress.</p>
        <p><b className="text-[#c9a227]">Decide the ending.</b> When accusing, also choose whether to publish, seal, or destroy the Blue Case archive. Proof, circuit progress, relationships, and that disposition shape the case and personal epilogues.</p>
      </div>
      <button className={`${serifBtn} mt-6`} onClick={() => game.setPhase('title')}>Back</button>
    </Overlay>
  )
}

export function SettingsScreen({ game, snap }: { game: Game; snap: Snapshot }) {
  const s = snap.settings
  const selectProvider = (provider: Settings['llmProvider']) => {
    if (provider === 'groq') {
      game.updateSettings({ llmProvider: provider, llmBaseUrl: 'https://api.groq.com/openai/v1', llmModel: 'openai/gpt-oss-20b' })
    } else if (provider === 'ollama') {
      game.updateSettings({ llmProvider: provider, llmBaseUrl: 'http://localhost:11434/v1', llmModel: 'llama3.2' })
    } else {
      game.updateSettings({ llmProvider: provider })
    }
  }
  return (
    <Overlay ornate>
      <h2 className="font-serif text-3xl text-[#e8d8a0]">Settings</h2>

      <div className="mt-5 w-full max-w-md space-y-4 text-sm text-[#c9c0b0]">
        <div>
          <div className="mb-1 font-serif text-[#c9b98a]">Interview Dialogue</div>
          <div className="flex gap-2">
            {(LLM_ENABLED ? (['builtin', 'llm'] as const) : (['builtin'] as const)).map(m => (
              <button
                key={m}
                onClick={() => game.updateSettings({ director: m })}
                className={`flex-1 rounded border px-3 py-2 font-serif text-sm ${s.director === m ? 'border-[#c9a227] bg-[#c9a227]/15 text-[#e8d8a0]' : 'border-[#3a352a] text-[#8a8478] hover:text-[#c9b98a]'}`}
              >
                {m === 'builtin' ? 'Built-in Dialogue' : 'LLM Dialogue'}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs italic text-[#6a6458]">
            {LLM_ENABLED
              ? 'NPC movement and narrative consequences always run locally. LLM mode renders one already-legal beat at a time; authored dialogue appears immediately and remains the fallback.'
              : 'NPC movement and narrative consequences always run locally. Interviews use built-in authored dialogue.'}
          </p>
        </div>

        {LLM_ENABLED && s.director === 'llm' && (
          <div className="space-y-2 rounded border border-[#2a2822] bg-black/40 p-3">
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-[#6a6458]">Provider</div>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  ['groq', 'Groq Free'],
                  ['ollama', 'Ollama Local'],
                  ['custom', 'Custom'],
                ] as const).map(([provider, label]) => (
                  <button
                    key={provider}
                    onClick={() => selectProvider(provider)}
                    className={`rounded border px-2 py-1.5 text-xs ${s.llmProvider === provider ? 'border-[#c9a227] bg-[#c9a227]/15 text-[#e8d8a0]' : 'border-[#3a352a] text-[#8a8478] hover:text-[#c9b98a]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Base URL" value={s.llmBaseUrl} placeholder="https://api.openai.com/v1"
              onChange={v => game.updateSettings({ llmBaseUrl: v })} />
            {s.llmProvider !== 'ollama' && (
              <Field label="API Key" value={s.llmApiKey} placeholder={s.llmProvider === 'groq' ? 'gsk_…' : 'API key'} type="password"
                onChange={v => game.updateSettings({ llmApiKey: v })} />
            )}
            <Field label="Model" value={s.llmModel} placeholder="gpt-4o-mini"
              onChange={v => game.updateSettings({ llmModel: v })} />
            {s.llmProvider === 'groq' && (
              <div className="text-xs text-[#8a8478]">Recommended hosted option. Create a free Groq key and paste it above.</div>
            )}
            {s.llmProvider === 'ollama' && (
              <div className="text-xs text-[#8a8478]">Runs free on this computer. Ollama must be running with the selected model and browser access enabled.</div>
            )}
            {s.llmProvider !== 'ollama' && !s.llmApiKey && <div className="text-xs text-[#e86a5a]">No API key — interviews will use built-in dialogue.</div>}
          </div>
        )}

        <div>
          <div className="mb-1 font-serif text-[#c9b98a]">Game speed (minutes per second)</div>
          <div className="flex gap-2">
            {[0.5, 1, 2, 4].map(v => (
              <button
                key={v}
                onClick={() => game.updateSettings({ speed: v })}
                className={`flex-1 rounded border px-2 py-1.5 text-sm ${s.speed === v ? 'border-[#c9a227] bg-[#c9a227]/15 text-[#e8d8a0]' : 'border-[#3a352a] text-[#8a8478] hover:text-[#c9b98a]'}`}
              >
                {v}×
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded border border-[#2a2822] bg-black/25 p-3">
          <VolumeSlider
            label="BGM"
            value={s.bgmVolume}
            onChange={value => game.updateSettings({ bgmVolume: value })}
          />
          <VolumeSlider
            label="SFX"
            value={s.sfxVolume}
            onChange={value => game.updateSettings({ sfxVolume: value })}
          />
          <div className="flex items-center justify-between border-t border-[#2a2822] pt-2">
            <span className="text-xs italic text-[#6a6458]">Mute overrides both channels</span>
          <button
            onClick={() => game.updateSettings({ muted: !s.muted })}
            className="rounded border border-[#3a352a] px-3 py-1 text-xs text-[#8a8478] hover:text-[#e8d8a0]"
          >
            {s.muted ? 'Unmute' : 'Mute'}
          </button>
          </div>
        </div>
      </div>

      <button
        className={`${serifBtn} mb-8 mt-6`}
        onClick={() => game.closeSettings()}
      >
        Back
      </button>
    </Overlay>
  )
}

export function PauseMenu({ game }: { game: Game }) {
  return (
    <Overlay>
      <h2 className="font-serif text-3xl text-[#e8d8a0]">Paused</h2>
      <div className="mt-6 flex flex-col gap-3">
        <button className={serifBtn} onClick={() => game.setPhase('playing')}>Resume</button>
        <button className={serifBtn} onClick={() => game.openSettings('paused')}>Settings</button>
        <button className={serifBtn} onClick={() => game.setPhase('setup')}>Restart Case</button>
        <button className={serifBtn} onClick={() => game.quitToTitle()}>Quit to Title</button>
      </div>
    </Overlay>
  )
}

export function EndScreen({ game, snap }: { game: Game; snap: Snapshot }) {
  const e = snap.endInfo
  if (!e) return null
  const win = e.narrativeOutcome === 'complete-public-exposure'
    || e.narrativeOutcome === 'correct-culprit-scandal-sealed'
    || e.narrativeOutcome === 'counter-trap-prevented-attack'
  const outcomeCopy: Record<CaseOutcome, { title: string; body: string }> = {
    'complete-public-exposure': { title: 'THE WHOLE HOUSE ANSWERS', body: 'The culprit and the machinery behind the Blue Case are established on a complete public record.' },
    'correct-culprit-scandal-sealed': { title: 'THE CULPRIT, NOT THE SYSTEM', body: 'The murderer is proved, but the wider conspiracy remains sealed or insufficiently corroborated.' },
    'counter-trap-prevented-attack': { title: 'CAUGHT IN THE ACT', body: 'A prepared counter-trap prevents another attack and binds the culprit to the recovered material.' },
    'correct-suspicion-without-proof': { title: 'THE RIGHT NAME, A BROKEN CASE', body: 'Your suspicion is correct, but the record lacks a proof leg needed for a secure conviction.' },
    'wrong-accusation': { title: 'YOU WERE PLAYED', body: `You accused ${e.accusedName}, while ${e.killerName} the ${e.killerArchetype} survived the fracture.` },
    'house-of-silence': { title: 'HOUSE OF SILENCE', body: 'Dawn arrives without a proved accusation or successful trap. Partial truths leave with the survivors.' },
  }
  const dispositionCopy: Record<ArchiveDisposition, string> = {
    publish: 'The Blue Case record is released to press and public authority.',
    seal: 'Murder proof is released while the wider archive is placed under seal.',
    destroy: 'The leverage originals are destroyed, narrowing prosecution while ending their immediate power.',
  }
  const copy = outcomeCopy[e.narrativeOutcome]
  return (
    <Overlay>
      <h2 className={`font-serif text-4xl tracking-wide ${win ? 'text-[#c9a227]' : 'text-[#e86a5a]'}`}>{copy.title}</h2>
      <p className="mt-4 max-w-md text-center font-serif text-sm italic leading-relaxed text-[#c9c0b0]">{copy.body}</p>
      <p className="mt-2 max-w-md text-center text-xs text-[#9d927c]">{dispositionCopy[e.disposition]}</p>
      <div className="mt-3 text-center text-[10px] uppercase tracking-wider text-[#8a8478]">
        Proof: {Object.entries(e.proof).filter(([, present]) => present).map(([category]) => category).join(', ') || 'none'}
        {e.missingProof.length ? ` · Missing: ${e.missingProof.join(', ')}` : ''}
        {` · Circuits: ${e.circuitCount}/4`}
      </div>
      <div className="mt-3 max-h-28 w-full max-w-xl overflow-y-auto rounded border border-[#2a2822] bg-black/30 p-2 text-xs text-[#b9b0a0]">
        {e.personalEpilogues.map(item => <div key={item.guestName}><span className="text-[#c9a227]">{item.guestName} — {item.title}:</span> {item.text}</div>)}
      </div>
      <div className="mt-5 grid grid-cols-4 gap-3 text-center">
        <Stat label="Time" value={fmtClock(e.stats.timeMin)} />
        <Stat label="Interviews" value={String(e.stats.interviews)} />
        <Stat label="Leads" value={String(e.stats.leads)} />
        <Stat label="Bodies" value={String(e.stats.bodiesFound)} />
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <button className={serifBtn} onClick={() => game.setPhase('setup')}>New Case (new killer)</button>
        <button className={serifBtn} onClick={() => game.quitToTitle()}>Title Screen</button>
      </div>
    </Overlay>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#3a352a] bg-black/50 px-3 py-2">
      <div className="font-serif text-lg text-[#e8d8a0]">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-[#6a6458]">{label}</div>
    </div>
  )
}

function Overlay({ children, ornate = false, taller = false }: { children: ReactNode; ornate?: boolean; taller?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div
        className={`${ornate ? 'gothic-frame gothic-frame--popup overflow-hidden px-28 pb-40 pt-44' : 'w-full max-w-2xl rounded border border-[#3a352a] bg-[#0d0c12]/95 p-8'} relative flex max-h-full flex-col items-center ${ornate ? '' : 'overflow-y-auto'}`}
        style={ornate ? {
          width: `min(58rem, 94vw, calc((100vh - 3rem) * 736 / ${taller ? 568 : 544}))`,
          aspectRatio: `736 / ${taller ? 568 : 544}`,
        } : undefined}
      >
        {ornate && <GothicFrame />}
        {ornate ? (
          <div className="relative z-[1] flex min-h-0 w-full flex-col items-center overflow-x-hidden overflow-y-auto overscroll-contain">
            {children}
          </div>
        ) : children}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-xs uppercase tracking-wider text-[#6a6458]">{label}</span>
      <input
        type={type ?? 'text'}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded border border-[#3a352a] bg-black/60 px-2 py-1.5 text-sm text-[#d8d0c0] outline-none focus:border-[#c9a227]"
      />
    </label>
  )
}

function VolumeSlider({ label, value, onChange }: {
  label: string; value: number; onChange: (value: number) => void
}) {
  return (
    <label className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-3">
      <span className="font-serif text-[#c9b98a]">{label}</span>
      <input
        aria-label={`${label} volume`}
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="w-full accent-[#c9a227]"
      />
      <span className="text-right text-[10px] tabular-nums text-[#6a6458]">{Math.round(value * 100)}%</span>
    </label>
  )
}

function fmtClock(min: number): string {
  const m = Math.max(0, Math.floor(min))
  const h = Math.floor(m / 60) % 24
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m % 60).padStart(2, '0')}`
}
