import { UserSchema } from "@jogo-do-bixo/schema";
import { Elysia } from "elysia";
import { dbPlugin } from "../../plugins/db";
import { loggerPlugin } from "../../plugins/logger";
import { UserService } from "./users.service";

export const userRoutes = new Elysia({ prefix: "/users", tags: ["User"] })
  .use(loggerPlugin)
  .use(dbPlugin)
  .derive(({ db, logger }) => ({
    userService: new UserService(logger, db),
  }))
  .get("/:id", async ({ params, userService, status }) => {
    return (await userService.findById(params.id)) ?? status(404);
  })
  .post(
    "/",
    async ({ body, set, userService }) => {
      const newUser = await userService.create(body);
      set.status = 201;
      return newUser;
    },
    {
      body: UserSchema,
    },
  );
