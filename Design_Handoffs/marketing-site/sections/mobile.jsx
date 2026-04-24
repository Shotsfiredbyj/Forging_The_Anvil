// sections/mobile.jsx — 390px adaptations.
// Home C (canonical) and a waitlist-C mobile. Home C principles translated
// to mobile: gradient hero + composer in a glassy plate; contained cream
// pocket; documentary ambient tape as a single column; beliefs stack;
// contained mustard; reprise + sticky pill.

const { MkEyebrow, MkNote, MkFooter, MkAnnie, MkClaim, MkWorkshopWindow, MkLiveComposer, MkWordmark } = window;

function MkHomeAMobile() {
  return (
    <div className="mk-root" style={{width:390, margin:'0 auto', maxWidth:'100%'}}>
      <div className="mk-scroll">
        {/* Slim nav */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 20px', borderBottom:'1px solid var(--border-subtle)'}}>
          <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:18, color:'var(--cream)'}}>Cold Anvil</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', letterSpacing:'0.18em'}}>MENU</div>
        </div>

        {/* Hero — composer above the fold */}
        <section style={{padding:'40px 20px 56px'}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-dim)', letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:12}}>
            <span style={{color:'var(--accent)'}}>00</span> · Come in
          </div>
          <h1 style={{fontFamily:'var(--font-display-b)', fontSize:44, lineHeight:1.05, letterSpacing:'-0.022em', color:'var(--cream)', margin:0, maxWidth:'16ch', textWrap:'balance'}}>
            The idea you keep <em style={{color:'var(--accent)', fontStyle:'italic'}}>thinking about.</em> A Tuesday afternoon.
          </h1>
          <p style={{fontFamily:'var(--font-body-b)', fontSize:16, color:'var(--ink-bright)', lineHeight:1.55, marginTop:20}}>
            Cold Anvil is a bench where Annie — software you can talk to — turns a sentence into a working site while you watch.
          </p>

          {/* Live composer, fits at 390 */}
          <div style={{marginTop:24}}>
            <MkLiveComposer compact/>
          </div>
        </section>

        {/* Workshop band — narrow */}
        <section style={{padding:'0 20px 56px'}}>
          <MkWorkshopWindow height={320} caption="Annie's bench, quiet." compact/>
        </section>

        {/* Three beats, stacked */}
        <section style={{padding:'0 20px 72px'}}>
          <MkEyebrow num="02">How it goes</MkEyebrow>
          {[
            { n: 'One', t: 'Tell her', b: "Type what's stuck in your head. A sentence is enough." },
            { n: 'Two', t: 'Talk it out', b: "Annie asks the right questions and commits to a direction." },
            { n: 'Three', t: 'Watch it come in', b: "A real site fills in while you watch. She publishes when you say so." },
          ].map((b, i) => (
            <div key={i} style={{paddingTop:i ? 28 : 16, borderTop: i ? '1px solid var(--border-subtle)' : 'none', marginTop: i ? 28 : 0}}>
              <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:16, color:'var(--accent)'}}>{b.n}.</div>
              <div style={{fontFamily:'var(--font-display-b)', fontSize:26, color:'var(--cream)', letterSpacing:'-0.012em', marginTop:4}}>{b.t}</div>
              <div style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.6, marginTop:10}}>{b.b}</div>
            </div>
          ))}
        </section>

        {/* Cream pocket compressed */}
        <section style={{background:'var(--cream)', padding:'48px 24px', color:'var(--ca-bg0s)', margin:'0 20px', borderRadius:8}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ca-bg3)', letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:14}}>What we refuse to build</div>
          <h3 style={{fontFamily:'var(--font-display-b)', fontSize:28, color:'var(--ca-bg0s)', letterSpacing:'-0.014em', lineHeight:1.2, margin:0, maxWidth:'18ch'}}>
            No cascades. No credit counters. No file trees.
          </h3>
          <p style={{fontFamily:'var(--font-body-b)', fontSize:14, lineHeight:1.65, marginTop:18, color:'var(--ca-bg0s)'}}>
            You meet Annie, she builds, you ship. The plumbing never shows up in the room.
          </p>
        </section>

        {/* Closer */}
        <section style={{padding:'64px 20px 56px'}}>
          <p style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:26, color:'var(--cream)', lineHeight:1.25, letterSpacing:'-0.012em', margin:0, maxWidth:'22ch'}}>
            Something you've been thinking about? Start by telling Annie.
          </p>
          <button className="wk-btn wk-btn--primary" style={{marginTop:24, fontSize:15, padding:'14px 22px'}}>Talk to Annie →</button>
        </section>

        <MkFooter minimal/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WAITLIST — MOBILE (canonical, mirrors Waitlist C)
