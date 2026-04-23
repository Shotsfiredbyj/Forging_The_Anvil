// sections/ongoing.jsx — the returning-user screens.
// Project home · Operator update · Artefacts browseable · Ledger.

// 08 · Project home (returning user). Landing view is the live preview,
// conversation waits where they left it. A quiet returning-user banner tops the conversation.
function ScreenProjectHome() {
  return (
    <Shell project="Copper Kettle" section="Preview">
      <div style={{display:'grid', gridTemplateColumns:'440px 1fr', height:'100%', minHeight:0}}>
        <div style={{borderRight:'1px solid var(--border-subtle)', display:'grid', gridTemplateRows:'1fr auto', minHeight:0}}>
          <div className="wk-scroll" style={{padding:'28px 28px 18px', display:'flex', flexDirection:'column', gap:20}}>

            <div style={{display:'flex', alignItems:'center', gap:10, color:'var(--ink-dim)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase'}}>
              <span style={{width:18, height:1, background:'var(--border-subtle)'}}/>
              <span>last accepted · 3 days ago</span>
              <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
            </div>

            <AnnieLine>
              Welcome back. Since you left, <em>14 people</em> joined your waitlist &mdash; I&apos;ve collected their emails in your inbox as usual. Nothing else has changed.
            </AnnieLine>
            <AnnieLine mark="a">
              Two things you could do next if you&apos;re ready: <Claim>draft a first newsletter to those 14 people</Claim>, or <Claim>add a short &ldquo;about the organiser&rdquo; section</Claim> you said you wanted. Or just tell me what&apos;s on your mind.
            </AnnieLine>
          </div>
          <Composer placeholder="pick it up wherever you like"/>
        </div>

        <div style={{padding:'24px 24px 24px', display:'grid', gridTemplateRows:'auto 1fr auto', gap:14, minHeight:0}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <div className="wk-eyebrow">live site</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:19, color:'var(--cream)', marginTop:4, letterSpacing:'-0.012em', fontWeight:500}}>copper-kettle.co</div>
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <Chip live>live · 3 days</Chip>
              <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Globe size={12}/> visit</button>
            </div>
          </div>
          <div style={{minHeight:0}}>
            <Browser url="copper-kettle.co" height={580}><PreviewSite/></Browser>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, fontSize:13}}>
            <div className="wk-card" style={{padding:'12px 14px'}}>
              <div className="wk-eyebrow" style={{fontSize:10}}>signups</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--cream)', marginTop:4, letterSpacing:'-0.01em', fontWeight:500}}>14 <span style={{fontSize:12, color:'var(--accent)', fontStyle:'italic'}}>+14 this week</span></div>
            </div>
            <div className="wk-card" style={{padding:'12px 14px'}}>
              <div className="wk-eyebrow" style={{fontSize:10}}>visitors</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--cream)', marginTop:4, letterSpacing:'-0.01em', fontWeight:500}}>208</div>
            </div>
            <div className="wk-card" style={{padding:'12px 14px'}}>
              <div className="wk-eyebrow" style={{fontSize:10}}>uptime</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--cream)', marginTop:4, letterSpacing:'-0.01em', fontWeight:500}}>100<span style={{fontSize:14, color:'var(--ink-dim)'}}>%</span></div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// 09 · Annie-as-operator update. Silent on internal warnings; narrates only user-facing failures.
