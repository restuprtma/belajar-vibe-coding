import { db } from "../db";
import { users } from "../db/schema";
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
