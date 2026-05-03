
import { useState, useRef, useCallback } from "react";
import { jsPDF } from 'jspdf'
// ─── FONTS ──────────────────────────────────────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Geist:wght@300;400;500;600&display=swap";

// ─── STYLES ─────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('${FONT_LINK}');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #F7F6F2;
    --surface: #FFFFFF;
    --surface2: #F0EEE8;
    --border: #E2DED6;
    --text: #1A1916;
    --text2: #6B6860;
    --text3: #9E9B94;
    --accent: #1A5C3A;
    --accent-light: #E8F2EC;
    --accent2: #C8471A;
    --red-light: #FBF0EC;
    --mono: 'DM Mono', monospace;
    --serif: 'DM Serif Display', serif;
    --sans: 'Geist', sans-serif;
    --radius: 12px;
    --radius-sm: 8px;
  }

  body { font-family: var(--sans); background: var(--bg); color: var(--text); min-height: 100vh; }

  #root { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── Header ── */
  .header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0 2rem;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .logo {
    font-family: var(--serif);
    font-size: 1.5rem;
    color: var(--accent);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
  .logo-sub { font-family: var(--sans); font-size: 11px; color: var(--text3); font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase; }

  /* ── Layout ── */
  .main { flex: 1; display: grid; grid-template-columns: 360px 1fr; gap: 0; max-height: calc(100vh - 60px); }

  /* ── Left Panel ── */
  .panel-left {
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .panel-section { padding: 1.5rem; border-bottom: 1px solid var(--border); }
  .panel-section:last-child { border-bottom: none; flex: 1; }
  .section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text3);
    margin-bottom: 1rem;
  }

  /* ── API Key ── */
  .input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
  .input-label { font-size: 12px; color: var(--text2); font-weight: 500; }
  .input-field {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--text);
    outline: none;
    width: 100%;
    transition: border-color 0.15s;
  }
  .input-field:focus { border-color: var(--accent); }
  .input-field::placeholder { color: var(--text3); }

  /* ── Médecin Profile ── */
  .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .profile-grid .full { grid-column: 1 / -1; }

  /* ── Micro Button ── */
  .mic-area { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 1rem 0; }

  .mic-btn {
    width: 80px; height: 80px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    position: relative;
    background: var(--surface2);
    border: 2px solid var(--border);
  }
  .mic-btn:hover { background: var(--accent-light); border-color: var(--accent); }
  .mic-btn.recording {
    background: var(--red-light);
    border-color: var(--accent2);
    animation: pulse-border 1.5s ease-in-out infinite;
  }
  .mic-btn svg { width: 28px; height: 28px; }
  .mic-btn.recording svg { color: var(--accent2); }
  .mic-btn:not(.recording) svg { color: var(--text2); }

  @keyframes pulse-border {
    0%, 100% { box-shadow: 0 0 0 0 rgba(200, 71, 26, 0.2); }
    50% { box-shadow: 0 0 0 10px rgba(200, 71, 26, 0); }
  }

  .mic-status { font-size: 13px; color: var(--text2); text-align: center; line-height: 1.5; }
  .mic-status.recording { color: var(--accent2); font-weight: 500; }

  .timer {
    font-family: var(--mono);
    font-size: 20px;
    font-weight: 500;
    color: var(--accent2);
    letter-spacing: 0.05em;
  }

  /* ── Transcription box ── */
  .transcript-box {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px;
    font-size: 13px;
    color: var(--text2);
    line-height: 1.7;
    min-height: 80px;
    font-style: italic;
    white-space: pre-wrap;
  }
  .transcript-box.has-text { color: var(--text); font-style: normal; }

  /* ── Right Panel ── */
  .panel-right {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background: var(--bg);
  }

  /* ── Ordonnance Preview ── */
  .ordo-wrapper { padding: 2rem; flex: 1; }
  .ordo-paper {
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2.5rem;
    max-width: 680px;
    margin: 0 auto;
    box-shadow: 0 2px 20px rgba(0,0,0,0.05);
    font-family: var(--sans);
    position: relative;
    min-height: 600px;
  }

  /* Ordonnance header */
  .ordo-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 1.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid var(--accent); }
  .ordo-medecin-name { font-family: var(--serif); font-size: 1.4rem; color: var(--accent); }
  .ordo-medecin-info { font-size: 12px; color: var(--text2); line-height: 1.8; margin-top: 4px; }
  .ordo-title-block { text-align: right; }
  .ordo-title { font-family: var(--serif); font-size: 1.1rem; color: var(--text); }
  .ordo-date { font-size: 12px; color: var(--text3); font-family: var(--mono); margin-top: 4px; }
  .ordo-num { font-size: 11px; color: var(--text3); font-family: var(--mono); margin-top: 2px; }

  /* Patient */
  .ordo-patient-block {
    background: var(--surface2);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    margin-bottom: 1.5rem;
    display: flex;
    gap: 2rem;
    font-size: 13px;
  }
  .ordo-patient-field { display: flex; flex-direction: column; gap: 2px; }
  .ordo-patient-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text3); font-weight: 600; }
  .ordo-patient-value { color: var(--text); font-weight: 500; }

  /* Médicaments */
  .ordo-rx-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3); font-weight: 600; margin-bottom: 1rem; }
  .ordo-rx-list { display: flex; flex-direction: column; gap: 1.25rem; }
  .ordo-rx-item { display: flex; gap: 16px; }
  .ordo-rx-num {
    width: 24px; height: 24px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    font-size: 11px;
    font-weight: 600;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .ordo-rx-content { flex: 1; }
  .ordo-rx-name { font-size: 15px; font-weight: 600; color: var(--text); }
  .ordo-rx-detail { font-size: 13px; color: var(--text2); margin-top: 2px; line-height: 1.6; }
  .ordo-rx-note { font-size: 12px; color: var(--text3); margin-top: 4px; font-style: italic; }

  /* Footer ordo */
  .ordo-footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-end; }
  .ordo-signature-block { text-align: center; }
  .ordo-signature-line { width: 160px; border-bottom: 1px solid var(--text3); margin-bottom: 6px; height: 40px; }
  .ordo-signature-label { font-size: 11px; color: var(--text3); }
  .ordo-validity { font-size: 11px; color: var(--text3); max-width: 200px; text-align: right; line-height: 1.6; }

  /* Empty state */
  .ordo-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 16px;
    color: var(--text3);
  }
  .ordo-empty-icon { font-size: 48px; opacity: 0.3; }
  .ordo-empty-text { font-size: 14px; text-align: center; line-height: 1.8; }
  .ordo-empty-text strong { color: var(--text2); }

  /* ── Toolbar ── */
  .toolbar {
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 1rem 2rem;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    align-items: center;
  }
  .btn {
    padding: 8px 18px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--border);
    font-family: var(--sans);
    transition: all 0.15s;
  }
  .btn-ghost { background: transparent; color: var(--text2); }
  .btn-ghost:hover { background: var(--surface2); }
  .btn-primary { background: var(--accent); color: white; border-color: var(--accent); }
  .btn-primary:hover { opacity: 0.88; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-danger { background: var(--red-light); color: var(--accent2); border-color: var(--accent2); }
  .btn-danger:hover { background: #f5e8e3; }

  /* ── Steps indicator ── */
  .steps { display: flex; align-items: center; gap: 6px; }
  .step-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); transition: background 0.3s; }
  .step-dot.done { background: var(--accent); }
  .step-dot.active { background: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
  .step-label { font-size: 12px; color: var(--text3); margin-left: 4px; }

  /* ── Loading ── */
  .loading-bar {
    height: 2px;
    background: var(--border);
    border-radius: 99px;
    overflow: hidden;
    margin-top: 8px;
  }
  .loading-bar-inner {
    height: 100%;
    background: var(--accent);
    border-radius: 99px;
    animation: loading-slide 1.2s ease-in-out infinite;
    width: 40%;
  }
  @keyframes loading-slide {
    0% { transform: translateX(-200%); }
    100% { transform: translateX(400%); }
  }

  /* ── Toast ── */
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--text);
    color: white;
    padding: 10px 20px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    z-index: 100;
    animation: toast-in 0.2s ease;
  }
  .toast.error { background: var(--accent2); }
  @keyframes toast-in { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }

  /* ── Editable fields ── */
  .editable {
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    font-weight: inherit;
    width: 100%;
    outline: none;
    cursor: pointer;
    border-bottom: 1px dashed transparent;
    transition: border-color 0.15s;
  }
  .editable:hover, .editable:focus { border-bottom-color: var(--accent); }

  /* ── Tags / badges ── */
  .badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 8px; border-radius: 99px; }
  .badge-green { background: var(--accent-light); color: var(--accent); }
  .badge-gray { background: var(--surface2); color: var(--text3); border: 1px solid var(--border); }

  @media (max-width: 900px) {
    .main { grid-template-columns: 1fr; }
    .panel-left { border-right: none; border-bottom: 1px solid var(--border); max-height: none; }
    .panel-right { min-height: 600px; }
  }
