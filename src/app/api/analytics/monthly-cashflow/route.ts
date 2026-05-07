import { handleApiError, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { baseAnalyticsYear } from "@/lib/constants";
import { getMonthlyCashflow } from "@/services/analytics-service";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get("year") ?? baseAnalyticsYear);
    return ok(await getMonthlyCashflow(user.id, Number.isFinite(year) ? year : baseAnalyticsYear));
  } catch (error) {
    return handleApiError(error);
  }
}
