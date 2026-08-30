import { useState, useEffect } from "react";

// ── Aceve brand tokens ──────────────────────────────────────────────────────
const C = {
  deepGreen:    "#152F1A",
  primaryGreen: "#24462B",
  midGreen:     "#457951",
  lightGreen:   "#BDD78F",
  accentGreen:  "#E1FFAE",
  paleBg:       "#FBFFF0",
  green500:     "#92B97A",
  nearBlack:    "#0B1B11",
  white:        "#FFFFFF",
};

// ── Data model ──────────────────────────────────────────────────────────────
const PACKAGES = ["Foundation", "Core", "Professional"];

// Phases come from the Process documents — not the 47-checkpoint admin list.
// Each phase has a clear purpose, 3-5 steps, and exit criteria.
const PHASES = [
  {
    id: 1,
    key: "initiering",
    label: "Initiering",
    icon: "🚀",
    purpose: "Gemensam förståelse för projektets mål, omfattning, arbetssätt och ansvar.",
    owner: "Projektledare",
    steps: [
      { id: "i1", label: "Projektöverlämning och ansvarsfördelning", owner: "aceve",
        items: ["Projektledare tillsatt", "Resursallokering genomförd", "Överlämning från sälj", "Omfattning verifierad internt"] },
      { id: "i2", label: "Planering och förberedelser", owner: "aceve",
        items: ["Estimat framtaget", "Preliminär tidplan fastställd", "Aktiviteter identifierade"] },
      { id: "i3", label: "Databas & kundyta", owner: "aceve",
        items: ["Databas beställd från tekniksupport", "Bekräftelse mottagen", "Kundmapp skapad", "Extern yta etablerad"] },
      { id: "i4", label: "Uppstartsmöte med kund", owner: "both",
        items: ["Uppstartsmöte bokat", "Presentation framtagen", "Uppstartsmöte genomfört", "Beslut dokumenterade", "Skriftlig sammanfattning skickad"] },
      { id: "i5", label: "Övergång till Installation", owner: "aceve",
        items: ["Kriterier uppfyllda", "Workorder i Salesforce uppdaterad", "Projekt överlämnat till Installation"] },
    ],
    exit: [
      "Uppstartsmöte med kund genomfört",
      "Databas beställd",
      "Workorder i Salesforce uppdaterad",
    ],
    // Sub-views active in this phase
    hasGrundinfo:    false,
    hasKartlaggning: false,
  },
  {
    id: 2,
    key: "installation",
    label: "Installation",
    icon: "⚙️",
    purpose: "Kundens miljö är tekniskt redo — databas, tillgång, abonnemang och integrationer.",
    owner: "Implementationskonsult",
    steps: [
      { id: "in1", label: "Grunduppsättning av databas", owner: "aceve",
        items: ["Grundinformation konfigurerad i databasen", "Databas kvalitetssäkrad och validerad"] },
      { id: "in2", label: "Ge kund tillgång till systemet", owner: "both",
        items: ["Kundanvändare skapade", "Kund har tillgång till Next Project", "Ev. möte för grundgenomgång bokat"] },
      { id: "in3", label: "Start av abonnemang", owner: "aceve",
        items: ["Abonnemang startat enligt avtal", "Startdatum verifierat"] },
      { id: "in4", label: "Uppsättning av integrationer", owner: "aceve",
        items: ["Integration uppsatt och testad enligt kundens behov"] },
    ],
    exit: [
      "Grundinformation är korrekt inmatad i databasen",
      "Kund har tillgång till Next Project",
      "Abonnemang är startat",
      "Integrationer är uppsatta enligt överenskommelse",
    ],
    hasGrundinfo:    true,
    hasKartlaggning: false,
  },
  {
    id: 3,
    key: "kartlaggning",
    label: "Kartläggning",
    icon: "🗺️",
    purpose: "Kundens behov, processer och avvikelser från standard är kartlagda.",
    owner: "Implementationskonsult",
    steps: [
      { id: "k1", label: "Förberedelse av kartläggning", owner: "aceve",
        items: ["Kartläggningsmöte bokat", "Agenda och projektplan förberedd"] },
      { id: "k2", label: "Genomför kartläggning med kund", owner: "both",
        items: ["Kartläggningsmöte genomfört", "Frågor besvarade per område", "Avvikelser från standard markerade"] },
      { id: "k3", label: "Dokumentation och planering", owner: "aceve",
        items: ["Kartläggning dokumenterad", "Utbildningsplan fastställd", "Kalenderinbjudningar skickade"] },
    ],
    exit: [
      "Kartläggning genomförd och dokumenterad",
      "Avvikelser från standard listade (ev. ÄTA-kandidater)",
      "Utbildningsplan klar",
    ],
    hasGrundinfo:    true,
    hasKartlaggning: true,
  },
  {
    id: 4,
    key: "konfiguration",
    label: "Konfiguration",
    icon: "🔧",
    purpose: "Systemet är konfigurerat enligt kundens processer och kartläggning.",
    owner: "Implementationskonsult",
    steps: [
      { id: "c1", label: "Genomgång av kartläggning", owner: "aceve",
        items: ["Anteckningar från kartläggning genomgångna", "Avvikelser bekräftade eller hanterade via ÄTA"] },
      { id: "c2", label: "Genomför konfiguration", owner: "aceve",
        items: ["Konfiguration genomförd i databasen", "Moduler aktiverade enligt paket"] },
      { id: "c3", label: "Kundacceptans", owner: "both",
        items: ["Kundacceptans av konfiguration erhållen", "Eventuella justeringar gjorda"] },
    ],
    exit: [
      "Konfiguration genomförd",
      "Kundacceptans erhållen",
    ],
    hasGrundinfo:    false,
    hasKartlaggning: false,
  },
  {
    id: 5,
    key: "utbildning",
    label: "Utbildning",
    icon: "🎓",
    purpose: "Kunden kan använda systemet och är redo för produktionsstart.",
    owner: "Implementationskonsult",
    steps: [
      { id: "u1", label: "Förbered utbildning", owner: "aceve",
        items: ["Utbildningsmall vald", "Info från kartläggning inarbetad"] },
      { id: "u2", label: "Genomför utbildningar", owner: "both",
        items: ["Utbildningar genomförda enligt plan", "Avvikelser dokumenterade"] },
      { id: "u3", label: "Möte inför produktionsstart", owner: "both",
        items: ["Aktivitetslista genomgången", "Kvarstående ÄTA adresserade", "Tidplan bekräftad", "Hypercarefas kommunicerad"] },
      { id: "u4", label: "Säkerställ integrationsstart", owner: "aceve",
        items: ["Integration aktiverad i produktion"] },
    ],
    exit: [
      "Utbildningar genomförda",
      "Möte inför produktionsstart godkänt",
      "Integrationsstart verifierad",
    ],
    hasGrundinfo:    false,
    hasKartlaggning: false,
  },
  {
    id: 6,
    key: "hypercare",
    label: "Hypercare",
    icon: "🛡️",
    purpose: "Kunden står på egna ben. Överlämning till Support och CSM är klar.",
    owner: "Projektledare",
    steps: [
      { id: "h1", label: "Verifiering", owner: "aceve",
        items: ["Databas och integration verifierade", "Kund taggad i Zendesk", "Resurser för Hypercare säkrade"] },
      { id: "h2", label: "Löpande stöd", owner: "both",
        items: ["Ärendehantering i Zendesk", "Stödpass bokade vid behov"] },
      { id: "h3", label: "Avslut", owner: "both",
        items: ["Avslutsmöte genomfört", "Kvarstående punkter adresserade"] },
      { id: "h4", label: "Överlämning", owner: "aceve",
        items: ["Överlämning till Support/CSM", "Projekt arkiverat", "Delad kundyta stängd", "Hypercare-tagg borttagen"] },
    ],
    exit: [
      "Databas och integration verifierade",
      "Avslutsmöte genomfört",
      "Överlämning till Support/CSM klar",
    ],
    hasGrundinfo:    false,
    hasKartlaggning: false,
  },
];

