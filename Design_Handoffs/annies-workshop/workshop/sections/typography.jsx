// sections/typography.jsx — three pairings side-by-side, same content in each.
// Renders the key type moments users encounter: display, artefact title, body paragraph,
// Annie line, plan card, UI label, mono stamp, caption.

function TypeSample({typeClass, title, notes, displayFont, bodyFont, label, status = 'alternate'}) {
  const isLocked = status === 'locked';
  return (
    <div className={'wk-root ' + typeClass} style={{padding:'40px 36px', overflow:'auto', height:'100%', boxSizing:'border-box', position:'relative'}}>
      {isLocked && (
        <div style={{position:'absolute', top:20, right:20, fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--accent)', border:'1px solid var(--accent)', borderRadius:2, padding:'3px 8px'}}>
          locked · 23 apr
        </div>
      )}
      {!isLocked && (
        <div style={{position:'absolute', top:20, right:20, fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-muted)', border:'1px solid var(--border-subtle)', borderRadius:2, padding:'3px 8px'}}>
          not selected
        </div>
      )}
      <div style={{display:'grid', gridTemplateColumns:'1fr', gap:20, opacity: isLocked ? 1 : 0.78}}>

        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:16}}>
          <div>
            <div className="wk-eyebrow">{label} · typography proposal</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:30, color:'var(--cream)', marginTop:8, letterSpacing:'-0.018em', fontWeight:500}}>{title}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11, color:'var(--ink-dim)', fontFamily:'var(--font-mono)'}}>display</div>
            <div style={{color:'var(--ink)', fontSize:13, fontFamily:'var(--font-body)', marginTop:2}}>{displayFont}</div>
            <div style={{fontSize:11, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', marginTop:6}}>body</div>
            <div style={{color:'var(--ink)', fontSize:13, fontFamily:'var(--font-body)', marginTop:2}}>{bodyFont}</div>
          </div>
        </div>

        <div style={{height:1, background:'var(--border-subtle)'}}/>

        {/* Display size — the first thing on the marketing page */}
        <div>
          <div className="wk-eyebrow" style={{marginBottom:6}}>display · 52/1.05</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:52, lineHeight:1.05, color:'var(--cream)', letterSpacing:'-0.022em', fontWeight:500}}>
            You have an idea.<br/>We&apos;ll build it.
          </div>
        </div>

        {/* Artefact title + italic accent — the vision doc moment */}
        <div>
          <div className="wk-eyebrow" style={{marginBottom:6}}>artefact title · 30/1.2 with italic</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:30, lineHeight:1.2, color:'var(--cream)', letterSpacing:'-0.015em', fontWeight:500}}>
            A group gift coordinator for <em style={{color:'var(--accent)', fontStyle:'italic'}}>people who already know</em> what to buy.
          </div>
        </div>

        {/* Body paragraph — the core readability test */}
        <div>
          <div className="wk-eyebrow" style={{marginBottom:6}}>body · 16/1.62</div>
          <p style={{fontFamily:'var(--font-body-paragraph)', fontSize:16, lineHeight:1.62, color:'var(--ink-bright)', margin:0, maxWidth:520}}>
            Copper Kettle is for friends who already know what they want to give and just can&apos;t figure out how to chip in together. It is not a general-purpose gifting marketplace. It does one thing well &mdash; it collects money for a known gift and sends the money when the group hits its target.
          </p>
        </div>

        {/* Annie line — the most common text surface */}
        <div>
          <div className="wk-eyebrow" style={{marginBottom:6}}>Annie line · 16/1.62 with mark</div>
          <div className="wk-annie-line">
            <div className="wk-annie-mark" aria-hidden>a</div>
            <div className="wk-annie-body">
              So you want to make chipping in for a birthday gift feel like the group conversation, not like a spreadsheet. <em style={{color:'var(--cream)', fontStyle:'italic'}}>Is that the shape?</em>
            </div>
          </div>
        </div>

        {/* Plan sentence — the signature */}
        <div>
          <div className="wk-eyebrow" style={{marginBottom:6}}>plan · 24/1.35 on cream</div>
          <div className="wk-struck" style={{padding:'20px 22px'}}>
            <div className="wk-struck__eyebrow">Annie’s plan</div>
            <div className="wk-struck__sentence">
              I&apos;m going to build you a one-page site with a waitlist form that sends submissions to an inbox you control.
            </div>
            <div className="wk-struck__stamp">accepted · 23 apr</div>
          </div>
        </div>

        {/* UI row — buttons, chips, caption */}
        <div>
          <div className="wk-eyebrow" style={{marginBottom:8}}>UI · sans · 14/1.45</div>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            <button className="wk-btn wk-btn--primary">Accept plan</button>
            <button className="wk-btn">Refine</button>
            <Chip accent>pending</Chip>
            <Chip live>preview running</Chip>
            <span style={{fontSize:12, color:'var(--ink-muted)', fontFamily:'var(--font-body)'}}>You can unstrike at any time.</span>
          </div>
        </div>

        {/* Mono — stamps, URLs */}
        <div>
          <div className="wk-eyebrow" style={{marginBottom:6}}>mono · JetBrains · 11/1.4</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)', letterSpacing:'0.04em'}}>
            copper-kettle.coldanvil.com  ·  v3 accepted · 23 apr 2026 · 14:22
          </div>
        </div>

        <div style={{height:1, background:'var(--border-subtle)', margin:'4px 0'}}/>

        <div style={{color:'var(--ink-muted)', fontSize:13, lineHeight:1.58}}>
          <div className="wk-eyebrow" style={{marginBottom:6}}>notes</div>
          {notes}
        </div>

      </div>
    </div>
  );
}

