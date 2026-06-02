import { Request, Response } from "express";
import { z } from "zod";
import authService from "../service/service";
import { type AuthenticatedRequest } from "../.././../middleware/userAuth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { name, email, password } = result.data;
    try {
      const data = await authService.register(name, email, password);
      res.status(201).json(data);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Registration failed" });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { email, password } = result.data;
    try {
      const data = await authService.login(email, password);
      res.json(data);
    } catch (err) {
      res.status(401).json({ error: err instanceof Error ? err.message : "Login failed" });
    }
  };

  getMe = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req as AuthenticatedRequest;
    const user = await authService.getMe(userId!);
    res.json(user);
  };
}

export default new AuthController();
