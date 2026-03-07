const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const pixelArt = window.PixelArt;
const canvasFrame = document.querySelector(".stage-canvas-wrap");
const uiClock = document.getElementById("clock");
const uiStatus = document.getElementById("status");
const uiRoomBrief = document.getElementById("room-brief");
const uiDialogue = document.getElementById("dialogue");
const uiQuestions = document.getElementById("questions");
const uiCaseNotes = document.getElementById("case-notes");
const uiRoster = document.getElementById("roster");

const W = canvas.width;
const H = canvas.height;
const TILE = 12;
const BASE_TILE = 8;
const WORLD_W = Math.floor(W / TILE);
const WORLD_H = Math.floor(H / TILE);
const NIGHT_GAME_MINUTES = 360;
const TARGET_REAL_SECONDS = 15 * 60;
const GAME_MINUTES_PER_REAL_SECOND = NIGHT_GAME_MINUTES / TARGET_REAL_SECONDS;
const START_HOUR_24 = 0;
const ROOM_NAMES = [
  "Study", "Gallery", "Conservatory",
  "Kitchen", "Dining Hall", "Ballroom",
  "Cellar", "Library", "Master Suite",
];
const ROOM_TYPES = [
  "study", "gallery", "conservatory",
  "kitchen", "dining", "ballroom",
  "cellar", "library", "suite",
];
const ROOM_STYLES = {
  study: { floorA: "#3d2b21", floorB: "#4a3327", trim: "#5e4433" },
  gallery: { floorA: "#3a2f25", floorB: "#4c3b2f", trim: "#6e5a4a" },
  conservatory: { floorA: "#264231", floorB: "#2f523d", trim: "#476d56" },
  kitchen: { floorA: "#2d343d", floorB: "#39414c", trim: "#576171" },
  dining: { floorA: "#432d1f", floorB: "#503728", trim: "#694833" },
  ballroom: { floorA: "#2f2a3f", floorB: "#38324a", trim: "#534b68" },
  cellar: { floorA: "#2a2521", floorB: "#342e29", trim: "#4f473f" },
  library: { floorA: "#352919", floorB: "#422f1c", trim: "#5d462f" },
  suite: { floorA: "#2f2f3a", floorB: "#3a3b47", trim: "#565867" },
};
const ROOM_ATMOSPHERE = {
  study: { glow: "#deab73", haze: "#9c5d3a" },
  gallery: { glow: "#e0c7a7", haze: "#8d6a56" },
  conservatory: { glow: "#88d9a6", haze: "#2d8b64" },
  kitchen: { glow: "#b7d7ff", haze: "#5a7898" },
  dining: { glow: "#f0b583", haze: "#91583d" },
  ballroom: { glow: "#b9afff", haze: "#62579d" },
  cellar: { glow: "#cba588", haze: "#6f5643" },
  library: { glow: "#d8b07f", haze: "#78553b" },
  suite: { glow: "#d3cdf8", haze: "#7272a0" },
};
const ROOM_VISUALS = {
  study: { wall: "#5c4334", wallAlt: "#72513f", trim: "#d0aa72", accent: "#9d5c3f", carpet: "#7c3f2d", metal: "#8f744f", window: "#9ab7d9" },
  gallery: { wall: "#4e3d36", wallAlt: "#6a5348", trim: "#d6c09a", accent: "#8c6b58", carpet: "#6f4d5d", metal: "#b59f76", window: "#c5d6e6" },
  conservatory: { wall: "#294334", wallAlt: "#385748", trim: "#94c49e", accent: "#5c8f72", carpet: "#355447", metal: "#89b48e", window: "#b8e3d7" },
  kitchen: { wall: "#334151", wallAlt: "#465668", trim: "#c0d3e8", accent: "#788a9d", carpet: "#506071", metal: "#c7d7e4", window: "#bdd5e8" },
  dining: { wall: "#603d30", wallAlt: "#7a4f40", trim: "#ddb07c", accent: "#8f4a35", carpet: "#73412f", metal: "#cf9b62", window: "#d0c0aa" },
  ballroom: { wall: "#44395c", wallAlt: "#5a4b76", trim: "#d6b4d7", accent: "#8263ae", carpet: "#4f3d75", metal: "#d9c7a6", window: "#c8c5f4" },
  cellar: { wall: "#41372f", wallAlt: "#564a41", trim: "#a98867", accent: "#6b5445", carpet: "#49382d", metal: "#ba9b74", window: "#9da7b5" },
  library: { wall: "#554027", wallAlt: "#6f5231", trim: "#d9b07a", accent: "#87552f", carpet: "#6f3928", metal: "#c59a5e", window: "#d8c6a8" },
  suite: { wall: "#4a4858", wallAlt: "#65637a", trim: "#dbcfe5", accent: "#8f7cb0", carpet: "#6c587f", metal: "#d9c5b2", window: "#cbc8ef" },
};
const ROOM_BRIEFS = {
  Study: "Mahogany shelves, lamplight, and enough corners to conceal a hurried lie.",
  Gallery: "Portrait eyes follow every move. Witnesses linger here longer than they admit.",
  Conservatory: "Glass, greenery, and reflected moonlight make movement easy to spot.",
  Kitchen: "Steel counters and tight lanes force everyone into each other's path.",
  "Dining Hall": "A banquet table dominates the room. Every seat can become an alibi.",
  Ballroom: "Open floor, stage lights, and nowhere to hide once the music stops.",
  Cellar: "Stacks of barrels swallow sound. A perfect place for half-heard rumors.",
  Library: "Quiet aisles and reading lamps reward patience and careful observation.",
  "Master Suite": "Private comforts, heavy drapery, and the strongest temptation to isolate.",
  Hallway: "Corridors connect every secret. Crossings here can confirm or ruin a story.",
};

const SKIN_TONES = ["#f4d2b2", "#ddb08a", "#b88764", "#8a5a3c", "#f0c8a0"];
const HAIR_COLORS = ["#2d1f1b", "#5c3c2e", "#cfb183", "#9ea0a8", "#1b1b1b", "#8a2b2b"];
const OUTFIT_ACCENTS = ["#6bc8ff", "#ffce73", "#8df29e", "#ff99b8", "#b8a1ff"];

const NAMES = [
  "Avery", "Bennett", "Clara", "Dorian", "Eloise",
  "Felix", "Greta", "Harper", "Iris", "Jonah",
];

const COLORS = ["#7ad3ff", "#9eff9a", "#fba0ff", "#ffd985", "#ffa68a", "#b3ffef", "#f9f7b0", "#a6b0ff", "#e8bcff", "#ffb3cb"];
const QUESTION_SET = [
  { id: "where_were_you", label: "Where were you recently?" },
  { id: "who_suspicious", label: "Who seems suspicious?" },
  { id: "what_heard", label: "What did you hear or see?" },
  { id: "who_can_confirm", label: "Who can confirm your story?" },
];
const PIXEL_FONT = {
  "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  "J": ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  "N": ["10001", "10001", "11001", "10101", "10011", "10001", "10001"],
  "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  "W": ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11110", "00001", "00001", "00110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "11100"],
  "'": ["00100", "00100", "00000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00100", "00100"],
  ",": ["00000", "00000", "00000", "00000", "00100", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
  "?": ["01110", "10001", "00010", "00100", "00100", "00000", "00100"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};
const PERSON_SPRITES = {
  guest: {
    down: {
      idle: [
        "..HHHH..",
        ".HSSSSH.",
        ".HSGGSH.",
        "..SOOS..",
        ".XOOOOX.",
        ".XAOOAX.",
        ".XOOOOX.",
        "..O..O..",
        ".O....O.",
        ".O....O.",
      ],
      stepA: [
        "..HHHH..",
        ".HSSSSH.",
        ".HSGGSH.",
        "..SOOS..",
        ".XOOOOX.",
        ".XAOOAX.",
        ".XOOOOX.",
        ".O..O...",
        "..O...O.",
        "..O...O.",
      ],
      stepB: [
        "..HHHH..",
        ".HSSSSH.",
        ".HSGGSH.",
        "..SOOS..",
        ".XOOOOX.",
        ".XAOOAX.",
        ".XOOOOX.",
        "...O..O.",
        ".O...O..",
        ".O...O..",
      ],
    },
    up: {
      idle: [
        "..HHHH..",
        ".HOOOOH.",
        ".HOOOOH.",
        "..OOOO..",
        ".XOOOOX.",
        ".XAOOAX.",
        ".XOOOOX.",
        "..O..O..",
        ".O....O.",
        ".O....O.",
      ],
      stepA: [
        "..HHHH..",
        ".HOOOOH.",
        ".HOOOOH.",
        "..OOOO..",
        ".XOOOOX.",
        ".XAOOAX.",
        ".XOOOOX.",
        ".O..O...",
        "..O...O.",
        "..O...O.",
      ],
      stepB: [
        "..HHHH..",
        ".HOOOOH.",
        ".HOOOOH.",
        "..OOOO..",
        ".XOOOOX.",
        ".XAOOAX.",
        ".XOOOOX.",
        "...O..O.",
        ".O...O..",
        ".O...O..",
      ],
    },
    side: {
      idle: [
        "..HHH...",
        ".HSSSH..",
        ".HSGGX..",
        "..SOOX..",
        ".XOOOX..",
        ".XAOOX..",
        ".XOOOX..",
        "...OO...",
        "..O..O..",
        "..O..O..",
      ],
      stepA: [
        "..HHH...",
        ".HSSSH..",
        ".HSGGX..",
        "..SOOX..",
        ".XOOOX..",
        ".XAOOX..",
        ".XOOOX..",
        "..OO....",
        "...O.O..",
        "..O...O.",
      ],
      stepB: [
        "..HHH...",
        ".HSSSH..",
        ".HSGGX..",
        "..SOOX..",
        ".XOOOX..",
        ".XAOOX..",
        ".XOOOX..",
        "....OO..",
        ".O.O....",
        ".O...O..",
      ],
    },
  },
  detective: {
    down: {
      idle: [
        "..TTTT..",
        ".TTHHHT.",
        ".THSGHT.",
        "..SOOS..",
        ".XCCCCX.",
        ".XAOOAX.",
        ".XCOOCX.",
        "..O..O..",
        ".O....O.",
        ".O....O.",
      ],
      stepA: [
        "..TTTT..",
        ".TTHHHT.",
        ".THSGHT.",
        "..SOOS..",
        ".XCCCCX.",
        ".XAOOAX.",
        ".XCOOCX.",
        ".O..O...",
        "..O...O.",
        "..O...O.",
      ],
      stepB: [
        "..TTTT..",
        ".TTHHHT.",
        ".THSGHT.",
        "..SOOS..",
        ".XCCCCX.",
        ".XAOOAX.",
        ".XCOOCX.",
        "...O..O.",
        ".O...O..",
        ".O...O..",
      ],
    },
    up: {
      idle: [
        "..TTTT..",
        ".TTHHHT.",
        ".THOOHT.",
        "..OOOO..",
        ".XCCCCX.",
        ".XAOOAX.",
        ".XCOOCX.",
        "..O..O..",
        ".O....O.",
        ".O....O.",
      ],
      stepA: [
        "..TTTT..",
        ".TTHHHT.",
        ".THOOHT.",
        "..OOOO..",
        ".XCCCCX.",
        ".XAOOAX.",
        ".XCOOCX.",
        ".O..O...",
        "..O...O.",
        "..O...O.",
      ],
      stepB: [
        "..TTTT..",
        ".TTHHHT.",
        ".THOOHT.",
        "..OOOO..",
        ".XCCCCX.",
        ".XAOOAX.",
        ".XCOOCX.",
        "...O..O.",
        ".O...O..",
        ".O...O..",
      ],
    },
    side: {
      idle: [
        "..TTT...",
        ".TTHHH..",
        ".THSGX..",
        "..SOOX..",
        ".XCCOX..",
        ".XAOOX..",
        ".XCCOX..",
        "...OO...",
        "..O..O..",
        "..O..O..",
      ],
      stepA: [
        "..TTT...",
        ".TTHHH..",
        ".THSGX..",
        "..SOOX..",
        ".XCCOX..",
        ".XAOOX..",
        ".XCCOX..",
        "..OO....",
        "...O.O..",
        "..O...O.",
      ],
      stepB: [
        "..TTT...",
        ".TTHHH..",
        ".THSGX..",
        "..SOOX..",
        ".XCCOX..",
        ".XAOOX..",
        ".XCCOX..",
        "....OO..",
        ".O.O....",
        ".O...O..",
      ],
    },
  },
};

const keys = new Set();
const FIXED_DT = 1 / 60;
const PLAYER_COLLISION_RADIUS = 0.38;
const GUEST_COLLISION_RADIUS = 0.4;
const MOVE_SUBSTEP_MAX = 0.06;
const COLLISION_EPSILON = 1e-4;
const GUEST_REST_CHANCE = 0.34;
const GUEST_REST_MIN_SEC = 2.6;
const GUEST_REST_MAX_SEC = 6.3;
const GUEST_CHAT_RANGE = 1.95;
const GUEST_CHAT_CHANCE_PER_SECOND = 0.86;
const GUEST_CHAT_MIN_SEC = 4.2;
const GUEST_CHAT_MAX_SEC = 8.2;
const GUEST_SOCIAL_DESTINATION_CHANCE = 0.26;

let game;
let manualStepMode = false;
let previous = performance.now();

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  const isBeginKey = key === "enter" || key === " ";

  if (key === "r") {
    startGame();
    return;
  }
  if (key === "f") {
    toggleFullscreen();
    return;
  }
  if (game && !game.started && isBeginKey) {
    e.preventDefault();
    beginGame();
    return;
  }

  if (game && game.conversation.active) {
    if (key === "escape" || key === "e") {
      endConversation();
      return;
    }
    if (key >= "1" && key <= "4") {
      askQuestion(Number(key) - 1);
      return;
    }
  }

  keys.add(key);

  if (key === "e") {
    tryTalk();
  }

  if (key === "c") {
    tryAccuse();
  }
});

window.addEventListener("keyup", (e) => {
  keys.delete(e.key.toLowerCase());
});

canvas.addEventListener("click", () => {
  if (game && !game.started) {
    beginGame();
  }
});

function startGame() {
  const rooms = createRooms();
  const walls = createWalls(rooms);
  const { furnishings, blockers } = createFurnishings(rooms);

  const guests = NAMES.map((name, i) => {
    const room = rooms[(i + 1) % rooms.length];
    const spawn = findSpawnInRoom(room, walls, blockers);
    return {
      id: i,
      name,
      color: COLORS[i],
      x: spawn.x,
      y: spawn.y,
      speed: 0.65,
      collisionRadius: GUEST_COLLISION_RADIUS,
      alive: true,
      memory: "I have nothing useful yet.",
      suspicion: 0,
      personality: ["nervous", "cold", "friendly", "guarded", "precise"][randInt(0, 4)],
      knowsMurderer: false,
      homeRoomId: (i + 1) % rooms.length,
      targetRoomId: (i + 1) % rooms.length,
      lingerSec: randRange(2, 5),
      intentCooldownSec: randRange(0.4, 1.2),
      socialCooldownSec: randRange(1.2, 4.2),
      path: [],
      pathIndex: 0,
      moving: false,
      activity: "roaming",
      activityTimerSec: 0,
      chatPartnerId: null,
      hearsay: [],
      lastTalkPartnerId: null,
      lastTalkRoomName: "",
      infoRevision: 0,
      animSeed: Math.random() * Math.PI * 2,
      facing: directionFromVector(Math.cos(i), Math.sin(i), "down"),
      goalLabel: "standing by",
      model: createGuestModel(i, COLORS[i]),
      discoveredDead: false,
      askedQuestions: {},
    };
  });

  const murderer = guests[randInt(0, guests.length - 1)].id;
  const playerSpawn = findSpawnInRoom(rooms[0], walls, blockers);

  game = {
    started: false,
    walls,
    blockers,
    rooms,
    furnishings,
    player: {
      x: playerSpawn.x,
      y: playerSpawn.y,
      speed: 1,
      collisionRadius: PLAYER_COLLISION_RADIUS,
      moving: false,
      facing: "down",
      animSeed: Math.PI * 0.5,
      model: {
        skin: "#d0ad8b",
        hair: "#2a231e",
        outfit: "#b79a6a",
        accent: "#5a4a35",
        hat: true,
        glasses: false,
        detective: true,
        mustache: true,
      },
    },
    guests,
    murderer,
    minutes: 0,
    elapsedRealSeconds: 0,
    killCooldownSec: randRange(70, 110),
    log: ["You are trapped until sunrise. Find the murderer."],
    ending: "",
    over: false,
    hoveredGuestId: null,
    corpses: [],
    atmosphericParticles: createAtmosphericParticles(78, walls, rooms),
    activeBubble: null,
    roomBackdrops: createRoomBackdropCache(rooms),
    conversation: {
      active: false,
      guestId: null,
    },
  };

  manualStepMode = false;
  previous = performance.now();
  uiDialogue.textContent = "";
  uiQuestions.textContent = "";
  uiCaseNotes.textContent = "";
  uiRoomBrief.textContent = "";
  updateUI();
}

