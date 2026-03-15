/**
 * A* Pathfinding on a 2D navigation grid.
 * Cell size = 1m. Smoothed via CatmullRom-like interpolation.
 */

export interface Vec2 {
  x: number;
  z: number;
}

interface Node {
  x: number;
  z: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

// Obstacle grid — true means blocked
const obstacles = new Set<string>();

function key(x: number, z: number) {
  return `${x},${z}`;
}

export function addObstacle(x: number, z: number) {
  obstacles.add(key(Math.round(x), Math.round(z)));
}

export function addObstacleRect(cx: number, cz: number, w: number, d: number) {
  const hw = Math.ceil(w / 2);
  const hd = Math.ceil(d / 2);
  for (let x = Math.round(cx) - hw; x <= Math.round(cx) + hw; x++) {
    for (let z = Math.round(cz) - hd; z <= Math.round(cz) + hd; z++) {
      obstacles.add(key(x, z));
    }
  }
}

export function isBlocked(x: number, z: number): boolean {
  return obstacles.has(key(Math.round(x), Math.round(z)));
}

function heuristic(a: Vec2, b: Vec2): number {
  return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
}

const DIRS = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: 0, z: -1 },
  { x: 1, z: 1 },
  { x: -1, z: 1 },
  { x: 1, z: -1 },
  { x: -1, z: -1 },
];

/**
 * Find shortest path from start to end using A*.
 * Returns array of world-space [x, z] waypoints, or null if no path found.
 * Max iterations to prevent hangs on huge grids.
 */
export function findPath(
  start: Vec2,
  end: Vec2,
  maxIterations = 2000
): Vec2[] | null {
  const sx = Math.round(start.x);
  const sz = Math.round(start.z);
  const ex = Math.round(end.x);
  const ez = Math.round(end.z);

  if (isBlocked(ex, ez)) return null;

  const open: Node[] = [];
  const closed = new Set<string>();

  const startNode: Node = {
    x: sx,
    z: sz,
    g: 0,
    h: heuristic({ x: sx, z: sz }, { x: ex, z: ez }),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  open.push(startNode);

  let iterations = 0;

  while (open.length > 0 && iterations < maxIterations) {
    iterations++;

    // Find node with lowest f
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bestIdx].f) bestIdx = i;
    }
    const current = open.splice(bestIdx, 1)[0];

    if (current.x === ex && current.z === ez) {
      // Reconstruct path
      const path: Vec2[] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift({ x: node.x, z: node.z });
        node = node.parent;
      }
      return smoothPath(path);
    }

    closed.add(key(current.x, current.z));

    for (const dir of DIRS) {
      const nx = current.x + dir.x;
      const nz = current.z + dir.z;
      const nKey = key(nx, nz);

      if (closed.has(nKey) || isBlocked(nx, nz)) continue;

      // Diagonal cost = sqrt(2), cardinal = 1
      const moveCost = dir.x !== 0 && dir.z !== 0 ? 1.414 : 1;
      const g = current.g + moveCost;
      const h = heuristic({ x: nx, z: nz }, { x: ex, z: ez });

      const existing = open.find((n) => n.x === nx && n.z === nz);
      if (existing) {
        if (g < existing.g) {
          existing.g = g;
          existing.f = g + h;
          existing.parent = current;
        }
      } else {
        open.push({ x: nx, z: nz, g, h, f: g + h, parent: current });
      }
    }
  }

  return null; // No path found
}

/**
 * CatmullRom-like path smoothing with oversampling.
 * Tension = 0.5, 12× oversampling per segment.
 */
function smoothPath(raw: Vec2[]): Vec2[] {
  if (raw.length <= 2) return raw;

  const tension = 0.5;
  const samples = 12;
  const result: Vec2[] = [raw[0]];

  for (let i = 0; i < raw.length - 1; i++) {
    const p0 = raw[Math.max(i - 1, 0)];
    const p1 = raw[i];
    const p2 = raw[Math.min(i + 1, raw.length - 1)];
    const p3 = raw[Math.min(i + 2, raw.length - 1)];

    for (let s = 1; s <= samples; s++) {
      const t = s / samples;
      const t2 = t * t;
      const t3 = t2 * t;

      const x = catmull(p0.x, p1.x, p2.x, p3.x, t, t2, t3, tension);
      const z = catmull(p0.z, p1.z, p2.z, p3.z, t, t2, t3, tension);
      result.push({ x, z });
    }
  }

  return result;
}

function catmull(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
  t2: number,
  t3: number,
  tension: number
): number {
  const s = (1 - tension) / 2;
  return (
    (2 * p1) +
    (-p0 + p2) * s * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * s * t3
  );
}
