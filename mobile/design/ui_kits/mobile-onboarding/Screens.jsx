const IMG = {
  hero: "https://images.pexels.com/photos/10545425/pexels-photo-10545425.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=700",
  maya: "https://images.pexels.com/photos/9944394/pexels-photo-9944394.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
};
const { Button, IconButton, Chip, SegmentedControl, Input, Badge, ProgressBar } = window.PaceDesignSystem_1f19d6;
const mono = { fontFamily: "var(--font-mono)" };
const screenBase = { position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "var(--color-ink)" };

function TopBar({ step, onBack }) {
  return <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
    <IconButton ariaLabel="back" onClick={onBack} size={40}>‹</IconButton>
    <ProgressBar value={step} max={8} width={110} />
    <span style={{ ...mono, fontSize: 11, letterSpacing: "0.2em", color: "var(--color-fog)" }}>0{step} / 08</span>
  </div>;
}
function Dock({ children }) {
  return <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 20px 28px", borderTop: "1px solid var(--color-line)", background: "rgba(10,10,13,0.9)", backdropFilter: "blur(20px)" }}>{children}</div>;
}
const H = ({ children }) => <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, color: "var(--color-bone)", textTransform: "uppercase", lineHeight: 0.95, margin: "16px 20px 6px" }}>{children}</h1>;
const Sub = ({ children }) => <p style={{ color: "var(--color-fog)", fontSize: 13, lineHeight: 1.4, margin: "0 20px 20px" }}>{children}</p>;

function Welcome({ onNext }) {
  return <div style={screenBase}>
    <div style={{ position: "relative", height: "58%", overflow: "hidden" }}>
      <img src={IMG.hero} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.35)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, var(--color-ink))" }} />
      <div style={{ position: "absolute", top: 56, left: 20 }}><Badge tone="accent" dot>FOUNDING COHORT · BATCH 01</Badge></div>
    </div>
    <div style={{ flex: 1, padding: "0 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 44, lineHeight: 0.88, textTransform: "uppercase", margin: 0 }}>
        <span style={{ color: "var(--color-bone)" }}>MATCH.</span><br /><span className="text-outline">TRAIN.</span><br /><span style={{ color: "var(--color-ember)" }}>DATE.</span>
      </h1>
      <p style={{ color: "var(--color-fog)", fontSize: 13, marginTop: 16, lineHeight: 1.5 }}>Dating apps waste your time with people who don't live like you. PACE matches you with people who keep up.</p>
    </div>
    <Dock><Button onClick={onNext} style={{ width: "100%" }}>Get Early Access</Button>
      <p style={{ ...mono, textAlign: "center", fontSize: 10, color: "var(--color-fog)", letterSpacing: "0.15em", marginTop: 14 }}>I ALREADY HAVE AN ACCOUNT · LOG IN</p>
    </Dock>
  </div>;
}

function Basics({ onNext, onBack }) {
  const [gender, setGender] = React.useState("WOMAN");
  return <div style={screenBase}>
    <TopBar step={2} onBack={onBack} /><H>THE BASICS.</H>
    <div style={{ padding: "8px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
      <Input placeholder="YOUR FIRST NAME" />
      <Input placeholder="DD / MM / YYYY" />
      <div><label style={{ ...mono, fontSize: 10, letterSpacing: "0.2em", color: "var(--color-bone)" }}>I AM</label>
        <div style={{ marginTop: 8 }}><SegmentedControl options={["MAN", "WOMAN", "NON-BINARY"]} value={gender} onChange={setGender} /></div></div>
    </div>
    <Dock><Button onClick={onNext} style={{ width: "100%" }}>Continue</Button></Dock>
  </div>;
}

function Disciplines({ onNext, onBack }) {
  const opts = ["RUNNING", "CYCLING", "LIFTING", "CLIMBING", "BOXING", "SWIMMING", "YOGA", "HIKING", "CROSSFIT"];
  const [sel, setSel] = React.useState(["RUNNING"]);
  const toggle = (o) => setSel((p) => p.includes(o) ? p.filter((x) => x !== o) : [...p, o]);
  return <div style={screenBase}>
    <TopBar step={3} onBack={onBack} /><H>HOW DO YOU MOVE?</H>
    <Sub>Select 1 to 4 sports you actively train.</Sub>
    <div style={{ padding: "0 20px", display: "flex", flexWrap: "wrap", gap: 8 }}>{opts.map((o) => <Chip key={o} selected={sel.includes(o)} onClick={() => toggle(o)}>{o}</Chip>)}</div>
    <Dock><Badge>SELECTED: {sel.length} / 4</Badge><div style={{ marginTop: 12 }}><Button onClick={onNext} style={{ width: "100%" }}>Continue</Button></div></Dock>
  </div>;
}

function Cadence({ onNext, onBack }) {
  const [freq, setFreq] = React.useState("3–4× / WK");
  return <div style={screenBase}>
    <TopBar step={4} onBack={onBack} /><H>YOUR CADENCE.</H>
    <div style={{ padding: "0 20px" }}>
      <label style={{ ...mono, fontSize: 10, letterSpacing: "0.2em", color: "var(--color-bone)" }}>HOW OFTEN DO YOU TRAIN?</label>
      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>{["1–2× / WK", "3–4× / WK", "5–6× / WK", "DAILY+"].map((f) => <Chip key={f} selected={freq === f} onClick={() => setFreq(f)}>{f}</Chip>)}</div>
      <div style={{ marginTop: 24, padding: 16, borderRadius: 16, background: "var(--color-coal)", border: "1px solid var(--color-line)", fontSize: 12, color: "var(--color-fog)" }}>We pair you with athletes whose workout windows match yours.</div>
    </div>
    <Dock><Button onClick={onNext} style={{ width: "100%" }}>Continue</Button></Dock>
  </div>;
}

function PaceCal({ onNext, onBack }) {
  const [pace, setPace] = React.useState("5:15 /km");
  return <div style={screenBase}>
    <TopBar step={5} onBack={onBack} /><H>PACE CALIBRATION.</H>
    <Sub>Typical easy / base pace?</Sub>
    <div style={{ padding: "0 20px", display: "flex", flexWrap: "wrap", gap: 8 }}>{["4:15 /km", "4:45 /km", "5:15 /km", "5:45 /km", "6:15 /km"].map((p) => <Chip key={p} selected={pace === p} onClick={() => setPace(p)}>{p}</Chip>)}</div>
    <Dock><Button onClick={onNext} style={{ width: "100%" }}>Continue</Button></Dock>
  </div>;
}

function Photos({ onNext, onBack }) {
  return <div style={screenBase}>
    <TopBar step={6} onBack={onBack} /><H>SHOW HOW YOU TRAIN.</H>
    <Sub>Upload at least 3 photos.</Sub>
    <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{ aspectRatio: "1", borderRadius: 16, background: i === 0 ? `url(${IMG.maya}) center/cover` : "var(--color-ash)", border: i > 2 ? "1px dashed var(--color-line)" : "1px solid var(--color-line)", display: "grid", placeItems: "center", color: "var(--color-fog)", fontSize: 20 }}>{i > 2 ? "+" : ""}</div>)}
    </div>
    <Dock><Button onClick={onNext} style={{ width: "100%" }}>Continue</Button></Dock>
  </div>;
}