function beginGame() {
  if (!game || game.started || game.over) return;
  game.started = true;
  game.log.unshift("The investigation begins. Stay close, question carefully, and accuse only when the story fits.");
  game.log = game.log.slice(0, 4);
  game.activeBubble = null;
  uiDialogue.textContent = "The guests start moving. Approach someone and press E to begin questioning.";
  updateUI();
}

function createRooms() {
  const cols = 3;
  const rows = 3;
  const insetX = 1;
  const insetY = 1;
  const wallGapX = 1;
  const wallGapY = 1;
  const roomWidths = splitSpan(WORLD_W - insetX * 2 - wallGapX * (cols - 1), cols);
  const roomHeights = splitSpan(WORLD_H - insetY * 2 - wallGapY * (rows - 1), rows);

  const roomRects = [];
  let y = insetY;
  for (let row = 0; row < rows; row++) {
    let x = insetX;
    for (let col = 0; col < cols; col++) {
      roomRects.push({
        x,
        y,
        w: Math.max(6, roomWidths[col]),
        h: Math.max(5, roomHeights[row]),
      });
      x += roomWidths[col] + wallGapX;
    }
    y += roomHeights[row] + wallGapY;
  }

  return roomRects.map((r, idx) => ({
    id: idx,
    name: ROOM_NAMES[idx],
    type: ROOM_TYPES[idx],
    ...r,
    cx: r.x + Math.floor(r.w / 2),
    cy: r.y + Math.floor(r.h / 2),
  }));
}

function splitSpan(total, parts) {
  const safeParts = Math.max(1, parts);
  const base = Math.floor(total / safeParts);
  let remainder = total - base * safeParts;
  return Array.from({ length: safeParts }, () => {
    const value = base + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    return Math.max(1, value);
  });
}

function createGuestModel(index, baseOutfit) {
  return {
    skin: SKIN_TONES[index % SKIN_TONES.length],
    hair: HAIR_COLORS[(index * 2) % HAIR_COLORS.length],
    outfit: baseOutfit,
    accent: OUTFIT_ACCENTS[index % OUTFIT_ACCENTS.length],
    hat: index % 4 === 0,
    glasses: index % 3 === 0,
  };
}

function directionFromVector(dx, dy, fallback = "down") {
  if (Math.abs(dx) < 1e-5 && Math.abs(dy) < 1e-5) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

function getRoomVisualTheme(type) {
  return ROOM_VISUALS[type] || ROOM_VISUALS.study;
}

function getPersonSpriteRows(model, facing, moving, seed = 0) {
  const family = model.detective ? PERSON_SPRITES.detective : PERSON_SPRITES.guest;
  const spriteKey = facing === "left" || facing === "right" ? "side" : facing;
  const frames = family[spriteKey] || family.down;
  if (!moving) return frames.idle;
  const tick = Math.floor(game.elapsedRealSeconds * 8 + seed * 3.5);
  return (tick & 1) === 0 ? frames.stepA : frames.stepB;
}

function createAtmosphericParticles(count, walls, rooms) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    let tx = randInt(0, WORLD_W - 1);
    let ty = randInt(0, WORLD_H - 1);
    for (let tries = 0; tries < 20; tries++) {
      if (walls[ty] && walls[ty][tx] === 1) break;
      tx = randInt(0, WORLD_W - 1);
      ty = randInt(0, WORLD_H - 1);
    }
    const room = rooms.find((r) => tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) || null;
    particles.push({
      x: tx + Math.random(),
      y: ty + Math.random(),
      driftX: randRange(-0.09, 0.09),
      driftY: randRange(-0.07, 0.07),
      size: randRange(0.45, 1.2),
      alpha: randRange(0.2, 0.65),
      phase: randRange(0, Math.PI * 2),
      roomId: room ? room.id : -1,
    });
  }
  return particles;
}

function createRoomBackdropCache(rooms) {
  const backdrops = {};
  for (const room of rooms) {
    const artCanvas = pixelArt.createCanvas(room.w * TILE, room.h * TILE);
    paintRoomBackdrop(artCanvas.ctx, room, artCanvas.canvas.width, artCanvas.canvas.height);
    backdrops[room.id] = artCanvas.canvas;
  }
  return backdrops;
}

function paintRoomBackdrop(target, room, width, height) {
  const theme = getRoomVisualTheme(room.type);
  const border = TILE;
  const innerX = border;
  const innerY = border;
  const innerW = Math.max(TILE, width - border * 2);
  const innerH = Math.max(TILE, height - border * 2);
  const pixel = Math.max(2, Math.floor(TILE / 4));

  pixelArt.panel(target, 0, 0, width, height, {
    fill: pixelArt.shade(theme.wall, -0.28),
    light: pixelArt.shade(theme.trim, 0.1),
    dark: pixelArt.shade(theme.wall, -0.5),
    outline: pixelArt.rgba(theme.trim, 0.38),
  });

  target.fillStyle = theme.wall;
  target.fillRect(pixel, pixel, width - pixel * 2, border - pixel);
  target.fillRect(pixel, height - border, width - pixel * 2, border - pixel);
  target.fillRect(pixel, border - pixel, border - pixel, height - border * 2 + pixel);
  target.fillRect(width - border, border - pixel, border - pixel, height - border * 2 + pixel);

  pixelArt.checker(
    target,
    innerX,
    innerY,
    innerW,
    innerH,
    Math.max(2, Math.floor(TILE / 3)),
    [ROOM_STYLES[room.type].floorA, ROOM_STYLES[room.type].floorB],
    room.id,
  );
  pixelArt.sprinkle(
    target,
    innerX,
    innerY,
    innerW,
    innerH,
    pixelArt.rgba(pixelArt.shade(theme.trim, 0.05), 0.28),
    0.1,
    room.id * 91 + 7,
  );

  target.fillStyle = pixelArt.rgba(theme.trim, 0.22);
  target.fillRect(innerX, innerY, innerW, pixel);
  target.fillRect(innerX, innerY + innerH - pixel, innerW, pixel);
  target.fillRect(innerX, innerY, pixel, innerH);
  target.fillRect(innerX + innerW - pixel, innerY, pixel, innerH);

  paintRoomMotif(target, room, theme, innerX, innerY, innerW, innerH, pixel);
  paintRoomWindows(target, room, theme, width, border, pixel);
}

function paintRoomWindows(target, room, theme, width, border, pixel) {
  const slots = room.type === "cellar" ? 1 : 2;
  for (let i = 0; i < slots; i++) {
    const inset = Math.floor((width / (slots + 1)) * (i + 1)) - TILE;
    target.fillStyle = pixelArt.shade(theme.trim, -0.35);
    target.fillRect(inset - pixel, pixel, TILE * 2 + pixel * 2, border - pixel);
    target.fillStyle = theme.window;
    target.fillRect(inset, pixel * 2, TILE * 2, border - pixel * 3);
    target.fillStyle = pixelArt.rgba("#ffffff", 0.16);
    target.fillRect(inset, pixel * 2, TILE * 2, pixel);
    target.fillStyle = pixelArt.rgba(theme.accent, 0.5);
    target.fillRect(inset - pixel, border - pixel * 2, TILE * 2 + pixel * 2, pixel);
  }
}

function paintRoomMotif(target, room, theme, x, y, w, h, pixel) {
  if (room.type === "study" || room.type === "library") {
    const runnerW = Math.max(TILE * 2, Math.floor(w * 0.42));
    const runnerX = x + Math.floor((w - runnerW) / 2);
    target.fillStyle = theme.carpet;
    target.fillRect(runnerX, y + TILE, runnerW, h - TILE * 2);
    target.fillStyle = pixelArt.shade(theme.trim, 0.18);
    target.fillRect(runnerX + pixel, y + TILE + pixel, runnerW - pixel * 2, pixel);
    target.fillRect(runnerX + pixel, y + h - TILE - pixel * 2, runnerW - pixel * 2, pixel);
    pixelArt.stripes(target, runnerX + pixel * 2, y + TILE * 2, runnerW - pixel * 4, h - TILE * 4, pixel * 3, [theme.accent, theme.carpet], false);
  } else if (room.type === "gallery") {
    pixelArt.stripes(target, x + TILE, y + TILE, w - TILE * 2, pixel * 3, pixel * 3, [theme.trim, theme.wallAlt], true);
    pixelArt.stripes(target, x + TILE, y + h - TILE - pixel * 3, w - TILE * 2, pixel * 3, pixel * 3, [theme.wallAlt, theme.trim], true);
  } else if (room.type === "conservatory") {
    target.fillStyle = pixelArt.rgba(theme.window, 0.16);
    for (let offset = x + TILE; offset < x + w - TILE; offset += TILE) {
      target.fillRect(offset, y, pixel, h);
    }
    for (let offset = y + TILE; offset < y + h - TILE; offset += TILE) {
      target.fillRect(x, offset, w, pixel);
    }
    pixelArt.sprinkle(target, x + TILE, y + TILE, w - TILE * 2, h - TILE * 2, pixelArt.rgba("#d7f6dd", 0.3), 0.18, room.id * 37);
  } else if (room.type === "kitchen") {
    pixelArt.stripes(target, x, y, w, h, pixel * 4, [ROOM_STYLES.kitchen.floorA, ROOM_STYLES.kitchen.floorB, theme.wallAlt], true);
    target.fillStyle = pixelArt.rgba(theme.trim, 0.14);
    for (let offset = x; offset < x + w; offset += TILE) {
      target.fillRect(offset, y, pixel, h);
    }
  } else if (room.type === "dining") {
    const rugW = Math.max(TILE * 3, Math.floor(w * 0.58));
    const rugH = Math.max(TILE * 2, Math.floor(h * 0.38));
    const rugX = x + Math.floor((w - rugW) / 2);
    const rugY = y + Math.floor((h - rugH) / 2);
    target.fillStyle = theme.carpet;
    target.fillRect(rugX, rugY, rugW, rugH);
    target.fillStyle = pixelArt.shade(theme.trim, 0.2);
    target.fillRect(rugX + pixel, rugY + pixel, rugW - pixel * 2, pixel);
    target.fillRect(rugX + pixel, rugY + rugH - pixel * 2, rugW - pixel * 2, pixel);
  } else if (room.type === "ballroom") {
    const cx = x + Math.floor(w / 2);
    const cy = y + Math.floor(h / 2);
    target.strokeStyle = pixelArt.rgba(theme.trim, 0.28);
    for (let ring = TILE; ring < Math.min(w, h) / 2; ring += TILE) {
      target.strokeRect(cx - ring, cy - ring, ring * 2, ring * 2);
    }
    target.fillStyle = pixelArt.rgba(theme.accent, 0.18);
    target.fillRect(cx - TILE, y + TILE, TILE * 2, h - TILE * 2);
    target.fillRect(x + TILE, cy - TILE, w - TILE * 2, TILE * 2);
  } else if (room.type === "cellar") {
    pixelArt.dither(target, x, y, w, h, [ROOM_STYLES.cellar.floorA, ROOM_STYLES.cellar.floorB], 3, room.id * 19);
    target.fillStyle = pixelArt.rgba(theme.trim, 0.1);
    for (let offset = y; offset < y + h; offset += TILE) {
      target.fillRect(x, offset, w, pixel);
    }
  } else if (room.type === "suite") {
    pixelArt.dither(target, x, y, w, h, [ROOM_STYLES.suite.floorA, theme.wallAlt], 4, room.id * 11);
    target.fillStyle = theme.carpet;
    target.fillRect(x + Math.floor(w * 0.18), y + Math.floor(h * 0.18), Math.floor(w * 0.64), Math.floor(h * 0.56));
    target.fillStyle = pixelArt.rgba(theme.trim, 0.18);
    target.fillRect(x + Math.floor(w * 0.2), y + Math.floor(h * 0.2), Math.floor(w * 0.6), pixel);
  }
}

