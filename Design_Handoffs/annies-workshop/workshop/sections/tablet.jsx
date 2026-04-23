// sections/tablet.jsx — one worked tablet example + the rule card.
// Tablet at 900×1280 (iPad-ish portrait, 1x). Shows the Build+Preview screen,
// which is the hardest 2-column layout in the product, reflowing for tablet:
// the preview drops below the conversation in a 60/40 vertical split.

// ── Tablet frame (drawn inline, consistent with Phone) ─────────────────────
function Tablet({ children }) {
  return (
    <div style={{
      width:'100%', height:'100%',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px 0',
      background:'var(--bg)',
      boxSizing:'border-box',
    }}>
      <div style={{
        width: 940, height: 1220,
        borderRadius: 28,
        background:'#0e0d0c',
        border:'1px solid var(--border-subtle)',
        padding: 14,
        boxSizing:'border-box',
        position:'relative',
      }}>
        <div style={{
          width: 912, height: 1192,
          borderRadius: 18,
          overflow:'hidden',
          background:'var(--bg)',
          position:'relative',
        }}>
          {/* front camera dot */}
          <div style={{
            position:'absolute', top:10, left:'50%', transform:'translateX(-50%)',
            width:6, height:6, borderRadius:'50%',
            background:'color-mix(in oklab, #fff 18%, transparent)',
            zIndex:5,
          }}/>
          <div style={{position:'absolute', inset:0}}>{children}</div>
        </div>
      </div>
    </div>
  );
}

