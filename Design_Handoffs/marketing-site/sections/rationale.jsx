// sections/rationale.jsx — the four cover/rationale artboards.
// Match the workshop package's RationaleCover pattern: a single editorial card,
// generous type, one plain paragraph per panel. No marketing decoration.

function MkRationaleCover() {
  return (
    <div className="mk-root" style={{padding:'72px 68px', display:'flex', flexDirection:'column', gap:40}}>
      <div style={{display:'flex', alignItems:'center', gap:14, color:'var(--ink-muted)'}}>
        <window.MkAnvil size={22} style={{color:'var(--accent)'}}/>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase'}}>Cold Anvil · marketing</span>
        <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)'}}>April 2026 · sibling to annie's-workshop</span>
      </div>

      <h1 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:76, lineHeight:1.03, letterSpacing:'-0.022em', color:'var(--cream)', margin:0, textWrap:'balance'}}>
        Cold&nbsp;Anvil <em style={{color:'var(--accent)'}}>marketing</em>.
      </h1>

      <p style={{fontFamily:'var(--font-display-b)', fontSize:22, lineHeight:1.5, color:'var(--ink-bright)', maxWidth:'48ch', margin:0, fontWeight:400}}>
        Not a redesign. A system-alignment pass plus one signature moment — the piece that makes the marketing site feel like the same product the workshop is.
      </p>

      <div style={{height:1, background:'var(--border-subtle)', margin:'12px 0'}}/>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, fontFamily:'var(--font-body-b)', fontSize:14, lineHeight:1.65, color:'var(--ink)'}}>
        <div>
          <div className="wk-eyebrow" style={{marginBottom:12}}>What's in here</div>
          <ol style={{paddingLeft:18, margin:0, display:'flex', flexDirection:'column', gap:6}}>
            <li>The signature moment — the <em style={{color:'var(--cream)'}}>Live Hand</em>.</li>
            <li>Home — the canonical page (variant C, the synthesis).</li>
            <li>The crossing — three handoff options, compared.</li>
            <li>About — current copy, re-rhythmed.</li>
            <li>Pricing — the canonical outlined grid (variant A).</li>
            <li>Waitlist shell — pre-launch holding page.</li>
            <li>States — waitlist success/error, 404, crossing.</li>
            <li>Components — marketing-only atoms.</li>
            <li>Motion — four inherited + one new.</li>
          </ol>
        </div>
        <div>
          <div className="wk-eyebrow" style={{marginBottom:12}}>What I'd defend in the feedback round</div>
          <p style={{margin:0, maxWidth:'36ch'}}>
            The composer on the home page <em style={{color:'var(--cream)'}}>talks back for real</em>. Not a loop, not a screenshot. A cold visitor can type an idea and hear Annie reply before they've decided whether Cold Anvil is for them. Everything else is in service of that moment being earned — quiet nav, restrained palette, one workshop photograph, no AI orbs.
          </p>
          <p style={{margin:'18px 0 0', color:'var(--ink-muted)', fontSize:13}}>
            Rationale lives inline next to each artboard, per the brief. Read the annotations as you pan.
          </p>
        </div>
      </div>

      <div style={{marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'baseline', borderTop:'1px solid var(--border-subtle)', paddingTop:18, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)', letterSpacing:'0.04em'}}>
        <span>designed against BRAND.md v1 · Bullfinch Forge · Newsreader + Inter (pair B)</span>
        <span>→ pan right for the signature</span>
      </div>
    </div>
  );
}

