export function GothicFrame({ variant = 'popup' }: { variant?: 'chat' | 'popup' }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}assets/ui/gothic-${variant}-frame.png`}
      alt=""
      aria-hidden="true"
      className="gothic-frame-sprite"
    />
  )
}
