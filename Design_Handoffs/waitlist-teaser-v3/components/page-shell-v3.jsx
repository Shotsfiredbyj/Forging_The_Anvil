// v3 page shell — same letter, but the peek is now a single large
// surface that slices across the right two-thirds of the page,
// bleeding off BOTH edges (left and right) and fading at both edges
// so it reads as a fragment of a much bigger workshop continuing in
// every direction. No browser chrome. No panel boundary. Asymmetry
// is preserved by scale + the headline column sitting on top with
// the text fully readable; the peek is the textured ground behind
// and to the right of the letter.

function WaitlistPageV3({ right, labelEyebrow = "A peek inside the workshop" }) {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100%",
      background: "var(--ca-bg0s)",
      overflow: "hidden",
      fontFamily: "var(--font-body)",
      color: "var(--ink)",
    }}>
      {/* Warm wash */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        background: `
          radial-gradient(56% 38% at 22% 22%, rgba(216,166,92,0.09), transparent 62%),
          radial-gradient(36% 28% at 82% 84%, rgba(140,148,92,0.05), transparent 60%)
        `,
      }} />

      {/* PEEK — sits BEHIND the letter, bleeds off both sides, fades on both edges */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        {right}
      </div>

      {/* Wordmark */}
      <a style={{
        position: "absolute", top: 30, left: 44, zIndex: 5,
        display: "inline-flex", alignItems: "center", gap: 10,
        color: "var(--cream)",
        fontFamily: "var(--font-display)",
        fontWeight: 500, fontSize: 17,
        letterSpacing: "-0.005em",
        lineHeight: 1,
        textDecoration: "none",
      }}>
        <AnvilMark size={20} color="var(--accent)" />
        <span>Cold Anvil <span style={{ color: "var(--ink-muted)", fontWeight: 400, fontSize: 13, marginLeft: 2 }}>Studios</span></span>
      </a>

      {/* LETTER — overlays the peek, lives on the left */}
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "100px 44px 64px",
        boxSizing: "border-box",
        zIndex: 4,
        display: "flex",
        alignItems: "center",
      }}>
        <div style={{ position: "relative", zIndex: 4, maxWidth: 540 }}>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 11,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: "var(--accent)",
            margin: 0,
          }}>{labelEyebrow}</p>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 68,
            fontWeight: 500,
            color: "var(--cream)",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            margin: "18px 0 0",
            maxWidth: "14ch",
            textWrap: "balance",
          }}>
            Annie's workshop opens <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 500 }}>soon</em>.
          </h1>

          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: 19,
            color: "var(--ink-bright)",
            lineHeight: 1.42,
            margin: "20px 0 0",
            maxWidth: "32ch",
            fontWeight: 400,
          }}>
            Product development, for anyone with an idea.
          </p>

          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--ink)",
            lineHeight: 1.65,
            margin: "20px 0 0",
            maxWidth: "46ch",
          }}>
            Annie is our product engineer. She builds the thing you've been meaning to build — clickable by the end of the day. We're putting the finishing touches to her workshop.
          </p>

          <div style={{
            margin: "28px 0 0",
            maxWidth: 460,
            display: "flex",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--bg-elevated)",
          }}>
            <div style={{
              flex: 1,
              padding: "13px 16px",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--ink-muted)",
            }}>you@example.com</div>
            <div style={{
              background: "var(--accent)",
              color: "var(--accent-on)",
              padding: "0 18px",
              display: "flex",
              alignItems: "center",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 500,
            }}>Get on the list</div>
          </div>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--ink-muted)",
            margin: "12px 0 0",
            maxWidth: 460,
          }}>When Annie's ready, you'll be one of the first to meet her. No newsletters. No noise.</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 44, right: 44,
        padding: "16px 0 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "var(--font-body)",
        fontSize: 11,
        color: "var(--ink-muted)",
        borderTop: "1px solid var(--border-subtle)",
        letterSpacing: "0.01em",
        zIndex: 5,
        background: "var(--ca-bg0s)",
      }}>
        <span>Cold Anvil. An idea is enough.</span>
        <span>Engineered by AI, imagined by humans.</span>
        <span>© 2026 Cold Anvil Studios</span>
      </div>
    </div>
  );
}

// v3 peek — oversized, no chrome, bleeds off both sides, fades on both
// edges. Sits BEHIND the letter (z-index lower) so the headline reads
// first. Width 1080 on a 1280 page = ~150px of bleed left, ~130px right.
// Mask gives a long left fade (so the peek emerges from beneath the
// letter) and a short right fade (so it slips off the screen edge).
function BleedPeek({ children }) {
  return (
    <div style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 620, // clear of the headline column; gentle fade still does the soft entry
      right: -180,
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
    }}>
      <div style={{
        width: "100%",
        height: 600,
        position: "relative",
        // The bleed/fade — long fade on the LEFT (so the peek emerges
        // from under the letter), shorter fade on the RIGHT (so it
        // slides off the screen edge). Top/bottom soft.
        maskImage: `linear-gradient(to right, transparent 0, #000 140px, #000 calc(100% - 100px), transparent 100%)`,
        WebkitMaskImage: `linear-gradient(to right, transparent 0, #000 140px, #000 calc(100% - 100px), transparent 100%)`,
      }}>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { WaitlistPageV3, BleedPeek });