`;

// ─── UTILS ──────────────────────────────────────────────────────────────────
const today = () => {
  const d = new Date();
  return d.toLocaleDateString("fr-DZ", { year: "numeric", month: "long", day: "numeric" });
};
const genNum = () => `ORD-${Date.now().toString(36).toUpperCase()}`;
const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ─── PARSING ─────────────────────────────────────────────────────────────────
async function parseWithClaude(transcript, apiKey) {
  const systemPrompt = `Tu es un assistant médical. Extrais les informations d'une ordonnance dictée par un médecin (en français, arabe, ou mélangé).

Retourne UNIQUEMENT un JSON valide avec cette structure exacte, sans markdown, sans texte avant ou après :
{
  "patient": {
    "nom": "...",
    "age": "...",
    "sexe": "M ou F ou inconnu"
  },
  "medicaments": [
    {
      "nom": "...",
      "dosage": "...",
      "frequence": "...",
      "duree": "...",
      "note": "..."
    }
  ],
  "diagnostic": "...",
  "instructions": "..."
}

Si une info est absente, mets une chaîne vide "". Le champ medicaments doit toujours être un tableau.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: transcript }],
    }),
  });

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function transcribeWithWhisper(audioBlob, apiKey) {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("model", "whisper-1");
  formData.append("language", "fr");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) throw new Error(`Whisper error: ${response.status}`);
  const data = await response.json();
  return data.text;
}

