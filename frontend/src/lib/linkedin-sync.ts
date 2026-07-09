export interface LinkedInSyncParams {
  keywords: string;
  location: string;
  geo_id: string;
  limit: number;
}

export interface LinkedInLocationOption {
  label: string;
  location: string;
  geoId: string;
}

export const DEFAULT_LINKEDIN_SYNC: LinkedInSyncParams = {
  keywords: "software engineer",
  location: "Bulgaria",
  geo_id: "105333783",
  limit: 10,
};

export const LINKEDIN_LOCATIONS: LinkedInLocationOption[] = [
  { label: "Bulgaria", location: "Bulgaria", geoId: "105333783" },
  { label: "Germany", location: "Germany", geoId: "101282230" },
  { label: "Romania", location: "Romania", geoId: "106670623" },
  { label: "France", location: "France", geoId: "105015875" },
  { label: "Netherlands", location: "Netherlands", geoId: "102890719" },
  { label: "United Kingdom", location: "United Kingdom", geoId: "101165590" },
  { label: "Poland", location: "Poland", geoId: "105072130" },
  { label: "Greece", location: "Greece", geoId: "106006489" },
];

export const LINKEDIN_KEYWORD_SUGGESTIONS = [
  "software engineer",
  "frontend developer",
  "full stack developer",
  "data engineer",
  "product manager",
] as const;

export const LINKEDIN_LIMIT_OPTIONS = [10, 30, 50, 100] as const;

export function findLinkedInLocation(geoId: string): LinkedInLocationOption {
  return (
    LINKEDIN_LOCATIONS.find((item) => item.geoId === geoId) ??
    LINKEDIN_LOCATIONS[0]
  );
}
