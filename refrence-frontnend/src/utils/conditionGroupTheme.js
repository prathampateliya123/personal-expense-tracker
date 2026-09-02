export const ROOT_GROUP_THEME = {
  soft: "hsl(32, 100%, 95%)",
  border: "rgba(246,143,61,0.45)",
  line: "rgba(246,143,61,0.55)",
  hue: 32
};

const ROOT_HUE = ROOT_GROUP_THEME.hue;

const DISTINCT_HUES = [
  205,
  145,
  280,
  90, 
  340, 
  175,
  245,
  115,
  310,
  65,
  220,
  155,
  295,
  355,
  190,
  130,
  265,
  100,
  230,
  165
];

const ORANGE_HUE_MIN = 8;
const ORANGE_HUE_MAX = 58;

const MIN_HUE_GAP = 36;
const SIBLING_HUE_GAP = 48;
const ROOT_HUE_GAP = 42;

const GOLDEN_ANGLE = 137.508;

function wrapHue(h) {
  const x = h % 360;
  return x < 0 ? x + 360 : x;
}

function circularHueDist(a, b) {
  const d = Math.abs(wrapHue(a) - wrapHue(b));
  return Math.min(d, 360 - d);
}

function isInOrangeBand(h) {
  const hue = wrapHue(h);
  return hue >= ORANGE_HUE_MIN && hue <= ORANGE_HUE_MAX;
}

function escapeOrange(h) {
  let hue = wrapHue(h);
  if (!isInOrangeBand(hue)) return hue;
  return wrapHue(hue + 55);
}

export function hueFromIndex(index = 0) {
  const i = Math.max(0, Math.floor(Number(index) || 0));
  if (i < DISTINCT_HUES.length) {
    return escapeOrange(DISTINCT_HUES[i]);
  }
  let h = escapeOrange(wrapHue(i * GOLDEN_ANGLE + 12));
  if (circularHueDist(h, ROOT_HUE) < ROOT_HUE_GAP) {
    h = escapeOrange(wrapHue(h + 70));
  }
  return h;
}

function themeFromHue(hue, index = 0) {
  const h = wrapHue(hue);
  const sat = 52 + (Math.abs(Number(index)) % 5) * 4; // 52–68%
  const softLight = 91 + (Math.abs(Number(index)) % 3); // 91–93%
  const borderLight = 40 + (Math.abs(Number(index)) % 4) * 2; // 40–46%
  const lineLight = 42 + (Math.abs(Number(index)) % 3) * 2; // 42–46%

  return {
    soft: `hsl(${h.toFixed(1)}, ${sat}%, ${softLight}%)`,
    border: `hsla(${h.toFixed(1)}, ${Math.min(sat + 12, 72)}%, ${borderLight}%, 0.55)`,
    line: `hsla(${h.toFixed(1)}, ${Math.min(sat + 8, 68)}%, ${lineLight}%, 0.7)`,
    hue: h
  };
}

export function getGroupTheme(isRoot = false, colorIndex = 0) {
  if (isRoot) return ROOT_GROUP_THEME;
  return themeFromHue(hueFromIndex(colorIndex), colorIndex);
}

export function pickUniqueGroupColor({
  siblingIndex = 0,
  parentIsRoot = false,
  parentColorIndex = 0,
  ancestorIndexes = [],
  usedSiblingIndexes = [],
  usedTreeIndexes = []
} = {}) {
  const banned = new Set();
  for (const idx of usedTreeIndexes) {
    if (Number.isFinite(idx)) banned.add(idx);
  }
  for (const idx of usedSiblingIndexes) {
    if (Number.isFinite(idx)) banned.add(idx);
  }
  for (const idx of ancestorIndexes) {
    if (Number.isFinite(idx)) banned.add(idx);
  }
  if (!parentIsRoot && Number.isFinite(parentColorIndex)) {
    banned.add(parentColorIndex);
  }

  const avoid = [{ hue: ROOT_HUE, weight: 2.4 }];

  if (!parentIsRoot && Number.isFinite(parentColorIndex)) {
    avoid.push({ hue: hueFromIndex(parentColorIndex), weight: 1.8 });
  }
  for (const idx of ancestorIndexes) {
    if (Number.isFinite(idx)) {
      avoid.push({ hue: hueFromIndex(idx), weight: 1.5 });
    }
  }

  usedSiblingIndexes.forEach((idx, i) => {
    if (!Number.isFinite(idx)) return;
    const isLast = i === usedSiblingIndexes.length - 1;
    avoid.push({
      hue: hueFromIndex(idx),
      weight: isLast ? 3.2 : 2.2
    });
  });

  for (const idx of usedTreeIndexes) {
    if (!Number.isFinite(idx)) continue;
    avoid.push({ hue: hueFromIndex(idx), weight: 1.1 });
  }

  const searchLimit = Math.max(
    DISTINCT_HUES.length + 40,
    banned.size + 60,
    80
  );

  let bestIndex = -1;
  let bestScore = -Infinity;

  for (let i = 0; i < searchLimit; i += 1) {
    if (banned.has(i)) continue;

    const h = hueFromIndex(i);
    if (isInOrangeBand(h)) continue;
    if (circularHueDist(h, ROOT_HUE) < ROOT_HUE_GAP) continue;

    let minDist = 180;
    let minSiblingDist = 180;
    let weightedPenalty = 0;

    for (const { hue: ah, weight } of avoid) {
      const d = circularHueDist(h, ah);
      minDist = Math.min(minDist, d);
      weightedPenalty += Math.max(0, MIN_HUE_GAP - d) * 14 * weight;
    }

    for (const idx of usedSiblingIndexes) {
      if (!Number.isFinite(idx)) continue;
      minSiblingDist = Math.min(minSiblingDist, circularHueDist(h, hueFromIndex(idx)));
    }

    if (minSiblingDist < SIBLING_HUE_GAP) {
      weightedPenalty += (SIBLING_HUE_GAP - minSiblingDist) * 40;
    }

    const paletteBonus = i < DISTINCT_HUES.length ? 8 : 0;
    const score =
      minDist * 12 +
      minSiblingDist * 6 +
      paletteBonus -
      weightedPenalty -
      i * 0.002;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex >= 0) return bestIndex;
  for (let i = 0; i < searchLimit + 40; i += 1) {
    if (!banned.has(i)) return i;
  }
  return siblingIndex;
}