// Path A v3 — oversized peek with no chrome. Same product primitives
// as v2 (sidebar, header, conversation, draft plan card) but rendered
// at a larger scale so it reads as a real product surface seen up
// close, not a thumbnail. The mask on the parent does the framing —
// no border, no traffic-light dots, no URL pill. The product itself
// is the texture.

function PathATeaserV3() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "200px 1fr",
      width: "100%",
      height: "100%",
      minWidth: 0,
      minHeight: 0,
      background: "var(--ca-bg1)",
      borderRadius: 0,
      overflow: "hidden",
    }}>
      <ProjectSidebar
        project="Book club"
        url="book-club.coldanvil.com"
        section="Conversation"
      />
      <main style={{
        display: "grid",
        gridTemplateRows: "52px 1fr",
        minWidth: 0,
        minHeight: 0,
      }}>
        <ProductHeader project="Book club" section="Conversation" />
        <div style={{
          minWidth: 0,
          minHeight: 0,
          padding: "26px 36px 0",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          overflow: "hidden",
        }}>
          <AnnieLine>
            Before I build anything — who is this <em style={{ fontStyle: "italic", color: "var(--cream)", fontWeight: 500 }}>actually</em> for? "Book club" is wide. Tell me who you're picturing.
          </AnnieLine>
          <UserLine>
            Friends-of-friends groups, 8–12 people. Someone hosts, picks a book, the rest pay £4/month to be in. I want hosts to feel like curators, not admins.
          </UserLine>
          <AnnieLine>
            Got it. Then the landing page sells <em style={{ fontStyle: "italic", color: "var(--cream)", fontWeight: 500 }}>becoming a host</em>, not joining a club. Different page entirely.
          </AnnieLine>

          <DraftPlanCardV3 />

          <AnnieLine>
            Two things I'd push back on before we ship — want them now or after the first build?
          </AnnieLine>
        </div>
      </main>
    </div>
  );
}

function DraftPlanCardV3() {
  return (
    <div style={{
      position: "relative",
      padding: "16px 18px",
      border: "1px solid var(--border-subtle)",
      borderTop: "1px solid var(--accent)",
      borderRadius: 4,
      background: "color-mix(in oklab, var(--ca-bg1) 60%, var(--ca-bg0s))",
      marginRight: 12,
      marginLeft: 38,
    }}>
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: 9.5,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--ink-muted)",
        marginBottom: 8,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span>Landing page · draft</span>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", color: "var(--ink-dim)", textTransform: "none" }}>v1 · 4 sections</span>
      </div>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: 18,
        lineHeight: 1.36,
        letterSpacing: "-0.01em",
        fontWeight: 400,
        color: "var(--ink-bright)",
      }}>
        <em style={{ fontStyle: "italic", color: "var(--cream)", fontWeight: 500 }}>"Host a book club worth showing up to."</em>{" "}
        Pitch hosts on the curation, not the platform.
      </div>
      <ul style={{
        margin: "12px 0 0",
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}>
        {[
          "Hero — the pitch, one host's photo, \"start a club\" CTA",
          "How it works — pick book, invite 8, £4/mo per member",
          "Two host stories — Anya's sci-fi club, Jamal's biographies",
          "Pricing — host free, members pay; you keep 80%",
        ].map((label, i) => (
          <li key={i} style={{
            display: "grid",
            gridTemplateColumns: "14px 1fr",
            gap: 8,
            alignItems: "center",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--ink)",
          }}>
            <span style={{ width: 10, height: 10, border: "1px solid var(--border)", borderRadius: 2 }} />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

Object.assign(window, { PathATeaserV3 });
