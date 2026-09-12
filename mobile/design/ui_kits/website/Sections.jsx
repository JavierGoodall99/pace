const IMG = {
  cyclist: "https://images.pexels.com/photos/10545425/pexels-photo-10545425.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=1080",
  couple: "https://images.pexels.com/photos/5038818/pexels-photo-5038818.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=980",
  rope: "https://images.pexels.com/photos/9943223/pexels-photo-9943223.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=520",
  maya: "https://images.pexels.com/photos/9944394/pexels-photo-9944394.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=680",
  noah: "https://images.pexels.com/photos/10545425/pexels-photo-10545425.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=560&w=800",
  lea: "https://images.pexels.com/photos/13588101/pexels-photo-13588101.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=560",
  bg: "https://images.pexels.com/photos/35833299/pexels-photo-35833299.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1200",
  sweat: "https://images.pexels.com/photos/7675401/pexels-photo-7675401.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  man: "https://images.pexels.com/photos/38453225/pexels-photo-38453225.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
};
const { Button, Badge, Card, Avatar } = window.PaceDesignSystem_1f19d6;
const wrap = { maxWidth: 1440, margin: "0 auto", padding: "0 40px" };
const eyebrow = { display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.35em", color: "var(--color-fog)", textTransform: "uppercase" };
const dot = { width: 6, height: 6, borderRadius: "50%", background: "var(--color-ember)" };
const h2 = { fontFamily: "var(--font-display)", textTransform: "uppercase", lineHeight: 0.9, color: "var(--color-bone)", fontSize: "clamp(2.2rem,4.4vw,3.8rem)", margin: "24px 0 0" };

function Nav({ onOpen }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", f); return () => window.removeEventListener("scroll", f);
  }, []);
  return <header style={{ position: "fixed", inset: "0 0 auto 0", zIndex: 50, transition: "all 500ms var(--ease-decel)", background: scrolled ? "rgba(10,10,13,0.8)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid var(--color-line)" : "1px solid transparent" }}>
    <nav style={{ ...wrap, height: 76, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 36, height: 36, borderRadius: 8, background: "var(--color-ember)", display: "grid", placeItems: "center" }}><img src="../../assets/icons/activity.svg" style={{ width: 18, height: 18, filter: "brightness(0)" }} /></span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--color-bone)" }}>PACE</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--color-ember)", fontWeight: 700 }}>SOUTH AFRICA</span>
      </div>
      <Button size="sm" onClick={onOpen}>Get Early Access</Button>
    </nav>
  </header>;
}

function Hero({ onOpen }) {
  return <section style={{ position: "relative", paddingTop: 160, paddingBottom: 90, overflow: "hidden" }}>
    <div style={{ position: "absolute", top: -190, right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "rgba(255,77,46,0.12)", filter: "blur(150px)", pointerEvents: "none" }} />
    <div style={{ ...wrap, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40, alignItems: "center", position: "relative" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", lineHeight: 0.85, color: "var(--color-bone)", fontSize: "clamp(3.2rem,7vw,6.5rem)", margin: 0 }}>
          MATCH.<br /><span className="text-outline">TRAIN.</span><br /><span style={{ color: "var(--color-ember)" }}>DATE.</span>
        </h1>
        <p style={{ marginTop: 28, maxWidth: 480, color: "var(--color-fog)", fontSize: 17, lineHeight: 1.6 }}>Dating apps waste your time with people who don't live like you. <span style={{ color: "var(--color-bone)" }}>PACE matches you with active singles across South Africa who actually keep up.</span></p>
        <div style={{ marginTop: 36 }}><Button onClick={onOpen}>Get Early Access</Button></div>
      </div>
      <SwipeStack />
    </div>
  </section>;
}

function SwipeStack() {
  const profiles = [{ name: "MAYA, 27", loc: "SEA POINT", tag: "TRAIL RUN · 5×/WK", img: IMG.maya, match: "97%" }, { name: "NOAH, 31", loc: "CRADLE CYCLING", tag: "CYCLING · RACING", img: IMG.noah, match: "94%" }, { name: "LEA, 24", loc: "CLIFTON STEPS", tag: "LIFTING · 6×/WK", img: IMG.lea, match: "99%" }];
  const [i, setI] = React.useState(0);
  const card = profiles[i % profiles.length];
  return <div style={{ position: "relative", height: 460, width: 300, margin: "0 auto" }}>
    {profiles.map((p, idx) => {
      const depth = (idx - i + profiles.length) % profiles.length;
      if (depth > 2) return null;
      return <div key={p.name} style={{ position: "absolute", inset: 0, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", transform: `translateY(${-depth * 14}px) scale(${1 - depth * 0.05})`, zIndex: 10 - depth, boxShadow: depth === 0 ? "0 30px 60px -15px rgba(0,0,0,0.7)" : "none", transition: "all 400ms var(--ease-decel)" }}>
        <img src={p.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,13,0.9), transparent 60%)" }} />
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--color-bone)" }}>{p.name}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--color-fog)", marginTop: 6 }}>{p.loc}</div>
          <div style={{ marginTop: 10 }}><Badge tone="accent">{p.tag}</Badge></div>
        </div>
      </div>;
    })}
    <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 20 }}>
      <button onClick={() => setI(i + 1)} style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(10,10,13,0.8)", border: "1px solid rgba(244,241,234,0.2)", color: "var(--color-bone)", cursor: "pointer" }}>✕</button>
      <button onClick={() => setI(i + 1)} style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(10,10,13,0.8)", border: "1px solid rgba(255,77,46,0.4)", color: "var(--color-ember)", cursor: "pointer" }}>♥</button>
    </div>
  </div>;
}