function TypePairingA() {
  return (
    <TypeSample
      label="A"
      status="alternate"
      typeClass="wk-type-a"
      title="IBM Plex — engineered-warm"
      displayFont="IBM Plex Serif 500"
      bodyFont="IBM Plex Sans 400/500"
      notes={<span>
        Plex Serif has the authority of a serif without Newsreader&apos;s optical problems at small sizes. Plex Sans is the warmest humanist sans in the WCAG-safe band on our palette &mdash; it reads as <em style={{color:'var(--cream)', fontStyle:'italic'}}>made by engineers who also read books</em>. This is the most consistent with the &ldquo;sans for everything&rdquo; answer while still carrying the editorial register. <strong style={{color:'var(--cream)'}}>Body contrast on `#d4be9a`:</strong> AAA.
      </span>}
    />
  );
}
function TypePairingB() {
  return (
    <TypeSample
      label="B"
      status="locked"
      typeClass="wk-type-b"
      title="Newsreader display + Inter body"
      displayFont="Newsreader 500 (display only)"
      bodyFont="Inter 400/500"
      notes={<span>
        <strong style={{color:'var(--cream)'}}>Locked 23 apr.</strong> Keeps Newsreader on the manifesto moments where it earns its place &mdash; display, artefact titles, italicised accents, manifesto quotes &mdash; and swaps the body to Inter at 16/1.62 for every paragraph, Annie line, UI label, and caption. The boundary is the rule: <em style={{color:'var(--cream)', fontStyle:'italic'}}>Newsreader never sets body.</em> Propagated across the rest of this package.
      </span>}
    />
  );
}
function TypePairingC() {
  return (
    <TypeSample
      label="C"
      status="alternate"
      typeClass="wk-type-c"
      title="Fraunces display + Source Serif 4 body"
      displayFont="Fraunces 500 (opsz 96)"
      bodyFont="Source Serif 4 400/500"
      notes={<span>
        All-serif editorial. Fraunces at display sizes is the most expressive of the three &mdash; there is a real craftsperson&apos;s hand in the curves. Source Serif 4 is Google&apos;s answer to Pollen and reads cleanly at 16px on this palette. Against your &ldquo;sans for everything&rdquo; answer, this is the outlier &mdash; I include it because it is the strongest <em style={{color:'var(--cream)', fontStyle:'italic'}}>visual</em> answer to the spec&apos;s craftsperson register. If you want the product to feel like a book, this is the one.
      </span>}
    />
  );
}

Object.assign(window, { TypePairingA, TypePairingB, TypePairingC });
