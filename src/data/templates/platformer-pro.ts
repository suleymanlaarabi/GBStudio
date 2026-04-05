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
