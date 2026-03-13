import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const createUser = async (userData) => {
  const parsedData = userSchema.parse(userData);
  const user = await prisma.user.create({
    data: {
      email: parsedData.email,
      password: parsedData.password, // Ensure to hash this before saving
      name: parsedData.name,
    },
  });
  return user;
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user;
};

export const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};