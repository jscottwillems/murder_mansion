import type { ReactNode } from 'react'
import type { Game } from '@/game/game'
import type { Settings, Snapshot } from '@/game/types'

const serifBtn =
  'w-72 rounded border border-[#3a352a] bg-black/60 px-6 py-3 font-serif text-lg text-[#c9b98a] transition-colors hover:border-[#c9a227] hover:text-[#e8d8a0]'

export function TitleScreen({ game }: { game: Game }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/70 via-black/40 to-black/80">
      <div className="mb-2 text-xs uppercase tracking-[0.5em] text-[#8a8478]">A noir deduction simulation</div>
      <h1 className="font-serif text-7xl tracking-wide text-[#e8d8a0] drop-shadow-[0_4px_12px_#000]">
        MURDER <span className="text-[#c9a227]">MANSION</span>
      </h1>
      <div className="mt-3 max-w-lg text-center font-serif text-sm italic leading-relaxed text-[#a8a090]">
        Midnight. A stormbound mansion. Ten guests — one of them a killer.
        You have until sunrise to learn who.
      </div>
      <div className="mt-10 flex flex-col gap-3">
        <button className={serifBtn} onClick={() => game.startCase()}>Start the Case</button>
        <button className={serifBtn} onClick={() => game.setPhase('howto')}>How to Play</button>
        <button className={serifBtn} onClick={() => game.openSettings('title')}>Settings</button>
      </div>
      <div className="mt-10 text-[10px] uppercase tracking-widest text-[#5a5448]">
        WASD move · E interview · J journal · Esc pause
      </div>
    </div>
  )
}

export function HowToPlay({ game }: { game: Game }) {
  return (
    <Overlay>
      <h2 className="font-serif text-3xl text-[#e8d8a0]">How to Play</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#c9c0b0]">
        <p><b className="text-[#c9a227]">The situation.</b> You are a detective trapped by a storm with ten guests until 6:00 AM. One of them — chosen at random each case — is the murderer.</p>
        <p><b className="text-[#c9a227]">Move & observe.</b> WASD / arrow keys to walk between the nine rooms. You can only see your current room. Guests wander, gossip, and trade rumors; linger in a room to overhear them.</p>
        <p><b className="text-[#c9a227]">Interview.</b> Press <b>E</b> near a guest. The night continues while that guest stays with you. You get four questions at a time — timelines, suspicions, rumors, alibis. Answers change as word spreads through the house.</p>
        <p><b className="text-[#c9a227]">Mind the lies.</b> Some guests misremember. The killer deflects suspicion onto the innocent — and kills again when alone with someone, out of your sight.</p>
        <p><b className="text-[#c9a227]">Journal.</b> Press <b>J</b> to review leads, guest status, and past interviews. Accuse from the Guests page when you're sure.</p>
        <p><b className="text-[#c9a227]">Lose conditions.</b> Sunrise arrives, you accuse the wrong person, or no one is left alive.</p>
      </div>
      <button className={`${serifBtn} mt-6`} onClick={() => game.setPhase('title')}>Back</button>
    </Overlay>
  )
}

