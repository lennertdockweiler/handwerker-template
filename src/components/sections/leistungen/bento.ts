/**
 * Bento-Layout für ein 4-Spalten-Raster ohne Lücken – für jede Anzahl Kacheln.
 * Erste Kachel 2×2, rechts daneben ein 2×2-Block, danach Reihen à 4 Einheiten.
 */
export interface Tile {
  w: number;
  h: number;
}

const ROW: Record<number, number[]> = { 1: [4], 2: [2, 2], 3: [2, 1, 1], 4: [1, 1, 1, 1] };

export function bentoLayout(n: number): Tile[] {
  if (n <= 0) return [];
  if (n === 1) return [{ w: 4, h: 2 }];
  const tiles: Tile[] = [{ w: 2, h: 2 }];
  let rest = n - 1;
  // 2×2-Block rechts neben der großen Kachel
  const block = rest >= 4 ? [1, 1, 1, 1] : rest === 3 ? [1, 1, 2] : rest === 2 ? [2, 2] : [];
  if (rest === 1) {
    tiles.push({ w: 2, h: 2 });
    return tiles;
  }
  block.forEach((w) => tiles.push({ w, h: 1 }));
  rest -= block.length;
  while (rest > 0) {
    const take = Math.min(4, rest === 5 ? 3 : rest);
    ROW[take]!.forEach((w) => tiles.push({ w, h: 1 }));
    rest -= take;
  }
  return tiles;
}
