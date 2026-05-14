// Main dashboard layout
const { useState: useStateD, useMemo: useMemoD, useEffect: useEffectD } = React;

// ============================================================
// Filter chips (top bar)
// ============================================================
function FilterBar({ filters, setFilters }) {
  const entryTypes = [
  { id: "all", label: "All", icon: Icons.list },
  { id: "risk", label: "Risks", icon: Icons.shield },
  { id: "incident", label: "Incidents", icon: Icons.flame }];

  const pillars = ["All Pillars", ...window.RISK_DATA.PILLARS];
  const riskTypes = ["All Types", "Technical", "Resource", "Schedule", "Budget", "Scope", "External"];

  return (
    <div className="filterbar">
      <div className="filterbar-left" data-comment-anchor="e221bbbdca-div-18-7">
        <div className="seg">
          {entryTypes.map((t) => {
            const Ic = t.icon;
            const active = filters.entry === t.id;
            return (
              <button key={t.id} className={"seg-btn" + (active ? " on" : "")}
              onClick={() => setFilters({ ...filters, entry: t.id })}>
                <Ic size={13} />
                {t.label}
              </button>);

          })}
        </div>
        <Select
          label="Pillar"
          value={filters.pillar}
          options={pillars}
          onChange={(v) => setFilters({ ...filters, pillar: v })} />
        
        <Select
          label="Type"
          value={filters.riskType}
          options={riskTypes}
          onChange={(v) => setFilters({ ...filters, riskType: v })} />
        
        {(filters.pillar !== "All Pillars" || filters.riskType !== "All Types" || filters.entry !== "all") &&
        <button className="ghost-btn" onClick={() => setFilters({ entry: "all", pillar: "All Pillars", riskType: "All Types" })}>
            Clear
          </button>
        }
      </div>
      <div className="filterbar-right">
        <div className="search">
          <Icons.search size={13} />
          <input placeholder="Search risks, incidents, owners…" />
          <span className="kbd mono">⌘K</span>
        </div>
      </div>
    </div>);

}

function Select({ label, value, options, onChange }) {
  const [open, setOpen] = useStateD(false);
  return (
    <div className={"select" + (open ? " open" : "")} onMouseLeave={() => setOpen(false)}>
      <button className="select-btn" onClick={() => setOpen(!open)}>
        <span className="select-label">{label}</span>
        <span className="select-val">{value}</span>
        <Icons.chevron size={12} />
      </button>
      {open &&
      <div className="select-menu">
          {options.map((o) =>
        <button key={o} className={"select-opt" + (o === value ? " on" : "")} onClick={() => {onChange(o);setOpen(false);}}>
              {o === value && <Icons.check size={12} />}
              <span>{o}</span>
            </button>
        )}
        </div>
      }
    </div>);

}

