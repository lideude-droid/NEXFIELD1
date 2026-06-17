export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: 'No code' });

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.REDIRECT_URI,
  });

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return res.status(400).json({ error: 'Failed to get token' });

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const user = await userRes.json();

  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || 0) % 5}.png`;

  res.redirect(`/?user=${encodeURIComponent(user.global_name || user.username)}&avatar=${encodeURIComponent(avatar)}`);
}