function Stats() {
  const items = [["9", "", "PROVINCES · SOUTH AFRICA"], ["12", "+", "CORE DISCIPLINES"], ["100", "%", "TRAINING-VERIFIED PROFILES"], ["1", "", "FOUNDING COHORT · BATCH 01"]];
  return <section style={{ borderTop: "1px solid var(--color-line)", borderBottom: "1px solid var(--color-line)", background: "var(--color-ink)" }}>
    <div style={{ ...wrap, padding: "0 40px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--color-line)" }}>
      {items.map(([v, s, l]) => <div key={l} style={{ background: "var(--color-ink)", padding: "48px 24px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 48, color: "var(--color-bone)", margin: 0 }}>{v}<span style={{ color: "var(--color-ember)" }}>{s}</span></p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em", color: "var(--color-fog)", marginTop: 10 }}>{l}</p>
      </div>)}
    </div>
  </section>;
}

function Manifesto() {
  return <section style={{ padding: "112px 0" }}>
    <div style={wrap}>
      <div style={eyebrow}><span style={dot} />01 — MANIFESTO</div>
      <p style={{ marginTop: 32, maxWidth: 900, fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2.4rem)", lineHeight: 1.2, letterSpacing: "-0.02em", color: "var(--color-bone)" }}>
        The best relationships are built in <span style={{ color: "var(--color-ember)" }}>motion.</span> Shared effort, shared endorphins, shared <span style={{ color: "var(--color-ember)" }}>finish lines.</span> PACE is dating for people who would rather log <span style={{ color: "var(--color-ember)" }}>miles</span> than sit still.
      </p>
    </div>
  </section>;
}

function Features() {
  return <section style={{ padding: "0 0 112px" }}>
    <div style={wrap}>
      <div style={eyebrow}><span style={dot} />02 — WHY PACE</div>
      <h2 style={h2}>DATING APPS MADE YOU SWIPE.<br /><span className="text-outline">WE MAKE YOU MOVE.</span></h2>
      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <Card media style={{ gridColumn: "span 2", minHeight: 340 }}>
          <img src={IMG.couple} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.45)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--color-ink), transparent 55%)" }} />
          <div style={{ position: "absolute", left: 32, right: 32, bottom: 32 }}>
            <Badge tone="neutral">DAYLIGHT &amp; PUBLIC DATES</Badge>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "var(--color-bone)", margin: "16px 0 8px", textTransform: "uppercase" }}>Meet on the promenade, not at a bar</h3>
            <p style={{ color: "rgba(244,241,234,0.8)", fontSize: 14, maxWidth: 460, margin: 0 }}>First dates are 5Ks on the Sea Point Promenade or sunrise trail runs up Kloof Corner — safe, public, high-energy.</p>
          </div>
        </Card>
        <Card media style={{ minHeight: 340 }}>
          <img src={IMG.rope} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.45)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--color-ink), transparent 55%)" }} />
          <div style={{ position: "absolute", left: 28, right: 28, bottom: 28 }}>
            <Badge tone="neutral">SAFETY &amp; VERIFICATION</Badge>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--color-bone)", margin: "16px 0 8px", textTransform: "uppercase" }}>No bots. No catfish.</h3>
            <p style={{ color: "rgba(244,241,234,0.8)", fontSize: 13, margin: 0 }}>Every profile is photo-verified and manually reviewed before entry.</p>
          </div>
        </Card>
        <Card style={{ padding: 32, minHeight: 260, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--color-bone)", marginTop: "auto", textTransform: "uppercase" }}>Born from the run club</h3>
          <p style={{ color: "var(--color-fog)", fontSize: 14 }}>Built for athletes who train together in safe, public group environments.</p>
        </Card>
        <Card style={{ gridColumn: "span 2", padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div><Badge tone="accent">PACE MATCH™</Badge><h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--color-bone)", margin: "16px 0 0", textTransform: "uppercase" }}>Effort, algorithmically aligned</h3></div>
            <div style={{ display: "flex" }}><Avatar src={IMG.sweat} size={56} /><Avatar src={IMG.man} size={56} overlap /></div>
          </div>
          <div style={{ marginTop: 24, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.1)" }}><div style={{ width: "94%", height: "100%", borderRadius: 999, background: "var(--color-ember)" }} /></div>
          <p style={{ color: "var(--color-fog)", fontSize: 13, marginTop: 16 }}>We compare training load, pace and schedule — so chemistry starts with compatibility.</p>
        </Card>
      </div>
    </div>
  </section>;
}

function HowItWorks() {
  const steps = [["01", "CLAIM EARLY ACCESS", "Drop your email and select your city."], ["02", "GET MANUALLY VERIFIED", "Every profile goes through human photo and activity review."], ["03", "TRAIN IN DAYLIGHT", "Match on pace and weekly schedule. Meet on the promenade or the trail."]];
  return <section style={{ padding: "0 0 112px" }}>
    <div style={wrap}>
      <div style={eyebrow}><span style={dot} />03 — HOW IT WORKS</div>
      <h2 style={h2}>THREE STEPS TO THE <span style={{ color: "var(--color-ember)" }}>START LINE.</span></h2>
      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {steps.map(([n, t, c]) => <Card key={n} style={{ padding: 32, minHeight: 220 }}>
          <span className="text-outline" style={{ fontFamily: "var(--font-display)", fontSize: 56 }}>{n}</span>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--color-bone)", margin: "28px 0 8px", textTransform: "uppercase" }}>{t}</h3>
          <p style={{ color: "var(--color-fog)", fontSize: 14 }}>{c}</p>
        </Card>)}
      </div>
    </div>
  </section>;
}

function FinalCTA({ onOpen }) {
  const words = ["HIKING?", "RUNNING?", "CYCLING?", "TRAINING?"];
  const [i, setI] = React.useState(0);
  React.useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % words.length), 2200); return () => clearInterval(t); }, []);
  return <section style={{ position: "relative", padding: "150px 0", textAlign: "center", overflow: "hidden" }}>
    <img src={IMG.bg} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.14, filter: "grayscale(1)" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, var(--color-ink), rgba(10,10,13,0.9), var(--color-ink))" }} />
    <div style={{ position: "relative", ...wrap }}>
      <h2 style={{ ...h2, fontSize: "clamp(2.4rem,5.5vw,4.5rem)" }}>READY FOR YOUR FIRST<br />DATE <span style={{ color: "var(--color-ember)" }}>{words[i]}</span></h2>
      <p style={{ color: "var(--color-fog)", maxWidth: 460, margin: "24px auto 0" }}>Join the founding cohort across South Africa. Early access invites roll out in batches.</p>
      <div style={{ marginTop: 32 }}><Button onClick={onOpen}>Get Early Access</Button></div>
    </div>
  </section>;
}

function Footer() {
  return <footer style={{ borderTop: "1px solid var(--color-line)" }}>
    <div style={{ ...wrap, padding: "20px 40px", display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: "rgba(143,141,151,0.6)" }}>
      <span>© 2026 PACE. ALL RIGHTS RESERVED.</span><span>BUILT FOR PEOPLE WHO TRAIN.</span>
    </div>
  </footer>;
}

window.PaceScreens = { Nav, Hero, Stats, Manifesto, Features, HowItWorks, FinalCTA, Footer };
