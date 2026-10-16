import restaurants from "./restaurants";
import type { Campaign } from "./types";

export * from "./types";

/**
 * Campaign registry.
 *
 * To launch a campaign: add its data file to this folder and one entry here.
 * The route (`/campaigns/:slug` and `/es/campaigns/:slug`), rendering, SEO and
 * lead attribution are all handled by the shared template.
 */
export const campaigns: Campaign[] = [restaurants];

export const campaignsBySlug: Record<string, Campaign> = Object.fromEntries(
  campaigns.map((campaign) => [campaign.slug, campaign]),
);

/**
 * Whether a campaign should be publicly reachable.
 *
 * - `draft` renders in development only, so copy can be previewed before it
 *   goes live, but never leaks to visitors or search engines.
 * - `ended`, or a date outside [startDate, endDate], is unreachable.
 *
 * `today` is injectable so this stays deterministic in tests.
 */
export function isCampaignVisible(
  campaign: Campaign,
  { isDev = false, today = new Date() }: { isDev?: boolean; today?: Date } = {},
): boolean {
  if (campaign.status === "ended") return false;
  if (campaign.status === "draft") return isDev;

  const day = today.toISOString().slice(0, 10);
  if (campaign.startDate && day < campaign.startDate) return false;
  if (campaign.endDate && day > campaign.endDate) return false;
  return true;
}

export function getCampaign(slug: string | undefined): Campaign | undefined {
  return slug ? campaignsBySlug[slug] : undefined;
}

/** Slugs that belong in the sitemap — active and inside their date window. */
export function publicCampaignSlugs(today = new Date()): string[] {
  return campaigns
    .filter((campaign) => isCampaignVisible(campaign, { isDev: false, today }))
    .map((campaign) => campaign.slug);
}
