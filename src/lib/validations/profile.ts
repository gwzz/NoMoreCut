import { z } from "zod";

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(80, "显示名称不能超过 80 个字符")
    .transform((value) => (value ? value : null))
});

export type ProfileInput = z.infer<typeof profileSchema>;
