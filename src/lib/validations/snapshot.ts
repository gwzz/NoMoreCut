import { z } from "zod";
import {
  isoDateString,
  optionalText,
  positiveNumber,
  nonNegativeNumber
} from "@/lib/validations/common";

export const snapshotSchema = z.object({
  snapshotDate: isoDateString,
  totalValue: positiveNumber,
  principal: nonNegativeNumber,
  profit: z.coerce.number(),
  roi: z.coerce.number(),
  note: optionalText
});

export type SnapshotInput = z.infer<typeof snapshotSchema>;
