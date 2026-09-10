import { useEffect, useRef, useState } from 'react'
import { DefaultLoadingManager } from 'three'
import { Game } from '@/game/game'
import { useGame } from '@/state/store'
import { HUD } from '@/ui/HUD'
import { DialoguePanel } from '@/ui/DialoguePanel'
import { Journal } from '@/ui/Journal'
import { TitleScreen, CaseSetupScreen, HowToPlay, SettingsScreen, PauseMenu, EndScreen } from '@/ui/Screens'
import { AccuseModal } from '@/ui/AccuseModal'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [loadState, setLoadState] = useState({ progress: 4, message: 'Opening the case file…' })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    let g: Game | null = null
    const startedAt = performance.now()
    let assetsComplete = false
    let assetBatchStarted = false
    let sceneComplete = false

    const updateProgress = (progress: number, message: string) => {
      if (!cancelled) setLoadState(current => ({
        progress: Math.max(current.progress, Math.min(progress, 100)),
        message,
      }))
    }

    const finish = () => {
      if (cancelled || !assetsComplete || !sceneComplete || !g) return
      updateProgress(96, 'Lighting the last candle…')
      const remaining = Math.max(0, 900 - (performance.now() - startedAt))
      window.setTimeout(() => {
        if (cancelled || !g) return
        setGame(g)
        updateProgress(100, 'The mansion is ready.')
        window.setTimeout(() => {
          if (!cancelled) setLoaded(true)
        }, 240)
      }, remaining)
    }

    DefaultLoadingManager.onStart = () => {
      assetBatchStarted = true
      updateProgress(24, 'Surveying the mansion…')
    }
    DefaultLoadingManager.onProgress = (_url, loadedItems, totalItems) => {
      const ratio = totalItems > 0 ? loadedItems / totalItems : 0
      const progress = 24 + Math.round(ratio * 66)
      const message = ratio < 0.34
        ? 'Hanging portraits and drawing curtains…'
        : ratio < 0.7
          ? 'Gathering suspects in the drawing rooms…'
          : 'Planting clues where shadows gather…'
      updateProgress(progress, message)
    }
    DefaultLoadingManager.onError = () => {
      updateProgress(88, 'Recovering a misplaced piece of evidence…')
    }
    DefaultLoadingManager.onLoad = () => {
      assetsComplete = true
      finish()
    }

    updateProgress(10, 'Reading the guest ledger…')
    const bootTimer = window.setTimeout(() => {
      if (cancelled || !containerRef.current) return
      updateProgress(18, 'Unlocking the mansion doors…')
      g = new Game(containerRef.current)
      sceneComplete = true
      // A fully cached visit may not open a loading-manager batch.
      window.setTimeout(() => {
        if (!assetBatchStarted) assetsComplete = true
        finish()
      }, 120)
      document.fonts?.ready.then(() => updateProgress(92, 'Setting the title in ink…'))
      finish()
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(bootTimer)
      DefaultLoadingManager.onStart = undefined
      DefaultLoadingManager.onProgress = () => undefined
      DefaultLoadingManager.onError = () => undefined
      DefaultLoadingManager.onLoad = () => undefined
      g?.dispose()
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#05050a]">
      <div ref={containerRef} className="absolute inset-0" />
      {/* vignette + scanline noir dressing */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 54%, rgba(0,0,0,0.36) 100%)',
      }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 3px)',
      }} />
      {game && <UI game={game} />}
      {!loaded && <LoadingScreen progress={loadState.progress} message={loadState.message} />}
    </div>
  )
}

function LoadingScreen({ progress, message }: { progress: number; message: string }) {
  return (
    <div
      className={`loading-screen absolute inset-0 z-[100] flex items-center justify-center ${progress >= 100 ? 'loading-screen--complete' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading Murder Mansion: ${progress}%`}
    >
      <div className="loading-rain pointer-events-none absolute inset-0" />
      <div className="loading-vignette pointer-events-none absolute inset-0" />
      <main className="loading-card relative w-[min(44rem,88vw)] text-center">
        <div className="loading-ornament" aria-hidden="true"><span>◆</span></div>
        <p className="text-[10px] uppercase tracking-[0.52em] text-[#817967]">A noir deduction simulation</p>
        <h1 className="loading-title mt-5 font-serif text-5xl tracking-[0.08em] text-[#eee2be] sm:text-6xl">
          MURDER <span className="text-[#c9a227]">MANSION</span>
        </h1>
        <p className="mt-4 font-serif text-sm italic tracking-wide text-[#8f887a]">Every room remembers something.</p>

        <div className="mx-auto mt-14 w-full max-w-xl">
          <div className="mb-3 flex items-end justify-between gap-4">
            <p key={message} className="loading-message text-left font-serif text-sm text-[#bbb09a]">{message}</p>
            <span className="font-mono text-xs tabular-nums text-[#a9904a]">{progress}%</span>
          </div>
          <div
            className="loading-track relative h-[9px] overflow-hidden border border-[#50472f] bg-black/70 p-[2px]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className="loading-bar h-full" style={{ width: `${progress}%` }} />
            <div className="loading-glint absolute inset-y-0 w-20" style={{ left: `${progress}%` }} />
          </div>
          <div className="mt-3 flex items-center gap-3 text-[#4f493e]" aria-hidden="true">
            <span className="h-px flex-1 bg-current" />
            <span className="text-[8px]">◆</span>
            <span className="h-px flex-1 bg-current" />
          </div>
        </div>
      </main>
      <p className="absolute bottom-7 text-[9px] uppercase tracking-[0.35em] text-[#514c43]">Blackthorn House · 11:47 PM</p>
    </div>
  )
}

function UI({ game }: { game: Game }) {
  const snap = useGame(game)
  switch (snap.phase) {
    case 'title': return <TitleScreen game={game} />
    case 'setup': return <CaseSetupScreen game={game} snap={snap} />
    case 'howto': return <HowToPlay game={game} />
    case 'settings': return <SettingsScreen game={game} snap={snap} />
    case 'paused': return (
      <>
        <HUD game={game} snap={snap} />
        <PauseMenu game={game} />
      </>
    )
    case 'journal': return (
      <>
        <HUD game={game} snap={snap} />
        <Journal game={game} snap={snap} />
      </>
    )
    case 'interview': return (
      <>
        <HUD game={game} snap={snap} />
        <DialoguePanel game={game} snap={snap} />
      </>
    )
    case 'accuse': return (
      <>
        <HUD game={game} snap={snap} />
        <AccuseModal game={game} snap={snap} />
      </>
    )
    case 'won':
    case 'lost': return (
      <>
        <HUD game={game} snap={snap} />
        <EndScreen game={game} snap={snap} />
      </>
    )
    case 'playing': return <HUD game={game} snap={snap} />
    default: {
      const exhaustive: never = snap.phase
      throw new Error(`Unhandled game phase: ${exhaustive}`)
    }
  }
}
