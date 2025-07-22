import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

function getOpenAIApiKey() {
  const config = Constants.expoConfig;
  if (!config || !config.extra || !config.extra.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in app config');
  }
  return config.extra.OPENAI_API_KEY;
}
const OPENAI_API_KEY = getOpenAIApiKey();

export async function getChatCompletion(userText: string, systemMessage: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-1106-preview',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userText }
      ],
      temperature: 0.7
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

export async function transcribeWithWhisper(audioBlob: Blob, language: string = 'fr'): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', language);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to transcribe audio');
  }
  const data = await response.json();
  return data.text;
}

export async function openaiTTS(text: string, voice: string = 'shimmer', model: string = 'tts-1', format: string = 'mp3'): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      response_format: format
    })
  });
  if (!response.ok) {
    throw new Error('OpenAI TTS failed');
  }
  const audioBlob = await response.blob();
  // Convert blob to base64
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      const base64data = reader.result?.toString().split(',')[1];
      if (!base64data) return reject('Failed to convert blob to base64');
      const fileUri = FileSystem.cacheDirectory + `tts-${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, base64data, { encoding: FileSystem.EncodingType.Base64 });
      resolve(fileUri);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
} 