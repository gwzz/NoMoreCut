import { handleApiError, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { getAllocationData } from "@/services/analytics-service";

export async function GET() {
  try {
    const user = await requireApiUser();
    return ok(await getAllocationData(user.id));
  } catch (error) {
    return handleApiError(error);
  }
}