function MkRationaleSignature() {
  return (
    <div className="mk-root" style={{padding:'72px 68px', display:'flex', flexDirection:'column', gap:32}}>
      <div style={{display:'flex', alignItems:'center', gap:14, color:'var(--ink-muted)'}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase'}}>02 · the one signature</span>
        <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
      </div>

      <h2 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:52, lineHeight:1.08, letterSpacing:'-0.018em', color:'var(--cream)', margin:0, maxWidth:'16ch'}}>
        The composer is <em style={{color:'var(--accent)'}}>the cold hand</em>.
      </h2>

      <div style={{display:'grid', gridTemplateColumns:'1.1fr 0.9fr', gap:56, fontFamily:'var(--font-body-b)', fontSize:16, lineHeight:1.65, color:'var(--ink-bright)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          <p style={{margin:0}}>
            Workshop's signature is the <em style={{color:'var(--cream)'}}>plan-as-stamp</em> — the moment an idea becomes committed-to, pressed in cream like a seal. Marketing needs its own. Not a rhyme on the plan; that would force a visitor to earn the moment before they've decided to stay.
          </p>
          <p style={{margin:0}}>
            Marketing's signature is the <em style={{color:'var(--cream)'}}>Live Hand</em>: the home-page composer is wired to Annie for real. A visitor arrives cold, has thirty seconds, types the half-formed hunch that lives in their head — and Annie replies. Three sentences. Warm. Specific. Asking one good question.
          </p>
          <p style={{margin:0}}>
            That's the sell. Every other word on the page is <em style={{color:'var(--cream)'}}>evidence</em> for the moment they've already had.
          </p>

          <div style={{height:1, background:'var(--border-subtle)', margin:'8px 0'}}/>

          <div>
            <div className="wk-eyebrow" style={{marginBottom:10}}>Why this, not the alternatives</div>
            <div style={{display:'flex', flexDirection:'column', gap:10, fontSize:14, color:'var(--ink)'}}>
              <div><strong style={{color:'var(--cream)', fontWeight:500}}>A ledger of shipped projects</strong> — leans on proof Cold Anvil doesn't have yet. Also tempts marketing into logo-wall territory.</div>
              <div><strong style={{color:'var(--cream)', fontWeight:500}}>The strike (hot-to-cool metaphor)</strong> — pretty, but it makes submission feel like a commitment before the visitor knows what they're committing to. Workshop already owns the strike.</div>
              <div><strong style={{color:'var(--cream)', fontWeight:500}}>A full-bleed workshop photograph</strong> — kept, as the second note of the chord. Not the signature. An image alone can't close the distance between "cool brand" and "I'll type something".</div>
            </div>
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          <window.MkNote label="NOTE" tone="signal">
            The composer is wired to <code style={{fontFamily:'var(--font-mono)', fontSize:11}}>window.claude.complete</code> in this package. Pan to the Signature section and type into it — Annie actually replies. Cold hand, warm response.
          </window.MkNote>

          <div style={{border:'1px solid var(--accent)', borderRadius:8, padding:'24px 26px', background:'var(--cream)', color:'var(--ink-on-light)'}}>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:10, letterSpacing:'0.24em', textTransform:'uppercase', color:'#5a524e', marginBottom:12, fontWeight:600}}>
              signature rhyme with the workshop
            </div>
            <div style={{fontFamily:'var(--font-display-b)', fontSize:19, lineHeight:1.4, fontStyle:'italic', color:'var(--ink-on-light)'}}>
              workshop: <strong style={{fontStyle:'normal', fontWeight:500}}>the plan is pressed.</strong><br/>
              marketing: <strong style={{fontStyle:'normal', fontWeight:500}}>the hand is taken.</strong>
            </div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.1em', color:'#5a524e', marginTop:16, opacity:0.55}}>
              both: specific, singular, physical.
            </div>
          </div>

          <window.MkNote label="DEFEND" tone="default">
            If a feature stays, this does: the composer being alive. Everything else is negotiable.
          </window.MkNote>
        </div>
      </div>
    </div>
  );
}

function MkRationaleIA() {
  const pages = [
    ['01', 'Home', 'editorial hero + live composer + three supporting sections + cream pocket + manifesto + CTA', 'the sell — 30 seconds to type'],
    ['02', 'About', 'origin, sister products, three beliefs, cream pocket, CTA — current copy, re-rhythmed', 'trust — we are real people'],
    ['03', 'Pricing', 'four outlined tiers, one accent border on "Build", pricing rhythm strip, FAQ', 'permission — start free'],
    ['04', 'Waitlist', 'pre-launch holding page that takes over /, links everywhere else', 'the doorbell, pre-launch'],
    ['05', '404 + states', 'brand even in the errors', "voice doesn't leave"],
  ];
  return (
    <div className="mk-root" style={{padding:'72px 68px', display:'flex', flexDirection:'column', gap:32}}>
      <div style={{display:'flex', alignItems:'center', gap:14, color:'var(--ink-muted)'}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase'}}>03 · pages + rhythm</span>
        <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
      </div>
      <h2 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:52, lineHeight:1.08, letterSpacing:'-0.018em', color:'var(--cream)', margin:0, maxWidth:'20ch'}}>
        Five surfaces. <em style={{color:'var(--accent)'}}>One job each.</em>
      </h2>
      <p style={{fontFamily:'var(--font-body-b)', fontSize:17, lineHeight:1.6, color:'var(--ink)', maxWidth:'58ch', margin:0}}>
        Every page does exactly one thing. If a section doesn't serve the page's job, it comes out. BRAND.md is strict about this; the redesign makes it visible.
      </p>

      <div style={{display:'flex', flexDirection:'column', marginTop:12, borderTop:'1px solid var(--border-subtle)'}}>
        {pages.map(([num, name, content, job]) => (
          <div key={num} style={{display:'grid', gridTemplateColumns:'60px 140px 1fr 280px', gap:24, padding:'22px 0', borderBottom:'1px solid var(--border-subtle)', alignItems:'baseline'}}>
            <span style={{fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-dim)'}}>{num}</span>
            <span style={{fontFamily:'var(--font-display-b)', fontSize:24, fontWeight:500, color:'var(--cream)', letterSpacing:'-0.012em'}}>{name}</span>
            <span style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.55}}>{content}</span>
            <span style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:15, color:'var(--accent)'}}>{job}</span>
          </div>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, marginTop:24}}>
        <window.MkNote label="CUT">
          The sticky "Talk to Annie" bar from the current site goes. It undermines the signature — if the composer above the fold is alive, a sticky version is noise.
        </window.MkNote>
        <window.MkNote label="CUT" tone="dissent">
          The four "The barman / the plumber / the hairdresser / the teacher" examples go, verbatim. BRAND.md §Voice §Assume-zero-tech-background forbids profession-based examples. Kept the underlying idea as "four quiet first projects" on the home variant B only.
        </window.MkNote>
      </div>
    </div>
  );
}