// ─── PDF GENERATION ──────────────────────────────────────────────────────────
async function generatePDF(ordo, medecin) {
  
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 20;

  // Couleur accent
  const accent = [26, 92, 58];
  const gray = [107, 104, 96];
  const lightGray = [240, 238, 232];

  // ── En-tête ──
  doc.setFillColor(...accent);
  doc.rect(M, 15, 80, 0.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...accent);
  doc.text(`Dr. ${medecin.nom}`, M, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  if (medecin.specialite) doc.text(medecin.specialite, M, 31);
  if (medecin.adresse) doc.text(medecin.adresse, M, 36);
  if (medecin.tel) doc.text(`Tél : ${medecin.tel}`, M, 41);
  if (medecin.inami) doc.text(`N° INAMI : ${medecin.inami}`, M, 46);

  // Titre droite
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(26, 25, 22);
  doc.text("ORDONNANCE", W - M, 25, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(today(), W - M, 31, { align: "right" });
  doc.text(ordo.numero, W - M, 36, { align: "right" });

  // Ligne séparatrice
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.6);
  doc.line(M, 52, W - M, 52);

  // ── Patient ──
  let y = 62;
  doc.setFillColor(...lightGray);
  doc.roundedRect(M, y - 5, W - M * 2, 22, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("PATIENT", M + 6, y + 1);
  doc.text("ÂGE", 90, y + 1);
  doc.text("SEXE", 130, y + 1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 25, 22);
  doc.text(ordo.patient?.nom || "—", M + 6, y + 9);
  doc.text(ordo.patient?.age || "—", 90, y + 9);
  doc.text(ordo.patient?.sexe || "—", 130, y + 9);

  y += 30;

  // ── Diagnostic ──
  if (ordo.diagnostic) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text("Diagnostic / motif :", M, y);
    doc.setTextColor(26, 25, 22);
    doc.text(ordo.diagnostic, M + 38, y);
    y += 8;
  }

  // ── Rx label ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text("PRESCRIPTION", M, y);
  y += 5;
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 6;

  // ── Médicaments ──
  (ordo.medicaments || []).forEach((med, i) => {
    if (y > 240) { doc.addPage(); y = 20; }

    // Numéro cercle
    doc.setFillColor(...accent);
    doc.circle(M + 3, y + 2, 3.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), M + 3, y + 2.8, { align: "center" });

    // Nom médicament
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(26, 25, 22);
    doc.text(med.nom || "—", M + 10, y + 4);

    y += 9;

    // Détails
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    const details = [med.dosage, med.frequence, med.duree].filter(Boolean).join("  ·  ");
    if (details) { doc.text(details, M + 10, y); y += 6; }
    if (med.note) {
      doc.setFontSize(9);
      doc.setTextColor(158, 155, 148);
      doc.text(med.note, M + 10, y);
      y += 5;
    }
    y += 5;
  });

  // ── Instructions ──
  if (ordo.instructions) {
    y += 4;
    doc.setFillColor(...lightGray);
    doc.roundedRect(M, y, W - M * 2, 14, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("INSTRUCTIONS", M + 4, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(26, 25, 22);
    const lines = doc.splitTextToSize(ordo.instructions, W - M * 2 - 8);
    doc.text(lines[0] || "", M + 4, y + 10);
    y += 20;
  }

  // ── Footer ──
  const footerY = 272;
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.line(M, footerY, W - M, footerY);

  // Signature
  doc.setDrawColor(...gray);
  doc.setLineWidth(0.3);
  doc.line(W - M - 55, footerY + 18, W - M, footerY + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text("Signature & Cachet", W - M - 27, footerY + 23, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(158, 155, 148);
  doc.text("Ordonnance valable 3 mois — À conserver", M, footerY + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...accent);
  doc.text("MédiCo", M, footerY + 14);

  doc.save(`ordonnance-${ordo.patient?.nom?.replace(/\s+/g, "-") || "patient"}-${Date.now()}.pdf`);
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function MediCo() {
  // Keys
  const [openaiKey, setOpenaiKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");

  // Médecin profile
  const [medecin, setMedecin] = useState({
    nom: "Dr. Benali Ahmed",
    specialite: "Médecine Générale",
    adresse: "12 Rue Larbi Ben M'hidi, Oran",
    tel: "+213 41 XX XX XX",
    inami: "0123456789",
  });

  // States
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [ordo, setOrdo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [toast, setToast] = useState(null);
  const [step, setStep] = useState(0); // 0=idle, 1=recorded, 2=parsed

  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const showToast = (msg, type = "") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Recording ──
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.start(100);
      mediaRef.current = mr;
      setRecording(true);
      setTimer(0);
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } catch (e) {
      showToast("Impossible d'accéder au micro", "error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    setRecording(false);
    if (!mediaRef.current) return;

    mediaRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      mediaRef.current.stream.getTracks().forEach((t) => t.stop());
      await processAudio(blob);
    };
    mediaRef.current.stop();
  }, [openaiKey, claudeKey]);

  const processAudio = async (blob) => {
    if (!openaiKey || !claudeKey) {
      showToast("Renseignez les clés API d'abord", "error");
      return;
    }
    setLoading(true);
    try {
      setLoadingStep("Transcription en cours…");
      const text = await transcribeWithWhisper(blob, openaiKey);
      setTranscript(text);
      setStep(1);

      setLoadingStep("Analyse de l'ordonnance…");
      const parsed = await parseWithClaude(text, claudeKey);
      setOrdo({ ...parsed, numero: genNum() });
      setStep(2);
      showToast("Ordonnance générée avec succès");
    } catch (e) {
      showToast(e.message || "Erreur lors du traitement", "error");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const updateMed = (i, field, val) => {
    setOrdo((o) => {
      const meds = [...(o.medicaments || [])];
      meds[i] = { ...meds[i], [field]: val };
      return { ...o, medicaments: meds };
    });
  };

  const addMed = () => {
    setOrdo((o) => ({
      ...o,
      medicaments: [...(o.medicaments || []), { nom: "Médicament", dosage: "", frequence: "", duree: "", note: "" }],
    }));
  };

  const removeMed = (i) => {
    setOrdo((o) => {
      const meds = [...(o.medicaments || [])];
      meds.splice(i, 1);
      return { ...o, medicaments: meds };
    });
  };

  const reset = () => {
    setTranscript("");
    setOrdo(null);
    setStep(0);
    setTimer(0);
  };

  const updateMedecin = (field, val) => setMedecin((m) => ({ ...m, [field]: val }));

  // ── Steps ──
  const steps = [
    { label: "Dictée", done: step >= 1 },
    { label: "Analyse", done: step >= 2 },
    { label: "PDF", done: false },
  ];

  return (
    <>
      <style>{STYLES}</style>
   

      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-dot" />
          MédiCo
          <span className="logo-sub">Ordonnances IA</span>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div key={i} className={`step-dot ${s.done ? "done" : step === i ? "active" : ""}`} title={s.label} />
          ))}
          <span className="step-label">{steps.find((_, i) => i === Math.min(step, 2))?.label}</span>
        </div>
      </header>

      <div className="main">
        {/* LEFT */}
        <aside className="panel-left">

          {/* Clés API */}
          <div className="panel-section">
            <p className="section-label">Clés API</p>
            <div className="input-group">
              <label className="input-label">OpenAI (Whisper)</label>
              <input className="input-field" type="password" placeholder="sk-..." value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Anthropic (Claude)</label>
              <input className="input-field" type="password" placeholder="sk-ant-..." value={claudeKey} onChange={(e) => setClaudeKey(e.target.value)} />
            </div>
          </div>

          {/* Profil médecin */}
          <div className="panel-section">
            <p className="section-label">Profil médecin</p>
            <div className="profile-grid">
              {[
                { key: "nom", label: "Nom complet", full: true },
                { key: "specialite", label: "Spécialité", full: true },
                { key: "tel", label: "Téléphone" },
                { key: "inami", label: "N° INAMI" },
                { key: "adresse", label: "Adresse", full: true },
              ].map(({ key, label, full }) => (
                <div key={key} className={`input-group ${full ? "full" : ""}`}>
                  <label className="input-label">{label}</label>
                  <input className="input-field" value={medecin[key]} onChange={(e) => updateMedecin(key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Micro */}
          <div className="panel-section">
            <p className="section-label">Dictée</p>
            <div className="mic-area">
              {recording && <div className="timer">{fmtTime(timer)}</div>}
              <button
                className={`mic-btn ${recording ? "recording" : ""}`}
                onClick={recording ? stopRecording : startRecording}
                disabled={loading}
              >
                {recording ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>
              <p className={`mic-status ${recording ? "recording" : ""}`}>
                {recording
                  ? "Parlez… cliquez pour arrêter"
                  : loading
                  ? loadingStep
                  : "Cliquez pour dicter l'ordonnance"}
              </p>
              {loading && <div className="loading-bar"><div className="loading-bar-inner" /></div>}
            </div>

            {transcript && (
              <div className={`transcript-box ${transcript ? "has-text" : ""}`}>
                {transcript || "La transcription apparaîtra ici…"}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT */}
        <div className="panel-right">
          <div className="ordo-wrapper">
            {!ordo ? (
              <div className="ordo-paper">
                <div className="ordo-empty">
                  <div className="ordo-empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div className="ordo-empty-text">
                    {loading ? (
                      <><strong>{loadingStep}</strong><br />Veuillez patienter…</>
                    ) : (
                      <><strong>Aucune ordonnance</strong><br />Dictez une prescription pour la voir apparaître ici.<br />Tous les champs seront éditables.</>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="ordo-paper">
                {/* En-tête */}
                <div className="ordo-header">
                  <div>
                    <div className="ordo-medecin-name">{medecin.nom}</div>
                    <div className="ordo-medecin-info">
                      {medecin.specialite && <div>{medecin.specialite}</div>}
                      {medecin.adresse && <div>{medecin.adresse}</div>}
                      {medecin.tel && <div>Tél : {medecin.tel}</div>}
                      {medecin.inami && <div>N° INAMI : {medecin.inami}</div>}
                    </div>
                  </div>
                  <div className="ordo-title-block">
                    <div className="ordo-title">Ordonnance</div>
                    <div className="ordo-date">{today()}</div>
                    <div className="ordo-num">{ordo.numero}</div>
                  </div>
                </div>

                {/* Patient */}
                <div className="ordo-patient-block">
                  <div className="ordo-patient-field">
                    <span className="ordo-patient-label">Patient</span>
                    <input className="editable ordo-patient-value" value={ordo.patient?.nom || ""} onChange={(e) => setOrdo((o) => ({ ...o, patient: { ...o.patient, nom: e.target.value } }))} placeholder="Nom du patient" />
                  </div>
                  <div className="ordo-patient-field">
                    <span className="ordo-patient-label">Âge</span>
                    <input className="editable ordo-patient-value" value={ordo.patient?.age || ""} onChange={(e) => setOrdo((o) => ({ ...o, patient: { ...o.patient, age: e.target.value } }))} placeholder="—" style={{ width: 60 }} />
                  </div>
                  <div className="ordo-patient-field">
                    <span className="ordo-patient-label">Sexe</span>
                    <input className="editable ordo-patient-value" value={ordo.patient?.sexe || ""} onChange={(e) => setOrdo((o) => ({ ...o, patient: { ...o.patient, sexe: e.target.value } }))} placeholder="—" style={{ width: 40 }} />
                  </div>
                </div>

                {/* Diagnostic */}
                {ordo.diagnostic !== undefined && (
                  <div style={{ marginBottom: "1.25rem", display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--text3)", flexShrink: 0 }}>Diagnostic :</span>
                    <input className="editable" style={{ fontSize: 13, color: "var(--text2)" }} value={ordo.diagnostic} onChange={(e) => setOrdo((o) => ({ ...o, diagnostic: e.target.value }))} placeholder="—" />
                  </div>
                )}

                {/* Médicaments */}
                <p className="ordo-rx-title">Prescription</p>
                <div className="ordo-rx-list">
                  {(ordo.medicaments || []).map((med, i) => (
                    <div key={i} className="ordo-rx-item">
                      <div className="ordo-rx-num">{i + 1}</div>
                      <div className="ordo-rx-content">
                        <input className="editable ordo-rx-name" value={med.nom} onChange={(e) => updateMed(i, "nom", e.target.value)} placeholder="Médicament" />
                        <div className="ordo-rx-detail" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <input className="editable" style={{ fontSize: 13, width: 100 }} value={med.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} placeholder="Dosage" />
                          <span style={{ color: "var(--text3)" }}>·</span>
                          <input className="editable" style={{ fontSize: 13, width: 120 }} value={med.frequence} onChange={(e) => updateMed(i, "frequence", e.target.value)} placeholder="Fréquence" />
                          <span style={{ color: "var(--text3)" }}>·</span>
                          <input className="editable" style={{ fontSize: 13, width: 100 }} value={med.duree} onChange={(e) => updateMed(i, "duree", e.target.value)} placeholder="Durée" />
                        </div>
                        {med.note !== undefined && (
                          <input className="editable ordo-rx-note" value={med.note} onChange={(e) => updateMed(i, "note", e.target.value)} placeholder="Note (optionnel)" />
                        )}
                      </div>
                      <button onClick={() => removeMed(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 16, padding: "0 4px", alignSelf: "flex-start" }}>×</button>
                    </div>
                  ))}
                </div>

                <button className="btn btn-ghost" style={{ marginTop: "1rem", fontSize: 12 }} onClick={addMed}>+ Ajouter un médicament</button>

                {/* Instructions */}
                {ordo.instructions !== undefined && (
                  <div style={{ marginTop: "1.5rem", padding: "12px 16px", background: "var(--surface2)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 6 }}>Instructions</div>
                    <textarea className="editable" value={ordo.instructions} onChange={(e) => setOrdo((o) => ({ ...o, instructions: e.target.value }))} style={{ width: "100%", minHeight: 40, resize: "vertical", fontSize: 13, color: "var(--text2)" }} />
                  </div>
                )}

                {/* Footer ordo */}
                <div className="ordo-footer">
                  <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.8 }}>
                    Ordonnance valable 3 mois<br />À conserver par le patient
                  </div>
                  <div className="ordo-signature-block">
                    <div className="ordo-signature-line" />
                    <div className="ordo-signature-label">Signature & Cachet</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toolbar */}
          {ordo && (
            <div className="toolbar">
              <span className="badge badge-green">Ordonnance générée</span>
              <button className="btn btn-ghost" onClick={reset}>Nouvelle dictée</button>
              <button className="btn btn-primary" onClick={() => generatePDF(ordo, medecin)}>
                Télécharger PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
