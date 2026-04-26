// Shared bits for the WorkshopTeaser refresh. Mirrors the live Annie
// product primitives (Cold_Anvil/annie/src/components/workshop/*) at static-
// rendering fidelity. No interaction — these are screenshots-of-the-product,
// not a working app.

// --- Anvil mark (the brand glyph) ---
function AnvilMark({ size = 18, color = "var(--accent)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" aria-hidden="true" style={{ color, flexShrink: 0 }}>
      <g fill="currentColor">
        <path d="M128 129.09V232a8 8 0 0 1-3.84-1l-88-48.16a8 8 0 0 1-4.16-7V80.2a8 8 0 0 1 .7-3.27Z" opacity=".2" />
        <path d="m223.68 66.15l-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 32l80.34 44L128 120L47.66 76ZM40 90l80 43.78v85.79l-80-43.75Zm96 129.57v-85.75L216 90v85.78Z" />
      </g>
    </svg>
  );
}

// --- The "a" tile — same treatment as the product's wk-annie-mark ---
function AnnieMark({ size = 24 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size,
        border: "1px solid var(--accent)",
        borderRadius: "50%",
        display: "grid", placeItems: "center",
        color: "var(--accent)",
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: Math.round(size * 0.58),
        lineHeight: 1,
        flexShrink: 0,
        marginTop: 2,
        fontWeight: 500,
      }}
    >a</div>
  );
}

// --- AnnieLine — body in regular weight (NOT italic), italic reserved for emphasis ---
function AnnieLine({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 14, alignItems: "start" }}>
      <AnnieMark size={24} />
      <div style={{
        fontFamily: "var(--font-body)",
        color: "var(--ink-bright)",
        fontSize: 15,
        lineHeight: 1.62,
        letterSpacing: "-0.003em",
      }}>{children}</div>
    </div>
  );
}

// --- UserLine — 2px left rule, "YOU" kicker ---
function UserLine({ children }) {
  return (
    <div style={{
      paddingLeft: 16,
      borderLeft: "2px solid var(--ink-dim)",
      color: "var(--ink)",
      fontFamily: "var(--font-body)",
      fontSize: 15,
      lineHeight: 1.58,
    }}>
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: 9.5,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--ink-dim)",
        marginBottom: 4,
        fontWeight: 500,
      }}>you</div>
      {children}
    </div>
  );
}

