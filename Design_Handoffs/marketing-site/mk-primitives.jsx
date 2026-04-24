// mk-primitives.jsx — marketing-specific atoms.
// Inherits from workshop's wk-* classes via tokens.css where possible.
// Class names are mk-* so they never collide with wk-* or dc-*.

const { useState: mkUseState, useEffect: mkUseEffect, useRef: mkUseRef } = React;

// ── Cold Anvil wordmark (matches the live site's anvil mark, editorial Newsreader) ──
const MkAnvil = ({size=22, style}) => (
  <svg viewBox="0 0 256 256" width={size} height={size} fill="currentColor" aria-hidden="true" style={style}>
    <path d="M128 129.09V232a8 8 0 0 1-3.84-1l-88-48.16a8 8 0 0 1-4.16-7V80.2a8 8 0 0 1 .7-3.27Z" opacity=".2"/>
    <path d="m223.68 66.15l-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 32l80.34 44L128 120L47.66 76ZM40 90l80 43.78v85.79l-80-43.75Zm96 129.57v-85.75L216 90v85.78Z"/>
  </svg>
);

const MkWordmark = ({size=18, tone='default'}) => (
  <span style={{display:'inline-flex', alignItems:'center', gap:10, color: tone==='accent' ? 'var(--accent)' : 'var(--cream)', fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:size, letterSpacing:'-0.01em', lineHeight:1}}>
    <MkAnvil size={Math.round(size*1.1)}/>
    <span>Cold Anvil<em style={{color:'var(--ink-muted)', fontStyle:'italic', fontWeight:400, marginLeft:5, fontSize:size*0.88}}>Studios</em></span>
  </span>
);

// ── Nav (marketing) ──
// Horizontal bar; wordmark left, "Annie is in early access" pill, links right, one mustard CTA.
function MkNav({ active = 'home', onComposerJump }) {
  const items = [
    ['home', 'Home', '#'],
    ['about', 'About', '#'],
    ['pricing', 'Pricing', '#'],
  ];
  return (
    <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 48px', borderBottom:'1px solid var(--border-subtle)'}}>
      <div style={{display:'flex', alignItems:'center', gap:24}}>
        <MkWordmark size={19}/>
        <span style={{display:'inline-flex', alignItems:'center', gap:8, borderLeft:'1px solid var(--border-subtle)', paddingLeft:20, color:'var(--ink-muted)', fontFamily:'var(--font-body-b)', fontSize:12, fontWeight:400, letterSpacing:'0.01em', lineHeight:1, whiteSpace:'nowrap'}}>
          <span style={{width:7, height:7, borderRadius:'50%', background:'var(--secondary)', boxShadow:'0 0 0 4px rgba(140,148,92,0.08)'}}/>
          Annie is in early access
        </span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:28, fontFamily:'var(--font-body-b)', fontSize:14, fontWeight:500}}>
        {items.map(([id, label]) => (
          <a key={id} href="#" onClick={e=>e.preventDefault()} style={{color: active===id ? 'var(--cream)' : 'var(--ink-muted)', textDecoration:'none', letterSpacing:'-0.003em'}}>{label}</a>
        ))}
        <button onClick={onComposerJump} className="wk-btn wk-btn--primary wk-btn--sm" style={{marginLeft:8}}>Early access</button>
      </div>
    </nav>
  );
}

// ── Section eyebrow + rule ──
function MkEyebrow({ num, children }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:24}}>
      {num && <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)', letterSpacing:'0.04em'}}>{num}</span>}
      <span className="wk-eyebrow" style={{color:'var(--ink-muted)'}}>{children}</span>
      <span style={{flex:1, height:1, background:'linear-gradient(to right, var(--border-subtle), transparent)'}}/>
    </div>
  );
}

