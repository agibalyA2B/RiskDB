// UI primitives for Risk Dashboard
const { useState, useRef, useEffect, useMemo } = React;

// ============================================================
// Icons (stroke 1.5, 16px viewBox 24)
// ============================================================
const Icon = ({ d, size = 16, fill = "none", stroke = "currentColor", sw = 1.5, children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  shield:    (p) => <Icon {...p} d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />,
  grid:      (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></Icon>,
  list:      (p) => <Icon {...p}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></Icon>,
  check:     (p) => <Icon {...p} d="M4 12l5 5 11-11" />,
  bell:      (p) => <Icon {...p} d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Zm4 13a2 2 0 0 0 4 0" />,
  filter:    (p) => <Icon {...p} d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" />,
  arrowUp:   (p) => <Icon {...p}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="9 7 17 7 17 15"/></Icon>,
  arrowDown:(p) => <Icon {...p}><line x1="7" y1="7" x2="17" y2="17"/><polyline points="9 17 17 17 17 9"/></Icon>,
  arrowFlat:(p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12"/></Icon>,
  arrowRight:(p)=> <Icon {...p}><line x1="5" y1="12" x2="18" y2="12"/><polyline points="13 7 18 12 13 17"/></Icon>,
  clock:     (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></Icon>,
  spark:     (p) => <Icon {...p} d="M11 3 4 14h6l-1 7 7-11h-6l1-7Z" />,
  alert:     (p) => <Icon {...p}><path d="M12 3 2 21h20L12 3Z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17.5" r="0.4" fill="currentColor" stroke="none"/></Icon>,
  flame:     (p) => <Icon {...p} d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-3 2-7 1 1 3 1 3-3Z" />,
  eye:       (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></Icon>,
  unlink:    (p) => <Icon {...p}><path d="M9 17H6a5 5 0 0 1 0-10h2"/><path d="M15 7h3a5 5 0 0 1 5 5"/><line x1="3" y1="3" x2="21" y2="21"/></Icon>,
  zap:       (p) => <Icon {...p} d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  x:         (p) => <Icon {...p}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></Icon>,
  chevron:   (p) => <Icon {...p}><polyline points="6 9 12 15 18 9"/></Icon>,
  search:    (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><line x1="16" y1="16" x2="21" y2="21"/></Icon>,
  dot:       (p) => <Icon {...p}><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></Icon>,
  user:      (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></Icon>,
  link:      (p) => <Icon {...p}><path d="M10 14a4 4 0 0 1 0-5l3-3a4 4 0 1 1 5 5l-1 1"/><path d="M14 10a4 4 0 0 1 0 5l-3 3a4 4 0 1 1-5-5l1-1"/></Icon>,
};

// ============================================================
// Sparkline — smooth area line, ~64×20
// ============================================================
function Sparkline({ data, color = "currentColor", w = 72, h = 22, fill = true, strokeW = 1.4 }) {
  if (!data || !data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, h - 2 - ((v - min) / range) * (h - 4)]);
  const linePath = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const areaPath = linePath + ` L ${w} ${h} L 0 ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      {fill && <path d={areaPath} fill={color} opacity="0.10" />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
    </svg>
  );
}

// ============================================================
// Severity / trend / pillar tokens
// ============================================================
const SEV = {
  critical: { label: "Critical", color: "var(--sev-critical)", bg: "var(--sev-critical-bg)" },
  high:     { label: "High",     color: "var(--sev-high)",     bg: "var(--sev-high-bg)" },
  medium:   { label: "Medium",   color: "var(--sev-medium)",   bg: "var(--sev-medium-bg)" },
  low:      { label: "Low",      color: "var(--sev-low)",      bg: "var(--sev-low-bg)" },
};

const STATUS_LABEL = {
  draft: "Draft",
  open: "Open",
  "in-mitigation": "In Mitigation",
  "accepted-monitored": "Accepted · Monitored",
  closed: "Closed",
  promoted: "Promoted",
};

function SeverityChip({ severity, dense }) {
  const s = SEV[severity];
  return (
    <span className="sev-chip" data-sev={severity} style={{ padding: dense ? "1px 7px" : "2px 9px" }}>
      <span className="sev-chip-dot" />
      {s.label}
    </span>
  );
}

function TrendArrow({ trend, delta }) {
  const map = {
    worsening: { Icon: Icons.arrowDown, label: "Worsening", color: "var(--sev-critical)", desc: `Buffer shrank ${Math.abs(delta || 0)} day${Math.abs(delta||0)===1?"":"s"} this week` },
    improving: { Icon: Icons.arrowUp,   label: "Improving", color: "var(--sev-low)",      desc: `Buffer grew ${Math.abs(delta || 0)} day${Math.abs(delta||0)===1?"":"s"} this week` },
    stable:    { Icon: Icons.arrowFlat, label: "Stable",    color: "var(--ink-tert)",     desc: "No change in last 7 days" },
  };
  const m = map[trend];
  const C = m.Icon;
  return (
    <span className="trend" title={`${m.label} — ${m.desc}`}>
      <C size={13} style={{ color: m.color }} />
      <span style={{ color: m.color, fontWeight: 500 }}>{m.label}</span>
    </span>
  );
}

const PILLAR_HUE = {
  "Infrastructure":     210,
  "Applications":       175,
  "Data & Analytics":   265,
  "Security":           25,
  "Operations":         135,
};

function PillarTag({ pillar }) {
  const h = PILLAR_HUE[pillar] ?? 220;
  return (
    <span className="pillar-tag" style={{
      ["--ph"]: h,
      background: `oklch(0.96 0.018 ${h})`,
      color: `oklch(0.36 0.07 ${h})`,
      borderColor: `oklch(0.88 0.03 ${h})`,
    }}>
      <span className="pillar-tag-dot" style={{ background: `oklch(0.58 0.12 ${h})` }} />
      {pillar}
    </span>
  );
}

function TypeTag({ type }) {
  return (
    <span className="type-tag" data-type={type}>
      {type === "incident" ? "Incident" : "Risk"}
    </span>
  );
}

function ConfidenceIcon({ level }) {
  // 3 stacked bars showing detection confidence
  const bars = [1, 2, 3].map((b) => {
    const active =
      level === "high" ? b <= 3 :
      level === "medium" ? b <= 2 :
      b <= 1;
    return (
      <span key={b} className="conf-bar" style={{
        height: 3 + b * 2,
        background: active
          ? (level === "high" ? "var(--sev-low)" : level === "medium" ? "var(--sev-medium)" : "var(--sev-high)")
          : "var(--line-strong)",
      }} />
    );
  });
  return (
    <span className="confidence" title={`Milestone detection confidence: ${level}`}>
      <span className="confidence-bars">{bars}</span>
      <span className="confidence-label">{level}</span>
    </span>
  );
}

function BufferBar({ days, delta }) {
  // visual buffer remaining: 0..30+ days. <7 days = warning territory.
  const pct = Math.min(100, (days / 30) * 100);
  const tone = days <= 5 ? "critical" : days <= 12 ? "high" : days <= 21 ? "medium" : "low";
  return (
    <div className="buffer">
      <div className="buffer-row">
        <span className="buffer-days mono">{days}d</span>
        {delta !== 0 && (
          <span className={`buffer-delta ${delta < 0 ? "down" : "up"} mono`}>
            {delta < 0 ? "−" : "+"}{Math.abs(delta)}
          </span>
        )}
      </div>
      <div className="buffer-track">
        <div className="buffer-fill" data-tone={tone} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

Object.assign(window, {
  Icons, Sparkline, SeverityChip, TrendArrow, PillarTag, TypeTag,
  ConfidenceIcon, BufferBar, SEV, STATUS_LABEL, PILLAR_HUE,
});
