export async function onRequestGet(context) {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  try {
    const hash = await context.env.HOMOS_KV.get('password_hash');
    return new Response(JSON.stringify({ hasPassword: hash !== null }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ hasPassword: false }), { headers });
  }
}
