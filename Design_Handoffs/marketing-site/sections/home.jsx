// sections/home.jsx — Home page, two variants + mobile.
// A: editorial + live composer, seamless handoff (composer top of fold, workshop-window below the proof).
// B: workshop-window full-bleed photograph + scripted ambient composer, threshold handoff (a moment of crossing).

const { useState: mkUseState, useEffect: mkUseEffect } = React;

const {
  MkNav, MkWordmark, MkEyebrow, MkSectionHead, MkCard,
  MkLiveComposer, MkWorkshopWindow, MkNote, MkFooter, MkClaim
} = window;

// ── Shared: the "what Annie does for you" three-step strip ──
function MkThreeBeats({ tone = 'plain' }) {
  const beats = [
    { n: 'One', t: 'Tell her', b: "Type what's stuck in your head. A sentence is enough. Half-formed is welcome." },
    { n: 'Two',  t: 'Talk it out', b: 'Annie asks the right questions, pushes back where you\u2019re vague, commits to a direction you can feel.' },
    { n: 'Three', t: 'Watch it come in',  b: 'A real live site fills in while you watch. When you say it\u2019s ready, she publishes it.' },
  ];
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:40, columnGap:56}}>
      {beats.map((b, i) => (
        <div key={i} style={{display:'flex', flexDirection:'column', gap:10}}>
          <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:18, color:'var(--accent)', letterSpacing:'-0.005em'}}>{b.n}.</div>
          <div style={{fontFamily:'var(--font-display-b)', fontSize:28, color:'var(--cream)', letterSpacing:'-0.012em', lineHeight:1.18}}>{b.t}</div>
          <div style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink)', lineHeight:1.6, maxWidth:'30ch', marginTop:4}}>{b.b}</div>
        </div>
      ))}
    </div>
  );
}

// ── (removed: ledger component — user killed the "recent work" story until we have real users) ──

// ── Shared: beliefs row (trust strip, not feature chips) ──
function MkBelief({ kicker, line, body }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:10}}>
      <div className="wk-eyebrow" style={{color:'var(--ink-dim)'}}>{kicker}</div>
      <div style={{fontFamily:'var(--font-display-b)', fontSize:22, color:'var(--cream)', lineHeight:1.22, letterSpacing:'-0.01em'}}>{line}</div>
      <div style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.6, maxWidth:'34ch'}}>{body}</div>
    </div>
  );
}

