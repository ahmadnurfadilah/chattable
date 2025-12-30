import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createOrderFromWebhook } from "@/lib/actions/order";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function GET() {
  return NextResponse.json({ status: "webhook listening" }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;

  try {
    const event = await constructWebhookEvent(req, secret);

    if (event.type === "post_call_transcription") {
      const agentId = event.data.agent_id;
      const status = event.data.status;
      const dataCollectionResults = event.data.analysis?.data_collection_results;

      // Only create order if status indicates done and we have data collection results
      if (status === "done" && dataCollectionResults) {
        try {
          await createOrderFromWebhook(agentId, dataCollectionResults);
        } catch (error) {
          console.error("Error creating order:", error);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }
}

const constructWebhookEvent = async (req: NextRequest, secret?: string) => {
  const body = await req.text();
  const signatureHeader = req.headers.get("ElevenLabs-Signature");

  return await elevenlabs.webhooks.constructEvent(body, signatureHeader as string, secret as string);
};
