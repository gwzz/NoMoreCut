import { handleApiError, noContent, ok } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { investmentSchema } from "@/lib/validations/investment";
import { deleteInvestment, updateInvestment } from "@/services/investment-service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const input = investmentSchema.parse(await request.json());
    return ok(await updateInvestment(user.id, id, input));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    await deleteInvestment(user.id, id);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
