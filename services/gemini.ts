
import { GoogleGenAI, Type } from "@google/genai";
import { Child, DailyTip, RightNowAdvice } from "../types";

const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED');
    if (isRetryable && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const getChallengeAdvice = async (parentName: string, child: Child, challenge: string): Promise<DailyTip> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const interestsContext = child.interests.length > 0 ? `Interests: ${child.interests.join(', ')}.` : "";
  
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `MindBloom Specialist. 
      Parent: ${parentName}. Child: ${child.name} (${child.age}yo). 
      ${interestsContext} 
      Challenge: "${challenge}". 
      
      INSTRUCTIONS:
      1. TONE: Be warm, non-judgmental, and normalizing. Start by reminding ${parentName} that this is normal for a ${child.age}-year-old.
      2. PERSONALIZATION: Address ${parentName} directly. Use ${child.name}'s name in every paragraph.
      3. INTERESTS: If possible, tie the strategy or activity to ${child.name}'s interests: ${child.interests.join(', ')}. (e.g. "Since they love dinosaurs, maybe...")
      4. LANGUAGE: 5th-grade level. No jargon. 
      5. SCRIPT: Friendly exactly-what-to-say lines.
      6. DETAILS: STEP-BY-STEP breakdown using bullet points (-).
      7. GLOSSARY: Simple definitions for terms like 'nervous system' if used.

      Provide JSON: {title, content, activity, script, details, glossary: [{term, definition}]}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            activity: { type: Type.STRING },
            script: { type: Type.STRING },
            details: { type: Type.STRING },
            glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING }
                },
                required: ["term", "definition"]
              }
            }
          },
          required: ["title", "content", "activity", "script", "details"],
        },
      },
    });
    return JSON.parse(response.text || "{}") as DailyTip;
  });
};

export const getRightNowAdvice = async (parentName: string, child: Child, challenge: string): Promise<RightNowAdvice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `MindBloom Emergency Help. 
      Parent: ${parentName}. Child: ${child.name} (${child.age}yo). 
      Challenge: "${challenge}". 
      
      INSTRUCTIONS:
      1. TONE: Urgent but deeply warm and normalizing. Remind the parent: "You're doing your best."
      2. PERSONALIZATION: Use ${child.name}'s name often. Reference the fact that this is common for a ${child.age} year old.
      3. INTERESTS: Use an analogy from their interests (${child.interests.join(', ')}) if it helps de-escalate.
      4. STEPS: 3 rapid actions.
      5. DETAILS: Bullet points starting with (-).
      6. GLOSSARY: Definitions for words used.

      Provide JSON: {step1, summary1, detail1, step2, summary2, detail2, step3, summary3, detail3, glossary: [{term, definition}]}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            step1: { type: Type.STRING },
            summary1: { type: Type.STRING },
            detail1: { type: Type.STRING },
            step2: { type: Type.STRING },
            summary2: { type: Type.STRING },
            detail2: { type: Type.STRING },
            step3: { type: Type.STRING },
            summary3: { type: Type.STRING },
            detail3: { type: Type.STRING },
            glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING }
                },
                required: ["term", "definition"]
              }
            }
          },
          required: ["step1", "summary1", "detail1", "step2", "summary2", "detail2", "step3", "summary3", "detail3"],
        },
      },
    });
    return JSON.parse(response.text || "{}") as RightNowAdvice;
  });
};

export const getDailyOneLiner = async (child: Child, challenge: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Warm parent tip for ${child.name} (${child.age}yo) regarding ${challenge}. 1 short sentence (<10 words). Normalize the struggle.`,
    });
    return response.text?.replace(/"/g, '').replace(/\.$/, '') || "You and " + child.name + " are doing great";
  });
};

export const getAiChatResponse = async (history: {role: string, content: string}[], message: string, children: Child[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const childNames = children.map(c => c.name).join(", ");
  
  return retryWithBackoff(async () => {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `MindBloom Coach. 
        - Use simple language (5th-grade). 
        - Max 75 words. 
        - Always use the child's name: ${childNames}. 
        - Be deeply empathetic and normalizing. 
        - Say things like "This is normal for this age" or "You're not failing."`,
      }
    });
    const result = await chat.sendMessage({ message });
    return result.text || "";
  });
};

export const getSelfCareContent = async (category: string): Promise<{ title: string; content: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a warm, normalizing 1-sentence parent ${category}. Ensure it feels like a hug.`,
    });
    return { title: category, content: response.text || "You are enough exactly as you are." };
  });
};

// Added getExpertResponse to handle clinical specialist analysis
export const getExpertResponse = async (question: string, child: Child): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `MindBloom Specialist Analysis. 
      Child: ${child.name} (${child.age}yo). 
      Interests: ${child.interests.join(', ')}. 
      Challenges: ${child.challenges.join(', ')}.
      Query: "${question}".
      
      Provide a deep, empathetic, and clinical breakdown of the situation. 
      1. Normalize the struggle for both parent and child.
      2. Explain the likely developmental root.
      3. Suggest 2-3 advanced strategies.
      Use simple language (5th-grade level). Max 200 words.`,
    });
    return response.text || "Our specialist is currently unavailable. Please try again later.";
  });
};

// Added getParentWellnessAdvice to provide zen moments for overwhelmed parents
export const getParentWellnessAdvice = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Provide a warm, normalizing 1-2 sentence micro-moment of zen for a parent who is feeling overwhelmed. Focus on self-compassion. Make it feel like a hug.",
    });
    return response.text || "Take a deep breath. You are exactly the parent your child needs.";
  });
};