function createFurnishings(rooms) {
  const furnishings = [];
  const blockers = Array.from({ length: WORLD_H }, () => Array(WORLD_W).fill(0));

  for (const room of rooms) {
    const left = room.x + 1;
    const right = room.x + room.w - 2;
    const top = room.y + 1;
    const bottom = room.y + room.h - 2;
    const centerX = room.cx;
    const centerY = room.cy;
    const interiorW = Math.max(2, room.w - 2);
    const interiorH = Math.max(2, room.h - 2);
    const spanWide = Math.max(2, room.w - 4);
    const spanTall = Math.max(2, room.h - 4);

    if (room.type === "study") {
      placeFurniture(furnishings, blockers, room, left + 1, top, Math.max(3, room.w - 5), 1, "bookshelf", true, "#7a5a44");
      placeFurniture(furnishings, blockers, room, left, top + 1, 2, spanTall, "fireplace", true, "#6a4d3b");
      placeFurniture(furnishings, blockers, room, right - 3, bottom - 1, 3, 2, "desk", true, "#7a5540");
      placeFurniture(furnishings, blockers, room, right - 2, bottom - 2, 1, 1, "chair", false, "#8f725d");
      placeFurniture(furnishings, blockers, room, centerX - 1, top + 1, 2, 1, "portrait", false, "#8a7262", { wallMounted: true });
      placeFurniture(furnishings, blockers, room, right, top, 1, 1, "globe", false, "#7485a7");
    } else if (room.type === "gallery") {
      placeFurniture(furnishings, blockers, room, left, top, interiorW, 1, "paintings", false, "#8d7b68", { wallMounted: true });
      placeFurniture(furnishings, blockers, room, left, bottom, interiorW, 1, "paintings", false, "#7f6d5a", { wallMounted: true });
      placeFurniture(furnishings, blockers, room, left, top + 1, 1, spanTall, "portrait", false, "#78685b", { wallMounted: true });
      placeFurniture(furnishings, blockers, room, right, top + 1, 1, spanTall, "portrait", false, "#78685b", { wallMounted: true });
      placeFurniture(furnishings, blockers, room, centerX - 4, centerY - 1, 2, 2, "pedestal", true, "#9ca3a8");
      placeFurniture(furnishings, blockers, room, centerX + 2, centerY - 1, 2, 2, "pedestal", true, "#9ca3a8");
      placeFurniture(furnishings, blockers, room, centerX - 1, bottom, 2, 1, "bench", false, "#6f5849");
    } else if (room.type === "conservatory") {
      const topPlanterHalf = Math.max(2, Math.floor((interiorW - 2) / 2));
      placeFurniture(furnishings, blockers, room, left, top, topPlanterHalf, 1, "planter_box", true, "#597b58");
      placeFurniture(furnishings, blockers, room, right - topPlanterHalf + 1, top, topPlanterHalf, 1, "planter_box", true, "#597b58");
      placeFurniture(furnishings, blockers, room, left, bottom, topPlanterHalf, 1, "planter_box", true, "#597b58");
      placeFurniture(furnishings, blockers, room, right - topPlanterHalf + 1, bottom, topPlanterHalf, 1, "planter_box", true, "#597b58");
      placeFurniture(furnishings, blockers, room, left, top + 1, 1, Math.max(1, centerY - top - 1), "plants", true, "#4c8b60");
      placeFurniture(furnishings, blockers, room, left, centerY + 1, 1, Math.max(1, bottom - centerY - 1), "plants", true, "#4c8b60");
      placeFurniture(furnishings, blockers, room, right, top + 1, 1, Math.max(1, centerY - top - 1), "plants", true, "#4c8b60");
      placeFurniture(furnishings, blockers, room, right, centerY + 1, 1, Math.max(1, bottom - centerY - 1), "plants", true, "#4c8b60");
      placeFurniture(furnishings, blockers, room, centerX - 1, centerY - 1, 2, 2, "fountain", true, "#6fa7b2");
      placeFurniture(furnishings, blockers, room, centerX - 2, top + 1, 1, 1, "trellis", false, "#7ca98b", { wallMounted: true });
      placeFurniture(furnishings, blockers, room, centerX + 1, top + 1, 1, 1, "trellis", false, "#7ca98b", { wallMounted: true });
    } else if (room.type === "kitchen") {
      placeFurniture(furnishings, blockers, room, left, top, interiorW, 1, "counter", true, "#78808a");
      placeFurniture(furnishings, blockers, room, left, top + 1, 2, 1, "sink", true, "#647186");
      placeFurniture(furnishings, blockers, room, right - 1, top + 1, 2, 1, "stove", true, "#5f676f");
      placeFurniture(furnishings, blockers, room, right, top + 2, 1, Math.max(2, room.h - 5), "pantry", true, "#6f7783");
      placeFurniture(furnishings, blockers, room, centerX - 1, centerY, 3, 2, "island", true, "#8a929b");
      placeFurniture(furnishings, blockers, room, left + 2, bottom, 3, 1, "counter", false, "#848d95");
    } else if (room.type === "dining") {
      const tableW = Math.max(5, room.w - 6);
      placeFurniture(furnishings, blockers, room, left + 1, top, spanWide, 1, "sideboard", true, "#7c5640");
      placeFurniture(furnishings, blockers, room, centerX - Math.floor(tableW / 2), centerY - 1, tableW, 2, "table", true, "#714e3a");
      placeFurniture(furnishings, blockers, room, centerX - 1, centerY - 1, 2, 1, "candelabra", false, "#cbb78a");
      placeFurniture(furnishings, blockers, room, left + 1, centerY - 1, 1, 1, "chair", false, "#8d705a");
      placeFurniture(furnishings, blockers, room, right - 1, centerY - 1, 1, 1, "chair", false, "#8d705a");
      placeFurniture(furnishings, blockers, room, left + 1, centerY + 1, 1, 1, "chair", false, "#8d705a");
      placeFurniture(furnishings, blockers, room, right - 1, centerY + 1, 1, 1, "chair", false, "#8d705a");
      placeFurniture(furnishings, blockers, room, left, top + 1, 1, 2, "portrait", false, "#7e6a59", { wallMounted: true });
      placeFurniture(furnishings, blockers, room, right, top + 1, 1, 2, "portrait", false, "#7e6a59", { wallMounted: true });
    } else if (room.type === "ballroom") {
      placeFurniture(furnishings, blockers, room, left, top, interiorW, interiorH, "rug", false, "#5b4768");
      placeFurniture(furnishings, blockers, room, left + 1, top + 1, 3, 1, "stage", true, "#6f577d");
      placeFurniture(furnishings, blockers, room, right - 3, top + 1, 3, 2, "piano", true, "#2b2b31");
      placeFurniture(furnishings, blockers, room, centerX - 1, centerY - 1, 2, 2, "chandelier", false, "#d9c1a2");
      placeFurniture(furnishings, blockers, room, left + 1, bottom, 3, 1, "bench", false, "#6d5878");
      placeFurniture(furnishings, blockers, room, right - 3, bottom, 3, 1, "bench", false, "#6d5878");
    } else if (room.type === "cellar") {
      placeFurniture(furnishings, blockers, room, left, top, interiorW, 1, "wine_rack", true, "#69563f");
      placeFurniture(furnishings, blockers, room, left, top + 1, 2, 2, "crate", true, "#6a573f");
      placeFurniture(furnishings, blockers, room, right - 1, top + 1, 2, 2, "crate", true, "#6a573f");
      placeFurniture(furnishings, blockers, room, left, bottom - 1, 2, 2, "barrel", true, "#5c4936");
      placeFurniture(furnishings, blockers, room, right - 1, bottom - 1, 2, 2, "barrel", true, "#5c4936");
      placeFurniture(furnishings, blockers, room, centerX - 1, centerY, 2, 1, "workbench", true, "#735e44");
      placeFurniture(furnishings, blockers, room, centerX - 1, top + 1, 2, 1, "hanging_lamp", false, "#c7a882", { wallMounted: true });
    } else if (room.type === "library") {
      const lowerShelfSpan = Math.max(2, Math.floor((room.w - 4) / 2));
      placeFurniture(furnishings, blockers, room, left, top, interiorW, 1, "bookshelf", true, "#715138");
      placeFurniture(furnishings, blockers, room, left, top + 1, 1, spanTall, "bookshelf", true, "#715138");
      placeFurniture(furnishings, blockers, room, right, top + 1, 1, spanTall, "bookshelf", true, "#715138");
      placeFurniture(furnishings, blockers, room, left, bottom, lowerShelfSpan, 1, "bookshelf", true, "#715138");
      placeFurniture(furnishings, blockers, room, right - lowerShelfSpan + 1, bottom, lowerShelfSpan, 1, "bookshelf", true, "#715138");
      placeFurniture(furnishings, blockers, room, centerX - 3, centerY - 1, 2, 1, "reading_table", true, "#846447");
      placeFurniture(furnishings, blockers, room, centerX + 1, centerY - 1, 2, 1, "reading_table", true, "#846447");
      placeFurniture(furnishings, blockers, room, centerX - 1, top + 1, 2, 1, "lamp", false, "#d2b98c");
    } else if (room.type === "suite") {
      placeFurniture(furnishings, blockers, room, left, top + 1, 4, 2, "bed", true, "#8792b2");
      placeFurniture(furnishings, blockers, room, left + 4, top + 1, 1, 1, "nightstand", true, "#8f7b6c");
      placeFurniture(furnishings, blockers, room, right - 1, top + 1, 2, 3, "wardrobe", true, "#6e6561");
      placeFurniture(furnishings, blockers, room, centerX - 2, centerY, 4, 2, "rug", false, "#6e617f");
      placeFurniture(furnishings, blockers, room, right - 2, bottom, 2, 1, "vanity", true, "#a08f86");
      placeFurniture(furnishings, blockers, room, left, bottom, 2, 1, "fireplace", true, "#65574d");
      placeFurniture(furnishings, blockers, room, centerX - 2, top, 2, 1, "portrait", false, "#8a7383", { wallMounted: true });
      placeFurniture(furnishings, blockers, room, centerX + 1, top, 2, 1, "portrait", false, "#8a7383", { wallMounted: true });
    }
  }

  return { furnishings, blockers };
}

function placeFurniture(furnishings, blockers, room, x, y, w, h, kind, blocking, color, options = {}) {
  const sx = clampTileX(x);
  const sy = clampTileY(y);
  const sw = Math.max(1, Math.min(w, WORLD_W - sx));
  const sh = Math.max(1, Math.min(h, WORLD_H - sy));

  furnishings.push({
    roomId: room.id,
    x: sx,
    y: sy,
    w: sw,
    h: sh,
    kind,
    color,
    wallMounted: !!options.wallMounted,
  });

  if (!blocking) return;
  for (let ty = sy; ty < sy + sh; ty++) {
    for (let tx = sx; tx < sx + sw; tx++) {
      // Keep corridor strips traversable so room-to-room navigation remains possible.
      const onVerticalCorridor = tx === Math.floor(WORLD_W / 2) || tx === Math.floor(WORLD_W / 2) + 1;
      const onHorizontalCorridor = ty === Math.floor(WORLD_H / 2) || ty === Math.floor(WORLD_H / 2) + 1;
      if (onVerticalCorridor || onHorizontalCorridor) continue;
      blockers[ty][tx] = 1;
    }
  }
}

function findSpawnInRoom(room, walls, blockers) {
  for (let i = 0; i < 30; i++) {
    const x = randInt(room.x + 1, room.x + room.w - 2);
    const y = randInt(room.y + 1, room.y + room.h - 2);
    if (walls[y] && walls[y][x] === 1 && blockers[y] && blockers[y][x] !== 1) {
      return { x: x + 0.5, y: y + 0.5 };
    }
  }
  return { x: room.cx + 0.5, y: room.cy + 0.5 };
}

function createWalls(rooms) {
  const floor = Array.from({ length: WORLD_H }, () => Array(WORLD_W).fill(0));

  for (const room of rooms) {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        if (x >= 0 && y >= 0 && x < WORLD_W && y < WORLD_H) {
          floor[y][x] = 1;
        }
      }
    }
  }

  // Connect all rooms with guaranteed corridors.
  const links = [
    [0, 1], [1, 2],
    [3, 4], [4, 5],
    [6, 7], [7, 8],
    [0, 3], [3, 6],
    [1, 4], [4, 7],
    [2, 5], [5, 8],
  ];

  for (const [a, b] of links) {
    carveTunnel(floor, rooms[a].cx, rooms[a].cy, rooms[b].cx, rooms[b].cy);
  }

  return floor;
}

function carveTunnel(floor, x1, y1, x2, y2) {
  const stepX = x2 >= x1 ? 1 : -1;
  const stepY = y2 >= y1 ? 1 : -1;

  for (let x = x1; x !== x2 + stepX; x += stepX) {
    carveTile(floor, x, y1);
    carveTile(floor, x, y1 + 1);
  }
  for (let y = y1; y !== y2 + stepY; y += stepY) {
    carveTile(floor, x2, y);
    carveTile(floor, x2 + 1, y);
  }
}

function carveTile(floor, x, y) {
  if (x >= 0 && y >= 0 && x < WORLD_W && y < WORLD_H) {
    floor[y][x] = 1;
  }
}

function isWalkable(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  return !isBlockedTile(tx, ty);
}

function isBlockedTile(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) return true;
  if (!game.walls[ty] || game.walls[ty][tx] !== 1) return true;
  return !!(game.blockers && game.blockers[ty] && game.blockers[ty][tx] === 1);
}

function canOccupyPosition(x, y, radius = 0) {
  const r = Math.max(0, radius);
  if (r === 0) return isWalkable(x, y);

  const minTx = Math.floor(x - r);
  const maxTx = Math.floor(x + r);
  const minTy = Math.floor(y - r);
  const maxTy = Math.floor(y + r);

  for (let ty = minTy; ty <= maxTy; ty++) {
    for (let tx = minTx; tx <= maxTx; tx++) {
      if (!isBlockedTile(tx, ty)) continue;
      const nearestX = Math.max(tx, Math.min(x, tx + 1));
      const nearestY = Math.max(ty, Math.min(y, ty + 1));
      const ox = x - nearestX;
      const oy = y - nearestY;
      if (ox * ox + oy * oy < r * r - COLLISION_EPSILON) {
        return false;
      }
    }
  }

  return true;
}

function moveAxisWithCollision(entity, axis, amount) {
  if (amount === 0) return false;
  const target = entity[axis] + amount;
  const radius = entity.collisionRadius || 0;

  const tryX = axis === "x" ? target : entity.x;
  const tryY = axis === "y" ? target : entity.y;
  if (canOccupyPosition(tryX, tryY, radius)) {
    entity[axis] = target;
    return true;
  }

  let lo = 0;
  let hi = 1;
  let best = entity[axis];
  for (let i = 0; i < 7; i++) {
    const mid = (lo + hi) * 0.5;
    const probe = entity[axis] + amount * mid;
    const probeX = axis === "x" ? probe : entity.x;
    const probeY = axis === "y" ? probe : entity.y;
    if (canOccupyPosition(probeX, probeY, radius)) {
      best = probe;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  if (best !== entity[axis]) {
    entity[axis] = best;
    return true;
  }
  return false;
}

function attemptMove(entity, dx, dy) {
  const totalDistance = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(totalDistance / MOVE_SUBSTEP_MAX));
  const stepX = dx / steps;
  const stepY = dy / steps;

  for (let i = 0; i < steps; i++) {
    const xFirst = Math.abs(stepX) >= Math.abs(stepY);
    if (xFirst) {
      moveAxisWithCollision(entity, "x", stepX);
      moveAxisWithCollision(entity, "y", stepY);
    } else {
      moveAxisWithCollision(entity, "y", stepY);
      moveAxisWithCollision(entity, "x", stepX);
    }
  }
}

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;

  game.player.moving = dx !== 0 || dy !== 0;
  if (game.player.moving) {
    game.player.facing = directionFromVector(dx, dy, game.player.facing);
    const len = Math.hypot(dx, dy) || 1;
    const step = game.player.speed * dt * 6;
    attemptMove(game.player, (dx / len) * step, (dy / len) * step);
  }
}

function rememberGuestIntel(guest, text, details = {}) {
  if (!guest || !text) return;
  const entry = {
    text,
    sourceName: details.sourceName || null,
    suspectId: Number.isInteger(details.suspectId) ? details.suspectId : null,
    suspectName: details.suspectName || null,
    roomName: details.roomName || null,
    atSec: game.elapsedRealSeconds,
  };
  const prev = guest.hearsay.length > 0 ? guest.hearsay[guest.hearsay.length - 1] : null;
  const duplicate = prev &&
    prev.text === entry.text &&
    prev.sourceName === entry.sourceName &&
    prev.suspectId === entry.suspectId;
  if (duplicate) return;

  guest.hearsay.push(entry);
  if (guest.hearsay.length > 6) guest.hearsay.shift();
  guest.memory = text;
  guest.infoRevision += 1;
}

function latestGuestIntel(guest) {
  if (!guest || guest.hearsay.length === 0) return null;
  return guest.hearsay[guest.hearsay.length - 1];
}

function clearGuestPath(guest) {
  guest.path = [];
  guest.pathIndex = 0;
  guest.moving = false;
}

function finishGuestConversation(guest) {
  if (!guest || guest.activity !== "chatting") return;
  guest.activity = "roaming";
  guest.activityTimerSec = 0;
  guest.chatPartnerId = null;
  guest.goalLabel = "collecting thoughts";
  guest.socialCooldownSec = Math.max(guest.socialCooldownSec, randRange(3.8, 8.2));
  guest.lingerSec = Math.max(guest.lingerSec, randRange(1.2, 3.2));
  guest.intentCooldownSec = Math.max(guest.intentCooldownSec, guest.lingerSec + randRange(0.8, 2.2));
}

function maybeStartGuestRest(guest) {
  if (guest.activity !== "roaming") return false;
  if (guest.lingerSec > 0) return false;
  if (Math.random() >= GUEST_REST_CHANCE) return false;

  const room = roomAt(guest.x, guest.y);
  const roomName = room ? room.name : "hallway";
  guest.activity = "resting";
  guest.activityTimerSec = randRange(GUEST_REST_MIN_SEC, GUEST_REST_MAX_SEC);
  guest.goalLabel = `resting in the ${roomName}`;
  guest.socialCooldownSec = Math.max(guest.socialCooldownSec, guest.activityTimerSec * 0.45);
  guest.intentCooldownSec = Math.max(guest.intentCooldownSec, guest.activityTimerSec + randRange(0.6, 1.6));
  clearGuestPath(guest);
  return true;
}

function pickNearbyChatPartner(guest) {
  let best = null;
  let bestD = GUEST_CHAT_RANGE;
  for (const other of game.guests) {
    if (!other.alive || other.id === guest.id) continue;
    if (other.activity === "chatting") continue;
    if (other.socialCooldownSec > 0) continue;
    const d = distance(guest, other);
    if (d <= bestD) {
      bestD = d;
      best = other;
    }
  }
  return best;
}

