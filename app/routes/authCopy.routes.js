import { Router } from "express";

import { loginController } from "../controllers/auth.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import { loginSchema } from "../schemas/auth.schema.js";

import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post(
  "/login",

  validate(loginSchema),

  asyncHandler(loginController)
);

export default router;
