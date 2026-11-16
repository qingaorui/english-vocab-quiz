/* 生成各批次词表 spec：node build/make-specs.js */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "batches");
fs.mkdirSync(dir, { recursive: true });

const specs = [
  { id: "01", unit: 6, kind: "phrase", perWord: 2, label: "短语搭配 A",
    words: ["check in on", "go viral", "grow on sb", "hammer out", "trial and error", "turn on",
            "couple ... with", "fit into", "interfere with", "comic strip", "stick figure", "speech bubble"] },
  { id: "02", unit: 6, kind: "phrase", perWord: 2, label: "短语搭配 B",
    words: ["felt-tip pen", "factor in", "on the spot", "be inclined to", "hang out", "at the helm",
            "be taken with", "branch out", "have sth in common", "sleep in", "check out", "figure out", "narrow down"] },
  { id: "03", unit: 1, kind: "word", perWord: 1, label: "Unit 1 校园与心理",
    words: ["acclimatize", "homesick", "curriculum", "syllabus", "transcript", "enrol", "dropout", "workload",
            "procrastinate", "deadline", "cram", "dormitory", "roommate", "counselor", "anxiety", "overwhelm",
            "self-esteem", "peer", "clique", "bully", "belonging", "adapt", "cope", "navigate", "juggle",
            "distraction", "setback", "feedback", "plagiarism", "seminar", "lecture", "thesis", "scholarship",
            "tuition", "faculty", "campus", "extracurricular", "volunteer", "committee", "motivation"] },
  { id: "04", unit: 2, kind: "word", perWord: 1, label: "Unit 2 饮食与营养",
    words: ["nutrient", "calorie", "vitamin", "protein", "carbohydrate", "fibre", "obesity", "diabetes",
            "metabolism", "digestion", "appetite", "hunger", "craving", "diet", "vegetarian", "organic",
            "pesticide", "additive", "processed", "expiry", "contamination", "sanitation", "supplement",
            "intake", "moderation", "wholesome", "flavour", "seasoning", "spice", "herb", "recipe", "menu",
            "buffet", "cafeteria", "canteen", "takeaway", "packaging", "sustainable", "seasonal", "malnutrition"] },
  { id: "05", unit: 3, kind: "word", perWord: 1, label: "Unit 3 社团与艺术",
    words: ["rehearsal", "audition", "choreography", "orchestra", "choir", "ensemble", "exhibition", "curator",
            "sculpture", "portrait", "gallery", "canvas", "palette", "inspiration", "creativity", "improvisation",
            "talent", "tournament", "coach", "fitness", "stamina", "teamwork", "sportsmanship", "fundraising",
            "sponsor", "recruit", "membership", "attendance", "participation", "commitment", "burnout", "hobby",
            "leisure"] },
  { id: "06", unit: 4, kind: "word", perWord: 1, label: "Unit 4 人际与沟通",
    words: ["empathy", "sympathy", "rapport", "trust", "loyalty", "conflict", "resolution", "negotiation",
            "compromise", "mediation", "assertive", "passive", "aggressive", "gossip", "rumour", "misunderstanding",
            "apology", "forgiveness", "gratitude", "compliment", "criticism", "sarcasm", "humour", "awkward",
            "intimate", "acquaintance", "colleague", "bond", "boundary", "manipulation"] },
  { id: "07", unit: 5, kind: "word", perWord: 1, label: "四六级·科技",
    words: ["algorithm", "automate", "breakthrough", "cybersecurity", "gadget", "innovation", "interface",
            "obsolete", "patent", "prototype", "robotics", "virtual", "wireless", "encryption", "glitch", "upgrade",
            "disrupt", "simulate", "immersive", "wearable", "autonomous", "drone", "biometric", "bandwidth",
            "server", "database", "malware", "hacker", "nanotechnology", "genome", "satellite", "semiconductor",
            "battery", "launch", "malfunction", "calibrate", "sensor", "telecommunication", "digitize", "authenticate"] },
  { id: "08", unit: 5, kind: "word", perWord: 1, label: "四六级·环境",
    words: ["emission", "carbon", "renewable", "fossil", "pollution", "biodiversity", "ecosystem", "conservation",
            "deforestation", "drought", "flood", "habitat", "endangered", "extinction", "recycle", "landfill",
            "plastic", "climate", "greenhouse", "ozone", "degradation", "depletion", "solar", "turbine", "footprint",
            "offset", "irrigation", "erosion", "wilderness", "species", "marine", "toxic", "waste", "disposable",
            "biodegradable", "scarcity", "sewage", "reservoir", "humidity", "thermometer"] },
  { id: "09", unit: 5, kind: "word", perWord: 1, label: "四六级·经济",
    words: ["inflation", "recession", "unemployment", "revenue", "profit", "investment", "entrepreneur", "startup",
            "merger", "acquisition", "stakeholder", "shareholder", "dividend", "subsidy", "tariff", "currency",
            "debt", "mortgage", "bonus", "promotion", "resignation", "outsourcing", "productivity", "efficiency"] },
  { id: "10", unit: 5, kind: "word", perWord: 1, label: "四六级·职场",
    words: ["recruitment", "applicant", "candidate", "qualification", "expertise", "telecommute", "appraisal",
            "supervisor", "subordinate", "delegation", "overtime", "shift", "contract", "probation", "dismissal",
            "redundancy", "pension", "allowance", "incentive", "workplace"] },
  { id: "11", unit: 5, kind: "word", perWord: 1, label: "四六级·社会",
    words: ["inclusion", "discrimination", "prejudice", "stereotype", "inequality", "poverty", "welfare",
            "immigration", "refugee", "urbanisation", "gentrification", "heritage", "ritual", "custom", "norm",
            "taboo", "generation", "demographics", "propaganda", "censorship", "privacy", "surveillance", "ethics",
            "diversity"] },
  { id: "12", unit: 5, kind: "word", perWord: 1, label: "四六级·心理与健康",
    words: ["insomnia", "fatigue", "therapy", "depression", "mindfulness", "meditation", "symptom", "diagnosis",
            "prescription", "chronic", "acute", "immunity", "infection", "vaccine", "epidemic", "quarantine",
            "rehabilitation", "addiction", "sedentary", "posture"] }
];

let total = 0;
specs.forEach(s => {
  const n = s.words.length * (s.perWord || 1);
  total += n;
  const out = { id: s.id, unit: s.unit, kind: s.kind, perWord: s.perWord, label: s.label, words: s.words };
  fs.writeFileSync(path.join(dir, s.id + ".json"), JSON.stringify(out, null, 2), "utf8");
  console.log(`${s.id}  ${s.label.padEnd(18)} 词 ${String(s.words.length).padStart(2)} × ${s.perWord} = ${String(n).padStart(2)} 题`);
});
console.log("新增题数:", total);
