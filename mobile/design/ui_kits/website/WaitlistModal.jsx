const { Modal, Input, Button, Chip, Badge } = window.PaceDesignSystem_1f19d6;
const CITIES = ["CAPE TOWN", "JOHANNESBURG", "DURBAN", "PRETORIA", "OTHER (SA)"];
const SPORTS = ["Running", "Trail Running", "Cycling", "Lifting", "CrossFit", "Climbing", "Boxing", "Yoga"];

function WaitlistModal({ onClose }) {
  const [step, setStep] = React.useState("email");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("CAPE TOWN");
  const [sports, setSports] = React.useState([]);
  const toggle = (s) => setSports((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  return <Modal onClose={onClose} width={520}>
    {step === "email" && <div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em", color: "var(--color-ember)" }}>STEP 1 OF 2</span>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--color-bone)", textTransform: "uppercase", margin: "6px 0 12px" }}>Get Early Access</h3>
      <p style={{ color: "var(--color-fog)", fontSize: 13, marginBottom: 20 }}>Join the founding cohort across South Africa.</p>
      <Input placeholder="YOUR@EMAIL.COM" value={email} onChange={setEmail} />
      <div style={{ marginTop: 16 }}><Button onClick={() => email.includes("@") && setStep("details")}>Continue</Button></div>
    </div>}
    {step === "details" && <div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em", color: "var(--color-ember)" }}>STEP 2 OF 2</span>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--color-bone)", textTransform: "uppercase", margin: "6px 0 20px" }}>Complete Your Founding Profile</h3>
      <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--color-bone)" }}>1. WHICH CITY?</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0 20px" }}>{CITIES.map((c) => <Chip key={c} selected={city === c} onClick={() => setCity(c)}>{c}</Chip>)}</div>
      <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--color-bone)" }}>2. PRIMARY DISCIPLINES</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0 24px" }}>{SPORTS.map((s) => <Chip key={s} selected={sports.includes(s)} onClick={() => toggle(s)}>{s}</Chip>)}</div>
      <Button onClick={() => setStep("done")}>Join Founding Cohort</Button>
    </div>}
    {step === "done" && <div style={{ display: "flex", gap: 16 }}>
      <span style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-ember)", display: "grid", placeItems: "center", flexShrink: 0, color: "var(--color-ink)", fontSize: 22 }}>✓</span>
      <div>
        <Badge tone="accent" dot>BATCH 01 · CONFIRMED</Badge>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--color-bone)", textTransform: "uppercase", margin: "10px 0" }}>You're on the founding list.</p>
        <p style={{ color: "var(--color-fog)", fontSize: 13 }}>LAUNCH HUB: <span style={{ color: "var(--color-bone)" }}>{city}</span>{sports.length ? ` · ${sports.slice(0, 2).join(" & ").toUpperCase()}` : ""}</p>
      </div>
    </div>}
  </Modal>;
}
window.PaceScreens = { ...window.PaceScreens, WaitlistModal };
