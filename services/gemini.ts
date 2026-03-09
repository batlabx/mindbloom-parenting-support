import { GoogleGenAI, Type } from "@google/genai";
import { Child, DailyTip, RightNowAdvice } from "../types";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

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

const hasApiKey = () => Boolean(API_KEY && API_KEY.trim().length > 0);

const createAI = () => new GoogleGenAI({ apiKey: API_KEY });

const fallbackDailyTip = (child: Child, challenge: string): DailyTip => ({
  title: `Try one small step for ${challenge}`,
  content: `${child.name}, this is normal for age ${child.age}. Start with calm, then coach the skill.`,
  activity: `Name the feeling + 3 slow breaths + one redo opportunity.`,
  script: `"${child.name}, I see this is hard. I'm here. Let's breathe and try again together."`,
  details: `- Get eye-level and use a calm voice\n- Name the feeling in simple words\n- Offer one clear next step\n- Praise effort, not perfection`,
  glossary: [
    { term: 'Co-regulation', definition: 'When your calm helps your child calm down.' }
  ]
});

const fallbackRightNowAdvice = (child: Child): RightNowAdvice => ({
  step1: 'Pause and regulate',
  summary1: 'Slow yourself first',
  detail1: '- Inhale 4 seconds, exhale 6 seconds\n- Relax shoulders\n- Keep your voice low',
  step2: 'Connect before correcting',
  summary2: `Help ${child.name} feel safe`,
  detail2: `- Go eye-level\n- Say: "You're safe. I'm with you."\n- Name the feeling`,
  step3: 'Give one tiny next action',
  summary3: 'Small, clear instruction',
  detail3: '- Offer two simple choices\n- Help them start\n- Praise the first step',
  glossary: [
    { term: 'Regulate', definition: 'Bring the body and emotions back to calm.' }
  ]
});

export const getChallengeAdvice = async (parentName: string, child: Child, challenge: string): Promise<DailyTip> => {
  if (!hasApiKey()) return fallbackDailyTip(child, challenge);

  const ai = createAI();
  const interestsContext = child.interests.length > 0 ? `Interests: ${child.interests.join(', ')}.` : "";

  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `MindBloom Specialist. Parent: ${parentName}. Child: ${child.name} (${child.age}yo). ${interestsContext} Challenge: "${challenge}". Provide JSON: {title, content, activity, script, details, glossary: [{term, definition}]}.`,
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
                properties: { term: { type: Type.STRING }, definition: { type: Type.STRING } },
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
  if (!hasApiKey()) return fallbackRightNowAdvice(child);

  const ai = createAI();
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `MindBloom Emergency Help. Parent: ${parentName}. Child: ${child.name} (${child.age}yo). Challenge: "${challenge}". Provide JSON: {step1, summary1, detail1, step2, summary2, detail2, step3, summary3, detail3, glossary: [{term, definition}]}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            step1: { type: Type.STRING }, summary1: { type: Type.STRING }, detail1: { type: Type.STRING },
            step2: { type: Type.STRING }, summary2: { type: Type.STRING }, detail2: { type: Type.STRING },
            step3: { type: Type.STRING }, summary3: { type: Type.STRING }, detail3: { type: Type.STRING },
            glossary: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { term: { type: Type.STRING }, definition: { type: Type.STRING } }, required: ["term", "definition"] } }
          },
          required: ["step1", "summary1", "detail1", "step2", "summary2", "detail2", "step3", "summary3", "detail3"],
        },
      },
    });
    return JSON.parse(response.text || "{}") as RightNowAdvice;
  });
};

export const getDailyOneLiner = async (child: Child, challenge: string): Promise<string> => {
  if (!hasApiKey()) return `Small steps count—${child.name} is still learning ${challenge.toLowerCase()}.`;
  const ai = createAI();
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Warm parent tip for ${child.name} (${child.age}yo) regarding ${challenge}. 1 short sentence (<10 words).`,
    });
    return response.text?.replace(/"/g, '').replace(/\.$/, '') || `You and ${child.name} are doing great`;
  });
};

export const getAiChatResponse = async (history: { role: string; content: string }[], message: string, children: Child[]) => {
  if (!hasApiKey()) return `I hear you. Try one calm step with ${children[0]?.name || 'your child'} and we can adjust together.`;
  const ai = createAI();
  const childNames = children.map(c => c.name).join(", ");

  return retryWithBackoff(async () => {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: { systemInstruction: `MindBloom Coach. Max 75 words. Use child names: ${childNames}.` }
    });
    const result = await chat.sendMessage({ message });
    return result.text || "";
  });
};

export const getSelfCareContent = async (category: string): Promise<{ title: string; content: string }> => {
  if (!hasApiKey()) return { title: category, content: 'Take one slow breath. You are not behind—you are human.' };
  const ai = createAI();
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a warm, normalizing 1-sentence parent ${category}.`,
    });
    return { title: category, content: response.text || "You are enough exactly as you are." };
  });
};

export const getExpertResponse = async (question: string, child: Child): Promise<string> => {
  if (!hasApiKey()) return `Great question. For ${child.name}, start with connection first, then one clear expectation, then a small practice loop.`;
  const ai = createAI();
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `MindBloom Specialist Analysis. Child: ${child.name} (${child.age}yo). Query: "${question}".`,
    });
    return response.text || "Our specialist is currently unavailable. Please try again later.";
  });
};

export const getParentWellnessAdvice = async (): Promise<string> => {
  if (!hasApiKey()) return 'Place a hand on your heart and unclench your jaw—you’re doing better than you think.';
  const ai = createAI();
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Provide a warm 1-2 sentence micro-moment of zen for an overwhelmed parent.",
    });
    return response.text || "Take a deep breath. You are exactly the parent your child needs.";
  });
};