// The teaser doesn't tilt on mobile — it sits upright between form and
// footer as a contained preview frame (same move the live site makes).
// ═══════════════════════════════════════════════════════════════════════════
function MkWaitlistMobile() {
  const [submitted, setSubmitted] = React.useState(false);
  const [email, setEmail] = React.useState('');
  return (
    <div className="mk-root">
      <div className="mk-scroll">
        {/* Slim wordmark row */}
        <div style={{padding:'22px 20px', display:'flex', alignItems:'baseline', gap:10}}>
          <MkWordmark size={15}/>
        </div>

        <section style={{padding:'32px 20px 36px'}}>
          <div className="wk-eyebrow" style={{color:'var(--accent)', letterSpacing:'0.22em', marginBottom:16, fontSize:10}}>
            · A peek inside the workshop ·
          </div>
          <h1 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:46, lineHeight:1.02, letterSpacing:'-0.024em', color:'var(--cream)', margin:0, textWrap:'balance'}}>
            Annie's workshop opens <em style={{color:'var(--accent)', fontStyle:'italic'}}>soon</em>.
          </h1>
          <p style={{fontFamily:'var(--font-body-b)', fontSize:17, color:'var(--ink-bright)', lineHeight:1.45, marginTop:18}}>
            Product development, for anyone with an idea.
          </p>
          <p style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.6, marginTop:14}}>
            Annie is our product engineer. She builds the thing you've been meaning to build — clickable by the end of the day. We're putting the finishing touches to her workshop.
          </p>

          {/* Glassy email plate */}
          <div style={{marginTop:26, background:'rgba(12, 11, 10, 0.55)', backdropFilter:'blur(10px) saturate(1.05)', WebkitBackdropFilter:'blur(10px) saturate(1.05)', border:'1px solid rgba(216, 166, 92, 0.16)', borderRadius:10, padding:14}}>
            {!submitted ? (
              <>
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      background:'transparent', border:'1px solid var(--border-subtle)',
                      borderRadius:6, padding:'12px 14px',
                      fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--cream)', outline:'none',
                    }}
                  />
                  <button
                    onClick={() => { if (email) setSubmitted(true); }}
                    className="wk-btn wk-btn--primary"
                    style={{fontSize:13, padding:'11px 18px', justifyContent:'center'}}
                  >
                    Get on the list →
                  </button>
                </div>
                <div style={{fontFamily:'var(--font-body-b)', fontStyle:'italic', fontSize:11, color:'var(--ink-muted)', lineHeight:1.5, marginTop:10}}>
                  When Annie's ready, you'll be one of the first to meet her. No newsletters. No noise.
                </div>
              </>
            ) : (
              <div style={{padding:'4px 2px'}}>
                <div style={{fontFamily:'var(--font-display-b)', fontSize:15, color:'var(--cream)', lineHeight:1.4}}>
                  Thanks — you're on the list.
                </div>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink-muted)', marginTop:4}}>
                  We'll be in touch when Annie's ready.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Contained teaser — upright between form and footer */}
        <section style={{padding:'16px 20px 40px'}}>
          <div className="wk-eyebrow" style={{color:'var(--ink-muted)', marginBottom:12, fontSize:10}}>A peek inside the workshop</div>
          <div style={{filter:'drop-shadow(0 20px 40px rgba(0,0,0,0.4))'}}>
            <window.WorkshopTeaser/>
          </div>
          <div style={{fontFamily:'var(--font-body-b)', fontStyle:'italic', fontSize:12, color:'var(--ink-muted)', lineHeight:1.55, marginTop:14}}>
            This is the bench. When it's your turn, Annie will be here.
          </div>
        </section>

        {/* Slim footer row */}
        <div style={{padding:'20px 20px 32px', borderTop:'1px solid var(--border-subtle)', display:'flex', flexDirection:'column', gap:6, fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-muted)'}}>
          <span style={{color:'var(--cream)', fontFamily:'var(--font-display-b)', fontStyle:'italic'}}>An idea <em style={{color:'var(--accent)'}}>is enough</em>.</span>
          <span>Built with AI, imagined by humans.</span>
          <span>© 2026 Cold Anvil Studios</span>
        </div>
      </div>
    </div>
  );
}

