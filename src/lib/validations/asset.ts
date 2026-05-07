import { z } from "zod";
import { STRATEGY_ROLES } from "@/lib/constants";
import {
  nonEmptyString,
  optionalNonNegativeNumber,
  optionalText
} from "@/lib/validations/common";

export const assetSchema = z.object({
  name: nonEmptyString,
  symbol: optionalText,
  categoryId: nonEmptyString,
  strategyRole: z.enum(STRATEGY_ROLES),
  estimatedValue: optionalNonNegativeNumber,
  targetWeight: optionalNonNegativeNumber,
  note: optionalText,
  isArchived: z.boolean().optional()
});

export type AssetInput = z.infer<typeof assetSchema>;
