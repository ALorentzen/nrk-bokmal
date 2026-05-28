'use strict';

// Nynorsk → Bokmål dictionary (lowercase keys, case restored on match)
// Dictionary takes priority over suffix rules — use it for irregular forms
const NN_TO_NB = {
  // Articles
  'ein': 'en',

  // Personal pronouns
  'eg': 'jeg',
  'ho': 'hun',
  'dei': 'de',
  'deira': 'deres',
  'deim': 'dem',
  'dykk': 'dere',
  'dykkar': 'deres',

  // Negation
  'ikkje': 'ikke',

  // Question words
  'kva': 'hva',
  'kven': 'hvem',
  'kor': 'hvor',
  'korleis': 'hvordan',
  'kvifor': 'hvorfor',
  'korfor': 'hvorfor',

  // Indefinite pronouns / determiners
  'kvar': 'hver',
  'kvart': 'hvert',
  'kvarandre': 'hverandre',
  'noko': 'noe',
  'nokon': 'noen',
  'nokre': 'noen',

  // Time / manner adverbs
  'no': 'nå',
  'då': 'da',
  'framleis': 'fremdeles',
  'allereie': 'allerede',
  'tidleg': 'tidlig',
  'tidlege': 'tidlige',
  'tidlegare': 'tidligere',
  'seint': 'sent',
  'seinare': 'senere',
  'sidan': 'siden',

  // Verb: to be / become
  'vera': 'være',
  'vere': 'være',
  'vert': 'blir',
  'vart': 'ble',
  'vorte': 'blitt',

  // Common verb forms
  'gjera': 'gjøre',
  'gjere': 'gjøre',
  'koma': 'komme',
  'kome': 'komme',
  'kjem': 'kommer',
  'sjå': 'se',
  'seia': 'si',
  'seie': 'si',
  'gje': 'gi',
  'gjev': 'gir',
  'gav': 'ga',
  'fann': 'fant',
  'veit': 'vet',
  'skreiv': 'skrev',
  'meine': 'mene',
  'meiner': 'mener',
  'meinte': 'mente',
  'meina': 'mene',
  'meining': 'mening',
  'ligg': 'ligger',
  'liggje': 'ligge',
  'fekk': 'fikk',
  'gjekk': 'gikk',
  'tek': 'tar',
  'heiter': 'heter',
  'heitte': 'het',
  'tenkjer': 'tenker',
  'følgjer': 'følger',
  'spelar': 'spiller',
  'spelarar': 'spillere',
  'trenar': 'trener',
  'trenarar': 'trenere',
  'elskar': 'elsker',
  'heiar': 'heier',

  // Past participles: Nynorsk -a → Bokmål -et/-t
  // These must be in the dictionary so they get -et, not -en from the suffix rule
  'overraska': 'overrasket',
  'kasta': 'kastet',
  'snakka': 'snakket',
  'endra': 'endret',
  'skuffa': 'skuffet',
  'stoppa': 'stoppet',
  'ramma': 'rammet',
  'fanga': 'fanget',
  'venta': 'ventet',
  'skada': 'skadet',
  'elska': 'elsket',
  'feira': 'feiret',
  'bekymra': 'bekymret',
  'trua': 'truet',
  'sjokkera': 'sjokkert',
  'sjokka': 'sjokkert',
  'tapa': 'tapt',
  'vist': 'vist',
  'sett': 'sett',
  'funne': 'funnet',
  'tekne': 'tatt',
  'bruka': 'brukt',
  'blokka': 'blokkert',

  // Adjectives / adverbs
  'berre': 'bare',
  'heile': 'hele',
  'heilt': 'helt',
  'heil': 'hel',
  'mykje': 'mye',
  'meir': 'mer',
  'gammal': 'gammel',
  'gamal': 'gammel',
  'eigentleg': 'egentlig',
  'annleis': 'annerledes',
  'saman': 'sammen',
  'sjølv': 'selv',
  'sjølvsagt': 'selvfølgelig',
  'dårleg': 'dårlig',
  'dårlege': 'dårlige',
  'viktigare': 'viktigere',
  'raud': 'rød',
  'raude': 'røde',
  'grøn': 'grønn',
  'grøne': 'grønne',
  'kvit': 'hvit',
  'kvite': 'hvite',

  // Conjunctions / discourse markers
  'medan': 'mens',
  'anten': 'enten',
  'elles': 'ellers',
  'òg': 'også',
  'dessutan': 'dessuten',

  // Common nouns (short ones that length >= 5 rule would miss)
  'saka': 'saken',
  'visa': 'visen',
  'gata': 'gaten',
  'boka': 'boken',

  // Longer definite nouns and compound forms (also caught by -a rule, but dict is cleaner)
  'stjerna': 'stjernen',
  'verda': 'verden',
  'kvinna': 'kvinnen',
  'jorda': 'jorden',
  'regjeringa': 'regjeringen',

  // Common nouns (other)
  'heim': 'hjem',
  'stad': 'sted',
  'gong': 'gang',
  'gonger': 'ganger',
};

const SKIP_TAGS = new Set([
  'script', 'style', 'noscript', 'code', 'pre',
  'input', 'textarea', 'select', 'option',
]);

const VOWELS = new Set('aeiouæøå');

function preserveCase(original, replacement) {
  if (!original || !replacement) return replacement;
  if (original === original.toUpperCase() && original.length > 1) return replacement.toUpperCase();
  if (original[0] !== original[0].toLowerCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function convertWord(word) {
  const lower = word.toLowerCase();

  // 1. Dictionary (highest priority — handles irregular forms like past participles)
  const mapped = NN_TO_NB[lower];
  if (mapped !== undefined) return preserveCase(word, mapped);

  // 2. -ane → -ene  (definite plural: "bilane" → "bilene")
  if (lower.length >= 6 && lower.endsWith('ane')) {
    return word.slice(0, -3) + preserveCase(word.slice(-3), 'ene');
  }

  // 3. -inga → -ingen  (definite of -ing nouns: "turneringa" → "turneringen")
  if (lower.length >= 7 && lower.endsWith('inga')) {
    return word.slice(0, -4) + preserveCase(word.slice(-4), 'ingen');
  }

  // 4. -a → -en  (Nynorsk feminine definite: "fotballstjerna" → "fotballstjernen")
  //    Only applies to lowercase-initial words — skips proper nouns like "Carolina", "Amerika".
  if (
    lower.length >= 5 &&
    lower.endsWith('a') &&
    !VOWELS.has(lower[lower.length - 2]) &&
    word[0] === lower[0]  // lowercase-initial = not a proper noun
  ) {
    return word.slice(0, -1) + 'en';
  }

  return word;
}

function convertText(text) {
  return text.replace(/[a-zA-ZæøåÆØÅòÒ]+/g, convertWord);
}

const processed = new WeakSet();

function convertElement(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p || SKIP_TAGS.has(p.tagName.toLowerCase())) return NodeFilter.FILTER_REJECT;
      if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  let n;
  while ((n = walker.nextNode())) {
    if (!processed.has(n)) nodes.push(n);
  }

  for (const node of nodes) {
    processed.add(node);
    const original = node.textContent;
    const converted = convertText(original);
    if (converted !== original) node.textContent = converted;
  }
}

function run() {
  if (document.body) convertElement(document.body);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}

new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        convertElement(node);
      } else if (node.nodeType === Node.TEXT_NODE && !processed.has(node)) {
        processed.add(node);
        const original = node.textContent;
        const converted = convertText(original);
        if (converted !== original) node.textContent = converted;
      }
    }
  }
}).observe(document.documentElement, { childList: true, subtree: true });
