import axios from 'axios';

export async function fetchDiscordUser(code) {
  const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URL, 
  } = process.env;

  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URL) {
    const err = new Error('Discord OAuth env variables not configured');
    err.statusCode = 500;
    throw err;
  }
  const tokenResponse = await axios.post(
    "https://discord.com/api/oauth2/token",
    new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URL,
    }).toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const accessToken = tokenResponse.data.access_token;
  if (!accessToken) {
    const err = new Error('Failed to obtain Discord access token');
    err.statusCode = 400;
    throw err;
  }

  // Fetch user
  const userResponse = await axios.get("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const { id, username, email, avatar } = userResponse.data;

  return {
    provider: "discord",
    providerId: id?.toString(),
    name: username || null,
    email: email || null,
    avatar: avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` : null,
  };
}
