import User from "../models/User.js";
import { generateToken } from "../utils/helpers.js";

export async function handleOAuthUser(provider, profile) {
  const { email, name, avatar, providerId } = profile;

  if (!email) {
    const error = new Error("Email not provided by OAuth provider");
    error.statusCode = 400;
    throw error;
  }
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: name || `${provider} User`,
      email,
      avatar,
      provider,
      providerId,
      isOAuth: true,
    });
  } else {
    const needsUpdate =
      user.provider !== provider || !user.providerId || user.providerId !== String(providerId);

    if (needsUpdate) {
      user.provider = provider;
      user.providerId = providerId ? String(providerId) : user.providerId;
      user.avatar = user.avatar || avatar;
      user.isOAuth = true;
      await user.save();
    }
  }

  const token = generateToken(user);
  return { user: user.toJSON(), token };
}
