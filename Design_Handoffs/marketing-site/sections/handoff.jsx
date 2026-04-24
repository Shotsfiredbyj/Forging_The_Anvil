// sections/handoff.jsx — three handoff options + filmstrip of the chosen one.
// This is the single artboard the spec's §3 "Arrival → Discovery" hinges on
// and the only moment where the marketing site physically becomes the workshop.

const { MkNote, MkEyebrow } = window;

function HandoffPanel({ letter, title, subtitle, kind, children, footnote, chosen }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', gap:14,
      border: chosen ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
      borderRadius:8, padding:24, background: chosen ? 'color-mix(in oklab, var(--accent) 3%, transparent)' : 'transparent',
      position:'relative'
    }}>
      {chosen && <div style={{position:'absolute', top:-10, left:20, background:'var(--bg)', padding:'0 8px', color:'var(--accent)', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase'}}>Chosen for B</div>}
      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:6}}>
          <span style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:18, color:'var(--accent)'}}>{letter}.</span>
          <span style={{fontFamily:'var(--font-display-b)', fontSize:22, color:'var(--cream)', letterSpacing:'-0.01em'}}>{title}</span>
        </div>
        <div style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink-muted)', lineHeight:1.55}}>{subtitle}</div>
      </div>

      {/* The little diagram slot */}
      <div style={{border:'1px solid var(--border-subtle)', borderRadius:6, background:'var(--ca-bg1)', padding:'18px 20px', minHeight:220, display:'flex', flexDirection:'column', gap:10}}>
        {children}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:10, paddingTop:4}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-dim)', letterSpacing:'0.14em', textTransform:'uppercase', whiteSpace:'nowrap'}}>Kind</span>
        <span style={{fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink)'}}>{kind}</span>
      </div>
      {footnote && <div style={{fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink-muted)', fontStyle:'italic', lineHeight:1.55, paddingTop:4, borderTop:'1px solid var(--border-subtle)'}}>{footnote}</div>}
    </div>
  );
}

// Tiny visual units used inside the panels
function HSite({ label = 'coldanvil.com', children, muted=false, dim=false }) {
  return (
    <div style={{border:`1px solid ${dim ? 'var(--border-subtle)' : 'var(--ink-dim)'}`, borderRadius:4, padding:'10px 12px', fontFamily:'var(--font-body-b)', fontSize:11, color: muted ? 'var(--ink-dim)' : 'var(--ink)', opacity: dim ? 0.55 : 1}}>
      <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-dim)', marginBottom:6, letterSpacing:'0.04em'}}>{label}</div>
      {children}
    </div>
  );
}
function HArrow({ label, thin=false, down=false }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'var(--accent)', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em'}}>
      <svg width="28" height="14" viewBox="0 0 28 14" style={{transform: down ? 'rotate(90deg)' : 'none'}}><path d="M0 7h25M20 2l5 5-5 5" stroke="currentColor" strokeWidth={thin?1:1.4} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <span>{label}</span>
    </div>
  );
}

