import { useEffect, useRef, useState } from 'react'
import { Game } from '@/game/game'
import { useGame } from '@/state/store'
import { HUD } from '@/ui/HUD'
import { DialoguePanel } from '@/ui/DialoguePanel'
import { Journal } from '@/ui/Journal'
import { TitleScreen, HowToPlay, SettingsScreen, PauseMenu, EndScreen } from '@/ui/Screens'
import { AccuseModal } from '@/ui/AccuseModal'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [game, setGame] = useState<Game | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const g = new Game(containerRef.current)
    setGame(g)
    return () => {
      g.dispose()
      setGame(null)
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
    </div>
  )
}

function UI({ game }: { game: Game }) {
  const snap = useGame(game)
  switch (snap.phase) {
    case 'title': return <TitleScreen game={game} />
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
    case 'playing':
    default:
      return <HUD game={game} snap={snap} />
  }
}