// Alias so the canvas' old MkWaitlist ref resolves to Variant C (canonical).
Object.assign(window, { MkHomeAMobile, MkWaitlistMobile, MkWaitlist: window.MkWaitlistC });

// ══════════════════════════════════════════════════════════════════════════
// HOME C — MOBILE (canonical)
// The home-C principles ported to 390px. Rhythm preserved: gradient hero
// w/ glassy composer plate → contained cream pocket → documentary ambient
// tape (single column) → beliefs stacked → contained mustard → reprise →
// sticky pill at the bottom of the scroll.
// ══════════════════════════════════════════════════════════════════════════
function MkHomeCMobile() {
  const composerRef = React.useRef(null);
  const [pillVisible, setPillVisible] = React.useState(false);

  React.useEffect(() => {
    const target = composerRef.current;
    if (!target) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => setPillVisible(!e.isIntersecting)),
      { threshold: 0.1 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  function jumpToComposer() {
    const el = composerRef.current;
    if (!el) return;
    const scroller = el.closest('.mk-scroll') || el.closest('.dc-card') || window;
    const targetTop = el.getBoundingClientRect().top;
    if (scroller === window) window.scrollBy({ top: targetTop - 40, behavior: 'smooth' });
    else scroller.scrollBy({ top: targetTop - 40, behavior: 'smooth' });
    setTimeout(() => { const ta = el.querySelector('textarea'); if (ta) ta.focus(); }, 400);
  }

  return (
    <div className="mk-root" style={{position:'relative'}}>
      <div className="mk-scroll">
        {/* Slim mobile nav */}
        <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)'}}>
          <MkWordmark size={15}/>
          <button className="wk-btn wk-btn--primary wk-btn--sm" style={{fontSize:12, padding:'6px 12px'}}>Start</button>
        </nav>

        {/* ── HERO — gradient wash + composer in a glassy plate ── */}
        <section style={{position:'relative', overflow:'hidden', padding:'0', minHeight:720}}>
          {/* Warm two-tone wash (same recipe as C's desktop hero) */}
          <div style={{position:'absolute', inset:0}}>
            <div style={{
              position:'absolute', inset:0,
              background: `
                radial-gradient(ellipse at 78% 65%, rgba(216,166,92,0.32), transparent 55%),
                radial-gradient(ellipse at 10% 20%, rgba(140,148,92,0.08), transparent 55%),
                linear-gradient(180deg, #1c1a19 0%, #262422 48%, #171615 100%)
              `,
            }}/>
            <div style={{position:'absolute', inset:0, opacity:0.22, mixBlendMode:'overlay',
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.06 0 0 0 0.6 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
            }}/>
            <div style={{position:'absolute', left:0, right:0, bottom:0, height:200, background:'linear-gradient(180deg, transparent, rgba(8,7,6,0.55) 70%, rgba(8,7,6,0.88) 100%)'}}/>
          </div>

          <div style={{position:'relative', zIndex:3, padding:'44px 20px 56px'}}>
            <div className="wk-eyebrow" style={{color:'var(--accent)', marginBottom:18, letterSpacing:'0.22em', fontSize:10}}>
              · CA · MMXXVI · in the shop
            </div>
            <h1 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:46, lineHeight:1.02, letterSpacing:'-0.024em', color:'var(--cream)', margin:0, textWrap:'balance'}}>
              Bring the idea.<br/>
              Annie will do <em style={{color:'var(--accent)', fontStyle:'italic'}}>the rest</em>.
            </h1>
            <p style={{fontFamily:'var(--font-body-b)', fontSize:15, lineHeight:1.55, color:'var(--ink-bright)', marginTop:20, textWrap:'pretty'}}>
              A workshop of one, for half-formed ideas. A real conversation, a <MkClaim>real live site at a real URL</MkClaim>, by the end of the afternoon.
            </p>
            <div style={{marginTop:18, display:'flex', alignItems:'center', gap:10, color:'var(--ink-muted)', fontFamily:'var(--font-body-b)', fontSize:12, flexWrap:'wrap'}}>
              <span style={{display:'inline-flex', alignItems:'center', gap:6}}><span style={{width:5, height:5, borderRadius:'50%', background:'var(--secondary)'}}/> No credits. No token counter.</span>
              <span style={{width:1, height:10, background:'var(--border-subtle)'}}/>
              <span>Your files are yours.</span>
            </div>

            {/* Composer in a glassy plate — same move as desktop */}
            <div ref={composerRef} style={{marginTop:28, position:'relative'}}>
              <div style={{
                background: 'rgba(12, 11, 10, 0.72)',
                backdropFilter: 'blur(14px) saturate(1.05)',
                WebkitBackdropFilter: 'blur(14px) saturate(1.05)',
                border: '1px solid rgba(216, 166, 92, 0.18)',
                borderRadius: 10,
                padding: 4,
                boxShadow: '0 24px 60px -24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03)',
              }}>
                <MkLiveComposer variant="compact"/>
              </div>
            </div>
          </div>
        </section>

        {/* ── Three beats (stacked) ── */}
        <section style={{padding:'48px 20px 32px'}}>
          <MkEyebrow num="01">What happens when you hit Start</MkEyebrow>
          <div style={{display:'flex', flexDirection:'column', gap:24, marginTop:8}}>
            {[
              ['One', 'Tell her.', "Type what's stuck in your head. A sentence is enough. Half-formed is welcome."],
              ['Two', 'Talk it out.', "Annie asks the right questions and commits to a direction you've both agreed on."],
              ['Three', 'Watch it come in.', "A real site fills in while you watch. She publishes when you say so."],
            ].map(([n,t,b],i) => (
              <div key={i}>
                <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', color:'var(--accent)', fontSize:14}}>{n}.</div>
                <div style={{fontFamily:'var(--font-display-b)', fontSize:22, color:'var(--cream)', lineHeight:1.2, marginTop:4, letterSpacing:'-0.012em'}}>{t}</div>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.6, marginTop:6}}>{b}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CREAM POCKET — contained (matches desktop C) ── */}
        <section style={{padding:'24px 20px'}}>
          <div style={{background:'var(--cream)', color:'var(--ca-bg0s)', padding:'48px 28px', borderRadius:10, position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', top:14, right:16, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'#9a8a60'}}>
              · a promise ·
            </div>
            <blockquote style={{fontFamily:'var(--font-display-b)', fontWeight:400, fontSize:44, lineHeight:1.04, letterSpacing:'-0.022em', color:'var(--ca-bg0s)', maxWidth:'12ch', textWrap:'balance', margin:0}}>
              An idea <em style={{color:'#7d5a22', fontStyle:'italic'}}>is enough</em>.
            </blockquote>
            <div style={{marginTop:28, paddingTop:14, borderTop:'1px solid #d9cb9e', display:'flex', flexWrap:'wrap', gap:'6px 16px', fontFamily:'var(--font-body-b)', fontSize:10, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.14em', color:'#5a524e'}}>
              <span>No code required</span>
              <span>No team to hire</span>
              <span>No briefs</span>
            </div>
          </div>
        </section>

        {/* ── Ambient tape — single-column, documentary ── */}
        <section style={{padding:'40px 20px 24px'}}>
          <MkEyebrow num="02">Earlier today, at the bench</MkEyebrow>
          <h2 style={{fontFamily:'var(--font-display-b)', fontSize:28, color:'var(--cream)', margin:'10px 0 0', letterSpacing:'-0.014em', lineHeight:1.14, textWrap:'balance'}}>
            Someone's already in.<br/>Watch Annie <em style={{color:'var(--accent)'}}>at the bench</em>.
          </h2>
          <p style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.6, marginTop:14}}>
            A short demo of how a first conversation goes. Read it while you decide what yours is about.
          </p>
          <div style={{marginTop:22}}>
            <MkMobileAmbientTape/>
          </div>
        </section>

        {/* ── Beliefs ── */}
        <section style={{padding:'48px 20px 24px'}}>
          <MkEyebrow num="03">What we believe</MkEyebrow>
          <div style={{display:'flex', flexDirection:'column', gap:28, marginTop:8}}>
            {[
              ['Depth, not credits.', 'The subscription pays for Annie, not tokens.', "No burning credits to fix a mistake she made. Come back every day for a month, or once a quarter. Both are covered."],
              ['Private by default.', 'Your idea never leaves our machines.', "No cloud inference, no OpenAI, no Anthropic, no Google at build time. Arnor Gateway. Our own fleet."],
              ['The exit door is open.', 'Your files are yours, always.', "Download everything any time — code, content, docs. We'd rather earn the next visit than lock it."],
            ].map(([k, l, b], i) => (
              <div key={i}>
                <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-muted)', marginBottom:8}}>{k}</div>
                <div style={{fontFamily:'var(--font-display-b)', fontSize:20, color:'var(--cream)', lineHeight:1.2, letterSpacing:'-0.01em'}}>{l}</div>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.6, marginTop:8}}>{b}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MUSTARD POCKET — contained (matches desktop C) ── */}
        <section style={{padding:'24px 20px'}}>
          <div style={{background:'var(--mustard)', color:'var(--ca-bg0s)', padding:'36px 28px', borderRadius:10}}>
            <blockquote style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:28, lineHeight:1.14, letterSpacing:'-0.014em', color:'var(--ca-bg0s)', textWrap:'balance', margin:0}}>
              When output is cheap, <em style={{fontStyle:'italic'}}>quality</em> is the real work.
            </blockquote>
            <div style={{marginTop:18, paddingTop:14, borderTop:'1px solid rgba(35,25,15,0.25)', fontFamily:'var(--font-body-b)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.18em', color:'var(--ca-bg0s)', opacity:0.7}}>
              — Cold Anvil
            </div>
          </div>
        </section>

        {/* ── Reprise ── */}
        <section style={{padding:'48px 20px 120px'}}>
          <div style={{borderTop:'1px solid var(--border-subtle)', paddingTop:40}}>
            <div className="wk-eyebrow" style={{color:'var(--ink-muted)', marginBottom:14}}>Still here?</div>
            <h2 style={{fontFamily:'var(--font-display-b)', fontSize:34, color:'var(--cream)', margin:0, letterSpacing:'-0.018em', lineHeight:1.08, textWrap:'balance'}}>
              Tell her the <em style={{color:'var(--accent)'}}>half-formed</em> one. She likes those best.
            </h2>
            <p style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.6, marginTop:16}}>
              If you've read this far, you already have one in mind. That one.
            </p>
            <div style={{marginTop:22}}>
              <MkLiveComposer variant="compact"/>
            </div>
          </div>
        </section>

        <MkFooter minimal/>
      </div>

      {/* ── Sticky pill (reveals when hero composer scrolls out) ── */}
      <div
        aria-hidden={!pillVisible}
        style={{
          position:'absolute',
          left:'50%',
          bottom:16,
          transform: `translate(-50%, ${pillVisible ? 0 : 24}px)`,
          opacity: pillVisible ? 1 : 0,
          pointerEvents: pillVisible ? 'auto' : 'none',
          transition: 'transform 380ms cubic-bezier(0.2,0.7,0.1,1), opacity 280ms ease',
          zIndex: 40,
          width: 'calc(100% - 32px)',
          maxWidth: 360,
        }}
      >
        <button
          type="button"
          onClick={jumpToComposer}
          style={{
            width:'100%',
            display:'inline-flex', alignItems:'center', justifyContent:'space-between', gap:12,
            padding:'12px 16px',
            background:'var(--cream)',
            color:'var(--ca-bg0s)',
            border:'none', borderRadius:999, cursor:'pointer',
            boxShadow:'0 20px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(216,166,92,0.04)',
            fontFamily:'var(--font-body-b)', fontSize:13,
          }}
        >
          <span style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <span style={{width:6, height:6, borderRadius:'50%', background:'var(--secondary)', flexShrink:0}}/>
            Tell Annie what you're thinking
          </span>
          <span style={{fontSize:11, opacity:0.75}}>↑</span>
        </button>
      </div>
    </div>
  );
}