export function SettingsScreen({ game, snap }: { game: Game; snap: Snapshot }) {
  const s = snap.settings
  const selectProvider = (provider: Settings['llmProvider']) => {
    if (provider === 'groq') {
      game.updateSettings({ llmProvider: provider, llmBaseUrl: 'https://api.groq.com/openai/v1', llmModel: 'llama-3.1-8b-instant' })
    } else if (provider === 'ollama') {
      game.updateSettings({ llmProvider: provider, llmBaseUrl: 'http://localhost:11434/v1', llmModel: 'llama3.2' })
    } else {
      game.updateSettings({ llmProvider: provider })
    }
  }
  return (
    <Overlay>
      <h2 className="font-serif text-3xl text-[#e8d8a0]">Settings</h2>

      <div className="mt-5 w-full max-w-md space-y-4 text-sm text-[#c9c0b0]">
        <div>
          <div className="mb-1 font-serif text-[#c9b98a]">AI Director</div>
          <div className="flex gap-2">
            {(['builtin', 'llm'] as const).map(m => (
              <button
                key={m}
                onClick={() => game.updateSettings({ director: m })}
                className={`flex-1 rounded border px-3 py-2 font-serif text-sm ${s.director === m ? 'border-[#c9a227] bg-[#c9a227]/15 text-[#e8d8a0]' : 'border-[#3a352a] text-[#8a8478] hover:text-[#c9b98a]'}`}
              >
                {m === 'builtin' ? 'Built-in Minds' : 'LLM-driven NPCs'}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs italic text-[#6a6458]">
            Built-in works offline. LLM mode sends each guest's master prompt (plus a secret murderer prompt) to your OpenAI-compatible endpoint to decide their actions and interview answers.
          </p>
        </div>

        {s.director === 'llm' && (
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
            {s.llmProvider !== 'ollama' && !s.llmApiKey && <div className="text-xs text-[#e86a5a]">No API key — the game will silently use built-in minds.</div>}
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

        <div className="flex items-center gap-3">
          <span className="font-serif text-[#c9b98a]">Volume</span>
          <input
            type="range" min={0} max={1} step={0.05} value={s.volume}
            onChange={e => game.updateSettings({ volume: Number(e.target.value) })}
            className="flex-1 accent-[#c9a227]"
          />
          <button
            onClick={() => game.updateSettings({ muted: !s.muted })}
            className="rounded border border-[#3a352a] px-3 py-1 text-xs text-[#8a8478] hover:text-[#e8d8a0]"
          >
            {s.muted ? 'Unmute' : 'Mute'}
          </button>
        </div>
      </div>

      <button
        className={`${serifBtn} mt-6`}
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
        <button className={serifBtn} onClick={() => game.startCase()}>Restart Case</button>
        <button className={serifBtn} onClick={() => game.quitToTitle()}>Quit to Title</button>
      </div>
    </Overlay>
  )
}

export function EndScreen({ game, snap }: { game: Game; snap: Snapshot }) {
  const e = snap.endInfo
  if (!e) return null
  const win = e.outcome === 'win'
  const title = {
    win: 'CASE CLOSED',
    wrong: 'YOU WERE PLAYED',
    sunrise: 'THE KILLER WALKS FREE',
    wiped: 'A HOUSE OF THE DEAD',
  }[e.outcome]
  const body = {
    win: `You named ${e.accusedName} — and you were right. ${e.killerName}, the ${e.killerArchetype}, breaks under the accusation as the storm finally begins to ease.`,
    wrong: `You accused ${e.accusedName}, an innocent. Behind you, ${e.killerName} the ${e.killerArchetype} allows themselves the smallest of smiles.`,
    sunrise: `The sun rises on the mansion. The roads clear. ${e.killerName} the ${e.killerArchetype} thanks you for a fascinating evening and is never seen again.`,
    wiped: `By dawn there was no one left to accuse. ${e.killerName} the ${e.killerArchetype} simply walked out into the morning.`,
  }[e.outcome]
  return (
    <Overlay>
      <h2 className={`font-serif text-4xl tracking-wide ${win ? 'text-[#c9a227]' : 'text-[#e86a5a]'}`}>{title}</h2>
      <p className="mt-4 max-w-md text-center font-serif text-sm italic leading-relaxed text-[#c9c0b0]">{body}</p>
      <div className="mt-5 grid grid-cols-4 gap-3 text-center">
        <Stat label="Time" value={fmtClock(e.stats.timeMin)} />
        <Stat label="Interviews" value={String(e.stats.interviews)} />
        <Stat label="Leads" value={String(e.stats.leads)} />
        <Stat label="Bodies" value={String(e.stats.bodiesFound)} />
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <button className={serifBtn} onClick={() => game.startCase()}>New Case (new killer)</button>
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

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="flex max-h-full w-full max-w-2xl flex-col items-center overflow-y-auto rounded border border-[#3a352a] bg-[#0d0c12]/95 p-8">
        {children}
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

function fmtClock(min: number): string {
  const m = Math.max(0, Math.floor(min))
  const h = Math.floor(m / 60) % 24
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m % 60).padStart(2, '0')}`
}
