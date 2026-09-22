import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { findTenantByEmail } from "../repositories/tenant.repository.js";

import { env } from "../config/env.js";

import { ApiError } from "../utils/api-error.js";

export async function login(email, password) {
  const tenant = await findTenantByEmail(email);

  if (!tenant) {
    throw new ApiError(401, "Invalid email or password");
  }

  const validPassword = await bcrypt.compare(password, tenant.passwordHash);

  if (!validPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: tenant.id,
      email: tenant.email,
      role: tenant.role,
    },

    env.JWT_SECRET,

    {
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );

  return {
    token,

    user: {
      id: tenant.id,

      email: tenant.email,

      firstName: tenant.firstName,

      lastName: tenant.lastName,

      fullName: `${tenant.firstName} ${tenant.lastName}`,

      role: tenant.role,
    },
  };
}
