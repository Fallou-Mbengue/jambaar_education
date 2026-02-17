export declare const BILLING_PERIODS: {
    readonly WEEKLY: "WEEKLY";
    readonly MONTHLY: "MONTHLY";
    readonly QUARTERLY: "QUARTERLY";
};
export type BillingPeriod = keyof typeof BILLING_PERIODS;
export declare const PLAN_PRICES_XOF: Record<BillingPeriod, number>;
export declare const PAYMENT_PROVIDERS: {
    readonly WAVE: "WAVE";
    readonly ORANGE_MONEY: "ORANGE_MONEY";
};
export type PaymentProvider = keyof typeof PAYMENT_PROVIDERS;
export declare const SUBSCRIPTION_STATUS: {
    readonly PENDING: "PENDING";
    readonly ACTIVE: "ACTIVE";
    readonly EXPIRED: "EXPIRED";
    readonly CANCELLED: "CANCELLED";
};
export declare const PAYMENT_STATUS: {
    readonly PENDING: "PENDING";
    readonly SUCCESS: "SUCCESS";
    readonly FAILED: "FAILED";
    readonly REFUNDED: "REFUNDED";
};
//# sourceMappingURL=plans.constants.d.ts.map