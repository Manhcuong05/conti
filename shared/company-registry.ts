import type { CompanyRegistryEntry } from "./types";
// Use the crawled dataset; adjust path if you merge other sources.
import registry from "../data/thuvienphapluat.json";

export const COMPANY_REGISTRY: CompanyRegistryEntry[] = Array.isArray(registry)
  ? (registry as CompanyRegistryEntry[]).filter((item) => item?.name && typeof item.name === "string")
  : [];
