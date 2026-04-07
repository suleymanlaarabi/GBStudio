import type { GBColor } from "../../types";
import type { Template } from "../../types/template";
import { migrateFlatDataToChunks } from "../../services/mapService";

const TS  = "pp-terrain";
const CS  = "pp-chars";
const d   = (rows: (GBColor | null)[][]): (GBColor | null)[][] => rows;
const n   = null;

// ── Terrain tiles (8×8) ──────────────────────────────────────────────────────

const TERRAIN = {
  // 0 — ground top (grass)
  ground_top: { id: "pp-t0", size: 8 as const, data: d([
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 1, 2, 1, 2, 1, 2, 3],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
  ]) },
  // 1 — ground fill (dirt)
  ground_fill: { id: "pp-t1", size: 8 as const, data: d([
    [2, 2, 3, 2, 2, 2, 3, 2],
    [2, 3, 2, 2, 2, 3, 2, 2],
    [2, 2, 2, 3, 2, 2, 2, 2],
    [3, 2, 2, 2, 2, 2, 3, 2],
    [2, 2, 3, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 3, 2, 2, 3],
    [2, 3, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 3, 2, 2, 3, 2],
  ]) },
  // 2 — floating platform
  platform: { id: "pp-t2", size: 8 as const, data: d([
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 1, 1, 1, 1, 1, 1, 3],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [n, n, n, n, n, n, n, n],
    [n, n, n, n, n, n, n, n],
    [n, n, n, n, n, n, n, n],
    [n, n, n, n, n, n, n, n],
  ]) },
  // 3 — brick block
  brick: { id: "pp-t3", size: 8 as const, data: d([
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 2, 2, 3, 2, 2, 2, 3],
    [3, 2, 2, 3, 2, 2, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 2, 3, 2, 2, 2, 2, 3],
    [3, 2, 3, 2, 2, 2, 2, 3],
    [3, 2, 3, 2, 2, 2, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
  ]) },
  // 4 — question block
  question: { id: "pp-t4", size: 8 as const, data: d([
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [3, 2, 3, 1, 1, 3, 2, 3],
    [3, 2, 3, 3, 1, 3, 2, 3],
    [3, 2, 3, 1, 3, 2, 2, 3],
    [3, 2, 2, 3, 2, 2, 2, 3],
    [3, 2, 2, 3, 2, 2, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
  ]) },
  // 5 — coin
  coin: { id: "pp-t5", size: 8 as const, data: d([
    [n, n, 1, 1, 1, n, n, n],
    [n, 1, 2, 2, 2, 1, n, n],
    [1, 2, 2, 1, 2, 2, 1, n],
    [1, 2, 1, 1, 1, 2, 1, n],
    [1, 2, 1, 1, 2, 2, 1, n],
    [1, 2, 2, 2, 2, 2, 1, n],
    [n, 1, 2, 2, 2, 1, n, n],
    [n, n, 1, 1, 1, n, n, n],
  ]) },
  // 6 — spike
  spike: { id: "pp-t6", size: 8 as const, data: d([
    [n, 1, n, n, n, 1, n, n],
    [n, 1, n, n, n, 1, n, n],
    [1, 1, n, 1, n, 1, 1, n],
    [1, 1, 1, 1, 1, 1, 1, n],
    [1, 1, 1, 1, 1, 1, 1, n],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
  ]) },
  // 7 — pipe head left
  pipe_head_l: { id: "pp-t7", size: 8 as const, data: d([
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 1, 2, 2, 2, 2, 2, 2],
    [3, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [n, 3, 2, 2, 2, 2, 2, 2],
    [n, 3, 2, 2, 2, 2, 2, 2],
    [n, 3, 2, 2, 2, 2, 2, 2],
    [n, 3, 2, 2, 2, 2, 2, 2],
  ]) },
  // 8 — pipe head right
  pipe_head_r: { id: "pp-t8", size: 8 as const, data: d([
    [3, 3, 3, 3, 3, 3, 3, 3],
    [2, 2, 2, 2, 2, 2, 1, 3],
    [2, 2, 2, 2, 2, 2, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [2, 2, 2, 2, 2, 2, 3, n],
    [2, 2, 2, 2, 2, 2, 3, n],
    [2, 2, 2, 2, 2, 2, 3, n],
    [2, 2, 2, 2, 2, 2, 3, n],
  ]) },
  // 9 — pipe body left
  pipe_body_l: { id: "pp-t9", size: 8 as const, data: d([
    [n, 3, 2, 2, 2, 2, 2, 2],
    [n, 3, 2, 2, 2, 2, 2, 2],
    [n, 3, 2, 2, 2, 2, 2, 2],
    [n, 3, 2, 2, 2, 2, 2, 2],
    [n, 3, 2, 2, 2, 2, 2, 2],
    [n, 3, 2, 2, 2, 2, 2, 2],
    [n, 3, 2, 2, 2, 2, 2, 2],
    [n, 3, 2, 2, 2, 2, 2, 2],
  ]) },
  // 10 — pipe body right
  pipe_body_r: { id: "pp-t10", size: 8 as const, data: d([
    [2, 2, 2, 2, 2, 2, 3, n],
    [2, 2, 2, 2, 2, 2, 3, n],
    [2, 2, 2, 2, 2, 2, 3, n],
    [2, 2, 2, 2, 2, 2, 3, n],
    [2, 2, 2, 2, 2, 2, 3, n],
    [2, 2, 2, 2, 2, 2, 3, n],
    [2, 2, 2, 2, 2, 2, 3, n],
    [2, 2, 2, 2, 2, 2, 3, n],
  ]) },
  // 11 — flag top
  flag_top: { id: "pp-t11", size: 8 as const, data: d([
    [n, 3, 1, 1, 1, 1, n, n],
    [n, 3, 1, 1, 1, 1, n, n],
    [n, 3, 1, 1, 1, 1, n, n],
    [n, 3, 3, 3, 3, 3, n, n],
    [n, 3, n, n, n, n, n, n],
    [n, 3, n, n, n, n, n, n],
    [n, 3, n, n, n, n, n, n],
    [n, 3, n, n, n, n, n, n],
  ]) },
  // 12 — flag pole
  flag_pole: { id: "pp-t12", size: 8 as const, data: d([
    [n, 3, n, n, n, n, n, n],
    [n, 3, n, n, n, n, n, n],
    [n, 3, n, n, n, n, n, n],
    [n, 3, n, n, n, n, n, n],
    [n, 3, n, n, n, n, n, n],
    [n, 3, n, n, n, n, n, n],
    [n, 3, n, n, n, n, n, n],
    [n, 3, n, n, n, n, n, n],
  ]) },
  // 13 — water top
  water_top: { id: "pp-t13", size: 8 as const, data: d([
    [n, n, 1, n, n, n, 1, n],
    [n, 1, 1, 1, n, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 1, 1, 1, 2, 1, 1],
    [1, 1, 1, 2, 1, 1, 1, 2],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 2, 1, 1, 1, 2, 1],
  ]) },
  // 14 — water fill
  water_fill: { id: "pp-t14", size: 8 as const, data: d([
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 1, 1, 1, 1, 2, 1],
    [1, 1, 1, 2, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 1, 1],
    [1, 1, 2, 1, 1, 1, 1, 1],
    [1, 2, 1, 1, 2, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 2, 1],
    [1, 1, 1, 2, 1, 1, 1, 1],
  ]) },
  // 15 — ladder
  ladder: { id: "pp-t15", size: 8 as const, data: d([
    [3, 1, 1, 1, 1, 1, 1, 3],
    [3, 1, n, n, n, n, 1, 3],
    [3, 1, n, n, n, n, 1, 3],
    [3, 1, 1, 1, 1, 1, 1, 3],
    [3, 1, n, n, n, n, 1, 3],
    [3, 1, n, n, n, n, 1, 3],
    [3, 1, 1, 1, 1, 1, 1, 3],
    [3, 1, n, n, n, n, 1, 3],
  ]) },
};

