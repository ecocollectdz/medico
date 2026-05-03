import { useState, useRef, useCallback, useEffect } from "react";
import { jsPDF } from "jspdf";

// ─── MÉDICAMENTS DB ──────────────────────────────────────────────────────────
const MEDICAMENTS_DB = [
  { nom: "Amoxicilline", dosages: ["250mg", "500mg", "1g"], formes: ["gélule", "comprimé", "suspension"] },
  { nom: "Amoxicilline + Acide clavulanique", dosages: ["500mg/125mg", "875mg/125mg"], formes: ["comprimé"] },
  { nom: "Paracétamol", dosages: ["500mg", "1g"], formes: ["comprimé", "suppositoire", "sirop"] },
  { nom: "Ibuprofène", dosages: ["200mg", "400mg", "600mg"], formes: ["comprimé", "gélule"] },
  { nom: "Metformine", dosages: ["500mg", "850mg", "1000mg"], formes: ["comprimé"] },
  { nom: "Amlodipine", dosages: ["5mg", "10mg"], formes: ["comprimé"] },
  { nom: "Atorvastatine", dosages: ["10mg", "20mg", "40mg"], formes: ["comprimé"] },
  { nom: "Oméprazole", dosages: ["20mg", "40mg"], formes: ["gélule"] },
  { nom: "Pantoprazole", dosages: ["20mg", "40mg"], formes: ["comprimé"] },
  { nom: "Ciprofloxacine", dosages: ["250mg", "500mg"], formes: ["comprimé"] },
  { nom: "Azithromycine", dosages: ["250mg", "500mg"], formes: ["comprimé", "suspension"] },
  { nom: "Doxycycline", dosages: ["100mg"], formes: ["gélule"] },
  { nom: "Metronidazole", dosages: ["250mg", "500mg"], formes: ["comprimé"] },
  { nom: "Cétirizine", dosages: ["5mg", "10mg"], formes: ["comprimé"] },
  { nom: "Loratadine", dosages: ["10mg"], formes: ["comprimé"] },
  { nom: "Prednisolone", dosages: ["5mg", "20mg", "40mg"], formes: ["comprimé"] },
  { nom: "Salbutamol", dosages: ["100mcg"], formes: ["aérosol"] },
  { nom: "Diclofénac", dosages: ["50mg", "75mg", "100mg"], formes: ["comprimé", "suppositoire", "gel"] },
  { nom: "Tramadol", dosages: ["50mg", "100mg"], formes: ["gélule", "comprimé"] },
  { nom: "Lisinopril", dosages: ["5mg", "10mg", "20mg"], formes: ["comprimé"] },
  { nom: "Losartan", dosages: ["25mg", "50mg", "100mg"], formes: ["comprimé"] },
  { nom: "Furosémide", dosages: ["20mg", "40mg"], formes: ["comprimé"] },
  { nom: "Lévothyroxine", dosages: ["25mcg", "50mcg", "100mcg"], formes: ["comprimé"] },
  { nom: "Aspirine", dosages: ["75mg", "100mg", "300mg", "500mg"], formes: ["comprimé"] },
  { nom: "Vitamine D3", dosages: ["1000UI", "2000UI", "5000UI"], formes: ["gélule", "gouttes"] },
  { nom: "Vitamine C", dosages: ["500mg", "1000mg"], formes: ["comprimé", "effervescent"] },
  { nom: "Fer (Sulfate ferreux)", dosages: ["65mg", "200mg"], formes: ["comprimé"] },
  { nom: "Acide folique", dosages: ["0.4mg", "5mg"], formes: ["comprimé"] },
  { nom: "Magnésium", dosages: ["300mg", "400mg"], formes: ["comprimé", "effervescent"] },
  { nom: "Fluconazole", dosages: ["50mg", "150mg"], formes: ["gélule"] },
  { nom: "Acyclovir", dosages: ["200mg", "400mg", "800mg"], formes: ["comprimé", "crème"] },
  { nom: "Domperidone", dosages: ["10mg"], formes: ["comprimé"] },
  { nom: "Metoclopramide", dosages: ["10mg"], formes: ["comprimé", "injection"] },
  { nom: "Loperamide", dosages: ["2mg"], formes: ["gélule"] },
  { nom: "Phloroglucinol", dosages: ["80mg"], formes: ["comprimé"] },
  { nom: "Allopurinol", dosages: ["100mg", "300mg"], formes: ["comprimé"] },
  { nom: "Clotrimazole", dosages: ["1%"], formes: ["crème"] },
  { nom: "Hydrocortisone", dosages: ["1%"], formes: ["crème"] },
  { nom: "Bétaméthasone", dosages: ["0.05%", "0.1%"], formes: ["crème"] },
  { nom: "Zinc", dosages: ["10mg", "20mg"], formes: ["comprimé"] },
  { nom: "Spironolactone", dosages: ["25mg", "50mg", "100mg"], formes: ["comprimé"] },
  { nom: "Warfarine", dosages: ["2mg", "5mg"], formes: ["comprimé"] },
  { nom: "Ceftriaxone", dosages: ["1g", "2g"], formes: ["injection"] },
  { nom: "Gentamicine", dosages: ["80mg"], formes: ["injection"] },
  { nom: "Insuline Glargine", dosages: ["100UI/ml"], formes: ["injection"] },
];

