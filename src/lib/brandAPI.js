/**
 * Free brand lookup APIs — no keys required, CORS-friendly.
 */

const COUNTRY_FLAGS = {
  us: '🇺🇸', gb: '🇬🇧', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸', it: '🇮🇹',
  nl: '🇳🇱', be: '🇧🇪', ch: '🇨🇭', at: '🇦🇹', se: '🇸🇪', no: '🇳🇴',
  dk: '🇩🇰', fi: '🇫🇮', pt: '🇵🇹', pl: '🇵🇱', ru: '🇷🇺', cn: '🇨🇳',
  jp: '🇯🇵', kr: '🇰🇷', in: '🇮🇳', au: '🇦🇺', ca: '🇨🇦', br: '🇧🇷',
  mx: '🇲🇽', az: '🇦🇿',
};

function countryFlag(code) {
  if (!code) return '';
  return COUNTRY_FLAGS[code.toLowerCase()] || '';
}

async function queryOpenFoodFacts(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`;
  const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
  const json = await res.json();
  const seen = new Set();
  const results = [];
  for (const p of (json.products || [])) {
    const brand = (p.brands || '').split(',')[0].trim();
    if (!brand || seen.has(brand.toLowerCase())) continue;
    seen.add(brand.toLowerCase());
    results.push({
      name: brand,
      country: p.countries_tags?.[0]?.replace('en:', '') || '',
      countryFlag: countryFlag(p.countries_tags?.[0]?.replace('en:', '')),
      logo: p.image_small_url || p.image_url || '',
      website: '',
      source: 'open_food_facts',
    });
    if (results.length >= 5) break;
  }
  return results;
}

async function queryWikidata(query) {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&type=item&origin=*&limit=5`;
  const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
  const json = await res.json();
  const results = [];
  for (const item of (json.search || [])) {
    if (!item.label) continue;
    results.push({
      name: item.label,
      country: '',
      countryFlag: '',
      logo: '',
      website: '',
      source: 'wikidata',
      wikidataId: item.id,
    });
  }
  return results;
}

async function queryWikipedia(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&format=json&origin=*`;
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
  const json = await res.json();
  const titles = json[1] || [];
  return titles.map(t => ({
    name: t,
    country: '',
    countryFlag: '',
    logo: '',
    website: '',
    source: 'wikipedia',
  }));
}

export async function fetchBrandSuggestions(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const offResults = await queryOpenFoodFacts(query);
    if (offResults.length >= 3) return offResults;

    const wdResults = await queryWikidata(query);
    const combined = [...offResults, ...wdResults].slice(0, 5);
    if (combined.length >= 2) return combined;

    const wpResults = await queryWikipedia(query);
    return [...combined, ...wpResults].slice(0, 5);
  } catch {
    return [];
  }
}