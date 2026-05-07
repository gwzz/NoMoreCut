import { z } from "zod";

export const nonEmptyString = z.string().trim().min(1, "不能为空");

export const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const positiveNumber = z.coerce.number().positive("必须大于 0");

export const nonNegativeNumber = z.coerce.number().min(0, "不能小于 0");

export const optionalNonNegativeNumber = z
  .union([z.literal(""), z.coerce.number().min(0, "不能小于 0")])
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const isoDateString = z
  .string()
  .min(1, "请选择日期")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "日期无效");
