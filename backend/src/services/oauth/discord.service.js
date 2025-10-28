import axios from 'axios';

export async function fetchDiscordUser(code) {
  const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URL } = process.env;

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: DISCORD_REDIRECT_URL,
  });

  const tokenResponse = await axios.post(
    "https://discord.com/api/oauth2/token",
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const accessToken = tokenResponse.data.access_token;

  const userResponse = await axios.get("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const { id, username, email, avatar } = userResponse.data;

  return {
    provider: "discord",
    providerId: String(id),
    name: username || 'Discord User',
    email: email || null,
    avatar: avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` : null,
  };
}
