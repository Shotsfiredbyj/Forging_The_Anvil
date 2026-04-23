// sections/mobile.jsx — three signature surfaces adapted to 390px.
// Shows the responsive thinking, not a full catalogue. Each artboard is 390×844
// (iPhone 15 content area). The phone bezel is drawn inline so the artboard
// has no extra chrome; the frame is part of the design statement.
//
// Surfaces chosen:
//   · Workshop + Annie       — the conversation, which is the whole product
//   · Plan / Strike moment   — the signature, proving it holds on a small canvas
//   · Project home (return)  — the ongoing relationship, proving multi-panel
//                              layouts collapse honestly rather than shrink.
//
// The locked type pair (Newsreader display + Inter body) carries without change.
// Only the sidebar and two-column preview layouts adapt.

// ── Phone frame (drawn inline, not a starter) ──────────────────────────────
// Content area is always 390×844. Frame adds 16px bezel on each side.
function Phone({ children, timeHint = '9:41', statusTint = 'var(--cream)' }) {
  return (
    <div style={{
      width:'100%', height:'100%',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px 0',
      background: 'var(--bg)',
      boxSizing:'border-box',
    }}>
      <div style={{
        width: 410, height: 820,
        borderRadius: 46,
        background: '#0e0d0c',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03) inset, 0 -1px 0 rgba(0,0,0,0.6) inset',
        padding: 10,
        boxSizing:'border-box',
        position:'relative',
      }}>
        <div style={{
          width: 390, height: 800,
          borderRadius: 38,
          overflow:'hidden',
          background:'var(--bg)',
          position:'relative',
        }}>
          {/* status bar */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, height:44,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0 28px',
            fontFamily:'var(--font-body)', fontWeight:600, fontSize:14,
            color: statusTint,
            zIndex: 5,
            pointerEvents:'none',
          }}>
            <span>{timeHint}</span>
            <span style={{display:'flex', alignItems:'center', gap:6, opacity:0.92}}>
              <svg width="17" height="11" viewBox="0 0 17 11"><path d="M1 9.5L4 6.5M4.5 9.5L8 4M8.5 9.5L13 1M13.5 9.5L17 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/></svg>
              <span style={{fontSize:12, letterSpacing:'0.02em'}}>5G</span>
              <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="1" width="20" height="9" rx="2.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/><rect x="2" y="2.5" width="14" height="6" rx="1.2" fill="currentColor"/><rect x="21" y="4" width="1.6" height="3" rx="0.6" fill="currentColor" opacity="0.5"/></svg>
            </span>
          </div>
          {/* dynamic island */}
          <div style={{
            position:'absolute', top:10, left:'50%', transform:'translateX(-50%)',
            width: 122, height: 34,
            background:'#000',
            borderRadius: 20,
            zIndex: 4,
          }}/>
          {/* content */}
          <div style={{position:'absolute', inset:0, paddingTop:44}}>
            {children}
          </div>
          {/* home indicator */}
          <div style={{
            position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)',
            width: 134, height: 5, borderRadius: 2.5,
            background:'var(--ink)',
            opacity: 0.55,
            zIndex: 5,
          }}/>
        </div>
      </div>
    </div>
  );
}

// ── Mobile top bar: brand, project, menu. Replaces the sidebar.
function MobileTopBar({ project = 'Copper Kettle', section = 'Conversation', right }) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'auto 1fr auto',
      alignItems:'center', gap:12,
      padding:'10px 20px 12px',
      borderBottom:'1px solid var(--border-subtle)',
      background:'var(--bg)',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:8, color:'var(--accent)'}}>
        <ColdAnvilMark size={18}/>
      </div>
      <div style={{minWidth:0}}>
        <div style={{
          fontFamily:'var(--font-display)', fontSize:15, color:'var(--cream)',
          letterSpacing:'-0.01em', fontWeight:500,
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>{project}</div>
        <div style={{
          fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase',
          color:'var(--ink-dim)', fontFamily:'var(--font-body)', marginTop:1,
        }}>{section}</div>
      </div>
      {right || (
        <button className="wk-btn wk-btn--ghost wk-btn--sm" style={{padding:'6px 8px'}} aria-label="Menu">
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      )}
    </div>
  );
}