// ============================================================
// Predictive alert + velocity hero strip
// ============================================================
function HeroStrip({ data, onPredictiveClick }) {
  const willHitCritical = data.filter((r) => r.pred && r.severity !== "critical").length;
  const escalatedThisWeek = data.filter((r) => r.trend === "worsening").length;
  const newThisWeek = data.filter((r) => {
    const d = new Date(r.created);
    const diff = (new Date("2026-05-14") - d) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  return (
    <div className="hero">
      <button className="hero-card hero-pred" onClick={onPredictiveClick}>
        <div className="hero-card-left">
          <span className="hero-eyebrow">
            <Icons.zap size={11} />
            Predictive signal
          </span>
          <div className="hero-headline">
            <span className="mono big">{willHitCritical}</span>
            <span>risk{willHitCritical === 1 ? "" : "s"} projected to hit <em>Critical</em> within 7 days if no action.</span>
          </div>
          <div className="hero-foot">
            <span>Model: buffer-shrinkage v4.2</span>
            <span className="dot-sep" />
            <span>Updated 06:02 UTC</span>
          </div>
        </div>
        <div className="hero-card-right">
          <svg width="160" height="68" viewBox="0 0 160 68" className="hero-spark">
            <defs>
              <linearGradient id="gradPred" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--sev-critical)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--sev-critical)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 50 L26 46 L52 44 L78 38 L104 30 L130 22 L160 8 L160 68 L0 68 Z" fill="url(#gradPred)" />
            <path d="M0 50 L26 46 L52 44 L78 38 L104 30 L130 22 L160 8" fill="none" stroke="var(--sev-critical)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="58" x2="160" y2="58" stroke="var(--line)" strokeDasharray="2 3" />
            <text x="160" y="55" textAnchor="end" fontSize="9" fill="var(--ink-tert)" fontFamily="ui-monospace, monospace">crit threshold</text>
            <circle cx="160" cy="8" r="3" fill="var(--sev-critical)" />
            <circle cx="160" cy="8" r="6" fill="var(--sev-critical)" opacity="0.18" />
          </svg>
        </div>
        <span className="hero-cta">
          Review <Icons.arrowRight size={12} />
        </span>
      </button>

      <div className="hero-side">
        <div className="velocity-card">
          <span className="hero-eyebrow">
            <Icons.arrowUp size={11} style={{ color: "var(--sev-critical)" }} />
            Risk velocity · 7d
          </span>
          <div className="velocity-stat">
            <span className="mono big">{escalatedThisWeek}</span>
            <span className="velocity-label">items escalated</span>
          </div>
          <div className="velocity-bars">
            {[3, 2, 4, 3, 5, 4, 6].map((v, i) =>
            <span key={i} className="velocity-bar" style={{ height: 4 + v * 4 }} />
            )}
          </div>
        </div>
        <div className="velocity-card">
          <span className="hero-eyebrow">
            <Icons.spark size={11} />
            New · 7d
          </span>
          <div className="velocity-stat">
            <span className="mono big">{newThisWeek}</span>
            <span className="velocity-label">new entries</span>
          </div>
          <div className="velocity-meta">
            <span>{Math.round(newThisWeek * 0.4)} risks</span>
            <span className="dot-sep" />
            <span>{newThisWeek - Math.round(newThisWeek * 0.4)} incidents</span>
          </div>
        </div>
      </div>
    </div>);

}

// ============================================================
// Severity metric cards (with sparklines)
// ============================================================
function SeverityCards({ data, trends, onDrill }) {
  const counts = {
    critical: data.filter((r) => r.severity === "critical").length,
    high: data.filter((r) => r.severity === "high").length,
    medium: data.filter((r) => r.severity === "medium").length,
    low: data.filter((r) => r.severity === "low").length
  };
  const rows = [
  { sev: "critical", count: counts.critical, trend: trends.critical, label: "Critical" },
  { sev: "high", count: counts.high, trend: trends.high, label: "High" },
  { sev: "medium", count: counts.medium, trend: trends.medium, label: "Medium" },
  { sev: "low", count: counts.low, trend: trends.low, label: "Low" }];


  return (
    <div className="sev-grid">
      {rows.map((r) => {
        const delta = r.trend[r.trend.length - 1] - r.trend[0];
        const dir = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
        return (
          <button key={r.sev} className="sev-card" data-sev={r.sev} onClick={() => onDrill(r.sev)}>
            <div className="sev-card-top">
              <span className="sev-name">{r.label}</span>
              <span className={`sev-delta mono ${dir}`}>
                {dir === "up" && "▲"}{dir === "down" && "▼"}{dir === "flat" && "—"}
                {" "}{delta > 0 ? "+" : ""}{delta}
              </span>
            </div>
            <div className="sev-card-mid">
              <span className="sev-count mono">{r.count}</span>
              <Sparkline data={r.trend} color={`var(--sev-${r.sev})`} w={92} h={28} strokeW={1.6} />
            </div>
            <div className="sev-card-foot">
              <span>7d trend</span>
              <span className="sev-drill">
                Open list <Icons.arrowRight size={11} />
              </span>
            </div>
          </button>);

      })}
    </div>);

}

// ============================================================
// Secondary metrics (active inc, worsening, overdue, orphaned)
// ============================================================
function SecondaryMetrics({ data, onDrill }) {
  const activeInc = data.filter((r) => r.type === "incident" && r.status !== "closed").length;
  const worsening = data.filter((r) => r.trend === "worsening").length;
  const overdue = 4;
  const orphaned = data.filter((r) => r.orphaned).length;

  const tiles = [
  { id: "active", label: "Active incidents", count: activeInc, icon: Icons.flame, tone: "violet", sub: "1 mitigating, 0 unowned" },
  { id: "worsen", label: "Worsening trend", count: worsening, icon: Icons.arrowDown, tone: "red", sub: "+1 vs last week", flash: true },
  { id: "overdue", label: "Overdue actions", count: overdue, icon: Icons.clock, tone: "amber", sub: "Owners notified", link: true },
  { id: "orphaned", label: "Orphaned risks", count: orphaned, icon: Icons.unlink, tone: "slate", sub: "Reassign needed" }];

  return (
    <div className="metric-row">
      {tiles.map((t) => {
        const Ic = t.icon;
        return (
          <button key={t.id} className={"metric-tile tone-" + t.tone + (t.flash ? " flash" : "")} onClick={() => onDrill(t.id)}>
            <div className="metric-tile-icon"><Ic size={14} /></div>
            <div className="metric-tile-body">
              <span className="metric-tile-count mono">{t.count}</span>
              <span className="metric-tile-label">{t.label}</span>
              <span className="metric-tile-sub">{t.sub}{t.link && <> · <span className="underline-link">Actions page</span></>}</span>
            </div>
          </button>);

      })}
    </div>);

}

// ============================================================
// Recent items feed
// ============================================================
function RecentFeed({ data, onItemClick }) {
  return (
    <section className="panel feed">
      <header className="panel-head">
        <div>
          <h3>Recent items</h3>
          <p className="panel-sub">Sorted by activity</p>
        </div>
        <a className="link-row" href="#">View Risk Register <Icons.arrowRight size={11} /></a>
      </header>
      <div className="feed-list">
        {data.map((r) =>
        <FeedRow key={r.id} item={r} onClick={() => onItemClick(r)} />
        )}
      </div>
    </section>);

}

function FeedRow({ item, onClick }) {
  const [hover, setHover] = useStateD(false);
  return (
    <article className={"feed-row" + (hover ? " hovered" : "")} data-sev={item.severity}
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    onClick={onClick}>
      <div className="feed-row-rail" />
      <div className="feed-row-main">
        <div className="feed-row-line1">
          <span className="feed-id mono">{item.id}</span>
          <span className="feed-title">{item.title}</span>
          {item.pred &&
          <span className="pred-pill" title="Projected to escalate to Critical within 7 days">
              <Icons.zap size={9} />
              predictive
            </span>
          }
          {item.orphaned &&
          <span className="orphan-pill" title="Linked task was deleted in nightly import — needs reassignment">
              <Icons.unlink size={9} />
              orphaned
            </span>
          }
        </div>
        <div className="feed-row-line2">
          <TypeTag type={item.type} />
          <PillarTag pillar={item.pillar} />
          <span className="meta-dim">{item.riskType}</span>
          <span className="dot-sep" />
          <span className="meta-dim">{STATUS_LABEL[item.status]}</span>
          <span className="dot-sep" />
          <span className="meta-dim mono">
            <Icons.user size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
            {item.owner}
          </span>
        </div>
        {hover &&
        <p className="feed-row-desc">{item.desc}</p>
        }
      </div>
      <div className="feed-row-meta">
        {item.trend !== "stable" && (
          <Sparkline data={item.spark} color={`var(--sev-${item.severity})`} w={80} h={22} />
        )}
        <BufferBar days={item.buffer} delta={item.bufferDelta} />
      </div>
      <div className="feed-row-end">
        {item.trend !== "stable" && <TrendArrow trend={item.trend} delta={item.bufferDelta} />}
        <SeverityChip severity={item.severity} />
        <ConfidenceIcon level={item.confidence} />
      </div>
    </article>);

}

// ============================================================
// Pending approvals queue (with SLA age)
// ============================================================
function ApprovalsQueue({ approvals }) {
  return (
    <section className="panel approvals">
      <header className="panel-head">
        <div>
          <h3>Pending approvals</h3>
          <p className="panel-sub">{approvals.length} awaiting review</p>
        </div>
        <a className="link-row" href="#">Approvals <Icons.arrowRight size={11} /></a>
      </header>
      {approvals.length === 0 ?
      <div className="empty-state">
          <div className="empty-icon"><Icons.check size={18} /></div>
          <p className="empty-title">Inbox zero</p>
          <p className="empty-sub">Nothing awaiting your sign-off.</p>
        </div> :

      <ul className="approval-list">
          {approvals.map((a) => {
          const overdue = a.age > 2;
          return (
            <li key={a.id} className={"approval-row" + (overdue ? " overdue" : "")}>
                <div className="approval-row-top">
                  <span className="approval-entity">{a.entity}</span>
                  <span className={"sla mono" + (overdue ? " bad" : "")}>
                    {overdue && <Icons.alert size={10} />}
                    {a.age}d pending
                  </span>
                </div>
                <p className="approval-name">{a.name}</p>
                <p className="approval-note">{a.note}</p>
                <div className="approval-foot">
                  <span className="meta-dim">From {a.requester}</span>
                  <div className="approval-actions">
                    <button className="ghost-btn sm">Review</button>
                    <button className="primary-btn sm">Approve</button>
                  </div>
                </div>
              </li>);

        })}
        </ul>
      }
    </section>);

}

// ============================================================
// Milestone health heat map
// ============================================================
function HeatMap({ onCellClick }) {
  const days = ["−6d", "−5d", "−4d", "−3d", "−2d", "−1d", "Today"];
  const heat = window.RISK_DATA.HEAT;
  const pillars = window.RISK_DATA.PILLARS;

  return (
    <section className="panel heat">
      <header className="panel-head">
        <div>
          <h3>Milestone health</h3>
          <p className="panel-sub">Low-confidence detections by pillar · 7-day trail</p>
        </div>
        <span className="heat-legend">
          <span>healthy</span>
          <span className="heat-cell legend" data-v="0" />
          <span className="heat-cell legend" data-v="1" />
          <span className="heat-cell legend" data-v="2" />
          <span className="heat-cell legend" data-v="3" />
          <span>at-risk</span>
        </span>
      </header>
      <div className="heat-grid">
        <div className="heat-corner" />
        {days.map((d) => <div key={d} className="heat-col-h mono">{d}</div>)}
        {pillars.map((p, pi) =>
        <React.Fragment key={p}>
            <div className="heat-row-h">{p}</div>
            {heat[pi].map((v, di) =>
          <button key={di} className="heat-cell" data-v={v}
          title={`${p} · ${days[di]} · ${["healthy", "watch", "drift", "at-risk"][v]}`}
          onClick={() => onCellClick && onCellClick(p, di, v)}>
                {v === 3 && <span className="heat-cell-mark mono">!</span>}
              </button>
          )}
          </React.Fragment>
        )}
      </div>
      <p className="heat-foot">
        <Icons.alert size={11} style={{ color: "var(--sev-critical)" }} />
        2 pillars trending toward at-risk. Security and Applications show 3+ consecutive low-confidence days.
      </p>
    </section>);

}

Object.assign(window, {
  FilterBar, HeroStrip, SeverityCards, SecondaryMetrics,
  RecentFeed, ApprovalsQueue, HeatMap
});