function ScreenOperator() {
  return (
    <Shell project="Copper Kettle" section="Conversation">
      <div style={{display:'grid', gridTemplateRows:'1fr auto', height:'100%', minHeight:0}}>
        <div className="wk-scroll" style={{padding:'40px 56px 30px', display:'flex', flexDirection:'column', gap:28, maxWidth:880, margin:'0 auto', width:'100%', boxSizing:'border-box'}}>

          <div style={{display:'flex', alignItems:'center', gap:10, color:'var(--ink-dim)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase'}}>
            <span style={{width:18, height:1, background:'var(--border-subtle)'}}/>
            <span>while you were gone · 2 days</span>
            <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
          </div>

          <AnnieLine>
            Something went wrong on <em>Sunday morning</em> and I want to tell you about it before you hear it somewhere else. I&apos;ve already fixed it &mdash; the site&apos;s fine now &mdash; but one person&apos;s submission didn&apos;t make it to your inbox.
          </AnnieLine>

          {/* Operator card — calm, dated, with a rollback */}
          <div className="wk-card wk-card--accent" style={{padding:'22px 26px', background:'transparent'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
              <div className="wk-eyebrow">operator note · sun 21 apr · 08:14</div>
              <Chip accent>resolved</Chip>
            </div>
            <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--cream)', lineHeight:1.35, letterSpacing:'-0.012em', fontWeight:500}}>
              The waitlist form stopped delivering for 47 minutes on Sunday morning. One email bounced.
            </div>
            <div style={{marginTop:16, display:'grid', gridTemplateColumns:'110px 1fr', gap:'6px 16px', fontSize:13.5, color:'var(--ink)', lineHeight:1.6}}>
              <span className="wk-eyebrow">what happened</span>
              <span>Your inbox provider rejected a batch of forwards because they looked like spam. I re-sent the ones I had. One &mdash; from <span style={{fontFamily:'var(--font-mono)'}}>j.tanaka@…</span> &mdash; came back undeliverable.</span>
              <span className="wk-eyebrow">what I did</span>
              <span>I switched the sender envelope so future forwards look like they&apos;re from you, and I added the provider to your allow list. Hasn&apos;t happened since.</span>
              <span className="wk-eyebrow">what&apos;s open</span>
              <span>You might want to message <span style={{fontFamily:'var(--font-mono)'}}>j.tanaka@…</span> directly &mdash; we have their email but not the form answers.</span>
            </div>
            <div style={{display:'flex', gap:8, marginTop:18}}>
              <button className="wk-btn"><Icon.Pen size={12}/> draft a note to j.tanaka</button>
              <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Doc size={12}/> full log</button>
            </div>
          </div>

          <AnnieLine mark="a">
            I&apos;ll keep narrating the bigger things. Small hiccups that didn&apos;t affect anyone real, I&apos;ll keep to myself &mdash; you&apos;ll see them in the ledger if you look.
          </AnnieLine>
        </div>
        <Composer placeholder="ask about what happened, or move on"/>
      </div>
    </Shell>
  );
}

// 10 · The four artefacts, browsable.
function ScreenArtefacts() {
  const items = [
    {
      kicker:'Vision', title:'A group-gift coordinator for people who already know what to buy.', sub:'v3 · accepted 18 apr',
      body:<>Copper Kettle is a group-gift coordinator for <Claim>people who already know what to buy</Claim>. The organiser picks the gift and sets a target. They share a link; everyone chips in privately, with one tap, in whatever amount they want. When the target is hit, Copper Kettle sends the money to the organiser, who buys and delivers the gift. <Claim>The recipient never sees the pool</Claim> &mdash; it&apos;s a surprise until the gift arrives.</>
    },
    {
      kicker:'Brand voice', title:'Warm, specific, allergic to finance-app language.', sub:'v2 · accepted 19 apr',
      body:<>The voice sounds like a friend who&apos;s organised a lot of these before. Uses &ldquo;chip in&rdquo; rather than &ldquo;contribute&rdquo;. Never uses &ldquo;campaign&rdquo;, &ldquo;funding&rdquo;, &ldquo;donors&rdquo;. Prefers a short sentence with a specific detail over a long sentence with a promise. Italic-as-emphasis. Never shouts.</>
    },
    {
      kicker:'Content', title:'Three sections. One form. Zero fluff.', sub:'v5 · accepted 21 apr',
      body:<>Hero: what it is, in a sentence a group chat would send. <br/>How it works: three steps, each in the organiser&apos;s voice. <br/>Waitlist: email only, no &ldquo;tell us about yourself&rdquo;. An invite goes out when the feature they want is ready.</>
    },
    {
      kicker:'Architecture', title:'One-page site · waitlist to inbox · SSL via registrar.', sub:'v1 · accepted 16 apr',
      body:<>Static site on our standard host. Waitlist submissions are forwarded to the organiser&apos;s inbox as plain emails with a subject line the organiser picked. The <span style={{fontFamily:'var(--font-mono)'}}>.co</span> domain is delegated to our name servers; certificates auto-renew. No database yet &mdash; the inbox <em>is</em> the database.</>
    },
  ];
  return (
    <Shell project="Copper Kettle" section="Vision">
      <div style={{padding:'32px 48px 40px', overflow:'auto', height:'100%', boxSizing:'border-box'}}>

        {/* artefact tab strip */}
        <div style={{display:'flex', gap:18, marginBottom:24, borderBottom:'1px solid var(--border-subtle)', paddingBottom:10}}>
          {['Vision','Brand voice','Content','Architecture'].map((t,i) => (
            <div key={t} style={{
              padding:'6px 2px',
              color: i===0 ? 'var(--cream)' : 'var(--ink-muted)',
              borderBottom: i===0 ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom:-11,
              fontSize:14, fontFamily:'var(--font-body)', fontWeight: i===0?500:400, cursor:'pointer',
            }}>{t}</div>
          ))}
          <div style={{flex:1}}/>
          <Chip>v3 · accepted</Chip>
          <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Download size={12}/> export as PDF</button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr', gap:28}}>
          {items.slice(0,1).map((it, i) => (
            <article key={i}>
              <div style={{display:'flex', alignItems:'baseline', gap:14}}>
                <div>
                  <div className="wk-eyebrow">{it.kicker} &middot; {it.sub}</div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:32, color:'var(--cream)', marginTop:10, letterSpacing:'-0.016em', lineHeight:1.2, maxWidth:780, fontWeight:500}}>{it.title}</div>
                </div>
              </div>
              <p style={{fontFamily:'var(--font-body-paragraph)', fontSize:17, lineHeight:1.7, color:'var(--ink-bright)', maxWidth:780, marginTop:18}}>{it.body}</p>
              <div style={{display:'flex', gap:14, marginTop:18, fontSize:13, color:'var(--ink-muted)', alignItems:'center'}}>
                <span>Click any phrase to challenge it.</span>
                <span style={{width:1, height:12, background:'var(--border-subtle)'}}/>
                <span>Annie will reply in the conversation.</span>
              </div>
            </article>
          ))}
        </div>

        <Rule label="other artefacts on this project"/>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
          {items.slice(1).map((it, i) => (
            <div key={i} className="wk-card" style={{padding:'18px 20px', background:'transparent'}}>
              <div className="wk-eyebrow">{it.kicker} &middot; {it.sub}</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:18, color:'var(--cream)', marginTop:8, letterSpacing:'-0.012em', lineHeight:1.3, fontWeight:500}}>{it.title}</div>
              <div style={{fontSize:13, color:'var(--ink-muted)', marginTop:10, lineHeight:1.55}}>Open to read the full artefact. Every claim is challengeable.</div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// 11 · The project ledger. Numbered accepted plans, ops notes, and unaccepted plans.
function ScreenLedger() {
  const rows = [
    {d:'23 apr', t:'struck', body:<>Annie’s plan: <em>&ldquo;I&apos;m going to build you a one-page Copper Kettle site with a waitlist form that sends submissions to an inbox you control.&rdquo;</em> <span style={{color:'var(--ink-dim)'}}>&mdash; strike 01</span></>},
    {d:'23 apr', t:'refined', body:<>Hero headline changed from <em>&ldquo;Pool money for gifts, together.&rdquo;</em> to <em>&ldquo;Chip in together. Give something they&apos;ll keep.&rdquo;</em></>},
    {d:'23 apr', t:'struck', body:<>Annie’s plan: <em>&ldquo;Point <span style={{fontFamily:'var(--font-mono)'}}>copper-kettle.co</span> at the site and issue a certificate.&rdquo;</em> <span style={{color:'var(--ink-dim)'}}>&mdash; strike 02</span></>},
    {d:'24 apr', t:'operator', body:<>Operator: small bump in latency on the waitlist form; auto-recovered in 40 seconds. <span style={{color:'var(--ink-dim)'}}>(no impact)</span></>},
    {d:'25 apr', t:'struck', body:<>Annie’s plan: <em>&ldquo;Rewrite the &lsquo;how it works&rsquo; section in your voice.&rdquo;</em> <span style={{color:'var(--ink-dim)'}}>&mdash; strike 03</span></>},
    {d:'25 apr', t:'unstrike', body:<>You undid <em>strike 03</em> and asked Annie to try again. <span style={{color:'var(--ink-dim)'}}>reason: &ldquo;too chatty&rdquo;</span></>},
    {d:'25 apr', t:'struck', body:<>Annie’s plan: <em>&ldquo;Rewrite the &lsquo;how it works&rsquo; section &mdash; shorter, one line each.&rdquo;</em> <span style={{color:'var(--ink-dim)'}}>&mdash; strike 04</span></>},
    {d:'27 apr', t:'operator', body:<>Operator: 47-minute delivery issue on the waitlist form; resolved. <span style={{color:'var(--ink-dim)'}}>1 email bounced · j.tanaka@…</span></>},
  ];
  const dot = (t) => {
    if (t === 'struck') return <span style={{display:'inline-block', width:7, height:7, borderRadius:'50%', background:'var(--accent)'}}/>;
    if (t === 'unstrike') return <span style={{display:'inline-block', width:7, height:7, borderRadius:'50%', border:'1px dashed var(--accent)'}}/>;
    if (t === 'operator') return <span style={{display:'inline-block', width:7, height:7, borderRadius:'50%', background:'var(--secondary)'}}/>;
    return <span style={{display:'inline-block', width:7, height:7, borderRadius:'50%', background:'var(--ink-dim)'}}/>;
  };
  return (
    <Shell project="Copper Kettle" section="History">
      <div style={{padding:'36px 56px 40px', maxWidth:960, margin:'0 auto', width:'100%', boxSizing:'border-box', height:'100%', overflow:'auto'}}>
        <SectionHead
          kicker="ledger · Copper Kettle"
          title="Everything that's happened on this project."
          sub="Struck plans are numbered. Undos leave a mark. Operator notes are ambient: they appear here even when Annie chose not to narrate them."
          right={<div style={{display:'flex', gap:8}}><Chip accent>4 accepted plans</Chip><Chip>1 undone</Chip><Chip live>2 operator notes</Chip></div>}
        />
        <div style={{borderTop:'1px solid var(--border-subtle)', marginTop:8}}>
          {rows.map((r, i) => (
            <div key={i} style={{display:'grid', gridTemplateColumns:'82px 24px 1fr', gap:'0 18px', padding:'16px 0', borderBottom:'1px solid var(--border-subtle)', alignItems:'baseline'}}>
              <div style={{color:'var(--ink-dim)', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.04em', textAlign:'right'}}>{r.d}</div>
              <div style={{display:'grid', placeItems:'center'}}>{dot(r.t)}</div>
              <div style={{color: r.t==='struck' ? 'var(--cream)' : r.t==='operator' ? 'var(--ink)' : 'var(--ink-muted)', fontSize:14.5, lineHeight:1.55, fontFamily:'var(--font-body-paragraph)', fontStyle: r.t==='unstrike' ? 'italic' : 'normal'}}>{r.body}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:24, display:'flex', gap:10}}>
          <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Download size={12}/> export the full ledger</button>
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { ScreenProjectHome, ScreenOperator, ScreenArtefacts, ScreenLedger });
