import type { paths } from "./schema";
import { fetchPublicList } from "./client";

export type PublicNetworkCountry = {
  name: string;
  city?: string;
  note?: string;
};

export function getPublicNetworkCountries(): Promise<PublicNetworkCountry[]> {
  return fetchPublicList<PublicNetworkCountry>("/network/public");
}
