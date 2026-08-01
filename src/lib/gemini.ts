import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey });

export const models = {
  text: "gemini-3-flash-preview",
  image: "gemini-2.5-flash-image",
  video: "veo-3.1-lite-generate-preview",
  audio: "gemini-2.5-flash-preview-tts",
  music: "lyria-3-clip-preview",
};

export async function generateText(prompt: string, systemInstruction?: string) {
  const response = await genAI.models.generateContent({
    model: models.text,
    contents: prompt,
    config: {
      systemInstruction,
    },
  });
  return response.text;
}

export async function generateImage(prompt: string, aspect: "1:1" | "16:9" | "9:16" = "1:1") {
  const response = await genAI.models.generateContent({
    model: models.image,
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspect,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function editImage(base64Image: string, prompt: string, mimeType: string = "image/png") {
  const response = await genAI.models.generateContent({
    model: models.image,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(",")[1],
            mimeType,
          },
        },
        { text: prompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function generateSpeech(text: string, voice: "Kore" | "Puck" | "Charon" | "Fenrir" | "Zephyr" = "Kore") {
  const response = await genAI.models.generateContent({
    model: models.audio,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return `data:audio/wav;base64,${base64Audio}`;
  }
  return null;
}

export async function generateVideo(prompt: string) {
  let operation = await genAI.models.generateVideos({
    model: models.video,
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await genAI.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (downloadLink) {
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  return null;
}

export async function generateMusic(prompt: string) {
  const response = await genAI.models.generateContentStream({
    model: models.music,
    contents: prompt,
  });

  let audioBase64 = "";
  let mimeType = "audio/wav";

  for await (const chunk of response) {
    const parts = chunk.candidates?.[0]?.content?.parts;
    if (!parts) continue;
    for (const part of parts) {
      if (part.inlineData?.data) {
        if (!audioBase64 && part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
        audioBase64 += part.inlineData.data;
      }
    }
  }

  if (audioBase64) {
    const binary = atob(audioBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  }
  return null;
}