// ─── I18N ────────────────────────────────────────────────────────────────────
const T = {
  fr: {
    appSub: "Ordonnances Intelligentes",
    apiKey: "Clé API Groq",
    apiHint: "console.groq.com · gratuit",
    doctorProfile: "Profil Médecin",
    nom: "Nom complet", specialite: "Spécialité", tel: "Téléphone", inami: "N° INAMI", adresse: "Adresse",
    dictee: "Dictée Vocale",
    clickToRecord: "Cliquer pour dicter",
    recording: "Parler… cliquer pour arrêter",
    transcribing: "Transcription en cours…",
    parsing: "Analyse médicale…",
    noOrdo: "Aucune ordonnance",
    noOrdoSub: "Dictez une prescription pour la voir apparaître ici",
    ordonnance: "Ordonnance",
    patient: "Patient", age: "Âge", sexe: "Sexe",
    diagnostic: "Diagnostic",
    prescription: "Prescription",
    instructions: "Instructions",
    addMed: "+ Ajouter un médicament",
    newDictee: "Nouvelle dictée",
    downloadPDF: "Télécharger PDF",
    generated: "Ordonnance générée",
    validite: "Valable 3 mois · À conserver",
    signature: "Signature & Cachet",
    history: "Historique",
    noHistory: "Aucune ordonnance dans l'historique",
    dosage: "Dosage", frequence: "Fréquence", duree: "Durée", note: "Note",
    open: "Ouvrir",
  },
  ar: {
    appSub: "وصفات طبية ذكية",
    apiKey: "مفتاح Groq API",
    apiHint: "console.groq.com · مجاني",
    doctorProfile: "ملف الطبيب",
    nom: "الاسم الكامل", specialite: "التخصص", tel: "الهاتف", inami: "رقم التسجيل", adresse: "العنوان",
    dictee: "الإملاء الصوتي",
    clickToRecord: "انقر للإملاء",
    recording: "تحدث… انقر للإيقاف",
    transcribing: "جارٍ النسخ…",
    parsing: "تحليل طبي…",
    noOrdo: "لا توجد وصفة طبية",
    noOrdoSub: "قم بإملاء وصفة طبية لتظهر هنا",
    ordonnance: "وصفة طبية",
    patient: "المريض", age: "العمر", sexe: "الجنس",
    diagnostic: "التشخيص",
    prescription: "الوصفة",
    instructions: "التعليمات",
    addMed: "+ إضافة دواء",
    newDictee: "وصفة جديدة",
    downloadPDF: "تحميل PDF",
    generated: "تم إنشاء الوصفة",
    validite: "صالحة 3 أشهر · للاحتفاظ بها",
    signature: "التوقيع والختم",
    history: "السجل",
    noHistory: "لا يوجد سجل للوصفات",
    dosage: "الجرعة", frequence: "التكرار", duree: "المدة", note: "ملاحظة",
    open: "فتح",
  },
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
const todayStr = (lang) => new Date().toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ", { year: "numeric", month: "long", day: "numeric" });
const genNum = () => `ORD-${Date.now().toString(36).toUpperCase()}`;
const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ─── GROQ ────────────────────────────────────────────────────────────────────
async function transcribeWithGroq(blob, key) {
  const fd = new FormData();
  fd.append("file", blob, "rec.webm");
  fd.append("model", "whisper-large-v3-turbo");
  fd.append("language", "fr");
  fd.append("response_format", "json");
  const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST", headers: { Authorization: `Bearer ${key}` }, body: fd,
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.error?.message || `Whisper ${r.status}`); }
  return (await r.json()).text;
}

