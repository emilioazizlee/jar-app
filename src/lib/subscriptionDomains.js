/**
 * Bundled domain map for top global subscriptions.
 * Used to auto-fill domain for Brandfetch logo fetching.
 */

export const SUBSCRIPTION_DOMAINS = {
  'Spotify': 'spotify.com',
  'Netflix': 'netflix.com',
  'Apple Music': 'apple.com',
  'YouTube Premium': 'youtube.com',
  'Disney+': 'disneyplus.com',
  'Disney Plus': 'disneyplus.com',
  'Amazon Prime': 'amazon.com',
  'HBO Max': 'max.com',
  'Hulu': 'hulu.com',
  'Twitch': 'twitch.tv',
  'Claude': 'anthropic.com',
  'ChatGPT': 'openai.com',
  'Gemini': 'google.com',
  'Notion': 'notion.so',
  'Figma': 'figma.com',
  'Adobe': 'adobe.com',
  'Microsoft 365': 'microsoft.com',
  'Google One': 'google.com',
  'iCloud': 'apple.com',
  'Dropbox': 'dropbox.com',
  'GitHub': 'github.com',
  'Vercel': 'vercel.com',
  'Cloudflare': 'cloudflare.com',
  'Revolut': 'revolut.com',
  'Wise': 'wise.com',
  'Audible': 'audible.com',
  'Kindle Unlimited': 'amazon.com',
  'Calm': 'calm.com',
  'Headspace': 'headspace.com',
  'Duolingo': 'duolingo.com',
  'Strava': 'strava.com',
  'Peloton': 'onepeloton.com',
  'MyFitnessPal': 'myfitnesspal.com',
  'NordVPN': 'nordvpn.com',
  'ExpressVPN': 'expressvpn.com',
  'ProtonVPN': 'protonvpn.com',
  'YouTube': 'youtube.com',
  'Apple TV+': 'tv.apple.com',
  'Paramount+': 'paramountplus.com',
  'ESPN+': 'espnplus.com',
  'Tidal': 'tidal.com',
  'Deezer': 'deezer.com',
  'LastPass': 'lastpass.com',
  '1Password': '1password.com',
  'Dashlane': 'dashlane.com',
  'LinkedIn Premium': 'linkedin.com',
  'Canva': 'canva.com',
  'Grammarly': 'grammarly.com',
  'Superhuman': 'superhuman.com',
  'Readwise': 'readwise.io',
};

export const BUNDLED_SUBSCRIPTION_NAMES = Object.keys(SUBSCRIPTION_DOMAINS);

export function getDomainForSubscription(name) {
  if (!name) return null;
  const exact = SUBSCRIPTION_DOMAINS[name];
  if (exact) return exact;
  // Case-insensitive lookup
  const lower = name.toLowerCase();
  for (const [key, domain] of Object.entries(SUBSCRIPTION_DOMAINS)) {
    if (key.toLowerCase() === lower) return domain;
  }
  return null;
}