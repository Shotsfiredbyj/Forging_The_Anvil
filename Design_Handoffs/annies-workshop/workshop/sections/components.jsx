// sections/components.jsx — the component spec. Every atom with tokens.

function Spec({label, children, note}){
  return (
    <div style={{display:'grid', gridTemplateColumns:'180px 1fr 220px', gap:24, padding:'22px 0', borderTop:'1px solid var(--border-subtle)', alignItems:'start'}}>
      <div className="wk-eyebrow" style={{paddingTop:4}}>{label}</div>
      <div>{children}</div>
      <div style={{fontSize:11.5, color:'var(--ink-muted)', lineHeight:1.6, fontFamily:'var(--font-body)'}}>{note}</div>
    </div>
  );
}

function ComponentSpec() {
  return (
    <div className="wk-root wk-type-b" style={{padding:'36px 40px 40px', overflow:'auto', height:'100%', boxSizing:'border-box'}}>
      <SectionHead
        kicker="component spec"
        title="Every atom, every token."
        sub="Implementable without another design round. CSS variables are in tokens.css. Classes are wk-*."
      />

      <Spec label="button / primary" note="mustard #d4be9a on dark ink · radius 6 · 10/16 pad · 14/1.45 sans. Warms on hover (brightness 1.05).">
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <button className="wk-btn wk-btn--primary">Accept plan</button>
          <button className="wk-btn wk-btn--primary wk-btn--sm"><Icon.ArrowUp size={12}/> Send</button>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)'}}>.wk-btn.wk-btn--primary</span>
        </div>
      </Spec>

      <Spec label="button / secondary" note="1px border · transparent bg · warms to cream on hover. Used for refine, open as doc, etc.">
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <button className="wk-btn">Refine</button>
          <button className="wk-btn wk-btn--sm"><Icon.Doc size={11}/> open as doc</button>
          <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Refresh size={11}/> refresh</button>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)'}}>.wk-btn / .wk-btn--ghost</span>
        </div>
      </Spec>

      <Spec label="chip" note="22px tall · 1px border · used for status (pending / live) and tags. Accent, live, default variants.">
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <Chip>v3 · accepted</Chip>
          <Chip accent>pending</Chip>
          <Chip live>preview running</Chip>
          <Chip live>live · 3 days</Chip>
        </div>
      </Spec>

      <Spec label="input" note="radius 6 · 14/16 pad · border warms to accent on focus (motion: Warm).">
        <input className="wk-input" placeholder="your email address" style={{maxWidth:320}} />
      </Spec>

      <Spec label="Annie line" note="24px circle mark, italic letter (a / a.n / a.o for operator mode) · body at 16/1.62 in paragraph type. Italic-as-emphasis only.">
        <AnnieLine>
          I&apos;m <em>reading</em> what you wrote. One moment.
        </AnnieLine>
      </Spec>

      <Spec label="user line" note="left rule 2px ink-dim · &ldquo;you&rdquo; kicker above · body at 16/1.58.">
        <UserLine>A thing where my book club can swap books by post.</UserLine>
      </Spec>

      <Spec label="claim · challengeable phrase" note="6px mustard bar under the phrase (ink-dim when cool, 40% accent on hover, 25% accent fill when hot). Click-to-challenge.">
        <div style={{fontFamily:'var(--font-body-paragraph)', fontSize:15, lineHeight:1.7, color:'var(--ink-bright)', maxWidth:600}}>
          Copper Kettle is for <Claim>people who already know what to buy</Claim>. The recipient <Claim hot>never sees the pool</Claim> &mdash; it&apos;s a surprise.
        </div>
      </Spec>

      <Spec label="Plan card — pending" note="dashed border · cream-less · Accept + Refine buttons · auxiliary verb links below. Motion: cursor-tail on the caret while the sentence types in.">
        <StruckPlan pending>I&apos;m going to build you a <em>one-page site</em> with a waitlist form.</StruckPlan>
      </Spec>

      <Spec label="Plan card — accepted" note="solid accent border · cream fill · impression stamp bottom-right. Motion: Settle (280ms).">
        <StruckPlan stamp="accepted · v1" date="23 apr 2026">I&apos;m going to build you a <em>one-page site</em> with a waitlist form.</StruckPlan>
      </Spec>

      <Spec label="browser chrome" note="three dots · URL pill with Live badge · one ghost button. Used only for the live preview.">
        <Browser url="copper-kettle.co" state="live" height={180}>
          <div style={{padding:'28px 30px', fontFamily:'Fraunces, Georgia, serif', color:'#111', fontSize:22, letterSpacing:'-0.01em'}}>Chip in together.</div>
        </Browser>
      </Spec>

      <Spec label="composer" note="one-line input that expands · attach chip above for pointed-at selections · Enter sends · persistent across all views.">
        <div className="wk-card" style={{padding:0, background:'transparent', overflow:'hidden'}}>
          <div style={{padding:'12px 14px', fontSize:15, color:'var(--ink-dim)', fontFamily:'var(--font-body-paragraph)'}}>
            keep typing — Annie is listening <span className="wk-caret"/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px', borderTop:'1px solid var(--border-subtle)', fontSize:11, color:'var(--ink-dim)'}}>
            <span>Enter to send · Shift+Enter for a new line</span>
            <button className="wk-btn wk-btn--primary wk-btn--sm"><Icon.ArrowUp size={12}/></button>
          </div>
        </div>
      </Spec>

      <Spec label="ledger row" note="82px date gutter in mono · status dot column · body. Accepted rows in cream, operator in ink, undo in italic ink-muted.">
        <div style={{display:'grid', gridTemplateColumns:'82px 24px 1fr', gap:'0 18px', alignItems:'baseline'}}>
          <div style={{color:'var(--ink-dim)', fontFamily:'var(--font-mono)', fontSize:11, textAlign:'right'}}>23 apr</div>
          <div style={{display:'grid', placeItems:'center'}}><span style={{display:'inline-block', width:7, height:7, borderRadius:'50%', background:'var(--accent)'}}/></div>
          <div style={{color:'var(--cream)', fontSize:14}}>Annie’s plan: <em>&ldquo;Build a one-page Copper Kettle.&rdquo;</em> <span style={{color:'var(--ink-dim)'}}></span></div>
        </div>
      </Spec>

      <Spec label="palette" note="Bullfinch Forge, locked. Mustard = moments. Olive = non-text only. Cream on dark at AAA.">
        <div style={{display:'flex', gap:10}}>
          {[
            {name:'bg0s', v:'var(--ca-bg0s)', ink:'var(--cream)'},
            {name:'bg1',  v:'var(--ca-bg1)',  ink:'var(--cream)'},
            {name:'accent', v:'var(--accent)', ink:'var(--ca-bg0s)'},
            {name:'cream', v:'var(--cream)', ink:'var(--ca-bg0s)'},
            {name:'olive', v:'var(--ca-olive)', ink:'var(--cream)'},
          ].map(c => (
            <div key={c.name} style={{width:80, aspectRatio:'1', background:c.v, color:c.ink, borderRadius:6, padding:10, display:'flex', flexDirection:'column', justifyContent:'space-between', fontSize:11, fontFamily:'var(--font-mono)', border:'1px solid var(--border-subtle)'}}>
              <span>{c.name}</span><span style={{fontSize:10}}>{c.v.replace('var(--','--').replace(')','')}</span>
            </div>
          ))}
        </div>
      </Spec>

      <Spec label="type scale" note="display is the proposed face (A/B/C, locked in feedback). Body is its sibling. Mono is JetBrains.">
        <div style={{display:'grid', gap:8}}>
          <div style={{fontFamily:'var(--font-display)', fontSize:44, color:'var(--cream)', letterSpacing:'-0.022em', lineHeight:1, fontWeight:500}}>Display · 44</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:28, color:'var(--cream)', letterSpacing:'-0.015em', fontWeight:500}}>Display · 28</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:20, color:'var(--cream)', fontStyle:'italic'}}>Accent italic · 20</div>
          <div style={{fontFamily:'var(--font-body-paragraph)', fontSize:16, lineHeight:1.62, color:'var(--ink-bright)'}}>Body paragraph · 16/1.62</div>
          <div style={{fontFamily:'var(--font-body)', fontSize:14, color:'var(--ink)'}}>Body UI · 14/1.45</div>
          <div style={{fontFamily:'var(--font-body)', fontSize:11, color:'var(--ink-dim)', textTransform:'uppercase', letterSpacing:'0.18em', fontWeight:500}}>Eyebrow · 11 tracked 0.18em</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)', letterSpacing:'0.04em'}}>mono · 11 · accepted · 23 apr</div>
        </div>
      </Spec>

      <Spec label="spacing & radii" note="Base 4. Radii 4 / 6 / 10. No hard corners above radius 10 anywhere in the app.">
        <div style={{display:'flex', gap:14, alignItems:'flex-end'}}>
          {[4,8,12,16,24,32].map(n => (
            <div key={n} style={{textAlign:'center'}}>
              <div style={{width:n, height:24, background:'var(--ink-muted)', borderRadius:2, marginBottom:4}}/>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-dim)'}}>{n}</div>
            </div>
          ))}
        </div>
      </Spec>

    </div>
  );
}

Object.assign(window, { ComponentSpec });
