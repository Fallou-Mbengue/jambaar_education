"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_STATUS = exports.SUBSCRIPTION_STATUS = exports.PAYMENT_PROVIDERS = exports.PLAN_PRICES_XOF = exports.BILLING_PERIODS = void 0;
exports.BILLING_PERIODS = {
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    QUARTERLY: 'QUARTERLY',
};
exports.PLAN_PRICES_XOF = {
    WEEKLY: 2000,
    MONTHLY: 5000,
    QUARTERLY: 12000,
};
exports.PAYMENT_PROVIDERS = {
    WAVE: 'WAVE',
    ORANGE_MONEY: 'ORANGE_MONEY',
};
exports.SUBSCRIPTION_STATUS = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED',
};
exports.PAYMENT_STATUS = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
};
//# sourceMappingURL=plans.constants.js.map