import { Prisma } from "@prisma/client";

export interface ItemCalculationInput {
  unitPrice: number;
  quantity: number;
  discount?: number;
  tax?: number;
}

export interface CalculatedQuotationTotals {
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  items: Array<{
    unitPrice: number;
    quantity: number;
    discount: number;
    tax: number;
    totalPrice: number;
  }>;
}

export function calculateQuotationTotals(
  rawItems: ItemCalculationInput[]
): CalculatedQuotationTotals {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const calculatedItems = rawItems.map((item) => {
    const uPrice = Math.max(0, item.unitPrice || 0);
    const qty = Math.max(1, item.quantity || 1);
    const disc = Math.max(0, item.discount || 0);
    const tx = Math.max(0, item.tax || 0);

    const lineSubtotal = uPrice * qty;
    const lineTotal = Math.max(0, lineSubtotal - disc + tx);

    subtotal += lineSubtotal;
    totalDiscount += disc;
    totalTax += tx;

    return {
      unitPrice: uPrice,
      quantity: qty,
      discount: disc,
      tax: tx,
      totalPrice: lineTotal,
    };
  });

  const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(totalDiscount.toFixed(2)),
    tax: Number(totalTax.toFixed(2)),
    totalAmount: Number(grandTotal.toFixed(2)),
    items: calculatedItems,
  };
}

export function formatQuotationResponse(quotation: any) {
  if (!quotation) return null;

  const decimalToNum = (val: any) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "number") return val;
    if (val instanceof Prisma.Decimal) return val.toNumber();
    return Number(val) || 0;
  };

  return {
    ...quotation,
    subtotal: decimalToNum(quotation.subtotal),
    discount: decimalToNum(quotation.discount),
    tax: decimalToNum(quotation.tax),
    totalAmount: decimalToNum(quotation.totalAmount),
    items: quotation.items?.map((item: any) => ({
      ...item,
      unitPrice: decimalToNum(item.unitPrice),
      discount: decimalToNum(item.discount),
      tax: decimalToNum(item.tax),
      totalPrice: decimalToNum(item.totalPrice),
    })),
  };
}
