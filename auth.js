export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send('Sem código de autenticação.');

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: 'https://nexfield-1.vercel.app/api/auth',
  });

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return res.status(400).send('Erro ao obter token: ' + JSON.stringify(tokenData));
  }

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const user = await userRes.json();

  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.id) % 5}.png`;

  const name = user.global_name || user.username;

  res.redirect(`/?user=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}`);
}
