import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

if (!OPENAI_API_KEY) {
  throw new Error('Please define the OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});