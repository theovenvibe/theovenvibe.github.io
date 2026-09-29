/** Absent mapping preserves the old all-extras behavior; [] explicitly disables extras. */
export interface AddonMappings { categories?: Record<string,string[]>; items?: Record<string,string[]> }
export function allowedAddonCodes(productCode: string,category: string,all: string[],mapping?: AddonMappings): string[] {
  if (mapping?.items && Object.hasOwn(mapping.items,productCode)) return mapping.items[productCode]!;
  if (mapping?.categories && Object.hasOwn(mapping.categories,category)) return mapping.categories[category]!;
  return all;
}
