import { handleApiError, noContent, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { goalSchema } from "@/lib/validations/goal";
import { deleteGoal, updateGoal } from "@/services/goal-service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const input = goalSchema.parse(await request.json());
    return ok(await updateGoal(user.id, id, input));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    await deleteGoal(user.id, id);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