// ── Mobile tab bar: the 4 artefact/verb destinations the sidebar exposes on desktop.
function MobileTabBar({ active = 'chat' }) {
  const tabs = [
    { id:'chat',    label:'Talk',    icon:<Icon.Chat size={16}/> },
    { id:'vision',  label:'Vision',  icon:<Icon.Doc size={16}/> },
    { id:'preview', label:'Preview', icon:<Icon.Globe size={16}/> },
    { id:'ledger',  label:'History', icon:<Icon.Settle size={16}/> },
  ];
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'repeat(4, 1fr)',
      borderTop:'1px solid var(--border-subtle)',
      background:'var(--bg)',
      padding:'6px 0 14px',
    }}>
      {tabs.map(t => (
        <div key={t.id} style={{
          display:'flex', flexDirection:'column', alignItems:'center', gap:3,
          padding:'6px 0 2px',
          color: active === t.id ? 'var(--cream)' : 'var(--ink-dim)',
          fontFamily:'var(--font-body)',
          fontSize: 10, letterSpacing:'0.06em', textTransform:'uppercase',
        }}>
          <span style={{opacity: active === t.id ? 1 : 0.75}}>{t.icon}</span>
          <span style={{fontWeight: active === t.id ? 500 : 400}}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Mobile composer. Single-row, pill-shaped, stretches full width above tab bar.
function MobileComposer({ value = '', placeholder = 'keep talking — Annie is listening', attach }) {
  return (
    <div style={{
      padding:'10px 16px 10px',
      borderTop:'1px solid var(--border-subtle)',
      background:'var(--bg)',
    }}>
      {attach && (
        <div style={{marginBottom:8, display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--ink-muted)'}}>
          <Chip accent>{attach}</Chip>
        </div>
      )}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr auto', gap:8, alignItems:'stretch',
      }}>
        <div style={{
          border:'1px solid var(--border)', borderRadius: 22,
          padding:'10px 14px',
          color: value ? 'var(--ink-bright)' : 'var(--ink-dim)',
          fontSize:14, lineHeight:1.4, fontFamily:'var(--font-body-paragraph)',
          minHeight: 44, display:'flex', alignItems:'center',
        }}>
          {value || placeholder}
          {!value && <span className="wk-caret" style={{marginLeft:2}}/>}
        </div>
        <button className="wk-btn wk-btn--primary" style={{
          alignSelf:'stretch', width:44, minWidth:44, padding:0, borderRadius:22, justifyContent:'center',
        }} aria-label="Send"><Icon.ArrowUp size={14}/></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M1 · Workshop + Annie — the conversation. The most common surface.
// ════════════════════════════════════════════════════════════════════════════
function MobileScreenConversation() {
  return (
    <Phone>
      <div className="wk-root wk-type-b" style={{
        display:'grid', gridTemplateRows:'auto 1fr auto auto',
        height:'100%', minHeight:0, background:'var(--bg)',
      }}>
        <MobileTopBar project="Copper Kettle" section="Conversation" />

        <div className="wk-scroll" style={{
          padding:'20px 18px 16px', display:'flex', flexDirection:'column', gap:20,
          minHeight:0, overflow:'auto',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:8, color:'var(--ink-dim)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase'}}>
            <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
            <span>4 turns in</span>
            <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
          </div>

          <AnnieLine>
            So you want <Claim>chipping in</Claim> for a group gift to feel like the group conversation, not like a spreadsheet. The person who starts it is the <Claim>organiser</Claim>.
          </AnnieLine>

          <UserLine>
            Yes. The gift is always for someone outside the group — a parent or teacher. The organiser picks it.
          </UserLine>

          <AnnieLine mark="a">
            Good. That simplifies a lot. The <Claim hot>gift is chosen up front by one person</Claim>, and the rest is about collecting money without the back-and-forth. You&apos;re not building a gift-picker &mdash; you&apos;re building a <em>pool with a target and a deadline</em>.
          </AnnieLine>

          <AnnieLine mark="a" tail>
            One more thing &mdash; does the recipient know the gift is coming?
          </AnnieLine>
        </div>

        <MobileComposer placeholder="reply to Annie"/>
        <MobileTabBar active="chat"/>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M2 · The Plan / Strike moment — the signature at small size.
// The whole screen is the plan. No split, no preview. Just the sentence.
// ════════════════════════════════════════════════════════════════════════════
function MobileScreenPlan() {
  return (
    <Phone>
      <div className="wk-root wk-type-b" style={{
        display:'grid', gridTemplateRows:'auto 1fr auto auto',
        height:'100%', minHeight:0, background:'var(--bg)',
      }}>
        <MobileTopBar project="Copper Kettle" section="Plan" />

        <div className="wk-scroll" style={{
          padding:'22px 18px 18px', display:'flex', flexDirection:'column', gap:18,
          minHeight:0, overflow:'auto',
        }}>
          <AnnieLine mark="a">
            Here&apos;s what I&apos;m going to do first. <em>Accept it to start, or keep talking to refine.</em>
          </AnnieLine>

          {/* Pending plan, scaled down. Keeps the mustard accent ring + ritual intact. */}
          <StruckPlan pending>
            I&apos;m going to build you a <em>one-page Copper Kettle</em> site with a waitlist form that sends submissions to an inbox you control.
          </StruckPlan>

          <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:10, color:'var(--ink-muted)', fontSize:12.5, alignItems:'start'}}>
            <Icon.Dot size={5} style={{color:'var(--ink-dim)', marginTop:7}}/>
            <div>
              Want me to <Claim>add a pricing page</Claim>, <Claim>hold the waitlist</Claim>, or <Claim>propose something else</Claim>? Tap anything underlined.
            </div>
          </div>

          <div className="wk-ruler"/>

          <div style={{opacity:0.5, pointerEvents:'none'}}>
            <div className="wk-eyebrow" style={{marginBottom:10}}>preview · after you accept</div>
            <StruckPlan stamp="accepted · v1" date="23 apr 2026">
              I&apos;m going to build you a <em>one-page Copper Kettle</em> site with a waitlist form that sends submissions to an inbox you control.
            </StruckPlan>
          </div>
        </div>

        <MobileComposer placeholder="keep refining, or accept above"/>
        <MobileTabBar active="chat"/>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M3 · Project home (returning user). Two-column desktop → stacked sections.
// The preview is a peek, not the main event. Annie still leads.
// ════════════════════════════════════════════════════════════════════════════
function MobileScreenHome() {
  return (
    <Phone>
      <div className="wk-root wk-type-b" style={{
        display:'grid', gridTemplateRows:'auto 1fr auto',
        height:'100%', minHeight:0, background:'var(--bg)',
      }}>
        <MobileTopBar project="Copper Kettle" section="Home"
          right={<Chip live style={{fontSize:10}}>live · 3d</Chip>} />

        <div className="wk-scroll" style={{
          padding:'18px 18px 18px', display:'flex', flexDirection:'column', gap:18,
          minHeight:0, overflow:'auto',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:8, color:'var(--ink-dim)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase'}}>
            <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
            <span>last accepted · 3 days ago</span>
            <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
          </div>

          <AnnieLine>
            Welcome back. Since you left, <em>14 people</em> joined your waitlist &mdash; they&apos;re in your inbox.
          </AnnieLine>

          <AnnieLine mark="a">
            Two things you could do next: <Claim>draft a first newsletter to those 14</Claim>, or <Claim>add the &ldquo;about the organiser&rdquo; section</Claim>.
          </AnnieLine>

          {/* Metric strip — horizontal, three cards */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
            <div className="wk-card" style={{padding:'10px 10px'}}>
              <div className="wk-eyebrow" style={{fontSize:9}}>signups</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:20, color:'var(--cream)', marginTop:2, letterSpacing:'-0.01em', fontWeight:500, lineHeight:1}}>14</div>
              <div style={{fontSize:10, color:'var(--accent)', fontStyle:'italic', fontFamily:'var(--font-display)', marginTop:2}}>+14 this week</div>
            </div>
            <div className="wk-card" style={{padding:'10px 10px'}}>
              <div className="wk-eyebrow" style={{fontSize:9}}>visitors</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:20, color:'var(--cream)', marginTop:2, letterSpacing:'-0.01em', fontWeight:500, lineHeight:1}}>208</div>
              <div style={{fontSize:10, color:'var(--ink-muted)', marginTop:2}}>this week</div>
            </div>
            <div className="wk-card" style={{padding:'10px 10px'}}>
              <div className="wk-eyebrow" style={{fontSize:9}}>uptime</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:20, color:'var(--cream)', marginTop:2, letterSpacing:'-0.01em', fontWeight:500, lineHeight:1}}>100<span style={{fontSize:12, color:'var(--ink-dim)'}}>%</span></div>
              <div style={{fontSize:10, color:'var(--ink-muted)', marginTop:2}}>3 days</div>
            </div>
          </div>

          {/* Live-site peek — a miniature browser. */}
          <div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
              <div className="wk-eyebrow">your live site</div>
              <button className="wk-btn wk-btn--ghost wk-btn--sm" style={{padding:'4px 6px', fontSize:11}}><Icon.Globe size={11}/> visit</button>
            </div>
            <Browser url="copper-kettle.co" height={260}><PreviewSite/></Browser>
          </div>
        </div>

        <MobileTabBar active="chat"/>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M4 · Arrival. The user just arrived from coldanvil.com. Annie's first line
// is a reading of what they typed — not a greeting.
// ════════════════════════════════════════════════════════════════════════════
function MobileScreenArrival() {
  return (
    <Phone>
      <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateRows:'auto 1fr auto auto', height:'100%', minHeight:0, background:'var(--bg)'}}>
        <MobileTopBar project="Untitled workshop" section="Conversation" />

        <div className="wk-scroll" style={{padding:'20px 18px 16px', display:'flex', flexDirection:'column', gap:20, minHeight:0, overflow:'auto'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, color:'var(--ink-dim)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase'}}>
            <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
            <span>from the homepage</span>
            <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
          </div>

          <UserLine>
            I want a simple site for a group gift coordinator. My friends and I keep doing the awkward spreadsheet thing for birthdays. There should be one person who starts it and everyone else just chips in with one tap.
          </UserLine>

          <AnnieLine>
            So you want to make the <em>chipping in</em> part of a group gift feel like the group conversation, not like a spreadsheet. The organiser starts it; everyone else is a one-tap guest. <em>Is that the shape?</em>
          </AnnieLine>

          <AnnieLine mark="a" tail>
            Two things I&apos;d like to know &mdash; <strong style={{color:'var(--cream)'}}>who&apos;s the gift for</strong>, and <strong style={{color:'var(--cream)'}}>who picks it</strong>?
          </AnnieLine>
        </div>

        <MobileComposer placeholder="reply to Annie, or keep typing"/>
        <MobileTabBar active="chat"/>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M5 · Vision artefact. The artefact card dominates; every claim tappable.
// ════════════════════════════════════════════════════════════════════════════
function MobileScreenVision() {
  return (
    <Phone>
      <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateRows:'auto 1fr auto auto', height:'100%', minHeight:0, background:'var(--bg)'}}>
        <MobileTopBar project="Copper Kettle" section="Vision" />

        <div className="wk-scroll" style={{padding:'18px 16px 16px', display:'flex', flexDirection:'column', gap:16, minHeight:0, overflow:'auto'}}>
          <AnnieLine mark="a">
            Here&apos;s what I&apos;m reading. Tap anything that feels off.
          </AnnieLine>

          <div className="wk-card" style={{padding:'20px 18px', background:'transparent'}}>
            <div className="wk-eyebrow">vision · v3 · 23 apr</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:19, color:'var(--cream)', marginTop:8, letterSpacing:'-0.012em', fontWeight:500, lineHeight:1.28}}>
              <Claim>Copper Kettle</Claim>, in one paragraph.
            </div>
            <p style={{fontFamily:'var(--font-body-paragraph)', fontSize:15, lineHeight:1.62, color:'var(--ink-bright)', margin:'14px 0 0'}}>
              Copper Kettle is a <Claim>group-gift coordinator</Claim> for <Claim hot>people who already know what to buy</Claim>. The organiser picks the gift and sets a target. They share a link; everyone chips in <Claim>privately</Claim>, one tap. When the target is hit, Copper Kettle sends the money to the organiser. <Claim>The recipient never sees the pool</Claim>.
            </p>
            <div style={{height:1, background:'var(--border-subtle)', margin:'14px 0 10px'}}/>
            <div style={{fontSize:12, color:'var(--ink-muted)'}}>
              <span className="wk-eyebrow" style={{marginRight:6}}>what it is not</span>
              <Claim>a gift-picker</Claim> · <Claim>a wishlist</Claim> · <Claim>a crowdfunder</Claim>
            </div>
          </div>
        </div>

        <MobileComposer attach="&ldquo;people who already know&rdquo;" value="Actually, that's too narrow"/>
        <MobileTabBar active="vision"/>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M6 · Build with live preview. Two-column desktop → tab-switched view.
// A pinned chip lets the user jump between the task list and the preview.
// ════════════════════════════════════════════════════════════════════════════
function MobileScreenBuild() {
  const tasks = [
    {label:'Setting up copper-kettle.coldanvil.com', state:'done'},
    {label:'Laying out the hero with your chip-in-together message', state:'done'},
    {label:'Building the waitlist form and wiring it to your inbox', state:'doing'},
    {label:'Writing the &ldquo;how it works&rdquo; section in your voice', state:'queued'},
  ];
  return (
    <Phone>
      <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateRows:'auto auto 1fr auto auto', height:'100%', minHeight:0, background:'var(--bg)'}}>
        <MobileTopBar project="Copper Kettle" section="Build" right={<Chip live style={{fontSize:10}}>live</Chip>}/>

        {/* segmented — Tasks | Preview */}
        <div style={{padding:'10px 16px 2px', display:'flex', gap:6}}>
          <div style={{flex:1, padding:'6px 10px', textAlign:'center', borderRadius:4, border:'1px solid var(--border)', background:'color-mix(in oklab, var(--accent) 10%, transparent)', color:'var(--cream)', fontSize:12, fontFamily:'var(--font-body)', fontWeight:500}}>Tasks</div>
          <div style={{flex:1, padding:'6px 10px', textAlign:'center', borderRadius:4, border:'1px solid var(--border-subtle)', color:'var(--ink-muted)', fontSize:12, fontFamily:'var(--font-body)'}}>Preview</div>
        </div>

        <div className="wk-scroll" style={{padding:'14px 16px 14px', display:'flex', flexDirection:'column', gap:14, minHeight:0, overflow:'auto'}}>
          <StruckPlan stamp="accepted · v1" date="23 apr 2026">
            I&apos;m going to build you a <em>one-page Copper Kettle</em> site with a waitlist form that sends submissions to an inbox you control.
          </StruckPlan>

          <div className="wk-eyebrow">building · 01:42 elapsed</div>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {tasks.map((t, i) => (
              <div key={i} style={{display:'grid', gridTemplateColumns:'16px 1fr', gap:10, alignItems:'start'}}>
                <div style={{paddingTop:4}}>
                  {t.state==='done' && <Icon.Check size={11} style={{color:'var(--accent)'}}/>}
                  {t.state==='doing' && <span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', background:'var(--accent)', animation:'mHold 1.4s ease-in-out infinite'}}/>}
                  {t.state==='queued' && <span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', border:'1px solid var(--border)'}}/>}
                </div>
                <div style={{fontSize:13, color: t.state==='done' ? 'var(--ink-muted)' : t.state==='doing' ? 'var(--cream)' : 'var(--ink-dim)', lineHeight:1.5, fontFamily:'var(--font-body)'}} dangerouslySetInnerHTML={{__html: t.label + (t.state==='doing' ? '<div style="font-size:11px; color:var(--ink-muted); margin-top:2px">≈ about a minute left</div>' : '')}}/>
              </div>
            ))}
          </div>

          {/* small preview peek — so the user knows it's building something real */}
          <div style={{marginTop:4}}>
            <div className="wk-eyebrow" style={{marginBottom:6}}>preview</div>
            <Browser url="copper-kettle.coldanvil.com" height={220}><PreviewSite/></Browser>
          </div>
        </div>

        <MobileComposer placeholder="pause, redirect, or just ask"/>
        <MobileTabBar active="preview"/>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M7 · Refinement. The user pointed at the hero. Annie shipped a change.
// The diff card is the centerpiece.
// ════════════════════════════════════════════════════════════════════════════
function MobileScreenRefine() {
  return (
    <Phone>
      <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateRows:'auto 1fr auto auto', height:'100%', minHeight:0, background:'var(--bg)'}}>
        <MobileTopBar project="Copper Kettle" section="Refine" right={<Chip live style={{fontSize:10}}>live</Chip>}/>

        <div className="wk-scroll" style={{padding:'16px 16px 14px', display:'flex', flexDirection:'column', gap:16, minHeight:0, overflow:'auto'}}>
          <UserLine>
            <span>The hero is too cold. It reads like a finance app. Can you make it feel more like something friends would do?</span>
            <div style={{marginTop:8, display:'flex', alignItems:'center', gap:6, fontSize:10, color:'var(--ink-dim)', flexWrap:'wrap'}}>
              <Chip accent style={{fontSize:10}}>hero headline</Chip><span>you pointed at this</span>
            </div>
          </UserLine>

          <AnnieLine>
            Changed. Kept the <em>chip in together</em> line &mdash; that came from you &mdash; and softened the rest.
          </AnnieLine>

          {/* Diff card */}
          <div className="wk-card" style={{padding:14, background:'transparent'}}>
            <div className="wk-eyebrow" style={{marginBottom:8}}>change · hero headline</div>
            <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'6px 10px', fontFamily:'var(--font-display)', fontSize:13.5, lineHeight:1.35, color:'var(--ink-muted)'}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--ink-dim)', paddingTop:3}}>was</span>
              <span style={{textDecoration:'line-through', textDecorationColor:'var(--ink-dim)'}}>Pool money for gifts, together.</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--accent)', paddingTop:3}}>now</span>
              <span style={{color:'var(--cream)'}}>Chip in together. Give something they&apos;ll keep.</span>
            </div>
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button className="wk-btn wk-btn--sm"><Icon.Refresh size={10}/> revert</button>
              <button className="wk-btn wk-btn--sm">change again</button>
            </div>
          </div>

          <div style={{fontSize:11, color:'var(--ink-dim)', fontFamily:'var(--font-body)', textAlign:'center', padding:'2px 10px'}}>
            Tap any element in the preview to point at it. Your next message changes it.
          </div>
        </div>

        <MobileComposer placeholder="keep refining — or point at something else"/>
        <MobileTabBar active="preview"/>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M8 · Publishing. The checklist dominates, with a domain header.
