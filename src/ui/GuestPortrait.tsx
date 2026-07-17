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