// ── Home page frame (shared by both variants) ──
function MkHomeFrame({ children }) {
  return (
    <div className="mk-root" style={{position:'relative'}}>
      <div className="mk-scroll">
        <MkNav active="home"/>
        {children}
        <MkFooter/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT A — Editorial + Live composer.
// Hero is Annie speaking directly + the composer. The composer IS the proof.
// Workshop-window appears as an editorial plate after the first section —
// documentary, not hero. Handoff is seamless (no threshold moment).
// ═══════════════════════════════════════════════════════════════════════════
function MkHomeA() {
  return (
    <MkHomeFrame>
      {/* ── HERO ── */}
      <section style={{padding:'72px 56px 24px', maxWidth:1320, margin:'0 auto', position:'relative'}}>
        <div style={{display:'grid', gridTemplateColumns:'1.15fr 1fr', gap:72, alignItems:'start'}}>
          <div>
            <div className="wk-eyebrow" style={{color:'var(--ink-muted)', marginBottom:26}}>
              <span style={{color:'var(--accent)'}}>◇</span> &nbsp;Cold Anvil Studios &nbsp;·&nbsp; early access
            </div>
            <h1 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:76, lineHeight:1.02, letterSpacing:'-0.022em', color:'var(--cream)', margin:0, maxWidth:'14ch', textWrap:'balance'}}>
              You had an idea.<br/>
              <em style={{color:'var(--accent)', fontStyle:'italic'}}>Annie</em> will build it<br/>with you.
            </h1>
            <p style={{fontFamily:'var(--font-body-b)', fontSize:20, lineHeight:1.55, color:'var(--ink)', maxWidth:'44ch', marginTop:28, textWrap:'pretty'}}>
              A workshop of one, for half-formed ideas. Annie asks the right questions and hands you back a <MkClaim>real live site at a real URL</MkClaim>.
            </p>
            <div style={{marginTop:28, display:'flex', alignItems:'center', gap:22, color:'var(--ink-muted)', fontFamily:'var(--font-body-b)', fontSize:14}}>
              <span style={{display:'inline-flex', alignItems:'center', gap:8}}><span style={{width:6, height:6, borderRadius:'50%', background:'var(--secondary)'}}/> No credits. No token counter.</span>
              <span style={{width:1, height:14, background:'var(--border-subtle)'}}/>
              <span>Your files are yours. Always.</span>
            </div>
          </div>

          {/* COMPOSER — the signature lives right here, above the fold, on arrival */}
          <div style={{paddingTop:12, position:'relative'}}>
            <MkLiveComposer variant="full"/>
            <MkNote label="RATIONALE" style={{position:'absolute', right:-14, bottom:-92, maxWidth:300}}>
              The composer is the hero, not a feature. Type an idea on arrival → Annie replies right here, in-page. No redirect to a modal or a sign-up wall. This is the Live Hand.
            </MkNote>
          </div>
        </div>
      </section>

      {/* ── ANNIE'S VOICE ROW — margin voice, editorial feel ── */}
      <section style={{padding:'120px 56px 80px', maxWidth:1320, margin:'0 auto'}}>
        <MkEyebrow num="01">What happens when you hit Start</MkEyebrow>
        <div style={{display:'grid', gridTemplateColumns:'0.55fr 1fr', gap:64, alignItems:'start'}}>
          <div style={{position:'sticky', top:24}}>
            <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:24, color:'var(--accent)', lineHeight:1, marginBottom:18}}>a.</div>
            <div style={{fontFamily:'var(--font-display-b)', fontSize:34, color:'var(--cream)', lineHeight:1.18, letterSpacing:'-0.014em', textWrap:'balance'}}>
              A real conversation.<br/>Then a real thing.
            </div>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink-muted)', lineHeight:1.65, marginTop:18, maxWidth:'38ch'}}>
              No four-stage pipeline dressed up as a chat. Annie listens, commits, builds, and keeps building. You are the navigator. She drives.
            </div>
          </div>
          <MkThreeBeats/>
        </div>
      </section>

      {/* ── WORKSHOP WINDOW — documentary plate, NOT hero ── */}
      <section style={{padding:'40px 56px 80px', maxWidth:1320, margin:'0 auto'}}>
        <MkWorkshopWindow caption="Annie's bench. Where your idea gets thought about, argued with, and made." height={540}/>
        <MkNote label="WHY NOT HERO" style={{marginTop:20, maxWidth:520}}>
          A full-bleed workshop photograph is gorgeous but it gets in the way. Variant A treats the photo as evidence after the proof (the composer), not before. Variant B inverts this.
        </MkNote>
      </section>

      {/* ── THE SHAPE OF IT — section 2, using workshop-style pockets ── */}
      <section style={{padding:'80px 56px 120px', maxWidth:1320, margin:'0 auto'}}>
        <MkEyebrow num="02">What we believe</MkEyebrow>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:56}}>
          <MkBelief kicker="Depth, not credits" line="The subscription pays for Annie, not tokens." body="No burning credits to fix a mistake she made. Come back every day for a month, or once a quarter. Both are covered."/>
          <MkBelief kicker="Private by default" line="Your idea never leaves our machines." body="No cloud inference, no OpenAI, no Anthropic, no Google at build time. Arnor Gateway. Our own fleet."/>
          <MkBelief kicker="The exit door is open" line="Your files are yours, always." body="Download everything any time — code, content, docs. We'd rather earn the next visit than lock it."/>
        </div>
      </section>

      {/* ── THE REPRISE — second composer invitation, shorter, warmer ── */}
      <section style={{padding:'40px 56px 140px', maxWidth:1320, margin:'0 auto'}}>
        <div style={{borderTop:'1px solid var(--border-subtle)', paddingTop:72, display:'grid', gridTemplateColumns:'0.9fr 1.1fr', gap:72, alignItems:'start'}}>
          <div>
            <div className="wk-eyebrow" style={{color:'var(--ink-muted)', marginBottom:20}}>Still here?</div>
            <h2 style={{fontFamily:'var(--font-display-b)', fontSize:52, color:'var(--cream)', margin:0, letterSpacing:'-0.02em', lineHeight:1.08, textWrap:'balance'}}>
              Tell her the <em style={{color:'var(--accent)'}}>half-formed</em> one.<br/>She likes those best.
            </h2>
            <p style={{fontFamily:'var(--font-body-b)', fontSize:17, color:'var(--ink)', lineHeight:1.6, marginTop:24, maxWidth:'42ch'}}>
              If you've read this far, you already have one in mind. You've been thinking about it while doing the dishes. That one.
            </p>
          </div>
          <div>
            <MkLiveComposer variant="compact" defaultValue=""/>
          </div>
        </div>
      </section>
    </MkHomeFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT B — Workshop-window full-bleed hero + ambient scripted demo.
