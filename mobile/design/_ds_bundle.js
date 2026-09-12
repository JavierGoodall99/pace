/* @ds-bundle: {"format":4,"namespace":"PaceDesignSystem_1f19d6","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Modal","sourcePath":"components/core/Modal.jsx"},{"name":"ProgressBar","sourcePath":"components/core/ProgressBar.jsx"},{"name":"SegmentedControl","sourcePath":"components/core/SegmentedControl.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"e536ccf44874","components/core/Badge.jsx":"a43730f3b6eb","components/core/Button.jsx":"93085e42f73c","components/core/Card.jsx":"8f35784d18b7","components/core/Chip.jsx":"ce88563b0523","components/core/IconButton.jsx":"d4eaa60db5da","components/core/Input.jsx":"f8ee23a0689d","components/core/Modal.jsx":"a309c8aa4374","components/core/ProgressBar.jsx":"103f8383f847","components/core/SegmentedControl.jsx":"b5a552dca9a0","ui_kits/mobile-onboarding/Screens.jsx":"caa1cc70fb81","ui_kits/website/Sections.jsx":"9ba52f59fd0e","ui_kits/website/WaitlistModal.jsx":"406e0f535ea5"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PaceDesignSystem_1f19d6 = window.PaceDesignSystem_1f19d6 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function Avatar({
  src,
  alt = "",
  size = 64,
  ring = true,
  overlap = false
}) {
  return /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      objectFit: "cover",
      filter: "grayscale(1)",
      marginLeft: overlap ? -size / 3.2 : 0,
      boxShadow: ring ? "0 0 0 2px var(--color-ash)" : "none"
    }
  });
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function Badge({
  children,
  tone = "neutral",
  dot = false
}) {
  const tones = {
    neutral: {
      border: "1px solid var(--color-line)",
      background: "var(--color-coal)",
      color: "var(--color-fog)"
    },
    accent: {
      border: "1px solid rgba(255,77,46,0.3)",
      background: "rgba(255,77,46,0.08)",
      color: "var(--color-ember)"
    },
    solid: {
      border: "none",
      background: "var(--color-ember)",
      color: "var(--color-ink)"
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      ...t,
      borderRadius: "var(--radius-full)",
      padding: "6px 14px",
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase"
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "currentColor"
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const base = {
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  borderRadius: "var(--radius-full)",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  transition: "background-color 300ms var(--ease-decel), color 300ms var(--ease-decel), transform 300ms var(--ease-decel)"
};
const sizes = {
  md: {
    padding: "16px 32px"
  },
  sm: {
    padding: "10px 20px",
    fontSize: "11px"
  }
};
const variants = {
  primary: {
    background: "var(--color-ember)",
    color: "var(--color-ink)"
  },
  secondary: {
    background: "var(--color-bone)",
    color: "var(--color-ink)"
  },
  ghost: {
    background: "transparent",
    color: "var(--color-fog)",
    border: "1px solid var(--color-line)"
  }
};
const hoverBg = {
  primary: "var(--color-flare)",
  secondary: "var(--color-ember)",
  ghost: "transparent"
};
function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  const v = variants[variant] || variants.primary;
  const style = {
    ...base,
    ...sizes[size],
    ...v,
    background: disabled ? "var(--color-ash)" : hover ? hoverBg[variant] : v.background,
    color: disabled ? "rgba(143,141,151,0.4)" : v.color,
    opacity: disabled ? 1 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    transform: hover && !disabled ? "scale(0.99)" : "scale(1)"
  };
  return /*#__PURE__*/React.createElement("button", {
    style: style,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  children,
  media = false,
  style
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      borderRadius: "var(--radius-3xl)",
      overflow: "hidden",
      background: media ? "transparent" : "var(--color-ash)",
      border: media ? "1px solid var(--color-line)" : `1px solid ${hover ? "rgba(255,77,46,0.4)" : "var(--color-line)"}`,
      transform: !media && hover ? "translateY(-6px)" : "translateY(0)",
      transition: "border-color 500ms var(--ease-decel), transform 500ms var(--ease-decel)",
      ...style
    }
  }, children, !media && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 2,
      background: "var(--color-ember)",
      transformOrigin: "left",
      transform: hover ? "scaleX(1)" : "scaleX(0)",
      transition: "transform 500ms var(--ease-decel)"
    }
  }));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function Chip({
  children,
  selected = false,
  onClick,
  icon
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      height: "44px",
      padding: "0 18px",
      borderRadius: "var(--radius-full)",
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      border: selected ? "1px solid var(--color-ember)" : "1px solid var(--color-line)",
      background: selected ? "var(--color-ember)" : "var(--color-coal)",
      color: selected ? "var(--color-ink)" : "var(--color-fog)",
      fontWeight: selected ? 700 : 500,
      cursor: "pointer",
      transition: "all 300ms var(--ease-decel)"
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function IconButton({
  children,
  tone = "neutral",
  size = 44,
  onClick,
  ariaLabel
}) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    neutral: {
      bg: "var(--color-ash)",
      color: "var(--color-bone)",
      hoverBorder: "var(--color-line-hover)"
    },
    accent: {
      bg: "rgba(255,77,46,0.10)",
      color: "var(--color-ember)",
      hoverBorder: "var(--color-ember)"
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("button", {
    "aria-label": ariaLabel,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: size,
      height: size,
      borderRadius: "var(--radius-full)",
      background: t.bg,
      color: t.color,
      border: `1px solid ${hover ? t.hoverBorder : "var(--color-line)"}`,
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      transition: "border-color 300ms var(--ease-decel), transform 300ms var(--ease-decel)",
      transform: hover ? "scale(1.06)" : "scale(1)"
    }
  }, children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function Input({
  placeholder,
  value,
  onChange,
  error = false,
  type = "text"
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    placeholder: placeholder,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      boxSizing: "border-box",
      background: "var(--color-coal)",
      color: "var(--color-bone)",
      fontFamily: "var(--font-mono)",
      fontSize: "14px",
      letterSpacing: "0.05em",
      padding: "16px 24px",
      borderRadius: "var(--radius-full)",
      outline: "none",
      border: error ? "1px solid rgba(255,77,46,0.7)" : focus ? "1px solid rgba(255,77,46,0.6)" : "1px solid var(--color-line)",
      boxShadow: focus || error ? "0 0 0 4px rgba(255,77,46,0.1)" : "none",
      transition: "all 300ms var(--ease-decel)"
    }
  });
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Modal.jsx
try { (() => {
function Modal({
  children,
  onClose,
  width = 480
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(10,10,13,0.8)",
      backdropFilter: "blur(6px)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      width: "100%",
      maxWidth: width
    }
  }, onClose && /*#__PURE__*/React.createElement("button", {
    "aria-label": "Close",
    onClick: onClose,
    style: {
      position: "absolute",
      top: -14,
      right: -14,
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: "var(--color-coal)",
      border: "1px solid var(--color-line)",
      color: "var(--color-fog)",
      cursor: "pointer"
    }
  }, "\u2715"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--radius-3xl)",
      border: "1px solid var(--color-line)",
      background: "rgba(21,21,28,0.95)",
      backdropFilter: "blur(12px)",
      padding: "32px"
    }
  }, children)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Modal.jsx", error: String((e && e.message) || e) }); }

// components/core/ProgressBar.jsx
try { (() => {
function ProgressBar({
  value = 0,
  max = 100,
  width = 140
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height: "4px",
      borderRadius: "var(--radius-full)",
      background: "var(--color-ash)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: `${pct}%`,
      background: "var(--color-ember)",
      borderRadius: "var(--radius-full)",
      transition: "width 500ms var(--ease-decel)"
    }
  }));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/core/SegmentedControl.jsx
try { (() => {
function SegmentedControl({
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px"
    }
  }, options.map(opt => {
    const active = opt === value;
    return /*#__PURE__*/React.createElement("button", {
      key: opt,
      onClick: () => onChange && onChange(opt),
      style: {
        padding: "10px 18px",
        borderRadius: "var(--radius-full)",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        border: active ? "1px solid var(--color-ember)" : "1px solid var(--color-line)",
        background: active ? "var(--color-ember)" : "var(--color-coal)",
        color: active ? "var(--color-ink)" : "var(--color-fog)",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        transition: "all 300ms var(--ease-decel)"
      }
    }, opt);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-onboarding/Screens.jsx
try { (() => {
const IMG = {
  hero: "https://images.pexels.com/photos/10545425/pexels-photo-10545425.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1000&w=700",
  maya: "https://images.pexels.com/photos/9944394/pexels-photo-9944394.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600"
};
const {
  Button,
  IconButton,
  Chip,
  SegmentedControl,
  Input,
  Badge,
  ProgressBar
} = window.PaceDesignSystem_1f19d6;
const mono = {
  fontFamily: "var(--font-mono)"
};
const screenBase = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  background: "var(--color-ink)"
};
function TopBar({
  step,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "back",
    onClick: onBack,
    size: 40
  }, "\u2039"), /*#__PURE__*/React.createElement(ProgressBar, {
    value: step,
    max: 8,
    width: 110
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11,
      letterSpacing: "0.2em",
      color: "var(--color-fog)"
    }
  }, "0", step, " / 08"));
}
function Dock({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: "16px 20px 28px",
      borderTop: "1px solid var(--color-line)",
      background: "rgba(10,10,13,0.9)",
      backdropFilter: "blur(20px)"
    }
  }, children);
}
const H = ({
  children
}) => /*#__PURE__*/React.createElement("h1", {
  style: {
    fontFamily: "var(--font-display)",
    fontSize: 34,
    color: "var(--color-bone)",
    textTransform: "uppercase",
    lineHeight: 0.95,
    margin: "16px 20px 6px"
  }
}, children);
const Sub = ({
  children
}) => /*#__PURE__*/React.createElement("p", {
  style: {
    color: "var(--color-fog)",
    fontSize: 13,
    lineHeight: 1.4,
    margin: "0 20px 20px"
  }
}, children);
function Welcome({
  onNext
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: screenBase
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: "58%",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: IMG.hero,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      filter: "grayscale(0.35)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to bottom, transparent 40%, var(--color-ink))"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 56,
      left: 20
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent",
    dot: true
  }, "FOUNDING COHORT \xB7 BATCH 01"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: "0 20px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 44,
      lineHeight: 0.88,
      textTransform: "uppercase",
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-bone)"
    }
  }, "MATCH."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "text-outline"
  }, "TRAIN."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-ember)"
    }
  }, "DATE.")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--color-fog)",
      fontSize: 13,
      marginTop: 16,
      lineHeight: 1.5
    }
  }, "Dating apps waste your time with people who don't live like you. PACE matches you with people who keep up.")), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Button, {
    onClick: onNext,
    style: {
      width: "100%"
    }
  }, "Get Early Access"), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono,
      textAlign: "center",
      fontSize: 10,
      color: "var(--color-fog)",
      letterSpacing: "0.15em",
      marginTop: 14
    }
  }, "I ALREADY HAVE AN ACCOUNT \xB7 LOG IN")));
}
function Basics({
  onNext,
  onBack
}) {
  const [gender, setGender] = React.useState("WOMAN");
  return /*#__PURE__*/React.createElement("div", {
    style: screenBase
  }, /*#__PURE__*/React.createElement(TopBar, {
    step: 2,
    onBack: onBack
  }), /*#__PURE__*/React.createElement(H, null, "THE BASICS."), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "YOUR FIRST NAME"
  }), /*#__PURE__*/React.createElement(Input, {
    placeholder: "DD / MM / YYYY"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      ...mono,
      fontSize: 10,
      letterSpacing: "0.2em",
      color: "var(--color-bone)"
    }
  }, "I AM"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ["MAN", "WOMAN", "NON-BINARY"],
    value: gender,
    onChange: setGender
  })))), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Button, {
    onClick: onNext,
    style: {
      width: "100%"
    }
  }, "Continue")));
}
function Disciplines({
  onNext,
  onBack
}) {
  const opts = ["RUNNING", "CYCLING", "LIFTING", "CLIMBING", "BOXING", "SWIMMING", "YOGA", "HIKING", "CROSSFIT"];
  const [sel, setSel] = React.useState(["RUNNING"]);
  const toggle = o => setSel(p => p.includes(o) ? p.filter(x => x !== o) : [...p, o]);
  return /*#__PURE__*/React.createElement("div", {
    style: screenBase
  }, /*#__PURE__*/React.createElement(TopBar, {
    step: 3,
    onBack: onBack
  }), /*#__PURE__*/React.createElement(H, null, "HOW DO YOU MOVE?"), /*#__PURE__*/React.createElement(Sub, null, "Select 1 to 4 sports you actively train."), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px",
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, opts.map(o => /*#__PURE__*/React.createElement(Chip, {
    key: o,
    selected: sel.includes(o),
    onClick: () => toggle(o)
  }, o))), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Badge, null, "SELECTED: ", sel.length, " / 4"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: onNext,
    style: {
      width: "100%"
    }
  }, "Continue"))));
}
function Cadence({
  onNext,
  onBack
}) {
  const [freq, setFreq] = React.useState("3–4× / WK");
  return /*#__PURE__*/React.createElement("div", {
    style: screenBase
  }, /*#__PURE__*/React.createElement(TopBar, {
    step: 4,
    onBack: onBack
  }), /*#__PURE__*/React.createElement(H, null, "YOUR CADENCE."), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px"
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      ...mono,
      fontSize: 10,
      letterSpacing: "0.2em",
      color: "var(--color-bone)"
    }
  }, "HOW OFTEN DO YOU TRAIN?"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, ["1–2× / WK", "3–4× / WK", "5–6× / WK", "DAILY+"].map(f => /*#__PURE__*/React.createElement(Chip, {
    key: f,
    selected: freq === f,
    onClick: () => setFreq(f)
  }, f))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      padding: 16,
      borderRadius: 16,
      background: "var(--color-coal)",
      border: "1px solid var(--color-line)",
      fontSize: 12,
      color: "var(--color-fog)"
    }
  }, "We pair you with athletes whose workout windows match yours.")), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Button, {
    onClick: onNext,
    style: {
      width: "100%"
    }
  }, "Continue")));
}
function PaceCal({
  onNext,
  onBack
}) {
  const [pace, setPace] = React.useState("5:15 /km");
  return /*#__PURE__*/React.createElement("div", {
    style: screenBase
  }, /*#__PURE__*/React.createElement(TopBar, {
    step: 5,
    onBack: onBack
  }), /*#__PURE__*/React.createElement(H, null, "PACE CALIBRATION."), /*#__PURE__*/React.createElement(Sub, null, "Typical easy / base pace?"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px",
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, ["4:15 /km", "4:45 /km", "5:15 /km", "5:45 /km", "6:15 /km"].map(p => /*#__PURE__*/React.createElement(Chip, {
    key: p,
    selected: pace === p,
    onClick: () => setPace(p)
  }, p))), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Button, {
    onClick: onNext,
    style: {
      width: "100%"
    }
  }, "Continue")));
}
function Photos({
  onNext,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: screenBase
  }, /*#__PURE__*/React.createElement(TopBar, {
    step: 6,
    onBack: onBack
  }), /*#__PURE__*/React.createElement(H, null, "SHOW HOW YOU TRAIN."), /*#__PURE__*/React.createElement(Sub, null, "Upload at least 3 photos."), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px",
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 8
    }
  }, [0, 1, 2, 3, 4, 5].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      aspectRatio: "1",
      borderRadius: 16,
      background: i === 0 ? `url(${IMG.maya}) center/cover` : "var(--color-ash)",
      border: i > 2 ? "1px dashed var(--color-line)" : "1px solid var(--color-line)",
      display: "grid",
      placeItems: "center",
      color: "var(--color-fog)",
      fontSize: 20
    }
  }, i > 2 ? "+" : ""))), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Button, {
    onClick: onNext,
    style: {
      width: "100%"
    }
  }, "Continue")));
}
function Verify({
  onNext,
  onBack
}) {
  const rows = [["STRAVA", "Auto-sync runs, rides & weekly mileage."], ["GARMIN CONNECT", "Sync VO2 max, training load & workouts."], ["APPLE HEALTH", "Read weekly active calories & workout sessions."]];
  return /*#__PURE__*/React.createElement("div", {
    style: screenBase
  }, /*#__PURE__*/React.createElement(TopBar, {
    step: 7,
    onBack: onBack
  }), /*#__PURE__*/React.createElement(H, null, "SYNC YOUR TRAINING."), /*#__PURE__*/React.createElement(Sub, null, "Connect your tracker to earn the Verified Athlete badge."), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px",
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, rows.map(([t, c]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 14,
      borderRadius: 16,
      border: "1px solid var(--color-line)",
      background: "var(--color-ash)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontSize: 12,
      color: "var(--color-bone)",
      letterSpacing: "0.1em"
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--color-fog)",
      marginTop: 4
    }
  }, c)), /*#__PURE__*/React.createElement(Badge, null, "CONNECT")))), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Button, {
    onClick: onNext,
    style: {
      width: "100%"
    }
  }, "I'll Verify Manually Later")));
}
function LaunchHub({
  onRestart,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: screenBase
  }, /*#__PURE__*/React.createElement(TopBar, {
    step: 8,
    onBack: onBack
  }), /*#__PURE__*/React.createElement(H, null, "YOUR LAUNCH HUB."), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px",
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, ["CAPE TOWN", "JOHANNESBURG"].map(c => /*#__PURE__*/React.createElement("div", {
    key: c,
    style: {
      padding: 14,
      borderRadius: 16,
      border: "1px solid var(--color-line)",
      background: "var(--color-ash)"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent",
    dot: true
  }, "ACTIVE COHORT \xB7 BATCH 01"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontSize: 13,
      color: "var(--color-bone)",
      marginTop: 8
    }
  }, c))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      borderRadius: 24,
      background: "rgba(255,77,46,0.08)",
      border: "1px solid rgba(255,77,46,0.3)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 18,
      color: "var(--color-bone)",
      textTransform: "uppercase"
    }
  }, "Founding Athlete Access Unlocked"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--color-fog)",
      marginTop: 6
    }
  }, "Free access to all premium filtering during launch."))), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Button, {
    onClick: onRestart,
    style: {
      width: "100%"
    }
  }, "Enter Pace")));
}
window.PaceMobileScreens = {
  Welcome,
  Basics,
  Disciplines,
  Cadence,
  PaceCal,
  Photos,
  Verify,
  LaunchHub
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-onboarding/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Sections.jsx
try { (() => {
const IMG = {
  cyclist: "https://images.pexels.com/photos/10545425/pexels-photo-10545425.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=1080",
  couple: "https://images.pexels.com/photos/5038818/pexels-photo-5038818.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=980",
  rope: "https://images.pexels.com/photos/9943223/pexels-photo-9943223.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=520",
  maya: "https://images.pexels.com/photos/9944394/pexels-photo-9944394.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=680",
  noah: "https://images.pexels.com/photos/10545425/pexels-photo-10545425.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=560&w=800",
  lea: "https://images.pexels.com/photos/13588101/pexels-photo-13588101.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=760&w=560",
  bg: "https://images.pexels.com/photos/35833299/pexels-photo-35833299.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1200",
  sweat: "https://images.pexels.com/photos/7675401/pexels-photo-7675401.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
  man: "https://images.pexels.com/photos/38453225/pexels-photo-38453225.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200"
};
const {
  Button,
  Badge,
  Card,
  Avatar
} = window.PaceDesignSystem_1f19d6;
const wrap = {
  maxWidth: 1440,
  margin: "0 auto",
  padding: "0 40px"
};
const eyebrow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.35em",
  color: "var(--color-fog)",
  textTransform: "uppercase"
};
const dot = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "var(--color-ember)"
};
const h2 = {
  fontFamily: "var(--font-display)",
  textTransform: "uppercase",
  lineHeight: 0.9,
  color: "var(--color-bone)",
  fontSize: "clamp(2.2rem,4.4vw,3.8rem)",
  margin: "24px 0 0"
};
function Nav({
  onOpen
}) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "fixed",
      inset: "0 0 auto 0",
      zIndex: 50,
      transition: "all 500ms var(--ease-decel)",
      background: scrolled ? "rgba(10,10,13,0.8)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid var(--color-line)" : "1px solid transparent"
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      ...wrap,
      height: 76,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 8,
      background: "var(--color-ember)",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/icons/activity.svg",
    style: {
      width: 18,
      height: 18,
      filter: "brightness(0)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 24,
      color: "var(--color-bone)"
    }
  }, "PACE"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      letterSpacing: "0.2em",
      color: "var(--color-ember)",
      fontWeight: 700
    }
  }, "SOUTH AFRICA")), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: onOpen
  }, "Get Early Access")));
}
function Hero({
  onOpen
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      paddingTop: 160,
      paddingBottom: 90,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: -190,
      right: "-10%",
      width: 600,
      height: 600,
      borderRadius: "50%",
      background: "rgba(255,77,46,0.12)",
      filter: "blur(150px)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      display: "grid",
      gridTemplateColumns: "1.3fr 1fr",
      gap: 40,
      alignItems: "center",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      textTransform: "uppercase",
      lineHeight: 0.85,
      color: "var(--color-bone)",
      fontSize: "clamp(3.2rem,7vw,6.5rem)",
      margin: 0
    }
  }, "MATCH.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "text-outline"
  }, "TRAIN."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-ember)"
    }
  }, "DATE.")), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 28,
      maxWidth: 480,
      color: "var(--color-fog)",
      fontSize: 17,
      lineHeight: 1.6
    }
  }, "Dating apps waste your time with people who don't live like you. ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-bone)"
    }
  }, "PACE matches you with active singles across South Africa who actually keep up.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 36
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: onOpen
  }, "Get Early Access"))), /*#__PURE__*/React.createElement(SwipeStack, null)));
}
function SwipeStack() {
  const profiles = [{
    name: "MAYA, 27",
    loc: "SEA POINT",
    tag: "TRAIL RUN · 5×/WK",
    img: IMG.maya,
    match: "97%"
  }, {
    name: "NOAH, 31",
    loc: "CRADLE CYCLING",
    tag: "CYCLING · RACING",
    img: IMG.noah,
    match: "94%"
  }, {
    name: "LEA, 24",
    loc: "CLIFTON STEPS",
    tag: "LIFTING · 6×/WK",
    img: IMG.lea,
    match: "99%"
  }];
  const [i, setI] = React.useState(0);
  const card = profiles[i % profiles.length];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 460,
      width: 300,
      margin: "0 auto"
    }
  }, profiles.map((p, idx) => {
    const depth = (idx - i + profiles.length) % profiles.length;
    if (depth > 2) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: p.name,
      style: {
        position: "absolute",
        inset: 0,
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.15)",
        transform: `translateY(${-depth * 14}px) scale(${1 - depth * 0.05})`,
        zIndex: 10 - depth,
        boxShadow: depth === 0 ? "0 30px 60px -15px rgba(0,0,0,0.7)" : "none",
        transition: "all 400ms var(--ease-decel)"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: p.img,
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to top, rgba(10,10,13,0.9), transparent 60%)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 28,
        color: "var(--color-bone)"
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.2em",
        color: "var(--color-fog)",
        marginTop: 6
      }
    }, p.loc), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "accent"
    }, p.tag))));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: -60,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setI(i + 1),
    style: {
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: "rgba(10,10,13,0.8)",
      border: "1px solid rgba(244,241,234,0.2)",
      color: "var(--color-bone)",
      cursor: "pointer"
    }
  }, "\u2715"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setI(i + 1),
    style: {
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: "rgba(10,10,13,0.8)",
      border: "1px solid rgba(255,77,46,0.4)",
      color: "var(--color-ember)",
      cursor: "pointer"
    }
  }, "\u2665")));
}
function Stats() {
  const items = [["9", "", "PROVINCES · SOUTH AFRICA"], ["12", "+", "CORE DISCIPLINES"], ["100", "%", "TRAINING-VERIFIED PROFILES"], ["1", "", "FOUNDING COHORT · BATCH 01"]];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      borderTop: "1px solid var(--color-line)",
      borderBottom: "1px solid var(--color-line)",
      background: "var(--color-ink)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      padding: "0 40px",
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 1,
      background: "var(--color-line)"
    }
  }, items.map(([v, s, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      background: "var(--color-ink)",
      padding: "48px 24px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 48,
      color: "var(--color-bone)",
      margin: 0
    }
  }, v, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-ember)"
    }
  }, s)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.3em",
      color: "var(--color-fog)",
      marginTop: 10
    }
  }, l)))));
}
function Manifesto() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "112px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: wrap
  }, /*#__PURE__*/React.createElement("div", {
    style: eyebrow
  }, /*#__PURE__*/React.createElement("span", {
    style: dot
  }), "01 \u2014 MANIFESTO"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 32,
      maxWidth: 900,
      fontFamily: "var(--font-sans)",
      fontWeight: 600,
      fontSize: "clamp(1.5rem,3vw,2.4rem)",
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      color: "var(--color-bone)"
    }
  }, "The best relationships are built in ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-ember)"
    }
  }, "motion."), " Shared effort, shared endorphins, shared ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-ember)"
    }
  }, "finish lines."), " PACE is dating for people who would rather log ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-ember)"
    }
  }, "miles"), " than sit still.")));
}
function Features() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "0 0 112px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: wrap
  }, /*#__PURE__*/React.createElement("div", {
    style: eyebrow
  }, /*#__PURE__*/React.createElement("span", {
    style: dot
  }), "02 \u2014 WHY PACE"), /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "DATING APPS MADE YOU SWIPE.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "text-outline"
  }, "WE MAKE YOU MOVE.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    media: true,
    style: {
      gridColumn: "span 2",
      minHeight: 340
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: IMG.couple,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      filter: "grayscale(0.45)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to top, var(--color-ink), transparent 55%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 32,
      right: 32,
      bottom: 32
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "DAYLIGHT & PUBLIC DATES"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 30,
      color: "var(--color-bone)",
      margin: "16px 0 8px",
      textTransform: "uppercase"
    }
  }, "Meet on the promenade, not at a bar"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(244,241,234,0.8)",
      fontSize: 14,
      maxWidth: 460,
      margin: 0
    }
  }, "First dates are 5Ks on the Sea Point Promenade or sunrise trail runs up Kloof Corner \u2014 safe, public, high-energy."))), /*#__PURE__*/React.createElement(Card, {
    media: true,
    style: {
      minHeight: 340
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: IMG.rope,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      filter: "grayscale(0.45)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to top, var(--color-ink), transparent 55%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 28,
      right: 28,
      bottom: 28
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "SAFETY & VERIFICATION"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 26,
      color: "var(--color-bone)",
      margin: "16px 0 8px",
      textTransform: "uppercase"
    }
  }, "No bots. No catfish."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(244,241,234,0.8)",
      fontSize: 13,
      margin: 0
    }
  }, "Every profile is photo-verified and manually reviewed before entry."))), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 32,
      minHeight: 260,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 26,
      color: "var(--color-bone)",
      marginTop: "auto",
      textTransform: "uppercase"
    }
  }, "Born from the run club"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--color-fog)",
      fontSize: 14
    }
  }, "Built for athletes who train together in safe, public group environments.")), /*#__PURE__*/React.createElement(Card, {
    style: {
      gridColumn: "span 2",
      padding: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 20,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, "PACE MATCH\u2122"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 26,
      color: "var(--color-bone)",
      margin: "16px 0 0",
      textTransform: "uppercase"
    }
  }, "Effort, algorithmically aligned")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: IMG.sweat,
    size: 56
  }), /*#__PURE__*/React.createElement(Avatar, {
    src: IMG.man,
    size: 56,
    overlap: true
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      height: 6,
      borderRadius: 999,
      background: "rgba(255,255,255,0.1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "94%",
      height: "100%",
      borderRadius: 999,
      background: "var(--color-ember)"
    }
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--color-fog)",
      fontSize: 13,
      marginTop: 16
    }
  }, "We compare training load, pace and schedule \u2014 so chemistry starts with compatibility.")))));
}
function HowItWorks() {
  const steps = [["01", "CLAIM EARLY ACCESS", "Drop your email and select your city."], ["02", "GET MANUALLY VERIFIED", "Every profile goes through human photo and activity review."], ["03", "TRAIN IN DAYLIGHT", "Match on pace and weekly schedule. Meet on the promenade or the trail."]];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "0 0 112px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: wrap
  }, /*#__PURE__*/React.createElement("div", {
    style: eyebrow
  }, /*#__PURE__*/React.createElement("span", {
    style: dot
  }), "03 \u2014 HOW IT WORKS"), /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "THREE STEPS TO THE ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-ember)"
    }
  }, "START LINE.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 16
    }
  }, steps.map(([n, t, c]) => /*#__PURE__*/React.createElement(Card, {
    key: n,
    style: {
      padding: 32,
      minHeight: 220
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-outline",
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 56
    }
  }, n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 22,
      color: "var(--color-bone)",
      margin: "28px 0 8px",
      textTransform: "uppercase"
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--color-fog)",
      fontSize: 14
    }
  }, c))))));
}
function FinalCTA({
  onOpen
}) {
  const words = ["HIKING?", "RUNNING?", "CYCLING?", "TRAINING?"];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, []);
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      padding: "150px 0",
      textAlign: "center",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: IMG.bg,
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: 0.14,
      filter: "grayscale(1)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to bottom, var(--color-ink), rgba(10,10,13,0.9), var(--color-ink))"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      ...wrap
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2,
      fontSize: "clamp(2.4rem,5.5vw,4.5rem)"
    }
  }, "READY FOR YOUR FIRST", /*#__PURE__*/React.createElement("br", null), "DATE ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-ember)"
    }
  }, words[i])), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--color-fog)",
      maxWidth: 460,
      margin: "24px auto 0"
    }
  }, "Join the founding cohort across South Africa. Early access invites roll out in batches."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: onOpen
  }, "Get Early Access"))));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: "1px solid var(--color-line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...wrap,
      padding: "20px 40px",
      display: "flex",
      justifyContent: "space-between",
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.25em",
      color: "rgba(143,141,151,0.6)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 PACE. ALL RIGHTS RESERVED."), /*#__PURE__*/React.createElement("span", null, "BUILT FOR PEOPLE WHO TRAIN.")));
}
window.PaceScreens = {
  Nav,
  Hero,
  Stats,
  Manifesto,
  Features,
  HowItWorks,
  FinalCTA,
  Footer
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Sections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/WaitlistModal.jsx
try { (() => {
const {
  Modal,
  Input,
  Button,
  Chip,
  Badge
} = window.PaceDesignSystem_1f19d6;
const CITIES = ["CAPE TOWN", "JOHANNESBURG", "DURBAN", "PRETORIA", "OTHER (SA)"];
const SPORTS = ["Running", "Trail Running", "Cycling", "Lifting", "CrossFit", "Climbing", "Boxing", "Yoga"];
function WaitlistModal({
  onClose
}) {
  const [step, setStep] = React.useState("email");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("CAPE TOWN");
  const [sports, setSports] = React.useState([]);
  const toggle = s => setSports(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    width: 520
  }, step === "email" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.3em",
      color: "var(--color-ember)"
    }
  }, "STEP 1 OF 2"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 28,
      color: "var(--color-bone)",
      textTransform: "uppercase",
      margin: "6px 0 12px"
    }
  }, "Get Early Access"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--color-fog)",
      fontSize: 13,
      marginBottom: 20
    }
  }, "Join the founding cohort across South Africa."), /*#__PURE__*/React.createElement(Input, {
    placeholder: "YOUR@EMAIL.COM",
    value: email,
    onChange: setEmail
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => email.includes("@") && setStep("details")
  }, "Continue"))), step === "details" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.3em",
      color: "var(--color-ember)"
    }
  }, "STEP 2 OF 2"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 26,
      color: "var(--color-bone)",
      textTransform: "uppercase",
      margin: "6px 0 20px"
    }
  }, "Complete Your Founding Profile"), /*#__PURE__*/React.createElement("label", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.2em",
      color: "var(--color-bone)"
    }
  }, "1. WHICH CITY?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      margin: "10px 0 20px"
    }
  }, CITIES.map(c => /*#__PURE__*/React.createElement(Chip, {
    key: c,
    selected: city === c,
    onClick: () => setCity(c)
  }, c))), /*#__PURE__*/React.createElement("label", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.2em",
      color: "var(--color-bone)"
    }
  }, "2. PRIMARY DISCIPLINES"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      margin: "10px 0 24px"
    }
  }, SPORTS.map(s => /*#__PURE__*/React.createElement(Chip, {
    key: s,
    selected: sports.includes(s),
    onClick: () => toggle(s)
  }, s))), /*#__PURE__*/React.createElement(Button, {
    onClick: () => setStep("done")
  }, "Join Founding Cohort")), step === "done" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 48,
      height: 48,
      borderRadius: "50%",
      background: "var(--color-ember)",
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      color: "var(--color-ink)",
      fontSize: 22
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent",
    dot: true
  }, "BATCH 01 \xB7 CONFIRMED"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 26,
      color: "var(--color-bone)",
      textTransform: "uppercase",
      margin: "10px 0"
    }
  }, "You're on the founding list."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--color-fog)",
      fontSize: 13
    }
  }, "LAUNCH HUB: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-bone)"
    }
  }, city), sports.length ? ` · ${sports.slice(0, 2).join(" & ").toUpperCase()}` : ""))));
}
window.PaceScreens = {
  ...window.PaceScreens,
  WaitlistModal
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/WaitlistModal.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

})();
