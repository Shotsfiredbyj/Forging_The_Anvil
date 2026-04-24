// primitives.jsx — shared atoms used across every artboard.
// All class names are wk-* so they never collide with design-canvas internals.

const { useState, useEffect, useRef, useMemo } = React;

// ── Icons (hand-drawn, editorial weight — no emoji, no Lucide defaults) ──────
const Icon = {
  Anvil:    (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 8h13l-1 4H4z"/><path d="M17 8l3 2v2h-4"/><path d="M7 12v4h10v-4"/><path d="M5 19h14"/></svg>,
  Spark:    (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/></svg>,
  Hammer:   (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M13 4l7 4-3 3-7-4z"/><path d="M10 7l-6 6 3 3 6-6"/><path d="M7 16l-3 4"/></svg>,
  Chat:     (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 6h16v10H8l-4 4z"/></svg>,
  Plus:     (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  Arrow:    (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  ArrowUp:  (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 19V5M6 11l6-6 6 6"/></svg>,
  Dot:      (p) => <svg viewBox="0 0 24 24" width={p.size||6} height={p.size||6} fill="currentColor" {...p}><circle cx="12" cy="12" r="6"/></svg>,
  Check:    (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12l5 5 11-11"/></svg>,
  X:        (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6l-12 12"/></svg>,
  Globe:    (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>,
  Doc:      (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 13h6M10 17h4"/></svg>,
  Settle:   (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>,
  Commit:   (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 17l7-7 4 4 7-7"/><path d="M14 3h7v7"/></svg>,
  Pen:      (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 4l6 6-10 10H4v-6z"/></svg>,
  Refresh:  (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12a8 8 0 0113.7-5.7L20 8M20 4v4h-4M20 12a8 8 0 01-13.7 5.7L4 16M4 20v-4h4"/></svg>,
  Download: (p) => <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 4v12M6 12l6 6 6-6"/><path d="M4 20h16"/></svg>,
};

// ── Cold Anvil mark (used in Annie's nameplate) ──
const ColdAnvilMark = ({size=22}) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13h17l-1.3 5.2H5z"/>
    <path d="M22 13l4.5 2.8v3h-6"/>
    <path d="M9 18.2v4.6h11v-4.6"/>
    <path d="M6 26h16"/>
  </svg>
);

// ── App shell: left sidebar + main column.
// Deliberately calmer than a dashboard. One column of verbs, plenty of rule above.
function Shell({ project = 'Copper Kettle', section = 'Conversation', children, variant = 'session' }) {
  return (
    <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateColumns:'232px 1fr', width:'100%', height:'100%'}}>
      <aside style={{borderRight:'1px solid var(--border-subtle)', padding:'22px 20px', display:'flex', flexDirection:'column', gap:18, background:'transparent'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, color:'var(--accent)'}}>
          <ColdAnvilMark size={20}/>
          <span style={{fontFamily:'var(--font-display)', fontSize:18, fontStyle:'italic', color:'var(--cream)', letterSpacing:'-0.01em'}}>Cold Anvil</span>
        </div>
        <div style={{height:1, background:'var(--border-subtle)'}}/>

        <div>
          <div className="wk-eyebrow">project</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:17, color:'var(--cream)', marginTop:4, letterSpacing:'-0.012em'}}>{project}</div>
          <div style={{fontSize:11, color:'var(--ink-dim)', marginTop:2, fontFamily:'var(--font-mono)'}}>copper-kettle.coldanvil.com</div>
        </div>

        <nav style={{display:'flex', flexDirection:'column', gap:2, marginTop:4}}>
          {[
            ['Conversation','chat'],
            ['Vision','vision'],
            ['Brand voice','voice'],
            ['Content','content'],
            ['Architecture','arch'],
            ['Preview','preview'],
            ['History','ledger'],
          ].map(([label]) => (
            <div key={label} style={{
              padding:'7px 10px', borderRadius:4,
              color: label === section ? 'var(--cream)' : 'var(--ink-muted)',
              background: label === section ? 'color-mix(in oklab, var(--accent) 9%, transparent)' : 'transparent',
              borderLeft: label === section ? '2px solid var(--accent)' : '2px solid transparent',
              fontSize:14, fontWeight: label === section ? 500 : 400,
              cursor:'pointer',
              fontFamily:'var(--font-body)',
            }}>{label}</div>
          ))}
        </nav>

        <div style={{flex:1}}/>
        <div className="wk-ruler" style={{marginBottom:10}}/>
        <div style={{fontSize:12, color:'var(--ink-dim)', lineHeight:1.55, fontFamily:'var(--font-body)'}}>
          <div style={{color:'var(--ink-muted)'}}>Your workshop</div>
          <div style={{marginTop:3}}>Take it with you anytime.</div>
          <button className="wk-btn wk-btn--ghost wk-btn--sm" style={{padding:'4px 0', marginTop:6}}><Icon.Download size={12}/> Export project</button>
        </div>
      </aside>
      <main style={{display:'grid', gridTemplateRows:'56px 1fr', minWidth:0}}>
        <header style={{
          display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:20,
          padding:'0 28px', borderBottom:'1px solid var(--border-subtle)',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:12, color:'var(--ink-muted)', fontFamily:'var(--font-body)', fontSize:14}}>
            <span>{project}</span>
            <span style={{color:'var(--ink-dim)'}}>/</span>
            <span style={{color:'var(--cream)'}}>{section}</span>
          </div>
          <div/>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <Chip live>preview running</Chip>
            <button className="wk-btn wk-btn--sm"><Icon.Globe size={12}/> Open site</button>
          </div>
        </header>
        <div style={{minWidth:0, minHeight:0}}>
          {children}
        </div>
      </main>
    </div>
  );
}

// ── Annie's voice line — used inline in conversation and as margin voice.
function AnnieLine({ children, mark='a', tail=false, style }) {
  return (
    <div className="wk-annie-line" style={style}>
      <div className="wk-annie-mark" aria-hidden>{mark}</div>
      <div className="wk-annie-body">{children}{tail && <span className="wk-caret"/>}</div>
    </div>
  );
}
function UserLine({ children }) {
  return <div className="wk-user-line">{children}</div>;
}
function Chip({children, accent, live, style}) {
  const cls = 'wk-chip' + (accent?' wk-chip--accent':'') + (live?' wk-chip--live':'');
  return <span className={cls} style={style}>{(accent||live) && <span className="wk-chip__dot"/>}{children}</span>;
}
// ── The Claim — a pointable, challengeable phrase in the vision artefact.
function Claim({children, hot}) {
  return <span className={'wk-claim'+(hot?' wk-claim--hot':'')}>{children}</span>;
}

// ── The plan — the signature moment.
// States: pending → accepted (stamped, cream).
function StruckPlan({ pending, children, stamp, date, onStrike, onRefine }) {
  return (
    <div className={'wk-struck' + (pending ? ' wk-struck--pending' : '')}>
      <div className="wk-struck__eyebrow">{pending ? 'Annie proposes' : 'Annie’s plan · accepted'}</div>
      <div className="wk-struck__sentence">{children}</div>
      {pending ? (
        <div style={{display:'flex', gap:10, marginTop:20, alignItems:'center'}}>
          <button className="wk-btn wk-btn--primary" onClick={onStrike}>Accept plan</button>
          <button className="wk-btn" onClick={onRefine}>Refine</button>
          <span style={{marginLeft:'auto', fontSize:12, color:'var(--ink-muted)', fontFamily:'var(--font-body)'}}>
            You can undo this at any time.
          </span>
        </div>
      ) : (
        <div className="wk-struck__stamp">{stamp || 'accepted'} · {date || 'today'}</div>
      )}
    </div>
  );
}

// ── Browser frame for the live preview.
function Browser({url='copper-kettle.coldanvil.com', state='live', children, height=420}) {
  return (
    <div className="wk-browser" style={{height:'auto'}}>
      <div className="wk-browser__bar">
        <div className="wk-browser__dots" aria-hidden><span/><span/><span/></div>
        <div className="wk-browser__url">
          <Icon.Globe size={10}/>
          <span style={{color:'var(--ink-dim)'}}>{url}</span>
          {state === 'live' && <span className="wk-browser__live">Live</span>}
        </div>
        <div style={{display:'flex', gap:6}}>
          <button className="wk-btn wk-btn--ghost wk-btn--sm" style={{padding:'4px 6px'}}><Icon.Refresh size={11}/></button>
        </div>
      </div>
      <div className="wk-browser__canvas" style={{height}}>
        {children}
      </div>
    </div>
  );
}

// ── Fake-site content for the preview pane — a plausible waitlist page
// (Copper Kettle is a group gift coordinator — derived from spec examples).
function PreviewSite({ heroColor = '#d8a65c', heroColorText = 'mustard', editing = null, showNavPricing = false }) {
  const css = `
    .pv { font-family: 'Inter', sans-serif; color:#111; height:100%; overflow:auto; }
    .pv * { box-sizing: border-box; }
    .pv__nav { display:flex; justify-content:space-between; align-items:center; padding: 14px 30px; border-bottom:1px solid #eee; font-size:13px; }
    .pv__nav a { color:#333; margin-left:18px; text-decoration:none; }
    .pv__hero { padding: 60px 30px 48px; }
    .pv__eyebrow { font-size:11px; text-transform:uppercase; letter-spacing:0.18em; color:#777; margin-bottom:10px; }
    .pv__h1 { font-family: 'Fraunces', Georgia, serif; font-size: 40px; line-height: 1.08; max-width: 520px; margin: 0 0 14px; color:${heroColor}; font-weight:500; letter-spacing:-0.01em; }
    .pv__lede { font-size: 15px; line-height: 1.55; max-width: 480px; color:#444; margin: 0 0 24px;}
    .pv__form { display:flex; gap:8px; max-width: 380px; }
    .pv__input { flex:1; border:1px solid #ccc; border-radius:6px; padding: 10px 12px; font-size: 13px; font-family: inherit;}
    .pv__cta { background:#222; color:#fff; border:0; border-radius:6px; padding: 10px 16px; font-size: 13px; cursor:pointer; font-family: inherit;}
    .pv__how { padding: 44px 30px 60px; border-top: 1px solid #f0f0f0; }
    .pv__how h2 { font-family: 'Fraunces', Georgia, serif; font-size: 22px; margin: 0 0 14px; color:#222; font-weight:500; }
    .pv__steps { display:grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 18px; }
    .pv__step { font-size: 13px; line-height: 1.55; color:#333; }
    .pv__step-n { font-family: 'Fraunces', serif; font-style: italic; color:${heroColor}; font-size: 16px; margin-bottom: 4px; }
    .pv__edit { outline: 2px solid ${heroColor}; outline-offset: 4px; border-radius: 3px; animation: edpulse 1.6s ease-in-out infinite; }
    @keyframes edpulse { 0%,100% { outline-color: ${heroColor}; } 50% { outline-color: #fff; } }
  `;
  return (
    <div className="pv">
      <style dangerouslySetInnerHTML={{__html:css}}/>
      <div className="pv__nav">
        <div style={{fontFamily:'Fraunces, serif', fontStyle:'italic', fontSize:15, color:'#222'}}>Copper Kettle</div>
        <div>
          <a href="#">How it works</a>
          {showNavPricing && <a href="#" style={{color: heroColor}}>Pricing</a>}
          <a href="#">Sign in</a>
        </div>
      </div>
      <div className="pv__hero">
        <div className="pv__eyebrow">A better group gift</div>
        <h1 className={'pv__h1' + (editing==='hero' ? ' pv__edit':'')}>Chip in together.<br/>Give something they'll keep.</h1>
        <p className="pv__lede">Copper Kettle lets a group pool money for one meaningful gift, without the awkward spreadsheet. You start it, we nudge everyone, the recipient gets one lovely thing.</p>
        <div className="pv__form">
          <input className="pv__input" placeholder="your email" defaultValue=""/>
          <button className="pv__cta">Start a gift</button>
        </div>
      </div>
      <div className="pv__how">
        <h2>How it works</h2>
        <div className="pv__steps">
          <div className="pv__step"><div className="pv__step-n">One.</div>Pick the gift and set a target.</div>
          <div className="pv__step"><div className="pv__step-n">Two.</div>Share a link. Everyone chips in privately.</div>
          <div className="pv__step"><div className="pv__step-n">Three.</div>When the target's hit, we send it.</div>
        </div>
      </div>
    </div>
  );
}

// Pocket heading used on states, components, etc.
function SectionHead({kicker, title, sub, right}) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'end', gap:16, marginBottom:18}}>
      <div>
        <div className="wk-eyebrow">{kicker}</div>
        <div style={{fontFamily:'var(--font-display)', fontSize:26, color:'var(--cream)', marginTop:6, letterSpacing:'-0.014em'}}>{title}</div>
        {sub && <div style={{color:'var(--ink-muted)', fontSize:14, marginTop:6, maxWidth:720, lineHeight:1.55}}>{sub}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// Utility: rule with caption (used in rationale)
function Rule({label}){
  return (
    <div style={{display:'grid', gridTemplateColumns:'auto 1fr', alignItems:'center', gap:14, margin:'28px 0 18px'}}>
      <div className="wk-eyebrow" style={{color:'var(--ink-muted)'}}>{label}</div>
      <div style={{height:1, background:'var(--border-subtle)'}}/>
    </div>
  );
}

Object.assign(window, {
  Icon, ColdAnvilMark, Shell, AnnieLine, UserLine, Chip, Claim,
  StruckPlan, Browser, PreviewSite, SectionHead, Rule,
});
