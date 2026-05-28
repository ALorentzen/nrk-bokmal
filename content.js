'use strict';
// NN_TO_NB is loaded from dictionary.js before this file runs
// 65,000+ word form mappings from Norsk Ordbank + curated entries

const SKIP_TAGS = new Set([
  'script', 'style', 'noscript', 'code', 'pre',
  'input', 'textarea', 'select', 'option',
]);

function preserveCase(original, replacement) {
  if (!original || !replacement) return replacement;
  if (original === original.toUpperCase() && original.length > 1) return replacement.toUpperCase();
  if (original[0] !== original[0].toLowerCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

// Nynorsk-specific stems that occur inside compound words not in the dictionary.
// Each entry: [regex, replacement_string]  (regex is applied to full word token)
const COMPOUND_STEMS = [
  // seasons / common stems
  [/sommar/g, 'sommer'],  [/Sommar/g, 'Sommer'],  [/SOMMAR/g, 'SOMMER'],
  [/haust/g,  'høst'],    [/Haust/g,  'Høst'],    [/HAUST/g,  'HØST'],
  // sick / health
  [/sjuke/g,  'syke'],    [/Sjuke/g,  'Syke'],
  // school
  [/skulen/g, 'skolen'],  [/Skulen/g, 'Skolen'],
  [/skule/g,  'skole'],   [/Skule/g,  'Skole'],
  // water
  [/vatn/g,   'vann'],    [/Vatn/g,   'Vann'],
  [/vass/g,   'vann'],    [/Vass/g,   'Vann'],
  // service / tjeneste  (teneste = standalone, tenesta = definite)
  [/tenesta/g,'tjenesta'],[/Tenesta/g,'Tjenesta'],
  [/teneste/g,'tjeneste'],[/Teneste/g,'Tjeneste'],
  // giver/donor (arbeidsgjevar → arbeidsgiver)
  [/gjevar/g, 'giver'],   [/Gjevar/g, 'Giver'],
  // eier/owner
  [/eigar/g,  'eier'],    [/Eigar/g,  'Eier'],
];

function convertWord(word) {
  const lower = word.toLowerCase();

  // 1. Dictionary lookup — 65,000+ explicit NN→BM forms
  const mapped = NN_TO_NB[lower];
  if (mapped !== undefined) return preserveCase(word, mapped);

  // 2. Compound-stem substitution
  //    Replaces NN-specific sub-stems inside compound words the dict doesn't cover.
  //    e.g. "sommarfiske" → "sommerfiske", "helsetenesta" → "helsetjenesta"
  //    After stem replacement the suffix rules below still run on the result.
  let working = word;
  if (lower.length >= 6) {
    for (const [pattern, replacement] of COMPOUND_STEMS) {
      working = working.replace(pattern, replacement);
    }
    if (working !== word) {
      // Check if the stem-replaced form is already in the dictionary
      const remapped = NN_TO_NB[working.toLowerCase()];
      if (remapped !== undefined) return preserveCase(working, remapped);
      // Otherwise fall through to suffix rules using the stem-replaced form
    }
  }

  // 3. Morphological suffix rules — Norwegian grammar fallback.
  //    Covers inflected forms of any NN word not yet in the dictionary.
  //    Applied to `working` so stem-replaced compounds also benefit.
  const wl = working.toLowerCase();

  // -ane → -ene  (definite plural: "bilane"→"bilene", "kommunane"→"kommunene")
  if (wl.length >= 6 && wl.endsWith('ane')) {
    return working.slice(0, -3) + preserveCase(working.slice(-3), 'ene');
  }
  // -inga → -ingen  (def. of -ing nouns: "turneringa"→"turneringen")
  if (wl.length >= 7 && wl.endsWith('inga')) {
    return working.slice(0, -4) + preserveCase(working.slice(-4), 'ingen');
  }
  // -are → -ere  (comparative: "finare"→"finere", "raskare"→"raskere")
  if (wl.length >= 6 && wl.endsWith('are')) {
    return working.slice(0, -3) + preserveCase(working.slice(-3), 'ere');
  }
  // -aste → -este  (superlative: "finaste"→"fineste", "flottaste"→"flotteste")
  if (wl.length >= 6 && wl.endsWith('aste')) {
    return working.slice(0, -4) + preserveCase(working.slice(-4), 'este');
  }
  // -ar → -er  (indefinite plural: "kommunar"→"kommuner", "politikarar"→"politikarer")
  //   7+ chars avoids ambiguous short words
  if (wl.length >= 7 && wl.endsWith('ar')) {
    return working.slice(0, -2) + preserveCase(working.slice(-2), 'er');
  }

  // Return stem-replaced form if anything changed, else original
  return working;
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
