import { handleRoute, ok } from "@/lib/api";
import { providerRepository } from "@/repositories/provider.repository";

export async function GET() {
  return handleRoute(async () => {
    const cities = await providerRepository.listCities();
    return ok(cities.map((c) => c.city));
  });
}
