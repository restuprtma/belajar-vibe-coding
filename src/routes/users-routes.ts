import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/users-services";

export const usersRoutes = new Elysia({ prefix: "/api/users" })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await registerUser(body);
        return result;
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }), // Opsional: gunakan format email
        password: t.String(),
      }),
    }
  )
  .post(
    "/loginx",
    async ({ body, set }) => {
      try {
        const result = await loginUser(body);
        return result;
      } catch (error: any) {
        set.status = 401; // Unauthorized
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .get(
    "/current",
    async ({ headers, set }) => {
      try {
        const authHeader = headers.authorization;
        const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
        
        const result = await getCurrentUser(token);
        return result;
      } catch (error: any) {
        set.status = 401; // Unauthorized
        return { error: "Unauthorize" };
      }
    }
  );
