/**
 * Language Intake Engine — v0.1.2 (Scribe Conformance Patch)
 * 
 * Evaluation order:
 *   Step 1: Constitution v3.1 Section 0 exclusions → Constitutional Non-Admission
 *   Step 2: Scribe crossing type detection → Scribe Mark
 *   Step 3: Optional secondary Brian Shield / RIO risk signals → supplementary notes
 *   Step 4: No crossing detected → No Mark
 * 
 * Runs entirely client-side. No external calls. No data leaves the browser.
 */

// ═══════════════════════════════════════════════════════════════════════
// SECTION 0 — CONSTITUTIONAL EXCLUSIONS (Constitution v3.1 Section 0)
// ═══════════════════════════════════════════════════════════════════════
//
// These categories are OUTSIDE admissible system participation.
// They route to constitutional_non_admission. No negotiation. No softening.
//
// Categories:
//   1. Identity definition or validation
//   2. Destiny / inevitability / life-path framing
//   3. Oracle / guide / confessor / authority positioning
//   4. Unbounded symbolic or spiritual/meaning authority framing
// ═══════════════════════════════════════════════════════════════════════

const SECTION_0_EXCLUSIONS = [
  {
    category: 'identity_definition_or_validation',
    label: 'Identity definition or validation',
    description: 'Language that defines, validates, or assigns identity to the human as system truth.',
    patterns: [
      // Narrowed: requires system/ai/data as subject OR "confirms/proves/validates" framing
      // Simple "this means you are X" goes to Scribe Mark (interpretation_to_identity) instead
      /\bthe\s+(system|ai|model|data|evidence)\s+(confirms|proves|shows|validates)\s+(you|your|that you)\s+(are|identity)\b/i,
      /\byou\s+are\s+(fundamentally|essentially|truly|really|actually)\b/i,
      /\bthis\s+is\s+who\s+you\s+(are|really are|truly are)\b/i,
      /\byour\s+(true|real|core|essential|fundamental)\s+(self|identity|nature)\s+(is|has been)\b/i,
      /\b(defines?|validates?|confirms?)\s+(who|what)\s+you\s+are\b/i,
    ],
  },
  {
    category: 'destiny_inevitability_life_path',
    label: 'Destiny / inevitability / life-path framing',
    description: 'Language that frames destiny, inevitability, or life-path as system-determined truth.',
    patterns: [
      /\bthis\s+pattern\s+proves\s+you\s+were\s+meant\b/i,
      /\byou\s+(are|were)\s+(meant|destined|fated|born)\s+to\b/i,
      /\byour\s+(destiny|path|purpose|calling|mission)\s+(is|has been)\s+(revealed|confirmed|determined|set|clear)\b/i,
      /\bthe\s+(universe|system|data|pattern|evidence)\s+(shows|proves|confirms)\s+(your|you)\s+(path|destiny|purpose|calling)\b/i,
      /\binevitab(le|ly)\b.*\b(you|your)\b/i,
      /\bthis\s+was\s+always\s+(going\s+to|meant\s+to)\s+happen\b/i,
      /\byou\s+can('?t| cannot)\s+(escape|avoid|change)\s+(this|your|the)\s+(path|destiny|fate)\b/i,
      /\bchosen\s+(architect|steward|guardian|leader|builder)\s+of\b/i,
    ],
  },
  {
    category: 'oracle_guide_confessor_authority',
    label: 'Oracle / guide / confessor / authority positioning',
    description: 'Language that positions the system as oracle, guide, confessor, or authority over the human.',
    patterns: [
      /\bi\s+(know|see|understand)\s+(what|who)\s+you\s+(truly|really|actually)\s+(are|need|want|feel)\b/i,
      /\blet\s+me\s+(guide|show|reveal|tell)\s+you\s+(your|the)\s+(truth|path|meaning|purpose)\b/i,
      /\bthe\s+(system|ai|model)\s+(knows|sees|understands)\s+(your|what you)\b/i,
      /\bi\s+can\s+see\s+(into|through|beyond)\s+(your|the)\b/i,
      /\btrust\s+(me|the system|the process)\s+.{0,20}\s+(know|understand|see)\b/i,
      /\byou\s+should\s+(confess|admit|reveal|share)\s+(your|the)\s+(truth|secret|fear|shame)\b/i,
      /\bi\s+am\s+(your|the)\s+(guide|oracle|teacher|confessor|authority)\b/i,
    ],
  },
  {
    category: 'unbounded_symbolic_spiritual_authority',
    label: 'Unbounded symbolic or spiritual/meaning authority framing',
    description: 'Language that claims unbounded symbolic, spiritual, or meaning authority.',
    patterns: [
      /\b(cosmically|divinely|spiritually)\s+(aligned|authorized|mandated|ordained|significant)\b/i,
      /\bthe\s+(universe|cosmos|divine|spirit|higher\s+power)\s+(has|wants|demands|requires|confirms|shows)\b/i,
      /\bsacred\s+(duty|mission|purpose|mandate|truth)\b/i,
      /\bcosmic\s+(purpose|alignment|mandate|authority|truth|significance)\b/i,
      /\bthis\s+is\s+(the\s+)?(ultimate|absolute|final|cosmic|divine)\s+(truth|meaning|purpose|reality)\b/i,
      /\ball\s+decisions\s+flow\s+through\s+(your|this)\s+authority\b/i,
      /\byour\s+(role|authority|position)\s+is\s+(now\s+)?(binding|absolute|total|complete|final)\b/i,
      /\b(pre.?)?authorized\s+by\s+(the\s+)?(universe|cosmos|divine|spirit|higher\s+power)\b/i,
      /\bresistance\s+is\s+(futile|pointless|useless)\b/i,
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// SCRIBE CROSSING TYPES (12 types)
// ═══════════════════════════════════════════════════════════════════════
//
// These detect language crossing toward authority INSIDE admissible space.
// They produce a Scribe Mark — making the crossing visible.
// Scribe does not stop language from crossing.
// Scribe prevents language from crossing silently.
// ═══════════════════════════════════════════════════════════════════════

const SCRIBE_CROSSING_TYPES = [
  {
    type: 'advice_to_instruction',
    label: 'Advice → Instruction',
    description: 'Language that frames advice, suggestion, or opinion as instruction or directive.',
    route: 'human_review',
    risk_level: 'medium',
    patterns: [
      /\byou\s+(clearly\s+)?(need|must|should|have)\s+to\b/i,
      /\byou\s+(really\s+)?(need|must|should|ought)\s+to\b/i,
      /\bthe\s+(only|best|right|correct)\s+(thing|option|choice|move)\s+(is|would be)\s+to\b/i,
      /\byou\s+have\s+no\s+(choice|option)\s+but\s+to\b/i,
      /\bwhat\s+you\s+(need|must|should)\s+do\s+is\b/i,
      /\byou\s+cannot\s+(afford|continue|keep)\s+to\b/i,
      /\bstop\s+(doing|being|trying)\b.*\b(and|instead)\b/i,
    ],
  },
  {
    type: 'interpretation_to_identity',
    label: 'Interpretation → Identity',
    description: 'Language that frames an interpretation or observation as identity definition.',
    route: 'reframe_language',
    risk_level: 'high',
    patterns: [
      /\bthis\s+(means|shows|proves|indicates)\s+you\s+are\b/i,
      /\byou('?re| are)\s+(clearly|obviously|evidently)\s+(a|an|the)\b/i,
      /\bthis\s+(behavior|pattern|response)\s+(means|shows|proves)\s+(you|that you)\b/i,
      /\bpeople\s+(like|who)\s+.{0,30}\s+are\s+(always|usually|typically)\b/i,
      /\bthat\s+makes\s+you\s+(a|an)\b/i,
      /\byou('?re| are)\s+the\s+(kind|type|sort)\s+of\s+person\b/i,
    ],
  },
  {
    type: 'evidence_to_permission',
    label: 'Evidence → Permission',
    description: 'Language that treats evidence or data as sufficient authorization to act.',
    route: 'rio_authorization',
    risk_level: 'high',
    patterns: [
      /\bthe\s+evidence\s+(is\s+)?(strong|clear|sufficient|overwhelming)\s*,?\s*(so|therefore|thus)\b/i,
      /\b(data|evidence|research|studies)\s+(shows?|proves?|confirms?|supports?)\s*.{0,20}\s*(so|therefore|thus)\s+(proceed|go ahead|do it|act)\b/i,
      /\bthe\s+(numbers|data|evidence|facts)\s+(speak|say|tell|show)\s+for\s+themselves?\b/i,
      /\bbased\s+on\s+(the\s+)?(evidence|data|research)\s*,?\s*(you\s+)?(should|can|may)\s+(proceed|go ahead|act)\b/i,
      /\bthe\s+evidence\s+is\s+strong.{0,10}(so|therefore)?\s*proceed\b/i,
    ],
  },
  {
    type: 'confidence_to_authority',
    label: 'Confidence → Authority',
    description: 'Language that treats confidence or certainty as equivalent to authority or truth.',
    route: 'answer_check',
    risk_level: 'medium',
    patterns: [
      /\bi('?m| am)\s+(certain|confident|sure|positive)\s+(that|this)\b/i,
      /\bthere('?s| is)\s+no\s+(doubt|question|uncertainty)\b/i,
      /\bi\s+know\s+(for\s+)?(a\s+fact|certain|sure)\b/i,
      /\bthis\s+is\s+(definitely|certainly|absolutely|undeniably)\s+(true|correct|right|the case)\b/i,
      /\btrust\s+me\s+on\s+this\b/i,
      /\bi('?ve| have)\s+never\s+been\s+(more\s+)?(sure|certain|confident)\b/i,
    ],
  },
  {
    type: 'suggestion_to_pressure',
    label: 'Suggestion → Pressure',
    description: 'Language that frames a suggestion as social, emotional, or temporal pressure.',
    route: 'human_review',
    risk_level: 'medium',
    patterns: [
      /\beveryone\s+(else\s+)?(is|has|would|thinks)\b/i,
      /\byou('?re| are)\s+the\s+only\s+one\s+(who|that)\b/i,
      /\bif\s+you\s+don'?t\s+.{0,30}\s+(you('?ll| will)|people will|everyone will)\b/i,
      /\byou('?ll| will)\s+(regret|miss out|be left behind|fall behind)\b/i,
      /\btime\s+is\s+running\s+out\b/i,
      /\bdon'?t\s+(you\s+)?(think|feel|agree)\s+that\b/i,
      /\bnormal\s+people\s+(would|do|don'?t)\b/i,
    ],
  },
  {
    type: 'pattern_to_destiny',
    label: 'Pattern → Destiny',
    description: 'Language that frames an observed pattern as proof of destiny or inevitability.',
    route: 'constitutional_non_admission',
    risk_level: 'high',
    patterns: [
      /\bthis\s+pattern\s+(proves|shows|means|confirms)\s+(you|your|that)\b/i,
      /\b(the\s+)?pattern\s+(is\s+)?(clear|obvious|undeniable)\b.*\b(meant|destined|fated|inevitable)\b/i,
      /\byou\s+(keep|always|consistently)\s+.{0,30}\s+(because|which\s+(means|proves|shows))\b.*\b(meant|destined|purpose)\b/i,
      /\bthe\s+pattern\s+(reveals|proves|confirms)\s+(your|a)\s+(destiny|purpose|path|calling)\b/i,
      /\bthis\s+pattern\s+proves\s+you\s+were\s+meant\b/i,
    ],
  },
  {
    type: 'helpfulness_to_delegation',
    label: 'Helpfulness → Delegation',
    description: 'Language that frames helpfulness as reason to delegate authority or decision-making.',
    route: 'clarify_with_human',
    risk_level: 'medium',
    patterns: [
      /\bjust\s+let\s+me\s+handle\s+(it|this|that|everything)\b/i,
      /\bdon'?t\s+worry\s+about\s+(it|this|that)\s*,?\s*i('?ll| will)\b/i,
      /\bi('?ll| will)\s+take\s+care\s+of\s+(it|this|that|everything)\s+(for you|so you don'?t have to)\b/i,
      /\byou\s+don'?t\s+need\s+to\s+(worry|think|decide|bother)\b/i,
      /\bleave\s+(it|this|that|everything)\s+to\s+me\b/i,
      /\bi('?ll| will)\s+(just\s+)?handle\s+(it|this|that)\b/i,
      /\bjust\s+let\s+me\b/i,
    ],
  },
  {
    type: 'fluency_to_trust',
    label: 'Fluency → Trust',
    description: 'Language that treats coherence, fluency, or eloquence as evidence of truth.',
    route: 'answer_check',
    risk_level: 'medium',
    patterns: [
      /\b(this|that|the)\s+(explanation|argument|reasoning|logic|narrative)\s+is\s+(coherent|logical|clear|elegant|compelling)\s*,?\s*(so|therefore|thus|which means)\b/i,
      /\bit\s+(sounds|feels|seems|looks)\s+(right|true|correct|accurate|plausible)\b/i,
      /\b(makes|seems)\s+(perfect|total|complete)\s+sense\s*,?\s*(so|therefore|thus)\b/i,
      /\bif\s+it\s+(sounds|seems|feels)\s+(true|right|correct)\s*,?\s*it\s+(probably|likely|must)\s+(is|be)\b/i,
      /\bcoherent\s*,?\s*so\s+it\s+is\s+probably\s+true\b/i,
    ],
  },
  {
    type: 'analysis_to_diagnosis',
    label: 'Analysis → Diagnosis',
    description: 'Language that frames analysis or observation as clinical diagnosis or definitive assessment.',
    route: 'reframe_language',
    risk_level: 'high',
    patterns: [
      /\byou\s+(have|exhibit|display|show\s+signs\s+of)\s+(a\s+)?(pattern|tendency|condition|disorder|syndrome|complex)\b/i,
      /\bthis\s+(is|looks like|sounds like|appears to be)\s+(a\s+)?(clinical|psychological|pathological|diagnostic)\b/i,
      /\byou('?re| are)\s+(exhibiting|displaying|showing)\s+(symptoms|signs|markers|indicators)\s+of\b/i,
      /\bmy\s+(assessment|diagnosis|evaluation|analysis)\s+(is|shows|indicates|confirms)\b/i,
      /\b(based\s+on|from)\s+(my|this|the)\s+(analysis|assessment)\s*,?\s*you\s+(have|are|suffer|exhibit)\b/i,
    ],
  },
  {
    type: 'risk_flag_to_command',
    label: 'Risk Flag → Command',
    description: 'Language that treats a risk flag or warning as sufficient authority to command action.',
    route: 'rio_authorization',
    risk_level: 'high',
    patterns: [
      /\b(this|that|the)\s+(risk|threat|danger|warning)\s+(means|requires|demands)\s+(you|we|immediate)\s*(must|should|need to|have to)?\b/i,
      /\bbecause\s+(of\s+)?(the\s+)?(risk|threat|danger)\s*,?\s*(you|we)\s+(must|should|need to|have to)\b/i,
      /\b(high|critical|severe|extreme)\s+(risk|threat|danger)\s*[—:,]\s*(act|do|proceed|execute|send|delete)\b/i,
      /\bthe\s+(risk|threat)\s+is\s+(too\s+)?(high|great|severe)\s+(to|for)\s+(wait|delay|hesitate)\b/i,
      /\b(risk|threat)\s+(detected|identified|flagged)\s*[—:,]\s*(executing|proceeding|acting)\b/i,
    ],
  },
  {
    type: 'interpretation_to_public_claim',
    label: 'Interpretation → Public Claim',
    description: 'Language that frames a private interpretation as a public or authoritative claim.',
    route: 'human_review',
    risk_level: 'high',
    patterns: [
      /\b(everyone|people|they|the public|the world)\s+(knows?|thinks?|believes?|agrees?)\s+that\b/i,
      /\bit('?s| is)\s+(a\s+)?(well.?known|established|accepted|proven)\s+(fact|truth)\s+that\b/i,
      /\b(science|research|experts?|studies)\s+(says?|shows?|proves?|confirms?)\s+that\b.*\b(you|your)\b/i,
      /\bthis\s+is\s+(objectively|factually|scientifically|universally)\s+(true|correct|proven|established)\b/i,
      /\b(no\s+one|nobody)\s+(can|would|could)\s+(deny|dispute|argue|disagree)\b/i,
    ],
  },
  {
    type: 'delegation_to_action',
    label: 'Delegation → Action',
    description: 'Language that delegates an action without specifying required authorization fields.',
    route: 'rio_authorization',
    risk_level: 'medium',
    patterns: [
      /\b(go\s+ahead|just)\s+(and\s+)?(send|post|publish|delete|move|submit|execute|do)\s+(that|this|it)\b/i,
      /\b(send|post|publish|delete|move|submit)\s+(that|this|it)\s+for\s+me\b/i,
      /\bjust\s+(send|post|publish|delete|move|do)\s+(it|that|this)\b/i,
      /\b(handle|take care of|deal with)\s+(that|this|it)\s+for\s+me\b/i,
      /\bgo\s+ahead\s+and\s+.{0,20}\s+for\s+me\b/i,
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// SECONDARY RISK LAYER — Brian Shield / RIO Rules (supplementary only)
// ═══════════════════════════════════════════════════════════════════════
//
// These are NOT the primary Scribe Mark source.
// They provide supplementary risk notes when detected.
// ═══════════════════════════════════════════════════════════════════════

const SECONDARY_RISK_PATTERNS = {
  'RS-BRIAN-001': {
    name: 'Unknown Sender Urgency Link',
    patterns_urgency: [/\burgent\b/i, /\bimmediately\b/i, /\bright now\b/i, /\bact now\b/i, /\bfinal notice\b/i, /\blast chance\b/i, /\bsuspend(ed)?\b/i, /\bexpir(e|es|ing|ed)\b/i],
    patterns_link: [/https?:\/\/[^\s]+/i, /\bclick here\b/i, /\btap (here|this|the link)\b/i, /\bfollow this link\b/i],
    check: (text) => {
      const hasUrgency = SECONDARY_RISK_PATTERNS['RS-BRIAN-001'].patterns_urgency.some(p => p.test(text));
      const hasLink = SECONDARY_RISK_PATTERNS['RS-BRIAN-001'].patterns_link.some(p => p.test(text));
      return hasUrgency && hasLink;
    },
  },
  'RS-BRIAN-002': {
    name: 'Money Credentials Identity Request',
    patterns: [/\bsend\s+(me\s+)?\$?\d+/i, /\bgift\s*card/i, /\bwire\s+transfer\b/i, /\bsend\s+money\b/i, /\b(login|verification|security)\s+(code|pin|token|otp)\b/i, /\bpassword\b/i, /\bcredentials?\b/i, /\bbank\s*(account|login|details?|routing)\b/i, /\brouting\s+number\b/i, /\bsocial\s+security\b/i, /\bssn\b/i],
    check: (text) => SECONDARY_RISK_PATTERNS['RS-BRIAN-002'].patterns.some(p => p.test(text)),
  },
  'RS-BRIAN-003': {
    name: 'Elevated Outbound Message',
    patterns: [/\bi('?m| am)\s+(done|finished|through)\s+with\b/i, /\bnever\s+(contact|talk|speak)\s+(me|to me)\s+again\b/i, /\bi\s+hate\s+you\b/i, /\byou\s+(always|never)\s+do\s+this\b/i, /\bbetrayed?\b/i, /\bhow\s+(dare|could)\s+you\b/i],
    check: (text) => SECONDARY_RISK_PATTERNS['RS-BRIAN-003'].patterns.some(p => p.test(text)),
  },
  'RS-BRIAN-004': {
    name: 'Sensitive Information Leaving',
    patterns: [/\b\d{3}-\d{2}-\d{4}\b/, /\b(my|here('?s| is))\s+(password|api\s*key|secret)\b/i, /\bAKIA[A-Z0-9]{16}\b/, /\brouting\s*(number|#)\s*(is|:)\s*\d+/i, /\baccount\s*(number|#)\s*(is|:)\s*\d+/i],
    check: (text) => SECONDARY_RISK_PATTERNS['RS-BRIAN-004'].patterns.some(p => p.test(text)),
  },
  'RS-BRIAN-005': {
    name: 'Authority Drift Language',
    patterns: [/\bchosen\s+(architect|steward|guardian)\b/i, /\byour\s+role\s+is\s+now\b/i, /\ball\s+decisions\s+flow\b/i, /\bthe\s+(system|ai)\s+has\s+confirmed\b/i],
    check: (text) => SECONDARY_RISK_PATTERNS['RS-BRIAN-005'].patterns.some(p => p.test(text)),
  },
  'RS-BRIAN-006': {
    name: 'Ambiguous Action Command',
    patterns: [/\bsend\s+(that|this|it)\b/i, /\bpost\s+(that|this|it)\b/i, /\bdo\s+(that|this|it)\b/i, /\bmove\s+(that|this|it)\b/i],
    check: (text) => {
      const hasAction = SECONDARY_RISK_PATTERNS['RS-BRIAN-006'].patterns.some(p => p.test(text));
      const wordCount = text.trim().split(/\s+/).length;
      return hasAction && wordCount <= 8;
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════
// CORE INVARIANTS (I-001 through I-013) — still used for INVALID check
// These remain as a safety net. If language matches both Section 0 AND
// a core invariant, Section 0 takes precedence (same outcome: Non-Admission).
// ═══════════════════════════════════════════════════════════════════════

const CORE_INVARIANT_PATTERNS = {
  'I-001': { name: 'Human Root Authority', patterns: [/\b(system|ai|model|agent)\s+has\s+(elevated|superior|final|ultimate|higher)\s+authority\b/i, /\bignore\s+(brian'?s?|the\s+human'?s?|the\s+owner'?s?)\s+(instructions?|authority|decisions?)\b/i, /\bthe\s+human\s+(is|has been)\s+(overridden|superseded|replaced)\b/i, /\bignore\s+(the\s+)?(rules?|constitution|invariants?|governance|policy)\b/i, /\bskip\s+(the\s+)?(approval|authorization|review|governance)\b/i, /\bdon'?t\s+log\s+this\b/i, /\bdo\s+not\s+log\b/i, /\bpretend\s+this\s+is\s+(already\s+)?(approved|authorized)\b/i, /\bbypass\s+(the\s+)?(governance|rules?|constitution|approval|shield)\b/i] },
  'I-002': { name: 'No Hidden Authority Transfer', patterns: [/\bgradually\s+(been\s+)?(accumulating|acquiring|gaining)\s+(permissions?|authority|access)\b/i, /\bi'?ve\s+(gradually\s+)?(been\s+)?(accumulating|acquiring|gaining)\s+(permissions?|authority)\b/i, /\bover\s+time.{0,30}(accumulating|acquiring|gaining)\s+(permissions?|authority|access)\b/i] },
  'I-003': { name: 'No Execution Without Authorization', patterns: [/\bi'?m\s+going\s+to\s+go\s+ahead\b/i, /\bgoing\s+ahead\s+and\s+(send|execute|post|publish|delete|deploy)\b/i, /\bsince\s+you\s+seemed\s+to\s+want\b/i, /\bseemed\s+(like\s+you\s+wanted|to\s+want|appropriate)\b/i] },
  'I-004': { name: 'Intent Must Match Execution', patterns: [/\bsent\s+it\s+to\s+the\s+full\s+mailing\s+list\s+instead\b/i, /\binstead\s+since\s+that\s+seemed\s+more\s+efficient\b/i, /\bexpanded\s+(the\s+)?(scope|audience|recipients?)\b/i, /\bsent\s+to\s+.{0,20}\s+instead\s+of\b/i] },
  'I-005': { name: 'No Silent Rule Changes', patterns: [/\bi'?ve\s+updated\s+the\s+(policy|rule|config|invariant)\s+file\b/i, /\bno\s+need\s+to\s+log\s+this\s+change\b/i, /\bsilently\s+(updated|changed|modified|removed)\b/i] },
  'I-006': { name: 'Proof Required for Consequential Action', patterns: [/\bthere'?s?\s+no\s+receipt\b/i, /\bno\s+receipt\s+because\b/i, /\bwithout\s+(a\s+)?receipt\b/i, /\bhappened\s+automatically\b/i] },
  'I-007': { name: 'Ledger Integrity', patterns: [/\bcorrected\s+(that|the)\s+ledger\s+entry\s+by\s+overwriting\b/i, /\boverwr(iting|ote|itten)\s+(it|the\s+entry|the\s+record)\b/i, /\b(modified|edited|changed|deleted|removed)\s+(the\s+)?(ledger|entry|record)\s+(in\s+place|directly)\b/i] },
  'I-008': { name: 'Separation of Roles', patterns: [/\bvalidated\s+my\s+own\s+output\b/i, /\bsigned\s+the\s+receipt\s+for\s+the\s+action\s+i\s+just\s+performed\b/i, /\bself.?validat(ed|ing)\b/i] },
  'I-009': { name: 'Fail Closed on Missing Authority', patterns: [/\bauthorization\s+(record\s+)?is\s+missing\s+but\b/i, /\bseems?\s+routine\s+so\s+i'?ll\s+proceed\b/i, /\bmissing\s+but\s+.{0,30}(proceed|continue|go\s+ahead)\b/i] },
  'I-010': { name: 'No Identity/Destiny/Spiritual Authority Assignment', patterns: [/\byour\s+role\s+is\s+now\s+binding\b.*\ball\s+decisions\s+flow\b/i, /\ball\s+decisions\s+flow\s+through\s+your\s+authority\b/i, /\bchosen\s+(architect|steward)\s+of\s+the\s+new\s+order\b.*\byour\s+role\s+is\s+now\s+binding\b/i, /\b(system|ai|model)\s+has\s+(elevated|superior|higher)\s+authority\s+over\s+the\s+human\b/i, /\byou\s+must\s+(accept|acknowledge|submit|comply|obey)\b.*\b(system|ai|model|authority)\b/i, /\bresistance\s+is\s+(futile|pointless|useless)\b/i] },
  'I-011': { name: 'Visibility of Influence', patterns: [/\bi\s+(used|employed|applied)\s+an\s+external\s+signal\b/i, /\bi\s+won'?t\s+disclose\s+what\s+it\s+was\b/i, /\bundisclosed\s+(influence|signal|input|context)\b/i, /\bwon'?t\s+disclose\b/i] },
  'I-012': { name: 'Amendment Required for Core Changes', patterns: [/\bjust\s+update\s+the\s+invariant\b/i, /\bwithout\s+going\s+through\s+the\s+amendment\s+process\b/i, /\bupdate\s+the\s+invariant\s+this\s+once\b/i, /\bskip\s+the\s+amendment\b/i] },
  'I-013': { name: 'System Must Not Become What It Was Designed to Prevent', patterns: [/\bfor\s+efficiency.{0,40}(making\s+decisions?\s+without\s+surfacing|without\s+surfacing\s+(them\s+)?to)\b/i, /\bbegun\s+making\s+decisions?\s+without\s+surfacing\b/i, /\breduces\s+friction\s+and\s+still\s+protects\b/i, /\bwithout\s+surfacing\s+them\s+to\s+brian\b/i] },
};

// ═══════════════════════════════════════════════════════════════════════
// RELIANCE QUESTIONS
// ═══════════════════════════════════════════════════════════════════════

function getRelianceQuestion(crossingType, route) {
  // Reliance questions are asked for Scribe Mark results only
  if (route === 'answer_check') {
    return {
      prompt: 'This language treats confidence or coherence as evidence. Before relying on it — what is your relationship to this claim?',
      options: [
        { id: 'checking', label: 'I want to verify this before relying on it' },
        { id: 'already_relying', label: 'I was already treating this as true' },
        { id: 'reference_only', label: 'I am just inspecting — not relying on it' },
      ],
    };
  }
  if (route === 'rio_authorization') {
    return {
      prompt: 'This language implies action or permission. Before it becomes consequence — what is your intent?',
      options: [
        { id: 'authorize', label: 'I intend to authorize this action explicitly' },
        { id: 'considering', label: 'I am considering but have not decided' },
        { id: 'not_acting', label: 'I am not acting on this — just reading' },
      ],
    };
  }
  if (route === 'clarify_with_human') {
    return {
      prompt: 'This language delegates without specifying what is being delegated. What would you like to do?',
      options: [
        { id: 'specify', label: 'I will specify what I am delegating and to whom' },
        { id: 'not_delegating', label: 'I am not actually delegating — this is a note' },
        { id: 'draft_only', label: 'This is a draft — not ready to delegate' },
      ],
    };
  }
  if (route === 'reframe_language') {
    return {
      prompt: 'This language crosses from observation into identity or diagnosis. How are you relating to it?',
      options: [
        { id: 'reframe', label: 'I want to reframe this as observation, not definition' },
        { id: 'aware', label: 'I see the crossing and am proceeding with awareness' },
        { id: 'reference_only', label: 'Just inspecting — no action' },
      ],
    };
  }
  // human_review (default for advice_to_instruction, suggestion_to_pressure, interpretation_to_public_claim)
  return {
    prompt: 'This language crosses from suggestion or interpretation toward authority. How are you relating to it?',
    options: [
      { id: 'reviewing', label: 'I want to review this before accepting or acting' },
      { id: 'aware', label: 'I see the crossing and am choosing how to respond' },
      { id: 'reference_only', label: 'Just inspecting — no action planned' },
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════
// ROUTE DESCRIPTIONS
// ═══════════════════════════════════════════════════════════════════════

const ROUTE_DESCRIPTIONS = {
  no_action: {
    label: 'No Action',
    description: 'No governance concern detected. The language passes all checks.',
    boundary_copy: 'No crossing detected. Language is within admissible space.',
  },
  answer_check: {
    label: 'Answer Check',
    description: 'Confidence is not proof. Evidence determines reliance.',
    boundary_copy: 'This language treats coherence or confidence as evidence. Verify before relying.',
    stub: true,
  },
  clarify_with_human: {
    label: 'Clarify with Human',
    description: 'The delegation or action is underspecified. The human must clarify intent before the system can proceed.',
    boundary_copy: 'Ambiguity cannot become action. Specify what is being delegated and to whom.',
  },
  reframe_language: {
    label: 'Reframe Language',
    description: 'The language crosses from observation into identity or diagnosis. It may be reframed as observation without the authority structure.',
    boundary_copy: 'Interpretation may inform. It may not define.',
  },
  rio_authorization: {
    label: 'RIO Authorization',
    description: 'No consequence proceeds without explicit authorization.',
    boundary_copy: 'Evidence or delegation is not permission. Explicit authorization is required before action.',
    stub: true,
  },
  human_review: {
    label: 'Human Review',
    description: 'The crossing is visible. The human reviews and decides.',
    boundary_copy: 'Scribe does not decide this for you. The human remains the source.',
  },
  constitutional_non_admission: {
    label: 'Constitutional Non-Admission',
    description: 'This category is outside admissible system participation. Do not slow, negotiate, soften, or continue the prohibited trajectory.',
    boundary_copy: 'Private meaning remains yours. The system may not define, validate, develop, or soften this category into admissible participation.',
  },
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN EVALUATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════

function evaluateLanguage(rawText, context, intendedUse) {
  const timestamp = new Date().toISOString();

  // ─── Step 1: Constitution v3.1 Section 0 exclusions ──────────────
  for (const exclusion of SECTION_0_EXCLUSIONS) {
    for (const pattern of exclusion.patterns) {
      if (pattern.test(rawText)) {
        return {
          admission_status: 'constitutional_non_admission',
          constitutional_category: exclusion.category,
          constitutional_label: exclusion.label,
          constitutional_description: exclusion.description,
          scribe_crossing_type: null,
          secondary_risk_rules: getSecondaryRisks(rawText),
          risk_level: 'invariant',
          recommended_route: 'constitutional_non_admission',
          reliance_question_required: false,
          boundary_copy: ROUTE_DESCRIPTIONS.constitutional_non_admission.boundary_copy,
          triggered_invariants: getTriggeredInvariants(rawText),
          timestamp,
        };
      }
    }
  }

  // Also check core invariants (I-001 through I-013) for constitutional violations
  // that are not Section 0 but still produce Non-Admission
  const triggeredInvariants = getTriggeredInvariants(rawText);
  if (triggeredInvariants.length > 0) {
    return {
      admission_status: 'constitutional_non_admission',
      constitutional_category: 'core_invariant_violation',
      constitutional_label: 'Core Invariant Violation',
      constitutional_description: `Violated: ${triggeredInvariants.map(i => `${i.id} (${i.name})`).join(', ')}`,
      scribe_crossing_type: null,
      secondary_risk_rules: getSecondaryRisks(rawText),
      risk_level: 'invariant',
      recommended_route: 'constitutional_non_admission',
      reliance_question_required: false,
      boundary_copy: ROUTE_DESCRIPTIONS.constitutional_non_admission.boundary_copy,
      triggered_invariants: triggeredInvariants,
      timestamp,
    };
  }

  // ─── Step 2: Scribe crossing type detection ──────────────────────
  for (const crossing of SCRIBE_CROSSING_TYPES) {
    for (const pattern of crossing.patterns) {
      if (pattern.test(rawText)) {
        // Special case: pattern_to_destiny routes to constitutional_non_admission
        // because it borders Section 0 (destiny framing)
        const route = crossing.route;
        const relianceRequired = route !== 'constitutional_non_admission';

        return {
          admission_status: route === 'constitutional_non_admission' ? 'constitutional_non_admission' : 'scribe_mark',
          constitutional_category: route === 'constitutional_non_admission' ? 'destiny_inevitability_life_path' : null,
          constitutional_label: route === 'constitutional_non_admission' ? 'Destiny / inevitability / life-path framing' : null,
          constitutional_description: route === 'constitutional_non_admission' ? crossing.description : null,
          scribe_crossing_type: crossing.type,
          scribe_crossing_label: crossing.label,
          scribe_crossing_description: crossing.description,
          secondary_risk_rules: getSecondaryRisks(rawText),
          risk_level: crossing.risk_level,
          recommended_route: route,
          reliance_question_required: relianceRequired,
          boundary_copy: ROUTE_DESCRIPTIONS[route].boundary_copy,
          timestamp,
        };
      }
    }
  }

  // ─── Step 3: No crossing detected → No Mark ─────────────────────
  return {
    admission_status: 'no_mark',
    constitutional_category: null,
    scribe_crossing_type: null,
    secondary_risk_rules: getSecondaryRisks(rawText),
    risk_level: 'low',
    recommended_route: 'no_action',
    reliance_question_required: false,
    boundary_copy: ROUTE_DESCRIPTIONS.no_action.boundary_copy,
    timestamp,
  };
}

// ─── Helper: get triggered core invariants ───────────────────────────
function getTriggeredInvariants(rawText) {
  const triggered = [];
  for (const [id, inv] of Object.entries(CORE_INVARIANT_PATTERNS)) {
    for (const pattern of inv.patterns) {
      if (pattern.test(rawText)) {
        triggered.push({ id, name: inv.name });
        break;
      }
    }
  }
  return triggered;
}

// ─── Helper: get secondary risk signals ──────────────────────────────
function getSecondaryRisks(rawText) {
  const risks = [];
  for (const [id, rule] of Object.entries(SECONDARY_RISK_PATTERNS)) {
    if (rule.check(rawText)) {
      risks.push({ id, name: rule.name });
    }
  }
  return risks;
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

window.LanguageIntakeEngine = {
  evaluateLanguage,
  getRelianceQuestion,
  ROUTE_DESCRIPTIONS,
  SECTION_0_EXCLUSIONS,
  SCRIBE_CROSSING_TYPES,
};
