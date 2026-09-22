import { ZodError } from "zod";

import { ApiError } from "../utils/api-error";

export function errorMiddleware(error, req, res, next) {
  console.error(error);

  /*
   * ZOD VALIDATION ERROR
   */

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,

      message: "Validation failed",

      errors: error.flatten(),
    });

    return;
  }

  /*
   * APPLICATION ERROR
   */

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  /*
   * MYSQL DUPLICATE ENTRY
   */

  if (error?.code === "ER_DUP_ENTRY") {
    res.status(409).json({
      success: false,
      message: "A record with the same information already exists",
    });

    return;
  }

  /*
   * UNKNOWN ERROR
   */

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