// A compact, single-column version of MkAmbientTape — same script, smaller type.
function MkMobileAmbientTape() {
  const [i, setI] = React.useState(0);
  const script = [
    { t: 'you',   text: 'I want to make a way for our WhatsApp group to not lose track of who’s hosting book club. It rotates but we forget.' },
    { t: 'annie', text: "Alright — so it's not just a calendar, it's the rotation itself that's the awkward bit. Who's already had their turn, whose turn is next. How often does the group swap — monthly? And is the host doing the choosing, or is that separate?" },
    { t: 'you',   text: 'monthly. and host chooses the book yes.' },
    { t: 'annie', text: "Good. I'd build you a one-page site where the group sees three things — whose month it is, their chosen book, and the queue. Your group signs in with a link. No accounts. Ten minutes, then we look at it together." },
    { t: 'plan',  text: '<em>I’m going to build you a one-page site your WhatsApp group can bookmark, showing this month’s host, their book, and the queue.</em>', stamp: 'the plan · accepted' },
  ];
  React.useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % (script.length + 1)), 3200);
    return () => clearInterval(id);
  }, []);
  const visible = script.slice(0, i);
  return (
    <div style={{border:'1px solid var(--border-subtle)', borderRadius:8, padding:'18px 18px', background:'var(--ca-bg1)', display:'flex', flexDirection:'column', gap:14, minHeight:320}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', color:'var(--ink-dim)', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', paddingBottom:8, borderBottom:'1px solid var(--border-subtle)'}}>
        <span>· Book Club Queue</span>
        <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:5, height:5, borderRadius:'50%', background:'var(--secondary)', animation:'mkPulseCore 2.4s ease-in-out infinite'}}/> autoplay</span>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {visible.map((m, j) => {
          if (m.t === 'you') {
            return (
              <div key={j}>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ink-dim)', marginBottom:4}}>you</div>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink)', borderLeft:'1px solid var(--ink-dim)', paddingLeft:12, lineHeight:1.55}}>{m.text}</div>
              </div>
            );
          }
          if (m.t === 'annie') {
            return (
              <div key={j} style={{display:'grid', gridTemplateColumns:'22px 1fr', gap:10, alignItems:'start'}}>
                <span style={{width:20, height:20, border:'1px solid var(--accent)', borderRadius:'50%', display:'grid', placeItems:'center', color:'var(--accent)', fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:11, marginTop:2}}>A</span>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink-bright)', lineHeight:1.55}}>{m.text}</div>
              </div>
            );
          }
          if (m.t === 'plan') {
            return (
              <div key={j} style={{background:'var(--cream)', color:'var(--ca-bg0s)', padding:'14px 16px', borderRadius:6, marginTop:4, position:'relative'}}>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ca-bg3)', marginBottom:4}}>Annie's plan · accepted</div>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:13, lineHeight:1.5, fontWeight:450}} dangerouslySetInnerHTML={{__html: m.text}}/>
              </div>
            );
          }
          return null;
        })}
        {i === script.length && <div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-dim)', fontStyle:'italic', paddingTop:2}}>— replay restarts in a moment —</div>}
      </div>
    </div>
  );
}

Object.assign(window, { MkHomeCMobile });
