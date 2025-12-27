import { getRestaurants } from "@/lib/actions/restaurant";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const restaurants = await getRestaurants();

  if (restaurants.length === 0) {
    redirect("/create");
  }

  return <div>Dashboard</div>;
}
