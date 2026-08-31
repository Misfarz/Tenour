import { Prisma } from "@prisma/client";

export function formatPurchaseOrderResponse(po: any) {
  if (!po) return null;

  const decimalToNum = (val: any) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "number") return val;
    if (val instanceof Prisma.Decimal) return val.toNumber();
    return Number(val) || 0;
  };

  return {
    ...po,
    subtotal: decimalToNum(po.subtotal),
    discount: decimalToNum(po.discount),
    tax: decimalToNum(po.tax),
    totalAmount: decimalToNum(po.totalAmount),
    items: po.items?.map((item: any) => ({
      ...item,
      unitPrice: decimalToNum(item.unitPrice),
      discount: decimalToNum(item.discount),
      tax: decimalToNum(item.tax),
      totalPrice: decimalToNum(item.totalPrice),
    })),
  };
}

export function isValidPoStatusTransition(currentStatus: string, targetStatus: string): boolean {
  const allowedTransitions: Record<string, string[]> = {
    DRAFT: ["SENT", "CANCELLED"],
    SENT: ["ACKNOWLEDGED", "REJECTED", "CANCELLED"],
    ACKNOWLEDGED: ["COMPLETED"],
    REJECTED: [],
    CANCELLED: [],
    COMPLETED: [],
  };

  return allowedTransitions[currentStatus]?.includes(targetStatus) || false;
}