// The photo IS the hero. A single line of type sits inside it. The composer
// moves below the fold, paired with an AMBIENT, scripted demo that auto-plays
// (visitor sees Annie in flight with someone else before they join). Threshold
// handoff — there's a moment of crossing.
// ═══════════════════════════════════════════════════════════════════════════

// Ambient demo — a scripted, autoplaying tape of a prior conversation.
// Visitor watches Annie thinking before they type themselves. Feels like
// opening a shop door and seeing someone being served.
function MkAmbientTape() {
  const [i, setI] = mkUseState(0);
  const script = [
    { t: 'you', text: 'I want to make a way for our WhatsApp group to not lose track of who\u2019s hosting book club. It rotates but we forget.' },
    { t: 'annie', text: "Alright — so it's not just a calendar, it's the rotation itself that's the awkward bit. Who's already had their turn, whose turn is next. How often does the group swap — monthly? And is the host doing the choosing, or is that separate?" },
    { t: 'you', text: 'monthly. and host chooses the book yes.' },
    { t: 'annie', text: "Good. I'd build you a one-page site where the group sees three things — whose month it is, their chosen book, and the queue. Your group signs in with a link. No accounts. Ten minutes, then we look at it together." },
    { t: 'plan', text: '<em>I\u2019m going to build you a one-page site your WhatsApp group can bookmark, showing this month\u2019s host, their book, and the queue.</em>', stamp: 'the plan · accepted' },
  ];
  mkUseEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % (script.length + 1)), 3200);
    return () => clearInterval(id);
  }, []);
  const visible = script.slice(0, i);
  return (
    <div style={{border:'1px solid var(--border-subtle)', borderRadius:8, padding:'24px 28px', background:'var(--ca-bg1)', display:'flex', flexDirection:'column', gap:16, minHeight:360, position:'relative'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', color:'var(--ink-dim)', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', paddingBottom:12, borderBottom:'1px solid var(--border-subtle)'}}>
        <span>· demo · Book Club Queue · a first conversation</span>
        <span style={{display:'inline-flex', alignItems:'center', gap:6}}><span style={{width:6, height:6, borderRadius:'50%', background:'var(--secondary)', animation:'mkPulseCore 2.4s ease-in-out infinite'}}/> autoplay</span>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:14}}>
        {visible.map((m, j) => {
          if (m.t === 'you') {
            return (
              <div key={j} style={{display:'grid', gridTemplateColumns:'32px 1fr', gap:12, alignItems:'start'}}>
                <span style={{fontFamily:'var(--font-body-b)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ink-dim)', paddingTop:6}}>you</span>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink)', borderLeft:'1px solid var(--ink-dim)', paddingLeft:14, lineHeight:1.58}}>{m.text}</div>
              </div>
            );
          }
          if (m.t === 'annie') {
            return (
              <div key={j} style={{display:'grid', gridTemplateColumns:'32px 1fr', gap:12, alignItems:'start'}}>
                <span style={{width:22, height:22, border:'1px solid var(--accent)', borderRadius:'50%', display:'grid', placeItems:'center', color:'var(--accent)', fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:12, marginTop:3}}>A</span>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink-bright)', lineHeight:1.6}}>{m.text}</div>
              </div>
            );
          }
          if (m.t === 'plan') {
            return (
              <div key={j} style={{background:'var(--cream)', color:'var(--ca-bg0s)', padding:'18px 20px', borderRadius:6, marginTop:8, position:'relative'}}>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ca-bg3)', marginBottom:6}}>Annie's plan · accepted</div>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:15, lineHeight:1.5, fontWeight:450}} dangerouslySetInnerHTML={{__html: m.text}}/>
                <div style={{position:'absolute', right:16, bottom:10, fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', color:'var(--ca-bg3)', opacity:0.55, textTransform:'uppercase'}}>{m.stamp}</div>
              </div>
            );
          }
          return null;
        })}
        {i === script.length && <div style={{fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink-dim)', fontStyle:'italic', paddingTop:4}}>— replay restarts in a moment —</div>}
      </div>
    </div>
  );
}

