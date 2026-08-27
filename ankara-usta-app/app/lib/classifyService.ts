import { Service, services } from '../data/serviceTaxonomy';

export type ClassificationCandidate = {
  service: Service;
  score: number;
  matchedTerms: string[];
  explanation: string;
};

export type ClassificationResult = {
  query: string;
  confidence: 'high' | 'medium' | 'low';
  candidates: ClassificationCandidate[];
};

const stopWords = new Set(['bir','bu','icin','istiyorum','lazim','gerek','var','ve','ile','usta','ustasi','yardim']);

function normalize(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value: string) {
  return normalize(value).split(' ').filter((token) => token.length > 1 && !stopWords.has(token));
}

function scoreService(query: string, service: Service) {
  const normalizedQuery = normalize(query);
  const queryTokens = new Set(tokens(query));
  const phrases = [service.name, ...service.aliases].map(normalize);
  let score = 0;

  for (const phrase of phrases) {
    if (normalizedQuery === phrase) score = Math.max(score, 100);
    else if (normalizedQuery.includes(phrase) || phrase.includes(normalizedQuery)) score = Math.max(score, 82);

    const phraseTokens = tokens(phrase);
    const matchedTokens = phraseTokens.filter((token) => queryTokens.has(token));
    if (matchedTokens.length) {
      const coverage = matchedTokens.length / Math.max(phraseTokens.length, queryTokens.size);
      score = Math.max(score, Math.round(20 + coverage * 60));
    }
  }

  return score;
}

function explainMatch(query: string, service: Service) {
  const queryWords = query
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-z0-9çğıöşü\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({display: word, normalized: normalize(word)}));
  const serviceTokens = new Set([service.name, ...service.aliases].flatMap(tokens));
  const matchedTerms = Array.from(new Set(
    queryWords
      .filter(({normalized}) => Array.from(serviceTokens).some((token) =>
        token === normalized || (token.length >= 5 && normalized.length >= 5 && token.slice(0, 5) === normalized.slice(0, 5)),
      ))
      .map(({display}) => display),
  )).slice(0, 3);

  const explanation = matchedTerms.length
    ? `“${matchedTerms.join('” ve “')}” ifadeleri bu hizmetle eşleşiyor.`
    : `Yazdığınız ihtiyaç, ${service.name.toLocaleLowerCase('tr-TR')} kapsamına en yakın görünüyor.`;

  return {matchedTerms, explanation};
}

export function classifyService(query: string): ClassificationResult {
  const candidates = services
    .map((service) => ({service, score: scoreService(query, service), ...explainMatch(query, service)}))
    .filter((candidate) => candidate.score >= 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const topScore = candidates[0]?.score ?? 0;
  const lead = topScore - (candidates[1]?.score ?? 0);
  const confidence = topScore >= 80 && lead >= 15 ? 'high' : topScore >= 52 ? 'medium' : 'low';

  return {query, confidence, candidates};
}
