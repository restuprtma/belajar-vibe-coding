import { Elysia, t } from "elysia";
import { registerUser } from "../services/users-services";

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
  );
