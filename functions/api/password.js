export async function onRequestGet(context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  try {
    const hash = await context.env.HOMOS_KV.get('password_hash');
    return new Response(JSON.stringify({ hasPassword: hash !== null }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ hasPassword: false }), { headers });
  }
}

async function hashPassword(pw) {
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', encoder.encode(pw));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (context.request.method === 'OPTIONS') return new Response(null, { headers });
  try {
    const { password, newPassword } = await context.request.json();
    const hash = await context.env.HOMOS_KV.get('password_hash');

    if (hash) {
      if (!password || await hashPassword(password) !== hash)
        return new Response(JSON.stringify({ error: 'Wrong password' }), { status: 401, headers });
      if (!newPassword || newPassword.length < 4)
        return new Response(JSON.stringify({ error: 'Password too short' }), { status: 400, headers });
      await context.env.HOMOS_KV.put('password_hash', await hashPassword(newPassword));
    } else {
      if (!password || password.length < 4)
        return new Response(JSON.stringify({ error: 'Password must be at least 4 characters' }), { status: 400, headers });
      await context.env.HOMOS_KV.put('password_hash', await hashPassword(password));
    }
    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
