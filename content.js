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

// Compound-stem fallback for words not in dictionary
// Handles nynorsk stems inside longer compound words not in the dictionary
const COMPOUND_STEMS = [
  [/sommar/gi, (m) => preserveCase(m, 'sommer')],
  [/haust/gi,  (m) => preserveCase(m, 'høst')],
  [/sjuke/gi,  (m) => preserveCase(m, 'syke')],
  [/skulen/gi, (m) => preserveCase(m, 'skolen')],
  [/skule/gi,  (m) => preserveCase(m, 'skole')],
  [/vatn/gi,   (m) => preserveCase(m, 'vann')],
];

function convertWord(word) {
  const lower = word.toLowerCase();
  const mapped = NN_TO_NB[lower];
  if (mapped !== undefined) return preserveCase(word, mapped);

  // Compound stem fallback: "sommarfiske" → "sommerfiske"
  if (lower.length >= 6) {
    let w = word;
    for (const [pattern, fn] of COMPOUND_STEMS) {
      w = w.replace(pattern, fn);
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
