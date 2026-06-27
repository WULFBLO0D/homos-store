export async function onRequestGet(context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (context.request.method === 'OPTIONS') return new Response(null, { headers });
  try {
    const data = await context.env.HOMOS_KV.get('site_data', { type: 'json' });
    return new Response(JSON.stringify(data || {}), { headers });
  } catch (e) {
    return new Response('{}', { headers });
  }
}

export async function onRequestPost(context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (context.request.method === 'OPTIONS') return new Response(null, { headers });
  try {
    const { password, data } = await context.request.json();
    const hash = await context.env.HOMOS_KV.get('password_hash');
    if (!hash) return new Response(JSON.stringify({ error: 'No password set' }), { status: 400, headers });
    const encoder = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', encoder.encode(password));
    const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex !== hash) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    await context.env.HOMOS_KV.put('site_data', JSON.stringify(data));
    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
