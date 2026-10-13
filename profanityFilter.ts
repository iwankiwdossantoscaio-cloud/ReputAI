// Profanity filter for Brazilian Portuguese
const OFFENSIVE_WORDS = [
  'merda', 'porra', 'caralho', 'puta', 'fdp', 'foda', 'fodase', 'fodasse',
  'cuzao', 'cuzão', 'arrombado', 'arrombada', 'viado', 'viada', 'vagabundo',
  'vagabunda', 'desgraça', 'desgraçado', 'desgraçada', 'piranha', 'otario',
  'otária', 'otário', 'babaca', 'imbecil', 'idiota', 'burro', 'burra',
  'bosta', 'buceta', 'pau no cu', 'filho da puta', 'filha da puta',
  'vai se fuder', 'vai tomar', 'vtnc', 'pqp', 'krl', 'crll', 'fds',
  'lixo humano', 'nojento', 'nojenta', 'corno', 'corna', 'retardado',
  'retardada', 'mongol', 'mongoloide', 'inutil', 'inútil', 'escroto',
  'escrota', 'safado', 'safada', 'canalha', 'maldito', 'maldita',
  'desgraçado', 'palhaço', 'palhaça', 'rato', 'rata', 'verme',
];

// Patterns for masked words (e.g., m3rda, p*rra, f.o.d.a)
const MASK_PATTERNS = [
  /m+[e3€]+r+d+[a@]+/gi,
  /p+[o0ø]+r+r+[a@]+/gi,
  /c+[a@]+r+[a@]+l+h+[o0]+/gi,
  /p+[u]+t+[a@]+/gi,
  /f+[o0]+d+[a@eê]+/gi,
  /c+[u]+z+[aã@]+[o0]+/gi,
  /b+[u]+c+[e3]+t+[a@]+/gi,
  /b+[o0]+s+t+[a@]+/gi,
  /[a@]+r+r+[o0]+m+b+[a@]+d+[o0a@]+/gi,
  /v+[i1]+[a@]+d+[o0a@]+/gi,
  /[o0]+t+[aá@]+r+[i1]+[o0a@]+/gi,
  /[i1]+m+b+[e3]+c+[i1]+l+/gi,
  /[i1]+d+[i1]+[o0]+t+[a@]+/gi,
  /r+[e3]+t+[a@]+r+d+[a@]+d+[o0a@]+/gi,
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, '') // remove special chars
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ProfanityResult {
  isClean: boolean;
  isSuspicious: boolean; // masked words detected - needs admin review
  foundWords: string[];
  cleanedText: string;
}

export function checkProfanity(text: string): ProfanityResult {
  const normalized = normalize(text);
  const foundWords: string[] = [];
  let isClean = true;
  let isSuspicious = false;

  // Direct word match
  for (const word of OFFENSIVE_WORDS) {
    const normalizedWord = normalize(word);
    const regex = new RegExp(`\\b${normalizedWord}\\b`, 'gi');
    if (regex.test(normalized)) {
      foundWords.push(word);
      isClean = false;
    }
  }

  // Check for masked patterns in original text
  if (isClean) {
    const textLower = text.toLowerCase();
    // Check for dots/spaces between letters (e.g., "f.o.d.a", "m e r d a")
    const compacted = textLower.replace(/[.\-_*#@!$%&\s]/g, '');
    for (const word of OFFENSIVE_WORDS) {
      const normalizedWord = normalize(word);
      if (compacted.includes(normalizedWord) && !normalized.includes(normalizedWord)) {
        isSuspicious = true;
        foundWords.push(`${word} (mascarado)`);
      }
    }

    // Check regex patterns for letter substitutions
    for (const pattern of MASK_PATTERNS) {
      if (pattern.test(text)) {
        isSuspicious = true;
        if (!foundWords.some(w => w.includes('mascarado'))) {
          foundWords.push('possível ofensa mascarada');
        }
      }
      pattern.lastIndex = 0; // Reset regex
    }
  }

  return {
    isClean: isClean && !isSuspicious,
    isSuspicious,
    foundWords,
    cleanedText: text,
  };
}

export function getSuggestion(foundWords: string[]): string {
  return 'Por favor, reescreva sua avaliação removendo palavrões e xingamentos. Avaliações construtivas ajudam mais a comunidade!';
}