function buildGuestChatIntel(listener, partner, roomName) {
  const partnerIntel = latestGuestIntel(partner);
  if (partnerIntel && Math.random() < 0.4) {
    return {
      text: `${partner.name} repeated a rumor about ${partnerIntel.suspectName || "someone"} near the ${roomName}.`,
      suspectId: partnerIntel.suspectId,
      suspectName: partnerIntel.suspectName,
    };
  }

  if (partner.id === game.murderer && listener.id !== game.murderer && Math.random() < 0.42) {
    const scapegoat = randomAliveGuestName([listener.id, partner.id]);
    if (scapegoat) {
      return {
        text: `${partner.name} claimed ${scapegoat} was lurking near the ${roomName}.`,
        suspectName: scapegoat,
      };
    }
  }

  const pool = game.guests.filter((g) => g.alive && g.id !== listener.id && g.id !== partner.id);
  let suspect = null;
  if (listener.id !== game.murderer && Math.random() < 0.48) {
    const killer = game.guests[game.murderer];
    if (killer && killer.alive && killer.id !== listener.id && killer.id !== partner.id) {
      suspect = killer;
    }
  }
  if (!suspect && pool.length > 0) {
    suspect = pool[randInt(0, pool.length - 1)];
  }

  if (!suspect) {
    return {
      text: `${partner.name} and I compared timelines in the ${roomName}.`,
      suspectId: null,
      suspectName: null,
    };
  }

  return {
    text: `${partner.name} said ${suspect.name} was moving quickly near the ${roomName}.`,
    suspectId: suspect.id,
    suspectName: suspect.name,
  };
}

function startGuestConversation(guest, partner) {
  if (!guest || !partner) return false;
  if (!guest.alive || !partner.alive) return false;
  if (guest.id === partner.id) return false;
  if (guest.activity === "chatting" || partner.activity === "chatting") return false;

  const room = roomAt((guest.x + partner.x) * 0.5, (guest.y + partner.y) * 0.5);
  const roomName = room ? room.name : "hallway";
  const duration = randRange(GUEST_CHAT_MIN_SEC, GUEST_CHAT_MAX_SEC);
  const intelA = buildGuestChatIntel(guest, partner, roomName);
  const intelB = buildGuestChatIntel(partner, guest, roomName);

  clearGuestPath(guest);
  clearGuestPath(partner);

  guest.activity = "chatting";
  partner.activity = "chatting";
  guest.activityTimerSec = duration;
  partner.activityTimerSec = duration;
  guest.chatPartnerId = partner.id;
  partner.chatPartnerId = guest.id;
  guest.goalLabel = `talking with ${partner.name}`;
  partner.goalLabel = `talking with ${guest.name}`;
  guest.socialCooldownSec = Math.max(guest.socialCooldownSec, duration * 0.5);
  partner.socialCooldownSec = Math.max(partner.socialCooldownSec, duration * 0.5);
  guest.lastTalkPartnerId = partner.id;
  partner.lastTalkPartnerId = guest.id;
  guest.lastTalkRoomName = roomName;
  partner.lastTalkRoomName = roomName;

  rememberGuestIntel(guest, intelA.text, {
    sourceName: partner.name,
    suspectId: intelA.suspectId,
    suspectName: intelA.suspectName,
    roomName,
  });
  rememberGuestIntel(partner, intelB.text, {
    sourceName: guest.name,
    suspectId: intelB.suspectId,
    suspectName: intelB.suspectName,
    roomName,
  });

  if (intelA.suspectId === game.murderer && guest.id !== game.murderer) {
    guest.knowsMurderer = true;
    guest.suspicion = Math.min(100, guest.suspicion + 18);
  }
  if (intelB.suspectId === game.murderer && partner.id !== game.murderer) {
    partner.knowsMurderer = true;
    partner.suspicion = Math.min(100, partner.suspicion + 18);
  }

  if (!game.activeBubble && canPlayerSee(guest.x, guest.y)) {
    game.activeBubble = {
      speakerId: guest.id,
      text: intelA.text,
      ttl: 4.4,
    };
  }
  return true;
}

function maybeStartGuestConversation(guest, dt) {
  if (guest.activity !== "roaming") return false;
  if (guest.socialCooldownSec > 0) return false;
  if (Math.random() >= GUEST_CHAT_CHANCE_PER_SECOND * dt) return false;

  const partner = pickNearbyChatPartner(guest);
  if (!partner) return false;
  if (distance(guest, partner) > GUEST_CHAT_RANGE) return false;
  return startGuestConversation(guest, partner);
}

function updateGuest(guest, dt) {
  if (!guest.alive) {
    guest.moving = false;
    return;
  }

  guest.intentCooldownSec -= dt;
  guest.lingerSec -= dt;
  guest.socialCooldownSec = Math.max(0, guest.socialCooldownSec - dt);
  if (guest.activityTimerSec > 0) guest.activityTimerSec -= dt;

  if (guest.activity === "resting") {
    guest.moving = false;
    if (guest.activityTimerSec > 0) return;
    guest.activity = "roaming";
    guest.goalLabel = "standing by";
    guest.lingerSec = Math.max(guest.lingerSec, randRange(0.8, 2.2));
    guest.intentCooldownSec = Math.max(guest.intentCooldownSec, guest.lingerSec + randRange(0.8, 2.2));
  }

  if (guest.activity === "chatting") {
    guest.moving = false;
    const partner = game.guests[guest.chatPartnerId];
    if (!partner || !partner.alive || partner.chatPartnerId !== guest.id) {
      finishGuestConversation(guest);
      return;
    }
    if (guest.activityTimerSec > 0 && partner.activityTimerSec > 0) return;
    finishGuestConversation(guest);
    finishGuestConversation(partner);
    return;
  }

  if (guest.id === game.murderer && guest.intentCooldownSec <= 0 && Math.random() < 0.65) {
    const target = nearestVictimForMurderer();
    if (target) {
      assignGuestPath(guest, target.x, target.y, `shadowing ${target.name}`);
      guest.intentCooldownSec = randRange(0.7, 1.6);
    }
  }

  if (guest.path.length === 0 || guest.pathIndex >= guest.path.length) {
    guest.moving = false;
    if (maybeStartGuestConversation(guest, dt)) return;
    if (maybeStartGuestRest(guest)) return;
    if (guest.lingerSec <= 0 || guest.intentCooldownSec <= 0) {
      chooseGuestDestination(guest);
    }
  } else {
    followGuestPath(guest, dt);
    if (!guest.moving && maybeStartGuestConversation(guest, dt * 0.8)) return;
  }

  for (const other of game.guests) {
    if (!other.alive || other.id === guest.id) continue;
    if (distance(guest, other) < 1.5 && Math.random() < 0.24 * dt) {
      const otherRoom = roomAt(other.x, other.y);
      const roomHint = otherRoom ? ` in the ${otherRoom.name}` : " in the hallway";
      rememberGuestIntel(guest, `I saw ${other.name}${roomHint}.`, {
        sourceName: guest.name,
        suspectId: other.id,
        suspectName: other.name,
        roomName: otherRoom ? otherRoom.name : "hallway",
      });
      if (other.id === game.murderer && guest.id !== game.murderer) {
        guest.knowsMurderer = true;
        guest.suspicion = Math.min(100, guest.suspicion + 20);
      }
    }
  }
}

function chooseGuestDestination(guest) {
  guest.activity = "roaming";
  guest.chatPartnerId = null;
  if (guest.id !== game.murderer && Math.random() < GUEST_SOCIAL_DESTINATION_CHANCE) {
    const socialTargets = game.guests.filter((g) => g.alive && g.id !== guest.id);
    if (socialTargets.length > 0) {
      const targetGuest = socialTargets[randInt(0, socialTargets.length - 1)];
      assignGuestPath(guest, targetGuest.x, targetGuest.y, `meeting ${targetGuest.name}`);
      if (guest.path.length > 0) {
        const targetRoom = roomAt(targetGuest.x, targetGuest.y);
        guest.targetRoomId = targetRoom ? targetRoom.id : guest.targetRoomId;
        guest.lingerSec = randRange(2.4, 5.6);
        guest.intentCooldownSec = guest.lingerSec + randRange(0.7, 1.9);
        return;
      }
    }
  }

  const currentRoom = roomAt(guest.x, guest.y);
  const currentRoomId = currentRoom ? currentRoom.id : -1;
  const options = game.rooms.filter((room) => room.id !== currentRoomId);
  const targetRoom = options[randInt(0, options.length - 1)];
  const targetPoint = randomPointInRoom(targetRoom);
  assignGuestPath(guest, targetPoint.x, targetPoint.y, `heading to ${targetRoom.name}`);
  guest.targetRoomId = targetRoom.id;
  guest.lingerSec = randRange(3, 8);
  if (guest.id === game.murderer) {
    guest.intentCooldownSec = randRange(1.4, 3.4);
  } else {
    guest.intentCooldownSec = guest.lingerSec + randRange(0.8, 2.4);
  }
}

function followGuestPath(guest, dt) {
  const nextStep = guest.path[guest.pathIndex];
  if (!nextStep) return;

  const targetX = nextStep.x + 0.5;
  const targetY = nextStep.y + 0.5;
  const vx = targetX - guest.x;
  const vy = targetY - guest.y;
  const d = Math.hypot(vx, vy);

  if (d < 0.12) {
    guest.moving = false;
    guest.pathIndex += 1;
    if (guest.pathIndex >= guest.path.length) {
      guest.path = [];
      guest.pathIndex = 0;
    }
    return;
  }

  const n = d || 1;
  const step = guest.speed * dt * 2.2;
  guest.moving = true;
  guest.facing = directionFromVector(vx, vy, guest.facing);
  attemptMove(guest, (vx / n) * step, (vy / n) * step);
}

function assignGuestPath(guest, targetX, targetY, goalLabel) {
  const path = buildTilePath(
    Math.floor(guest.x),
    Math.floor(guest.y),
    Math.floor(targetX),
    Math.floor(targetY),
  );

  if (path.length > 0) {
    guest.path = path;
    guest.pathIndex = 0;
    guest.activity = "roaming";
    guest.chatPartnerId = null;
    guest.goalLabel = goalLabel;
  }
}

function buildTilePath(startX, startY, endX, endY) {
  const sx = clampTileX(startX);
  const sy = clampTileY(startY);
  const ex = clampTileX(endX);
  const ey = clampTileY(endY);

  if (!isWalkable(sx + 0.5, sy + 0.5) || !isWalkable(ex + 0.5, ey + 0.5)) return [];
  if (sx === ex && sy === ey) return [];

  const visited = Array.from({ length: WORLD_H }, () => Array(WORLD_W).fill(false));
  const prev = Array.from({ length: WORLD_H }, () => Array(WORLD_W).fill(null));
  const queue = [{ x: sx, y: sy }];
  visited[sy][sx] = true;

  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    if (node.x === ex && node.y === ey) break;

    for (const dir of dirs) {
      const nx = node.x + dir.x;
      const ny = node.y + dir.y;
      if (nx < 0 || ny < 0 || nx >= WORLD_W || ny >= WORLD_H) continue;
      if (visited[ny][nx]) continue;
      if (!isWalkable(nx + 0.5, ny + 0.5)) continue;
      visited[ny][nx] = true;
      prev[ny][nx] = node;
      queue.push({ x: nx, y: ny });
    }
  }

  if (!visited[ey][ex]) return [];

  const path = [];
  let cur = { x: ex, y: ey };
  while (cur && !(cur.x === sx && cur.y === sy)) {
    path.push(cur);
    cur = prev[cur.y][cur.x];
  }
  path.reverse();
  return path;
}

function nearestVictimForMurderer() {
  const murderer = game.guests[game.murderer];
  let best = null;
  let bestD = Infinity;

  for (const g of game.guests) {
    if (!g.alive || g.id === game.murderer) continue;
    const d = distance(murderer, g);
    if (d < bestD) {
      bestD = d;
      best = g;
    }
  }

  return best;
}

function canPlayerSee(x, y) {
  const playerRoom = roomAt(game.player.x, game.player.y);
  const targetRoom = roomAt(x, y);

  if (playerRoom) {
    return !!targetRoom && playerRoom.id === targetRoom.id;
  }

  if (!targetRoom) {
    return distance(game.player, { x, y }) <= 2.6;
  }

  return false;
}

function tryMurder(dt) {
  if (game.over) return;
  if (game.killCooldownSec > 0) {
    game.killCooldownSec -= dt;
    return;
  }

  const killer = game.guests[game.murderer];
  if (!killer.alive) return;

  const alive = game.guests.filter((g) => g.alive && g.id !== game.murderer);
  if (alive.length === 0) return;

  let victim = null;
  for (const g of alive) {
    if (distance(killer, g) < 1.2) {
      victim = g;
      break;
    }
  }

  if (!victim) return;

  // Murderer avoids killing directly in front of the detective.
  if (canPlayerSee(victim.x, victim.y) || canPlayerSee(killer.x, killer.y)) {
    game.killCooldownSec = randRange(10, 22);
    return;
  }

  // Murderer avoids striking when too many living witnesses are nearby.
  const watched = game.guests.some((g) =>
    g.alive && g.id !== game.murderer && g.id !== victim.id && distance(g, victim) < 2.8
  );
  if (watched) {
    game.killCooldownSec = randRange(8, 18);
    return;
  }

  victim.alive = false;
  victim.discoveredDead = false;
  game.corpses.push({
    x: victim.x,
    y: victim.y,
    victimId: victim.id,
    name: victim.name,
    discovered: false,
    murderedAtSec: game.elapsedRealSeconds,
  });

  for (const g of game.guests) {
    if (!g.alive || g.id === game.murderer) continue;
    if (distance(g, victim) < 3.5) {
      rememberGuestIntel(g, `I heard movement near where ${victim.name} died.`, {
        sourceName: "noise",
        roomName: roomAt(victim.x, victim.y) ? roomAt(victim.x, victim.y).name : "hallway",
      });
      g.suspicion = Math.min(100, g.suspicion + 15);
      if (Math.random() < 0.45) {
        rememberGuestIntel(g, `I think I spotted ${killer.name} near ${victim.name} earlier.`, {
          sourceName: "sighting",
          suspectId: killer.id,
          suspectName: killer.name,
          roomName: roomAt(victim.x, victim.y) ? roomAt(victim.x, victim.y).name : "hallway",
        });
      }
    }
  }

  game.killCooldownSec = randRange(75, 135);

  const livingInnocents = game.guests.filter((g) => g.alive && g.id !== game.murderer).length;
  if (livingInnocents === 0) {
    game.over = true;
    game.ending = "All the guests are dead. The murderer wins.";
  }
}

function updateCorpseDiscovery() {
  for (const corpse of game.corpses) {
    if (corpse.discovered) continue;

    const seenByPlayer = canPlayerSee(corpse.x, corpse.y);
    const witness = game.guests.find((g) => g.alive && g.id !== game.murderer && distance(g, corpse) <= 1.2);
    if (!seenByPlayer && !witness) continue;

    corpse.discovered = true;

    const victim = game.guests[corpse.victimId];
    if (victim) victim.discoveredDead = true;

    const room = roomAt(corpse.x, corpse.y);
    const roomSuffix = room ? ` in the ${room.name}` : "";
    if (seenByPlayer) {
      game.log.unshift(`You discovered ${corpse.name}'s body${roomSuffix}.`);
    } else {
      game.log.unshift(`A guest discovered ${corpse.name}'s body${roomSuffix}.`);
      if (witness) {
        rememberGuestIntel(witness, `I found ${corpse.name}'s body${roomSuffix}.`, {
          sourceName: witness.name,
          roomName: room ? room.name : "hallway",
        });
      }
    }
    game.log = game.log.slice(0, 4);

    for (const g of game.guests) {
      if (!g.alive || g.id === game.murderer) continue;
      g.suspicion = Math.min(100, g.suspicion + 6);
    }
  }
}

function tryTalk() {
  if (!game.started) {
    uiDialogue.textContent = "Press Enter or Space to begin the investigation.";
    return;
  }
  if (game.over) return;
  if (game.conversation.active) return;

  const g = nearestGuest(1.8, true);
  if (!g) {
    uiDialogue.textContent = "No one close enough to talk to.";
    game.activeBubble = null;
    return;
  }

  game.hoveredGuestId = g.id;

  if (!g.alive) {
    uiDialogue.textContent = `${g.name} is dead.`;
    return;
  }

  startConversation(g);
}

function startConversation(guest) {
  game.conversation.active = true;
  game.conversation.guestId = guest.id;

  const opening = guest.id === game.murderer
    ? "I can spare a moment. Ask what you need."
    : "Alright detective. Ask me what you need.";

  uiDialogue.textContent = `${guest.name}: ${opening}`;
  game.activeBubble = {
    speakerId: guest.id,
    text: opening,
    ttl: 7,
  };
}