async function parseWithGroq(text, key) {
  const medList = MEDICAMENTS_DB.map((m) => m.nom).join(", ");
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, max_tokens: 1000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Tu es un assistant médical expert. Extrais les données d'une ordonnance dictée (français, arabe, darija).
Base de médicaments (utilise ces noms exacts si possible) : ${medList}.
Retourne UNIQUEMENT ce JSON :
{"patient":{"nom":"","age":"","sexe":""},"medicaments":[{"nom":"","dosage":"","frequence":"","duree":"","note":""}],"diagnostic":"","instructions":""}
Champs vides = "". medicaments = tableau toujours.`,
        },
        { role: "user", content: text },
      ],
    }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.error?.message || `LLaMA ${r.status}`); }
  const d = await r.json();
  return JSON.parse(d.choices?.[0]?.message?.content || "{}");
}

// ─── PDF ─────────────────────────────────────────────────────────────────────
function generatePDF(ordo, medecin, lang) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 20;
  const gold = [162, 128, 68], dark = [40, 34, 22], gray = [120, 110, 90], cream = [252, 249, 242];
  doc.setFillColor(...cream); doc.rect(0, 0, W, 297, "F");
  doc.setFillColor(...gold); doc.rect(0, 0, W, 8, "F");
  doc.setDrawColor(...gold); doc.setLineWidth(0.3); doc.line(M, 14, W - M, 14);
  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(...dark);
  doc.text(`Dr. ${medecin.nom}`, M, 24);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...gray);
  if (medecin.specialite) doc.text(medecin.specialite, M, 30);
  if (medecin.adresse) doc.text(medecin.adresse, M, 35);
  if (medecin.tel) doc.text(`Tél : ${medecin.tel}`, M, 40);
  if (medecin.inami) doc.text(`N° INAMI : ${medecin.inami}`, M, 45);
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(...gold);
  doc.text(lang === "ar" ? "وصفة طبية" : "ORDONNANCE", W - M, 24, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...gray);
  doc.text(todayStr(lang), W - M, 31, { align: "right" });
  doc.text(ordo.numero, W - M, 36, { align: "right" });
  doc.setDrawColor(...gold); doc.setLineWidth(0.5); doc.line(M, 52, W - M, 52);
  let y = 62;
  doc.setFillColor(245, 240, 228); doc.roundedRect(M, y - 5, W - M * 2, 22, 2, 2, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...gray);
  doc.text("PATIENT", M + 5, y + 1); doc.text("ÂGE", 95, y + 1); doc.text("SEXE", 135, y + 1);
  doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(...dark);
  doc.text(ordo.patient?.nom || "—", M + 5, y + 10);
  doc.text(ordo.patient?.age || "—", 95, y + 10);
  doc.text(ordo.patient?.sexe || "—", 135, y + 10);
  y += 30;
  if (ordo.diagnostic) {
    doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(...gray);
    doc.text(`Diagnostic : ${ordo.diagnostic}`, M, y); y += 8;
  }
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...gold);
  doc.text("PRESCRIPTION", M, y); y += 4;
  doc.setDrawColor(220, 205, 170); doc.setLineWidth(0.2); doc.line(M, y, W - M, y); y += 7;
  (ordo.medicaments || []).forEach((med, i) => {
    if (y > 240) { doc.addPage(); doc.setFillColor(...cream); doc.rect(0, 0, W, 297, "F"); y = 20; }
    doc.setFillColor(...gold); doc.circle(M + 3.5, y + 1.5, 3.5, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 252, 240);
    doc.text(String(i + 1), M + 3.5, y + 2.2, { align: "center" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...dark);
    doc.text(med.nom || "—", M + 10, y + 4); y += 9;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...gray);
    const det = [med.dosage, med.frequence, med.duree].filter(Boolean).join("   ·   ");
    if (det) { doc.text(det, M + 10, y); y += 6; }
    if (med.note) { doc.setFontSize(9); doc.setTextColor(160, 148, 120); doc.setFont("helvetica", "italic"); doc.text(med.note, M + 10, y); y += 5; }
    y += 4;
  });
  if (ordo.instructions) {
    y += 4;
    doc.setFillColor(245, 240, 228); doc.roundedRect(M, y, W - M * 2, 16, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...gold);
    doc.text("INSTRUCTIONS", M + 4, y + 6);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...dark);
    doc.text(doc.splitTextToSize(ordo.instructions, W - M * 2 - 8)[0] || "", M + 4, y + 12);
  }
  const fy = 272;
  doc.setDrawColor(220, 205, 170); doc.setLineWidth(0.2); doc.line(M, fy, W - M, fy);
  doc.setDrawColor(...gray); doc.setLineWidth(0.3); doc.line(W - M - 55, fy + 18, W - M, fy + 18);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...gray);
  doc.text("Signature & Cachet", W - M - 27, fy + 23, { align: "center" });
  doc.setTextColor(160, 148, 120); doc.text("Ordonnance valable 3 mois — À conserver", M, fy + 8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...gold); doc.text("MédiCo", M, fy + 15);
  doc.setFillColor(...gold); doc.rect(0, 289, W, 8, "F");
  doc.save(`ordonnance-${(ordo.patient?.nom || "patient").replace(/\s+/g, "-")}-${Date.now()}.pdf`);
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&family=Noto+Naskh+Arabic:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --cream:#FAF7F0;--cream2:#F3EDE0;--cream3:#EDE4D0;
  --gold:#A28044;--gold-l:#C9A96E;--gold-pale:#F5EDD8;
  --dark:#28220E;--dark2:#4A4030;--muted:#8A7A5A;--muted2:#B8A880;
  --border:#DDD0B0;--border2:#C8B888;--white:#FFFDF8;
  --serif:'Cormorant Garamond',Georgia,serif;
  --sans:'Jost',sans-serif;
  --arabic:'Noto Naskh Arabic',serif;
  --r:14px;--rs:8px;
  --shadow:0 4px 32px rgba(40,34,14,.10);--shadow-sm:0 2px 12px rgba(40,34,14,.07);
}
body{font-family:var(--sans);background:var(--cream);color:var(--dark);min-height:100vh}
#root{min-height:100vh;display:flex;flex-direction:column}

.header{background:var(--dark);padding:0 2rem;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:20;border-bottom:2px solid var(--gold)}
.logo{display:flex;align-items:baseline;gap:10px}
.logo-name{font-family:var(--serif);font-size:1.8rem;font-weight:600;color:var(--gold-l);letter-spacing:.02em;line-height:1}
.logo-ar{font-family:var(--arabic);font-size:1.1rem;color:var(--muted2)}
.logo-sep{color:var(--gold);opacity:.4}
.header-right{display:flex;align-items:center;gap:16px}
.lang-toggle{display:flex;background:rgba(255,255,255,.08);border-radius:99px;padding:3px;gap:2px}
.lang-btn{padding:4px 12px;border-radius:99px;border:none;background:transparent;color:var(--muted2);font-family:var(--sans);font-size:12px;font-weight:500;cursor:pointer;transition:all .2s}
.lang-btn.active{background:var(--gold);color:var(--dark)}
.steps{display:flex;align-items:center;gap:5px}
.step-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .3s}
.step-dot.done{background:var(--gold)}
.step-dot.active{background:var(--gold-l);box-shadow:0 0 0 3px rgba(162,128,68,.25)}

.tabs{display:flex;background:var(--dark);border-bottom:1px solid rgba(162,128,68,.3);padding:0 1.5rem}
.tab-btn{padding:12px 20px;border:none;background:transparent;color:var(--muted2);font-family:var(--sans);font-size:12px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s}
.tab-btn.active{color:var(--gold-l);border-bottom-color:var(--gold)}

.main{flex:1;display:grid;grid-template-columns:340px 1fr;max-height:calc(100vh - 105px)}

.panel-left{background:var(--white);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto}
.panel-section{padding:1.25rem 1.5rem;border-bottom:1px solid var(--border)}
.section-label{font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:.875rem;display:flex;align-items:center;gap:8px}
.section-label::after{content:'';flex:1;height:1px;background:var(--gold-pale)}

.input-group{display:flex;flex-direction:column;gap:5px;margin-bottom:10px}
.input-label{font-size:11px;color:var(--muted);font-weight:500}
.input-field{background:var(--cream);border:1px solid var(--border);border-radius:var(--rs);padding:8px 11px;font-family:var(--sans);font-size:12.5px;color:var(--dark);outline:none;width:100%;transition:border-color .15s,background .15s}
.input-field:focus{border-color:var(--gold);background:var(--white)}
.input-field::placeholder{color:var(--muted2)}
.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.profile-grid .full{grid-column:1/-1}

.mic-area{display:flex;flex-direction:column;align-items:center;gap:14px;padding:.75rem 0}
.mic-btn{width:76px;height:76px;border-radius:50%;border:2px solid var(--border2);cursor:pointer;display:flex;align-items:center;justify-content:center;background:var(--cream2);transition:all .25s;position:relative}
.mic-btn:hover{background:var(--gold-pale);border-color:var(--gold)}
.mic-btn.recording{background:#FFF5EE;border-color:#C8471A;animation:pulse-gold 1.8s ease-in-out infinite}
.mic-btn:disabled{opacity:.4;cursor:not-allowed}
.mic-btn svg{width:26px;height:26px}
.mic-btn.recording svg{color:#C8471A}
.mic-btn:not(.recording) svg{color:var(--gold)}
@keyframes pulse-gold{0%,100%{box-shadow:0 0 0 0 rgba(200,71,26,.15)}50%{box-shadow:0 0 0 12px rgba(200,71,26,0)}}
.timer{font-family:var(--serif);font-size:2rem;font-weight:300;color:#C8471A;letter-spacing:.05em}
.mic-status{font-size:12px;color:var(--muted);text-align:center;line-height:1.6}
.mic-status.recording{color:#C8471A;font-weight:500}
.loading-bar{height:2px;background:var(--cream3);border-radius:99px;overflow:hidden;width:100%;margin-top:4px}
.loading-bar-inner{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold-l));border-radius:99px;animation:slide 1.2s ease-in-out infinite;width:35%}
@keyframes slide{0%{transform:translateX(-300%)}100%{transform:translateX(500%)}}
.transcript-box{background:var(--cream);border:1px solid var(--border);border-left:3px solid var(--gold);border-radius:var(--rs);padding:11px 13px;font-size:12.5px;color:var(--dark2);line-height:1.7;min-height:70px;white-space:pre-wrap}

.panel-right{display:flex;flex-direction:column;overflow-y:auto;background:var(--cream2)}
.ordo-wrapper{padding:2rem;flex:1}
.ordo-paper{background:var(--white);border:1px solid var(--border);border-radius:var(--r);max-width:700px;margin:0 auto;box-shadow:var(--shadow);overflow:hidden}
.ordo-topbar{background:var(--dark);height:6px}
.ordo-body{padding:2.5rem}
.ordo-header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:1.5rem;margin-bottom:1.5rem;border-bottom:1px solid var(--border2)}
.ordo-medecin-name{font-family:var(--serif);font-size:1.5rem;color:var(--gold);font-weight:600}
.ordo-medecin-info{font-size:12px;color:var(--muted);line-height:1.9;margin-top:3px}
.ordo-title{font-family:var(--serif);font-size:1.3rem;color:var(--dark);font-style:italic;text-align:right}
.ordo-date{font-size:11.5px;color:var(--muted);text-align:right;margin-top:4px}
.ordo-num{font-size:10px;color:var(--muted2);text-align:right;margin-top:2px;font-family:monospace}

.ordo-patient-block{background:var(--cream);border:1px solid var(--border);border-radius:var(--rs);padding:14px 18px;margin-bottom:1.5rem;display:flex;gap:2.5rem;flex-wrap:wrap}
.ordo-patient-field{display:flex;flex-direction:column;gap:3px}
.ordo-patient-label{font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:var(--gold);font-weight:600}
.ordo-patient-value{color:var(--dark);font-weight:500;font-size:14px}

.diag-row{display:flex;gap:10px;align-items:center;margin-bottom:1.25rem;padding:8px 14px;background:var(--gold-pale);border-radius:var(--rs);border:1px solid rgba(162,128,68,.2)}
.diag-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--gold);flex-shrink:0}

.rx-header{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:var(--gold);margin-bottom:1rem;display:flex;align-items:center;gap:8px}
.rx-header::before,.rx-header::after{content:'';flex:1;height:1px;background:var(--border)}

.rx-list{display:flex;flex-direction:column;gap:1.1rem}
.rx-item{display:flex;gap:14px;padding:12px 14px;border-radius:var(--rs);border:1px solid var(--border);background:var(--cream);transition:border-color .2s}
.rx-item:hover{border-color:var(--border2)}
.rx-num{width:22px;height:22px;border-radius:50%;background:var(--gold);color:var(--white);font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:3px}
.rx-content{flex:1}
.rx-name-input{border:none;background:transparent;font-family:var(--serif);font-size:16px;font-weight:600;color:var(--dark);outline:none;width:100%;border-bottom:1px dashed transparent;transition:border-color .15s;cursor:pointer}
.rx-name-input:hover,.rx-name-input:focus{border-bottom-color:var(--gold)}
.rx-details{display:flex;gap:6px;flex-wrap:wrap;margin-top:5px;align-items:center}
.rx-detail-input{border:none;background:transparent;font-family:var(--sans);font-size:12.5px;color:var(--muted);outline:none;min-width:60px;border-bottom:1px dashed transparent;transition:border-color .15s;cursor:pointer}
.rx-detail-input:hover,.rx-detail-input:focus{border-bottom-color:var(--gold)}
.rx-sep{color:var(--muted2);font-size:10px}
.rx-note-input{border:none;background:transparent;font-family:var(--sans);font-size:11.5px;color:var(--muted2);outline:none;width:100%;border-bottom:1px dashed transparent;transition:border-color .15s;font-style:italic;margin-top:4px;cursor:pointer;display:block}
.rx-note-input:hover,.rx-note-input:focus{border-bottom-color:var(--gold)}
.rx-delete{background:none;border:none;cursor:pointer;color:var(--muted2);font-size:16px;padding:0 3px;align-self:flex-start;line-height:1;transition:color .15s}
.rx-delete:hover{color:#C8471A}

.editable{border:none;background:transparent;font-family:inherit;font-size:inherit;color:inherit;font-weight:inherit;outline:none;cursor:pointer;border-bottom:1px dashed transparent;transition:border-color .15s;width:100%}
.editable:focus,.editable:hover{border-bottom-color:var(--gold)}

.instructions-block{margin-top:1.5rem;padding:14px 16px;background:var(--cream);border:1px solid var(--border);border-left:3px solid var(--gold);border-radius:var(--rs)}
.instructions-label{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:var(--gold);margin-bottom:6px}
.instructions-input{width:100%;min-height:36px;resize:vertical;font-size:12.5px;color:var(--dark2);font-family:var(--sans);border:none;background:transparent;outline:none;line-height:1.7}

.ordo-footer{margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-end}
.ordo-validity{font-size:11px;color:var(--muted2);line-height:1.8}
.sig-block{text-align:center}
.sig-line{width:150px;border-bottom:1px solid var(--border2);height:38px;margin-bottom:5px}
.sig-label{font-size:10px;color:var(--muted2)}
.ordo-bottombar{background:var(--gold);height:4px}

.ordo-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:440px;gap:18px}
.ordo-empty-icon{color:var(--border2);opacity:.5}
.ordo-empty-title{font-family:var(--serif);font-size:1.5rem;color:var(--muted);font-style:italic}
.ordo-empty-sub{font-size:13px;color:var(--muted2);text-align:center;line-height:1.8}

.toolbar{background:var(--white);border-top:1px solid var(--border);padding:.875rem 2rem;display:flex;gap:10px;justify-content:flex-end;align-items:center}
.btn{padding:8px 20px;border-radius:var(--rs);font-size:12.5px;font-weight:500;cursor:pointer;border:1px solid var(--border);font-family:var(--sans);transition:all .15s;letter-spacing:.02em}
.btn-ghost{background:transparent;color:var(--muted)}
.btn-ghost:hover{background:var(--cream);color:var(--dark)}
.btn-gold{background:var(--gold);color:var(--white);border-color:var(--gold)}
.btn-gold:hover{background:var(--dark);border-color:var(--dark)}
.btn-add{background:transparent;color:var(--gold);border:1px dashed var(--border2);font-size:12px;margin-top:.75rem;width:100%;text-align:center;padding:8px;border-radius:var(--rs);font-family:var(--sans);cursor:pointer;transition:all .15s}
.btn-add:hover{background:var(--gold-pale);border-color:var(--gold)}

.badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:3px 10px;border-radius:99px}
.badge-gold{background:var(--gold-pale);color:var(--gold);border:1px solid rgba(162,128,68,.3)}

.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--dark);color:var(--gold-l);padding:10px 22px;border-radius:var(--rs);font-size:13px;z-index:200;border:1px solid var(--gold);animation:toast-in .2s ease;font-family:var(--sans)}
.toast.error{background:#3D1010;color:#F0A090;border-color:#C8471A}
@keyframes toast-in{from{opacity:0;transform:translateX(-50%) translateY(8px)}}

.med-search-wrapper{position:relative}
.med-suggestions{position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--white);border:1px solid var(--border2);border-radius:var(--rs);box-shadow:var(--shadow);z-index:50;max-height:200px;overflow-y:auto}
.med-suggestion-item{padding:9px 13px;font-size:13px;color:var(--dark2);cursor:pointer;border-bottom:1px solid var(--border);transition:background .1s;display:flex;justify-content:space-between;align-items:center}
.med-suggestion-item:last-child{border-bottom:none}
.med-suggestion-item:hover{background:var(--gold-pale)}
.med-suggestion-dosages{font-size:10px;color:var(--muted2)}

.history-panel{padding:1.5rem}
.history-empty{text-align:center;padding:3rem;color:var(--muted2);font-style:italic;font-family:var(--serif);font-size:1.1rem}
.history-list{display:flex;flex-direction:column;gap:10px}
.history-item{background:var(--white);border:1px solid var(--border);border-radius:var(--rs);padding:14px 18px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:all .15s}
.history-item:hover{border-color:var(--gold);box-shadow:var(--shadow-sm)}
.history-item-left{display:flex;flex-direction:column;gap:3px}
.history-patient{font-weight:500;color:var(--dark);font-size:14px}
.history-meta{font-size:11px;color:var(--muted)}
.history-num{font-size:10px;color:var(--muted2);font-family:monospace}
.history-actions{display:flex;gap:8px}
.history-btn{padding:5px 12px;border-radius:var(--rs);font-size:11px;font-weight:500;cursor:pointer;border:1px solid var(--border);font-family:var(--sans);background:transparent;color:var(--muted);transition:all .15s}
.history-btn:hover{background:var(--gold);color:var(--white);border-color:var(--gold)}
.history-btn.del:hover{background:#C8471A;border-color:#C8471A;color:white}

@media(max-width:900px){.main{grid-template-columns:1fr;max-height:none}.panel-left{border-right:none;border-bottom:1px solid var(--border)}}
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function MediCo() {
  const [lang, setLang] = useState("fr");
  const t = T[lang];

  const [tab, setTab] = useState("dictee");
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem("medico_groq_key") || "");
  const [medecin, setMedecin] = useState(() => {
    try { return JSON.parse(localStorage.getItem("medico_medecin")) || { nom: "Benali Ahmed", specialite: "Médecine Générale", adresse: "Oran, Algérie", tel: "+213 41 XX XX XX", inami: "0123456789" }; }
    catch { return { nom: "Benali Ahmed", specialite: "Médecine Générale", adresse: "Oran, Algérie", tel: "+213 41 XX XX XX", inami: "0123456789" }; }
  });

  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [ordo, setOrdo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [toast, setToast] = useState(null);
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("medico_history")) || []; } catch { return []; } });
  const [medSuggestions, setMedSuggestions] = useState([]);
  const [activeMedIdx, setActiveMedIdx] = useState(null);

  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => { localStorage.setItem("medico_groq_key", groqKey); }, [groqKey]);
  useEffect(() => { localStorage.setItem("medico_medecin", JSON.stringify(medecin)); }, [medecin]);
  useEffect(() => { localStorage.setItem("medico_history", JSON.stringify(history)); }, [history]);

  const showToast = (msg, type = "") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const startRecording = useCallback(async () => {
    if (!groqKey) { showToast("Renseigne ta clé Groq d'abord", "error"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.start(100); mediaRef.current = mr;
      setRecording(true); setTimer(0);
      timerRef.current = setInterval(() => setTimer((s) => s + 1), 1000);
    } catch { showToast("Impossible d'accéder au micro", "error"); }
  }, [groqKey]);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    setRecording(false);
    if (!mediaRef.current) return;
    mediaRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      mediaRef.current.stream.getTracks().forEach((t) => t.stop());
      setLoading(true);
      try {
        setLoadingStep(t.transcribing);
        const text = await transcribeWithGroq(blob, groqKey);
        setTranscript(text); setStep(1);
        setLoadingStep(t.parsing);
        const parsed = await parseWithGroq(text, groqKey);
        const newOrdo = { ...parsed, numero: genNum(), date: new Date().toISOString() };
        setOrdo(newOrdo); setStep(2);
        setHistory((h) => [{ ...newOrdo, transcription: text }, ...h].slice(0, 50));
        showToast(t.generated);
      } catch (e) { showToast(e.message || "Erreur", "error"); }
      finally { setLoading(false); setLoadingStep(""); }
    };
    mediaRef.current.stop();
  }, [groqKey, t]);

  const handleMedNameChange = (i, val) => {
    updateMed(i, "nom", val);
    setActiveMedIdx(i);
    if (val.length >= 2) {
      const q = val.toLowerCase();
      setMedSuggestions(MEDICAMENTS_DB.filter((m) => m.nom.toLowerCase().includes(q)).slice(0, 8));
    } else setMedSuggestions([]);
  };

  const selectSuggestion = (i, med) => {
    updateMed(i, "nom", med.nom);
    if (med.dosages?.[0]) updateMed(i, "dosage", med.dosages[0]);
    setMedSuggestions([]); setActiveMedIdx(null);
  };

  const updateMed = (i, field, val) =>
    setOrdo((o) => { const m = [...(o.medicaments || [])]; m[i] = { ...m[i], [field]: val }; return { ...o, medicaments: m }; });
  const addMed = () =>
    setOrdo((o) => ({ ...o, medicaments: [...(o.medicaments || []), { nom: "", dosage: "", frequence: "", duree: "", note: "" }] }));
  const removeMed = (i) =>
    setOrdo((o) => { const m = [...(o.medicaments || [])]; m.splice(i, 1); return { ...o, medicaments: m }; });
  const reset = () => { setTranscript(""); setOrdo(null); setStep(0); setTimer(0); setMedSuggestions([]); };
  const updateMedecin = (k, v) => setMedecin((m) => ({ ...m, [k]: v }));
  const loadFromHistory = (item) => { setOrdo(item); setStep(2); setTab("dictee"); };
  const deleteFromHistory = (e, idx) => { e.stopPropagation(); setHistory((h) => h.filter((_, i) => i !== idx)); };

  return (
    <>
      <style>{STYLES}</style>

      <header className="header">
        <div className="logo">
          <span className="logo-name">MédiCo</span>
          <span className="logo-sep">·</span>
          <span className="logo-ar">ميديكو</span>
        </div>
        <div className="header-right">
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === "fr" ? "active" : ""}`} onClick={() => setLang("fr")}>FR</button>
            <button className={`lang-btn ${lang === "ar" ? "active" : ""}`} onClick={() => setLang("ar")}>ع</button>
          </div>
          <div className="steps">
            {[0, 1, 2].map((i) => <div key={i} className={`step-dot ${step > i ? "done" : step === i ? "active" : ""}`} />)}
          </div>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab-btn ${tab === "dictee" ? "active" : ""}`} onClick={() => setTab("dictee")}>
          {lang === "ar" ? "الإملاء" : "Dictée"}
        </button>
        <button className={`tab-btn ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
          {t.history}{history.length > 0 ? ` (${history.length})` : ""}
        </button>
      </div>

      <div className="main">
        <aside className="panel-left">
          <div className="panel-section">
            <p className="section-label">{t.apiKey}</p>
            <div className="input-group">
              <label className="input-label">{t.apiHint}</label>
              <input className="input-field" type="password" placeholder="gsk_..." value={groqKey} onChange={(e) => setGroqKey(e.target.value)} />
            </div>
          </div>

          <div className="panel-section">
            <p className="section-label">{t.doctorProfile}</p>
            <div className="profile-grid">
              {[
                { key: "nom", label: t.nom, full: true },
                { key: "specialite", label: t.specialite, full: true },
                { key: "tel", label: t.tel },
                { key: "inami", label: t.inami },
                { key: "adresse", label: t.adresse, full: true },
              ].map(({ key, label, full }) => (
                <div key={key} className={`input-group ${full ? "full" : ""}`}>
                  <label className="input-label">{label}</label>
                  <input className="input-field" value={medecin[key]} onChange={(e) => updateMedecin(key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="panel-section" style={{ flex: 1 }}>
            <p className="section-label">{t.dictee}</p>
            <div className="mic-area">
              {recording && <div className="timer">{fmtTime(timer)}</div>}
              <button className={`mic-btn ${recording ? "recording" : ""}`} onClick={recording ? stopRecording : startRecording} disabled={loading}>
                {recording ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </button>
              <p className={`mic-status ${recording ? "recording" : ""}`}>
                {loading ? loadingStep : recording ? t.recording : t.clickToRecord}
              </p>
              {loading && <div className="loading-bar"><div className="loading-bar-inner"/></div>}
            </div>
            {transcript && <div className="transcript-box">{transcript}</div>}
          </div>
        </aside>

        <div className="panel-right">
          {tab === "history" ? (
            <div className="history-panel">
              {history.length === 0 ? (
                <div className="history-empty">{t.noHistory}</div>
              ) : (
                <div className="history-list">
                  {history.map((item, idx) => (
                    <div key={idx} className="history-item" onClick={() => loadFromHistory(item)}>
                      <div className="history-item-left">
                        <span className="history-patient">{item.patient?.nom || "—"}</span>
                        <span className="history-meta">{item.medicaments?.length || 0} médicament(s){item.diagnostic ? ` · ${item.diagnostic}` : ""}</span>
                        <span className="history-num">{item.numero}</span>
                      </div>
                      <div className="history-actions">
                        <button className="history-btn" onClick={() => loadFromHistory(item)}>{t.open}</button>
                        <button className="history-btn del" onClick={(e) => deleteFromHistory(e, idx)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="ordo-wrapper">
                {!ordo ? (
                  <div className="ordo-paper">
                    <div className="ordo-topbar"/>
                    <div className="ordo-body">
                      <div className="ordo-empty">
                        <div className="ordo-empty-icon">
                          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                          </svg>
                        </div>
                        <div className="ordo-empty-title">{t.noOrdo}</div>
                        <div className="ordo-empty-sub">{loading ? loadingStep : t.noOrdoSub}</div>
                        {loading && <div className="loading-bar" style={{ width: 200 }}><div className="loading-bar-inner"/></div>}
                      </div>
                    </div>
                    <div className="ordo-bottombar"/>
                  </div>
                ) : (
                  <div className="ordo-paper" onClick={() => setMedSuggestions([])}>
                    <div className="ordo-topbar"/>
                    <div className="ordo-body">
                      <div className="ordo-header">
                        <div>
                          <div className="ordo-medecin-name">Dr. {medecin.nom}</div>
                          <div className="ordo-medecin-info">
                            {medecin.specialite && <div>{medecin.specialite}</div>}
                            {medecin.adresse && <div>{medecin.adresse}</div>}
                            {medecin.tel && <div>Tél : {medecin.tel}</div>}
                            {medecin.inami && <div>N° {medecin.inami}</div>}
                          </div>
                        </div>
                        <div>
                          <div className="ordo-title">{lang === "ar" ? "وصفة طبية" : "Ordonnance"}</div>
                          <div className="ordo-date">{todayStr(lang)}</div>
                          <div className="ordo-num">{ordo.numero}</div>
                        </div>
                      </div>

                      <div className="ordo-patient-block">
                        {[{ label: t.patient, field: "nom", w: 200 }, { label: t.age, field: "age", w: 60 }, { label: t.sexe, field: "sexe", w: 50 }].map(({ label, field, w }) => (
                          <div key={field} className="ordo-patient-field">
                            <span className="ordo-patient-label">{label}</span>
                            <input className="editable ordo-patient-value" style={{ width: w }} value={ordo.patient?.[field] || ""} onChange={(e) => setOrdo((o) => ({ ...o, patient: { ...o.patient, [field]: e.target.value } }))} placeholder="—" />
                          </div>
                        ))}
                      </div>

                      <div className="diag-row">
                        <span className="diag-label">{t.diagnostic}</span>
                        <input className="editable" style={{ fontSize: 13, color: "var(--dark2)" }} value={ordo.diagnostic || ""} onChange={(e) => setOrdo((o) => ({ ...o, diagnostic: e.target.value }))} placeholder="—" />
                      </div>

                      <div className="rx-header">{t.prescription}</div>
                      <div className="rx-list">
                        {(ordo.medicaments || []).map((med, i) => (
                          <div key={i} className="rx-item">
                            <div className="rx-num">{i + 1}</div>
                            <div className="rx-content">
                              <div className="med-search-wrapper">
                                <input
                                  className="rx-name-input"
                                  value={med.nom}
                                  onChange={(e) => handleMedNameChange(i, e.target.value)}
                                  onFocus={() => setActiveMedIdx(i)}
                                  placeholder={lang === "ar" ? "اسم الدواء" : "Médicament"}
                                />
                                {activeMedIdx === i && medSuggestions.length > 0 && (
                                  <div className="med-suggestions">
                                    {medSuggestions.map((s, si) => (
                                      <div key={si} className="med-suggestion-item" onMouseDown={() => selectSuggestion(i, s)}>
                                        <span>{s.nom}</span>
                                        <span className="med-suggestion-dosages">{s.dosages.join(", ")}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="rx-details">
                                <input className="rx-detail-input" value={med.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} placeholder={t.dosage} style={{ width: 90 }} />
                                <span className="rx-sep">·</span>
                                <input className="rx-detail-input" value={med.frequence} onChange={(e) => updateMed(i, "frequence", e.target.value)} placeholder={t.frequence} style={{ width: 130 }} />
                                <span className="rx-sep">·</span>
                                <input className="rx-detail-input" value={med.duree} onChange={(e) => updateMed(i, "duree", e.target.value)} placeholder={t.duree} style={{ width: 90 }} />
                              </div>
                              <input className="rx-note-input" value={med.note || ""} onChange={(e) => updateMed(i, "note", e.target.value)} placeholder={t.note} />
                            </div>
                            <button className="rx-delete" onClick={() => removeMed(i)}>×</button>
                          </div>
                        ))}
                      </div>

                      <button className="btn-add" onClick={addMed}>{t.addMed}</button>

                      <div className="instructions-block">
                        <div className="instructions-label">{t.instructions}</div>
                        <textarea className="instructions-input" value={ordo.instructions || ""} onChange={(e) => setOrdo((o) => ({ ...o, instructions: e.target.value }))} />
                      </div>

                      <div className="ordo-footer">
                        <div className="ordo-validity">{t.validite}</div>
                        <div className="sig-block">
                          <div className="sig-line"/>
                          <div className="sig-label">{t.signature}</div>
                        </div>
                      </div>
                    </div>
                    <div className="ordo-bottombar"/>
                  </div>
                )}
              </div>

              {ordo && (
                <div className="toolbar">
                  <span className="badge badge-gold">✦ {t.generated}</span>
                  <button className="btn btn-ghost" onClick={reset}>{t.newDictee}</button>
                  <button className="btn btn-gold" onClick={() => generatePDF(ordo, medecin, lang)}>{t.downloadPDF}</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
