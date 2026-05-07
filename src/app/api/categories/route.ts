import { created, handleApiError, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { categorySchema } from "@/lib/validations/category";
import { createCategory, listCategories } from "@/services/category-service";

export async function GET() {
  try {
    const user = await requireApiUser();
    return ok(await listCategories(user.id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = categorySchema.parse(await request.json());
    return created(await createCategory(user.id, input));
  } catch (error) {
    return handleApiError(error);
  }
}
