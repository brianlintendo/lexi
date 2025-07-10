import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getChatCompletion(userText, systemMessage = "You are a warm, supportive language learning buddy who responds like a caring friend.") {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemMessage
      },
      {
        role: "user",
        content: userText
      }
    ],
    temperature: 0.7
  });
  return response.choices[0].message.content;
}
