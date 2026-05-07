import { created, handleApiError, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { investmentSchema } from "@/lib/validations/investment";
import { createInvestment, listInvestments } from "@/services/investment-service";

export async function GET() {
  try {
    const user = await requireApiUser();
    return ok(await listInvestments(user.id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = investmentSchema.parse(await request.json());
    return created(await createInvestment(user.id, input));
  } catch (error) {
    return handleApiError(error);
  }
}
