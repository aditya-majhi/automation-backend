import { Request, Response } from "express";
import * as setupService from "../services/setup.service";

export async function checkSetupStatus(req: Request, res: Response): Promise<void> {
  try {
    const required = await setupService.isSetupRequired();
    res.json({
      success: true,
      data: {
        setupRequired: required,
        message: required
          ? "No admin exists. Please complete setup."
          : "Setup already completed.",
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function setupAdmin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;
    const result = await setupService.setupAdmin(email, password, name);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message.includes("already completed")
      ? 403
      : error.message.includes("already exists")
        ? 409
        : 400;
    res.status(status).json({ success: false, message: error.message });
  }
}