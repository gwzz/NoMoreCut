import { z } from "zod";
import { isoDateString, nonEmptyString, positiveNumber } from "@/lib/validations/common";

export const goalSchema = z
  .object({
    name: nonEmptyString,
    startDate: isoDateString,
    targetDate: isoDateString,
    targetAmount: positiveNumber
  })
  .refine((value) => new Date(value.targetDate) > new Date(value.startDate), {
    message: "目标日期必须晚于开始日期",
    path: ["targetDate"]
  });

export type GoalInput = z.infer<typeof goalSchema>;