// --- Browser chrome — credible traffic-light dots, mono URL pill, Live badge ---
function Browser({ url = "copper-kettle.coldanvil.com", live = true, children, style }) {
  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: 10,
      overflow: "hidden",
      background: "#242221",
      display: "flex",
      flexDirection: "column",
      ...style,
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 12,
        padding: "9px 12px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "#2a2826",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f56", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,.4)" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,.4)" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#27c93f", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,.4)" }} />
        </div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          background: "#1f1d1c",
          borderRadius: 4,
          padding: "5px 10px",
          color: "var(--ink)",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          minWidth: 0,
          maxWidth: 360,
          margin: "0 auto",
        }}>
          {/* favicon — anvil glyph */}
          <AnvilMark size={11} color="var(--accent)" />
          <span style={{ color: "var(--ink-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{url}</span>
          {live && (
            <span style={{
              color: "var(--secondary)",
              fontSize: 9,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              border: "1px solid var(--secondary)",
              padding: "0 5px",
              borderRadius: 2,
              height: 14,
              display: "inline-flex",
              alignItems: "center",
              flexShrink: 0,
            }}>Live</span>
          )}
        </div>
        <div style={{ width: 36, display: "flex", justifyContent: "flex-end" }}>
          {/* refresh button placeholder */}
          <span style={{
            display: "inline-flex",
            width: 22, height: 22,
            color: "var(--ink-dim)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 4v5h-5" />
            </svg>
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

// --- Sidebar mirroring the real product's ProjectShell rail ---
function ProjectSidebar({ project = "Copper Kettle", url = "copper-kettle.coldanvil.com", section = "Conversation" }) {
  const sections = ["Conversation", "Vision", "Brand voice", "Content", "Architecture", "Preview", "History"];
  return (
    <aside style={{
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid var(--border-subtle)",
      background: "transparent",
      minWidth: 0,
    }}>
      {/* Brand block — fixed 48px to align with the conversation column header */}
      <div style={{
        height: 48,
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid var(--border-subtle)",
        boxSizing: "border-box",
      }}>
        <AnvilMark size={16} color="var(--accent)" />
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: 14,
          color: "var(--cream)",
          letterSpacing: "-0.01em",
          fontWeight: 500,
        }}>
          Cold Anvil <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--ink-muted)", fontSize: 12 }}>Studios</em>
        </span>
        {/* Alpha pill */}
        <span style={{
          marginLeft: 4,
          fontFamily: "var(--font-body)",
          fontSize: 8.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--accent)",
          border: "1px solid var(--accent)",
          padding: "1px 5px",
          borderRadius: 2,
          lineHeight: 1.2,
        }}>α</span>
      </div>

      <div style={{ padding: "16px 16px", display: "flex", flexDirection: "column", gap: 14, flex: 1, minHeight: 0 }}>
        {/* Project block */}
        <div>
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: 9.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            fontWeight: 500,
          }}>project</div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            color: "var(--cream)",
            marginTop: 3,
            letterSpacing: "-0.012em",
            fontWeight: 500,
          }}>{project}</div>
          <div style={{
            fontSize: 10,
            color: "var(--ink-dim)",
            marginTop: 1,
            fontFamily: "var(--font-mono)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>{url}</div>
        </div>

        {/* Nav — seven tabs, Conversation active */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 2 }}>
          {sections.map((label) => {
            const active = label === section;
            return (
              <div key={label} style={{
                textAlign: "left",
                background: active ? "color-mix(in oklab, var(--accent) 9%, transparent)" : "transparent",
                borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`,
                borderRadius: 3,
                padding: "5px 8px",
                color: active ? "var(--cream)" : "var(--ink-muted)",
                fontSize: 12.5,
                fontWeight: active ? 500 : 400,
                fontFamily: "var(--font-body)",
                letterSpacing: "-0.003em",
              }}>{label}</div>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ height: 1, background: "linear-gradient(to right, transparent, var(--border-subtle) 8%, var(--border-subtle) 92%, transparent)" }} />

        <div style={{
          fontSize: 10.5,
          color: "var(--ink-dim)",
          lineHeight: 1.5,
          fontFamily: "var(--font-body)",
        }}>
          <div style={{ color: "var(--ink-muted)", marginBottom: 1 }}>Your workshop</div>
          <div>Take it with you anytime.</div>
          <button style={{
            marginTop: 6,
            background: "transparent",
            border: "1px solid var(--border-subtle)",
            borderRadius: 4,
            color: "var(--ink-muted)",
            padding: "4px 8px",
            fontFamily: "var(--font-body)",
            fontSize: 10.5,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            cursor: "default",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export project
          </button>
        </div>
      </div>
    </aside>
  );
}

// --- Header strip mirroring the product ---
function ProductHeader({ project = "Copper Kettle", section = "Conversation" }) {
  return (
    <header style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      alignItems: "center",
      gap: 16,
      padding: "0 18px",
      borderBottom: "1px solid var(--border-subtle)",
      height: 48,
      flexShrink: 0,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "var(--ink-muted)",
        fontFamily: "var(--font-body)",
        fontSize: 12,
      }}>
        <span>{project}</span>
        <span style={{ color: "var(--ink-dim)" }}>/</span>
        <span style={{ color: "var(--cream)" }}>{section}</span>
      </div>
      <div />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* preview-running chip */}
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          height: 20,
          padding: "0 8px",
          borderRadius: 10,
          border: "1px solid var(--secondary)",
          color: "var(--secondary)",
          fontFamily: "var(--font-body)",
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
          preview running
        </span>
        {/* Open site button */}
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 8px",
          borderRadius: 5,
          border: "1px solid var(--border)",
          color: "var(--ink-bright)",
          fontFamily: "var(--font-body)",
          fontSize: 11,
          fontWeight: 500,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Open site
        </span>
      </div>
    </header>
  );
}

Object.assign(window, { AnvilMark, AnnieMark, AnnieLine, UserLine, Browser, ProjectSidebar, ProductHeader });
