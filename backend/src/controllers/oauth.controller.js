import { fetchGithubUser } from "../services/oauth/github.service.js";
import { fetchDiscordUser } from "../services/oauth/discord.service.js";
import { handleOAuthUser } from "../services/oauth.service.js";

export const githubCallback = async (req, res, next) => {
  try {
    const { code } = req.body;
    const profile = await fetchGithubUser(code);
    const { user, token } = await handleOAuthUser("github", profile);
    res.json({ user, token });
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

export const discordCallback = async (req, res, next) => {
  try {
    const { code } = req.body;
    const profile = await fetchDiscordUser(code);
    const { user, token } = await handleOAuthUser("discord", profile);
    res.json({ user, token });
  } catch (err) {
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};
