import React, { useState, useEffect } from 'react';

// Known domain mappings for common services
const KNOWN_DOMAINS = {
  'spotify':         'spotify.com',
  'netflix':         'netflix.com',
  'claude':          'anthropic.com',
  'claude pro':      'anthropic.com',
  'anthropic':       'anthropic.com',
  'revolut':         'revolut.com',
  'revolut metal':   'revolut.com',
  'youtube':         'youtube.com',
  'youtube premium': 'youtube.com',
  'apple music':     'apple.com',
  'prime video':     'primevideo.com',
  'amazon':          'amazon.com',
  'disney+':         'disneyplus.com',
  'hbo max':         'max.com',
  'chatgpt':         'openai.com',
  'chatgpt plus':    'openai.com',
  'openai':          'openai.com',
  'notion':          'notion.so',
  'dropbox':         'dropbox.com',
  'nordvpn':         'nordvpn.com',
  'expressvpn':      'expressvpn.com',
  'icloud':          'apple.com',
  'google one':      'google.com',
  'duolingo':        'duolingo.com',
  'cursor':          'cursor.sh',
  'canva':           'canva.com',
  'strava':          'strava.com',
  'twitch':          'twitch.tv',
  'xbox':            'xbox.com',
  'playstation':     'playstation.com',
  'minecraft':       'minecraft.net',
  'base44':          'base44.com',
  'perplexity':      'perplexity.ai',
};

function guessDomain(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  if (KNOWN_DOMAINS[lower]) return KNOWN_DOMAINS[lower];
  // Try the first word + .com
  const first = lower.split(/\s+/)[0];
  return first + '.com';
}

const LOGO_CACHE_KEY = 'jar_brand_logos_v1';

function getCache() {
  try { return JSON.parse(localStorage.getItem(LOGO_CACHE_KEY) || '{}'); } catch { return {}; }
}
function setCache(domain, value) {
  try {
    const c = getCache();
    c[domain] = value;
    localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(c));
  } catch {}
}

export default function BrandLogo({ name, size = 40, className = '' }) {
  const domain = guessDomain(name);
  const cacheKey = domain || '';
  const cached = getCache()[cacheKey];

  const [imgStatus, setImgStatus] = useState(cached !== undefined ? cached : 'loading');

  useEffect(() => {
    if (!domain) { setImgStatus('error'); return; }
    if (cached !== undefined) { setImgStatus(cached); return; }
    setImgStatus('loading');
  }, [domain]);

  const logoUrl = domain ? `https://cdn.brandfetch.io/${domain}/w/64/h/64` : null;
  // Always use first letter of the subscription NAME (not domain)
  const initial = name?.trim()?.[0]?.toUpperCase() || '?';

  if (!domain || imgStatus === 'error') {
    return (
      <div
        className={`rounded-xl flex items-center justify-center font-mono font-bold text-blue-400 bg-blue-500/10 flex-shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {initial}
      </div>
    );
  }

  return (
    <div className={`flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      {imgStatus !== 'error' && (
        <img
          src={logoUrl}
          alt={name}
          className="rounded-xl object-contain w-full h-full bg-white/5"
          onLoad={() => { setImgStatus('ok'); setCache(cacheKey, 'ok'); }}
          onError={() => { setImgStatus('error'); setCache(cacheKey, 'error'); }}
          style={{ display: imgStatus === 'loading' ? 'none' : 'block' }}
        />
      )}
      {imgStatus === 'loading' && (
        <div className="rounded-xl w-full h-full bg-muted animate-pulse" />
      )}
      {imgStatus === 'error' && (
        <div
          className="rounded-xl flex items-center justify-center font-mono font-bold text-blue-400 bg-blue-500/10 w-full h-full"
          style={{ fontSize: size * 0.35 }}
        >
          {initial}
        </div>
      )}
    </div>
  );
}