import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const elevenLabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
