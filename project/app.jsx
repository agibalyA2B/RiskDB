// Drill-down modal & app shell
const { useState: useStateA, useMemo: useMemoA, useEffect: useEffectA } = React;

// ============================================================
// Drill-down modal — filterable list + mini heat map
// ============================================================
function DrillModal({ open, title, eyebrow, items, onClose, sevHighlight }) {
  const [sevFilter, setSevFilter] = useStateA("all");
  const [pillarFilter, setPillarFilter] = useStateA("All");

  useEffectA(() => {
    if (!open) return;
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const filtered = items.filter((r) => {
    if (sevFilter !== "all" && r.severity !== sevFilter) return false;
    if (pillarFilter !== "All" && r.pillar !== pillarFilter) return false;
    return true;
  });

  const pillarCounts = window.RISK_DATA.PILLARS.map((p) => ({
    p,
    counts: ["critical", "high", "medium", "low"].map((s) => items.filter((i) => i.pillar === p && i.severity === s).length)
  }));

  return (
    <div className="modal-shroud" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div>
            <span className="modal-eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            <p className="modal-sub">{filtered.length} item{filtered.length === 1 ? "" : "s"} · filter to drill in</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icons.x size={16} />
          </button>
        </header>

        <div className="modal-toolbar">
          <div className="seg sm">
            {["all", "critical", "high", "medium", "low"].map((s) =>
            <button key={s} className={"seg-btn" + (sevFilter === s ? " on" : "")} onClick={() => setSevFilter(s)}>
                {s === "all" ? "All severities" : SEV[s].label}
              </button>
            )}
          </div>
          <Select label="Pillar" value={pillarFilter} options={["All", ...window.RISK_DATA.PILLARS]} onChange={setPillarFilter} />
        </div>

        <div className="modal-body">
          <div className="modal-left">
            <h4 className="mini-title">Severity × pillar heat</h4>
            <div className="mini-heat">
              <div className="mini-heat-corner" />
              {["Crit", "High", "Med", "Low"].map((s) => <div key={s} className="mini-heat-col-h mono">{s}</div>)}
              {pillarCounts.map(({ p, counts }) =>
              <React.Fragment key={p}>
                  <div className="mini-heat-row-h">{p}</div>
                  {counts.map((c, i) => {
                  const sev = ["critical", "high", "medium", "low"][i];
                  return (
                    <div key={i} className="mini-heat-cell" data-sev={sev} data-count={c}>
                        {c > 0 && <span className="mono">{c}</span>}
                      </div>);

                })}
                </React.Fragment>
              )}
            </div>

            <h4 className="mini-title">Buffer distribution</h4>
            <div className="buffer-hist">
              {[0, 1, 2, 3, 4, 5].map((bucket) => {
                const min = bucket * 7,max = min + 7;
                const c = items.filter((i) => i.buffer >= min && i.buffer < max).length;
                const h = c === 0 ? 4 : 12 + c * 14;
                const tone = bucket === 0 ? "critical" : bucket === 1 ? "high" : bucket === 2 ? "medium" : "low";
                return (
                  <div key={bucket} className="hist-col">
                    <span className="hist-count mono">{c || ""}</span>
                    <div className="hist-bar" data-tone={tone} style={{ height: h }} />
                    <span className="hist-label mono">{min}–{max - 1}d</span>
                  </div>);

              })}
            </div>
          </div>

          <div className="modal-right">
            <h4 className="mini-title">Contributing items</h4>
            <ul className="drill-list">
              {filtered.length === 0 &&
              <li className="empty-mini">No items match this filter.</li>
              }
              {filtered.map((r) =>
              <li key={r.id} className="drill-row" data-sev={r.severity}>
                  <div className="drill-row-rail" />
                  <div className="drill-row-main">
                    <div className="drill-row-line1">
                      <span className="feed-id mono">{r.id}</span>
                      <span className="drill-title">{r.title}</span>
                    </div>
                    <p className="drill-desc">{r.desc}</p>
                    <div className="drill-row-meta">
                      <TypeTag type={r.type} />
                      <PillarTag pillar={r.pillar} />
                      <span className="meta-dim">{r.riskType}</span>
                      <span className="dot-sep" />
                      <span className="meta-dim">{STATUS_LABEL[r.status]}</span>
                      <span className="dot-sep" />
                      <span className="meta-dim mono">{r.buffer}d buffer</span>
                    </div>
                  </div>
                  <div className="drill-row-end">
                    <SeverityChip severity={r.severity} />
                    <TrendArrow trend={r.trend} delta={r.bufferDelta} />
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <footer className="modal-foot">
          <span className="meta-dim">
            <Icons.alert size={11} /> Severity recalculates daily based on buffer shrinkage.
          </span>
          <button className="primary-btn">Open in Risk Register <Icons.arrowRight size={11} /></button>
        </footer>
      </div>
    </div>);

}

// ============================================================
// Sidebar
// ============================================================
function Sidebar({ counts }) {
  const nav = [
  { id: "dashboard", label: "Dashboard", icon: Icons.grid, active: true },
  { id: "register", label: "Risk Register", icon: Icons.shield, badge: counts.total },
  { id: "incidents", label: "Incident Actions", icon: Icons.flame, badge: counts.actions },
  { id: "approvals", label: "Approvals", icon: Icons.check, badge: counts.approvals },
  { id: "admin", label: "Admin", icon: Icons.user }];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" fill="var(--ink)" />
            <path d="M9 12l2 2 4-4" stroke="var(--bg)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">Helix Risk</span>
          <span className="brand-sub mono">v4.2 · PMO</span>
        </div>
      </div>

      <nav className="nav">
        <p className="nav-section mono">WORKSPACE</p>
        {nav.map((n) => {
          const Ic = n.icon;
          return (
            <a key={n.id} className={"nav-item" + (n.active ? " on" : "")} href="#">
              <Ic size={15} />
              <span>{n.label}</span>
              {n.badge !== undefined && <span className="nav-badge mono">{n.badge}</span>}
            </a>);

        })}
      </nav>

      <div className="sidebar-status">
        <div className="status-row">
          <span className="status-dot" />
          <span className="mono">Nightly import · 06:02 UTC</span>
        </div>
        <div className="status-row">
          <span className="status-dot warn" />
          <span className="mono">1 orphan flagged</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="avatar mono">JR</div>
        <div className="user-meta">
          <span>Jules Renaud</span>
          <span className="mono dim">PMO · Director</span>
        </div>
      </div>
    </aside>);

}

// ============================================================
// Top bar
// ============================================================
function TopBar({ tweaks, setTweak }) {
  return (
    <div className="topbar">
      <div>
        <p className="topbar-eyebrow mono">
          <span>PMO</span>
          <Icons.arrowRight size={10} />
          <span>Risk &amp; incident</span>
          <Icons.arrowRight size={10} />
          <span className="ink">Dashboard</span>
        </p>
        <div className="topbar-title-row">
          <h1>Risk &amp; incident overview</h1>
          <span className="live-badge" title="Dashboard data refreshes nightly from upstream systems">
            <span className="live-dot" />
            <span className="mono">Last synced 06:02 UTC</span>
          </span>
        </div>
        <p className="topbar-sub">Last Updated 06:02 AM · viewing as PMO Director</p>
      </div>
      <div className="topbar-actions">
        <button className="ghost-btn" title="Notifications">
          <Icons.bell size={14} /> <span>3</span>
        </button>
        <button className="ghost-btn">Export</button>
        <button className="primary-btn">
          <Icons.shield size={13} /> Open Risk Register
        </button>
      </div>
    </div>);

}

// ============================================================
// App
// ============================================================
function App() {
  const [filters, setFilters] = useStateA({ entry: "all", pillar: "All Pillars", riskType: "All Types" });
  const [drill, setDrill] = useStateA(null); // { sev, title } or { id, title }
  const [selectedItem, setSelectedItem] = useStateA(null);

  const [t, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "density": "comfortable",
    "accent": "ember",
    "showPredictive": true,
    "tone": "warm"
  } /*EDITMODE-END*/);

  const filtered = useMemoA(() => {
    return window.RISK_DATA.RISKS.filter((r) => {
      if (filters.entry !== "all" && r.type !== filters.entry) return false;
      if (filters.pillar !== "All Pillars" && r.pillar !== filters.pillar) return false;
      if (filters.riskType !== "All Types" && r.riskType !== filters.riskType) return false;
      return true;
    });
  }, [filters]);

  const counts = {
    total: window.RISK_DATA.RISKS.length,
    actions: 4,
    approvals: window.RISK_DATA.APPROVALS.length
  };

  const onDrillSeverity = (sev) => {
    const items = filtered.filter((r) => r.severity === sev);
    setDrill({
      title: `${SEV[sev].label} severity items`,
      eyebrow: "Drill-down",
      items: items.length ? items : filtered,
      sev
    });
  };
  const onDrillMetric = (id) => {
    const map = {
      active: { title: "Active incidents", items: filtered.filter((r) => r.type === "incident" && r.status !== "closed") },
      worsen: { title: "Worsening trend", items: filtered.filter((r) => r.trend === "worsening") },
      overdue: { title: "Overdue actions", items: filtered.slice(0, 4) },
      orphaned: { title: "Orphaned risks", items: filtered.filter((r) => r.orphaned) }
    };
    const m = map[id];
    setDrill({ title: m.title, eyebrow: "Drill-down", items: m.items });
  };
  const onPredictive = () => {
    const items = filtered.filter((r) => r.pred);
    setDrill({ title: "Predicted escalations · 7 days", eyebrow: "Predictive signal", items });
  };

  return (
    <div className="shell" data-density={t.density} data-accent={t.accent} data-tone={t.tone}>
      <Sidebar counts={counts} />
      <main className="main">
        <TopBar tweaks={t} setTweak={setTweak} />
        <FilterBar filters={filters} setFilters={setFilters} />
        {t.showPredictive &&
        <HeroStrip data={filtered} onPredictiveClick={onPredictive} />
        }
        <SeverityCards data={filtered} trends={window.RISK_DATA.SEVERITY_TRENDS} onDrill={onDrillSeverity} />
        <SecondaryMetrics data={filtered} onDrill={onDrillMetric} />
        <div className="lower-grid">
          <RecentFeed data={filtered} onItemClick={setSelectedItem} />
          <div className="rail-right">
            <ApprovalsQueue approvals={window.RISK_DATA.APPROVALS} />
            <HeatMap />
          </div>
        </div>
        <footer className="page-foot">
          <span className="mono dim">
            Helix Risk · {filtered.length} of {window.RISK_DATA.RISKS.length} items shown
          </span>
          <span className="mono dim">Severity recalculates daily · next refresh in 18h 17m</span>
        </footer>
      </main>

      <DrillModal
        open={!!drill}
        title={drill?.title}
        eyebrow={drill?.eyebrow}
        items={drill?.items || []}
        sevHighlight={drill?.sev}
        onClose={() => setDrill(null)} />
      

      <TweaksUI t={t} setTweak={setTweak} />
    </div>);

}

// ============================================================
// Tweaks panel UI
// ============================================================
function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Layout">
        <TweakRadio label="Density" value={t.density}
        options={["comfortable", "compact"]}
        onChange={(v) => setTweak("density", v)} />
      </TweakSection>
      <TweakSection label="Theme">
        <TweakRadio label="Tone" value={t.tone}
        options={["warm", "cool", "ink"]}
        onChange={(v) => setTweak("tone", v)} />
        <TweakRadio label="Severity palette" value={t.accent}
        options={["ember", "signal", "mono"]}
        onChange={(v) => setTweak("accent", v)} />
      </TweakSection>
      <TweakSection label="Surfaces">
        <TweakToggle label="Predictive hero" value={t.showPredictive}
        onChange={(v) => setTweak("showPredictive", v)} />
      </TweakSection>
    </TweaksPanel>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);