// Function to map language codes to flag codes
export function getFlagCode(language) {
  const flagMap = {
    'en': 'us',
    'es': 'es', 
    'fr': 'fr',
    'zh': 'cn',
    'pt': 'br',
    'it': 'it',
    'de': 'de',
    'ja': 'jp',
    'ko': 'kr',
    'ru': 'ru',
    'ar': 'sa',
    'hi': 'in',
    'nl': 'nl',
    'sv': 'se',
    'no': 'no',
    'da': 'dk',
    'fi': 'fi',
    'pl': 'pl',
    'tr': 'tr',
    'he': 'il',
    'th': 'th',
    'vi': 'vn',
    'id': 'id',
    'ms': 'my'
  };
  return flagMap[language] || 'us';
}

export function getCEFRPrompt(level, language) {
  const prompts = {
    A1: {
      en: "What did you do today? Write 1-2 simple sentences.",
      es: "¿Qué hiciste hoy? Escribe 1-2 frases sencillas.",
      fr: "Qu'as-tu fait aujourd'hui ? Écris 1-2 phrases simples.",
    },
    A2: {
      en: "Can you describe your day using simple words? What did you do?",
      es: "¿Puedes describir tu día con palabras sencillas? ¿Qué hiciste?",
      fr: "Peux-tu décrire ta journée avec des mots simples ? Qu'as-tu fait ?",
    },
    B1: {
      en: "Tell me about something interesting that happened today. Try to use a few sentences.",
      es: "Cuéntame algo interesante que pasó hoy. Intenta usar algunas frases.",
      fr: "Raconte-moi quelque chose d'intéressant qui s'est passé aujourd'hui. Essaie d'utiliser quelques phrases.",
    },
    B2: {
      en: "Reflect on your day. What was the most challenging or rewarding part? Write a short paragraph.",
      es: "Reflexiona sobre tu día. ¿Qué fue lo más desafiante o gratificante? Escribe un párrafo corto.",
      fr: "Réfléchis à ta journée. Quelle a été la partie la plus difficile ou la plus gratifiante ? Écris un court paragraphe.",
    },
    C1: {
      en: "Analyze your day in detail. What did you learn or realize? Try to use advanced vocabulary and connect your thoughts.",
      es: "Analiza tu día en detalle. ¿Qué aprendiste o descubriste? Intenta usar vocabulario avanzado y conectar tus ideas.",
      fr: "Analyse ta journée en détail. Qu'as-tu appris ou réalisé ? Essaie d'utiliser un vocabulaire avancé et de connecter tes idées.",
    }
  };
  
  const levelKey = (level || '').split(' ')[0];
  return (prompts[levelKey] && prompts[levelKey][language]) || prompts['A1']['en'];
}

export function getDynamicPromptWithCEFR(selectedDate, journalEntries, language, proficiency) {
  const todayKey = selectedDate.toISOString().slice(0, 10);
  const yesterday = new Date(selectedDate);
  yesterday.setDate(selectedDate.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  const entryToday = journalEntries[todayKey];
  const entryYesterday = journalEntries[yesterdayKey];
  
  if (entryYesterday && !entryToday) {
    return `Yesterday you wrote: "${entryYesterday.slice(0, 60)}..." ${getCEFRPrompt(proficiency, language)}`;
  } else if (!entryYesterday && !entryToday) {
    return getCEFRPrompt(proficiency, language);
  } else if (entryToday) {
    return `Great job writing today! Want to add more or reflect on something else?`;
  }
  return getCEFRPrompt(proficiency, language);
}

export function isPromptText(text) {
  const promptPatterns = [
    '¿Qué aventura inesperada',
    'What unexpected adventure',
    '¡Hola! ¿Listo',
    'Hello! Ready to write',
    'Bonjour ! Prêt',
    '你好！准备好',
    'Olá! Pronto',
    'Ciao! Pronto',
    'Hallo! Bereit',
    'こんにちは！',
    '안녕하세요!',
    'Привет! Готов',
    'مرحباً! مستعد',
    'नमस्ते! हिंदी',
    'Hallo! Klaar',
    'Hej! Redo',
    'Hei! Klar'
  ];
  
  return promptPatterns.some(pattern => text.includes(pattern));
}

export const PROMPT_BUBBLES = {
  en: "Hello! Ready to write in English? What did you do today?",
  es: "¡Hola! ¿Listo(a) para escribir en español? ¿Qué hiciste hoy?",
  fr: "Bonjour ! Prêt(e) à écrire en français ? Qu'as-tu fait aujourd'hui ?",
  zh: "你好！准备好用中文写作了吗？你今天做了什么？",
  pt: "Olá! Pronto(a) para escrever em português? O que você fez hoje?",
  it: "Ciao! Pronto(a) a scrivere in italiano? Cosa hai fatto oggi?",
  de: "Hallo! Bereit, auf Deutsch zu schreiben? Was hast du heute gemacht?",
  ja: "こんにちは！日本語で書く準備はできましたか？今日は何をしましたか？",
  ko: "안녕하세요! 한국어로 글쓰기 준비가 되셨나요? 오늘 무엇을 하셨나요?",
  ru: "Привет! Готов писать на русском? Что ты делал сегодня?",
  ar: "مرحباً! مستعد للكتابة بالعربية؟ ماذا فعلت اليوم؟",
  hi: "नमस्ते! हिंदी में लिखने के लिए तैयार हैं? आज आपने क्या किया?",
  nl: "Hallo! Klaar om in het Nederlands te schrijven? Wat heb je vandaag gedaan?",
  sv: "Hej! Redo att skriva på svenska? Vad gjorde du idag?",
  no: "Hei! Klar til å skrive på norsk? Hva gjorde du i dag?",
  da: "Hej! Klar til at skrive på dansk? Hvad gjorde du i dag?",
  fi: "Hei! Valmis kirjoittamaan suomeksi? Mitä sinä teit tänään?",
  pl: "Cześć! Gotowy do pisania po polsku? Co robiłeś dzisiaj?",
  tr: "Merhaba! Türkçe yazmaya hazır mısın? Bugün ne yaptın?",
  he: "שלום! מוכן לכתוב בעברית? מה עשית היום?",
  th: "สวัสดี! พร้อมเขียนภาษาไทยแล้วหรือยัง? วันนี้คุณทำอะไรบ้าง?",
  vi: "Xin chào! Sẵn sàng viết bằng tiếng Việt chưa? Hôm nay bạn đã làm gì?",
  id: "Halo! Siap menulis dalam bahasa Indonesia? Apa yang kamu lakukan hari ini?",
  ms: "Hai! Sedia menulis dalam bahasa Melayu? Apa yang anda lakukan hari ini?"
};

export const PLACEHOLDERS = {
  en: "I feel...",
  es: "Me siento...",
  fr: "Je me sens...",
  zh: "我觉得...",
  pt: "Eu me sinto...",
  it: "Mi sento...",
  de: "Ich fühle mich...",
  ja: "私は...感じます",
  ko: "나는... 느낀다",
  ru: "Я чувствую...",
  ar: "أشعر...",
  hi: "मैं महसूस करता हूं...",
  nl: "Ik voel me...",
  sv: "Jag känner mig...",
  no: "Jeg føler meg...",
  da: "Jeg føler mig...",
  fi: "Tunnen itseni...",
  pl: "Czuję się...",
  tr: "Kendimi... hissediyorum",
  he: "אני מרגיש...",
  th: "ฉันรู้สึก...",
  vi: "Tôi cảm thấy...",
  id: "Saya merasa...",
  ms: "Saya berasa..."
}; 