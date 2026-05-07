import { handleApiError, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { getDashboardSummary } from "@/services/portfolio-service";

export async function GET() {
  try {
    const user = await requireApiUser();
    return ok(await getDashboardSummary(user.id));
  } catch (error) {
    return handleApiError(error);
  }
}