function endConversation() {
  if (!game.conversation.active) return;
  game.conversation.active = false;
  game.conversation.guestId = null;
  game.activeBubble = null;
  uiDialogue.textContent = "Conversation ended.";
}

function askQuestion(questionIndex) {
  if (!game.conversation.active) return;

  const question = QUESTION_SET[questionIndex];
  if (!question) return;

  const guest = game.guests[game.conversation.guestId];
  if (!guest || !guest.alive) {
    endConversation();
    return;
  }

  const currentRevision = guest.infoRevision || 0;
  const lastAskedRevision = Number.isFinite(guest.askedQuestions[question.id])
    ? guest.askedQuestions[question.id]
    : -1;
  const askedBefore = lastAskedRevision >= currentRevision;
  const answer = askedBefore
    ? "I already answered that. Ask something else."
    : answerQuestion(guest, question.id);
  if (!askedBefore) {
    guest.askedQuestions[question.id] = currentRevision;
  }

  uiDialogue.textContent = `You: ${question.label}\n${guest.name}: ${answer}`;
  game.activeBubble = {
    speakerId: guest.id,
    text: answer,
    ttl: 8,
  };
}

function tryAccuse() {
  if (!game.started) {
    uiDialogue.textContent = "Begin the investigation before making an accusation.";
    return;
  }
  if (game.over) return;
  if (game.conversation.active) {
    uiDialogue.textContent = "Finish the current conversation first (Esc).";
    return;
  }

  const g = nearestGuest(1.8, true);
  if (!g || !g.alive) {
    uiDialogue.textContent = "Move closer to an alive guest to accuse them.";
    return;
  }

  if (g.id === game.murderer) {
    game.over = true;
    game.ending = `You accused ${g.name}. They were the murderer. You survive until sunrise.`;
    uiStatus.textContent = game.ending;
  } else {
    game.over = true;
    const killerName = game.guests[game.murderer].name;
    game.ending = `${g.name} is innocent. The real murderer, ${killerName}, slips away in the panic.`;
    uiStatus.textContent = game.ending;
  }
  game.activeBubble = null;
}

function nearestGuest(maxD, aliveOnly = false) {
  let best = null;
  let bestD = maxD;

  for (const g of game.guests) {
    if (aliveOnly && !g.alive) continue;
    const d = distance(game.player, g);
    if (d <= bestD) {
      bestD = d;
      best = g;
    }
  }

  return best;
}

function answerQuestion(guest, questionId) {
  const killer = game.guests[game.murderer];
  const currentRoom = roomAt(guest.x, guest.y);
  const roomName = currentRoom ? currentRoom.name : "hallway";
  const isMurderer = guest.id === game.murderer;
  const recentIntel = latestGuestIntel(guest);
  const recentPartner = Number.isInteger(guest.lastTalkPartnerId)
    ? game.guests[guest.lastTalkPartnerId]
    : null;
  const recentRoomName = guest.lastTalkRoomName || roomName;

  if (questionId === "where_were_you") {
    if (isMurderer) {
      const bluffRoom = game.rooms[randInt(0, game.rooms.length - 1)];
      return `Mostly in the ${bluffRoom.name}. I kept to myself.`;
    }
    if (guest.activity === "resting") {
      return `I took a breather in the ${roomName}.`;
    }
    if (guest.activity === "chatting" && recentPartner && recentPartner.alive) {
      return `I was talking with ${recentPartner.name} in the ${roomName}.`;
    }
    if (recentPartner && recentPartner.alive && recentRoomName) {
      return `A moment ago I was speaking with ${recentPartner.name} in the ${recentRoomName}.`;
    }
    return `I was in the ${roomName}. I have been ${guest.goalLabel}.`;
  }

  if (questionId === "who_suspicious") {
    if (isMurderer) {
      const scapegoat = randomAliveGuestName([guest.id]);
      return scapegoat
        ? `${scapegoat} has been acting strange.`
        : "Everyone seems suspicious tonight.";
    }
    if (guest.knowsMurderer) {
      return `${killer.name}. I do not trust them at all.`;
    }
    if (recentIntel && recentIntel.suspectName && recentIntel.suspectName !== guest.name) {
      return `From what I just heard, ${recentIntel.suspectName} stands out.`;
    }
    const suspect = mostSuspiciousGuest(guest.id);
    if (suspect) {
      return `Maybe ${suspect.name}. I cannot prove it yet.`;
    }
    return "I cannot point to anyone yet.";
  }

  if (questionId === "what_heard") {
    if (isMurderer) {
      const lines = [
        "Just doors creaking and people pacing.",
        "Footsteps in the corridor, nothing clear.",
        "Voices carrying through the hall, no names.",
      ];
      return lines[randInt(0, lines.length - 1)];
    }
    if (recentIntel && recentIntel.text) {
      return recentIntel.text;
    }
    return guest.memory || "Nothing useful. Only distant footsteps.";
  }

  if (questionId === "who_can_confirm") {
    if (isMurderer) {
      return "No one stayed with me for long.";
    }
    if (recentPartner && recentPartner.alive) {
      return `${recentPartner.name} can confirm we talked in the ${recentRoomName}.`;
    }
    const witness = nearbyPotentialWitness(guest);
    if (witness) {
      return `${witness.name} saw me near the ${roomName}.`;
    }
    return "No one stayed near me long enough to confirm.";
  }

  return "I do not have an answer for that.";
}

function randomAliveGuestName(excludedIds) {
  const ids = new Set(excludedIds);
  const pool = game.guests.filter((g) => g.alive && !ids.has(g.id));
  if (pool.length === 0) return "";
  return pool[randInt(0, pool.length - 1)].name;
}

function mostSuspiciousGuest(excludedId) {
  const options = game.guests.filter((g) => g.alive && g.id !== excludedId);
  if (options.length === 0) return null;
  options.sort((a, b) => b.suspicion - a.suspicion);
  if (options[0].suspicion <= 0) return null;
  return options[0];
}

function nearbyPotentialWitness(guest) {
  const guestRoom = roomAt(guest.x, guest.y);
  return game.guests.find((g) => {
    if (!g.alive || g.id === guest.id) return false;
    const sameRoom = guestRoom && roomAt(g.x, g.y) && roomAt(g.x, g.y).id === guestRoom.id;
    return sameRoom && distance(g, guest) < 3.8;
  }) || null;
}

function updateTime(dt) {
  game.elapsedRealSeconds += dt;
  game.minutes = Math.min(NIGHT_GAME_MINUTES, Math.floor(game.elapsedRealSeconds * GAME_MINUTES_PER_REAL_SECOND));

  if (game.elapsedRealSeconds >= TARGET_REAL_SECONDS && !game.over) {
    game.over = true;
    game.ending = "Sunrise arrives. You failed to identify the murderer in time.";
  }
}

