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

class AuthService {
  register = async (name: string, email: string, password: string) => {
    const existing = await UserModel.findOne({ email });
    if (existing) throw new Error("Email already in use");

    const hash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, password: hash });

    logger.info({ userId: user._id }, "[AuthService]: New user registered");

    // Fire-and-forget — welcome email must never block or fail registration
    sendWelcomeEmail({ email: user.email, name: user.name });

    return { token: signToken(user._id.toString(), user.plan), user: safeUser(user) };
  };

  login = async (email: string, password: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

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
