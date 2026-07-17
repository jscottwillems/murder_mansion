const GUEST_PORTRAITS: Record<string, string> = {
  columnist: '/assets/characters/columnist.png',
  surgeon: '/assets/characters/surgeon.png',
  curator: '/assets/characters/curator.png',
  magician: '/assets/characters/magician.png',
  correspondent: '/assets/characters/correspondent.png',
  accountant: '/assets/characters/accountant.png',
  vocalist: '/assets/characters/vocalist.png',
  antiquarian: '/assets/characters/antiquarian.png',
  chauffeur: '/assets/characters/chauffeur.png',
  debutante: '/assets/characters/debutante.png',
}

type PortraitSize = 'compact' | 'card' | 'dialog'

export function GuestPortrait({ archetypeId, name, alive, size = 'card' }: {
  archetypeId: string
  name: string
  alive: boolean
  size?: PortraitSize
}) {
  const src = GUEST_PORTRAITS[archetypeId]
  const sizeClass = {
    compact: 'h-11 w-9',
    card: 'h-24 w-16',
    dialog: 'h-28 w-20',
  }[size]

  return (
    <div className={`${sizeClass} shrink-0 overflow-hidden rounded border border-[#3a352a] bg-black/60`}>
      {src ? (
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
