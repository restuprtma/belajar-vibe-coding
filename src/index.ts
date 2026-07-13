import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";
import { usersRoutes } from "./routes/users-routes";

const app = new Elysia()
  .use(usersRoutes)
  .get("/", () => "Hello World")
  .get("/users", async () => {
    // This will error if the database is not set up, but serves as a test endpoint
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      return { error: "Failed to fetch users. Make sure DB is running and migrated." };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
