'use strict';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return 503 or success false so client uses heuristic fallback
      return NextResponse.json(
        { success: false, info: 'Gemini API key is not configured. Falling back to local NLP heuristic parser.' },
        { status: 200 }
      );
    }

    // Call Gemini API (Generate Content using Structured Outputs)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Parse this text into a structured invoice JSON. Text: "${prompt}"` }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                clientName: { type: 'STRING' },
                items: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      description: { type: 'STRING' },
                      quantity: { type: 'NUMBER' },
                      unitPrice: { type: 'NUMBER' }
                    },
                    required: ['description', 'quantity', 'unitPrice']
                  }
                },
                dueDateDays: { type: 'NUMBER' },
                taxRate: { type: 'NUMBER' },
                discountAmount: { type: 'NUMBER' },
                notes: { type: 'STRING' }
              },
              required: ['clientName', 'items', 'taxRate', 'discountAmount']
            }
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const resData = await response.json();
    const jsonText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonText) {
      throw new Error('Failed to parse text from Gemini API response');
    }

    const parsedResult = JSON.parse(jsonText);
    return NextResponse.json({ success: true, result: parsedResult });
  } catch (err: any) {
    console.error('API Parse Route Error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
