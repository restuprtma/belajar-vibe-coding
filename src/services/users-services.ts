import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export const registerUser = async (payload: any) => {
  const { name, email, password } = payload;

  // Cek apakah email sudah terdaftar
  const existingUser = await db.select().from(users).where(eq(users.email, email));
  
  if (existingUser.length > 0) {
    throw new Error("email sudah terdaftar");
  }

  // Hash password menggunakan Bun.password
  const hashedPassword = await Bun.password.hash(password);

  // Simpan data user baru
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { data: "ok" };
};

export const loginUser = async (payload: any) => {
  const { email, password } = payload;

  // Cek apakah email ada
  const existingUser = await db.select().from(users).where(eq(users.email, email));
  
  if (existingUser.length === 0) {
    throw new Error("email atau password salah");
  }

  const user = existingUser[0];

  // Verifikasi password
  const isPasswordValid = await Bun.password.verify(password, user.password);

  if (!isPasswordValid) {
    throw new Error("email atau password salah");
  }

  // Buat token session
  const token = crypto.randomUUID();

  // Simpan session
  await db.insert(sessions).values({
    token,
    usersId: user.id,
  });

  return { data: token };
};

export const getCurrentUser = async (token?: string) => {
  if (!token) {
    throw new Error("Unauthorized");
  }

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.usersId, users.id))
    .where(eq(sessions.token, token));

  if (result.length === 0) {
    throw new Error("Unauthorized");
  }

  const user = result[0];

  return {
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.createdAt,
    },
  };
};

export const logoutUser = async (token?: string) => {
  if (!token) {
    throw new Error("Unauthorized");
  }

  // Idempotent delete (optimasi 1 hit database)
  await db.delete(sessions).where(eq(sessions.token, token));

  return { data: "ok" };
};
