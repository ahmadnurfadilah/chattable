import { SettingsForm } from "@/components/form/settings";
import { getElevenLabsAgent, getAgentIdFromActiveOrganization } from "@/lib/actions/agent";

export default async function SettingsPage() {
  let initialData: {
    voice: string;
    language: string;
    llmModel: string;
    systemPrompt: string;
    firstMessage: string;
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
      initialData = {
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

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your AI agent&apos;s voice, language, and behavior settings
          </p>
        </div>
      </div>
      <SettingsForm initialData={initialData} />
    </div>
  );
}
