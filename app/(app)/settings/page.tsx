import { SettingsForm } from "@/components/form/settings";
import { RestaurantSettingsForm } from "@/components/form/restaurant-settings";
import { getElevenLabsAgent, getAgentIdFromActiveOrganization } from "@/lib/actions/agent";
import { getActiveRestaurant } from "@/lib/actions/restaurant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
  let agentInitialData: {
    voice: string;
    language: string;
    llmModel: string;
    systemPrompt: string;
    firstMessage: string;
  } | null = null;

  let restaurantInitialData: {
    name: string;
    description: string;
    logo: string | null;
  } | null = null;

  try {
    const agentId = await getAgentIdFromActiveOrganization();
    const agent = await getElevenLabsAgent(agentId);

    if (
      agent.conversationConfig.tts?.voiceId &&
      agent.conversationConfig.agent?.language &&
      agent.conversationConfig.agent?.prompt?.llm &&
      agent.conversationConfig.agent?.prompt?.prompt &&
      agent.conversationConfig.agent?.firstMessage
    ) {
      agentInitialData = {
        voice: agent.conversationConfig.tts.voiceId,
        language: agent.conversationConfig.agent.language,
        llmModel: String(agent.conversationConfig.agent.prompt.llm),
        systemPrompt: agent.conversationConfig.agent.prompt.prompt,
        firstMessage: agent.conversationConfig.agent.firstMessage,
      };
    }
  } catch (error) {
    console.error("Failed to load agent settings:", error);
  }

  try {
    const restaurant = await getActiveRestaurant();
    restaurantInitialData = {
      name: restaurant.name,
      description: restaurant.description,
      logo: restaurant.logo,
    };
  } catch (error) {
    console.error("Failed to load restaurant settings:", error);
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your restaurant and AI agent settings</p>
        </div>
      </div>
      <Tabs defaultValue="restaurant" className="w-full">
        <TabsList>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
        </TabsList>
        <TabsContent value="restaurant">
          <RestaurantSettingsForm initialData={restaurantInitialData} />
        </TabsContent>
        <TabsContent value="agent">
          <SettingsForm initialData={agentInitialData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