function MkHomeB() {
  return (
    <MkHomeFrame>
      {/* ── HERO: full-bleed workshop window with type inside ── */}
      <section style={{position:'relative', padding:'0 0 0 0'}}>
        <div style={{position:'relative', height:720, overflow:'hidden'}}>
          {/* The window fills the hero */}
          <div style={{position:'absolute', inset:0}}>
            {/* Warm two-tone wash — the part the user likes */}
            <div style={{
              position:'absolute', inset:0,
              background: `
                radial-gradient(ellipse at 82% 55%, rgba(216,166,92,0.28), transparent 55%),
                radial-gradient(ellipse at 15% 28%, rgba(140,148,92,0.08), transparent 55%),
                linear-gradient(180deg, #1c1a19 0%, #262422 48%, #171615 100%)
              `,
            }}/>
            {/* Slight vignette toward the top-left so the headline gets air */}
            <div style={{
              position:'absolute', inset:0,
              background: 'radial-gradient(ellipse at 0% 0%, rgba(0,0,0,0.35), transparent 60%)',
            }}/>
            {/* Film grain */}
            <div style={{position:'absolute', inset:0, opacity:0.28, mixBlendMode:'overlay',
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.06 0 0 0 0.6 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
            }}/>
            {/* Base shelf — a single quiet horizon line, nothing more */}
            <div style={{position:'absolute', left:0, right:0, bottom:0, height:260, background:'linear-gradient(180deg, transparent, rgba(8,7,6,0.72) 60%, rgba(8,7,6,0.92) 100%)'}}/>
          </div>

          {/* Chrome sits on top */}
          <div style={{position:'relative', zIndex:2}}>
            <MkNav active="home" style={{background:'transparent', backdropFilter:'blur(6px)'}}/>
          </div>

          {/* Headline inside the window */}
          <div style={{position:'absolute', inset:0, zIndex:3, display:'flex', alignItems:'flex-end', padding:'0 56px 72px'}}>
            <div style={{maxWidth:920}}>
              <div className="wk-eyebrow" style={{color:'var(--accent)', marginBottom:18, letterSpacing:'0.22em'}}>
                · CA · MMXXVI · in the shop
              </div>
              <h1 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:96, lineHeight:0.98, letterSpacing:'-0.028em', color:'var(--cream)', margin:0, textWrap:'balance'}}>
                Bring the idea.<br/>
                Annie will do <em style={{color:'var(--accent)', fontStyle:'italic'}}>the rest</em>.
              </h1>
              <p style={{fontFamily:'var(--font-body-b)', fontSize:19, lineHeight:1.55, color:'var(--ink-bright)', maxWidth:'52ch', marginTop:26}}>
                A workshop of one, for non-technical founders with something half-formed. A real conversation. A real live site. A real URL, by the end of the afternoon.
              </p>
              <div style={{marginTop:32, display:'flex', alignItems:'center', gap:16}}>
                <button className="wk-btn wk-btn--primary" style={{fontSize:15, padding:'12px 22px'}}>Talk to Annie →</button>
                <button className="wk-btn" style={{fontSize:14, padding:'12px 18px', borderColor:'var(--ink-muted)'}}>Watch someone else first</button>
              </div>
            </div>
          </div>

          {/* Dimension tick — keeps documentary feel even though it's hero */}
          <div style={{position:'absolute', top:90, right:56, zIndex:4, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase'}}>
            Plate 01 · monday morning · placeholder frame
          </div>
        </div>
        <MkNote label="B'S TRADE-OFF" style={{margin:'28px 56px 0', maxWidth:560}}>
          The photo is the hero — immediate mood, slower proof. The composer is below the fold, preceded by an ambient scripted tape so visitors see Annie working before they type. Higher evocative ceiling; later payoff.
        </MkNote>
      </section>

      {/* ── AMBIENT COMPOSER + LIVE ONE side by side ── */}
      <section style={{padding:'120px 56px 80px', maxWidth:1320, margin:'0 auto'}}>
        <MkEyebrow num="01">A shift already in progress</MkEyebrow>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start', marginBottom:32}}>
          <div>
            <h2 style={{fontFamily:'var(--font-display-b)', fontSize:40, color:'var(--cream)', margin:0, letterSpacing:'-0.016em', lineHeight:1.14, textWrap:'balance'}}>
              Watch her think first.<br/>Then take her the one <em style={{color:'var(--accent)'}}>you brought</em>.
            </h2>
            <p style={{fontFamily:'var(--font-body-b)', fontSize:16, color:'var(--ink)', lineHeight:1.6, marginTop:18, maxWidth:'46ch'}}>
              Left: a demo of how a first conversation actually goes. Right: the composer — where your idea lands when you're ready.
            </p>
          </div>
          <div style={{display:'flex', alignItems:'flex-end', justifyContent:'flex-end'}}>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink-dim)', textAlign:'right', letterSpacing:'0.1em', textTransform:'uppercase'}}>
              Demo · Book Club Queue · a first conversation
            </div>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, alignItems:'start'}}>
          <MkAmbientTape/>
          <MkLiveComposer variant="full"/>
        </div>
        <MkNote label="HANDOFF" style={{marginTop:28, maxWidth:580}}>
          Variant B's handoff is a <em>threshold</em>: when the visitor hits Start, the page darkens slightly and a short phrase comes in from Annie ("Welcome to the workshop") before the workshop takes over. See the handoff artboard.
        </MkNote>
      </section>

      {/* ── BELIEFS (same shape, different rhythm) ── */}
      <section style={{padding:'80px 56px 100px', maxWidth:1320, margin:'0 auto'}}>
        <MkEyebrow num="02">What we believe</MkEyebrow>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:56}}>
          <MkBelief kicker="Depth, not credits" line="The subscription pays for Annie, not tokens." body="No burning credits to fix a mistake she made. Come back every day for a month, or once a quarter."/>
          <MkBelief kicker="Private by default" line="Your idea never leaves our machines." body="No cloud inference. Arnor Gateway. Our own fleet."/>
          <MkBelief kicker="The exit door is open" line="Your files are yours, always." body="Download everything any time. We'd rather earn the next visit than lock it."/>
        </div>
      </section>
    </MkHomeFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT C — B's gradient hero + A's composer in-hero + sticky pill.
