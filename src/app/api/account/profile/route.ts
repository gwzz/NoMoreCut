import { handleApiError, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validations/profile";
import { updateUserProfile } from "@/services/user-service";

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const input = profileSchema.parse(await request.json());
    return ok(await updateUserProfile(user, input));
  } catch (error) {
    return handleApiError(error);
  }
}