// ── Grundinformation: 19 source tabs → 5 logical blocks ─────────────────────
const GRUNDINFO_BLOCKS = [
  {
    id: "foretag",
    label: "Företag & verksamhet",
    icon: "🏢",
    desc: "Grunduppgifter om er organisation",
    sources: ["Företag", "Verksamhet"],
    fields: [
      { name: "Företagsnamn", req: true },
      { name: "Org.nr", req: true },
      { name: "Momsreg.nr", req: true },
      { name: "Bankgiro / Plusgiro", req: true },
      { name: "Adress", req: true },
      { name: "Logotyp (skickas separat)", req: false },
    ],
  },
  {
    id: "ekonomi",
    label: "Ekonomi & fakturering",
    icon: "💰",
    desc: "Betalningsvillkor, kontoplan, skattereduktion, e-invoice",
    sources: ["Betalningsvillkor", "Skattereduktion", "Ev. kontoplan", "Övrigt"],
    fields: [
      { name: "Betalningsvillkor (antal dagar)", req: true },
      { name: "ROT/RUT/Grön teknik — standardinställning", req: false },
      { name: "Kontoplan (resultatkonton)", req: false, note: "Obligatorisk vid e-Invoice" },
      { name: "Verifikationsserier", req: true },
      { name: "Nummerserier (faktura, projekt, kund)", req: true },
    ],
  },
  {
    id: "projekt",
    label: "Projekt & prissättning",
    icon: "📊",
    desc: "Projekttyper, timpriser, prislistor, påslag, projekt",
    sources: ["Projekttyper", "Timpriser", "Prislista", "Påslagsmall", "Projekt"],
    fields: [
      { name: "Projekttyper som ska finnas i systemet", req: true },
      { name: "Timpriser (roller, kostnad, pris)", req: true },
      { name: "Prislista (artiklar, material, utrustning)", req: true },
      { name: "Påslagsmallar", req: false },
      { name: "Aktuella projekt att läsas in", req: false, note: "Om projekt ska migreras" },
    ],
  },
  {
    id: "register",
    label: "Register (användare, kunder, leverantörer)",
    icon: "👥",
    desc: "Användare, kund- och leverantörsregister med kontakter",
    sources: ["Användarregister", "Ev. kunder", "Ev. leverantörer", "Ev. kundkontakter", "Ev. leverantörskontakter"],
    fields: [
      { name: "Användarregister", req: true, note: "Alla som ska använda Next" },
      { name: "Kundregister", req: false, note: "Kan läsas in via integration (Visma/Fortnox/Hogia)" },
      { name: "Leverantörsregister", req: false, note: "Kan läsas in via integration" },
      { name: "Kundkontakter", req: false },
      { name: "Leverantörskontakter", req: false },
    ],
  },
  {
    id: "lon",
    label: "Lön & frånvaro",
    icon: "🕐",
    desc: "Lönetillägg och frånvarotyper (om lön ingår)",
    sources: ["Lönetillägg", "Frånvaro"],
    fields: [
      { name: "Lönetillägg (egen bil, traktamente, etc)", req: false, note: "Om lönemodul ingår" },
      { name: "Frånvarotyper (semester, sjuk, VAB, etc)", req: false, note: "Om lönemodul ingår" },
    ],
  },
];