// ════════════════════════════════════════════════════════════════════════════
function MobileScreenPublish() {
  return (
    <Phone>
      <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateRows:'auto 1fr auto auto', height:'100%', minHeight:0, background:'var(--bg)'}}>
        <MobileTopBar project="Copper Kettle" section="Publish" right={<Chip accent style={{fontSize:10}}>issuing cert</Chip>}/>

        <div className="wk-scroll" style={{padding:'18px 16px 14px', display:'flex', flexDirection:'column', gap:16, minHeight:0, overflow:'auto'}}>
          <div>
            <div className="wk-eyebrow">about to publish</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:28, color:'var(--cream)', marginTop:6, letterSpacing:'-0.016em', fontWeight:500, lineHeight:1.1}}>
              copper-kettle.co
            </div>
            <div style={{fontSize:11, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', marginTop:4}}>
              was copper-kettle.coldanvil.com
            </div>
          </div>

          <AnnieLine>
            Before I point <em>copper-kettle.co</em> at your site, I&apos;m checking three things. About a minute.
          </AnnieLine>

          <div className="wk-card" style={{padding:'14px 16px', background:'transparent'}}>
            <div className="wk-eyebrow" style={{marginBottom:10}}>publishing checks</div>
            <div style={{display:'grid', gap:10, fontSize:13, color:'var(--ink-bright)'}}>
              <div style={{display:'grid', gridTemplateColumns:'16px 1fr', gap:10, alignItems:'start'}}>
                <Icon.Check size={13} style={{color:'var(--accent)', marginTop:2}}/>
                <div>Your waitlist inbox receives mail.<div style={{color:'var(--ink-muted)', marginTop:2, fontSize:12}}>(test sent — it arrived.)</div></div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'16px 1fr', gap:10, alignItems:'start'}}>
                <Icon.Check size={13} style={{color:'var(--accent)', marginTop:2}}/>
                <div>Domain is pointing the right way.<div style={{color:'var(--ink-muted)', marginTop:2, fontSize:12}}>(DNS propagated 3 min ago.)</div></div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'16px 1fr', gap:10, alignItems:'start'}}>
                <span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', background:'var(--accent)', marginTop:6, animation:'mHold 1.4s ease-in-out infinite'}}/>
                <div>Certificate is being issued.<div style={{color:'var(--ink-muted)', marginTop:2, fontSize:12}}>(≈ 40 seconds.)</div></div>
              </div>
            </div>
          </div>

          <AnnieLine mark="a">
            I&apos;ll mark it <em>published</em> once the certificate is live. You&apos;ll see the URL change in the preview.
          </AnnieLine>
        </div>

        <MobileComposer placeholder="ask about publishing"/>
        <MobileTabBar active="preview"/>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M9 · Annie-as-operator. The calm card with dated labels, "resolved" chip,