function MkRationaleContinuity() {
  const inherits = [
    ['Tokens', 'tokens.css, unchanged. The whole site now imports it as source of truth.'],
    ['Typography', 'Newsreader + Inter pair B. Same weights. No exceptions.'],
    ['Outlined cards', 'Every card on marketing is outlined. Filled cards break the editorial register.'],
    ['Contrast pockets', 'One cream or mustard pocket per page, used as punctuation.'],
    ['Annie voice line', 'The mustard-ringed italic "A" from the workshop, reused on marketing whenever Annie speaks.'],
    ['Italic rule', 'Italic is emphasis, not decoration. Same rule as the workshop.'],
    ['No modals', 'Waitlist success, error, subscribe — all inline.'],
    ['No carousels', 'Audience section on home is a filmstrip, not a swiper.'],
    ['No hamburger', 'Mobile nav collapses to a typographic "Menu" fold, as-is.'],
  ];
  const new_ = [
    ['Live Hand', 'The composer talks back. Marketing-only signature.'],
    ['Draw (motion)', 'Editorial rule lines draw in as they enter the viewport. New sibling to arrive/settle/warm/point/emerge.'],
    ['Workshop window', 'A single documentary photograph frame. Once per page maximum.'],
    ['Sticky corner mark', 'The Cold Anvil mark appears lower-right on scroll as a tiny watermark, never as a CTA.'],
  ];
  return (
    <div className="mk-root" style={{padding:'72px 68px', display:'flex', flexDirection:'column', gap:28}}>
      <div style={{display:'flex', alignItems:'center', gap:14, color:'var(--ink-muted)'}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase'}}>04 · continuity with the workshop</span>
        <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
      </div>
      <h2 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:52, lineHeight:1.08, letterSpacing:'-0.018em', color:'var(--cream)', margin:0, maxWidth:'18ch'}}>
        Same product. Same <em style={{color:'var(--accent)'}}>voice</em>.
      </h2>
      <p style={{fontFamily:'var(--font-body-b)', fontSize:17, lineHeight:1.6, color:'var(--ink)', maxWidth:'56ch', margin:0}}>
        The visitor reaches the workshop and finds nothing new. Same palette, same two faces, same composer shape, same Annie. Continuity is not a stylistic decision here — it's a product decision.
      </p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, marginTop:24}}>
        <div>
          <div className="wk-eyebrow" style={{marginBottom:18}}>Inherited from the workshop — verbatim</div>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {inherits.map(([k, v]) => (
              <div key={k} style={{display:'grid', gridTemplateColumns:'140px 1fr', gap:16, fontFamily:'var(--font-body-b)', fontSize:14, lineHeight:1.55, color:'var(--ink)'}}>
                <span style={{color:'var(--cream)', fontWeight:500}}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="wk-eyebrow" style={{marginBottom:18, color:'var(--accent)'}}>New, marketing-only</div>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {new_.map(([k, v]) => (
              <div key={k} style={{display:'grid', gridTemplateColumns:'140px 1fr', gap:16, fontFamily:'var(--font-body-b)', fontSize:14, lineHeight:1.55, color:'var(--ink)'}}>
                <span style={{color:'var(--cream)', fontWeight:500}}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  MkRationaleCover, MkRationaleSignature, MkRationaleIA, MkRationaleContinuity,
});
