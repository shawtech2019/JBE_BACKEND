import crypto from "crypto";

import {
  findActiveLeaseByTenant,
  findLeaseByIdAndTenant,
  updateAutoPay,
} from "../repositories/lease.repository.js";

import {
  createPayment,
  findPaymentById,
  findPaymentHistory,
  findRecentPayments,
  getPaidTotal,
} from "../repositories/payment.repository.js";

import { ApiError } from "../utils/api-error.js";

export async function getPaymentDashboard(tenantId) {
  const lease = await findActiveLeaseByTenant(tenantId);

  if (!lease) {
    throw new ApiError(404, "No active lease found");
  }

  const totalPaid = await getPaidTotal(tenantId, lease.id);

  const payments = await findRecentPayments(tenantId, 10);

  return {
    lease: {
      id: lease.id,

      apartment: lease.apartment,

      unit: lease.unit,

      monthlyRent: Number(lease.monthlyRent),

      autoPayEnabled: Boolean(lease.autoPayEnabled),
    },

    totalPaid,

    recentTransactions: payments.map((payment) => ({
      id: payment.id,

      amount: Number(payment.amount),

      currency: payment.currency,

      method: payment.paymentMethod,

      status: payment.status,

      description: payment.description,

      paidAt: payment.paidAt,

      createdAt: payment.createdAt,
    })),
  };
}

export async function getHistory(tenantId) {
  const payments = await findPaymentHistory(tenantId);

  return payments.map((payment) => ({
    id: payment.id,

    leaseId: payment.leaseId,

    amount: Number(payment.amount),

    currency: payment.currency,

    paymentMethod: payment.paymentMethod,

    status: payment.status,

    description: payment.description,

    provider: payment.provider,

    providerReference: payment.providerReference,

    paidAt: payment.paidAt,

    createdAt: payment.createdAt,
  }));
}

export async function initiatePayment(tenantId, data) {
  const lease = await findLeaseByIdAndTenant(data.leaseId, tenantId);

  if (!lease) {
    throw new ApiError(404, "Lease not found");
  }

  if (lease.status !== "ACTIVE") {
    throw new ApiError(
      400,
      "Payments can only be made against an active lease"
    );
  }

  const idempotencyKey = crypto.randomUUID();

  const paymentId = await createPayment({
    tenantId,

    leaseId: data.leaseId,

    amount: data.amount,

    currency: data.currency.toUpperCase(),

    paymentMethod: data.paymentMethod,

    description: data.description,

    idempotencyKey,
  });

  return {
    paymentId,

    status: "PENDING",

    idempotencyKey,
  };
}

export async function getPayment(tenantId, paymentId) {
  const payment = await findPaymentById(paymentId, tenantId);

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  return {
    ...payment,

    amount: Number(payment.amount),
  };
}

export async function setAutoPay(tenantId, enabled) {
  const lease = await findActiveLeaseByTenant(tenantId);

  if (!lease) {
    throw new ApiError(404, "No active lease found");
  }

  await updateAutoPay(lease.id, tenantId, enabled);

  return {
    enabled,
  };
}