// ── Section head (h2 + body): single block, generous measure ──
function MkSectionHead({ eyebrow, title, body, right }) {
  return (
    <div style={{display:'grid', gridTemplateColumns: right ? '1.1fr 0.9fr' : '1fr', columnGap:64, alignItems:'start', marginBottom:56, maxWidth:1120}}>
      <div>
        {eyebrow && <div className="wk-eyebrow" style={{color:'var(--ink-muted)', marginBottom:18}}>{eyebrow}</div>}
        <h2 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:44, lineHeight:1.12, letterSpacing:'-0.018em', color:'var(--cream)', margin:0, maxWidth:'22ch', textWrap:'balance'}} dangerouslySetInnerHTML={{__html: title}}/>
        {body && !right && <p style={{fontFamily:'var(--font-body-b)', fontSize:17, lineHeight:1.6, color:'var(--ink)', maxWidth:'56ch', marginTop:22}}>{body}</p>}
      </div>
      {right && <div style={{fontFamily:'var(--font-body-b)', fontSize:17, lineHeight:1.6, color:'var(--ink)', maxWidth:'52ch', marginTop:8}}>{right}</div>}
    </div>
  );
}

// ── Outlined card (marketing) ──
function MkCard({ children, accent=false, style }) {
  return (
    <div style={{border:`1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`, borderRadius:8, padding:32, background:'transparent', ...style}}>
      {children}
    </div>
  );
}

