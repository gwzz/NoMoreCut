import { handleApiError, noContent, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { categorySchema } from "@/lib/validations/category";
import { deleteCategory, updateCategory } from "@/services/category-service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const input = categorySchema.parse(await request.json());
    return ok(await updateCategory(user.id, id, input));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    await deleteCategory(user.id, id);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
