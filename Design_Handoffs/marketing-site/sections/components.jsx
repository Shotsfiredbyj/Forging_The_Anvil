// sections/components.jsx — marketing-only components, cataloged.
// Each card: a working example + notes on origin (inherited from workshop or new),
// and where it's used. This is the handoff surface for eng.

const { MkEyebrow, MkNote, MkClaim, MkAnnie } = window;

function ComponentBlock({ name, origin, where, children }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      <div>
        <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6}}>{origin}</div>
        <div style={{fontFamily:'var(--font-display-b)', fontSize:18, color:'var(--cream)', letterSpacing:'-0.008em'}}>{name}</div>
        <div style={{fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink-muted)', fontStyle:'italic', marginTop:4}}>Used on: {where}</div>
      </div>
      <div style={{border:'1px solid var(--border-subtle)', borderRadius:6, background:'var(--ca-bg1)', padding:20, minHeight:160, display:'flex', flexDirection:'column', justifyContent:'center'}}>
        {children}
      </div>
    </div>
  );
}

function MkComponents() {
  return (
    <div style={{padding:36, background:'var(--bg)', minHeight:'100%'}}>
      <MkEyebrow num="08">Marketing-only components</MkEyebrow>
      <h2 style={{fontFamily:'var(--font-display-b)', fontSize:36, color:'var(--cream)', margin:'0 0 10px', letterSpacing:'-0.016em', lineHeight:1.15, maxWidth:'28ch'}}>
        What the marketing site adds to the workshop system.
      </h2>
      <p style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink)', lineHeight:1.6, maxWidth:'70ch', marginBottom:28}}>
        Wherever possible, I reused workshop primitives (Plan stamp, buttons, section headers). This strip names only what's genuinely new — and where we inherited, I named the workshop parent.
      </p>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24}}>
        <ComponentBlock name="MkEyebrow" origin="INHERITED · wk-eyebrow" where="Every marketing page section header">
          <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)', letterSpacing:'0.22em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:12}}>
            <span style={{color:'var(--accent)'}}>02</span> · Chapter
          </div>
        </ComponentBlock>

        <ComponentBlock name="MkNav" origin="NEW" where="Home A, Home B, About, Pricing, Waitlist">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, width:'100%'}}>
            <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:18, color:'var(--cream)'}}>Cold Anvil</div>
            <div style={{display:'flex', gap:18, fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink-muted)'}}>
              <span>About</span><span style={{color:'var(--cream)'}}>Pricing</span><span>Waitlist</span>
            </div>
          </div>
        </ComponentBlock>

        <ComponentBlock name="MkComposer" origin="NEW (signature)" where="Home A, Home B hero. Inline-editable.">
          <div style={{border:'1px solid var(--accent)', borderRadius:6, padding:14, background:'var(--bg)'}}>
            <span style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--cream)'}}>a booking page for my carpenter brother-in-law</span>
            <span style={{color:'var(--accent)', marginLeft:2}}>|</span>
          </div>
        </ComponentBlock>

        <ComponentBlock name="MkAnnie (badge)" origin="INHERITED · workshop Annie token" where="Composer, replies, waitlist">
          <MkAnnie size={40} listening/>
        </ComponentBlock>

        <ComponentBlock name="MkClaim" origin="NEW" where="About, home, pricing supporting copy">
          <div style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink)', lineHeight:1.6}}>
            We sell the <MkClaim>ongoing availability of Annie</MkClaim>, not units.
          </div>
        </ComponentBlock>

        <ComponentBlock name="MkWorkshopWindow" origin="NEW" where="Home B hero, About chapter 2">
          <div style={{width:'100%', border:'1px solid var(--border-subtle)', borderRadius:4, padding:'20px 14px', background:'var(--ca-bg0s)', display:'flex', flexDirection:'column', gap:6}}>
            <div style={{height:4, background:'var(--cream)', width:'30%', borderRadius:2, opacity:0.6}}/>
            <div style={{height:3, background:'var(--ink-muted)', width:'80%', borderRadius:2}}/>
            <div style={{height:3, background:'var(--ink-muted)', width:'60%', borderRadius:2}}/>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--ink-dim)', letterSpacing:'0.1em', marginTop:4}}>workshop window</div>
          </div>
        </ComponentBlock>

        <ComponentBlock name="Tier card (pricing)" origin="NEW (outlined + accent)" where="Pricing A">
          <div style={{border:'1px solid var(--accent)', borderRadius:6, padding:14, width:'100%', background:'color-mix(in oklab, var(--accent) 4%, transparent)'}}>
            <div className="wk-eyebrow" style={{color:'var(--ink-muted)'}}>For people with</div>
            <div style={{fontFamily:'var(--font-display-b)', fontSize:20, color:'var(--cream)'}}>Regular</div>
            <div style={{fontFamily:'var(--font-display-b)', fontSize:26, color:'var(--cream)', marginTop:4}}>$24<span style={{fontSize:12, color:'var(--ink-muted)', fontFamily:'var(--font-body-b)'}}> /mo</span></div>
          </div>
        </ComponentBlock>

        <ComponentBlock name="Tier scene (pricing B)" origin="NEW" where="Pricing B">
          <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:16, alignItems:'center', width:'100%'}}>
            <div>
              <div style={{fontFamily:'var(--font-display-b)', fontSize:20, color:'var(--cream)'}}>Regular</div>
              <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:16, color:'var(--accent)'}}>$24/mo</div>
            </div>
            <div style={{fontFamily:'var(--font-display-b)', fontSize:14, color:'var(--cream)', lineHeight:1.4}}>The price of a cheap lunch a week. Unlimited Annie.</div>
          </div>
        </ComponentBlock>

        <ComponentBlock name="MkFooter" origin="NEW" where="All marketing pages">
          <div style={{width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink-muted)'}}>
            <span>Cold Anvil Studios</span>
            <span>2025</span>
          </div>
        </ComponentBlock>
      </div>

      <MkNote label="RULE" style={{marginTop:28, maxWidth:840}}>
        If a component exists in the workshop system, use it verbatim. The marketing site does not re-style inherited primitives — doing so would break the trust that "the site and the workshop are the same place". New components, when justified, are clearly named and kept spare.
      </MkNote>
    </div>
  );
}

Object.assign(window, { MkComponents });