function Verify({ onNext, onBack }) {
  const rows = [["STRAVA", "Auto-sync runs, rides & weekly mileage."], ["GARMIN CONNECT", "Sync VO2 max, training load & workouts."], ["APPLE HEALTH", "Read weekly active calories & workout sessions."]];
  return <div style={screenBase}>
    <TopBar step={7} onBack={onBack} /><H>SYNC YOUR TRAINING.</H>
    <Sub>Connect your tracker to earn the Verified Athlete badge.</Sub>
    <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map(([t, c]) => <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 16, border: "1px solid var(--color-line)", background: "var(--color-ash)" }}>
        <div><div style={{ ...mono, fontSize: 12, color: "var(--color-bone)", letterSpacing: "0.1em" }}>{t}</div><div style={{ fontSize: 11, color: "var(--color-fog)", marginTop: 4 }}>{c}</div></div>
        <Badge>CONNECT</Badge>
      </div>)}
    </div>
    <Dock><Button onClick={onNext} style={{ width: "100%" }}>I'll Verify Manually Later</Button></Dock>
  </div>;
}

function LaunchHub({ onRestart, onBack }) {
  return <div style={screenBase}>
    <TopBar step={8} onBack={onBack} /><H>YOUR LAUNCH HUB.</H>
    <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      {["CAPE TOWN", "JOHANNESBURG"].map((c) => <div key={c} style={{ padding: 14, borderRadius: 16, border: "1px solid var(--color-line)", background: "var(--color-ash)" }}>
        <Badge tone="accent" dot>ACTIVE COHORT · BATCH 01</Badge>
        <div style={{ ...mono, fontSize: 13, color: "var(--color-bone)", marginTop: 8 }}>{c}</div>
      </div>)}
      <div style={{ padding: 20, borderRadius: 24, background: "rgba(255,77,46,0.08)", border: "1px solid rgba(255,77,46,0.3)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--color-bone)", textTransform: "uppercase" }}>Founding Athlete Access Unlocked</div>
        <p style={{ fontSize: 12, color: "var(--color-fog)", marginTop: 6 }}>Free access to all premium filtering during launch.</p>
      </div>
    </div>
    <Dock><Button onClick={onRestart} style={{ width: "100%" }}>Enter Pace</Button></Dock>
  </div>;
}

window.PaceMobileScreens = { Welcome, Basics, Disciplines, Cadence, PaceCal, Photos, Verify, LaunchHub };