// ── Tablet worked example: the Build-with-preview surface. ─────────────────
// At tablet portrait, the two-column desktop layout stacks vertically:
// conversation on top (55%), preview below (45%). Sidebar becomes a slim rail.
function TabletBuildScreen() {
  const tasks = [
    {label: 'Laying out your hero with the chip-in-together message', state:'done'},
    {label: 'Building the waitlist form and connecting it to your inbox', state:'doing'},
    {label: 'Writing the "how it works" section in your voice', state:'queued'},
  ];
  return (
    <Tablet>
      <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateColumns:'72px 1fr', height:'100%', background:'var(--bg)'}}>
        {/* Slim icon rail (sidebar collapses at tablet) */}
        <aside style={{borderRight:'1px solid var(--border-subtle)', padding:'18px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:22}}>
          <div style={{color:'var(--accent)'}}><ColdAnvilMark size={22}/></div>
          <div style={{height:1, width:36, background:'var(--border-subtle)'}}/>
          {[
            {i:<Icon.Chat size={18}/>, active:true, l:'Talk'},
            {i:<Icon.Doc size={18}/>, l:'Vision'},
            {i:<Icon.Globe size={18}/>, l:'Preview'},
            {i:<Icon.Settle size={18}/>, l:'Ledger'},
          ].map((t, i) => (
            <div key={i} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:3, color: t.active ? 'var(--cream)' : 'var(--ink-dim)'}}>
              <div style={{
                width:34, height:34, borderRadius:6,
                display:'grid', placeItems:'center',
                background: t.active ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : 'transparent',
                border: t.active ? '1px solid color-mix(in oklab, var(--accent) 30%, transparent)' : '1px solid transparent',
              }}>{t.i}</div>
              <div style={{fontSize:9, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'var(--font-body)'}}>{t.l}</div>
            </div>
          ))}
        </aside>

        {/* Main area: header + stacked conversation/preview */}
        <main style={{display:'grid', gridTemplateRows:'48px 1fr', minWidth:0, minHeight:0}}>
          <header style={{display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', padding:'0 22px', borderBottom:'1px solid var(--border-subtle)', gap:14, color:'var(--ink-muted)', fontSize:13, fontFamily:'var(--font-body)'}}>
            <span>Copper Kettle</span>
            <span/>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <Chip live>preview running</Chip>
            </div>
          </header>

          {/* 55 / 45 vertical split — this is the tablet rule. */}
          <div style={{display:'grid', gridTemplateRows:'minmax(0, 0.55fr) minmax(0, 0.45fr)', minHeight:0}}>
            {/* Conversation + composer (scrolls) */}
            <div style={{display:'grid', gridTemplateRows:'1fr auto', minHeight:0, borderBottom:'1px solid var(--border-subtle)'}}>
              <div className="wk-scroll" style={{padding:'22px 28px 14px', display:'flex', flexDirection:'column', gap:16, minHeight:0, overflow:'auto'}}>
                <StruckPlan stamp="accepted · v1" date="23 apr 2026">
                  I&apos;m going to build you a <em>one-page Copper Kettle</em> site with a waitlist form that sends submissions to an inbox you control.
                </StruckPlan>

                <div className="wk-eyebrow" style={{marginTop:2}}>building · 01:42 elapsed</div>

                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {tasks.map((t, i) => (
                    <div key={i} style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:12, alignItems:'start'}}>
                      <div style={{paddingTop:4}}>
                        {t.state==='done' && <Icon.Check size={12} style={{color:'var(--accent)'}}/>}
                        {t.state==='doing' && <span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', background:'var(--accent)', animation:'mHold 1.4s ease-in-out infinite'}}/>}
                        {t.state==='queued' && <span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', border:'1px solid var(--border)'}}/>}
                      </div>
                      <div style={{fontSize:13.5, color: t.state==='done' ? 'var(--ink-muted)' : t.state==='doing' ? 'var(--cream)' : 'var(--ink-dim)', lineHeight:1.45, fontFamily:'var(--font-body)'}}>
                        {t.label}
                        {t.state==='doing' && <div style={{fontSize:11, color:'var(--ink-muted)', marginTop:2}}>≈ about a minute left</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:'10px 22px 14px', borderTop:'1px solid var(--border-subtle)', display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'end'}}>
                <div style={{border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', minHeight:44, color:'var(--ink-dim)', fontSize:13.5, lineHeight:1.4, fontFamily:'var(--font-body-paragraph)'}}>
                  pause, change direction, or just ask
                  <span className="wk-caret"/>
                </div>
                <button className="wk-btn wk-btn--primary" style={{height:44}} aria-label="Send"><Icon.ArrowUp size={14}/></button>
              </div>
            </div>

            {/* Preview below */}
            <div style={{padding:'16px 22px 18px', display:'grid', gridTemplateRows:'auto 1fr', gap:10, minHeight:0, overflow:'hidden'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                <div>
                  <div className="wk-eyebrow" style={{fontSize:10}}>live preview</div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:15, color:'var(--cream)', marginTop:2, letterSpacing:'-0.01em', fontWeight:500}}>copper-kettle.coldanvil.com</div>
                </div>
                <div style={{display:'flex', gap:6}}>
                  <button className="wk-btn wk-btn--ghost wk-btn--sm" style={{fontSize:10}}><Icon.Refresh size={10}/> refresh</button>
                </div>
              </div>
              <div style={{minHeight:0, overflow:'hidden'}}>
                <Browser height={400}><PreviewSite/></Browser>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Tablet>
  );
}

// ── The rules card: when each breakpoint applies & what changes. ───────────
function BreakpointRules() {
  const row = (range, label, rules) => (
    <div style={{display:'grid', gridTemplateColumns:'130px 140px 1fr', gap:20, padding:'16px 0', borderBottom:'1px solid var(--border-subtle)', alignItems:'baseline'}}>
      <div style={{fontFamily:'var(--font-mono)', fontSize:12, color:'var(--accent)', letterSpacing:'0.04em'}}>{range}</div>
      <div style={{fontFamily:'var(--font-display)', fontSize:17, color:'var(--cream)', letterSpacing:'-0.01em', fontWeight:500}}>{label}</div>
      <div style={{fontSize:13.5, color:'var(--ink-bright)', lineHeight:1.6, fontFamily:'var(--font-body-paragraph)'}}>{rules}</div>
    </div>
  );
  return (
    <div className="wk-root wk-type-b" style={{padding:'40px 48px', overflow:'auto', height:'100%', boxSizing:'border-box'}}>
      <div style={{maxWidth:900}}>
        <div className="wk-eyebrow">responsive system</div>
        <div style={{fontFamily:'var(--font-display)', fontSize:32, color:'var(--cream)', letterSpacing:'-0.016em', marginTop:10, lineHeight:1.15, fontWeight:500}}>
          Three breakpoints. One rule: the conversation is load-bearing.
        </div>
        <p style={{fontSize:14.5, color:'var(--ink-bright)', lineHeight:1.65, maxWidth:720, marginTop:14, fontFamily:'var(--font-body-paragraph)'}}>
          The conversation surface never yields to anything else. When space gets tight the preview drops below it, the sidebar collapses to a rail, then to a top bar, and secondary UI (metrics, ledger filters, operator history) tucks into tabs or disclosure. The composer always stays pinned above whatever input device the platform provides.
        </p>
      </div>

      <div style={{marginTop:28, borderTop:'1px solid var(--border-subtle)'}}>
        {row('≥ 1440px', 'Desktop', <>Full shell. Sidebar (232px) visible with named destinations. Conversation + preview split horizontally (440 / flex). All eight screens ship at this size; maxes out around 1920 with the conversation clamped to 880 max-width and the preview growing.</>)}
        {row('768 – 1439', 'Tablet', <>Sidebar collapses to a 72px icon rail. Two-column screens (Build, Refine, Publish, Project home) stack: conversation on top at ~55% height, preview below at ~45%. Conversation never shrinks below tablet-readable 13.5px body. Shown: one worked example at the left at 900×1280.</>)}
        {row('< 768 px', 'Mobile', <>No sidebar. Top bar with brand + project title; bottom tab bar (Talk · Vision · Preview · History) replaces the sidebar nav. Preview stops being a sibling of the conversation &mdash; it becomes a tab. Pill composer, 44px tap targets, 390px content width. All 11 screens adapted.</>)}
      </div>

      <div style={{marginTop:36, display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
        <div className="wk-card" style={{padding:'18px 22px', background:'transparent'}}>
          <div className="wk-eyebrow">invariants</div>
          <ul style={{margin:'10px 0 0', paddingLeft:18, fontSize:13.5, lineHeight:1.65, color:'var(--ink-bright)', fontFamily:'var(--font-body-paragraph)'}}>
            <li>The composer is always reachable without scrolling.</li>
            <li>Annie&apos;s voice lines keep their margin mark (&ldquo;a&rdquo; glyph) at every size.</li>
            <li>The Strike renders at the same visual weight at every breakpoint &mdash; only the font size scales.</li>
            <li>Claims remain tap-targetable; minimum touch area 44×44.</li>
          </ul>
        </div>
        <div className="wk-card" style={{padding:'18px 22px', background:'transparent'}}>
          <div className="wk-eyebrow">never-dos</div>
          <ul style={{margin:'10px 0 0', paddingLeft:18, fontSize:13.5, lineHeight:1.65, color:'var(--ink-bright)', fontFamily:'var(--font-body-paragraph)'}}>
            <li>No hamburger for the main nav on mobile &mdash; the four destinations earn permanent space.</li>
            <li>No modal dialogs at any size. Operator cards, claim challenges, and confirmations inline.</li>
            <li>No carousel. If something deserves multiple frames, it&apos;s a filmstrip, not a swiper.</li>
            <li>No responsive hack that makes a paragraph narrower than ~32ch or wider than ~72ch.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TabletBuildScreen, BreakpointRules });