// ── Kartläggning: 10 strukturerade områden från frågebatteriet ──────────────
const KARTLAGGNING_AREAS = [
  { id: "verksamhet",   label: "Verksamhet",           icon: "🏗️",
    questions: ["Inriktning/bransch", "Kunder (B2B/B2C/Offentlig)", "Projektformer", "Projektstorlek", "Största utmaningar"] },
  { id: "organisation", label: "Organisation & roller", icon: "👥",
    questions: ["Varför ni valt Next", "Organisationens uppbyggnad", "Geografiska platser", "Superusers", "Beslutsfattare", "Systemägare efter Go-Live"] },
  { id: "system",       label: "Nuvarande systemflora", icon: "🔌",
    questions: ["Ekonomisystem", "Lönesystem", "Kalkylsystem", "EFH / Leverantörsfakturasystem", "Övriga system"] },
  { id: "projekt",      label: "Projekthantering",       icon: "📁",
    questions: ["Projektimport", "ÄTA-hantering", "Avvikelser", "Projektuppföljning", "Projektträd", "Arbetsorder", "Projektbehörigheter", "Budget", "Prognos", "Inköp", "Dagbok", "Dokument", "Planering"] },
  { id: "registerdata", label: "Register & masterdata",  icon: "📇",
    questions: ["Leverantörsregister / masterdata", "Kundregister / masterdata", "Rättigheter för att skapa poster", "Kundtyper"] },
  { id: "tid_attest",   label: "Tid & attest",           icon: "⏱️",
    questions: ["AO/ÄTA-export", "Tidsrapportering (dag/klockslag)", "Attest av tid", "Nummerserier"] },
  { id: "lon",          label: "Lön",                    icon: "💼",
    questions: ["Uppsättning lön enligt lathund"] },
  { id: "ekonomi",      label: "Ekonomi & redovisning",  icon: "📈",
    questions: ["Ekonomisk uppföljning", "SVA", "Bokföringsserier", "Historisk import", "Kostnadsställe"] },
  { id: "einvoice",     label: "e-Invoice",              icon: "📨",
    questions: ["Frågor kring frågebatteri", "Standardkonto per leverantör", "Utbildningsbehov"] },
  { id: "fakturering",  label: "Fakturering",            icon: "🧾",
    questions: ["Faktureringsrutin", "Del-/Àconto", "ROT/RUT/Grön teknik", "Valutor"] },
  { id: "utbildning",   label: "Utbildning",             icon: "🎓",
    questions: ["Målgrupper (superusers, train the trainer)", "Format (plats/digitalt)", "Vilka utbildningar och hur många"] },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const ownerLabel = { aceve: "Aceve", kund: "Kund", both: "Båda" };
const ownerColor = {
  aceve: { bg: C.deepGreen,   text: C.white },
  kund:  { bg: C.accentGreen, text: C.deepGreen },
  both:  { bg: C.lightGreen,  text: C.deepGreen },
};

// ── Main component ──────────────────────────────────────────────────────────
export default function OnboardingToolV2() {
  const [pkg, setPkg]                   = useState("Foundation");
  const [activePhase, setActivePhase]   = useState(1);
  const [subView, setSubView]           = useState("process"); // process | grundinfo | kartlaggning
  const [view, setView]                 = useState("consultant"); // consultant | customer
  const [checked, setChecked]           = useState({});
  const [grundinfoStatus, setGrundinfoStatus] = useState({});
  const [kartlaggningStatus, setKartlaggningStatus] = useState({});
  const [avvikelser, setAvvikelser]     = useState({}); // question_id -> true/false

  // ── Load/save persistent state ───────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(`v2-checked-${pkg}`);
        if (r) setChecked(JSON.parse(r.value));
      } catch {}
      try {
        const r = await window.storage.get(`v2-grundinfo-${pkg}`);
        if (r) setGrundinfoStatus(JSON.parse(r.value));
      } catch {}
      try {
        const r = await window.storage.get(`v2-kartlaggning-${pkg}`);
        if (r) setKartlaggningStatus(JSON.parse(r.value));
      } catch {}
      try {
        const r = await window.storage.get(`v2-avvikelser-${pkg}`);
        if (r) setAvvikelser(JSON.parse(r.value));
      } catch {}
    })();
  }, [pkg]);

  const save = async (key, value) => {
    try { await window.storage.set(`v2-${key}-${pkg}`, JSON.stringify(value)); } catch {}
  };

  const toggleItem = (stepId, idx) => {
    const key = `${activePhase}-${stepId}-${idx}`;
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next); save("checked", next);
  };

  const toggleGrundinfo = (blockId, fieldIdx) => {
    const key = `${blockId}-${fieldIdx}`;
    const cur = grundinfoStatus[key] || "pending";
    const order = ["pending", "in_progress", "received", "validated"];
    const next = order[(order.indexOf(cur) + 1) % order.length];
    const updated = { ...grundinfoStatus, [key]: next };
    setGrundinfoStatus(updated); save("grundinfo", updated);
  };

  const toggleKartQuestion = (areaId, qIdx) => {
    const key = `${areaId}-${qIdx}`;
    const cur = kartlaggningStatus[key] || "pending";
    const order = ["pending", "standard", "avvikelse"];
    const next = order[(order.indexOf(cur) + 1) % order.length];
    const updated = { ...kartlaggningStatus, [key]: next };
    setKartlaggningStatus(updated); save("kartlaggning", updated);
    // Mark avvikelse for ÄTA trigger
    const avvNext = { ...avvikelser, [key]: next === "avvikelse" };
    setAvvikelser(avvNext); save("avvikelser", avvNext);
  };

  // ── Progress calculations ────────────────────────────────────────────────
  const phaseProgress = (phaseId) => {
    const phase = PHASES.find(p => p.id === phaseId);
    if (!phase) return 0;
    let total = 0, done = 0;
    phase.steps.forEach(s => {
      s.items.forEach((_, idx) => {
        total++;
        if (checked[`${phaseId}-${s.id}-${idx}`]) done++;
      });
    });
    return total ? Math.round((done / total) * 100) : 0;
  };

  const grundinfoProgress = () => {
    let total = 0, done = 0;
    GRUNDINFO_BLOCKS.forEach(b => {
      b.fields.forEach((_, i) => {
        total++;
        const s = grundinfoStatus[`${b.id}-${i}`];
        if (s === "received" || s === "validated") done++;
      });
    });
    return total ? Math.round((done / total) * 100) : 0;
  };

  const blockProgress = (block) => {
    let total = 0, done = 0;
    block.fields.forEach((_, i) => {
      total++;
      const s = grundinfoStatus[`${block.id}-${i}`];
      if (s === "received" || s === "validated") done++;
    });
    return total ? Math.round((done / total) * 100) : 0;
  };

  const kartAreaProgress = (area) => {
    let total = area.questions.length;
    let done = 0;
    area.questions.forEach((_, i) => {
      if (kartlaggningStatus[`${area.id}-${i}`]) done++;
    });
    return total ? Math.round((done / total) * 100) : 0;
  };

  const totalPhaseProgress = () => {
    const total = PHASES.reduce((a, p) => a + p.steps.reduce((b, s) => b + s.items.length, 0), 0);
    const done = Object.values(checked).filter(Boolean).length;
    return total ? Math.round((done / total) * 100) : 0;
  };

  const avvikelseCount = Object.values(avvikelser).filter(Boolean).length;

  const currentPhase = PHASES.find(p => p.id === activePhase);

  // Reset subView if switching to a phase that doesn't have it
  useEffect(() => {
    if (subView === "grundinfo" && !currentPhase.hasGrundinfo) setSubView("process");
    if (subView === "kartlaggning" && !currentPhase.hasKartlaggning) setSubView("process");
  }, [activePhase, currentPhase, subView]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily: "'Manrope', sans-serif",
      background: C.paleBg,
      minHeight: "100vh",
      color: C.deepGreen,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.green500}; border-radius: 3px; }
        .hover-row:hover { background: ${C.accentGreen}22 !important; }
        .pill:hover { opacity: 0.88; cursor: pointer; }
        .btn:hover { opacity: 0.88; }
        .fade-in { animation: fi 0.25s ease; }
        @keyframes fi { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ══ HEADER ══ */}
      <div style={{ background: C.deepGreen, padding: "18px 32px 0", color: C.white }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: C.lightGreen, textTransform: "uppercase", marginBottom: 4 }}>
              Next Project · Professional Services
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15 }}>
              Onboarding — Kund XX AB
            </h1>
          </div>
          <div style={{ display: "flex", gap: 4, background: "#ffffff18", borderRadius: 8, padding: 4 }}>
            {[["consultant","🎯 Konsultvy"],["customer","👤 Kundvy"]].map(([v, l]) => (
              <button key={v} className="btn" onClick={() => setView(v)} style={{
                padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                fontFamily: "inherit", fontWeight: 600, fontSize: 12,
                background: view === v ? C.accentGreen : "transparent",
                color: view === v ? C.deepGreen : C.accentGreen,
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Package tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
          {PACKAGES.map(p => (
            <button key={p} className="btn" onClick={() => setPkg(p)} style={{
              padding: "8px 18px", borderRadius: "8px 8px 0 0", border: "none",
              fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer",
              background: pkg === p ? C.paleBg : "#ffffff1c",
              color: pkg === p ? C.deepGreen : C.accentGreen,
              borderBottom: pkg === p ? `3px solid ${C.accentGreen}` : "3px solid transparent",
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* ══ MAIN FRAME ══ */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 120px)" }}>

        {/* ── Left: Phase navigation (main axis) ─ */}
        <div style={{ width: 220, background: C.white, borderRight: `1px solid ${C.green500}33`, padding: "16px 12px", flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.midGreen, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, padding: "0 4px" }}>
            Process
          </div>
          {PHASES.map(ph => {
            const pp = phaseProgress(ph.id);
            const isActive = activePhase === ph.id;
            const done = pp === 100;
            return (
              <div key={ph.id} className="pill" onClick={() => { setActivePhase(ph.id); setSubView("process"); }} style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 3,
                background: isActive ? C.deepGreen : "transparent",
                border: `1.5px solid ${isActive ? C.deepGreen : done ? C.lightGreen : C.green500 + "33"}`,
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{ph.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? C.white : C.deepGreen, lineHeight: 1.2 }}>
                    {ph.id}. {ph.label}
                  </span>
                  {done && <span style={{ marginLeft: "auto", fontSize: 11, color: isActive ? C.accentGreen : C.midGreen }}>✓</span>}
                </div>
                <div style={{ height: 3, background: isActive ? "#ffffff26" : C.accentGreen, borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pp}%`, background: isActive ? C.accentGreen : C.deepGreen, transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })}

          {/* Summary at bottom */}
          <div style={{ marginTop: 18, padding: 12, background: C.paleBg, borderRadius: 8, border: `1px solid ${C.green500}33` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.midGreen, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Översikt
            </div>
            <div style={{ fontSize: 11, color: C.primaryGreen, lineHeight: 1.6 }}>
              <div>Paket: <strong style={{ color: C.deepGreen }}>{pkg}</strong></div>
              <div>Process: <strong style={{ color: C.deepGreen }}>{totalPhaseProgress()}%</strong></div>
              <div>Grundinfo: <strong style={{ color: C.deepGreen }}>{grundinfoProgress()}%</strong></div>
              {avvikelseCount > 0 && (
                <div style={{ marginTop: 6, padding: "4px 8px", background: C.lightGreen, color: C.deepGreen, borderRadius: 4, fontWeight: 700 }}>
                  ⚠️ {avvikelseCount} avvikelser → ÄTA?
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main content area ─ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Phase header + sub-tabs */}
          <div style={{ background: C.white, padding: "20px 32px 0", borderBottom: `1px solid ${C.green500}22` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>{currentPhase.icon}</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: C.deepGreen }}>
                {currentPhase.id}. {currentPhase.label}
              </h2>
              <span style={{ fontSize: 11, color: C.midGreen, fontWeight: 600 }}>
                Ansvar: {currentPhase.owner}
              </span>
            </div>
            <p style={{ fontSize: 13, color: C.primaryGreen, marginBottom: 14, maxWidth: 720, lineHeight: 1.5 }}>
              {currentPhase.purpose}
            </p>

            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: 4 }}>
              <SubTab active={subView === "process"} onClick={() => setSubView("process")}>
                Processteg
              </SubTab>
              {currentPhase.hasGrundinfo && (
                <SubTab active={subView === "grundinfo"} onClick={() => setSubView("grundinfo")} badge={`${grundinfoProgress()}%`}>
                  Grundinformation
                </SubTab>
              )}
              {currentPhase.hasKartlaggning && (
                <SubTab active={subView === "kartlaggning"} onClick={() => setSubView("kartlaggning")} badge={avvikelseCount > 0 ? `${avvikelseCount} ⚠️` : undefined}>
                  Kartläggning
                </SubTab>
              )}
            </div>
          </div>

          {/* Sub-view content */}
          <div style={{ flex: 1, padding: "20px 32px", overflowY: "auto" }}>

            {/* ═ Process steps ═ */}
            {subView === "process" && (
              <div className="fade-in">
                {view === "consultant" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {currentPhase.steps.map((s, si) => {
                      const stepDone = s.items.every((_, idx) => checked[`${activePhase}-${s.id}-${idx}`]);
                      return (
                        <div key={s.id} style={{
                          background: C.white, border: `1.5px solid ${stepDone ? C.lightGreen : C.green500 + "44"}`,
                          borderRadius: 10, padding: "14px 18px",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: "50%", background: stepDone ? C.deepGreen : C.accentGreen,
                              color: stepDone ? C.white : C.deepGreen,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, fontWeight: 800, flexShrink: 0,
                            }}>
                              {stepDone ? "✓" : si + 1}
                            </div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.deepGreen, flex: 1 }}>
                              {s.label}
                            </h3>
                            <span style={{
                              background: ownerColor[s.owner].bg, color: ownerColor[s.owner].text,
                              padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700,
                            }}>{ownerLabel[s.owner]}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingLeft: 34 }}>
                            {s.items.map((it, idx) => {
                              const key = `${activePhase}-${s.id}-${idx}`;
                              const done = checked[key];
                              return (
                                <div key={idx} className="hover-row" onClick={() => toggleItem(s.id, idx)} style={{
                                  display: "flex", alignItems: "center", gap: 10, padding: "4px 8px", borderRadius: 6,
                                  cursor: "pointer", transition: "all 0.1s",
                                }}>
                                  <div style={{
                                    width: 16, height: 16, borderRadius: 4,
                                    border: `1.5px solid ${done ? C.deepGreen : C.green500}`,
                                    background: done ? C.deepGreen : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                  }}>
                                    {done && <span style={{ color: C.white, fontSize: 10, fontWeight: 800 }}>✓</span>}
                                  </div>
                                  <span style={{ fontSize: 12, color: C.primaryGreen, textDecoration: done ? "line-through" : "none", opacity: done ? 0.65 : 1 }}>
                                    {it}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Exit criteria */}
                    <div style={{
                      background: C.deepGreen, color: C.white, borderRadius: 10, padding: "14px 18px", marginTop: 6,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 14 }}>🏁</span>
                        <h3 style={{ fontSize: 13, fontWeight: 800, color: C.accentGreen, letterSpacing: 0.5 }}>
                          ÖVERGÅNGSKRITERIER
                        </h3>
                      </div>
                      <div style={{ fontSize: 12, color: C.lightGreen, marginBottom: 8 }}>
                        Samtliga ska vara uppfyllda innan fasen avslutas:
                      </div>
                      {currentPhase.exit.map((e, i) => (
                        <div key={i} style={{ fontSize: 12, color: C.white, padding: "3px 0", display: "flex", gap: 8 }}>
                          <span style={{ color: C.lightGreen }}>›</span>{e}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Customer view of process */
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ background: C.white, border: `1.5px solid ${C.green500}33`, borderRadius: 10, padding: "16px 20px" }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.deepGreen, marginBottom: 6 }}>
                        Var befinner vi oss just nu?
                      </h3>
                      <p style={{ fontSize: 12, color: C.primaryGreen, lineHeight: 1.5 }}>
                        {currentPhase.purpose}
                      </p>
                      <div style={{ marginTop: 12, height: 8, background: C.accentGreen, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${phaseProgress(activePhase)}%`, background: C.deepGreen, transition: "width 0.4s" }} />
                      </div>
                      <div style={{ fontSize: 11, color: C.midGreen, marginTop: 4 }}>
                        {phaseProgress(activePhase)}% klart i denna fas
                      </div>
                    </div>

                    {/* Customer actions */}
                    {currentPhase.steps.filter(s => s.owner === "kund" || s.owner === "both").length > 0 && (
                      <div style={{ background: C.white, border: `1.5px solid ${C.green500}33`, borderRadius: 10, padding: "16px 20px" }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.deepGreen, marginBottom: 10 }}>
                          Era steg i denna fas 👋
                        </h3>
                        {currentPhase.steps.filter(s => s.owner === "kund" || s.owner === "both").map(s => (
                          <div key={s.id} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.primaryGreen, marginBottom: 4 }}>
                              {s.label}
                            </div>
                            {s.items.map((it, idx) => (
                              <div key={idx} style={{ fontSize: 12, color: C.midGreen, paddingLeft: 12, lineHeight: 1.6 }}>
                                › {it}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ═ Grundinformation ═ */}
            {subView === "grundinfo" && (
              <div className="fade-in">
                <div style={{ background: C.paleBg, border: `1px solid ${C.green500}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>📋</span>
                  <div style={{ fontSize: 12, color: C.primaryGreen, flex: 1 }}>
                    <strong style={{ color: C.deepGreen }}>Grundinformation från kund</strong> — 19 datamängder grupperade i 5 block.
                    Status uppdateras per datamängd: <em>Väntar → Påbörjad → Mottagen → Validerad</em>.
                  </div>
                  <a href="https://helpdesk.next-tech.com" target="_blank" rel="noreferrer" style={{
                    fontSize: 11, fontWeight: 600, color: C.deepGreen,
                    background: C.accentGreen, padding: "4px 10px", borderRadius: 6,
                    textDecoration: "none",
                  }}>📖 Helpdesk</a>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {GRUNDINFO_BLOCKS.map(b => {
                    const bp = blockProgress(b);
                    return (
                      <div key={b.id} style={{
                        background: C.white, border: `1.5px solid ${bp === 100 ? C.lightGreen : C.green500 + "33"}`,
                        borderRadius: 10, padding: "14px 18px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 18 }}>{b.icon}</span>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.deepGreen }}>{b.label}</h3>
                            <p style={{ fontSize: 11, color: C.midGreen, marginTop: 2 }}>{b.desc}</p>
                          </div>
                          <span style={{
                            background: bp === 100 ? C.deepGreen : C.accentGreen,
                            color: bp === 100 ? C.white : C.deepGreen,
                            padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                          }}>
                            {bp}%
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: C.midGreen, marginBottom: 8, fontStyle: "italic" }}>
                          Från mallflikar: {b.sources.join(", ")}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {b.fields.map((f, i) => {
                            const s = grundinfoStatus[`${b.id}-${i}`] || "pending";
                            const cfg = {
                              pending:     { bg: C.paleBg,      text: C.midGreen,    label: "Väntar" },
                              in_progress: { bg: C.accentGreen, text: C.deepGreen,   label: "Påbörjad" },
                              received:    { bg: C.lightGreen,  text: C.deepGreen,   label: "Mottagen" },
                              validated:   { bg: C.deepGreen,   text: C.accentGreen, label: "✓ Validerad" },
                            }[s];
                            return (
                              <div key={i} className="hover-row" onClick={() => toggleGrundinfo(b.id, i)} style={{
                                display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 6,
                                cursor: "pointer", transition: "all 0.1s",
                              }}>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontSize: 12, fontWeight: f.req ? 700 : 500, color: C.deepGreen }}>
                                    {f.name}
                                  </span>
                                  {f.req && <span style={{ color: "#c33", marginLeft: 4 }}>*</span>}
                                  {f.note && (
                                    <div style={{ fontSize: 10, color: C.midGreen, fontStyle: "italic", marginTop: 1 }}>
                                      {f.note}
                                    </div>
                                  )}
                                </div>
                                <span style={{
                                  background: cfg.bg, color: cfg.text,
                                  padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700,
                                  minWidth: 82, textAlign: "center",
                                }}>{cfg.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═ Kartläggning ═ */}
            {subView === "kartlaggning" && (
              <div className="fade-in">
                <div style={{ background: C.paleBg, border: `1px solid ${C.green500}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🗺️</span>
                  <div style={{ fontSize: 12, color: C.primaryGreen, flex: 1 }}>
                    <strong style={{ color: C.deepGreen }}>Strukturerad dialog med kund</strong> — klicka per fråga för att markera
                    <span style={{ background: C.lightGreen, color: C.deepGreen, padding: "1px 6px", borderRadius: 4, marginLeft: 4, fontWeight: 700 }}>Standard</span>
                    {" eller "}
                    <span style={{ background: "#ffd4a3", color: "#6b3a00", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>Avvikelse</span>.
                    Avvikelser blir automatiskt ÄTA-kandidater.
                  </div>
                </div>

                {avvikelseCount > 0 && (
                  <div style={{
                    background: "#fff6e6", border: `1.5px solid #e8a44a`, borderRadius: 10, padding: "12px 16px", marginBottom: 14,
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <div style={{ fontSize: 12, color: "#6b3a00", flex: 1 }}>
                      <strong>{avvikelseCount} avvikelser</strong> från standard har markerats. Dessa bör hanteras som ÄTA-kandidater innan Konfiguration påbörjas.
                    </div>
                    <button className="btn" style={{
                      fontSize: 11, fontWeight: 700, color: C.white, background: "#c87a1a",
                      border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                    }}>Skapa ÄTA-förslag</button>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {KARTLAGGNING_AREAS.map(area => {
                    const ap = kartAreaProgress(area);
                    return (
                      <div key={area.id} style={{
                        background: C.white, border: `1.5px solid ${ap === 100 ? C.lightGreen : C.green500 + "33"}`,
                        borderRadius: 10, padding: "12px 16px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 16 }}>{area.icon}</span>
                          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.deepGreen, flex: 1 }}>{area.label}</h3>
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: ap === 100 ? C.midGreen : C.primaryGreen,
                          }}>{ap === 100 ? "✓ Klart" : `${ap}%`}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {area.questions.map((q, i) => {
                            const s = kartlaggningStatus[`${area.id}-${i}`] || "pending";
                            const cfg = {
                              pending:   { bg: "transparent",      text: C.midGreen,     label: "—" },
                              standard:  { bg: C.lightGreen,       text: C.deepGreen,    label: "✓ Standard" },
                              avvikelse: { bg: "#ffd4a3",          text: "#6b3a00",      label: "⚠ Avvikelse" },
                            }[s];
                            return (
                              <div key={i} className="hover-row" onClick={() => toggleKartQuestion(area.id, i)} style={{
                                display: "flex", alignItems: "center", gap: 10, padding: "4px 8px", borderRadius: 6,
                                cursor: "pointer", transition: "all 0.1s",
                              }}>
                                <span style={{ fontSize: 12, color: C.primaryGreen, flex: 1 }}>{q}</span>
                                <span style={{
                                  background: cfg.bg, color: cfg.text,
                                  padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700,
                                  minWidth: 80, textAlign: "center",
                                  border: s === "pending" ? `1px dashed ${C.green500}66` : "none",
                                }}>{cfg.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-tab component ───────────────────────────────────────────────────────
function SubTab({ active, onClick, children, badge }) {
  return (
    <button onClick={onClick} className="btn" style={{
      padding: "8px 16px", border: "none", cursor: "pointer",
      background: active ? C.paleBg : "transparent",
      color: active ? C.deepGreen : C.midGreen,
      fontFamily: "inherit", fontWeight: 700, fontSize: 12,
      borderBottom: active ? `3px solid ${C.deepGreen}` : "3px solid transparent",
      borderRadius: "8px 8px 0 0",
      display: "inline-flex", alignItems: "center", gap: 6,
    }}>
      {children}
      {badge && (
        <span style={{
          background: active ? C.deepGreen : C.midGreen,
          color: C.white, padding: "1px 7px", borderRadius: 10,
          fontSize: 10, fontWeight: 700,
        }}>{badge}</span>
      )}
    </button>
  );
}
