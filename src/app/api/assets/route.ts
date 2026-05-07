import { created, handleApiError, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { assetSchema } from "@/lib/validations/asset";
import { createAsset, listAssets } from "@/services/asset-service";

export async function GET() {
  try {
    const user = await requireApiUser();
    return ok(await listAssets(user.id, { includeArchived: true }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = assetSchema.parse(await request.json());
    return created(await createAsset(user.id, input));
  } catch (error) {
    return handleApiError(error);
  }
}