// ── The Live Composer — the signature.
// A real textarea wired to window.claude.complete. Annie's reply appears inline
// under the composer. No modal. No redirect. The experience is the sell.
function MkLiveComposer({ variant = 'full', onSubmit, defaultValue = '', style }) {
  const [value, setValue] = mkUseState(defaultValue);
  const [state, setState] = mkUseState('idle'); // idle | thinking | answered | error
  const [reply, setReply] = mkUseState('');
  const [echoed, setEchoed] = mkUseState('');

  async function go(e) {
    if (e) e.preventDefault();
    const idea = value.trim();
    if (!idea) return;
    setEchoed(idea);
    setState('thinking');
    setReply('');

    // Real call when available; synthesise a reply when not (e.g. inside design canvas).
    try {
      const sys = `You are Annie, the product engineer at Cold Anvil Studios. A stranger has just typed an idea into the composer on the home page. They are not technical. They have never seen code. They might be a teacher, a carpenter, a parent. Your reply is ONE warm paragraph (3-4 sentences) that: (1) repeats their idea back in your own words so they feel heard, (2) asks ONE specific clarifying question that would actually sharpen the thing, (3) ends with a gentle half-step forward — not a CTA, not a question list. Use contractions. Em-dashes welcome. No jargon. Never use: ship, launch, MVP, stack, deploy, leverage, robust, seamless, game-changer. Never start with "Great" or "Love" or "Interesting". Do not say "I'm Annie" — they know. Max 80 words.`;
      const text = await window.claude.complete({
        messages: [
          { role: 'user', content: `${sys}\n\nThe idea: ${idea}` }
        ],
      });
      setReply(text.trim());
      setState('answered');
      if (onSubmit) onSubmit({ idea, reply: text.trim() });
    } catch (err) {
      const shortIdea = idea.length < 60;
      const nudge = shortIdea
        ? "tell me a bit more about who this is for and when they'd use it"
        : "that's a lot to chew on";
      setReply("Alright — " + nudge + ". I'd want to know the one moment this is for — who's sat there, what they've just tried, what they're about to do. That's where the thing takes shape.");
      setState('answered');
    }
  }

  const compact = variant === 'compact';

  return (
    <div style={{display:'flex', flexDirection:'column', gap: compact ? 14 : 18, ...style}}>
      <form onSubmit={go} style={{display:'flex', flexDirection:'column', gap:14, border:'1px solid var(--border)', borderRadius:8, padding: compact ? '16px 18px' : '22px 24px', background:'transparent'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, fontFamily:'var(--font-body-b)', fontSize:11, fontWeight:500, color:'var(--ink-muted)', letterSpacing:'0.14em', textTransform:'uppercase', lineHeight:1}}>
          <span style={{position:'relative', display:'inline-block', width:8, height:8, flexShrink:0}}>
            <span style={{position:'absolute', inset:0, borderRadius:'50%', background:'var(--secondary)', animation:'mkPulseCore 2.4s ease-in-out infinite'}}/>
            <span style={{position:'absolute', inset:-3, borderRadius:'50%', border:'1px solid var(--secondary)', opacity:0.5, animation:'mkPulseRing 2.4s ease-out infinite'}}/>
          </span>
          <span>Talk to Annie</span>
          <span style={{flex:1, height:1, background:'var(--border-subtle)', marginInline:4}}/>
          <span style={{color:'var(--ink-dim)', textTransform:'none', letterSpacing:0, fontFamily:'var(--font-body-b)', fontSize:12, fontStyle:'italic', fontWeight:400}}>she's online</span>
        </div>
        <textarea
          value={value}
          onChange={e=>setValue(e.target.value)}
          placeholder="What have you been meaning to build? Half-formed hunches welcome."
          rows={compact ? 3 : 4}
          style={{background:'transparent', border:'none', outline:'none', color:'var(--cream)', fontFamily:'var(--font-body-b)', fontSize: compact ? 17 : 19, lineHeight:1.55, resize:'none', width:'100%', padding:0, marginTop:2}}
        />
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, paddingTop:12, borderTop:'1px solid var(--border-subtle)'}}>
          <span style={{fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink-dim)', lineHeight:1.4}}>
            {state === 'thinking' ? 'Annie is reading it…' : state === 'answered' ? "You can keep going — she'll pick it up." : 'A sentence is enough. A paragraph is plenty.'}
          </span>
          <button type="submit" disabled={state==='thinking' || !value.trim()} className="wk-btn wk-btn--primary" style={{fontFamily:'var(--font-body-b)', fontSize:14, fontWeight:500, padding:'10px 18px', opacity: (state==='thinking' || !value.trim()) ? 0.5 : 1, flexShrink:0}}>
            {state==='thinking' ? 'One moment…' : 'Start'} <span style={{marginLeft:4}}>→</span>
          </button>
        </div>
      </form>

      {(state==='thinking' || state==='answered') && (
        <div style={{display:'flex', flexDirection:'column', gap:14, padding: compact ? '14px 0 0' : '4px 4px 0'}}>
          {/* Echo: user's idea as quoted back */}
          <div style={{display:'grid', gridTemplateColumns:'32px 1fr', gap:14, alignItems:'start'}}>
            <span style={{fontFamily:'var(--font-body-b)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--ink-dim)', paddingTop:6}}>you</span>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink)', borderLeft:'1px solid var(--ink-dim)', paddingLeft:16, lineHeight:1.55}}>
              {echoed}
            </div>
          </div>
          {/* Annie's reply */}
          <div style={{display:'grid', gridTemplateColumns:'32px 1fr', gap:14, alignItems:'start'}}>
            <span style={{width:24, height:24, border:'1px solid var(--accent)', borderRadius:'50%', display:'grid', placeItems:'center', color:'var(--accent)', fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:13, fontWeight:500, marginTop:2}}>A</span>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:16, color:'var(--ink-bright)', lineHeight:1.62}}>
              {state === 'thinking' ? (
                <span style={{display:'inline-flex', alignItems:'center', gap:8, color:'var(--ink-muted)'}}>
                  <span style={{display:'inline-flex', gap:3}}>
                    <i style={{width:4, height:4, borderRadius:'50%', background:'currentColor', animation:'mkDot 1.2s ease-in-out infinite'}}/>
                    <i style={{width:4, height:4, borderRadius:'50%', background:'currentColor', animation:'mkDot 1.2s ease-in-out infinite 0.15s'}}/>
                    <i style={{width:4, height:4, borderRadius:'50%', background:'currentColor', animation:'mkDot 1.2s ease-in-out infinite 0.3s'}}/>
                  </span>
                  Annie is thinking
                </span>
              ) : reply}
            </div>
          </div>

          {state === 'answered' && (
            <div style={{display:'flex', gap:12, paddingLeft:46, paddingTop:4}}>
              <button onClick={()=>{ setValue(''); setState('idle'); setReply(''); setEchoed(''); }} className="wk-btn wk-btn--sm" style={{borderColor:'var(--border-subtle)', color:'var(--ink-muted)'}}>Keep going in the workshop →</button>
              <button onClick={()=>{ setState('idle'); setReply(''); setEchoed(''); setValue(echoed); }} className="wk-btn wk-btn--sm" style={{borderColor:'transparent', color:'var(--ink-muted)'}}>Try a different one</button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes mkPulseCore { 0%,100%{ transform: scale(1); } 50%{ transform: scale(1.15); } }
        @keyframes mkPulseRing { 0%{ transform: scale(1); opacity:0.5; } 100%{ transform: scale(1.8); opacity:0; } }
        @keyframes mkDot { 0%,60%,100%{ opacity:0.25; } 30%{ opacity:1; } }
      `}</style>
    </div>
  );
}

// ── Workshop-window — editorial documentary placeholder ──
// Full-bleed-ish framed image slot with a caption. Uses a warm Gruvbox gradient
// with visible grain so it reads as 'real photo to be slotted in' not as shipped art.
function MkWorkshopWindow({ caption, height=560, aspect }) {
  return (
    <figure style={{margin:0, position:'relative'}}>
      <div style={{position:'relative', width:'100%', height: aspect ? 'auto' : height, aspectRatio: aspect, borderRadius:8, overflow:'hidden', border:'1px solid var(--border-subtle)'}}>
        <div style={{
          position:'absolute', inset:0,
          background: `
            radial-gradient(ellipse at 72% 40%, rgba(216,166,92,0.22), transparent 55%),
            radial-gradient(ellipse at 20% 80%, rgba(140,148,92,0.12), transparent 50%),
            linear-gradient(180deg, #1e1c1b 0%, #2a2725 40%, #201e1d 100%)
          `,
        }}/>
        {/* Grain */}
        <div style={{position:'absolute', inset:0, opacity:0.35, mixBlendMode:'overlay',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.06 0 0 0 0.6 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`,
        }}/>
        {/* Stamped placeholder mark */}
        <div style={{position:'absolute', top:18, left:22, display:'flex', alignItems:'center', gap:10, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase'}}>
          <span style={{width:10, height:10, borderRadius:'50%', border:'1px solid var(--accent)'}}/>
          Plate 01 · workshop, monday morning
        </div>
        {/* Dimension tick */}
        <div style={{position:'absolute', bottom:18, right:22, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.12em'}}>
          2600 × 1200 · documentary · replace with real frame
        </div>
        {/* Hint of a silhouette — a suggestion of hands at a workbench, drawn in SVG */}
        <svg viewBox="0 0 1000 560" style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.28}} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="mkglow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d8a65c" stopOpacity="0.5"/>
              <stop offset="1" stopColor="#d8a65c" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* bench surface */}
          <rect x="0" y="380" width="1000" height="180" fill="#0e0d0c"/>
          {/* anvil silhouette */}
          <g fill="#0a0908" stroke="#2a2725" strokeWidth="1">
            <path d="M620 330 L820 330 L840 360 L820 380 L620 380 Z"/>
            <path d="M700 380 L740 380 L740 460 L700 460 Z"/>
            <rect x="640" y="460" width="160" height="20"/>
          </g>
          {/* warm glow on anvil */}
          <ellipse cx="730" cy="355" rx="180" ry="60" fill="url(#mkglow)"/>
          {/* tools on pegboard */}
          <g stroke="#1a1817" strokeWidth="3" fill="none">
            <line x1="140" y1="120" x2="140" y2="260"/>
            <line x1="200" y1="120" x2="220" y2="280"/>
            <path d="M260 120 L270 260 L290 260" />
          </g>
        </svg>
      </div>
      {caption && <figcaption style={{marginTop:14, display:'flex', justifyContent:'space-between', gap:24, fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink-muted)', letterSpacing:'0.02em'}}>
        <span style={{fontStyle:'italic'}}>{caption}</span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)'}}>documentary · placeholder · real photo TK</span>
      </figcaption>}
    </figure>
  );
}

