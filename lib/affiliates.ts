// Update these URLs with real affiliate tracking links after signup

export interface AffiliateConfig {
  url: string;
  label: string;
  color: string;
}

export const AFFILIATE_LINKS: Record<string, AffiliateConfig> = {
  "ESPN+": { url: "https://espnplus.com/?ref=PLACEHOLDER", label: "Watch on ESPN+", color: "#d00" },
  "ESPN": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "ESPN2": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "ESPNU": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "ESPNews": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "ABC": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "ABC/ESPN": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "Peacock": { url: "https://peacocktv.com/?ref=PLACEHOLDER", label: "Watch on Peacock", color: "#000" },
  "Amazon Prime": { url: "https://amazon.com/primevideo/?ref=PLACEHOLDER", label: "Watch on Prime Video", color: "#00a8e0" },
  "Apple TV+": { url: "https://tv.apple.com/?ref=PLACEHOLDER", label: "Watch on Apple TV+", color: "#555" },
  "Paramount+": { url: "https://paramountplus.com/?ref=PLACEHOLDER", label: "Watch on Paramount+", color: "#0064ff" },
  "TNT": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "TBS": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "NBC": { url: "https://peacocktv.com/?ref=PLACEHOLDER", label: "Watch on Peacock", color: "#000" },
  "NBC Sports": { url: "https://peacocktv.com/?ref=PLACEHOLDER", label: "Watch on Peacock", color: "#000" },
  "USA Network": { url: "https://peacocktv.com/?ref=PLACEHOLDER", label: "Watch on Peacock", color: "#000" },
  "CBS": { url: "https://paramountplus.com/?ref=PLACEHOLDER", label: "Watch on Paramount+", color: "#0064ff" },
  "CBS Sports": { url: "https://paramountplus.com/?ref=PLACEHOLDER", label: "Watch on Paramount+", color: "#0064ff" },
  "Max": { url: "https://max.com/?ref=PLACEHOLDER", label: "Watch on Max", color: "#002be7" },
  "truTV": { url: "https://max.com/?ref=PLACEHOLDER", label: "Watch on Max", color: "#002be7" },
  "Sling TV": { url: "https://sling.com/?ref=PLACEHOLDER", label: "Watch on Sling", color: "#1428a0" },
  "fuboTV": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "YouTube TV": { url: "https://tv.youtube.com/?ref=PLACEHOLDER", label: "Watch on YouTube TV", color: "#f00" },
  "DirecTV": { url: "https://directv.com/?ref=PLACEHOLDER", label: "Watch on DirecTV", color: "#00a9e0" },
  "Netflix": { url: "https://netflix.com/?ref=PLACEHOLDER", label: "Watch on Netflix", color: "#e50914" },
  "Fox": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "Fox Sports 1": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "Fox Sports 2": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "FS1": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "FS2": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "NBA TV": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "NBA League Pass": { url: "https://nba.com/leaguepass/?ref=PLACEHOLDER", label: "Watch on NBA LP", color: "#1d428a" },
  "NFL Network": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "NFL+": { url: "https://nfl.com/plus/?ref=PLACEHOLDER", label: "Watch on NFL+", color: "#013369" },
  "NHL Network": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "MLB Network": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "Golf Channel": { url: "https://peacocktv.com/?ref=PLACEHOLDER", label: "Watch on Peacock", color: "#000" },
  "Tennis Channel": { url: "https://fubo.tv/?ref=PLACEHOLDER", label: "Watch on FuboTV", color: "#e87722" },
  "DAZN": { url: "https://dazn.com/?ref=PLACEHOLDER", label: "Watch on DAZN", color: "#ffd200" },
};

/**
 * Tracks affiliate link clicks for analytics
 */
export function trackAffiliateClick(channel: string, gameId: string) {
  console.log(`[Affiliate Click] ${channel} | Game: ${gameId} | ${new Date().toISOString()}`);
  // TODO: Add real analytics tracking (Google Analytics, Mixpanel, etc.)
}

/**
 * Gets the affiliate config for a channel, or null if none exists
 */
export function getAffiliateConfig(channel: string): AffiliateConfig | null {
  return AFFILIATE_LINKS[channel] ?? null;
}
