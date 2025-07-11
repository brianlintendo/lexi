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

export async function transcribeWithWhisper(audioBlob, language = 'fr') {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', language);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to transcribe audio');
  }

  const data = await response.json();
  return data.text;
}

export async function elevenLabsTTS(text, voiceId = "EXAVITQu4vr4xnSDxMaL", language = "fr") {
  const apiKey = import.meta.env.VITE_ELEVENLABS_KEY;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8
      }
    })
  });

  if (!response.ok) {
    throw new Error("Failed to generate speech");
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}
