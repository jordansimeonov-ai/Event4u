'use server';

import { GoogleGenAI } from "@google/genai";
import { QuoteState, Language, ServiceOption } from "../types";

export const generateIntroText = async (state: QuoteState, language: Language, eventTypeLabel: string, allServices: ServiceOption[]): Promise<string> => {
  const model = "gemini-3-flash-preview";
  
  // Fallback text if AI is unavailable or fails
  const fallbackText = language === 'bg' 
    ? "Благодарим ви, че избрахте нас за вашия специален ден. Нашият екип ще се погрижи всеки детайл да бъде съвършен." 
    : "Thank you for choosing us for your special day. Our team will ensure every detail is perfect.";

  // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing (process.env.API_KEY). AI features will be disabled.");
    return fallbackText;
  }

  const selectedServiceNames = state.selectedServices
    .map(id => {
        const s = allServices.find(srv => srv.id === id);
        return s ? s.name[language] : '';
    })
    .filter(Boolean)
    .join(", ");

  const langInstruction = language === 'bg' 
    ? 'The output MUST be in Bulgarian.' 
    : 'The output MUST be in English.';

  const systemInstruction = `
    You are an experienced event planner and general manager of a luxury resort.
    Your task is to write a warm, sophisticated, and highly personalized introduction paragraph (max 60 words) for a price proposal.
    Tone: Elegant, reassuring, inspiring, and professional.
    Do not mention specific prices. Focus on the experience and the magic of the event type.
    ${langInstruction}
  `;

  const userPrompt = `
    Client Name: ${state.customerName}
    Event Date: ${state.eventDate}
    Event Type: ${eventTypeLabel}
    Guest Count: ${state.guests.adults + state.guests.children}
    Selected Services: ${selectedServiceNames}
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    });
    return response.text || fallbackText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return fallbackText;
  }
};