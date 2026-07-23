// Social simulation: guest movement, conversations, rumor exchange,
// the murderer's logic, body discovery, suspicion tracking, interview answers.
import type { Guest, Lead, LogLine, QuestionTopic, RoomId, Rumor } from './types'
import { EVIDENCE_IDS, type EvidenceId } from './types'
import {
  ROOMS, ROOM_BY_ID, GUEST_NAMES_BY_GENDER, ARCHETYPE_GENDER, GUEST_COLORS, ARCHETYPES,
  roomCenter, roomOfPoint, hexToNum,
  fmtTime, pick, fill, makeRng, NIGHT_LENGTH_MIN, canOccupy, BUILTIN_EVIDENCE_HINTS,
} from './data'

export interface SimEvents {
  log(text: string, tone: LogLine['tone']): void
  lead(kind: Lead['kind'], source: string, text: string): void
  guestDied(g: Guest): void
  bodyDiscovered(g: Guest, byName: string): void
  overheard(aName: string, text: string): void
}

interface Waypoint { x: number; z: number; room: RoomId }
interface MovementRecovery { blockedFor: number; detourSign: 1 | -1; lastDistance: number }
const ACTOR_RADIUS = 0.42
const STUCK_RECOVERY_SECONDS = 0.65
const DETOUR_DISTANCE = ACTOR_RADIUS * 2.5
const NPC_WALK_SPEED = 1.55
const NAV_GRID = 0.5
const NAV_SAMPLE_STEP = ACTOR_RADIUS * 0.45
const MURDER_COLOCATION_SECONDS = 5
const ROOM_PREFERENCES: Record<string, RoomId[]> = {
  columnist: ['ballroom', 'suite', 'dining'],
  surgeon: ['study', 'library', 'conservatory'],
  curator: ['conservatory', 'kitchen', 'gallery'],
  magician: ['ballroom', 'gallery', 'dining'],
  correspondent: ['study', 'library', 'gallery'],
  accountant: ['study', 'library', 'cellar'],
  antiquarian: ['library', 'gallery', 'study'],
  chauffeur: ['kitchen', 'cellar', 'dining'],
  debutante: ['ballroom', 'suite', 'conservatory'],
  vocalist: ['ballroom', 'conservatory', 'suite'],
}

let uid = 0
const nid = () => `id${++uid}`

export class Simulation {
  guests: Guest[] = []
  clockMin = 0
  suspicion: Record<string, number> = {}
  rng: () => number
  seed: number
  killerId = ''
  playerRoom: RoomId = 'dining'
  private history: Record<string, { min: number; room: RoomId }[]> = {}
  private histNextMin = 0
  private paths: Record<string, Waypoint[]> = {}
  private movementRecovery: Record<string, MovementRecovery> = {}
  private recentRooms: Record<string, RoomId[]> = {}
  private murderColocationSeconds: Record<string, number> = {}
  private ev: SimEvents

  constructor(seed: number, ev: SimEvents) {
    this.seed = seed
    this.ev = ev
    this.rng = makeRng(seed)
    this.setup()
  }

