// sections/states.jsx — state library. Seven states in Annie's voice.

function StateLibrary() {
  const states = [
    {
      kicker:'01 · empty · new project',
      title:'Before anything is typed.',
      body:<AnnieLine mark="a" tail>Tell me the thing you want to make. One sentence is fine.</AnnieLine>,
      note:'The only state without a project name. The Shell sidebar reads "Untitled workshop".',
    },
    {
      kicker:'02 · listening · first turn',
      title:'Annie is forming her read.',
      body:<>
        <UserLine>A thing where my book club can swap books by post.</UserLine>
        <div style={{marginTop:14}}>
          <AnnieLine mark="a" tail>Reading. Give me a second.</AnnieLine>
        </div>
      </>,
      note:'&ldquo;Reading&rdquo; — never &ldquo;thinking&rdquo;, never &ldquo;analysing&rdquo;. Annie reads what you wrote.',
    },
    {
      kicker:'03 · building · mid-task',
      title:'Working on one specific thing.',
      body:<div>
        <AnnieLine mark="a"><em>Laying out your waitlist form</em> &mdash; the kind where the email field is big and the button says what&apos;ll happen when you press it.</AnnieLine>
        <div style={{marginTop:14, height:2, width:'45%', background:'var(--border-subtle)', position:'relative', overflow:'hidden', borderRadius:1}}>
          <div style={{position:'absolute', inset:0, background:'var(--accent)', width:'30%', animation:'mHold 1.4s ease-in-out infinite'}}/>
        </div>
      </div>,
      note:'One user-facing line per task. The motion is Hold.',
    },
    {
      kicker:'04 · failure · recoverable',
      title:'Something broke. Annie has already rolled back.',
      body:<div className="wk-card wk-card--accent" style={{padding:'18px 20px', background:'transparent'}}>
        <div className="wk-eyebrow" style={{marginBottom:8}}>something didn&apos;t land</div>
        <div style={{fontFamily:'var(--font-display)', color:'var(--cream)', fontSize:18, lineHeight:1.4, letterSpacing:'-0.01em', fontWeight:500}}>
          The newsletter section I tried to add broke the page on mobile. I&apos;ve put it back the way it was. We can try a different shape.
        </div>
        <div style={{display:'flex', gap:8, marginTop:14}}>
          <button className="wk-btn"><Icon.Refresh size={12}/> try a different shape</button>
          <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Doc size={12}/> see what I tried</button>
        </div>
      </div>,
      note:'No red. No warning icon. The border is mustard because this is Annie telling you something important — same colour as an accepted plan. She always rolls back before telling you.',
    },
    {
      kicker:'05 · reconnection · client was offline',
      title:'Your end went quiet. Annie kept going.',
      body:<AnnieLine mark="a">Your connection dropped for about a minute. I kept the page open here and finished the &ldquo;how it works&rdquo; rewrite. Nothing&apos;s been lost &mdash; it&apos;s waiting above.</AnnieLine>,
      note:'Annie does not apologise for your Wi-Fi. She tells you what she did while you were gone.',
    },
    {
      kicker:'06 · publishing · certificates issuing',
      title:'On the way to the real domain.',
      body:<div className="wk-card" style={{padding:'16px 18px', background:'transparent'}}>
        <div className="wk-eyebrow" style={{marginBottom:8}}>publishing copper-kettle.co</div>
        <div style={{display:'grid', gap:8, fontSize:14}}>
          <div style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:10, alignItems:'center'}}><Icon.Check size={13} style={{color:'var(--accent)'}}/><span>Inbox receives mail.</span></div>
          <div style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:10, alignItems:'center'}}><Icon.Check size={13} style={{color:'var(--accent)'}}/><span>Domain points the right way.</span></div>
          <div style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:10, alignItems:'center'}}><span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', background:'var(--accent)', animation:'mHold 1.4s ease-in-out infinite'}}/><span style={{color:'var(--cream)'}}>Certificate issuing <span style={{color:'var(--ink-muted)'}}>(≈ 40s)</span></span></div>
        </div>
      </div>,
      note:'Three checks. Plain words. No &ldquo;DNS propagation&rdquo;, no acronyms.',
    },
    {
      kicker:'07 · deployed · first time live',
      title:'Publishing is another accepted plan.',
      body:<StruckPlan stamp="accepted · published" date="23 apr · 14:22">
        <em>copper-kettle.co</em> is live. I checked that the form delivers and the certificate is valid. You&apos;re at the real address now.
      </StruckPlan>,
      note:'Publishing is another accepted plan, not a celebration. The same gesture as every other commitment.',
    },
  ];
  return (
    <div className="wk-root wk-type-b" style={{padding:'36px 40px 40px', overflow:'auto', height:'100%', boxSizing:'border-box'}}>
      <SectionHead
        kicker="state library"
        title="Seven states. All in Annie's voice."
        sub="Every notification, loader, and error case in the product has to obey §9 of the spec: short, specific, a hand on the shoulder. None of these are toasts. None of them shout."
      />
      <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:18}}>
        {states.map((s, i) => (
          <div key={i} className="wk-card" style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:12, background:'transparent'}}>
            <div className="wk-eyebrow">{s.kicker}</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:19, color:'var(--cream)', letterSpacing:'-0.012em', lineHeight:1.3, fontWeight:500}}>{s.title}</div>
            <div style={{minHeight:60}}>{s.body}</div>
            <div style={{height:1, background:'var(--border-subtle)'}}/>
            <div style={{fontSize:12, color:'var(--ink-muted)', lineHeight:1.55}} dangerouslySetInnerHTML={typeof s.note === 'string' ? {__html:s.note} : null}>{typeof s.note !== 'string' ? s.note : null}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { StateLibrary });
