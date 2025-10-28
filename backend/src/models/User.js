import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },

  provider: { type: String, enum: ['local', 'github', 'discord'], default: 'local' },
  providerId: { type: String, index: true, sparse: true },
  avatar: { type: String },

  isOAuth: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};


export default mongoose.models.User || mongoose.model('User', userSchema);