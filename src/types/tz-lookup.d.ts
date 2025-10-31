declare module "tz-lookup" {
  /**
   * Returns the IANA timezone identifier for the given latitude and longitude.
   */
  export default function tzLookup(latitude: number, longitude: number): string;
}