function MkHandoffOptions() {
  return (
    <div style={{padding:36, background:'var(--bg)', height:'100%', overflow:'auto'}}>
      <MkEyebrow num="04A">The moment of crossing</MkEyebrow>
      <h2 style={{fontFamily:'var(--font-display-b)', fontSize:40, color:'var(--cream)', margin:'0 0 12px', letterSpacing:'-0.016em', lineHeight:1.15, maxWidth:'28ch'}}>
        Three ways to get from the marketing site to Annie.
      </h2>
      <p style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink)', lineHeight:1.6, maxWidth:'72ch', marginBottom:32}}>
        The visitor has typed their idea and hit Start. The marketing site and the workshop live on different domains (mkt vs. app). Something has to happen between them. Three options, ranked by how much "arrival ceremony" they introduce.
      </p>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24}}>
        <HandoffPanel
          letter="A"
          title="Seamless"
          subtitle="No moment. The composer is the thing — what you typed moves with you, the chrome changes around it. Paired with Home A."
          kind="Same-page promotion · no threshold · fastest"
          footnote="Lowest friction, lowest mood. The visitor barely notices a 'crossing'."
        >
          <HSite label="coldanvil.com (marketing)">
            <div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-bright)'}}>Composer · "I want a group gift thing"</div>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-muted)', marginTop:4}}>Annie: "Alright — so it's not just a calendar…"</div>
          </HSite>
          <HArrow label="page mutates · no navigation · ~200ms" down/>
          <HSite label="app.coldanvil.com (workshop)">
            <div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--cream)'}}>Same conversation, now with the sidebar + docs tabs</div>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-muted)', marginTop:4}}>Vision artefact arrives two turns in</div>
          </HSite>
        </HandoffPanel>

        <HandoffPanel
          letter="B"
          title="Threshold"
          subtitle="A slow fade + a single phrase from Annie ('Welcome to the workshop'), then the workshop takes over. Paired with Home B."
          kind="Soft cut · ~1.2s ceremony · evocative"
          chosen
          footnote="The one worth defending. Feels like being invited through a door."
        >
          <HSite label="coldanvil.com (marketing)">
            <div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-bright)'}}>Composer · "book club queue thing"</div>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-muted)', marginTop:4}}>Annie replies. Two turns. Then a soft cut.</div>
          </HSite>
          <HArrow label={<><span style={{color:'var(--cream)', fontStyle:'italic', fontFamily:'var(--font-display-b)', fontSize:12, letterSpacing:'-0.005em'}}>&nbsp;"Welcome to the workshop"&nbsp;</span></>} thin/>
          <HSite label="app.coldanvil.com (workshop)">
            <div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--cream)'}}>Workshop page arrives with the conversation already open</div>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-muted)', marginTop:4}}>Everything they already said is there.</div>
          </HSite>
        </HandoffPanel>

        <HandoffPanel
          letter="C"
          title="Ante-room"
          subtitle="An interstitial page: 'Here's what Annie heard, here's what she thinks. Carry on?' Then workshop."
          kind="Intermediate page · explicit · safe"
          footnote="Least interesting. Forced summary steals the conversation's rhythm. Keep in case compliance asks."
        >
          <HSite label="coldanvil.com (marketing)"><div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-bright)'}}>Composer fires → short redirect</div></HSite>
          <HArrow label="interstitial · 'here's what I heard'" thin/>
          <HSite label="/you-and-annie (summary page)" muted>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-bright)'}}>Your idea · our first three questions · continue</div>
          </HSite>
          <HArrow label="continue" thin down/>
          <HSite label="app.coldanvil.com" dim><div style={{fontFamily:'var(--font-body-b)', fontSize:11}}>Workshop</div></HSite>
        </HandoffPanel>
      </div>

      <MkNote label="WHAT I'D DEFEND" style={{marginTop:28, maxWidth:880}}>
        Option B. The threshold is the emotional inverse of the workshop's "calm room": a brief ceremony that marks "you've arrived", without a form or a summary. Option A is fine but wastes the chance to shift gears. Option C is what we'd write if a PM made us — it treats the visitor as a data object, not a guest.
      </MkNote>
    </div>
  );
}

function MkHandoffFilmstrip() {
  const frames = [
    { t: '0.0s', label: 'Composer', body: "Visitor has just hit Start. Their idea is echoed, Annie's asking back.", state: 'live' },
    { t: '0.4s', label: 'Page quiets', body: "Rest of the page lowers to 20% opacity. Ambient tape pauses. Nav fades out.", state: 'quieting' },
    { t: '0.9s', label: "Annie's line", body: "A single italic phrase fades in above the composer: \u2018Welcome to the workshop.\u2019", state: 'phrase' },
    { t: '1.3s', label: 'Fade to bench', body: "Soft cross-fade — background warms, a low hum of the workshop (2s) cues.", state: 'fade' },
    { t: '1.6s', label: 'Workshop opens', body: "Sidebar appears on the left. Conversation still there, chrome now workshop's.", state: 'land' },
  ];
  return (
    <div style={{padding:36, background:'var(--bg)', height:'100%'}}>
      <MkEyebrow num="04B">The chosen crossing — filmstrip</MkEyebrow>
      <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:14, marginTop:20}}>
        {frames.map((f, i) => (
          <div key={i} style={{display:'flex', flexDirection:'column', gap:10}}>
            <div style={{aspectRatio:'4 / 5', border:'1px solid var(--border-subtle)', borderRadius:6, background: 'var(--ca-bg1)', position:'relative', overflow:'hidden'}}>
              <Frame state={f.state}/>
            </div>
            <div style={{display:'flex', alignItems:'baseline', gap:8}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', letterSpacing:'0.06em'}}>{f.t}</span>
              <span style={{fontFamily:'var(--font-display-b)', fontSize:15, color:'var(--cream)', letterSpacing:'-0.005em'}}>{f.label}</span>
            </div>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink)', lineHeight:1.55}}>{f.body}</div>
          </div>
        ))}
      </div>
      <MkNote label="TIMING" style={{marginTop:24, maxWidth:740}}>
        1.6s total. Long enough to feel, short enough not to annoy on return visits. Once a user has done the crossing three times we shorten to 0.6s (just the fade) — a learned guest doesn't need the ceremony every time.
      </MkNote>
    </div>
  );
}

