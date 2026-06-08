import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../../../../config/db/models/UserModel";
import logger from "../../../../utils/logger";
import { sendWelcomeEmail } from "../../../../utils/services/mailgun";

const JWT_SECRET = process.env.JWT_SECRET!;

const signToken = (userId: string, plan: string) =>
  jwt.sign({ userId, plan }, JWT_SECRET, { expiresIn: "7d" });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeUser = (user: { _id: unknown; name: string; email: string; plan: string; credits?: number; stats?: any }) => ({
  _id:     user._id,
  name:    user.name,
  email:   user.email,
  plan:    user.plan,
  credits: user.credits ?? 0,
  stats:   user.stats ?? {}, // always include stats so the client never receives a zeroed default
});

// Pre-computed bcrypt hash used for constant-time comparison when a user is not
// found, preventing email enumeration via response-time differences. The value
// is a real cost-12 hash so bcrypt.compare takes the same ~300 ms.
const DUMMY_HASH = "$2b$12$R5GSP7n3wqlhzxfQmBhGdOiMPzNLwBl7rIYtDw75Rs1pjzMAbjrhi";

class AuthService {
  register = async (name: string, email: string, password: string) => {
    const hash = await bcrypt.hash(password, 12);

    let user;
    try {
      user = await UserModel.create({ name, email, password: hash });
    } catch (err: unknown) {
      // Duplicate key — handles the race between findOne and create
      if ((err as { code?: number }).code === 11000) throw new Error("Email already in use");
      throw err;
    }

    logger.info({ userId: user._id }, "[AuthService]: New user registered");

    // Fire-and-forget — welcome email must never block or fail registration.
    // Skip in non-production so dev/test runs don't spam Mailgun sandbox limits.
    if (process.env.NODE_ENV === "production") {
      sendWelcomeEmail({ email: user.email, name: user.name });
    }

    return { token: signToken(user._id.toString(), user.plan), user: safeUser(user) };
  };

  login = async (email: string, password: string) => {
    const user = await UserModel.findOne({ email });

    // Always run bcrypt to prevent timing-based email enumeration
    const valid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
    if (!user || !valid) throw new Error("Invalid credentials");

    logger.info({ userId: user._id }, "[AuthService]: User logged in");
    return { token: signToken(user._id.toString(), user.plan), user: safeUser(user) };
  };

  getMe = async (userId: string) => {
    const user = await UserModel.findById(userId).select("-password");
    if (!user) throw new Error("User not found");
    return user;
  };
}

export default new AuthService();
