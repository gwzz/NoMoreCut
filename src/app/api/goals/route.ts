import { created, handleApiError, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { goalSchema } from "@/lib/validations/goal";
import { getGoalProgress } from "@/services/analytics-service";
import { createGoal } from "@/services/goal-service";

export async function GET() {
  try {
    const user = await requireApiUser();
    return ok(await getGoalProgress(user.id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = goalSchema.parse(await request.json());
    return created(await createGoal(user.id, input));
  } catch (error) {
    return handleApiError(error);
  }
}
