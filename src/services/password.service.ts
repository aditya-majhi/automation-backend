import prisma from "../config/database";
import bcrypt from "bcrypt";
import crypto from "crypto";

const RESET_TOKEN_EXPIRY_HOURS = 1;

/**
 * Generate a password reset token for a user.
 * Returns the token (to be sent via email in production).
 */
export async function generateResetToken(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal whether email exists — return success regardless
    return { message: "If this email exists, a reset token has been generated." };
  }

  if (!user.isActive) {
    return { message: "If this email exists, a reset token has been generated." };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    },
  });

  // In production, send this token via email.
  // For development, we return it directly.
  return {
    message: "If this email exists, a reset token has been generated.",
    // Remove the line below in production — only for dev/testing
    token,
    expiresAt: expires.toISOString(),
  };
}

/**
 * Reset the password using a valid token.
 */
export async function resetPassword(token: string, newPassword: string) {
  if (!token || !newPassword) {
    throw new Error("Token and new password are required");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return { message: "Password reset successfully" };
}