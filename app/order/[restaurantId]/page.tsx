import { getAgentIdFromActiveOrganization } from "@/lib/actions/agent";
import VoiceChat from "./voice";
import { getRestaurant } from "@/lib/actions/restaurant";

export default async function ChatPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;

  const restaurant = await getRestaurant(restaurantId);
  const agentId = await getAgentIdFromActiveOrganization();

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 md:p-6">
      <div className="max-w-md w-full">
        <VoiceChat restaurant={restaurant} agentId={agentId} />
      </div>
    </div>
  );
}
