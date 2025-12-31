"use server";

import { GoogleGenAI } from "@google/genai";

/**
 * Analyzes an image using Gemini Vision to understand its content
 */
async function analyzeImage(ai: GoogleGenAI, base64Image: string, mimeType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            {
              text: "Describe this menu item image in detail. Include: what food/item is shown, the current presentation style, lighting, background, colors, and overall quality. Be specific and detailed.",
            },
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
    });

    const description = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return description;
  } catch (error) {
    console.error("Error analyzing image:", error);
    // Return a generic description if analysis fails
    return "a menu item";
  }
}

/**
 * Refines an image using Google Nano Banana AI
 * First analyzes the image, then generates an improved version
 * @param imageFile - The image file to refine
 * @param prompt - The prompt describing how to refine the image
 * @param menuItemName - Optional name of the menu item for context
 * @returns The refined image as a base64 string
 */
export async function refineImageWithAI(imageFile: File, prompt: string, menuItemName?: string): Promise<string> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable is not set");
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Convert image file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    // Analyze the current image to understand what we're working with
    const imageDescription = await analyzeImage(ai, base64Image, mimeType);

    // Create a comprehensive prompt for generating the refined image
    const menuContext = menuItemName ? `This is a menu item called "${menuItemName}". ` : "";
    const generationPrompt = `${menuContext}Create a professional, appetizing restaurant-quality image of ${imageDescription}. ${prompt}. The image should be well-lit, beautifully presented, with professional food photography styling. Use a clean, appealing background that makes the food/item stand out. Make it look delicious and inviting.`;

    // Generate refined image using Nano Banana
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: generationPrompt,
    });

    // Extract the generated image from the response
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error("No image generated in response");
    }

    // Find the image part
    const imagePart = parts.find((part: { inlineData?: { data?: string; mimeType?: string } }) => part.inlineData);
    if (!imagePart?.inlineData?.data) {
      throw new Error("No image data found in response");
    }

    return imagePart.inlineData.data;
  } catch (error) {
    console.error("Error refining image:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to refine image with AI");
  }
}
