import * as THREE from 'three'

export interface CellarSconces {
  /** Root is authored in cellar-local coordinates and can be added directly to its room group. */
  group: THREE.Group
  /** Drive from the world's accumulated time in seconds for deterministic animation. */
  update: (time: number) => void
}

interface AnimatedSconce {
  flame: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshBasicMaterial>
  glow: THREE.PointLight
  phase: number
}

const FLAME_COLOR = 0xffb04c
const HOT_COLOR = 0xffe0a0
const IRON_COLOR = 0x211b19
const BACKPLATE_COLOR = 0x352822

function sconce(x: number, y: number, z: number, rotationY: number, phase: number): AnimatedSconce & { group: THREE.Group } {
  const group = new THREE.Group()
  group.position.set(x, y, z)
  group.rotation.y = rotationY

  const backplateMat = new THREE.MeshStandardMaterial({ color: BACKPLATE_COLOR, roughness: 0.82, metalness: 0.55 })
  const ironMat = new THREE.MeshStandardMaterial({ color: IRON_COLOR, roughness: 0.66, metalness: 0.78 })

  const backplate = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.58, 0.10), backplateMat)
  backplate.position.y = 0.02
  group.add(backplate)

  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.38), ironMat)
  arm.position.set(0, -0.08, 0.21)
  group.add(arm)

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.13, 0.18, 6), ironMat)
  cup.position.set(0, -0.02, 0.43)
  group.add(cup)

  const flameMaterial = new THREE.MeshBasicMaterial({ color: FLAME_COLOR, toneMapped: false })
  const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), flameMaterial)
  flame.scale.set(0.72, 1.7, 0.72)
  flame.position.set(0, 0.22, 0.43)
  group.add(flame)

  const ember = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.065, 0),
    new THREE.MeshBasicMaterial({ color: HOT_COLOR, toneMapped: false }),
  )
  ember.scale.y = 1.45
  flame.add(ember)

  const glow = new THREE.PointLight(FLAME_COLOR, 4.4, 4.8, 1.75)
  glow.position.set(0, 0.28, 0.58)
  group.add(glow)

  return { group, flame, glow, phase }
}

/**
 * Chunky iron sconces for the cellar's west and south walls. The west-wall
 * pair brackets its window evenly; the south fixture remains clear of the
 * doorway lane. Flames stay below the current 1.85-unit wall top.
 */
export function createCellarSconces(): CellarSconces {
  const group = new THREE.Group()
  const fixtures = [
    sconce(-4.78, 1.16, -2.1, Math.PI / 2, 1.25),
    sconce(-4.78, 1.16, 2.1, Math.PI / 2, 0.35),
    sconce(2.45, 1.18, 4.78, Math.PI, 2.15),
  ]
  for (const fixture of fixtures) group.add(fixture.group)

  const update = (time: number) => {
    for (const fixture of fixtures) {
      // Layered sines create irregular-looking fire without nondeterminism.
      const wave = Math.sin(time * 8.3 + fixture.phase) * 0.55
        + Math.sin(time * 13.7 + fixture.phase * 1.9) * 0.28
        + Math.sin(time * 21.1 + fixture.phase * 0.7) * 0.17
      const strength = 1 + wave * 0.13
      fixture.flame.scale.set(0.72 / strength, 1.7 * strength, 0.72 / strength)
      fixture.flame.position.x = Math.sin(time * 6.1 + fixture.phase) * 0.018
      fixture.flame.rotation.z = Math.sin(time * 5.4 + fixture.phase) * 0.075
      fixture.glow.intensity = 4.4 + wave * 0.72
    }
  }

  update(0)
  return { group, update }
}
