import type { AspectDefinition } from "./category-definitions.ts";
import type { AspectTally } from "./aspect-model.ts";
import type { JoinedProduct, Spec } from "./types.ts";

export type SideStatus = "mentioned" | "no-mention" | "unread";

export type VsAspectRow = {
  definition: AspectDefinition;
  a: { status: SideStatus; tally: AspectTally | null };
  b: { status: SideStatus; tally: AspectTally | null };
  sortKey: number;
  definitionIndex: number;
};

export type VsSpecRow = {
  key: string;
  label: string;
  a: { value: string; provenance: string } | null;
  b: { value: string; provenance: string } | null;
};

function sideForProduct(
  product: JoinedProduct,
  aspectKey: string,
): { status: SideStatus; tally: AspectTally | null } {
  if (product.aspects === null) {
    return { status: "unread", tally: null };
  }
  const tally = product.aspects.find((t) => t.key === aspectKey);
  if (!tally || tally.positive + tally.negative === 0) {
    return { status: "no-mention", tally: null };
  }
  return { status: "mentioned", tally };
}

function mentionTotal(side: { status: SideStatus; tally: AspectTally | null }): number {
  return side.tally ? side.tally.positive + side.tally.negative : 0;
}

export function buildAspectRows(
  definitions: readonly AspectDefinition[],
  productA: JoinedProduct,
  productB: JoinedProduct,
): VsAspectRow[] {
  const rows: VsAspectRow[] = definitions.map((def, i) => {
    const a = sideForProduct(productA, def.key);
    const b = sideForProduct(productB, def.key);
    const bothMentioned = a.status === "mentioned" && b.status === "mentioned";
    const eitherMentioned = a.status === "mentioned" || b.status === "mentioned";
    const groupOrder = bothMentioned ? 0 : eitherMentioned ? 1 : 2;
    const total = mentionTotal(a) + mentionTotal(b);
    return {
      definition: def,
      a,
      b,
      sortKey: groupOrder * 1e9 - total,
      definitionIndex: i,
    };
  });

  rows.sort((x, y) => x.sortKey - y.sortKey || x.definitionIndex - y.definitionIndex);
  return rows;
}

export function buildSpecRows(
  productA: JoinedProduct,
  productB: JoinedProduct,
): VsSpecRow[] {
  const seen = new Set<string>();
  const rows: VsSpecRow[] = [];

  const specMapA = new Map<string, Spec>();
  for (const s of productA.specs) specMapA.set(s.key, s);

  const specMapB = new Map<string, Spec>();
  for (const s of productB.specs) specMapB.set(s.key, s);

  for (const s of productA.specs) {
    if (seen.has(s.key)) continue;
    seen.add(s.key);
    const bSpec = specMapB.get(s.key);
    rows.push({
      key: s.key,
      label: s.label,
      a: { value: s.displayValue, provenance: s.provenance },
      b: bSpec ? { value: bSpec.displayValue, provenance: bSpec.provenance } : null,
    });
  }

  for (const s of productB.specs) {
    if (seen.has(s.key)) continue;
    seen.add(s.key);
    rows.push({
      key: s.key,
      label: s.label,
      a: null,
      b: { value: s.displayValue, provenance: s.provenance },
    });
  }

  return rows;
}
