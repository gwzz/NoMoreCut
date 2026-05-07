import { handleApiError, noContent, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { assetSchema } from "@/lib/validations/asset";
import { deleteAsset, updateAsset } from "@/services/asset-service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const input = assetSchema.parse(await request.json());
    return ok(await updateAsset(user.id, id, input));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    await deleteAsset(user.id, id);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
