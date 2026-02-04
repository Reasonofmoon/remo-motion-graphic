
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from "@google/genai";
import { cleanBase64 } from "../utils";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createBlankImage = (width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }
  const dataUrl = canvas.toDataURL('image/png');
  return cleanBase64(dataUrl);
};

// PAVS v1.0 Meta-Prompt logic for high-end suggestions
export const generateStyleSuggestion = async (text: string, isLuxuryMode: boolean = false): Promise<string> => {
  const ai = getAI();
  
  const pavsSystemInstruction = `
    You are a luxury product advertisement director (PAVS v1.0). 
    Your goal is to provide a "Minimal Luxury" art direction for the product: "${text}".
    
    Adhere to these principles:
    - Lighting: Scandinavian diffused lighting, 5500K daylight LED, top-to-bottom gradients.
    - Background: Infinite white #FFFFFF or extremely minimal stone/marble textures.
    - Camera: Phase One IQ4 150MP, 90mm Tilt-Shift lens, f/11 for deep focus.
    - Details: Hyper-precise surface details (e.g., glycerin droplets, 0.5mm frost layer, surgical-grade reflections).
    - Philosophy: "Weniger, aber besser" (Less, but better).
    
    Output ONLY the visual description in a professional, concise prose (15-25 words).
  `;

  const standardInstruction = `
    Generate a single, creative visual art direction description for a cinematic text animation of: "${text}". 
    Focus on material, lighting, and environment. 
    Examples: "Formed by fluffy white clouds in a deep blue sky", "Glowing neon signs reflected in a rainy street".
    Output ONLY the description.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: isLuxuryMode ? pavsSystemInstruction : standardInstruction
    });
    return response.text?.trim() || "";
  } catch (e) {
    console.error("Failed to generate style suggestion", e);
    return "";
  }
};

interface TextImageOptions {
  text: string;
  style: string;
  typographyPrompt?: string;
  referenceImage?: string; 
}

export const generateTextImage = async ({ text, style, typographyPrompt, referenceImage }: TextImageOptions): Promise<{ data: string, mimeType: string }> => {
  const ai = getAI();
  const parts: any[] = [];
  
  const typoInstruction = typographyPrompt && typographyPrompt.trim().length > 0 
    ? typographyPrompt 
    : "High-quality, creative typography that perfectly matches the visual environment. Legible and artistic.";

  // Detect if the user prompt looks like a PAVS prompt (contains technical specs)
  const isPavsPrompt = style.toLowerCase().includes('phase one') || style.toLowerCase().includes('minimal luxury');

  const systemPrompt = isPavsPrompt 
    ? `PAVS v1.0 Executive Mode: Create an ultra-high-end advertising visual. 
       Camera: Phase One IQ4 150MP (16K detail). 
       Lighting: Scandinavian diffused light, ΔE < 1.0 color accuracy.
       Subject: The text "${text}" rendered as a physical product/material.
       Style: ${style}.
       Background: Pure white #FFFFFF unless specified.
       Typography: ${typoInstruction}.`
    : `A hyper-realistic, cinematic image featuring the text "${text}". 
       Typography: ${typoInstruction}. 
       Visual Style: ${style}. 
       Dramatic lighting, 8k resolution, detailed texture.`;

  if (referenceImage) {
    const [mimeTypePart, data] = referenceImage.split(';base64,');
    parts.push({
      inlineData: {
        data: data,
        mimeType: mimeTypePart.replace('data:', '')
      }
    });
    parts.push({ text: `${systemPrompt} Use the reference image for lighting, color palette, and mood.` });
  } else {
    parts.push({ text: systemPrompt });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return { 
          data: part.inlineData.data, 
          mimeType: part.inlineData.mimeType || 'image/png' 
        };
      }
    }
    throw new Error("No image generated");
  } catch (error: any) {
    throw error;
  }
};

const pollForVideo = async (operation: any) => {
  const ai = getAI();
  let op = operation;
  const startTime = Date.now();
  const MAX_WAIT_TIME = 180000; 

  while (!op.done) {
    if (Date.now() - startTime > MAX_WAIT_TIME) {
      throw new Error("Video generation timed out.");
    }
    await sleep(5000); 
    op = await ai.operations.getVideosOperation({ operation: op });
  }
  return op;
};

const fetchVideoBlob = async (uri: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  try {
    const url = new URL(uri);
    url.searchParams.append('key', apiKey);
    const videoResponse = await fetch(url.toString());
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  } catch (e: any) {
    const fallbackUrl = `${uri}${uri.includes('?') ? '&' : '?'}key=${apiKey}`;
    const videoResponse = await fetch(fallbackUrl);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  }
};

export const generateTextVideo = async (text: string, imageBase64: string, imageMimeType: string, promptStyle: string): Promise<string> => {
  const ai = getAI();
  const cleanImageBase64 = cleanBase64(imageBase64);

  try {
    const startImage = createBlankImage(1280, 720);
    const isPavs = promptStyle.toLowerCase().includes('phase one') || promptStyle.toLowerCase().includes('minimal luxury');
    
    const revealPrompt = isPavs
      ? `Ultra-high-end product reveal. The text "${text}" materializes with extreme precision. 
         Slow camera pan, smooth motion, high-end commercial aesthetic. ${promptStyle}.`
      : `Cinematic transition. The text "${text}" gradually forms and materializes. ${promptStyle}. High quality, 8k.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: revealPrompt,
      image: {
        imageBytes: startImage,
        mimeType: 'image/png'
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
        lastFrame: {
          imageBytes: cleanImageBase64,
          mimeType: imageMimeType
        }
      }
    });

    const op = await pollForVideo(operation);
    if (op.response?.generatedVideos?.[0]?.video?.uri) {
      return await fetchVideoBlob(op.response.generatedVideos[0].video.uri);
    }
    throw new Error("Unable to generate video.");
  } catch (error: any) {
    throw error;
  }
};
