'use strict';
// NN_TO_NB is loaded from dictionary.js before this file runs

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

// Nynorsk stems that appear inside compound words (e.g. "sommarfiske" → "sommerfiske")
const COMPOUND_STEMS = [
  [/sommar/g, 'sommer'],
  [/Sommar/g, 'Sommer'],
  [/SOMMAR/g, 'SOMMER'],
  [/haust/g,  'høst'],
  [/Haust/g,  'Høst'],
  [/HAUST/g,  'HØST'],
  [/sjuke/g,  'syke'],
  [/Sjuke/g,  'Syke'],
  [/skulen/g, 'skolen'],
  [/skule/g,  'skole'],
  [/vatn/g,   'vann'],
  [/Vatn/g,   'Vann'],
];

function convertWord(word) {
  const lower = word.toLowerCase();
  const mapped = NN_TO_NB[lower];
  if (mapped !== undefined) return preserveCase(word, mapped);

  // -ane → -ene  (definite plural: "bilane" → "bilene", "kampane" → "kampene")
  if (lower.length >= 6 && lower.endsWith('ane')) {
    return word.slice(0, -3) + preserveCase(word.slice(-3), 'ene');
  }

  // -inga → -ingen  (definite of -ing nouns: "turneringa" → "turneringen")
  if (lower.length >= 7 && lower.endsWith('inga')) {
    return word.slice(0, -4) + preserveCase(word.slice(-4), 'ingen');
  }

  // Compound stem replacement: handles "sommarfiske" → "sommerfiske" etc.
  if (lower.length >= 6) {
    let w = word;
    for (const [pattern, replacement] of COMPOUND_STEMS) {
      w = w.replace(pattern, replacement);
    }
    if (w !== word) return w;
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