// ── Inline rationale annotation — the yellow notepad sticker.
// Placed inside artboards next to choices that deserve defence.
function MkNote({ children, label='NOTE', tone='default', style }) {
  const tones = {
    default: { bg:'#2a2725', fg:'var(--ink-bright)', bar:'var(--accent)' },
    dissent: { bg:'#2a2725', fg:'var(--ink-bright)', bar:'#c57b4e' },
    signal:  { bg:'#2a2725', fg:'var(--ink-bright)', bar:'var(--secondary)' },
  }[tone];
  return (
    <div style={{
      display:'flex', gap:12,
      borderLeft:`2px solid ${tones.bar}`,
      padding:'10px 14px',
      background: tones.bg,
      borderRadius:'0 6px 6px 0',
      fontFamily:'var(--font-body-b)',
      fontSize:12,
      lineHeight:1.55,
      color: tones.fg,
      maxWidth: 360,
      ...style
    }}>
      <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', color:'var(--ink-dim)', paddingTop:1, whiteSpace:'nowrap'}}>{label}</span>
      <span>{children}</span>
    </div>
  );
}

// ── Footer ──
function MkFooter() {
  return (
    <footer style={{padding:'56px 48px 32px', borderTop:'1px solid var(--border-subtle)', color:'var(--ink-muted)', fontFamily:'var(--font-body-b)', fontSize:13, lineHeight:1.65}}>
      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', gap:48, marginBottom:40}}>
        <div>
          <MkWordmark size={18}/>
          <p style={{marginTop:16, maxWidth:'34ch', color:'var(--ink)'}}>A workshop for people with ideas and no way to build them. Quality over speed. Your ideas are yours.</p>
        </div>
        <div>
          <div className="wk-eyebrow" style={{marginBottom:14}}>Site</div>
          <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:8}}>
            <li><a href="#" style={{color:'var(--ink)', textDecoration:'none'}}>Home</a></li>
            <li><a href="#" style={{color:'var(--ink)', textDecoration:'none'}}>About</a></li>
            <li><a href="#" style={{color:'var(--ink)', textDecoration:'none'}}>Pricing</a></li>
          </ul>
        </div>
        <div>
          <div className="wk-eyebrow" style={{marginBottom:14}}>The work</div>
          <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:8}}>
            <li><a href="#" style={{color:'var(--ink)', textDecoration:'none'}}>How it works</a></li>
            <li><a href="#" style={{color:'var(--ink)', textDecoration:'none'}}>What we believe</a></li>
          </ul>
        </div>
        <div>
          <div className="wk-eyebrow" style={{marginBottom:14}}>Talk</div>
          <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:8}}>
            <li><a href="#" style={{color:'var(--ink)', textDecoration:'none'}}>Early access</a></li>
            <li><a href="#" style={{color:'var(--accent)', textDecoration:'none'}}>hello@coldanvil.com</a></li>
          </ul>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'baseline', paddingTop:24, borderTop:'1px solid var(--border-subtle)', gap:24}}>
        <span style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', color:'var(--cream)', fontSize:15}}>An idea <em style={{color:'var(--accent)'}}>is enough</em>.</span>
        <span style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink-muted)', textAlign:'center'}}>Built with AI, imagined by humans.</span>
        <span style={{textAlign:'right'}}>© 2026 Cold Anvil Studios</span>
      </div>
    </footer>
  );
}

