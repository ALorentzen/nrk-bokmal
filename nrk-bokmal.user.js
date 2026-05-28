// ==UserScript==
// @name         NRK Bokmål
// @namespace    https://github.com/ALorentzen/nrk-bokmal
// @version      2.0.0
// @description  Konverterer nynorsk automatisk til bokmål på nrk.no
// @author       ALorentzen
// @match        *://*.nrk.no/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ALorentzen/nrk-bokmal/main/nrk-bokmal.user.js
// @downloadURL  https://raw.githubusercontent.com/ALorentzen/nrk-bokmal/main/nrk-bokmal.user.js
// ==/UserScript==

'use strict';

const NN_TO_NB = {

  // ━━━ PRONOUNS
  'eg':'jeg','ho':'hun','dei':'de','deira':'deres','deim':'dem',
  'dykk':'dere','dykkar':'deres',

  // ━━━ DETERMINERS
  'ein':'en','eit':'et','kvar':'hver','kvart':'hvert','kvarandre':'hverandre',
  'noko':'noe','nokon':'noen','nokre':'noen','korkje':'verken',

  // ━━━ NEGATION
  'ikkje':'ikke',

  // ━━━ QUESTION WORDS
  'kva':'hva','kven':'hvem','kor':'hvor','korleis':'hvordan',
  'kvifor':'hvorfor','korfor':'hvorfor',

  // ━━━ CONJUNCTIONS
  'medan':'mens','anten':'enten','elles':'ellers','òg':'også','dessutan':'dessuten',

  // ━━━ ADVERBS
  'no':'nå','framleis':'fremdeles','allereie':'allerede',
  'tidleg':'tidlig','tidlege':'tidlige','tidlegare':'tidligere','tidlegast':'tidligst',
  'seint':'sent','seinare':'senere','seinast':'senest',
  'sidan':'siden','berre':'bare','mykje':'mye','meir':'mer',
  'sjølv':'selv','sjølve':'selve','sjølvsagt':'selvfølgelig',
  'eigentleg':'egentlig','eigentlege':'egentlige',
  'annleis':'annerledes','saman':'sammen',
  'særleg':'særlig','særlege':'særlige',
  'truleg':'trolig','trulegvis':'troligvis',
  'mogleg':'mulig','moglege':'mulige','mogeleg':'mulig','mogelege':'mulige',
  'nærmare':'nærmere','nærast':'nærmest',
  'høgt':'høyt','høgare':'høyere','høgast':'høyest',
  'lågt':'lavt','lågare':'lavere','lågast':'lavest',
  'kring':'rundt','ikring':'rundt',
  'ifølgje':'ifølge','vanlegvis':'vanligvis',
  'tilsynelatande':'tilsynelatende',

  // ━━━ ADJECTIVES
  'gammal':'gammel','gamal':'gammel','gamale':'gamle','gamalt':'gammelt',
  'heil':'hel','heile':'hele','heilt':'helt',
  'dårleg':'dårlig','dårlege':'dårlige','dårlegare':'dårligere','dårlegast':'dårligst',
  'viktigare':'viktigere',
  'raud':'rød','raude':'røde','raudt':'rødt',
  'grøn':'grønn','grøne':'grønne',
  'kvit':'hvit','kvite':'hvite','kvitt':'hvitt',
  'høg':'høy','høge':'høye',
  'låg':'lav','låge':'lave',
  'brei':'bred','breie':'brede','breitt':'bredt',
  'open':'åpen','opne':'åpne','opent':'åpent',
  'nøgd':'fornøyd','nøgde':'fornøyde',
  'sjuk':'syk','sjuke':'syke','sjukt':'sykt',
  'farleg':'farlig','farlege':'farlige','farlegare':'farligere',
  'ufarleg':'ufarlig','ufarlege':'ufarlige',
  'alvorleg':'alvorlig','alvorlege':'alvorlige','alvorlegare':'alvorligere',
  'tydeleg':'tydelig','tydelege':'tydelige',
  'naturleg':'naturlig','naturlege':'naturlige',
  'vanleg':'vanlig','vanlege':'vanlige',
  'uvanleg':'uvanlig','uvanlege':'uvanlige',
  'sannsynleg':'sannsynlig','sannsynlege':'sannsynlige',
  'vanskeleg':'vanskelig','vanskelege':'vanskelige',
  'betre':'bedre','sterkare':'sterkere',
  'veik':'svak','veike':'svake','veikare':'svakere',

  // ━━━ VERBS: to be / become
  'vera':'være','vere':'være',
  'vert':'blir','vart':'ble','vorte':'blitt','vorten':'blitt',

  // ━━━ VERBS: irregular
  'gjera':'gjøre','gjere':'gjøre','gjer':'gjør',
  'koma':'komme','kome':'komme','kjem':'kommer',
  'sjå':'se','såg':'så',
  'seia':'si','seie':'si','seier':'sier',
  'gje':'gi','gjev':'gir','gav':'ga','gjeve':'gitt',
  'fann':'fant','funne':'funnet',
  'veit':'vet','skreiv':'skrev','gjekk':'gikk',
  'tek':'tar','tekne':'tatt',
  'heiter':'heter','heitte':'het',
  'fekk':'fikk',
  'ligg':'ligger','liggje':'ligge','legg':'legger',
  'stod':'sto',
  'sel':'selger','selde':'solgte','seld':'solgt','selje':'selge',
  'veks':'vokser','vekse':'vokse','vekste':'vokste',

  // ━━━ VERBS: present -ar → -er
  'spelar':'spiller','trenar':'trener','heiar':'heier',
  'elskar':'elsker','jobbar':'jobber','snakkar':'snakker',
  'tenkjer':'tenker','følgjer':'følger','hugsar':'husker',
  'ventar':'venter','endrar':'endrer','søkjer':'søker',
  'håpar':'håper','meiner':'mener','meinte':'mente','meina':'mene',
  'prøvar':'prøver','brukar':'bruker',
  'bur':'bor','budde':'bodde','budd':'bodd',
  'kjende':'kjente',
  'køyrer':'kjører','køyrde':'kjørte','køyre':'kjøre','køyrt':'kjørt',
  'opnar':'åpner','opna':'åpnet',
  'stengjer':'stenger','stengde':'stengte',
  'arbeidar':'arbeider',
  'løyser':'løser','løyste':'løste','løyse':'løse','løyst':'løst',
  'tydar':'betyr','tyde':'bety',
  'skapar':'skaper','skapte':'skapte',
  'bidreg':'bidrar','ryddar':'rydder','styrde':'styrte',
  'skriv':'skriver',

  // ━━━ VERBS: past -a → -et
  'kasta':'kastet','snakka':'snakket','starta':'startet',
  'stoppa':'stoppet','jobba':'jobbet','prata':'pratet',
  'endra':'endret','skada':'skadet','elska':'elsket',
  'feira':'feiret','trua':'truet','venta':'ventet',
  'ramma':'rammet','overraska':'overrasket','skuffa':'skuffet',
  'fanga':'fanget','bruka':'brukt','sjokkera':'sjokkert','sjokka':'sjokkert',
  'tapa':'tapt','spela':'spilt','trena':'trent',
  'rekna':'regnet','teikna':'tegnet','støtta':'støttet',
  'hjelpa':'hjulpet','bekymra':'bekymret','redda':'reddet',
  'passa':'passet','henta':'hentet','senka':'senket',
  'løfta':'løftet','samla':'samlet','skaffa':'skaffet',
  'berga':'berget','hindra':'hindret','nekta':'nektet',
  'tvinga':'tvunget','lova':'lovet','spora':'sporet',

  // ━━━ NOUNS: different stem
  'heim':'hjem','heimen':'hjemmet','heimar':'hjem','heimane':'hjemmene',
  'stad':'sted','staden':'stedet','stader':'steder','stadene':'stedene',
  'gong':'gang','gongen':'gangen','gonger':'ganger','gongene':'gangene',
  'born':'barn','bornet':'barnet','borna':'barna',
  'hand':'hånd','handa':'hånden',
  'auge':'øye','auget':'øyet','augo':'øynene','augene':'øynene',
  'veg':'vei','vegen':'veien','vegar':'veier','vegane':'veiene',
  'skule':'skole','skulen':'skolen','skular':'skoler','skulane':'skolene',
  'veke':'uke','veka':'uken','veker':'uker','vekene':'ukene',
  'vatn':'vann','vatnet':'vannet',
  'sjukehus':'sykehus','sjukehuset':'sykehuset',
  'sjukeheim':'sykehjem','sjukeheimen':'sykehjemmet','sjukeheimar':'sykehjem',
  'sjukdom':'sykdom','sjukdomen':'sykdommen',
  'sjukepleiar':'sykepleier','sjukepleiarar':'sykepleiere',
  'mjølk':'melk','mjølka':'melken',
  'nase':'nese','nasen':'nesen',
  'braud':'brød','braudet':'brødet',
  'son':'sønn','sonen':'sønnen',
  'dotter':'datter','dottera':'datteren','døtrer':'døtre',
  'morgon':'morgen','morgonen':'morgenen','morgonar':'morgener',
  'vêr':'vær','vêret':'været',
  'fridom':'frihet','fridomen':'friheten',
  'val':'valg','valet':'valget',
  'tal':'tall','talet':'tallet',
  'vindauge':'vindu','vindauget':'vinduet','vindauger':'vinduer',
  'løysing':'løsning','løysinga':'løsningen','løysingar':'løsninger','løysingane':'løsningene',
  'leiar':'leder','leiaren':'lederen','leiarar':'ledere','leiarane':'lederne',
  'leiing':'ledelse','leiinga':'ledelsen',
  'nyheit':'nyhet','nyheita':'nyheten','nyheiter':'nyheter','nyheitene':'nyhetene',
  'lærar':'lærer','læraren':'læreren','lærarar':'lærere','lærarane':'lærerne',
  'fiskar':'fisker','fiskaren':'fiskeren','fiskarar':'fiskere',
  'pengar':'penger','pengane':'pengene',
  'moglegheit':'mulighet','moglegheita':'muligheten',
  'moglegheiter':'muligheter','moglegheitene':'mulighetene',
  'vinnar':'vinner','vinnaren':'vinneren','vinnarar':'vinnere','vinnarane':'vinnerne',
  'deltakar':'deltaker','deltakaren':'deltakeren',
  'deltakarar':'deltakere','deltakarane':'deltakerne',
  'spelarar':'spillere','spelaren':'spilleren',
  'trenarar':'trenere','trenaren':'treneren',
  'arbeidaren':'arbeideren','arbeidarar':'arbeidere','arbeidarane':'arbeiderne',
  'meining':'mening','meininga':'meningen','meiningar':'meninger','meiningane':'meningene',
  'tyding':'betydning','tydinga':'betydningen','tydingar':'betydninger',

  // ━━━ NOUNS: feminine definitives -a → -en
  'boka':'boken','visa':'visen','gata':'gaten','saka':'saken',
  'tida':'tiden','sola':'solen','jorda':'jorden','verda':'verden',
  'kvinna':'kvinnen','regjeringa':'regjeringen','stjerna':'stjernen',
  'mora':'moren','søstera':'søsteren','klokka':'klokken','elva':'elven',
  'krafta':'kraften','kona':'konen','jenta':'jenten',
  'bygda':'bygden','lova':'loven','natta':'natten','krisa':'krisen',
  'evna':'evnen','skjebna':'skjebnen',
  'avisa':'avisen','ruta':'ruten','kjensla':'følelsen',
  'oppgåva':'oppgaven','linja':'linjen','klassa':'klassen',
  'lista':'listen','regla':'regelen','gåva':'gaven',
  'forma':'formen','norma':'normen','planta':'planten',
  'grensa':'grensen','historia':'historien',

  // ━━━ NOUNS: plural -ar → -er
  'bilar':'biler','gutar':'gutter','gutane':'guttene',
  'båtar':'båter','dagar':'dager','hagar':'hager',
  'byar':'byer','byane':'byene','månader':'måneder','månaden':'måneden',
  'fjordar':'fjorder','fjordane':'fjordene',
  'skogar':'skoger','skogane':'skogene',
  'elvar':'elver','elvane':'elvene',
  'elevar':'elever','elevane':'elevene',
  'kampar':'kamper','kampane':'kampene',
  'kommunar':'kommuner','kommunane':'kommunene',
  'prisar':'priser','prisane':'prisene',
  'rapportar':'rapporter','rapportane':'rapportene',
  'bussar':'busser','bussane':'bussene',
  'ministar':'ministre',
  'påstandar':'påstander','påstandane':'påstandene',
  'grunnar':'grunner','grunnane':'grunnene',
  'endringar':'endringer','endringane':'endringene',
  'opplysningar':'opplysninger','opplysningane':'opplysningene',
  'krisar':'kriser','krisane':'krisene',
  'sønar':'sønner','temaar':'temaer','årar':'årer',
  'tilhøve':'forhold','tilhøvet':'forholdet',

  // ━━━ NOUNS: definite plural -a → -ene
  'husa':'husene','åra':'årene','landa':'landene','fjella':'fjellene',
  'partia':'partiene','tiltaka':'tiltakene','problema':'problemene',
  'bilane':'bilene','dagane':'dagene','tala':'tallene',
  'borna':'barna','vegane':'veiene',

  // ━━━ SPORTS
  'vann':'vant','tapar':'taper',

  // ━━━ INSTITUTIONS / POLITICS
  'stortingsvalet':'stortingsvalget','kommunevalet':'kommunevalget',
  'lovar':'lover','lovane':'lovene',
  'rettane':'rettighetene','rettar':'rettigheter',
  'fylka':'fylkene',

  // ━━━ WEATHER
  'skya':'skyen','temperaturar':'temperaturer','temperaturane':'temperaturene',
};

// ─── Engine ──────────────────────────────────────────────────────────────────

const SKIP_TAGS = new Set([
  'script','style','noscript','code','pre','input','textarea','select','option',
]);

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
  const mapped = NN_TO_NB[lower];
  if (mapped !== undefined) return preserveCase(word, mapped);

  // -ane → -ene  (definite plural)
  if (lower.length >= 6 && lower.endsWith('ane')) {
    return word.slice(0, -3) + preserveCase(word.slice(-3), 'ene');
  }

  // -inga → -ingen  (definite of -ing nouns)
  if (lower.length >= 7 && lower.endsWith('inga')) {
    return word.slice(0, -4) + preserveCase(word.slice(-4), 'ingen');
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
