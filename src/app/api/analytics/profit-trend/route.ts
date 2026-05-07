import { handleApiError, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { getProfitTrend } from "@/services/analytics-service";

export async function GET() {
  try {
    const user = await requireApiUser();
    return ok(await getProfitTrend(user.id));
  } catch (error) {
    return handleApiError(error);
  }
}