  private setup() {
    const archetypes = [...ARCHETYPES]
    // shuffle archetypes
    for (let i = archetypes.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1))
      ;[archetypes[i], archetypes[j]] = [archetypes[j], archetypes[i]]
    }
    const namesByGender = {
      female: [...GUEST_NAMES_BY_GENDER.female],
      male: [...GUEST_NAMES_BY_GENDER.male],
    }
    for (const names of Object.values(namesByGender)) {
      for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(this.rng() * (i + 1))
        ;[names[i], names[j]] = [names[j], names[i]]
      }
    }
    const nextName = { female: 0, male: 0 }
    const occupied: { x: number; z: number }[] = []
    // Shuffle which evidence traces attach to which guest each case. A random
    // permutation of the ten traces plus three distinct rotational offsets keeps
    // the deduction balanced — every trace has exactly three owners and every
    // guest owns three distinct traces — while defeating memorization. Because
    // any guest can end up with any trace, every archetype authors a reveal
    // thread for every trace.
    const evidenceOrder = [...EVIDENCE_IDS]
    for (let i = evidenceOrder.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1))
      ;[evidenceOrder[i], evidenceOrder[j]] = [evidenceOrder[j], evidenceOrder[i]]
    }
    const offsets = Array.from({ length: evidenceOrder.length }, (_, k) => k)
    for (let i = offsets.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1))
      ;[offsets[i], offsets[j]] = [offsets[j], offsets[i]]
    }
    const evidenceOffsets = offsets.slice(0, 3)
    const evidenceFor = (index: number): EvidenceId[] =>
      evidenceOffsets.map(offset => evidenceOrder[(index + offset) % evidenceOrder.length])
    this.guests = archetypes.map((a, i) => {
      const gender = ARCHETYPE_GENDER[a.id]
      const name = namesByGender[gender][nextName[gender]++]
      const room = pick(ROOMS, this.rng).id
      const c = roomCenter(room)
      let x = c.x
      let z = c.z
      for (let tries = 0; tries < 40; tries++) {
        const sx = c.x + (this.rng() - 0.5) * 7.5
        const sz = c.z + (this.rng() - 0.5) * 7.5
        if (canOccupy(sx, sz, ACTOR_RADIUS) && !occupied.some(p => Math.hypot(p.x - sx, p.z - sz) < ACTOR_RADIUS * 2)) {
          x = sx; z = sz; break
        }
      }
      occupied.push({ x, z })
      return {
        id: `g${i}`,
        name,
        archetypeId: a.id,
        color: GUEST_COLORS[i % GUEST_COLORS.length],
        colorNum: hexToNum(GUEST_COLORS[i % GUEST_COLORS.length]),
        room,
        x, z,
        tx: 0, tz: 0,
        state: 'idle',
        alive: true,
        isKiller: false,
        knowledge: [],
        talkedWith: [],
        interviewed: false,
        lastSeenMin: -999,
        talkPartnerId: null,
        talkUntilMin: 0,
        nextDecisionMin: 5 + this.rng() * 18,
        // The opening grace period is the only delay before the first hunt.
        killCooldownUntilMin: 25,
        bodyFound: false,
        evidenceId: null,
        evidenceInvestigated: false,
        // The three traces this guest can be associated with this case, drawn
        // from the shuffled balanced assignment above.
        evidenceIds: evidenceFor(i),
        revealedEvidenceIds: [],
        diedAtMin: 0,
        deathRoom: null,
      } satisfies Guest
    })
    const killer = pick(this.guests, this.rng)
    killer.isKiller = true
    this.killerId = killer.id
    for (const g of this.guests) this.suspicion[g.id] = 0
  }

  arch(g: Guest) { return ARCHETYPES.find(a => a.id === g.archetypeId)! }
  byId(id: string) { return this.guests.find(g => g.id === id) }
  aliveGuests() { return this.guests.filter(g => g.alive) }
  guestsInRoom(room: RoomId) { return this.guests.filter(g => g.alive && g.room === room) }
  victims() { return this.guests.filter(g => !g.alive && g.bodyFound) }

  /** Establish the crime that summoned the detective before play begins. */
  createOpeningCrime(): Guest {
    const existing = this.victims()[0]
    if (existing) return existing
    const killer = this.byId(this.killerId)!
    const candidates = this.guests.filter(g => g.id !== killer.id && g.room !== 'dining')
    const victim = pick(candidates.length ? candidates : this.guests.filter(g => g.id !== killer.id), this.rng)
    this.commitMurder(killer, victim)
    victim.bodyFound = true
    this.ev.bodyDiscovered(victim, 'Household')
    return victim
  }

  // ------------------------------------------------------------- time & motion

  /** Advance by real dt seconds; speed = game minutes per real second. */
  advance(dtReal: number, speed: number, movementLockedGuestId?: string) {
    const dtMin = dtReal * speed
    this.clockMin = Math.min(NIGHT_LENGTH_MIN, this.clockMin + dtMin)
    this.updateMurderColocation(dtReal)

    // sample location history every 15 game minutes
    if (this.clockMin >= this.histNextMin) {
      this.histNextMin = this.clockMin + 15
      for (const g of this.aliveGuests()) {
        (this.history[g.id] ??= []).push({ min: this.clockMin, room: g.room })
      }
    }

    for (const g of this.aliveGuests()) {
      // An NPC being interviewed stays exactly where the detective engaged
      // them. The rest of the house—and the night clock—continues normally.
      if (g.id === movementLockedGuestId) continue

      // movement along waypoints
      const path = this.paths[g.id]
      if (path && path.length > 0) {
        g.state = 'walk'
        const wp = path[0]
        const dx = wp.x - g.x
        const dz = wp.z - g.z
        const dist = Math.hypot(dx, dz)
        const step = NPC_WALK_SPEED * dtReal
        if (dist <= step) {
          g.x = wp.x; g.z = wp.z
          path.shift()
          delete this.movementRecovery[g.id]
          if (path.length === 0) {
            g.state = 'idle'
            g.room = wp.room
            this.onGuestArrived(g)
          }
        } else {
          const ux = dx / dist
          const uz = dz / dist
          // Guests may pass through one another so crowds cannot deadlock in
          // doorways. Walls, room boundaries, and furniture still block them.
          const clear = (x: number, z: number) => canOccupy(x, z, ACTOR_RADIUS)
          const attempts: [number, number][] = [
            [ux * step, uz * step], [ux * step, 0], [0, uz * step],
            [-uz * step, ux * step], [uz * step, -ux * step],
          ]
          const recovery = (this.movementRecovery[g.id] ??= {
            blockedFor: 0,
            detourSign: this.rng() < 0.5 ? -1 : 1,
            lastDistance: dist,
          })
          if (recovery.detourSign < 0) attempts.splice(3, 2, attempts[4], attempts[3])
          let moved = false
          for (const [sx, sz] of attempts) {
            if (clear(g.x + sx, g.z + sz)) {
              g.x += sx; g.z += sz
              moved = true
              break
            }
          }
          if (moved) {
            const remaining = Math.hypot(wp.x - g.x, wp.z - g.z)
            // A recovery step counts as progress only if it actually brings
            // this guest closer to the current waypoint.
            if (remaining < recovery.lastDistance - 0.002) recovery.blockedFor = 0
            else recovery.blockedFor += dtReal
            recovery.lastDistance = remaining
            if (recovery.blockedFor >= STUCK_RECOVERY_SECONDS) {
              this.addRecoveryDetour(g, wp, clear, recovery)
            }
          } else {
            recovery.blockedFor += dtReal
            if (recovery.blockedFor >= STUCK_RECOVERY_SECONDS) {
              this.addRecoveryDetour(g, wp, clear, recovery)
            }
          }
        }
        const r = roomOfPoint(g.x, g.z)
        if (r) g.room = r
        // Sharing the room is enough for the killer to act; do not require a
        // completed route before checking the opportunity.
        if (g.isKiller) this.tryMurder(g)
      } else if (g.state === 'talk') {
        if (this.clockMin >= g.talkUntilMin || !g.talkPartnerId || !this.byId(g.talkPartnerId)?.alive) {
          g.state = 'idle'
          g.talkPartnerId = null
        }
      }

      // decision ticks
      if (g.state === 'idle' && this.clockMin >= g.nextDecisionMin) {
        g.nextDecisionMin = this.clockMin + 18 + this.rng() * 18
        this.decide(g)
      }
    }

    // last-seen tracking for journal "recently active"
    for (const g of this.guestsInRoom(this.playerRoom)) {
      g.lastSeenMin = this.clockMin
    }
  }

  private onGuestArrived(g: Guest) {
    // discover an unfound body in the room
    for (const body of this.guests) {
      if (!body.alive && !body.bodyFound && body.deathRoom === g.room) {
        body.bodyFound = true
        this.ev.bodyDiscovered(body, g.name)
        this.ev.log(`${g.name} found the body of ${body.name} in the ${ROOM_BY_ID[g.room].name}.`, 'danger')
        this.ev.lead('discovery', g.name, `${g.name} discovered ${body.name}'s body in the ${ROOM_BY_ID[g.room].name} (~${fmtTime(body.diedAtMin)}).`)
        g.knowledge.push({
          id: nid(), aboutId: body.id, room: g.room, atMin: body.diedAtMin,
          text: `${body.name} was killed in the ${ROOM_BY_ID[g.room].name}`,
          reliable: true, sourceId: g.id, heardAtMin: this.clockMin,
        })
      }
    }

    // Do not make the murderer stand beside a legal target until the next
    // normal social-decision tick. Arrival is itself a murder opportunity.
    if (g.isKiller) this.tryMurder(g)
  }

  // ------------------------------------------------------------- decisions

  decide(g: Guest) {
    if (!g.alive) return

    // --- murderer: look for a kill
    if (g.isKiller) {
      if (this.tryMurder(g)) return

      // Hunting is the killer's default action, not an occasional whim.
      // Prefer a lone victim, but a room with a victim plus one witness is
      // still legal. Never deliberately hunt in the detective's room.
      const target = this.findBestMurderTarget(g)
      if (target) {
        this.sendTo(g, target.room)
        return
      }
    }

    // --- conversation opportunity
    const others = this.guestsInRoom(g.room).filter(o => o.id !== g.id && o.state === 'idle')
    const unfamiliar = others.filter(o => !g.talkedWith.includes(o.name))
    if (others.length > 0 && this.rng() < (unfamiliar.length ? 0.62 : 0.28)) {
      const partner = pick(unfamiliar.length ? unfamiliar : others, this.rng)
      this.startConversation(g, partner)
      return
    }

    // --- purposeful movement. Guests favor spaces that suit their role,
    // seek company when isolated, and avoid immediately undoing a journey.
    const roll = this.rng()
    if (roll < 0.38) {
      const destination = this.choosePurposefulRoom(g)
      if (destination) this.sendTo(g, destination)
      else g.nextDecisionMin = this.clockMin + 14 + this.rng() * 12
    } else if (roll < 0.62 && others.length === 0) {
      const socialRoom = this.chooseSocialRoom(g)
      if (socialRoom) this.sendTo(g, socialRoom)
      else g.nextDecisionMin = this.clockMin + 14 + this.rng() * 12
    } else {
      // Most of the time a guest has a reason to remain: reading, observing,
      // resting, or waiting for a useful conversation.
      g.nextDecisionMin = this.clockMin + 18 + this.rng() * 20
    }
  }

  private choosePurposefulRoom(g: Guest): RoomId | null {
    const recent = this.recentRooms[g.id] ?? []
    const preferred = (ROOM_PREFERENCES[g.archetypeId] ?? []).filter(r => r !== g.room && !recent.includes(r))
    if (preferred.length) return pick(preferred, this.rng)
    const alternatives = ROOMS.map(r => r.id).filter(r => r !== g.room && !recent.includes(r))
    return alternatives.length ? pick(alternatives, this.rng) : null
  }

  private chooseSocialRoom(g: Guest): RoomId | null {
    const recent = this.recentRooms[g.id] ?? []
    const candidates = ROOMS.map(r => ({
      room: r.id,
      guests: this.guestsInRoom(r.id).filter(o => o.id !== g.id).length,
      preferred: (ROOM_PREFERENCES[g.archetypeId] ?? []).includes(r.id),
    })).filter(c => c.room !== g.room && !recent.includes(c.room) && c.guests > 0 && c.guests <= 3)
    candidates.sort((a, b) => Number(b.preferred) - Number(a.preferred) || b.guests - a.guests)
    if (!candidates.length) return null
    const best = candidates.filter(c => c.preferred === candidates[0].preferred && c.guests === candidates[0].guests)
    return pick(best, this.rng).room
  }

  private tryMurder(killer: Guest): boolean {
    // No killings in hallways: the murderer must physically stand inside a
    // real room, not a connecting passage. roomOfPoint returns null for the
    // corridors between rooms, where the stale killer.room value would
    // otherwise let a kill slip through.
    const killerRoom = roomOfPoint(killer.x, killer.z)
    if (killerRoom === null) return false
    if (this.playerRoom === killerRoom || this.clockMin < killer.killCooldownUntilMin) return false
    // Victims must also be physically present in that room, so a guest merely
    // passing through the passage cannot be attacked.
    const others = this.aliveGuests().filter(o => o.id !== killer.id && roomOfPoint(o.x, o.z) === killerRoom)
    // One target is required; a second guest is the maximum allowed witness.
    if (others.length < 1 || others.length > 2) return false
    const eligibleVictims = others.filter(victim =>
      (this.murderColocationSeconds[this.murderColocationKey(killer, victim)] ?? 0) >= MURDER_COLOCATION_SECONDS,
    )
    if (!eligibleVictims.length) return false
    this.commitMurder(killer, pick(eligibleVictims, this.rng))
    return true
  }

  /** Track uninterrupted real time shared by the killer and each living guest. */
  private updateMurderColocation(dtReal: number) {
    const killer = this.byId(this.killerId)
    if (!killer?.alive) return
    // Only time spent together inside a real room counts toward a murder.
    // While either party is in a hallway, roomOfPoint is null (or differs),
    // so the timer resets and no kill can build up in a passage.
    const killerRoom = roomOfPoint(killer.x, killer.z)
    for (const victim of this.guests) {
      if (!victim.alive || victim.id === killer.id) continue
      const key = this.murderColocationKey(killer, victim)
      const together = killerRoom !== null && roomOfPoint(victim.x, victim.z) === killerRoom
      this.murderColocationSeconds[key] = together
        ? (this.murderColocationSeconds[key] ?? 0) + Math.max(0, dtReal)
        : 0
    }
  }

  private murderColocationKey(killer: Guest, victim: Guest) {
    return `${killer.id}:${victim.id}`
  }

  private findBestMurderTarget(killer: Guest): Guest | null {
    const candidates = this.aliveGuests().filter(o => {
      if (o.id === killer.id || o.room === killer.room || o.room === this.playerRoom) return false
      const occupants = this.guestsInRoom(o.room).filter(other => other.id !== killer.id).length
      return occupants >= 1 && occupants <= 2
    })
    if (!candidates.length) return null
    const smallestRoom = Math.min(...candidates.map(o => this.guestsInRoom(o.room).length))
    return pick(candidates.filter(o => this.guestsInRoom(o.room).length === smallestRoom), this.rng)
  }

  private commitMurder(killer: Guest, victim: Guest) {
    const priorVictims = this.guests.filter(g => !g.alive).length
    const evidencePool = killer.evidenceIds
    victim.alive = false
    victim.state = 'dead'
    victim.diedAtMin = this.clockMin
    victim.deathRoom = victim.room
    victim.evidenceId = evidencePool[priorVictims % evidencePool.length]
    delete this.paths[victim.id]
    this.murderColocationSeconds = {}
    killer.killCooldownUntilMin = this.clockMin + 30 + this.rng() * 15
    this.ev.guestDied(victim)
    this.teleportKillerAfterMurder(killer, victim.room)
  }

  /** Remove the killer from the scene without exposing them in a doorway. */
  private teleportKillerAfterMurder(killer: Guest, murderRoom: RoomId) {
    const destinations = ROOMS.filter(r => r.id !== murderRoom && r.id !== this.playerRoom)
    const destination = pick(destinations, this.rng).id
    const center = roomCenter(destination)
    let x = center.x
    let z = center.z

    // Prefer an unoccupied, walkable spot so the arrival looks natural if the
    // detective enters the destination later.
    for (let tries = 0; tries < 40; tries++) {
      const candidateX = center.x + (this.rng() - 0.5) * 7.5
      const candidateZ = center.z + (this.rng() - 0.5) * 7.5
      const overlapsGuest = this.aliveGuests().some(g =>
        g.id !== killer.id && Math.hypot(g.x - candidateX, g.z - candidateZ) < ACTOR_RADIUS * 2,
      )
      if (canOccupy(candidateX, candidateZ, ACTOR_RADIUS) && !overlapsGuest) {
        x = candidateX
        z = candidateZ
        break
      }
    }

    delete this.paths[killer.id]
    delete this.movementRecovery[killer.id]
    killer.room = destination
    killer.x = x
    killer.z = z
    killer.tx = 0
    killer.tz = 0
    killer.state = 'idle'
    killer.talkPartnerId = null
    killer.talkUntilMin = 0
  }

  private sendTo(g: Guest, room: RoomId) {
    if (room === g.room) return
    const recent = (this.recentRooms[g.id] ??= [])
    recent.unshift(g.room)
    if (recent.length > 2) recent.length = 2
    const path = this.planPath(g.room, room, g.x, g.z)
    if (path.length === 0) {
      delete this.paths[g.id]
      g.state = 'idle'
      g.nextDecisionMin = this.clockMin + 2 + this.rng() * 3
      return
    }
    this.paths[g.id] = path
    delete this.movementRecovery[g.id]
    g.state = 'walk'
  }

  /** Steer around room geometry when the direct route stops making progress. */
  private addRecoveryDetour(
    g: Guest,
    destination: Waypoint,
    clear: (x: number, z: number) => boolean,
    recovery: MovementRecovery,
  ) {
    recovery.blockedFor = 0
    recovery.lastDistance = Number.POSITIVE_INFINITY
    recovery.detourSign *= -1
    const toward = Math.atan2(destination.z - g.z, destination.x - g.x)
    const spread = [Math.PI / 2, -Math.PI / 2, Math.PI * 0.75, -Math.PI * 0.75, Math.PI]
    if (recovery.detourSign < 0) spread.reverse()

    for (const offset of spread) {
      const angle = toward + offset + (this.rng() - 0.5) * 0.35
      const x = g.x + Math.cos(angle) * DETOUR_DISTANCE
      const z = g.z + Math.sin(angle) * DETOUR_DISTANCE
      if (!clear(x, z)) continue
      this.paths[g.id].unshift({ x, z, room: g.room })
      return
    }

    // If nearby furniture leaves no detour, abandon the blocked route and
    // choose another neighboring room on the next decision tick.
    delete this.paths[g.id]
    g.state = 'idle'
    g.nextDecisionMin = this.clockMin
  }

  /**
   * Clearance-aware A* over the mansion floor. Unlike the old sequence of
   * door and room-center waypoints, this route accounts for furniture before
   * an NPC starts walking, so large footprints cannot create oscillating
   * side-step loops.
   */
  private navigationPath(startX: number, startZ: number, endX: number, endZ: number, room: RoomId): Waypoint[] {
    const clear = (x: number, z: number) => canOccupy(x, z, ACTOR_RADIUS)
    const segmentClear = (ax: number, az: number, bx: number, bz: number) => {
      const distance = Math.hypot(bx - ax, bz - az)
      const samples = Math.max(1, Math.ceil(distance / NAV_SAMPLE_STEP))
      for (let i = 1; i <= samples; i++) {
        const t = i / samples
        if (!clear(ax + (bx - ax) * t, az + (bz - az) * t)) return false
      }
      return true
    }
    if (segmentClear(startX, startZ, endX, endZ)) return [{ x: endX, z: endZ, room }]

    const minCoord = -18
    const maxCoord = 18
    const toCoord = (index: number) => minCoord + index * NAV_GRID
    const gridCount = Math.round((maxCoord - minCoord) / NAV_GRID) + 1
    const key = (ix: number, iz: number) => iz * gridCount + ix
    const coords = (nodeKey: number) => ({ ix: nodeKey % gridCount, iz: Math.floor(nodeKey / gridCount) })
    const open: { key: number; score: number }[] = []
    const costs = new Map<number, number>()
    const cameFrom = new Map<number, number>()
    const closed = new Set<number>()
    const push = (item: { key: number; score: number }) => {
      open.push(item)
      let child = open.length - 1
      while (child > 0) {
        const parent = Math.floor((child - 1) / 2)
        if (open[parent].score <= item.score) break
        open[child] = open[parent]
        child = parent
      }
      open[child] = item
    }
    const pop = () => {
      const first = open[0]
      const last = open.pop()!
      if (open.length) {
        let parent = 0
        while (true) {
          const left = parent * 2 + 1
          if (left >= open.length) break
          const right = left + 1
          const child = right < open.length && open[right].score < open[left].score ? right : left
          if (open[child].score >= last.score) break
          open[parent] = open[child]
          parent = child
        }
        open[parent] = last
      }
      return first
    }

    // Seed every nearby grid point visible from the actor's exact position.
    const startIx = Math.round((startX - minCoord) / NAV_GRID)
    const startIz = Math.round((startZ - minCoord) / NAV_GRID)
    for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
      const ix = startIx + dx
      const iz = startIz + dz
      if (ix < 0 || iz < 0 || ix >= gridCount || iz >= gridCount) continue
      const x = toCoord(ix)
      const z = toCoord(iz)
      if (!clear(x, z) || !segmentClear(startX, startZ, x, z)) continue
      const nodeKey = key(ix, iz)
      const cost = Math.hypot(x - startX, z - startZ)
      costs.set(nodeKey, cost)
      push({ key: nodeKey, score: cost + Math.hypot(endX - x, endZ - z) })
    }

    let goalKey: number | null = null
    const directions = [-1, 0, 1].flatMap(dx => [-1, 0, 1].map(dz => [dx, dz] as const)).filter(([dx, dz]) => dx || dz)
    while (open.length) {
      const current = pop()
      if (closed.has(current.key)) continue
      closed.add(current.key)
      const { ix, iz } = coords(current.key)
      const x = toCoord(ix)
      const z = toCoord(iz)
      if (Math.hypot(endX - x, endZ - z) <= NAV_GRID * 2 && segmentClear(x, z, endX, endZ)) {
        goalKey = current.key
        break
      }
      for (const [dx, dz] of directions) {
        const nx = ix + dx
        const nz = iz + dz
        if (nx < 0 || nz < 0 || nx >= gridCount || nz >= gridCount) continue
        const nextX = toCoord(nx)
        const nextZ = toCoord(nz)
        if (!clear(nextX, nextZ) || !segmentClear(x, z, nextX, nextZ)) continue
        const nextKey = key(nx, nz)
        if (closed.has(nextKey)) continue
        const nextCost = costs.get(current.key)! + Math.hypot(dx, dz) * NAV_GRID
        if (nextCost >= (costs.get(nextKey) ?? Number.POSITIVE_INFINITY)) continue
        costs.set(nextKey, nextCost)
        cameFrom.set(nextKey, current.key)
        push({ key: nextKey, score: nextCost + Math.hypot(endX - nextX, endZ - nextZ) })
      }
    }
    if (goalKey === null) return []

    const points: { x: number; z: number }[] = []
    for (let current: number | undefined = goalKey; current !== undefined; current = cameFrom.get(current)) {
      const { ix, iz } = coords(current)
      points.unshift({ x: toCoord(ix), z: toCoord(iz) })
    }
    points.push({ x: endX, z: endZ })

    // Remove grid stair-steps wherever a longer segment has full clearance.
    const smoothed: Waypoint[] = []
    let ax = startX
    let az = startZ
    for (let i = 0; i < points.length;) {
      let furthest = i
      while (furthest + 1 < points.length && segmentClear(ax, az, points[furthest + 1].x, points[furthest + 1].z)) furthest++
      const point = points[furthest]
      smoothed.push({ ...point, room })
      ax = point.x
      az = point.z
      i = furthest + 1
    }
    return smoothed
  }

  /** Choose a safe destination, then route to it around walls and furniture. */
  private planPath(from: RoomId, to: RoomId, startX = roomCenter(from).x, startZ = roomCenter(from).z): Waypoint[] {
    if (from === to) return []
    const c = roomCenter(to)
    const destinations: { x: number; z: number }[] = []
    for (let tries = 0; tries < 40; tries++) {
      const x = c.x + (this.rng() - 0.5) * 7
      const z = c.z + (this.rng() - 0.5) * 7
      if (canOccupy(x, z, ACTOR_RADIUS)) destinations.push({ x, z })
      if (destinations.length >= 6) break
    }
    for (const destination of destinations) {
      const path = this.navigationPath(startX, startZ, destination.x, destination.z, to)
      if (path.length) return path
    }
    return []
  }

  // ------------------------------------------------------------- conversations & rumors

  private startConversation(a: Guest, b: Guest) {
    const dur = 4 + this.rng() * 6
    a.state = 'talk'; a.talkPartnerId = b.id; a.talkUntilMin = this.clockMin + dur
    b.state = 'talk'; b.talkPartnerId = a.id; b.talkUntilMin = this.clockMin + dur
    if (!a.talkedWith.includes(b.name)) a.talkedWith.push(b.name)
    if (!b.talkedWith.includes(a.name)) b.talkedWith.push(a.name)

    const inPlayerRoom = a.room === this.playerRoom
    if (inPlayerRoom) {
      this.ev.overheard(a.name, `${a.name} and ${b.name} are talking in hushed tones…`)
    }

    // each shares one rumor with the other
    this.shareRumor(a, b)
    this.shareRumor(b, a)
  }

  private shareRumor(from: Guest, to: Guest) {
    // re-share an existing rumor, or produce a fresh observation
    let rumor: Rumor | null = null
    const reusable = from.knowledge.filter(r => r.aboutId !== to.id)
    if (reusable.length > 0 && this.rng() < 0.6) {
      const base = pick(reusable, this.rng)
      rumor = { ...base, id: nid(), sourceId: from.id, heardAtMin: this.clockMin }
    } else {
      rumor = this.freshObservation(from, to)
    }
    if (!rumor) return
    to.knowledge.push(rumor)

    // player overhears if in the same room
    if (from.room === this.playerRoom && this.rng() < 0.55) {
      const about = this.byId(rumor.aboutId)
      if (about && about.alive) {
        const text = fill(this.arch(from).rumorPhrase[Math.floor(this.rng() * this.arch(from).rumorPhrase.length)], {
          name: about.name,
          room: ROOM_BY_ID[rumor.room].name,
          time: fmtTime(rumor.atMin),
        })
        this.ev.overheard(from.name, `${from.name}: “${text}”`)
        this.ev.lead('rumor', from.name, `Overheard — ${text}`)
        this.bumpSuspicion(rumor.aboutId, rumor.reliable ? 1 : 0.6)
      }
    }
  }

  /** Generate a new observation rumor. The murderer plants false ones. */
  private freshObservation(from: Guest, aboutGuest?: Guest): Rumor | null {
    const pool = this.aliveGuests().filter(o => o.id !== from.id && o.id !== aboutGuest?.id)
    if (pool.length === 0) return null
    let about: Guest
    let reliable: boolean
    let room: RoomId
    if (from.isKiller) {
      // deflect: frame an innocent
      const innocents = pool.filter(o => !o.isKiller)
      about = aboutGuest ?? (innocents.length ? pick(innocents, this.rng) : pick(pool, this.rng))
      reliable = false
      room = pick(ROOMS, this.rng).id
    } else {
      about = aboutGuest ?? pick(pool, this.rng)
      reliable = this.rng() < 0.7
      // reliable: where they actually were recently; mistaken: random room
      const hist = this.history[about.id]
      if (reliable && hist && hist.length > 0) {
        room = pick(hist.slice(-4), this.rng).room
      } else {
        room = pick(ROOMS, this.rng).id
        reliable = hist && hist.length > 0 ? reliable : this.rng() < 0.5
      }
    }
    const atMin = Math.max(0, this.clockMin - Math.floor(this.rng() * 70))
    const text = `${about.name} was seen in the ${ROOM_BY_ID[room].name} around ${fmtTime(atMin)}`
    return {
      id: nid(), aboutId: about.id, room, atMin, text,
      reliable, sourceId: from.id, heardAtMin: this.clockMin,
    }
  }

  bumpSuspicion(id: string, amount: number) {
    this.suspicion[id] = (this.suspicion[id] ?? 0) + amount
  }

  maxSuspicion(): number {
    return Math.max(1, ...Object.values(this.suspicion))
  }

  // ------------------------------------------------------------- interviews

  answerQuestion(g: Guest, topic: QuestionTopic, playerRoom: RoomId, evidenceCueId?: EvidenceId): { answer: string; leads: { source: string; text: string }[] } {
    const a = this.arch(g)
    const leads: { source: string; text: string }[] = []
    const vars = {
      time: fmtTime(Math.max(0, this.clockMin - 30 - Math.floor(this.rng() * 60))),
      room: ROOM_BY_ID[playerRoom].name,
      name: '',
    }
    let answer = ''

    switch (topic) {
      case 'timeline': {
        let roomName: string
        if (g.isKiller) {
          // lie: claim somewhere far from any murder scene
          const fake = pick(ROOMS.filter(r => !this.guests.some(v => !v.alive && v.deathRoom === r.id)), this.rng)
          roomName = fake.name
        } else {
          const hist = this.history[g.id]
          if (hist && hist.length > 0 && this.rng() < 0.85) {
            roomName = ROOM_BY_ID[pick(hist.slice(-5), this.rng).room].name
          } else {
            roomName = ROOM_BY_ID[pick(ROOMS, this.rng).id].name // misremembers
          }
        }
        answer = fill(pick(a.timeline, this.rng), { ...vars, room: roomName })
        leads.push({ source: g.name, text: `${g.name} claims to have been in the ${roomName}.` })
        break
      }
      case 'suspicion': {
        let target: Guest
        if (g.isKiller) {
          // deflect onto the most suspected innocent (or a random one)
          const innocents = this.aliveGuests().filter(o => o.id !== g.id && !o.isKiller)
          target = innocents.sort((x, y) => (this.suspicion[y.id] ?? 0) - (this.suspicion[x.id] ?? 0))[0] ?? pick(this.aliveGuests().filter(o => o.id !== g.id), this.rng)
        } else {
          // name whoever they've heard the most rumors about, else random
          const counts = new Map<string, number>()
          for (const r of g.knowledge) counts.set(r.aboutId, (counts.get(r.aboutId) ?? 0) + 1)
          let bestId: string | null = null
          let bestN = 0
          for (const [id, n] of counts) {
            const t = this.byId(id)
            if (t && t.alive && t.id !== g.id && n > bestN) { bestN = n; bestId = id }
          }
          target = bestId ? this.byId(bestId)! : pick(this.aliveGuests().filter(o => o.id !== g.id), this.rng)
        }
        answer = fill(pick(a.suspicion, this.rng), { ...vars, name: target.name })
        leads.push({ source: g.name, text: `${g.name} suspects ${target.name}.` })
        this.bumpSuspicion(target.id, 0.8)
        break
      }
      case 'intel': {
        const usable = g.knowledge.filter(r => {
          const t = this.byId(r.aboutId)
          return t && t.alive
        })
        if (usable.length === 0) {
          answer = '“Nothing worth repeating, detective. This house talks more than its guests.”'
        } else {
          const r = usable[usable.length - 1]
          const about = this.byId(r.aboutId)!
          answer = `“${fill(pick(a.rumorPhrase, this.rng), { name: about.name, room: ROOM_BY_ID[r.room].name, time: fmtTime(r.atMin) })}”`
          leads.push({ source: g.name, text: `${g.name} heard: ${about.name} seen in the ${ROOM_BY_ID[r.room].name} around ${fmtTime(r.atMin)}.` })
          this.bumpSuspicion(r.aboutId, r.reliable ? 1 : 0.6)
        }
        break
      }
      case 'alibi': {
        const witnesses = g.talkedWith.filter(n => this.guests.some(o => o.name === n && o.alive))
        if (g.isKiller && this.rng() < 0.5 && witnesses.length === 0) {
          // killer fabricates a witness
          const fake = pick(this.aliveGuests().filter(o => o.id !== g.id), this.rng)
          answer = fill(pick(a.alibi, this.rng), { ...vars, name: fake.name })
          leads.push({ source: g.name, text: `${g.name} claims ${fake.name} can vouch for them.` })
          this.bumpSuspicion(g.id, 0.4) // a slightly-too-convenient alibi
        } else if (witnesses.length > 0) {
          const w = pick(witnesses, this.rng)
          answer = fill(pick(a.alibi, this.rng), { ...vars, name: w })
          leads.push({ source: g.name, text: `${g.name} says ${w} can vouch for them.` })
        } else {
          answer = '“I was alone, detective. Which I realize sounds exactly like something a murderer would say.”'
          leads.push({ source: g.name, text: `${g.name} has no alibi — claims to have been alone.` })
          this.bumpSuspicion(g.id, 0.5)
        }
        break
      }
      case 'room': {
        answer = fill(pick(a.roomTake, this.rng), { ...vars, room: ROOM_BY_ID[playerRoom].name })
        break
      }
      case 'follow_up':
      case 'pressure': {
        answer = fill(pick(a.pressure, this.rng), vars)
        if (g.isKiller) this.bumpSuspicion(g.id, 0.3)
        break
      }
      case 'social': {
        if (g.talkedWith.length === 0) {
          answer = '“I’ve kept to myself. People exhaust me even when they’re alive.”'
        } else {
          const list = g.talkedWith.slice(-3).join(', ')
          answer = `“Let me think… I’ve spoken with ${list} tonight. Why do you ask?”`
          leads.push({ source: g.name, text: `${g.name} has spoken with ${g.talkedWith.join(', ')}.` })
        }
        break
      }
      case 'victim': {
        const vics = this.victims()
        if (vics.length === 0) {
          answer = '“Victim? Detective, it’s barely past midnight. Don’t jinx us.”'
        } else {
          const v = vics[vics.length - 1]
          answer = fill(pick(a.victim, this.rng), { ...vars, name: v.name })
          leads.push({ source: g.name, text: `${g.name}, on ${v.name}: ${answer.replace(/[“”]/g, '')}` })
        }
        break
      }
      case 'last_seen': {
        const v = this.victims().at(-1)
        if (!v) {
          answer = '“I haven’t seen any victim, detective. Let us hope it stays that way.”'
        } else if (g.talkedWith.includes(v.name)) {
          answer = `“I spoke with ${v.name} earlier tonight. They seemed alive, which is more than I can say now.”`
          leads.push({ source: g.name, text: `${g.name} admits speaking with ${v.name} before the death.` })
        } else {
          answer = `“I saw ${v.name} only in passing. We did not speak.”`
          leads.push({ source: g.name, text: `${g.name} claims to have seen ${v.name} only in passing.` })
        }
        break
      }
      case 'connection': {
        const names = this.victims().slice(-3).map(v => v.name)
        answer = names.length > 1
          ? `“${names.join(' and ')} shared this house, this storm, and someone’s attention. Anything beyond that is a pattern we’re imposing on panic.”`
          : '“One death is a tragedy, detective. It takes another to make a pattern.”'
        break
      }
      case 'motive': {
        const candidates = this.aliveGuests().filter(o => o.id !== g.id)
        const target = candidates.length === 0 ? undefined : g.isKiller
          ? pick(candidates.filter(o => !o.isKiller), this.rng)
          : [...candidates].sort((x, y) => (this.suspicion[y.id] ?? 0) - (this.suspicion[x.id] ?? 0))[0]
        if (target) {
          answer = `“${target.name} has gained something precious: fewer people left to contradict them.”`
          leads.push({ source: g.name, text: `${g.name} believes ${target.name} may benefit from the deaths.` })
          this.bumpSuspicion(target.id, 0.6)
        } else {
          answer = '“No one else is left to benefit. That rather narrows your question, doesn’t it?”'
        }
        break
      }
      case 'survival': {
        answer = g.isKiller
          ? '“Luck, perhaps. Or the killer knows suspicion settles most heavily on whoever remains.”'
          : '“Because I have kept moving, kept watching, and trusted no one. Including you.”'
        if (g.isKiller) this.bumpSuspicion(g.id, 0.4)
        break
      }
      case 'next_victim': {
        const candidates = this.aliveGuests().filter(o => o.id !== g.id)
        if (candidates.length > 0) {
          const target = pick(candidates, this.rng)
          answer = `“${target.name}. Not because I know anything—because they look as frightened as the others did.”`
          leads.push({ source: g.name, text: `${g.name} fears ${target.name} may be the next target.` })
        } else {
          answer = '“There is no one else, detective. So either you are next, or I am.”'
        }
        break
      }
    }
    if (evidenceCueId) {
      const hints = BUILTIN_EVIDENCE_HINTS[evidenceCueId]
      if (hints?.length) {
        const hint = pick(hints, this.rng)
        answer = answer.endsWith('”')
          ? `${answer.slice(0, -1)} ${hint}”`
          : `${answer} ${hint}`
      }
    }
    return { answer, leads }
  }

  /** Player entered a room: check for bodies the player discovers. Returns discovered guests. */
  playerDiscovers(room: RoomId): Guest[] {
    const found: Guest[] = []
    for (const body of this.guests) {
      if (!body.alive && !body.bodyFound && body.deathRoom === room) {
        body.bodyFound = true
        found.push(body)
      }
    }
    return found
  }

  aliveCount() { return this.aliveGuests().length }
  bodiesFound() { return this.guests.filter(g => !g.alive && g.bodyFound).length }
  allDead() { return this.aliveCount() === 0 }
}