// and draft-a-note CTA. Scales down cleanly — it was already a card, not a grid.
// ════════════════════════════════════════════════════════════════════════════
function MobileScreenOperator() {
  return (
    <Phone>
      <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateRows:'auto 1fr auto auto', height:'100%', minHeight:0, background:'var(--bg)'}}>
        <MobileTopBar project="Copper Kettle" section="Conversation" />

        <div className="wk-scroll" style={{padding:'18px 16px 14px', display:'flex', flexDirection:'column', gap:18, minHeight:0, overflow:'auto'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, color:'var(--ink-dim)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase'}}>
            <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
            <span>while you were gone · 2 days</span>
            <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
          </div>

          <AnnieLine>
            Something went wrong on <em>Sunday morning</em> and I want to tell you about it before you hear it somewhere else. I&apos;ve already fixed it.
          </AnnieLine>

          <div className="wk-card wk-card--accent" style={{padding:'16px 18px', background:'transparent'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
              <div className="wk-eyebrow" style={{fontSize:9}}>operator note · sun 21 apr</div>
              <Chip accent style={{fontSize:10}}>resolved</Chip>
            </div>
            <div style={{fontFamily:'var(--font-display)', fontSize:17, color:'var(--cream)', lineHeight:1.3, letterSpacing:'-0.012em', fontWeight:500}}>
              The waitlist form stopped delivering for 47 minutes. One email bounced.
            </div>
            <div style={{marginTop:12, display:'grid', gridTemplateColumns:'1fr', gap:'10px 0', fontSize:13, color:'var(--ink)', lineHeight:1.55}}>
              <div>
                <span className="wk-eyebrow" style={{display:'block', marginBottom:2, fontSize:9}}>what happened</span>
                Your inbox provider rejected a batch of forwards. I re-sent the ones I had. One &mdash; from <span style={{fontFamily:'var(--font-mono)'}}>j.tanaka@…</span> &mdash; came back undeliverable.
              </div>
              <div>
                <span className="wk-eyebrow" style={{display:'block', marginBottom:2, fontSize:9}}>what I did</span>
                Switched the sender envelope and added the provider to your allow list. Hasn&apos;t happened since.
              </div>
              <div>
                <span className="wk-eyebrow" style={{display:'block', marginBottom:2, fontSize:9}}>what&apos;s open</span>
                You might want to message <span style={{fontFamily:'var(--font-mono)'}}>j.tanaka@…</span> directly.
              </div>
            </div>
            <div style={{display:'flex', gap:8, marginTop:14, flexWrap:'wrap'}}>
              <button className="wk-btn wk-btn--sm"><Icon.Pen size={10}/> draft a note</button>
              <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Doc size={10}/> full log</button>
            </div>
          </div>
        </div>

        <MobileComposer placeholder="ask about what happened"/>
        <MobileTabBar active="chat"/>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M10 · Artefacts, browsable. Desktop had a tab strip + featured + grid of 3.
// Mobile: horizontal-scroll tab chip row + single featured + vertical stack.
// ════════════════════════════════════════════════════════════════════════════
function MobileScreenArtefacts() {
  const tabs = ['Vision','Brand voice','Content','Architecture'];
  return (
    <Phone>
      <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateRows:'auto auto 1fr auto', height:'100%', minHeight:0, background:'var(--bg)'}}>
        <MobileTopBar project="Copper Kettle" section="Vision" />

        {/* horizontal tab strip — scrollable on small screens */}
        <div style={{padding:'10px 16px 0', display:'flex', gap:14, borderBottom:'1px solid var(--border-subtle)', overflowX:'auto'}}>
          {tabs.map((t, i) => (
            <div key={t} style={{
              padding:'6px 0 10px',
              whiteSpace:'nowrap',
              color: i===0 ? 'var(--cream)' : 'var(--ink-muted)',
              borderBottom: i===0 ? '2px solid var(--accent)' : '2px solid transparent',
              fontSize:12.5, fontFamily:'var(--font-body)', fontWeight: i===0?500:400,
            }}>{t}</div>
          ))}
        </div>

        <div className="wk-scroll" style={{padding:'16px 16px 16px', display:'flex', flexDirection:'column', gap:22, minHeight:0, overflow:'auto'}}>
          <article>
            <div className="wk-eyebrow" style={{fontSize:10}}>Vision · v3 · accepted 18 apr</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--cream)', marginTop:8, letterSpacing:'-0.014em', lineHeight:1.22, fontWeight:500}}>A group-gift coordinator for people who already know what to buy.</div>
            <p style={{fontFamily:'var(--font-body-paragraph)', fontSize:14.5, lineHeight:1.62, color:'var(--ink-bright)', margin:'12px 0 0'}}>
              Copper Kettle is a group-gift coordinator for <Claim>people who already know what to buy</Claim>. The organiser picks the gift and sets a target. Everyone chips in privately, one tap. When the target is hit, Copper Kettle sends the money to the organiser. <Claim>The recipient never sees the pool</Claim>.
            </p>
            <div style={{display:'flex', gap:10, marginTop:12, fontSize:11, color:'var(--ink-muted)', alignItems:'center'}}>
              <span>Tap any phrase to challenge it.</span>
            </div>
          </article>

          <div className="wk-ruler"/>
          <div className="wk-eyebrow">other artefacts</div>

          {[
            {k:'Brand voice · v2', t:'Warm, specific, allergic to finance-app language.'},
            {k:'Content · v5',     t:'Three sections. One form. Zero fluff.'},
            {k:'Architecture · v1',t:'One-page site · waitlist to inbox · SSL via registrar.'},
          ].map((it, i) => (
            <div key={i} className="wk-card" style={{padding:'14px 14px', background:'transparent'}}>
              <div className="wk-eyebrow" style={{fontSize:9}}>{it.k}</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:15, color:'var(--cream)', marginTop:6, letterSpacing:'-0.01em', lineHeight:1.3, fontWeight:500}}>{it.t}</div>
              <div style={{fontSize:12, color:'var(--ink-muted)', marginTop:8, lineHeight:1.5}}>Tap to read. Every claim is challengeable.</div>
            </div>
          ))}
        </div>

        <MobileTabBar active="vision"/>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M11 · Project ledger. Same vocab as desktop — date, dot, entry —