// ── Claim underline — workshop primitive, reused on marketing for challengeable phrases ──
function MkClaim({ children, hot=false }) {
  return (
    <span className={hot ? 'wk-claim wk-claim--hot' : 'wk-claim'} style={{cursor:'default'}}>{children}</span>
  );
}

// ── Annie avatar — a small diamond glyph. Sizes 24–48. States: idle, listening.
function MkAnnie({ size=32, idle=false, listening=false }) {
  const s = size;
  return (
    <div style={{
      width:s, height:s, borderRadius:'50%',
      border:'1px solid var(--accent)',
      background:'color-mix(in oklab, var(--accent) 8%, transparent)',
      display:'grid', placeItems:'center', flexShrink:0, position:'relative',
    }}>
      <span style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize: s * 0.5, color:'var(--cream)', lineHeight:1, transform:'translateY(-1px)'}}>a</span>
      {listening && <span style={{position:'absolute', inset:-3, borderRadius:'50%', border:'1px solid var(--accent)', opacity:0.5, animation:'mkAnniePulse 2.4s ease-out infinite'}}/>}
      {idle && <span style={{position:'absolute', right:-1, bottom:-1, width:6, height:6, borderRadius:'50%', background:'var(--ink-dim)'}}/>}
      <style>{`@keyframes mkAnniePulse { 0% { transform: scale(0.85); opacity: 0.6;} 70% { transform: scale(1.6); opacity: 0;} 100% { opacity: 0;}}`}</style>
    </div>
  );
}

Object.assign(window, {
  MkAnvil, MkWordmark, MkNav,
  MkEyebrow, MkSectionHead,
  MkCard,
  MkLiveComposer, MkWorkshopWindow,
  MkNote, MkFooter, MkClaim, MkAnnie,
});
