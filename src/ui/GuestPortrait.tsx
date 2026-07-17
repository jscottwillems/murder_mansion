import type { ConversationEmotion } from '@/game/types'

const portraitUrl = (filename: string) => `${import.meta.env.BASE_URL}assets/characters/${filename}`

const GUEST_PORTRAITS: Record<string, string> = {
  columnist: portraitUrl('columnist.png'),
  surgeon: portraitUrl('surgeon.png'),
  curator: portraitUrl('curator.png'),
  magician: portraitUrl('magician.png'),
  correspondent: portraitUrl('correspondent.png'),
  accountant: portraitUrl('accountant.png'),
  vocalist: portraitUrl('vocalist.png'),
  antiquarian: portraitUrl('antiquarian.png'),
  chauffeur: portraitUrl('chauffeur.png'),
  debutante: portraitUrl('debutante.png'),
}

type PortraitSize = 'compact' | 'card' | 'dialog'
export type DialogueMood = ConversationEmotion

const DIALOGUE_FRAME: Record<DialogueMood, [number, number]> = {
  neutral: [2, 3],
  suspicious: [3, 3],
  worried: [0, 4],
  angry: [1, 4],
  thoughtful: [2, 4],
  surprised: [3, 4],
}

export function GuestPortrait({ archetypeId, name, alive, size = 'card', dialogueMood = 'neutral' }: {
  archetypeId: string
  name: string
  alive: boolean
  size?: PortraitSize
  dialogueMood?: DialogueMood
}) {
  const src = GUEST_PORTRAITS[archetypeId]
  const sizeClass = {
    compact: 'h-11 w-9',
    card: 'h-24 w-16',
    dialog: 'h-40 w-40',
  }[size]

  const atlasSrc = portraitUrl(`${archetypeId}-atlas.png`)
  const [dialogueCol, dialogueRow] = DIALOGUE_FRAME[dialogueMood]

  return (
    <div className={`${sizeClass} shrink-0 overflow-hidden rounded border border-[#3a352a] bg-black/60`}>
      {src && size === 'dialog' ? (
        <div
          role="img"
          aria-label={`${name} — ${dialogueMood}`}
          className={`h-full w-full bg-no-repeat [image-rendering:pixelated] ${alive ? '' : 'grayscale opacity-60'}`}
          style={{
            backgroundImage: `url(${atlasSrc})`,
            backgroundSize: '400% 500%',
            backgroundPosition: `${dialogueCol * 100 / 3}% ${dialogueRow * 100 / 4}%`,
          }}
        />
      ) : src ? (
        <img
          src={src}
          alt={name}
          draggable={false}
          className={`h-full w-full object-contain object-bottom [image-rendering:pixelated] ${alive ? '' : 'grayscale opacity-60'}`}
        />
      ) : (
        <div className="h-full w-full bg-[#3a3232]" />
      )}
    </div>
  )
}
