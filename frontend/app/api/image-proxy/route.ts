// @fileoverview Same-origin image proxy to bypass SW/CORS issues for external images

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return new Response(JSON.stringify({ success: false, error: 'Missing url parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Resolve absolute or relative URLs against a configured backend base
    const configuredBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3003';
    let configuredHost = '';
    try {
      configuredHost = new URL(configuredBase).host;
    } catch {
      configuredHost = configuredBase.replace(/^https?:\/\//, '');
    }

    const allowedHosts = new Set<string>([
      'localhost:3001',
      'localhost:3002',
      'localhost:3003',
      configuredHost
    ].filter(Boolean));

    let finalUrl: URL;
    try {
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        finalUrl = new URL(targetUrl);
      } else {
        // Treat as relative path to backend
        const path = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
        finalUrl = new URL(path, configuredBase);
      }
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid url' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!allowedHosts.has(finalUrl.host)) {
      return new Response(JSON.stringify({ success: false, error: 'Host not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const upstream = await fetch(finalUrl.toString(), {
      // Avoid caching issues with service workers during dev
      cache: 'no-store',
      headers: {
        Accept: 'image/*'
      }
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(JSON.stringify({ success: false, error: 'Upstream fetch failed' }), {
        status: upstream.status || 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';

    // Stream through to the client
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Reasonable cache for images; adjust as needed
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
      }
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}