function formatClock(totalMinutes) {
  const absolute = START_HOUR_24 * 60 + totalMinutes;
  const h24 = Math.floor(absolute / 60) % 24;
  const m = absolute % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function hasInterviewedGuest(guest) {
  return Object.keys(guest.askedQuestions).length > 0;
}

function guestActivityLabel(guest) {
  if (!guest.alive) {
    return guest.discoveredDead ? "Confirmed dead" : "Unaccounted for";
  }
  if (game.conversation.active && game.conversation.guestId === guest.id) {
    return "Under questioning";
  }
  if (!canPlayerSee(guest.x, guest.y)) {
    return hasInterviewedGuest(guest) ? "Previously interviewed" : "Not yet interviewed";
  }
  if (guest.activity === "chatting") return "Talking";
  if (guest.activity === "resting") return "Resting";
  return guest.goalLabel || "Roaming";
}

function guestLocationLabel(guest) {
  const room = roomAt(guest.x, guest.y);
  if (canPlayerSee(guest.x, guest.y)) {
    return room ? room.name : "Hallway";
  }
  if (!guest.alive && guest.discoveredDead) {
    return room ? `${room.name} body found` : "Hallway body found";
  }
  return "Location unknown";
}

function getNearestActionableGuest() {
  const guest = nearestGuest(1.8, true);
  if (!guest) return null;
  return canPlayerSee(guest.x, guest.y) ? guest : null;
}

function getCurrentObjective() {
  if (!game.started) return "Begin the case. Time will stay frozen until you move.";
  if (game.over) return "Case closed.";
  if (game.conversation.active) return "Press 1-4 to probe for contradictions, then Esc to end the interview.";
  if (game.corpses.some((corpse) => corpse.discovered)) {
    return "Use discovered bodies, witness chatter, and repeated interviews to narrow the suspect.";
  }
  return "Interview guests, watch traffic between rooms, and accuse the murderer before sunrise.";
}

function updateUI() {
  const aliveGuests = game.guests.filter((g) => g.alive).length;
  const livingInnocents = game.guests.filter((g) => g.alive && g.id !== game.murderer).length;
  const currentRoom = roomAt(game.player.x, game.player.y);
  const roomLabel = currentRoom ? currentRoom.name : "Hallway";
  const roomBrief = ROOM_BRIEFS[roomLabel] || ROOM_BRIEFS.Hallway;
  const inConversation = game.conversation.active;
  const actionableGuest = game.started && !game.over ? getNearestActionableGuest() : null;
  const discoveredBodies = game.corpses.filter((corpse) => corpse.discovered).length;
  const interviewedGuests = game.guests.filter((guest) => hasInterviewedGuest(guest)).length;

  game.hoveredGuestId = inConversation
    ? game.conversation.guestId
    : (actionableGuest ? actionableGuest.id : null);

  uiClock.textContent = `Time: ${formatClock(game.minutes)} | Location: ${roomLabel} | Sunrise at 06:00 AM`;
  if (!game.started) {
    uiStatus.textContent = "Press Enter or Space to begin. The guests will not move until the investigation starts.";
  } else if (game.over) {
    uiStatus.textContent = game.ending;
  } else if (inConversation) {
    const guest = game.guests[game.conversation.guestId];
    const guestName = guest ? guest.name : "Guest";
    uiStatus.textContent = `Interviewing ${guestName} | Time paused | Ask with 1-4 | Esc to end`;
  } else if (actionableGuest) {
    uiStatus.textContent = `${actionableGuest.name} is within reach | Press E to talk | Press C to accuse`;
  } else {
    uiStatus.textContent = `Guests alive: ${aliveGuests}/10 | Innocents remaining: ${livingInnocents} | Press C near a guest to accuse`;
  }
  uiRoomBrief.textContent = !game.started
    ? "The case file is open. Enter or Space starts the clock and releases every guest into the mansion."
    : roomBrief;

  const lines = [];
  for (const entry of game.log) {
    lines.push(`- ${entry}`);
  }

  uiRoster.innerHTML = game.guests
    .map((g) => {
      const status = g.alive ? "Alive" : (g.discoveredDead ? "Dead" : "Missing");
      const interviewed = hasInterviewedGuest(g);
      const visible = canPlayerSee(g.x, g.y);
      const classes = game.hoveredGuestId === g.id ? "roster-entry roster-entry--focus" : "roster-entry";
      const tags = [
        `<span class="roster-tag${!g.alive ? " roster-tag--alert" : ""}">${status}</span>`,
        `<span class="roster-tag">${interviewed ? "Interviewed" : "Uninterviewed"}</span>`,
      ];
      if (visible && g.alive) {
        tags.push(`<span class="roster-tag roster-tag--focus">Visible</span>`);
      }
      if (game.conversation.active && game.conversation.guestId === g.id) {
        tags.push(`<span class="roster-tag roster-tag--focus">Questioning</span>`);
      }
      return `<div class="${classes}">
        <div class="roster-row">
          <span class="roster-name">${escapeHtml(g.name)}</span>
        </div>
        <div class="roster-tags">${tags.join("")}</div>
        <div class="roster-meta">${escapeHtml(guestLocationLabel(g))} | ${escapeHtml(guestActivityLabel(g))}</div>
      </div>`;
    })
    .join("");

  if (!game.started) {
    uiDialogue.textContent = "Review the case file, then press Enter or Space to begin. The timer and guest movement are paused.";
  } else if (!game.over && !inConversation && uiDialogue.textContent.trim() === "") {
    uiDialogue.textContent = lines.join(" ");
  }

  if (!game.started) {
    uiQuestions.textContent = "When the case begins, approach a guest with E and use 1-4 to question them.";
  } else if (inConversation) {
    const guest = game.guests[game.conversation.guestId];
    uiQuestions.innerHTML = QUESTION_SET.map((q, idx) => {
      const askedRevision = guest ? guest.askedQuestions[q.id] : -1;
      const asked = !!guest && Number.isFinite(askedRevision) && askedRevision >= guest.infoRevision;
      const className = asked ? "question-option question-used" : "question-option";
      const prefix = asked ? "[Asked]" : `[${idx + 1}]`;
      return `<div class="${className}">${prefix} ${q.label}</div>`;
    }).join("");
  } else {
    uiQuestions.textContent = actionableGuest
      ? `${actionableGuest.name} is close enough to interview. Press E to question them.`
      : "Talk to a guest to open questioning.";
  }

  const leadText = !game.started
    ? "Ten guests are waiting in place. Start the case, then track who speaks with whom before the first body drops."
    : actionableGuest
      ? `${actionableGuest.name} is nearby in the ${guestLocationLabel(actionableGuest)}.`
      : discoveredBodies > 0
        ? `${discoveredBodies} body${discoveredBodies === 1 ? "" : "ies"} discovered. Revisit witnesses after each new rumor.`
        : "No one is close enough to question right now. Move room to room and look for a conversation cluster.";
  const latestEvent = lines[0] || "- The mansion is quiet for now.";
  uiCaseNotes.innerHTML = `
    <div class="notes-list">
      <div class="note-block">
        <span class="note-label">Objective</span>
        <div class="note-text note-text--accent">${escapeHtml(getCurrentObjective())}</div>
      </div>
      <div class="note-block">
        <span class="note-label">Lead</span>
        <div class="note-text">${escapeHtml(leadText)}</div>
      </div>
      <div class="note-block">
        <span class="note-label">Progress</span>
        <div class="note-text note-text--ok">Interviews: ${interviewedGuests}/10 | Bodies found: ${discoveredBodies}</div>
      </div>
      <div class="note-block">
        <span class="note-label">Latest Event</span>
        <div class="note-text">${escapeHtml(latestEvent)}</div>
      </div>
    </div>
  `;
}

function colorWithAlpha(hex, alpha) {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(255,255,255,${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

function drawWorld() {
  drawSceneBackdrop();
  const playerRoom = roomAt(game.player.x, game.player.y);
  drawRoomLighting(playerRoom);
  drawMansionLayout();
  drawNavigationHints(playerRoom);
  drawFurnishings(playerRoom);
  drawAtmosphericParticles(playerRoom);

  // Shade rooms the player is not currently in, while preserving the mansion layout.
  for (const room of game.rooms) {
    if (playerRoom && room.id === playerRoom.id) continue;
    ctx.fillStyle = "rgba(5, 7, 13, 0.52)";
    ctx.fillRect(room.x * TILE, room.y * TILE, room.w * TILE, room.h * TILE);
    ctx.fillStyle = "rgba(136, 167, 226, 0.07)";
    ctx.fillRect(room.x * TILE, room.y * TILE, room.w * TILE, px(1));
  }

  for (const corpse of game.corpses) {
    if (!canPlayerSee(corpse.x, corpse.y)) continue;
    drawCorpseMarker(corpse.x, corpse.y);
    drawSoftLight(corpse.x, corpse.y, TILE * 3, "#bb3048", 0.2);
  }

  for (const g of game.guests) {
    if (!g.alive) continue;
    if (!canPlayerSee(g.x, g.y)) continue;
    drawPerson(g.x, g.y, g.model, { moving: g.moving, seed: g.animSeed, isPlayer: false, facing: g.facing });
    if (game.started && distance(game.player, g) < 1.8) {
      drawName(g.name, g.x, g.y - 1);
    }
  }

  drawPerson(game.player.x, game.player.y, game.player.model, { moving: game.player.moving, seed: game.player.animSeed, isPlayer: true, facing: game.player.facing });
  drawSoftLight(game.player.x, game.player.y, TILE * 4.4, "#f3d6a9", 0.42);
  drawActiveBubble();
  drawPostProcessOverlay();
  drawCanvasHud(playerRoom);

  if (!game.started) {
    drawIntroOverlay();
  }

  if (game.over) {
    const panelX = 16;
    const panelY = 56;
    const panelW = W - 32;
    const panelH = 66;
    const overGradient = ctx.createLinearGradient(0, panelY, 0, panelY + panelH);
    overGradient.addColorStop(0, "rgba(10, 14, 25, 0.92)");
    overGradient.addColorStop(1, "rgba(20, 13, 16, 0.94)");
    ctx.fillStyle = overGradient;
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "#e7c57a";
    ctx.strokeRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "rgba(248, 226, 173, 0.5)";
    ctx.strokeRect(panelX + 2, panelY + 2, panelW - 4, panelH - 4);

    const endingLines = wrapBubbleTextPixels(
      sanitizePixelText(game.ending.toUpperCase()),
      1,
      panelW - 20,
      4,
    );
    ctx.fillStyle = "#f8f2df";
    for (let i = 0; i < endingLines.length; i++) {
      drawPixelText(endingLines[i], panelX + 10, panelY + 11 + i * 9, 1);
    }
    ctx.fillStyle = "#f0d08e";
    drawPixelText("PRESS R TO RESTART", panelX + 10, panelY + panelH - 14, 1);
  }
}

function drawSceneBackdrop() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#101935");
  gradient.addColorStop(0.52, "#101221");
  gradient.addColorStop(1, "#06070d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  const moonGlow = ctx.createRadialGradient(W * 0.76, H * 0.08, 0, W * 0.76, H * 0.08, W * 0.36);
  moonGlow.addColorStop(0, "rgba(190, 218, 255, 0.32)");
  moonGlow.addColorStop(0.45, "rgba(126, 166, 220, 0.1)");
  moonGlow.addColorStop(1, "rgba(176, 206, 255, 0)");
  ctx.fillStyle = moonGlow;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(231, 242, 255, 0.9)";
  for (let i = 0; i < 36; i++) {
    const sx = (i * 73) % W;
    const sy = (i * 37) % Math.floor(H * 0.34);
    const size = (i % 5 === 0) ? 2 : 1;
    ctx.fillRect(sx, sy, size, size);
  }

  ctx.fillStyle = "rgba(9, 11, 18, 0.88)";
  const silhouetteY = Math.floor(H * 0.17);
  ctx.fillRect(0, silhouetteY, W, H - silhouetteY);
  ctx.fillStyle = "rgba(20, 27, 41, 0.9)";
  ctx.fillRect(px(3), silhouetteY + px(6), W - px(6), H - silhouetteY - px(6));

  const facadeY = px(2);
  ctx.fillStyle = "rgba(6, 8, 14, 0.96)";
  ctx.fillRect(px(5), silhouetteY - facadeY, W - px(10), px(6));
  ctx.fillRect(px(9), silhouetteY - px(8), W - px(18), px(4));
  for (let i = 0; i < 7; i++) {
    const towerX = px(6) + i * px(8);
    const towerH = i % 2 === 0 ? px(6) : px(4);
    ctx.fillRect(towerX, silhouetteY - towerH - px(4), px(4), towerH);
  }
}

function drawMansionLayout() {
  ctx.fillStyle = "#04060d";
  ctx.fillRect(0, 0, W, H);

  for (let y = 0; y < WORLD_H; y++) {
    for (let x = 0; x < WORLD_W; x++) {
      if (!game.walls[y] || game.walls[y][x] !== 1) continue;
      const tileRoom = roomAt(x + 0.5, y + 0.5);
      if (tileRoom) continue;
      drawHallwayTile(x, y);
    }
  }

  for (const room of game.rooms) {
    const roomX = room.x * TILE;
    const roomY = room.y * TILE;
    const roomW = room.w * TILE;
    const roomH = room.h * TILE;
    ctx.fillStyle = "rgba(0,0,0,0.36)";
    ctx.fillRect(roomX + px(1), roomY + px(1), roomW, roomH);
    const backdrop = game.roomBackdrops ? game.roomBackdrops[room.id] : null;
    if (backdrop) {
      ctx.drawImage(backdrop, roomX, roomY);
    }
  }

  drawRoomThresholds();
}

function drawHallwayTile(tileX, tileY) {
  const px0 = tileX * TILE;
  const py0 = tileY * TILE;
  const step = Math.max(2, Math.floor(TILE / 4));
  pixelArt.checker(ctx, px0, py0, TILE, TILE, step, ["#26344a", "#1a2437"], tileX + tileY);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(px0 + step, py0 + step, TILE - step * 2, step);
  ctx.fillStyle = "rgba(113, 151, 214, 0.18)";
  ctx.fillRect(px0, py0 + TILE - step, TILE, step);
  if ((tileNoise(tileX, tileY, 19) & 3) === 0) {
    ctx.fillStyle = "rgba(247, 224, 171, 0.1)";
    ctx.fillRect(px0 + TILE / 2 - 1, py0 + TILE / 2 - 1, 2, 2);
  }
}

function drawRoomThresholds() {
  const accent = "rgba(244, 221, 164, 0.2)";
  for (const room of game.rooms) {
    const thresholds = [
      { x: room.cx, y: room.y },
      { x: room.cx, y: room.y + room.h - 1 },
      { x: room.x, y: room.cy },
      { x: room.x + room.w - 1, y: room.cy },
    ];
    for (const threshold of thresholds) {
      if (!game.walls[threshold.y] || game.walls[threshold.y][threshold.x] !== 1) continue;
      ctx.fillStyle = accent;
      ctx.fillRect(threshold.x * TILE, threshold.y * TILE, TILE, TILE);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(threshold.x * TILE, threshold.y * TILE, TILE, pxUnit());
    }
  }
}

function drawRoomLighting(playerRoom) {
  for (const room of game.rooms) {
    const atmos = ROOM_ATMOSPHERE[room.type] || ROOM_ATMOSPHERE.study;
    const activeRoom = playerRoom && playerRoom.id === room.id;
    const radius = Math.max(room.w, room.h) * TILE * (activeRoom ? 0.92 : 0.74);
    const intensity = activeRoom ? 0.24 : 0.12;
    drawSoftLight(room.cx + 0.5, room.cy + 0.5, radius, atmos.glow, intensity);
  }
}

function drawSoftLight(worldX, worldY, radius, colorHex, alpha) {
  const cx = worldX * TILE;
  const cy = worldY * TILE;
  const rgb = hexToRgb(colorHex);
  if (!rgb) return;
  const gradient = ctx.createRadialGradient(cx, cy, TILE * 0.1, cx, cy, radius);
  gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`);
  gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = gradient;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();
}

function drawAtmosphericParticles(playerRoom) {
  for (const p of game.atmosphericParticles) {
    if (playerRoom && p.roomId !== -1 && p.roomId !== playerRoom.id) continue;
    if (!canPlayerSee(p.x, p.y)) continue;
    const px0 = Math.floor(p.x * TILE);
    const py0 = Math.floor(p.y * TILE);
    const pulse = 0.62 + Math.sin(game.elapsedRealSeconds * 1.8 + p.phase) * 0.38;
    ctx.fillStyle = `rgba(238, 246, 255, ${p.alpha * pulse})`;
    const size = Math.max(1, Math.round(p.size));
    ctx.fillRect(px0, py0, size, size);
  }
}

function drawPostProcessOverlay() {
  const vignette = ctx.createRadialGradient(
    W / 2,
    H / 2,
    Math.min(W, H) * 0.22,
    W / 2,
    H / 2,
    Math.max(W, H) * 0.68,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.58)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  const offset = Math.floor((game.elapsedRealSeconds * 18) % 4);
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  for (let y = offset; y < H; y += 4) {
    ctx.fillRect(0, y, W, 1);
  }
}

function drawHudPlate(x, y, w, h, fill = "rgba(7, 10, 20, 0.78)", stroke = "rgba(244, 223, 176, 0.4)") {
  pixelArt.panel(ctx, x, y, w, h, {
    fill,
    light: "rgba(255,255,255,0.08)",
    dark: "rgba(0,0,0,0.34)",
    outline: stroke,
  });
  ctx.strokeStyle = "rgba(207, 223, 255, 0.12)";
  ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
}

function drawCanvasHud(playerRoom) {
  const roomName = sanitizePixelText((playerRoom ? playerRoom.name : "Hallway").toUpperCase());
  const actionableGuest = game.started && !game.over ? getNearestActionableGuest() : null;
  const roomPlateWidth = Math.min(W - 16, pixelTextWidth(roomName, 1) + 18);
  drawHudPlate(8, 8, roomPlateWidth, 16, "rgba(7, 10, 20, 0.72)", "rgba(214, 188, 131, 0.38)");
  ctx.fillStyle = "#f4dfb0";
  drawPixelText(roomName, 16, 13, 1);

  let footerText = "";
  if (!game.started) {
    footerText = "ENTER OR SPACE TO BEGIN";
  } else if (game.over) {
    footerText = "PRESS R TO RESTART THE CASE";
  } else if (game.conversation.active) {
    footerText = "PRESS 1-4 TO ASK QUESTIONS. ESC ENDS THE INTERVIEW.";
  } else if (actionableGuest) {
    footerText = `E TO TALK TO ${actionableGuest.name.toUpperCase()}. C TO ACCUSE.`;
  } else {
    footerText = getCurrentObjective().toUpperCase();
  }

  const footerLines = wrapBubbleTextPixels(
    sanitizePixelText(footerText),
    1,
    W - 28,
    2,
  );
  const footerHeight = 12 + footerLines.length * 8;
  const footerY = H - footerHeight - 8;
  drawHudPlate(8, footerY, W - 16, footerHeight, "rgba(7, 10, 20, 0.78)", "rgba(207, 223, 255, 0.24)");
  ctx.fillStyle = game.started ? "#dfe7f7" : "#f4dfb0";
  for (let i = 0; i < footerLines.length; i++) {
    drawPixelText(footerLines[i], 14, footerY + 8 + i * 8, 1);
  }
}

function drawIntroOverlay() {
  ctx.fillStyle = "rgba(4, 6, 11, 0.74)";
  ctx.fillRect(0, 0, W, H);

  const panelW = Math.min(W - 36, 350);
  const panelH = 124;
  const panelX = Math.floor((W - panelW) / 2);
  const panelY = Math.floor((H - panelH) / 2) - 4;
  drawHudPlate(panelX, panelY, panelW, panelH, "rgba(10, 13, 23, 0.94)", "rgba(244, 223, 176, 0.52)");
  ctx.fillStyle = "rgba(244, 223, 176, 0.14)";
  ctx.fillRect(panelX + 8, panelY + 8, panelW - 16, 12);

  ctx.fillStyle = "#f4dfb0";
  drawPixelText("CASE FILE OPEN", panelX + 18, panelY + 18, 2);

  const introLines = [
    "THE MURDERER IS INSIDE THE MANSION.",
    "WATCH THE DOORWAYS. TRACK EACH PAIRING.",
    "RUMORS SHIFT WHEN NEW INTEL SPREADS.",
    "ENTER OR SPACE RELEASES THE GUESTS.",
  ];
  ctx.fillStyle = "#e7eefb";
  for (let i = 0; i < introLines.length; i++) {
    drawPixelText(sanitizePixelText(introLines[i]), panelX + 18, panelY + 48 + i * 11, 1);
  }
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(panelX + 18, panelY + panelH - 26, panelW - 36, 1);
  ctx.fillStyle = "#d6c39a";
  drawPixelText("PRESS E TO INTERROGATE. PRESS C TO ACCUSE.", panelX + 18, panelY + panelH - 18, 1);
}

function drawActiveBubble() {
  if (!game.activeBubble) return;
  const bubble = game.activeBubble;
  if (bubble.ttl <= 0) return;

  const speaker = game.guests.find((g) => g.id === bubble.speakerId);
  if (!speaker || !speaker.alive) return;
  if (!canPlayerSee(speaker.x, speaker.y)) return;

  const textScale = 2;
  const padX = px(3);
  const padY = px(2);
  const lineGap = px(1);
  const maxTextWidth = Math.floor(W * 0.62);
  const lines = wrapBubbleTextPixels(bubble.text.toUpperCase(), textScale, maxTextWidth, 6);
  const textWidth = Math.max(20, ...lines.map((line) => pixelTextWidth(line, textScale)));
  const lineHeight = 7 * textScale + lineGap;
  const textHeight = lines.length * lineHeight - lineGap;
  const bw = textWidth + padX * 2;
  const bh = textHeight + padY * 2;

  let bx = Math.floor(speaker.x * TILE - bw / 2);
  let by = Math.floor(speaker.y * TILE - bh - px(10));
  let bubbleBelow = false;
  if (by < 2) {
    by = Math.floor(speaker.y * TILE + px(7));
    bubbleBelow = true;
  }
  bx = Math.max(2, Math.min(W - bw - 2, bx));
  by = Math.max(2, Math.min(H - bh - 2, by));

  drawComicBubbleShape(
    bx,
    by,
    bw,
    bh,
    Math.floor(speaker.x * TILE),
    Math.floor(speaker.y * TILE),
    bubbleBelow,
  );

  ctx.fillStyle = "#111";
  for (let i = 0; i < lines.length; i++) {
    const ly = by + padY + i * lineHeight;
    drawPixelText(lines[i], bx + padX, ly, textScale);
  }
}

function drawComicBubbleShape(x, y, w, h, anchorX, anchorY, bubbleBelow) {
  const border = 2;
  ctx.fillStyle = "#111";
  ctx.fillRect(x - border, y - border, w + border * 2, h + border * 2);
  ctx.fillStyle = "#f8f7f2";
  ctx.fillRect(x, y, w, h);

  // Comic notches.
  ctx.fillStyle = "#111";
  ctx.fillRect(x + px(2), y - border, px(2), border);
  ctx.fillRect(x + w - px(4), y + h, px(2), border);

  const clampedAnchorX = Math.max(x + px(4), Math.min(x + w - px(4), anchorX));
  const tailMid = bubbleBelow ? y - border : y + h + border - 1;
  const dir = bubbleBelow ? -1 : 1;

  for (let i = 0; i < px(4); i++) {
    const width = Math.max(1, px(3) - i);
    const yy = tailMid + i * dir;
    ctx.fillRect(clampedAnchorX - Math.floor(width / 2), yy, width, 1);
  }

  const tipY = bubbleBelow ? anchorY - px(3) : anchorY + px(4);
  ctx.fillRect(clampedAnchorX - 1, tipY, 2, 2);
}

function updateActiveBubble(dt) {
  if (!game.activeBubble) return;
  game.activeBubble.ttl -= dt;
  if (game.activeBubble.ttl <= 0) {
    game.activeBubble = null;
  }
}

function wrapBubbleTextPixels(text, scale, maxWidthPx, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const wordRaw of words) {
    let word = sanitizePixelText(wordRaw);
    if (!word) word = "?";

    // Hard-wrap oversized words.
    while (pixelTextWidth(word, scale) > maxWidthPx) {
      const piece = splitWordForPixelWidth(word, scale, maxWidthPx);
      if (!piece) break;
      if (current) {
        lines.push(current);
        current = "";
      }
      lines.push(piece);
      word = word.slice(piece.length);
      if (lines.length >= maxLines) {
        return withEllipsis(lines, maxLines, scale, maxWidthPx);
      }
    }

    const candidate = current ? `${current} ${word}` : word;
    if (pixelTextWidth(candidate, scale) <= maxWidthPx) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines) {
        return withEllipsis(lines, maxLines, scale, maxWidthPx);
      }
    }
  }

  if (current) lines.push(current);
  if (lines.length === 0) return ["..."];
  if (lines.length > maxLines) return withEllipsis(lines, maxLines, scale, maxWidthPx);
  return lines;
}

function roundedRectPath(x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, Math.floor(Math.min(w, h) / 2)));
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawFurnishings(playerRoom) {
  if (!playerRoom) return;
  for (const item of game.furnishings) {
    if (item.roomId !== playerRoom.id) continue;
    if (!item.wallMounted) {
      const offset = px(1);
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(item.x * TILE + offset, item.y * TILE + offset, item.w * TILE, item.h * TILE);
    }
    drawFurniture(item);
  }
}

function drawNavigationHints(playerRoom) {
  const midX = Math.floor(WORLD_W / 2);
  const midY = Math.floor(WORLD_H / 2);
  const u = pxUnit();

  for (let y = 0; y < WORLD_H; y++) {
    for (let x = 0; x < WORLD_W; x++) {
      if (!isWalkableTile(x, y)) continue;
      const tileRoom = roomAt(x + 0.5, y + 0.5);
      if (tileRoom && (!playerRoom || tileRoom.id !== playerRoom.id)) continue;

      const px0 = x * TILE;
      const py0 = y * TILE;
      const onMainCorridor = x === midX || x === midX + 1 || y === midY || y === midY + 1;

      if (onMainCorridor) {
        ctx.fillStyle = "rgba(160,205,255,0.20)";
        ctx.fillRect(px0 + u, py0 + TILE - 2 * u, TILE - 2 * u, u);
        ctx.fillStyle = "rgba(210,230,255,0.12)";
        ctx.fillRect(px0 + u, py0 + u, u, TILE - 2 * u);
        continue;
      }

      if (isNearBlockedTile(x, y) || (tileNoise(x, y, 17) & 7) === 1) {
        ctx.fillStyle = "rgba(243,220,171,0.18)";
        ctx.fillRect(px0 + TILE / 2 - u / 2, py0 + TILE / 2 - u / 2, u, u);
      }
    }
  }
}

function drawFurniture(item) {
  const px = item.x * TILE;
  const py = item.y * TILE;
  const pw = item.w * TILE;
  const ph = item.h * TILE;
  const u = pxUnit();
  const innerW = Math.max(u, pw - 2 * u);
  const innerH = Math.max(u, ph - 2 * u);
  const bookColors = ["#bd8b63", "#d2ad7b", "#8db0c7", "#a38cc4", "#c76d6d", "#7cb082"];

  const drawCasedBlock = (fill, border = "#161616", sheen = "rgba(255,255,255,0.12)") => {
    ctx.fillStyle = fill;
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = border;
    ctx.fillRect(px, py, pw, u);
    ctx.fillRect(px, py, u, ph);
    ctx.fillRect(px + pw - u, py, u, ph);
    ctx.fillRect(px, py + ph - u, pw, u);
    ctx.fillStyle = sheen;
    ctx.fillRect(px + u, py + u, innerW, u);
  };

  if (!item.wallMounted && (tileNoise(item.x, item.y, item.roomId + 101) & 3) === 0) {
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(px + u, py + u, innerW, u);
  }

  if (item.kind === "rug") {
    ctx.fillStyle = item.color;
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = "#ccb39a";
    ctx.fillRect(px + 2 * u, py + 2 * u, Math.max(2 * u, pw - 4 * u), Math.max(2 * u, ph - 4 * u));
    ctx.fillStyle = "#674f70";
    for (let y = py + 3 * u; y < py + ph - 3 * u; y += 4 * u) {
      ctx.fillRect(px + 3 * u, y, Math.max(u, pw - 6 * u), u);
    }
    ctx.fillStyle = "rgba(255,255,255,0.09)";
    ctx.fillRect(px + u, py + u, innerW, u);
    return;
  }

  if (item.kind === "paintings" || item.kind === "portrait") {
    ctx.fillStyle = item.kind === "paintings" ? "#2b2330" : "#2f2830";
    ctx.fillRect(px, py, pw, ph);
    if (item.kind === "paintings") {
      const frameStride = 6 * u;
      for (let fx = px + u; fx + 3 * u < px + pw - u; fx += frameStride) {
        const frameW = Math.min(5 * u, px + pw - u - fx);
        const frameH = Math.max(3 * u, ph - 2 * u);
        ctx.fillStyle = "#c9ae80";
        ctx.fillRect(fx, py + u, frameW, frameH);
        ctx.fillStyle = ((fx / u) & 1) === 0 ? "#7f5b7b" : "#567b95";
        ctx.fillRect(fx + u, py + 2 * u, Math.max(u, frameW - 2 * u), Math.max(u, frameH - 3 * u));
        ctx.fillStyle = "#dabf96";
        ctx.fillRect(fx + u, py + u, Math.max(u, frameW - 2 * u), u);
      }
    } else {
      ctx.fillStyle = "#ccb181";
      ctx.fillRect(px + u, py + u, Math.max(u, pw - 2 * u), Math.max(u, ph - 2 * u));
      ctx.fillStyle = "#495472";
      ctx.fillRect(px + 2 * u, py + 2 * u, Math.max(u, pw - 4 * u), Math.max(u, ph - 4 * u));
      ctx.fillStyle = "#d8c58f";
      ctx.fillRect(px + pw / 2 - u, py + ph / 2 - 2 * u, 2 * u, 3 * u);
    }
    return;
  }

  if (item.kind === "bookshelf" || item.kind === "pantry" || item.kind === "wine_rack") {
    drawCasedBlock(item.color, "#21170f", "rgba(255,255,255,0.08)");
    for (let y = py + 2 * u; y < py + ph - u; y += 3 * u) {
      ctx.fillStyle = "#8b6a4b";
      ctx.fillRect(px + u, y, Math.max(u, pw - 2 * u), u);
      for (let x = px + u; x < px + pw - u; x += 2 * u) {
        const n = tileNoise(Math.floor(x / u), Math.floor(y / u), item.roomId + item.kind.length);
        ctx.fillStyle = bookColors[n % bookColors.length];
        if (item.kind === "wine_rack") {
          ctx.fillStyle = n & 1 ? "#4f6d52" : "#6f4851";
          ctx.fillRect(x, y + u, u, u);
        } else {
          ctx.fillRect(x, y + u, u, Math.max(u, 2 * u));
        }
      }
    }
    return;
  }

  if (item.kind === "stove") {
    drawCasedBlock(item.color, "#222931", "rgba(255,255,255,0.08)");
    ctx.fillStyle = "#2f3338";
    ctx.fillRect(px + u, py + u, innerW, innerH);
    ctx.fillStyle = "#8f97a2";
    ctx.fillRect(px + 2 * u, py + 2 * u, Math.max(u, pw - 4 * u), u);
    ctx.fillStyle = "#c84f4f";
    ctx.fillRect(px + 2 * u, py + 2 * u, 2 * u, 2 * u);
    ctx.fillRect(px + pw - 4 * u, py + 2 * u, 2 * u, 2 * u);
    ctx.fillStyle = "#262b30";
    ctx.fillRect(px + 2 * u, py + ph - 3 * u, Math.max(u, pw - 4 * u), 2 * u);
    return;
  }

  if (item.kind === "sink") {
    drawCasedBlock(item.color, "#273042", "rgba(255,255,255,0.1)");
    ctx.fillStyle = "#9cb8c7";
    ctx.fillRect(px + u, py + 2 * u, Math.max(u, pw - 2 * u), Math.max(u, ph - 3 * u));
    ctx.fillStyle = "#6e7c8d";
    ctx.fillRect(px + 2 * u, py + 2 * u, Math.max(u, pw - 4 * u), Math.max(u, ph - 4 * u));
    ctx.fillStyle = "#cfd8dd";
    ctx.fillRect(px + pw / 2 - u, py + u, 2 * u, u);
    ctx.fillRect(px + pw / 2, py, u, 2 * u);
    return;
  }

  if (item.kind === "bed") {
    drawCasedBlock(item.color, "#2d2d3c", "rgba(255,255,255,0.12)");
    ctx.fillStyle = "#e8e8f2";
    ctx.fillRect(px + u, py + 2 * u, innerW, Math.max(u, ph - 4 * u));
    ctx.fillStyle = "#f7f6fb";
    ctx.fillRect(px + u, py + u, Math.max(u, pw / 2 - u), u);
    ctx.fillRect(px + pw / 2, py + u, Math.max(u, pw / 2 - u), u);
    ctx.fillStyle = "#a097bd";
    ctx.fillRect(px + u, py + ph - 2 * u, innerW, u);
    return;
  }

  if (item.kind === "plants" || item.kind === "planter_box") {
    drawCasedBlock(item.color, "#213728", "rgba(255,255,255,0.08)");
    ctx.fillStyle = item.kind === "planter_box" ? "#4f3c29" : "#30553c";
    ctx.fillRect(px + u, py + ph - 2 * u, innerW, u);
    for (let x = px + u; x < px + pw - u; x += 2 * u) {
      const n = tileNoise(Math.floor(x / u), item.y, item.roomId);
      ctx.fillStyle = n & 1 ? "#5aa873" : "#4f8b5e";
      ctx.fillRect(x, py + u, u, Math.max(u, ph - 3 * u));
    }
    return;
  }

  if (item.kind === "fountain") {
    drawCasedBlock("#6b8493", "#41515a", "rgba(255,255,255,0.16)");
    ctx.fillStyle = "#89c1d2";
    ctx.fillRect(px + 2 * u, py + 2 * u, Math.max(u, pw - 4 * u), Math.max(u, ph - 4 * u));
    ctx.fillStyle = "#b2dbe4";
    ctx.fillRect(px + pw / 2 - u, py + ph / 2 - u, 2 * u, 2 * u);
    ctx.fillStyle = "#d0edf3";
    ctx.fillRect(px + pw / 2, py + u, u, Math.max(u, ph - 3 * u));
    return;
  }

  if (item.kind === "fireplace") {
    drawCasedBlock(item.color, "#2f2520", "rgba(255,255,255,0.1)");
    ctx.fillStyle = "#211715";
    ctx.fillRect(px + u, py + 2 * u, innerW, Math.max(u, ph - 3 * u));
    ctx.fillStyle = "#8e412e";
    ctx.fillRect(px + 2 * u, py + ph - 3 * u, Math.max(u, pw - 4 * u), u);
    ctx.fillStyle = "#d98a3a";
    ctx.fillRect(px + pw / 2 - u, py + ph - 4 * u, 2 * u, 2 * u);
    return;
  }

  if (item.kind === "piano") {
    drawCasedBlock("#1e1f25", "#0f1014", "rgba(255,255,255,0.14)");
    ctx.fillStyle = "#14151b";
    ctx.fillRect(px + u, py + u, innerW, innerH);
    ctx.fillStyle = "#ececec";
    for (let x = px + 2 * u; x < px + pw - 2 * u; x += 2 * u) {
      ctx.fillRect(x, py + ph - 3 * u, u, 2 * u);
    }
    ctx.fillStyle = "#20222b";
    for (let x = px + 3 * u; x < px + pw - 3 * u; x += 4 * u) {
      ctx.fillRect(x, py + ph - 3 * u, u, u);
    }
    return;
  }

  if (item.kind === "stage") {
    drawCasedBlock(item.color, "#3e3146", "rgba(255,255,255,0.14)");
    ctx.fillStyle = "#8a7097";
    for (let x = px + u; x < px + pw - u; x += 2 * u) {
      ctx.fillRect(x, py + ph - 2 * u, u, u);
    }
    return;
  }

  if (item.kind === "chandelier" || item.kind === "lamp" || item.kind === "hanging_lamp") {
    drawCasedBlock("#4a3c2f", "#2b241d", "rgba(255,255,255,0.08)");
    ctx.fillStyle = "#d9bf86";
    ctx.fillRect(px + pw / 2 - u, py + u, 2 * u, Math.max(u, ph - 3 * u));
    ctx.fillRect(px + u, py + ph - 2 * u, Math.max(u, pw - 2 * u), u);
    ctx.fillStyle = "#f2dea5";
    ctx.fillRect(px + 2 * u, py + ph - 3 * u, Math.max(u, pw - 4 * u), u);
    if (item.kind === "chandelier") {
      ctx.fillStyle = "#f7e2a8";
      ctx.fillRect(px + 2 * u, py + 2 * u, Math.max(u, pw - 4 * u), u);
    }
    return;
  }

  if (item.kind === "table" || item.kind === "reading_table" || item.kind === "desk" || item.kind === "counter" || item.kind === "sideboard" || item.kind === "island" || item.kind === "workbench") {
    drawCasedBlock(item.color, "#2b1f18", "rgba(255,255,255,0.1)");
    ctx.fillStyle = "#b18862";
    ctx.fillRect(px + u, py + u, innerW, Math.max(u, ph - 2 * u));
    ctx.fillStyle = "#6f4f35";
    ctx.fillRect(px + 2 * u, py + ph - 2 * u, u, u);
    ctx.fillRect(px + pw - 3 * u, py + ph - 2 * u, u, u);
    if (item.kind === "desk") {
      ctx.fillStyle = "#5a3f2c";
      ctx.fillRect(px + pw - 3 * u, py + 2 * u, 2 * u, Math.max(u, ph - 4 * u));
    }
    return;
  }

  if (item.kind === "chair" || item.kind === "bench") {
    drawCasedBlock(item.color, "#2f2117", "rgba(255,255,255,0.1)");
    ctx.fillStyle = "#c79b70";
    ctx.fillRect(px + u, py + ph - 2 * u, innerW, u);
    if (item.kind === "chair") {
      ctx.fillRect(px + u, py + u, innerW, u);
    } else {
      ctx.fillRect(px + u, py + 2 * u, innerW, u);
    }
    return;
  }

  if (item.kind === "wardrobe") {
    drawCasedBlock(item.color, "#3b2f2b", "rgba(255,255,255,0.08)");
    ctx.fillStyle = "#5f544f";
    ctx.fillRect(px + u, py + 2 * u, Math.max(u, pw / 2 - u), Math.max(u, ph - 3 * u));
    ctx.fillRect(px + pw / 2, py + 2 * u, Math.max(u, pw / 2 - u), Math.max(u, ph - 3 * u));
    ctx.fillStyle = "#c5a77e";
    ctx.fillRect(px + pw / 2 - u, py + ph / 2, u, u);
    ctx.fillRect(px + pw / 2 + u, py + ph / 2, u, u);
    return;
  }

  if (item.kind === "vanity" || item.kind === "nightstand") {
    drawCasedBlock(item.color, "#3b2b22", "rgba(255,255,255,0.09)");
    ctx.fillStyle = "#d6c3aa";
    ctx.fillRect(px + u, py + u, innerW, u);
    if (item.kind === "vanity") {
      ctx.fillStyle = "#86a3b8";
      ctx.fillRect(px + pw / 2 - 2 * u, py - u, 4 * u, 2 * u);
    }
    return;
  }

  if (item.kind === "candelabra") {
    ctx.fillStyle = "#7b6446";
    ctx.fillRect(px, py + ph - u, pw, u);
    ctx.fillStyle = "#d8b97d";
    ctx.fillRect(px + pw / 2 - u, py + u, 2 * u, Math.max(u, ph - 2 * u));
    ctx.fillRect(px + u, py + u, u, u);
    ctx.fillRect(px + pw - 2 * u, py + u, u, u);
    ctx.fillStyle = "#f4e2a2";
    ctx.fillRect(px + u, py, u, u);
    ctx.fillRect(px + pw - 2 * u, py, u, u);
    ctx.fillRect(px + pw / 2 - u / 2, py, u, u);
    return;
  }

  if (item.kind === "pedestal" || item.kind === "statue") {
    drawCasedBlock("#8a9196", "#4f555c", "rgba(255,255,255,0.1)");
    ctx.fillStyle = "#b6bec4";
    ctx.fillRect(px + 2 * u, py + u, Math.max(u, pw - 4 * u), Math.max(u, ph - 3 * u));
    ctx.fillStyle = "#d2d9df";
    ctx.fillRect(px + pw / 2 - u, py + 2 * u, 2 * u, 2 * u);
    return;
  }

  if (item.kind === "globe") {
    drawCasedBlock("#5d4d3f", "#30241c", "rgba(255,255,255,0.1)");
    ctx.fillStyle = "#6f86a4";
    ctx.fillRect(px + 2 * u, py + u, Math.max(u, pw - 4 * u), Math.max(u, ph - 3 * u));
    ctx.fillStyle = "#4a5e7d";
    ctx.fillRect(px + pw / 2 - u / 2, py + u, u, Math.max(u, ph - 2 * u));
    return;
  }

  if (item.kind === "trellis") {
    ctx.fillStyle = "#597a68";
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = "#7ea388";
    for (let x = px + u; x < px + pw - u; x += 2 * u) {
      ctx.fillRect(x, py + u, u, Math.max(u, ph - 2 * u));
    }
    for (let y = py + u; y < py + ph - u; y += 2 * u) {
      ctx.fillRect(px + u, y, Math.max(u, pw - 2 * u), u);
    }
    return;
  }

  if (item.kind === "crate") {
    drawCasedBlock(item.color, "#3a2d1f", "rgba(255,255,255,0.08)");
    ctx.fillStyle = "#8a7557";
    ctx.fillRect(px + u, py + u, innerW, u);
    ctx.fillRect(px + u, py + ph - 2 * u, innerW, u);
    return;
  }

  if (item.kind === "barrel") {
    drawCasedBlock(item.color, "#33271d", "rgba(255,255,255,0.08)");
    ctx.fillStyle = "#7f6547";
    ctx.fillRect(px + u, py + 2 * u, innerW, Math.max(u, ph - 4 * u));
    ctx.fillStyle = "#2f2822";
    ctx.fillRect(px + u, py + u, innerW, u);
    ctx.fillRect(px + u, py + ph - 2 * u, innerW, u);
    return;
  }

  drawCasedBlock(item.color);
  if (item.kind === "plants") {
    ctx.fillStyle = "#2d593f";
    ctx.fillRect(px + u, py + u, innerW, Math.max(u, ph - u));
    ctx.fillStyle = "#5ba06d";
    ctx.fillRect(px + 2 * u, py + 2 * u, Math.max(u, pw - 4 * u), u);
  }
}

function drawCorpseMarker(x, y) {
  const px0 = Math.floor((x - 0.5) * TILE);
  const py0 = Math.floor((y - 0.5) * TILE);
  const u = pxUnit();
  pixelArt.shadow(ctx, px0 + 4 * u, py0 + 9 * u, 7 * u, 2 * u, "rgba(0,0,0,0.42)");

  ctx.fillStyle = "#61121b";
  ctx.fillRect(px0 - 1 * u, py0 + 5 * u, 10 * u, 3 * u);
  ctx.fillRect(px0 + 1 * u, py0 + 4 * u, 7 * u, 1 * u);
  ctx.fillStyle = "#8f1f2c";
  ctx.fillRect(px0 + 2 * u, py0 + 5 * u, 3 * u, 1 * u);

  const outline = [
    "..WWW...",
    ".W...W..",
    ".W.W.W..",
    "W..W..W.",
    "WW...WW.",
    "..W.W...",
    "..W.W...",
    "..W.W...",
  ];
  pixelArt.sprite(ctx, outline, { W: "#efe9dd" }, px0, py0, u);
}

function drawPerson(x, y, model, options = {}) {
  const u = pxUnit();
  const moving = !!options.moving;
  const seed = options.seed || 0;
  const isPlayer = !!options.isPlayer;
  const facing = options.facing || "down";
  const baseX = Math.floor((x - 0.5) * TILE);
  const tick = Math.floor(game.elapsedRealSeconds * 8 + seed * 3.5);
  const bob = moving ? ((tick & 1) === 0 ? 0 : 1) : 0;
  const baseY = Math.floor((y - 0.5) * TILE) + bob;
  const rows = getPersonSpriteRows(model, facing, moving, seed);
  const palette = {
    X: "#0a0b0d",
    H: model.hair,
    S: model.skin,
    G: model.glasses ? "#d7edf8" : pixelArt.shade(model.skin, -0.18),
    O: model.outfit,
    A: model.accent,
    C: model.detective ? pixelArt.shade(model.outfit, -0.16) : pixelArt.shade(model.outfit, -0.1),
    T: model.detective ? "#342820" : pixelArt.shade(model.hair, -0.14),
  };

  pixelArt.shadow(
    ctx,
    baseX + 4 * u,
    baseY + 9 * u,
    moving ? 4 * u : 3 * u,
    2 * u,
    moving ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0.3)",
  );

  pixelArt.sprite(
    ctx,
    rows,
    palette,
    baseX,
    baseY,
    u,
    { flipX: facing === "right" },
  );

  ctx.fillStyle = pixelArt.rgba("#ffffff", 0.14);
  ctx.fillRect(baseX + 2 * u, baseY + 4 * u, u, 2 * u);

  if (model.mustache && facing !== "up") {
    ctx.fillStyle = "#3d2a1b";
    ctx.fillRect(baseX + 3 * u, baseY + 3 * u, 2 * u, u);
  }
  if (model.hat && !model.detective) {
    ctx.fillStyle = "#1c1e24";
    ctx.fillRect(baseX + 2 * u, baseY, 4 * u, u);
  }
  if (isPlayer) {
    ctx.fillStyle = "rgba(252, 227, 170, 0.48)";
    ctx.fillRect(baseX + 2 * u, baseY - u, 4 * u, u);
    ctx.fillRect(baseX + 3 * u, baseY - 2 * u, 2 * u, u);
  }
}

function drawName(text, x, y) {
  const label = text.toUpperCase();
  const scale = 1;
  const textWidth = pixelTextWidth(label, scale);
  const paddingX = 2;
  const paddingY = 2;
  const boxW = textWidth + paddingX * 2;
  const boxH = 7 * scale + paddingY * 2;
  const px = Math.floor(x * TILE - boxW / 2);
  const py = Math.floor(y * TILE - boxH - 1);

  ctx.fillStyle = "#111";
  ctx.fillRect(px - 1, py - 1, boxW + 2, boxH + 2);
  ctx.fillStyle = "#fff9bf";
  ctx.fillRect(px, py, boxW, boxH);

  ctx.fillStyle = "#111";
  drawPixelText(label, px + paddingX, py + paddingY, scale);
}

function pixelTextWidth(text, scale = 1) {
  const letterSpacing = Math.max(0, scale - 1);
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const glyph = PIXEL_FONT[text[i]] || PIXEL_FONT["?"];
    const glyphWidth = glyph[0].length * scale;
    width += glyphWidth;
    if (i < text.length - 1) {
      width += letterSpacing;
    }
  }
  return width;
}

function drawPixelText(text, x, y, scale = 1) {
  const letterSpacing = Math.max(0, scale - 1);
  let cursorX = Math.floor(x);
  const baseY = Math.floor(y);

  for (const ch of text) {
    const glyph = PIXEL_FONT[ch] || PIXEL_FONT["?"];
    for (let row = 0; row < glyph.length; row++) {
      const line = glyph[row];
      for (let col = 0; col < line.length; col++) {
        if (line[col] !== "1") continue;
        ctx.fillRect(
          cursorX + col * scale,
          baseY + row * scale,
          scale,
          scale,
        );
      }
    }
    cursorX += glyph[0].length * scale + letterSpacing;
  }
}

function sanitizePixelText(text) {
  return text
    .split("")
    .map((ch) => (PIXEL_FONT[ch] ? ch : "?"))
    .join("");
}

function splitWordForPixelWidth(word, scale, maxWidthPx) {
  let out = "";
  for (const ch of word) {
    const candidate = out + ch;
    if (pixelTextWidth(candidate, scale) > maxWidthPx) break;
    out = candidate;
  }
  return out;
}

function withEllipsis(lines, maxLines, scale, maxWidthPx) {
  const trimmed = lines.slice(0, Math.max(1, maxLines));
  let last = trimmed[trimmed.length - 1];
  while (pixelTextWidth(`${last}...`, scale) > maxWidthPx && last.length > 1) {
    last = last.slice(0, -1);
  }
  trimmed[trimmed.length - 1] = `${last}...`;
  return trimmed;
}

function px(value) {
  return Math.max(1, Math.round((value * TILE) / BASE_TILE));
}

function pxUnit() {
  return px(1);
}

function tileNoise(x, y, seed = 0) {
  let n = x * 374761393 + y * 668265263 + seed * 69069;
  n = (n ^ (n >> 13)) * 1274126177;
  return (n ^ (n >> 16)) & 255;
}

function updateAtmosphericParticles(dt) {
  for (const p of game.atmosphericParticles) {
    p.phase += dt * randRange(0.35, 0.9);
    p.x += p.driftX * dt;
    p.y += p.driftY * dt;
    p.x += Math.sin(game.elapsedRealSeconds * 0.6 + p.phase) * dt * 0.08;
    p.y += Math.cos(game.elapsedRealSeconds * 0.5 + p.phase * 0.7) * dt * 0.06;

    if (p.x < 0) p.x += WORLD_W;
    if (p.y < 0) p.y += WORLD_H;
    if (p.x >= WORLD_W) p.x -= WORLD_W;
    if (p.y >= WORLD_H) p.y -= WORLD_H;

    const tx = Math.floor(p.x);
    const ty = Math.floor(p.y);
    if (!game.walls[ty] || game.walls[ty][tx] !== 1) {
      const room = game.rooms[randInt(0, game.rooms.length - 1)];
      p.x = room.x + 1 + Math.random() * Math.max(1, room.w - 2);
      p.y = room.y + 1 + Math.random() * Math.max(1, room.h - 2);
      p.roomId = room.id;
    }
  }
}

function stepGame(dt) {
  if (!game.started) {
    game.player.moving = false;
    for (const g of game.guests) g.moving = false;
    updateAtmosphericParticles(dt * 0.35);
    return;
  }

  if (!game.over && !game.conversation.active) {
    updatePlayer(dt);
    for (const g of game.guests) updateGuest(g, dt);
    tryMurder(dt);
    updateCorpseDiscovery();
    updateTime(dt);
  } else {
    game.player.moving = false;
    for (const g of game.guests) g.moving = false;
  }
  updateActiveBubble(game.conversation.active ? 0 : dt);
  updateAtmosphericParticles(game.conversation.active ? dt * 0.4 : dt);
}

function frame(now) {
  const dt = Math.min(0.05, (now - previous) / 1000);
  previous = now;

  if (!manualStepMode) {
    stepGame(dt);
  }

  drawWorld();
  updateUI();
  requestAnimationFrame(frame);
}

function roomAt(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  for (const room of game.rooms) {
    if (tx >= room.x && tx < room.x + room.w && ty >= room.y && ty < room.y + room.h) {
      return room;
    }
  }
  return null;
}

function isTileVisible(tx, ty, playerRoom) {
  if (playerRoom) {
    return tx >= playerRoom.x &&
      tx < playerRoom.x + playerRoom.w &&
      ty >= playerRoom.y &&
      ty < playerRoom.y + playerRoom.h;
  }

  const px = Math.floor(game.player.x);
  const py = Math.floor(game.player.y);
  if (roomAt(tx + 0.5, ty + 0.5)) return false;
  return Math.abs(tx - px) <= 2 && Math.abs(ty - py) <= 2 && game.walls[ty] && game.walls[ty][tx] === 1;
}

function isWalkableTile(tx, ty) {
  return !isBlockedTile(tx, ty);
}

function isNearBlockedTile(tx, ty) {
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      if (ox === 0 && oy === 0) continue;
      const nx = tx + ox;
      const ny = ty + oy;
      if (nx < 0 || ny < 0 || nx >= WORLD_W || ny >= WORLD_H) continue;
      if (isBlockedTile(nx, ny)) {
        return true;
      }
    }
  }
  return false;
}

function randomPointInRoom(room) {
  for (let i = 0; i < 20; i++) {
    const x = randInt(room.x + 1, room.x + room.w - 2);
    const y = randInt(room.y + 1, room.y + room.h - 2);
    if (isWalkable(x + 0.5, y + 0.5)) {
      return { x, y };
    }
  }
  return { x: room.cx, y: room.cy };
}

function clampTileX(x) {
  return Math.max(0, Math.min(WORLD_W - 1, x));
}

function clampTileY(y) {
  return Math.max(0, Math.min(WORLD_H - 1, y));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

function renderGameToText() {
  const currentRoom = roomAt(game.player.x, game.player.y);
  const actionableGuest = game.started && !game.over ? getNearestActionableGuest() : null;
  const guestActivityCounts = game.guests.reduce((acc, g) => {
    const key = g.activity || "roaming";
    if (!acc[key]) acc[key] = 0;
    acc[key] += 1;
    return acc;
  }, { roaming: 0, resting: 0, chatting: 0 });
  const visibleGuests = game.guests
    .filter((g) => g.alive && canPlayerSee(g.x, g.y))
    .map((g) => ({
      id: g.id,
      name: g.name,
      x: Number(g.x.toFixed(2)),
      y: Number(g.y.toFixed(2)),
      moving: g.moving,
      activity: g.activity,
      goal: g.goalLabel,
    }));
  const visibleCorpses = game.corpses
    .filter((c) => canPlayerSee(c.x, c.y))
    .map((c) => ({
      name: c.name,
      x: Number(c.x.toFixed(2)),
      y: Number(c.y.toFixed(2)),
      discovered: c.discovered,
    }));
  const payload = {
    coordinateSystem: "Origin top-left; x increases right; y increases down; units are tiles.",
    mode: !game.started ? "intro" : (game.over ? "game_over" : (game.conversation.active ? "conversation" : "investigation")),
    time: formatClock(game.minutes),
    started: game.started,
    player: {
      x: Number(game.player.x.toFixed(2)),
      y: Number(game.player.y.toFixed(2)),
      moving: game.player.moving,
      room: currentRoom ? currentRoom.name : "Hallway",
    },
    roomBrief: ROOM_BRIEFS[currentRoom ? currentRoom.name : "Hallway"] || ROOM_BRIEFS.Hallway,
    conversation: game.conversation.active
      ? {
        guestId: game.conversation.guestId,
        guestName: game.guests[game.conversation.guestId] ? game.guests[game.conversation.guestId].name : null,
      }
      : null,
    nearbyGuest: actionableGuest
      ? {
        id: actionableGuest.id,
        name: actionableGuest.name,
        distance: Number(distance(game.player, actionableGuest).toFixed(2)),
      }
      : null,
    visibleGuests,
    guestActivityCounts,
    visibleCorpses,
    aliveGuests: game.guests.filter((g) => g.alive).length,
    interviewedGuests: game.guests.filter((guest) => hasInterviewedGuest(guest)).length,
    discoveredBodies: game.corpses.filter((corpse) => corpse.discovered).length,
    over: game.over,
    ending: game.over ? game.ending : null,
    objective: getCurrentObjective(),
  };
  return JSON.stringify(payload);
}

async function advanceTime(ms) {
  manualStepMode = true;
  const frameMs = 1000 / 60;
  const steps = Math.max(1, Math.round(ms / frameMs));
  for (let i = 0; i < steps; i++) {
    stepGame(FIXED_DT);
  }
  drawWorld();
  updateUI();
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (err) {
    console.error("Fullscreen toggle failed", err);
  }
}

function resizeCanvasForPixelPerfect() {
  const frame = canvasFrame || canvas.parentElement;
  const frameWidth = frame ? frame.clientWidth : window.innerWidth;
  const frameHeight = frame ? frame.clientHeight : window.innerHeight;
  const frameStyles = frame ? window.getComputedStyle(frame) : null;
  const padX = frameStyles
    ? parseFloat(frameStyles.paddingLeft || "0") + parseFloat(frameStyles.paddingRight || "0")
    : 0;
  const padY = frameStyles
    ? parseFloat(frameStyles.paddingTop || "0") + parseFloat(frameStyles.paddingBottom || "0")
    : 0;
  const availableWidth = Math.max(1, frameWidth - padX - 2);
  const availableHeight = Math.max(1, frameHeight - padY - 2);
  const boundedScale = Math.min(availableWidth / W, availableHeight / H);
  const scale = boundedScale >= 1
    ? Math.max(1, Math.floor(boundedScale * 4) / 4)
    : Math.max(0.5, boundedScale);
  canvas.style.width = `${W * scale}px`;
  canvas.style.height = `${H * scale}px`;
}

window.addEventListener("resize", resizeCanvasForPixelPerfect);
window.addEventListener("fullscreenchange", resizeCanvasForPixelPerfect);
window.render_game_to_text = renderGameToText;
window.advanceTime = advanceTime;
resizeCanvasForPixelPerfect();

startGame();
requestAnimationFrame(frame);
