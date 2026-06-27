export async function onRequestPost(context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (context.request.method === 'OPTIONS') return new Response(null, { headers });
  try {
    const { password } = await context.request.json();
    const hash = await context.env.HOMOS_KV.get('password_hash');
    if (!hash) return new Response(JSON.stringify({ ok: true, needsSetup: true }), { headers });
    const encoder = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', encoder.encode(password));
    const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    return new Response(JSON.stringify({ ok: hex === hash }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ ok: true, needsSetup: true }), { headers });
  }
}
