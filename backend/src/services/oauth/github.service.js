import axios from 'axios';

export async function fetchGitHubUser(code) {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: "application/json" } }
  );

  const accessToken = tokenResponse.data.access_token;
  if (!accessToken) {
    const err = new Error('Failed to get GitHub access token');
    err.statusCode = 400;
    throw err;
  }

  const userResponse = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const { id, name, email, avatar_url } = userResponse.data;

  let userEmail = email;
  if (!userEmail) {
    const emailsResponse = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const primary = emailsResponse.data.find((e) => e.primary && e.verified);
    userEmail = primary ? primary.email : null;
  }

  return {
    provider: "github",
    providerId: id?.toString(),
    name: name || null,
    email: userEmail,
    avatar: avatar_url || null,
  };
}
