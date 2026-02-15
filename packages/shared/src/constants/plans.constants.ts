export const BILLING_PERIODS = {
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
} as const;

export type BillingPeriod = keyof typeof BILLING_PERIODS;

export const PLAN_PRICES_XOF: Record<BillingPeriod, number> = {
  WEEKLY: 2000,
  MONTHLY: 5000,
  QUARTERLY: 12000,
};

export const PAYMENT_PROVIDERS = {
  WAVE: 'WAVE',
  ORANGE_MONEY: 'ORANGE_MONEY',
} as const;

export type PaymentProvider = keyof typeof PAYMENT_PROVIDERS;

export const SUBSCRIPTION_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
