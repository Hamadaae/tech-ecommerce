import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config()

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(' Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
  process.exit(1);
}

(async function createAdmin() {
  try {
    await connectDB();

    let user = await User.findOne({ email: ADMIN_EMAIL });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, salt);

    if (user) {
      // Update existing admin
      user.name = ADMIN_NAME || user.name;
      user.password = hashed;
      user.role = 'admin';
      await user.save();
      console.log(`Admin updated: ${ADMIN_EMAIL}`);
    } else {
      // Create a new admin
      user = new User({
        name: ADMIN_NAME || 'Admin',
        email: ADMIN_EMAIL,
        password: hashed,
        role: 'admin'
      });
      await user.save();
      console.log(`Admin created: ${ADMIN_EMAIL}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('createAdmin error:', err.message);
    process.exit(1);
  }
})();