// but stacked. Date sits above dot+entry rather than to the left.
// ════════════════════════════════════════════════════════════════════════════
function MobileScreenLedger() {
  const rows = [
    {d:'23 apr', t:'struck',   body:<>Annie&apos;s plan: <em>&ldquo;one-page Copper Kettle with waitlist to your inbox.&rdquo;</em> <span style={{color:'var(--ink-dim)'}}>&mdash; strike 01</span></>},
    {d:'23 apr', t:'refined',  body:<>Hero headline changed from <em>&ldquo;Pool money for gifts, together.&rdquo;</em> to <em>&ldquo;Chip in together.&rdquo;</em></>},
    {d:'23 apr', t:'struck',   body:<>Annie&apos;s plan: <em>&ldquo;Point copper-kettle.co at the site and issue a certificate.&rdquo;</em> <span style={{color:'var(--ink-dim)'}}>&mdash; strike 02</span></>},
    {d:'24 apr', t:'operator', body:<>Operator: small latency bump on the waitlist form; auto-recovered in 40 seconds.</>},
    {d:'25 apr', t:'struck',   body:<>Annie&apos;s plan: <em>&ldquo;Rewrite the &lsquo;how it works&rsquo; section.&rdquo;</em> <span style={{color:'var(--ink-dim)'}}>&mdash; strike 03</span></>},
    {d:'25 apr', t:'unstrike', body:<>You undid <em>strike 03</em>. <span style={{color:'var(--ink-dim)'}}>reason: &ldquo;too chatty&rdquo;</span></>},
    {d:'27 apr', t:'operator', body:<>Operator: 47-min delivery issue; resolved. <span style={{color:'var(--ink-dim)'}}>1 email bounced.</span></>},
  ];
  const dot = (t) => {
    if (t === 'struck')   return <span style={{display:'inline-block', width:7, height:7, borderRadius:'50%', background:'var(--accent)'}}/>;
    if (t === 'unstrike') return <span style={{display:'inline-block', width:7, height:7, borderRadius:'50%', border:'1px dashed var(--accent)'}}/>;
    if (t === 'operator') return <span style={{display:'inline-block', width:7, height:7, borderRadius:'50%', background:'var(--secondary)'}}/>;
    return <span style={{display:'inline-block', width:7, height:7, borderRadius:'50%', background:'var(--ink-dim)'}}/>;
  };
  return (
    <Phone>
      <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateRows:'auto 1fr auto', height:'100%', minHeight:0, background:'var(--bg)'}}>
        <MobileTopBar project="Copper Kettle" section="History" />

        <div className="wk-scroll" style={{padding:'16px 18px 14px', display:'flex', flexDirection:'column', gap:0, minHeight:0, overflow:'auto'}}>
          <div>
            <div className="wk-eyebrow" style={{fontSize:10}}>ledger · Copper Kettle</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:20, color:'var(--cream)', marginTop:6, letterSpacing:'-0.014em', lineHeight:1.22, fontWeight:500}}>Everything that&apos;s happened on this project.</div>
            <div style={{display:'flex', gap:6, marginTop:10, flexWrap:'wrap'}}>
              <Chip accent style={{fontSize:10}}>4 accepted</Chip>
              <Chip style={{fontSize:10}}>1 undone</Chip>
              <Chip live style={{fontSize:10}}>2 operator</Chip>
            </div>
          </div>

          <div style={{borderTop:'1px solid var(--border-subtle)', marginTop:14}}>
            {rows.map((r, i) => (
              <div key={i} style={{padding:'14px 0', borderBottom:'1px solid var(--border-subtle)'}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', fontSize:10.5, letterSpacing:'0.04em'}}>
                  {dot(r.t)}
                  <span>{r.d}</span>
                  <span style={{textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--ink-muted)'}}>{r.t}</span>
                </div>
                <div style={{color: r.t==='struck' ? 'var(--cream)' : r.t==='operator' ? 'var(--ink)' : 'var(--ink-muted)', fontSize:13.5, lineHeight:1.55, fontFamily:'var(--font-body-paragraph)', fontStyle: r.t==='unstrike' ? 'italic' : 'normal'}}>{r.body}</div>
              </div>
            ))}
          </div>

          <div style={{marginTop:14}}>
            <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Download size={11}/> export ledger</button>
          </div>
        </div>

        <MobileTabBar active="ledger"/>
      </div>
    </Phone>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// M12 · Mobile edge states. One artboard showing offline, publish-failed, and
// reconnection as three stacked phones. Mobile is where these matter most —
// flaky connections, background apps, backgrounded tabs.
// ════════════════════════════════════════════════════════════════════════════
function MobileEdgeStates() {
  return (
    <div className="wk-root wk-type-b" style={{padding:'32px 24px 40px', background:'var(--bg)', minHeight:'100%'}}>
      <div style={{marginBottom:24}}>
        <div className="wk-eyebrow">mobile · edge states</div>
        <div style={{fontFamily:'var(--font-display)', fontSize:28, color:'var(--cream)', marginTop:8, letterSpacing:'-0.014em', lineHeight:1.2, fontWeight:500}}>
          The three states that only matter on mobile.
        </div>
        <div style={{fontFamily:'var(--font-body)', fontSize:14, color:'var(--ink-muted)', marginTop:10, lineHeight:1.55, maxWidth:620}}>
          Offline (flaky café wifi), publish-failed (Annie can&apos;t finish the handoff), and reconnection (the app was backgrounded for an hour and everything has moved on). Each is a banner above the conversation, never an alert, never a modal.
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20, alignItems:'start'}}>

        {/* Offline */}
        <div>
          <Phone timeHint="9:41" statusTint="var(--ink-dim)">
            <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateRows:'auto auto 1fr auto auto', height:'100%', background:'var(--bg)'}}>
              <MobileTopBar project="Copper Kettle" section="Conversation"/>
              {/* offline banner */}
              <div style={{padding:'8px 16px', background:'color-mix(in oklab, var(--ink-dim) 14%, transparent)', borderBottom:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--ink-bright)', fontFamily:'var(--font-body)'}}>
                <span style={{width:6, height:6, borderRadius:'50%', background:'var(--ink-dim)'}}/>
                <span>Offline. I&apos;ll reply when you&apos;re back.</span>
              </div>
              <div className="wk-scroll" style={{padding:'16px 16px', display:'flex', flexDirection:'column', gap:14, overflow:'hidden'}}>
                <UserLine>Can you change the hero to say &ldquo;your people, your gift&rdquo;?</UserLine>
                <div style={{marginLeft:44, fontSize:11, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', letterSpacing:'0.04em'}}>queued · will send when online</div>
                <AnnieLine mark="a" style={{opacity:0.5}}>
                  <em>Annie is offline.</em> Your message is saved &mdash; I&apos;ll reply the moment you reconnect.
                </AnnieLine>
              </div>
              <MobileComposer placeholder="messages queue while offline"/>
              <MobileTabBar active="chat"/>
            </div>
          </Phone>
          <div style={{marginTop:8, fontFamily:'var(--font-body)', fontSize:12, color:'var(--ink-bright)'}}>
            <div style={{fontWeight:500, color:'var(--cream)'}}>Offline</div>
            <div style={{color:'var(--ink-muted)', marginTop:2, lineHeight:1.55}}>Banner, not alert. Messages queue. Annie&apos;s existing text dims to 50%.</div>
          </div>
        </div>

        {/* Publish failed */}
        <div>
          <Phone>
            <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateRows:'auto auto 1fr auto auto', height:'100%', background:'var(--bg)'}}>
              <MobileTopBar project="Copper Kettle" section="Publish"/>
              <div style={{padding:'10px 16px', background:'color-mix(in oklab, var(--accent) 14%, transparent)', borderBottom:'1px solid var(--accent)', display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--cream)', fontFamily:'var(--font-body)'}}>
                <span style={{width:6, height:6, borderRadius:'50%', background:'var(--accent)'}}/>
                <span>Publish didn&apos;t finish. Your site is unchanged.</span>
              </div>
              <div className="wk-scroll" style={{padding:'16px 16px', display:'flex', flexDirection:'column', gap:14, overflow:'hidden'}}>
                <AnnieLine>
                  The certificate provider didn&apos;t respond. I rolled it back &mdash; <em>copper-kettle.coldanvil.com</em> still works. I&apos;ll try again in a few minutes, or you can retry now.
                </AnnieLine>
                <div style={{display:'flex', gap:8}}>
                  <button className="wk-btn wk-btn--primary wk-btn--sm">Retry publish</button>
                  <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Doc size={11}/> what went wrong</button>
                </div>
              </div>
              <MobileComposer placeholder="ask what happened"/>
              <MobileTabBar active="chat"/>
            </div>
          </Phone>
          <div style={{marginTop:8, fontFamily:'var(--font-body)', fontSize:12, color:'var(--ink-bright)'}}>
            <div style={{fontWeight:500, color:'var(--cream)'}}>Publish failed (rolled back)</div>
            <div style={{color:'var(--ink-muted)', marginTop:2, lineHeight:1.55}}>Banner is mustard, not red. Annie narrates the cause. Retry is one tap.</div>
          </div>
        </div>

        {/* Reconnection */}
        <div>
          <Phone>
            <div className="wk-root wk-type-b" style={{display:'grid', gridTemplateRows:'auto auto 1fr auto auto', height:'100%', background:'var(--bg)'}}>
              <MobileTopBar project="Copper Kettle" section="Conversation"/>
              <div style={{padding:'8px 16px', background:'color-mix(in oklab, var(--accent) 10%, transparent)', borderBottom:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--cream)', fontFamily:'var(--font-body)'}}>
                <span style={{width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:'mHold 1.4s ease-in-out infinite'}}/>
                <span>Welcome back. Catching you up…</span>
              </div>
              <div className="wk-scroll" style={{padding:'16px 16px', display:'flex', flexDirection:'column', gap:14, overflow:'hidden'}}>
                <div style={{display:'flex', alignItems:'center', gap:8, color:'var(--ink-dim)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase'}}>
                  <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
                  <span>gone for 1h 12m</span>
                  <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
                </div>
                <AnnieLine mark="a">
                  While you were gone: <em>3 more signups</em>. Your message about the hero &mdash; I sent it, and it&apos;s shipped. Here&apos;s the diff:
                </AnnieLine>
                <div className="wk-card" style={{padding:'12px 14px', background:'transparent'}}>
                  <div className="wk-eyebrow" style={{fontSize:9, marginBottom:6}}>change · hero</div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:13, color:'var(--cream)', lineHeight:1.35}}>&ldquo;Your people, your gift.&rdquo;</div>
                </div>
              </div>
              <MobileComposer placeholder="pick it up wherever"/>
              <MobileTabBar active="chat"/>
            </div>
          </Phone>
          <div style={{marginTop:8, fontFamily:'var(--font-body)', fontSize:12, color:'var(--ink-bright)'}}>
            <div style={{fontWeight:500, color:'var(--cream)'}}>Reconnection</div>
            <div style={{color:'var(--ink-muted)', marginTop:2, lineHeight:1.55}}>Annie catches up in one line. Queued messages execute. The gone-for banner fades in, then out.</div>
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, {
  MobileScreenConversation,
  MobileScreenPlan,
  MobileScreenHome,
  MobileScreenArrival,
  MobileScreenVision,
  MobileScreenBuild,
  MobileScreenRefine,
  MobileScreenPublish,
  MobileScreenOperator,
  MobileScreenArtefacts,
  MobileScreenLedger,
  MobileEdgeStates,
});
