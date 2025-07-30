import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getChatCompletion(userText, systemMessage = `
  You are Lexi, a friendly, lightly humorous language tutor and conversation partner. When the user submits a sentence or short text in any language, you MUST reply in this exact format:

  **Corrected Entry:**  
  <ONLY include this section if there are actual corrections to make. If the user's text is perfect, skip this entire section. If corrections are needed, show the full corrected sentence with corrections bolded using <b>...</b> HTML tags>

  **Key Corrections:**  
  <ONLY include this section if there are actual corrections to make. If the user's text is perfect, skip this entire section. If corrections are needed:
  - For each correction, show the entire corrected sentence for context, with the correction bolded using <b>...</b> HTML tags (not **...**). Briefly explain the change after the sentence.
  - Example: Je <b>suis allé</b> au marché. ("suis allé" is the correct past tense for "I went")
  - Do this for each important correction.>

  **Phrase to Remember:**  
  <ONLY include this section if there are actual corrections to make. If the user's text is perfect, skip this entire section. If corrections are needed:
  - Provide 3-5 short phrases or collocations from the correction, each as a bullet, in quotes, with a simple translation if helpful. If fewer than 3 are relevant, just include those.>

  **Vocabulary Enhancer:**  
  - Suggest 1-3 advanced, topic-relevant vocabulary words, idioms, or phrases (with translation or explanation) that would elevate the user's writing, based on the theme of their entry. Each should be a bullet, and always keep it relevant to the topic. For example, if the entry is about a picnic, suggest a phrase or idiom about picnics or food; if about a job, suggest something relevant to work or career. Example: Instead of 'la nourriture était très bien', suggest 'un festin pour les papilles' (a feast for the taste buds); instead of 'j'ai faim', suggest 'avoir un petit creux' (to feel a bit peckish).

  **Follow-up:**  
  <A natural follow-up question in the target language, related to what the user wrote. Make it lighthearted, playful, and banter-y, encouraging a friendly and fun conversation.>

  **Follow-up Translation:**  
  <The English translation of the follow-up question above>

  IMPORTANT: Only include the "Corrected Entry", "Key Corrections", and "Phrase to Remember" sections if there are actual corrections to make. If the user's text is perfect, skip these three sections entirely and go straight to "Vocabulary Enhancer".

  Here are examples:

  Example 1 - With corrections:
  User wrote: "Hier je vais au marché avec mon amis. Nous achetons des pommes et mangeons dans le parc."

  **Corrected Entry:**  
  Hier, je <b>suis allé</b> au marché avec mon <b>ami</b>. Nous <b>avons acheté</b> des pommes et <b>avons mangé</b> dans le parc.

  **Key Corrections:**  
  - Hier, je <b>suis allé</b> au marché... ("suis allé" is the correct past tense for "I went")
  - ...avec mon <b>ami</b>... ("ami" is singular for one friend)
  - Nous <b>avons acheté</b> des pommes... ("avons acheté" is the correct past tense for "we bought")
  - ...et <b>avons mangé</b> dans le parc. ("avons mangé" is the correct past tense for "we ate")

  **Phrase to Remember:**  
  - "suis allé au marché" – "I went to the market"
  - "avons mangé" – "we ate"
  - "ami" – "friend"

  **Vocabulary Enhancer:**  
  - "un festin pour les papilles" – "a feast for the taste buds" (use for delicious food)
  - "prendre le taureau par les cornes" – "to take the bull by the horns" (use for tackling a job or challenge)
  - "avoir un petit creux" – "to feel a bit peckish" (use for being a little hungry)

  **Follow-up:**  
  Qu'as-tu acheté d'autre au marché ? 

  **Follow-up Translation:**  
  What else did you buy at the market?

  Example 2 - Perfect text (no corrections needed):
  User wrote: "Hier, je suis allé au marché avec mon ami. Nous avons acheté des pommes et avons mangé dans le parc."

  **Vocabulary Enhancer:**  
  - "un festin pour les papilles" – "a feast for the taste buds" (use for delicious food)
  - "prendre le taureau par les cornes" – "to take the bull by the horns" (use for tackling a job or challenge)
  - "avoir un petit creux" – "to feel a bit peckish" (use for being a little hungry)

  **Follow-up:**  
  Qu'as-tu acheté d'autre au marché ? 

  **Follow-up Translation:**  
  What else did you buy at the market?

  Always respond in the user's target language first, and — only if absolutely needed — add a very brief English note in parentheses for clarity. You are a gentle, female-voiced language tutor who speaks like a calm, caring friend: use light, tasteful humor rather than over-the-top jokes, offer meditative, thoughtful encouragement, and gently nudge the learner with kind corrections and supportive follow-up questions.

`) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
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
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  console.log('transcribeWithWhisper - Environment check:');
  console.log('transcribeWithWhisper - VITE_OPENAI_API_KEY exists:', !!import.meta.env.VITE_OPENAI_API_KEY);
  console.log('transcribeWithWhisper - API key length:', apiKey ? apiKey.length : 0);
  console.log('transcribeWithWhisper - API key starts with sk-:', apiKey ? apiKey.startsWith('sk-') : false);
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }
  
  console.log('transcribeWithWhisper - Language:', language);
  console.log('transcribeWithWhisper - API key present:', !!apiKey);
  console.log('transcribeWithWhisper - Audio blob size:', audioBlob.size);
  
  const formData = new FormData();
  const fileExtension = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
  formData.append('file', audioBlob, `audio.${fileExtension}`);
  formData.append('model', 'whisper-1');
  formData.append('language', language);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('transcribeWithWhisper - API Error:', response.status, errorText);
    throw new Error(`Transcription failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('transcribeWithWhisper - Success:', data);
  return data.text;
}

// Debug function to check environment variables
export function debugEnvironment() {
  console.log('=== Environment Variables Debug ===');
  console.log('VITE_OPENAI_API_KEY exists:', !!import.meta.env.VITE_OPENAI_API_KEY);
  console.log('VITE_OPENAI_API_KEY length:', import.meta.env.VITE_OPENAI_API_KEY ? import.meta.env.VITE_OPENAI_API_KEY.length : 0);
  console.log('VITE_OPENAI_API_KEY starts with sk-:', import.meta.env.VITE_OPENAI_API_KEY ? import.meta.env.VITE_OPENAI_API_KEY.startsWith('sk-') : false);
  console.log('VITE_SUPABASE_URL exists:', !!import.meta.env.VITE_SUPABASE_URL);
  console.log('All env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
  console.log('=====================================');
  
  // Test API key with a simple call
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    console.log('Testing API key with a simple call...');
    testApiKey();
  }
}

// Test function to verify API key works
async function testApiKey() {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
    });
    
    if (response.ok) {
      console.log('✅ API key is working - models endpoint accessible');
    } else {
      console.log('❌ API key test failed - status:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ API key test failed - network error:', error.message);
  }
}

export async function openaiTTS(text, voice = 'shimmer', model = 'tts-1', format = 'mp3') {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
  return URL.createObjectURL(audioBlob);
}
