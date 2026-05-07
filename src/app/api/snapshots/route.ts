import { created, handleApiError } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { snapshotSchema } from "@/lib/validations/snapshot";
import { createSnapshot } from "@/services/snapshot-service";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = snapshotSchema.parse(await request.json());
    return created(await createSnapshot(user.id, input));
  } catch (error) {
    return handleApiError(error);
  }
}