function Frame({ state }) {
  const common = { position:'absolute', inset:0, transition:'opacity 0.4s' };
  const opacity = { live:1, quieting:0.2, phrase:0.2, fade:0.08, land:0 }[state];
  return (
    <>
      {/* The marketing scene */}
      <div style={{...common, opacity, padding:'10px 12px', display:'flex', flexDirection:'column', gap:6}}>
        <div style={{height:6, background:'var(--border-subtle)', width:'100%', borderRadius:2}}/>
        <div style={{height:4, background:'var(--border-subtle)', width:'60%', borderRadius:2}}/>
        <div style={{flex:1, border:'1px solid var(--border-subtle)', borderRadius:3, padding:8, marginTop:4}}>
          <div style={{height:4, background:'var(--accent)', width:'30%', borderRadius:2, opacity:0.6}}/>
          <div style={{height:3, background:'var(--ink-dim)', width:'80%', borderRadius:2, marginTop:6}}/>
          <div style={{height:3, background:'var(--ink-dim)', width:'70%', borderRadius:2, marginTop:3}}/>
        </div>
      </div>
      {/* The phrase overlay */}
      {(state === 'phrase' || state === 'fade') && (
        <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center', padding:'0 16px'}}>
          <span style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', color:'var(--accent)', fontSize:16, letterSpacing:'-0.005em', textAlign:'center', opacity: state === 'fade' ? 0.5 : 1}}>Welcome to the workshop</span>
        </div>
      )}
      {/* The workshop scene */}
      {state === 'land' && (
        <div style={{position:'absolute', inset:0, display:'grid', gridTemplateColumns:'30px 1fr', background:'var(--ca-bg0s)'}}>
          <div style={{borderRight:'1px solid var(--border-subtle)', padding:6, display:'flex', flexDirection:'column', gap:4}}>
            <div style={{height:3, background:'var(--accent)', borderRadius:2}}/>
            <div style={{height:3, background:'var(--border-subtle)', borderRadius:2}}/>
            <div style={{height:3, background:'var(--border-subtle)', borderRadius:2}}/>
            <div style={{height:3, background:'var(--border-subtle)', borderRadius:2}}/>
          </div>
          <div style={{padding:8, display:'flex', flexDirection:'column', gap:5}}>
            <div style={{height:4, background:'var(--cream)', width:'40%', borderRadius:2}}/>
            <div style={{height:3, background:'var(--ink-muted)', width:'82%', borderRadius:2, marginTop:4}}/>
            <div style={{height:3, background:'var(--ink-muted)', width:'70%', borderRadius:2}}/>
            <div style={{height:3, background:'var(--ink-muted)', width:'78%', borderRadius:2}}/>
            <div style={{border:'1px solid var(--accent)', borderRadius:3, padding:6, marginTop:4, background:'color-mix(in oklab, var(--cream) 85%, transparent)'}}>
              <div style={{height:3, background:'var(--ink-on-light)', width:'60%', borderRadius:2}}/>
              <div style={{height:3, background:'var(--ink-on-light)', width:'50%', borderRadius:2, marginTop:3}}/>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Object.assign(window, { MkHandoffOptions, MkHandoffFilmstrip });