// ── Character tiles (8×8) ─────────────────────────────────────────────────────

const CHARS = {
  // 0 — hero idle
  hero_idle: { id: "pp-c0", size: 8 as const, data: d([
    [n, n, 2, 2, 2, n, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [n, 2, 3, 1, 3, 2, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [n, n, 2, 3, 2, n, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [n, n, 2, 3, 2, n, n, n],
    [n, n, 2, n, 2, n, n, n],
  ]) },
  // 1 — hero walk frame 1
  hero_walk1: { id: "pp-c1", size: 8 as const, data: d([
    [n, n, 2, 2, 2, n, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [n, 2, 3, 1, 3, 2, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [n, n, 2, 3, 2, n, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [n, n, 2, 3, 2, n, n, n],
    [n, 2, 2, n, 2, 2, n, n],
  ]) },
  // 2 — hero walk frame 2
  hero_walk2: { id: "pp-c2", size: 8 as const, data: d([
    [n, n, 2, 2, 2, n, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [n, 2, 3, 1, 3, 2, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [n, 3, 2, 3, 2, 3, n, n],
    [n, n, n, 2, n, n, n, n],
    [n, 2, 2, n, n, 2, n, n],
    [n, 3, 3, n, n, 3, n, n],
  ]) },
  // 3 — hero jump
  hero_jump: { id: "pp-c3", size: 8 as const, data: d([
    [n, n, 2, 2, 2, n, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [n, 2, 3, 1, 3, 2, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [2, 2, 2, 3, 2, 2, 2, n],
    [n, n, n, 2, n, n, n, n],
    [n, n, 2, n, 2, n, n, n],
    [2, 2, n, n, n, 2, 2, n],
  ]) },
  // 4 — hero hurt
  hero_hurt: { id: "pp-c4", size: 8 as const, data: d([
    [n, n, 2, 2, 2, n, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [n, 2, 1, 3, 1, 2, n, n],
    [n, 2, 3, 3, 3, 2, n, n],
    [n, 2, 2, 3, 2, 2, n, n],
    [n, n, n, 2, n, n, n, n],
    [n, n, n, 2, n, n, n, n],
    [n, n, 2, n, 2, n, n, n],
  ]) },
  // 5 — walker enemy frame 1 (goomba-style)
  walker1: { id: "pp-c5", size: 8 as const, data: d([
    [n, n, 3, 3, 3, 3, n, n],
    [n, 3, 2, 2, 2, 2, 3, n],
    [3, 2, 1, 2, 1, 2, 2, 3],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [3, 2, 3, 2, 2, 3, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [n, 3, 2, n, n, 2, 3, n],
    [n, 3, 3, n, n, 3, 3, n],
  ]) },
  // 6 — walker enemy frame 2
  walker2: { id: "pp-c6", size: 8 as const, data: d([
    [n, n, 3, 3, 3, 3, n, n],
    [n, 3, 2, 2, 2, 2, 3, n],
    [3, 2, 1, 2, 1, 2, 2, 3],
    [3, 2, 2, 2, 2, 2, 2, 3],
    [3, 2, 3, 2, 2, 3, 2, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [n, 2, 3, n, n, 3, 2, n],
    [n, 3, 3, n, n, 3, 3, n],
  ]) },
  // 7 — flyer enemy frame 1 (wings up)
  flyer1: { id: "pp-c7", size: 8 as const, data: d([
    [3, n, n, n, n, n, 3, n],
    [3, 2, n, n, n, 2, 3, n],
    [3, 2, 3, 1, 3, 2, 3, n],
    [n, 3, 3, 2, 3, 3, n, n],
    [n, n, 3, 2, 3, n, n, n],
    [n, 3, 3, 3, 3, 3, n, n],
    [3, 3, n, n, n, 3, 3, n],
    [n, n, n, n, n, n, n, n],
  ]) },
  // 8 — flyer enemy frame 2 (wings level)
  flyer2: { id: "pp-c8", size: 8 as const, data: d([
    [n, n, n, n, n, n, n, n],
    [n, n, n, n, n, n, n, n],
    [3, 3, 3, 1, 3, 3, 3, n],
    [n, 3, 3, 2, 3, 3, n, n],
    [3, 3, 3, 3, 3, 3, 3, n],
    [n, 3, 3, 3, 3, 3, n, n],
    [n, n, 3, n, 3, n, n, n],
    [n, n, n, n, n, n, n, n],
  ]) },
  // 9 — coin spin (edge-on, animation frame 2)
  coin_spin: { id: "pp-c9", size: 8 as const, data: d([
    [n, n, n, 1, 1, n, n, n],
    [n, n, n, 2, 2, n, n, n],
    [n, n, n, 2, 2, n, n, n],
    [n, n, n, 2, 2, n, n, n],
    [n, n, n, 2, 2, n, n, n],
    [n, n, n, 2, 2, n, n, n],
    [n, n, n, 2, 2, n, n, n],
    [n, n, n, 1, 1, n, n, n],
  ]) },
};

// ── Cell refs ─────────────────────────────────────────────────────────────────

// Terrain
const T  = { tilesetId: TS, tileIndex: 0  };  // ground top
const F  = { tilesetId: TS, tileIndex: 1  };  // ground fill
const P  = { tilesetId: TS, tileIndex: 2  };  // platform
const Br = { tilesetId: TS, tileIndex: 3  };  // brick
const Q  = { tilesetId: TS, tileIndex: 4  };  // question
const Co = { tilesetId: TS, tileIndex: 5  };  // coin
const Sk = { tilesetId: TS, tileIndex: 6  };  // spike
const PL = { tilesetId: TS, tileIndex: 7  };  // pipe head left
const PR = { tilesetId: TS, tileIndex: 8  };  // pipe head right
const BL = { tilesetId: TS, tileIndex: 9  };  // pipe body left
const BR = { tilesetId: TS, tileIndex: 10 };  // pipe body right
const FT = { tilesetId: TS, tileIndex: 11 };  // flag top
const FP = { tilesetId: TS, tileIndex: 12 };  // flag pole
const WT = { tilesetId: TS, tileIndex: 13 };  // water top
const WF = { tilesetId: TS, tileIndex: 14 };  // water fill
const Ld = { tilesetId: TS, tileIndex: 15 };  // ladder

// ── Map data (32 × 14) ───────────────────────────────────────────────────────
// Layer 1 – Terrain (solid ground, platforms, water)
const TERRAIN_LAYER = [
  /* R0  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n],
  /* R1  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n],
  /* R2  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n],
  /* R3  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n],
  /* R4  */ [n,n,n,n,P,P,P,n, n,n,n,n,n,n,n,n, n,n,n,n,n,P,P,P, n,n,n,n,n,n,n,n],
  /* R5  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n],
  /* R6  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n],
  /* R7  */ [n,n,n,n,n,n,n,n, n,n,P,P,P,P,P,n, n,n,n,n,n,n,n,n, n,n,n,P,P,P,n,n],
  /* R8  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n],
  /* R9  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n],
  /* R10 */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n],
  /* R11 */ [T,T,T,T,T,T,T,T, T,T,WT,WT,T,T,T, T,T,T,T,T,T,T,T,T, T,T,T,T,T,T,T,T],
  /* R12 */ [F,F,F,F,F,F,F,F, F,F,WF,WF,F,F,F, F,F,F,F,F,F,F,F,F, F,F,F,F,F,F,F,F],
  /* R13 */ [F,F,F,F,F,F,F,F, F,F,WF,WF,F,F,F, F,F,F,F,F,F,F,F,F, F,F,F,F,F,F,F,F],
];

// Layer 2 – Details (pipes, items, flag, hazards)
const DETAILS_LAYER = [
  /* R0  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,FT,n],
  /* R1  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,FP,n],
  /* R2  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,FP,n],
  /* R3  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,FP,n],
  /* R4  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,FP,n],
  /* R5  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,FP,n],
  /* R6  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,FP,n],
  /* R7  */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,FP,n],
  /* R8  */ [n,n,Br,n,Q,n,Br,n, PL,PR,n,n,n,n,n,n, Br,Br,Q,Br,Br,n,n,n, PL,PR,n,n,n,n,n,n],
  /* R9  */ [Co,Co,n,Co,n,Co,n,Co, BL,BR,n,n,n,Co,Co,Co, n,n,n,n,n,Co,Co,Co, BL,BR,n,n,n,n,FP,n],
  /* R10 */ [n,n,n,n,n,n,n,n, BL,BR,Ld,Ld,n,n,n,n, n,n,n,n,n,n,n,n, BL,BR,n,Sk,Sk,n,FP,n],
  /* R11 */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,FP,n],
  /* R12 */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n],
  /* R13 */ [n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n, n,n,n,n,n,n,n,n],
];

// ── Template export ───────────────────────────────────────────────────────────

export const PLATFORMER_PRO_TEMPLATE: Template = {
  id: "builtin-platformer-pro",
  name: "Platformer Pro",
  description: "Complete Mario/Kirby-style platformer: 16 terrain tiles, hero (5 anims), 2 enemies, coin FX, pipes, water, flag, and 7 SFX.",
  category: "platformer",
  isBuiltin: true,
  createdAt: "2026-04-17T00:00:00.000Z",

  tilesets: [
    {
      id: TS,
      name: "Platformer Terrain",
      tileSize: 8,
      tiles: [
        TERRAIN.ground_top,
        TERRAIN.ground_fill,
        TERRAIN.platform,
        TERRAIN.brick,
        TERRAIN.question,
        TERRAIN.coin,
        TERRAIN.spike,
        TERRAIN.pipe_head_l,
        TERRAIN.pipe_head_r,
        TERRAIN.pipe_body_l,
        TERRAIN.pipe_body_r,
        TERRAIN.flag_top,
        TERRAIN.flag_pole,
        TERRAIN.water_top,
        TERRAIN.water_fill,
        TERRAIN.ladder,
      ],
      layout: {
        columns: 4,
        positions: {
          "pp-t0":  { x: 0, y: 0 },
          "pp-t1":  { x: 1, y: 0 },
          "pp-t2":  { x: 2, y: 0 },
          "pp-t3":  { x: 3, y: 0 },
          "pp-t4":  { x: 0, y: 1 },
          "pp-t5":  { x: 1, y: 1 },
          "pp-t6":  { x: 2, y: 1 },
          "pp-t7":  { x: 3, y: 1 },
          "pp-t8":  { x: 0, y: 2 },
          "pp-t9":  { x: 1, y: 2 },
          "pp-t10": { x: 2, y: 2 },
          "pp-t11": { x: 3, y: 2 },
          "pp-t12": { x: 0, y: 3 },
          "pp-t13": { x: 1, y: 3 },
          "pp-t14": { x: 2, y: 3 },
          "pp-t15": { x: 3, y: 3 },
        },
      },
    },
    {
      id: CS,
      name: "Characters & Enemies",
      tileSize: 8,
      tiles: [
        CHARS.hero_idle,
        CHARS.hero_walk1,
        CHARS.hero_walk2,
        CHARS.hero_jump,
        CHARS.hero_hurt,
        CHARS.walker1,
        CHARS.walker2,
        CHARS.flyer1,
        CHARS.flyer2,
        CHARS.coin_spin,
      ],
      layout: {
        columns: 5,
        positions: {
          "pp-c0": { x: 0, y: 0 },
          "pp-c1": { x: 1, y: 0 },
          "pp-c2": { x: 2, y: 0 },
          "pp-c3": { x: 3, y: 0 },
          "pp-c4": { x: 4, y: 0 },
          "pp-c5": { x: 0, y: 1 },
          "pp-c6": { x: 1, y: 1 },
          "pp-c7": { x: 2, y: 1 },
          "pp-c8": { x: 3, y: 1 },
          "pp-c9": { x: 4, y: 1 },
        },
      },
    },
  ],

  maps: [
    {
      id: "pp-map-1",
      name: "World 1-1",
      width: 32,
      height: 14,
      tileSize: 8,
      layers: [
        {
          id: "pp-layer-terrain",
          name: "Terrain",
          visible: true,
          chunks: migrateFlatDataToChunks(TERRAIN_LAYER),
        },
        {
          id: "pp-layer-details",
          name: "Items & Pipes",
          visible: true,
          chunks: migrateFlatDataToChunks(DETAILS_LAYER),
        },
      ],
    },
  ],

  sprites: [
    {
      id: "pp-hero",
      name: "Hero",
      animations: [
        {
          id: "pp-hero-idle",
          name: "Idle",
          loop: true,
          frames: [{ tilesetId: CS, tileIndex: 0, duration: 16 }],
        },
        {
          id: "pp-hero-walk",
          name: "Walk",
          loop: true,
          frames: [
            { tilesetId: CS, tileIndex: 1, duration: 8 },
            { tilesetId: CS, tileIndex: 0, duration: 8 },
            { tilesetId: CS, tileIndex: 2, duration: 8 },
            { tilesetId: CS, tileIndex: 0, duration: 8 },
          ],
        },
        {
          id: "pp-hero-jump",
          name: "Jump",
          loop: false,
          frames: [{ tilesetId: CS, tileIndex: 3, duration: 12 }],
        },
        {
          id: "pp-hero-fall",
          name: "Fall",
          loop: false,
          frames: [{ tilesetId: CS, tileIndex: 3, duration: 12 }],
        },
        {
          id: "pp-hero-hurt",
          name: "Hurt",
          loop: false,
          frames: [{ tilesetId: CS, tileIndex: 4, duration: 20 }],
        },
      ],
    },
    {
      id: "pp-walker",
      name: "Walker Enemy",
      animations: [
        {
          id: "pp-walker-walk",
          name: "Walk",
          loop: true,
          frames: [
            { tilesetId: CS, tileIndex: 5, duration: 12 },
            { tilesetId: CS, tileIndex: 6, duration: 12 },
          ],
        },
      ],
    },
    {
