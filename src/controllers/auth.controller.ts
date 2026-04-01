import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import * as passwordService from "../services/password.service";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, message: "email, password, and name are required" });
      return;
    }

    const result = await authService.register(email, password, name);
    res.status(201).json({ success: true, token: result.token, user: result.user });
  } catch (error: any) {
    const status = error.message.includes("already exists") ? 409 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "email and password are required" });
      return;
    }

    const result = await authService.login(email, password);
    res.status(200).json({ success: true, token: result.token, user: result.user });
  } catch (error: any) {
    const status = error.message.includes("Invalid credentials") ? 401
      : error.message.includes("deactivated") ? 403
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const result = await passwordService.generateResetToken(email);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: "token and newPassword are required",
      });
      return;
    }

    const result = await passwordService.resetPassword(token, newPassword);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message?.includes("Invalid or expired") ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};