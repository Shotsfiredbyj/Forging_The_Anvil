// sections/motion.jsx — motion language for the marketing site.

const { MkEyebrow, MkNote } = window;

function MotionRow({ name, from, when, where, body }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'auto 1.3fr 2.4fr', gap:24, alignItems:'start', padding:'22px 0', borderTop:'1px solid var(--border-subtle)'}}>
      <div style={{minWidth:120}}>
        <div style={{fontFamily:'var(--font-mono)', fontSize:10, color: from === 'NEW' ? 'var(--accent)' : 'var(--ink-dim)', letterSpacing:'0.14em', marginBottom:6}}>{from}</div>
        <div style={{fontFamily:'var(--font-display-b)', fontSize:22, color:'var(--cream)', letterSpacing:'-0.01em'}}>{name}</div>
      </div>
      <div>
        <div className="wk-eyebrow" style={{color:'var(--ink-muted)', marginBottom:6}}>When</div>
        <div style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink)', lineHeight:1.55}}>{when}</div>
        <div className="wk-eyebrow" style={{color:'var(--ink-muted)', marginBottom:6, marginTop:12}}>Where on marketing</div>
        <div style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink)', lineHeight:1.55}}>{where}</div>
      </div>
      <div style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink-bright)', lineHeight:1.65}}>{body}</div>
    </div>
  );
}

function MkMotion() {
  return (
    <div style={{padding:36, background:'var(--bg)', minHeight:'100%'}}>
      <MkEyebrow num="09">Motion on marketing</MkEyebrow>
      <h2 style={{fontFamily:'var(--font-display-b)', fontSize:36, color:'var(--cream)', margin:'0 0 10px', letterSpacing:'-0.016em', lineHeight:1.15, maxWidth:'28ch'}}>
        Five gestures inherited from the workshop, plus one new sibling.
      </h2>
      <p style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink)', lineHeight:1.6, maxWidth:'70ch', marginBottom:12}}>
        Marketing uses four of the workshop's five motion tokens verbatim. The fifth — <em style={{color:'var(--cream)'}}>draw</em> — is marketing-only, reserved for editorial rule lines that stroke in as they scroll into view.
      </p>

      <div style={{marginTop:16}}>
        <MotionRow
          from="INHERITED"
          name="arrive"
          when="Page mounts."
          where="All pages' first fold. Composer on home."
          body="200ms ease-out, 8px y-offset. Everything above the fold rises together. No stagger. The cream elements (nav, headline) arrive a frame before the body copy."
        />
        <MotionRow
          from="INHERITED"
          name="settle"
          when="After a user action completes (e.g. email submitted)."
          body="280ms ease-in-out. A slight downward easing before resting. The waitlist success state uses this — the form line strikes through, Annie's reply fades in, everything settles."
          where="Waitlist success, pricing plan selection."
        />
        <MotionRow
          from="INHERITED"
          name="warm"
          when="Hover on interactive text."
          where="Nav links, inline CTAs, 'choose this plan' buttons."
          body="120ms ease-out. Color shifts toward cream or accent. No movement, no scale. The site doesn't bounce."
        />
        <MotionRow
          from="INHERITED"
          name="point"
          when="A small indicator needs to draw the eye to one thing."
          where="Composer's caret · pricing 'the one most people want' tag."
          body="600ms cubic-bezier. A single, slow pulse of the accent mustard. Never loops. Used sparingly: only to mark what matters this moment."
        />
        <MotionRow
          from="INHERITED"
          name="emerge"
          when="The handoff — marketing → workshop."
          where="Home A (seamless) · Home B (threshold)."
          body="1.6s total. Background warms, the phrase surfaces, the workshop chrome materialises under the conversation. See the Handoff filmstrip."
        />
        <MotionRow
          from="NEW"
          name="draw"
          when="Editorial rule line enters the viewport."
          where="Chapter separators on About, section dividers on Home B, the kerned rule under the hero headline."
          body="420ms cubic-bezier(0.2, 0.9, 0.1, 1). The line strokes from left to right as its section comes into view. Only used on a single line per section; overuse would read as flourish. Respects prefers-reduced-motion: the rule just fades."
        />
      </div>

      <MkNote label="REDUCED MOTION" style={{marginTop:28, maxWidth:840}}>
        All six are wrapped in @media (prefers-reduced-motion: reduce) — movement is replaced with a 200ms opacity fade. Nothing is so structural that removing the motion breaks meaning. That's the test for whether we can ship a gesture.
      </MkNote>
    </div>
  );
}

Object.assign(window, { MkMotion });
