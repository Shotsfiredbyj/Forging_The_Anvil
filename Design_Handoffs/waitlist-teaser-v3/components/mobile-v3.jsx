// Mobile v3 — same product-as-frame logic. The product header bar is
// the chrome. No browser frame, no traffic-light dots. The peek sits
// below the letter, full column width, with a small bottom fade so
// the conversation reads as continuing.
//
// On mobile we drop the sidebar (it's a row's worth of context, not a
// frame) — the product header alone is enough chrome at this width.

function WaitlistMobileV3() {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "var(--ca-bg0s)",
      overflow: "hidden",
      position: "relative",
      fontFamily: "var(--font-body)",
      color: "var(--ink)",
    }}>
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(60% 30% at 50% 0%, rgba(216,166,92,0.10), transparent 60%)`,
      }} />

      <div style={{
        position: "relative", height: "100%",
        padding: "60px 24px 24px",
        boxSizing: "border-box",
        overflowY: "auto",
        zIndex: 2,
      }}>
        <a style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          color: "var(--cream)", fontFamily: "var(--font-display)",
          fontSize: 15, fontWeight: 500, letterSpacing: "-0.005em",
          textDecoration: "none",
        }}>
          <AnvilMark size={16} color="var(--accent)" />
          <span>Cold Anvil <span style={{ color: "var(--ink-muted)", fontWeight: 400, fontSize: 12 }}>Studios</span></span>
        </a>

        <p style={{
          margin: "32px 0 0",
          fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 500,
          textTransform: "uppercase", letterSpacing: "0.22em",
          color: "var(--accent)",
        }}>A peek inside the workshop</p>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 500,
          color: "var(--cream)", lineHeight: 1.04, letterSpacing: "-0.022em",
          margin: "14px 0 0", maxWidth: "16ch",
        }}>Annie's workshop opens <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 500 }}>soon</em>.</h1>
        <p style={{
          fontFamily: "var(--font-display)", fontSize: 16,
          color: "var(--ink-bright)", lineHeight: 1.4,
          margin: "16px 0 0", fontWeight: 400,
        }}>Product development, for anyone with an idea.</p>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 14,
          color: "var(--ink)", lineHeight: 1.6, margin: "14px 0 0",
        }}>Annie is our product engineer. She builds the thing you've been meaning to build — clickable by the end of the day.</p>

        <div style={{ margin: "20px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{
            border: "1px solid var(--border-subtle)", borderRadius: 6,
            background: "var(--bg-elevated)", padding: "12px 14px",
            fontFamily: "var(--font-body)", fontSize: 13,
            color: "var(--ink-muted)",
          }}>you@example.com</div>
          <div style={{
            background: "var(--accent)", color: "var(--accent-on)",
            padding: "12px 16px", textAlign: "center", borderRadius: 6,
            fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
          }}>Get on the list</div>
        </div>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 11,
          color: "var(--ink-muted)", margin: "10px 0 0",
        }}>When Annie's ready, you'll be one of the first to meet her.</p>

        {/* Peek — product-as-frame, header is the chrome. Bleeds 24px
            past the right edge with a light fade so the conversation
            reads as continuing offscreen. No browser dots, no URL pill. */}
        <div style={{
          position: "relative",
          marginTop: 32,
          marginRight: -24,
          maskImage: "linear-gradient(to right, #000 0, #000 calc(100% - 60px), transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, #000 0, #000 calc(100% - 60px), transparent 100%)",
        }}>
          <div style={{
            background: "var(--ca-bg1)",
            border: "1px solid var(--border)",
            borderRight: "none",
            borderRadius: "6px 0 0 6px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 360,
            boxShadow: "0 14px 28px rgba(0,0,0,0.32)",
          }}>
            <ProductHeader project="Book club" section="Conversation" />
            <div style={{
              padding: "18px 18px 0",
              display: "flex", flexDirection: "column", gap: 14,
              flex: 1, minHeight: 0,
            }}>
              <AnnieLine>
                Before I build anything — who is this <em style={{ fontStyle: "italic", color: "var(--cream)", fontWeight: 500 }}>actually</em> for?
              </AnnieLine>
              <UserLine>
                Friends-of-friends groups, 8–12 people. Host picks the book, members pay £4/month.
              </UserLine>
              <AnnieLine>
                Then the page sells becoming a host, not joining a club.
              </AnnieLine>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WaitlistMobileV3 });
