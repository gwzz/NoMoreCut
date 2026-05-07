import { z } from "zod";
import { TRANSACTION_TYPES } from "@/lib/constants";
import {
  isoDateString,
  nonEmptyString,
  optionalNonNegativeNumber,
  optionalText,
  positiveNumber
} from "@/lib/validations/common";

export const investmentSchema = z.object({
  assetId: nonEmptyString,
  type: z.enum(TRANSACTION_TYPES),
  tradeDate: isoDateString,
  amount: positiveNumber,
  quantity: optionalNonNegativeNumber,
  price: optionalNonNegativeNumber,
  fee: optionalNonNegativeNumber,
  note: optionalText
});

export type InvestmentInput = z.infer<typeof investmentSchema>;
