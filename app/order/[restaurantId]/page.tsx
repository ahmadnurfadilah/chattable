import { getAgentIdFromRestaurantId } from "@/lib/actions/agent";
import VoiceChat from "./voice";
import { getRestaurant } from "@/lib/actions/restaurant";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default async function ChatPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;

  const restaurant = await getRestaurant(restaurantId);
  const agentId = await getAgentIdFromRestaurantId(restaurantId);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 md:p-6">
      <DottedGlowBackground
        className="pointer-events-none mask-radial-to-90% mask-radial-at-center"
        opacity={0.3}
        gap={10}
        radius={1.5}
        colorLightVar="--color-neutral-500"
        glowColorLightVar="--color-neutral-600"
        colorDarkVar="--color-neutral-500"
        glowColorDarkVar="--color-sky-800"
        backgroundOpacity={0}
        speedMin={0.3}
        speedMax={1.6}
        speedScale={1}
      />

      <div className="max-w-md w-full relative z-10">
        <VoiceChat restaurant={restaurant} agentId={agentId} />
      </div>
    </div>
  );
}
