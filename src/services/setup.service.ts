import prisma from "../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function isSetupRequired(): Promise<boolean> {
  const adminCount = await prisma.userRole.count({
    where: { role: "ADMIN" },
  });
  return adminCount === 0;
}

export async function setupAdmin(email: string, password: string, name: string) {
  const setupRequired = await isSetupRequired();
  if (!setupRequired) {
    throw new Error("Setup already completed. An admin already exists.");
  }

  if (!email || !password || !name) {
    throw new Error("email, password, and name are required");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      roles: {
        create: [{ role: "ADMIN" }],
      },
    },
    include: {
      roles: { select: { role: true } },
    },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "24h",
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map((r) => r.role),
    },
  };
}