// The synthesis: the warm two-tone wash from B carries the room/mood, but the
// composer sits right in the hero (A's move) so proof is immediate. A
// "Talk to Annie" pill anchors to the bottom of the viewport once the hero
// scrolls out — pattern lifted from the production site. Everything else
// (three beats, beliefs, reprise) follows A's rhythm since that's the
// structure the user knows.
// ═══════════════════════════════════════════════════════════════════════════
function MkHomeC() {
  const composerRef = React.useRef(null);
  const [pillVisible, setPillVisible] = mkUseState(false);

  mkUseEffect(() => {
    const target = composerRef.current;
    if (!target) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => setPillVisible(!e.isIntersecting)),
      { threshold: 0.15 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  function jumpToComposer() {
    const el = composerRef.current;
    if (!el) return;
    // Scroll the nearest scroll container (the mk-scroll in the artboard frame).
    const scroller = el.closest('.mk-scroll') || el.closest('.dc-card') || window;
    const targetTop = el.getBoundingClientRect().top;
    if (scroller === window) {
      window.scrollBy({ top: targetTop - 80, behavior: 'smooth' });
    } else {
      scroller.scrollBy({ top: targetTop - 80, behavior: 'smooth' });
    }
    // Focus the textarea after the scroll.
    setTimeout(() => {
      const ta = el.querySelector('textarea');
      if (ta) ta.focus();
    }, 400);
  }

  return (
    <MkHomeFrame>
      {/* ── HERO: B's gradient wash, with A's composer embedded on the right ── */}
      <section style={{position:'relative', padding:0}}>
        <div style={{position:'relative', minHeight:780, overflow:'hidden'}}>
          {/* The warm two-tone wash (lifted from B) */}
          <div style={{position:'absolute', inset:0}}>
            <div style={{
              position:'absolute', inset:0,
              background: `
                radial-gradient(ellipse at 82% 55%, rgba(216,166,92,0.28), transparent 55%),
                radial-gradient(ellipse at 15% 28%, rgba(140,148,92,0.08), transparent 55%),
                linear-gradient(180deg, #1c1a19 0%, #262422 48%, #171615 100%)
              `,
            }}/>
            <div style={{
              position:'absolute', inset:0,
              background: 'radial-gradient(ellipse at 0% 0%, rgba(0,0,0,0.35), transparent 60%)',
            }}/>
            {/* Film grain */}
            <div style={{position:'absolute', inset:0, opacity:0.28, mixBlendMode:'overlay',
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.06 0 0 0 0.6 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
            }}/>
            {/* Horizon fade to ground the composer side */}
            <div style={{position:'absolute', left:0, right:0, bottom:0, height:240, background:'linear-gradient(180deg, transparent, rgba(8,7,6,0.55) 70%, rgba(8,7,6,0.85) 100%)'}}/>
          </div>

          {/* Hero grid: type on the left, composer on the right */}
          <div style={{position:'relative', zIndex:3, padding:'80px 56px 96px', maxWidth:1320, margin:'0 auto'}}>
            <div style={{display:'grid', gridTemplateColumns:'1.05fr 1fr', gap:80, alignItems:'center', minHeight:560}}>
              <div>
                <div className="wk-eyebrow" style={{color:'var(--accent)', marginBottom:22, letterSpacing:'0.22em'}}>
                  · CA · MMXXVI · in the shop
                </div>
                <h1 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:84, lineHeight:1.0, letterSpacing:'-0.026em', color:'var(--cream)', margin:0, maxWidth:'13ch', textWrap:'balance'}}>
                  Bring the idea.<br/>
                  Annie will do <em style={{color:'var(--accent)', fontStyle:'italic'}}>the rest</em>.
                </h1>
                <p style={{fontFamily:'var(--font-body-b)', fontSize:19, lineHeight:1.55, color:'var(--ink-bright)', maxWidth:'46ch', marginTop:26, textWrap:'pretty'}}>
                  A workshop of one, for half-formed ideas. A real conversation, a <MkClaim>real live site at a real URL</MkClaim>, by the end of the afternoon.
                </p>
                <div style={{marginTop:30, display:'flex', alignItems:'center', gap:20, color:'var(--ink-muted)', fontFamily:'var(--font-body-b)', fontSize:14}}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:8}}><span style={{width:6, height:6, borderRadius:'50%', background:'var(--secondary)'}}/> No credits. No token counter.</span>
                  <span style={{width:1, height:14, background:'var(--border-subtle)'}}/>
                  <span>Your files are yours. Always.</span>
                </div>
              </div>

              {/* Composer — A's move, inside B's hero.
                  Wrapped in a dark glassy plate so it reads against the warm
                  gradient wash; the primitive stays transparent for other
                  backgrounds. */}
              <div ref={composerRef} style={{position:'relative'}}>
                <div style={{
                  background: 'rgba(12, 11, 10, 0.72)',
                  backdropFilter: 'blur(14px) saturate(1.05)',
                  WebkitBackdropFilter: 'blur(14px) saturate(1.05)',
                  border: '1px solid rgba(216, 166, 92, 0.18)',
                  borderRadius: 10,
                  padding: '4px',
                  boxShadow: '0 30px 80px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03)',
                }}>
                  <MkLiveComposer variant="full"/>
                </div>
                <MkNote label="C'S SYNTHESIS" style={{position:'absolute', right:-14, bottom:-100, maxWidth:300}}>
                  The mood of B (a workshop you can feel on arrival) plus the proof of A (compose here, get a reply here). The sticky pill at the bottom keeps the composer one tap away after scroll.
                </MkNote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANNIE'S VOICE ROW (same as A) ── */}
      <section style={{padding:'72px 56px 56px', maxWidth:1320, margin:'0 auto'}}>
        <MkEyebrow num="01">What happens when you hit Start</MkEyebrow>
        <div style={{display:'grid', gridTemplateColumns:'0.55fr 1fr', gap:64, alignItems:'start'}}>
          <div style={{position:'sticky', top:24}}>
            <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:24, color:'var(--accent)', lineHeight:1, marginBottom:18}}>a.</div>
            <div style={{fontFamily:'var(--font-display-b)', fontSize:34, color:'var(--cream)', lineHeight:1.18, letterSpacing:'-0.014em', textWrap:'balance'}}>
              A real conversation.<br/>Then a real thing.
            </div>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink-muted)', lineHeight:1.65, marginTop:18, maxWidth:'38ch'}}>
              No four-stage pipeline dressed up as a chat. Annie listens, commits, builds, and keeps building. You are the navigator. She drives.
            </div>
          </div>
          <MkThreeBeats/>
        </div>
      </section>

      {/* ── CREAM POCKET (contained) — a framed inset rather than a full-bleed
              break, so the dark editorial rhythm stays dominant and this
              reads as an aside, not a takeover. ── */}
      <section style={{padding:'40px 56px', maxWidth:1320, margin:'0 auto'}}>
        <div style={{background:'var(--cream)', color:'var(--ca-bg0s)', padding:'72px 72px', borderRadius:10, position:'relative', overflow:'hidden'}}>
          {/* Quiet folio mark in the corner to feel like a plate, not a billboard */}
          <div style={{position:'absolute', top:20, right:24, fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#9a8a60'}}>
            · a promise ·
          </div>
          <blockquote style={{fontFamily:'var(--font-display-b)', fontWeight:400, fontSize:72, lineHeight:1.04, letterSpacing:'-0.022em', color:'var(--ca-bg0s)', maxWidth:'16ch', textWrap:'balance', margin:0}}>
            An idea <em style={{color:'#7d5a22', fontStyle:'italic'}}>is enough</em>.
          </blockquote>
          <div style={{marginTop:36, paddingTop:20, borderTop:'1px solid #d9cb9e', maxWidth:560, display:'flex', justifyContent:'space-between', fontFamily:'var(--font-body-b)', fontSize:12, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.14em', color:'#5a524e'}}>
            <span>No code required</span>
            <span>No team to hire</span>
            <span>No briefs</span>
          </div>
        </div>
      </section>

      {/* ── LIVE REPLAY — lifted from B, but standalone: the composer already
              lives in the hero, so here the tape plays solo as documentary
              proof of Annie working with someone else. ── */}
      <section style={{padding:'56px 56px 80px', maxWidth:1320, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'0.9fr 1.4fr', gap:64, alignItems:'start', marginBottom:28}}>
          <div>
            <MkEyebrow num="02">Earlier today, at the bench</MkEyebrow>
            <h2 style={{fontFamily:'var(--font-display-b)', fontSize:38, color:'var(--cream)', margin:'12px 0 0', letterSpacing:'-0.016em', lineHeight:1.14, textWrap:'balance'}}>
              Someone's already in. Watch Annie <em style={{color:'var(--accent)'}}>at the bench</em>.
            </h2>
            <p style={{fontFamily:'var(--font-body-b)', fontSize:16, color:'var(--ink)', lineHeight:1.6, marginTop:18, maxWidth:'38ch'}}>
              A short demo of how a first conversation goes. Read it while you decide what yours is about.
            </p>
          </div>
          <MkAmbientTape/>
        </div>
      </section>

      {/* ── BELIEFS ── */}
      <section style={{padding:'80px 56px 120px', maxWidth:1320, margin:'0 auto'}}>
        <MkEyebrow num="02">What we believe</MkEyebrow>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:56}}>
          <MkBelief kicker="Depth, not credits" line="The subscription pays for Annie, not tokens." body="No burning credits to fix a mistake she made. Come back every day for a month, or once a quarter. Both are covered."/>
          <MkBelief kicker="Private by default" line="Your idea never leaves our machines." body="No cloud inference, no OpenAI, no Anthropic, no Google at build time. Arnor Gateway. Our own fleet."/>
          <MkBelief kicker="The exit door is open" line="Your files are yours, always." body="Download everything any time — code, content, docs. We'd rather earn the next visit than lock it."/>
        </div>
      </section>

      {/* ── MUSTARD MANIFESTO (contained) — an inset pocket, not a full-bleed
              takeover. Punctuation before the reprise. ── */}
      <section style={{padding:'20px 56px 40px', maxWidth:1320, margin:'0 auto'}}>
        <div style={{background:'var(--mustard)', color:'var(--ca-bg0s)', padding:'56px 72px', borderRadius:10, display:'grid', gridTemplateColumns:'1fr auto', alignItems:'baseline', gap:48}}>
          <blockquote style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:48, lineHeight:1.12, letterSpacing:'-0.016em', color:'var(--ca-bg0s)', maxWidth:'24ch', textWrap:'balance', margin:0}}>
            When output is cheap, <em style={{fontStyle:'italic'}}>quality</em> is the real work.
          </blockquote>
          <div style={{fontFamily:'var(--font-body-b)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--ca-bg0s)', opacity:0.65, whiteSpace:'nowrap'}}>
            — Cold Anvil
          </div>
        </div>
      </section>

      {/* ── REPRISE ── */}
      <section style={{padding:'56px 56px 180px', maxWidth:1320, margin:'0 auto'}}>
        <div style={{borderTop:'1px solid var(--border-subtle)', paddingTop:72, display:'grid', gridTemplateColumns:'0.9fr 1.1fr', gap:72, alignItems:'start'}}>
          <div>
            <div className="wk-eyebrow" style={{color:'var(--ink-muted)', marginBottom:20}}>Still here?</div>
            <h2 style={{fontFamily:'var(--font-display-b)', fontSize:52, color:'var(--cream)', margin:0, letterSpacing:'-0.02em', lineHeight:1.08, textWrap:'balance'}}>
              Tell her the <em style={{color:'var(--accent)'}}>half-formed</em> one.<br/>She likes those best.
            </h2>
            <p style={{fontFamily:'var(--font-body-b)', fontSize:17, color:'var(--ink)', lineHeight:1.6, marginTop:24, maxWidth:'42ch'}}>
              If you've read this far, you already have one in mind. You've been thinking about it while doing the dishes. That one.
            </p>
          </div>
          <div>
            <MkLiveComposer variant="compact" defaultValue=""/>
          </div>
        </div>
      </section>

      {/* ── STICKY "TALK TO ANNIE" PILL — reveals once hero composer scrolls out ── */}
      <div
        aria-hidden={!pillVisible}
        style={{
          position:'absolute',
          left:'50%',
          bottom:24,
          transform: `translate(-50%, ${pillVisible ? 0 : 24}px)`,
          opacity: pillVisible ? 1 : 0,
          pointerEvents: pillVisible ? 'auto' : 'none',
          transition: 'transform 380ms cubic-bezier(0.2,0.7,0.1,1), opacity 280ms ease',
          zIndex: 40,
          // The scroll container is `.mk-scroll`, which is position:relative in mk-root.
          // Positioning relative to the nearest positioned ancestor is fine —
          // but we want fixed-feeling behaviour within the artboard, so use
          // position:sticky-style via absolute + bottom on the scroll parent.
          // In the artboard this renders as a pill that follows the viewport of
          // the scroll card.
        }}
      >
        <div style={{
          display:'inline-flex', alignItems:'center', gap:16,
          padding:'10px 10px 10px 18px',
          background:'var(--cream)',
          borderRadius:999,
          boxShadow:'0 20px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(216,166,92,0.04)',
        }}>
          <span style={{display:'inline-flex', alignItems:'center', gap:10, fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ca-bg0s)', whiteSpace:'nowrap'}}>
            <span style={{width:7, height:7, borderRadius:'50%', background:'var(--secondary)', flexShrink:0}}/>
            Still here? Tell Annie what you're thinking.
          </span>
          <button
            type="button"
            onClick={jumpToComposer}
            style={{
              fontFamily:'var(--font-body-b)', fontSize:13, fontWeight:500,
              background:'var(--ca-bg0s)', color:'var(--cream)',
              border:'none', borderRadius:999,
              padding:'10px 16px',
              cursor:'pointer',
              display:'inline-flex', alignItems:'center', gap:6,
            }}
          >
            Talk to Annie <span style={{fontSize:11, opacity:0.75}}>↑</span>
          </button>
        </div>
      </div>
    </MkHomeFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE — Home A compressed to 390.
// ═══════════════════════════════════════════════════════════════════════════
function MkHomeAMobile() {
  return (
    <div className="mk-root" style={{fontSize:14}}>
      <div className="mk-scroll">
        {/* Mobile nav */}
        <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)'}}>
          <MkWordmark size={15}/>
          <button className="wk-btn wk-btn--primary wk-btn--sm" style={{fontSize:12, padding:'6px 12px'}}>Start</button>
        </nav>

        {/* Hero */}
        <section style={{padding:'40px 20px 20px'}}>
          <div className="wk-eyebrow" style={{color:'var(--ink-muted)', marginBottom:20}}>
            <span style={{color:'var(--accent)'}}>◇</span> &nbsp;Early access
          </div>
          <h1 style={{fontFamily:'var(--font-display-b)', fontSize:40, lineHeight:1.05, letterSpacing:'-0.02em', color:'var(--cream)', margin:0, fontWeight:500}}>
            You had an idea.<br/>
            <em style={{color:'var(--accent)', fontStyle:'italic'}}>Annie</em> will build it with you.
          </h1>
          <p style={{fontFamily:'var(--font-body-b)', fontSize:15, lineHeight:1.55, color:'var(--ink)', marginTop:18}}>
            Cold Anvil is a workshop, not a wizard. Bring the idea — half-formed is fine. Annie asks the right questions, makes the calls, hands you back a real live site at a real URL.
          </p>
        </section>

        {/* Composer */}
        <section style={{padding:'12px 20px 40px'}}>
          <MkLiveComposer variant="compact"/>
        </section>

        {/* Workshop window */}
        <section style={{padding:'20px 20px 40px'}}>
          <MkWorkshopWindow caption="Annie's bench." height={240}/>
        </section>

        {/* Three beats, stacked */}
        <section style={{padding:'20px 20px 40px', display:'flex', flexDirection:'column', gap:24}}>
          <MkEyebrow num="01">What happens</MkEyebrow>
          {[['One','Tell her.','A sentence is enough. Half-formed is welcome.'],
            ['Two','Talk it out.','Annie asks the right questions, commits to a direction.'],
            ['Three','Watch it come in.','A real live site fills in while you watch. She publishes it.']].map(([n,t,b],i)=>(
            <div key={i}>
              <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', color:'var(--accent)', fontSize:14}}>{n}.</div>
              <div style={{fontFamily:'var(--font-display-b)', fontSize:20, color:'var(--cream)', lineHeight:1.2, marginTop:4, letterSpacing:'-0.01em'}}>{t}</div>
              <div style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.55, marginTop:6}}>{b}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

Object.assign(window, { MkHomeA, MkHomeB, MkHomeC, MkHomeAMobile });
