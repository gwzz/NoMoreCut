import { z } from "zod";
import { nonEmptyString, optionalText } from "@/lib/validations/common";

export const categorySchema = z.object({
  name: nonEmptyString,
  color: optionalText,
  description: optionalText
});

export type CategoryInput = z.infer<typeof categorySchema>;
