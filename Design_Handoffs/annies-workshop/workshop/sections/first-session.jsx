// sections/first-session.jsx — the seven beats of the first session.
// Each screen is 1440×900 using the shared Shell primitive.
// Copy obeys §9 (first 4 words are Annie's claim, no "I'd love to help", no "Let's dive in").

// ── Composer — always at the bottom of the main column ─────────────────────
function Composer({value='', placeholder='Reply to Annie, or just keep typing', attach, right}) {
  return (
    <div style={{padding:'14px 28px 20px', borderTop:'1px solid var(--border-subtle)', background:'var(--bg)'}}>
      {attach && (
        <div style={{marginBottom:8, display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--ink-muted)'}}>
          <Chip accent>{attach}</Chip>
          <span>will be attached to your next message</span>
          <button className="wk-btn wk-btn--ghost wk-btn--sm" style={{marginLeft:'auto', fontSize:11}}><Icon.X size={10}/> remove</button>
        </div>
      )}
      <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'stretch'}}>
        <div style={{
          border:'1px solid var(--border)',
          borderRadius:8,
          padding:'12px 14px',
          minHeight:54,
          color: value ? 'var(--ink-bright)' : 'var(--ink-dim)',
          fontSize:15, lineHeight:1.5, fontFamily:'var(--font-body-paragraph)',
          display:'flex', alignItems:'center',
        }}>
          {value || placeholder}
          {!value && <span className="wk-caret"/>}
        </div>
        <button className="wk-btn wk-btn--primary" style={{alignSelf:'stretch', paddingLeft:18, paddingRight:18}} aria-label="Send"><Icon.ArrowUp size={14}/></button>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, fontSize:11, color:'var(--ink-dim)'}}>
        <span>Enter to send · Shift+Enter for a new line</span>
        {right}
      </div>
    </div>
  );
}

// ── Conversation frame — the main column for conversation-led beats ────────
function Conversation({children, composer}) {
  return (
    <div style={{display:'grid', gridTemplateRows:'1fr auto', height:'100%', minHeight:0}}>
      <div className="wk-scroll" style={{padding:'40px 56px 30px', display:'flex', flexDirection:'column', gap:30, maxWidth:880, margin:'0 auto', width:'100%', boxSizing:'border-box'}}>
        {children}
      </div>
      {composer}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 01 · Arrival → Workshop. The user typed on coldanvil.com. They land here.
// Annie's first line is her reading of what they typed, not a greeting.
// ════════════════════════════════════════════════════════════════════════════
function ScreenArrival() {
  return (
    <Shell project="Untitled workshop" section="Conversation">
      <Conversation composer={<Composer placeholder="keep typing, or ask Annie for something specific"/>}>
        <div style={{display:'flex', alignItems:'center', gap:10, color:'var(--ink-dim)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase'}}>
          <span style={{width:18, height:1, background:'var(--border-subtle)'}}/>
          <span>carried over from the homepage</span>
          <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
          <span style={{fontFamily:'var(--font-mono)'}}>a moment ago</span>
        </div>

        <UserLine>
          I want a simple site for a group gift coordinator. My friends and I keep doing the awkward spreadsheet thing for birthdays. There should be one person who starts it and everyone else just chips in with one tap.
        </UserLine>

        <AnnieLine>
          So you want to make the <em>chipping in</em> part of a group gift feel like the group conversation, not like a spreadsheet. The person who starts it is the organiser; everyone else is a one-tap guest. <em>Is that the shape of it?</em>
        </AnnieLine>

        <AnnieLine mark="a">
          A couple of things I&apos;d like to know before I name it. <strong style={{color:'var(--cream)'}}>Who&apos;s the gift for</strong> &mdash; a friend in the group, or someone outside it like a parent? And <strong style={{color:'var(--cream)'}}>how does the organiser know what to buy</strong> &mdash; do they decide, or do the chippers-in get a say?
        </AnnieLine>

        <div style={{marginTop:6, display:'flex', gap:10, alignItems:'center', color:'var(--ink-muted)', fontSize:12}}>
          <span className="wk-eyebrow">or</span>
          <button className="wk-btn wk-btn--ghost wk-btn--sm">Build something simpler from what I&apos;ve said</button>
          <button className="wk-btn wk-btn--ghost wk-btn--sm">Start over with a different idea</button>
        </div>
      </Conversation>
    </Shell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 02 · Discovery. A few turns in. Annie has an evolving read.
// Every one of Annie's claims is a Claim (underline) — click to challenge.
// ════════════════════════════════════════════════════════════════════════════
function ScreenDiscovery() {
  return (
    <Shell project="Untitled workshop" section="Conversation">
      <Conversation composer={<Composer placeholder="keep replying — Annie is listening" right={<span>4 turns in · a vision is forming</span>}/>}>
        <AnnieLine>
          So you want to make the <Claim>chipping in</Claim> part of a group gift feel like the group conversation, not like a spreadsheet. The person who starts it is the <Claim>organiser</Claim>; everyone else is a <Claim>one-tap guest</Claim>. Is that the shape of it?
        </AnnieLine>

        <UserLine>
          Yes. And the gift is always for someone outside the group — it&apos;s usually a parent or a teacher. The organiser picks the gift, everyone else just chips in.
        </UserLine>

        <AnnieLine mark="a">
          Good. That simplifies a lot. The <Claim hot>gift is chosen up front by one person</Claim>, and the rest of the flow is about collecting money without the awkward back-and-forth. No voting, no wishlists &mdash; you&apos;re not building a gift-picker, you&apos;re building a <em>pool with a target and a deadline</em>.
        </AnnieLine>

        <AnnieLine mark="a">
          One more thing: does the recipient know the gift is coming, or is it a surprise? That changes whether you need a &ldquo;reveal&rdquo; moment at the end or just a quiet delivery.
        </AnnieLine>

        <UserLine>Surprise. Always surprise.</UserLine>

        <AnnieLine mark="a" tail>
          Then the product has a secret until it doesn&apos;t. I&apos;m going to sketch a vision in a second &mdash;
        </AnnieLine>
      </Conversation>
    </Shell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 03 · Vision artefact. Annie has drafted a vision; it's rendered inline in the
// conversation AND lives as a doc in the left rail. Every phrase is clickable.
// ════════════════════════════════════════════════════════════════════════════
function ScreenVision() {
  return (
    <Shell project="Copper Kettle" section="Conversation">
      <Conversation composer={<Composer attach="&ldquo;people who already know what to buy&rdquo;" value="Actually, that's too narrow — sometimes the organiser is still deciding"/>}>

        <AnnieLine mark="a">
          Here&apos;s what I&apos;m reading. Click any phrase that feels off and tell me what it should be.
        </AnnieLine>

        <div className="wk-card" style={{padding:'32px 40px', borderColor:'var(--border)', background:'transparent'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:18}}>
            <div>
              <div className="wk-eyebrow">vision · v3</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--cream)', marginTop:6, letterSpacing:'-0.012em', fontWeight:500}}>
                <Claim>Copper Kettle</Claim>, in one paragraph.
              </div>
            </div>
            <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Doc size={12}/> open as doc</button>
          </div>

          <p style={{fontFamily:'var(--font-body-paragraph)', fontSize:17.5, lineHeight:1.7, color:'var(--ink-bright)', margin:0}}>
            Copper Kettle is a <Claim>group-gift coordinator</Claim> for <Claim hot>people who already know what to buy</Claim>. The organiser picks the gift and sets a target. They share a link; everyone chips in <Claim>privately</Claim>, with one tap, in whatever amount they want. When the target is hit, Copper Kettle sends the money to the organiser, who buys and delivers the gift. <Claim>The recipient never sees the pool</Claim> &mdash; it&apos;s a surprise until the gift arrives.
          </p>

          <div style={{height:1, background:'var(--border-subtle)', margin:'20px 0 16px'}}/>

          <div style={{display:'flex', gap:24, fontSize:13.5, color:'var(--ink-muted)', flexWrap:'wrap'}}>
            <div><span className="wk-eyebrow" style={{marginRight:6}}>what it is not</span><Claim>a gift-picker</Claim> · <Claim>a wishlist</Claim> · <Claim>a crowdfunder</Claim></div>
          </div>
        </div>

        <div style={{marginTop:-8, display:'flex', gap:10, alignItems:'center', color:'var(--ink-muted)', fontSize:12}}>
          <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Arrow size={12}/> Skip the vision, go straight to a plan</button>
        </div>
      </Conversation>
    </Shell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 04 · The plan. The signature. A pending plan → the user accepted plans.
// One artboard showing both states side-by-side would be cheating — this
// shows the pending state fully, with the accepted state previewed below.
// ════════════════════════════════════════════════════════════════════════════
function ScreenPlan() {
  return (
    <Shell project="Copper Kettle" section="Conversation">
      <Conversation composer={<Composer placeholder="reply to refine — or accept it above"/>}>
        <AnnieLine mark="a">
          Based on everything you&apos;ve told me, here&apos;s what I&apos;m going to do first. It&apos;s one sentence. <em>Accept it to start, or keep talking to refine.</em>
        </AnnieLine>

        <StruckPlan pending>
          I&apos;m going to build you a <em>one-page Copper Kettle</em> site with a waitlist form that sends submissions to an inbox you control. I&apos;ll have something you can click in about ten minutes.
        </StruckPlan>

        <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:14, color:'var(--ink-muted)', fontSize:13, alignItems:'start'}}>
          <Icon.Dot size={6} style={{color:'var(--ink-dim)', marginTop:8}}/>
          <div>
            Want me to <Claim>add a pricing page</Claim>? <Claim>Hold off on the waitlist</Claim> and build a signup flow instead? <Claim>Ask for a different plan</Claim> and I&apos;ll propose something else. Refining is how this becomes yours.
          </div>
        </div>

        <div className="wk-ruler"/>

        <div style={{opacity:0.5, pointerEvents:'none'}}>
          <div className="wk-eyebrow" style={{marginBottom:10}}>preview · after you accept</div>
          <StruckPlan stamp="accepted · v1" date="23 apr 2026">
            I&apos;m going to build you a <em>one-page Copper Kettle</em> site with a waitlist form that sends submissions to an inbox you control.
          </StruckPlan>
        </div>
      </Conversation>
    </Shell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 05 · Build with live preview. Layout shifts — conversation narrows, preview
// opens to the right. Annie narrates one user-facing line per task.
// ════════════════════════════════════════════════════════════════════════════
function ScreenBuild() {
  const tasks = [
    {label: 'Setting up copper-kettle.coldanvil.com', state:'done'},
    {label: 'Laying out the hero with your chip-in-together message', state:'done'},
    {label: 'Building the waitlist form and connecting it to your inbox', state:'doing'},
    {label: 'Writing the "how it works" section in your voice', state:'queued'},
  ];
  return (
    <Shell project="Copper Kettle" section="Preview">
      <div style={{display:'grid', gridTemplateColumns:'440px 1fr', height:'100%', minHeight:0}}>
        {/* Left: conversation (narrowed) */}
        <div style={{borderRight:'1px solid var(--border-subtle)', display:'grid', gridTemplateRows:'1fr auto', minHeight:0}}>
          <div className="wk-scroll" style={{padding:'32px 28px 24px', display:'flex', flexDirection:'column', gap:22}}>
            <StruckPlan stamp="accepted · v1" date="23 apr 2026">
              I&apos;m going to build you a <em>one-page Copper Kettle</em> site with a waitlist form that sends submissions to an inbox you control.
            </StruckPlan>

            <div className="wk-eyebrow" style={{marginTop:4}}>building · 01:42 elapsed</div>

            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              {tasks.map((t, i) => (
                <div key={i} style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:12, alignItems:'start'}}>
                  <div style={{paddingTop:5}}>
                    {t.state==='done' && <Icon.Check size={12} style={{color:'var(--accent)'}}/>}
                    {t.state==='doing' && <span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', background:'var(--accent)', animation:'mHold 1.4s ease-in-out infinite'}}/>}
                    {t.state==='queued' && <span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', border:'1px solid var(--border)'}}/>}
                  </div>
                  <div style={{fontSize:14, color: t.state==='done' ? 'var(--ink-muted)' : t.state==='doing' ? 'var(--cream)' : 'var(--ink-dim)', lineHeight:1.5, fontFamily:'var(--font-body)', textDecoration: t.state==='done'? 'none':'none'}}>
                    {t.label}
                    {t.state==='doing' && <div style={{fontSize:12, color:'var(--ink-muted)', marginTop:3}}>≈ about a minute left</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Composer placeholder="pause, change direction, or just ask" right={<button className="wk-btn wk-btn--ghost wk-btn--sm" style={{fontSize:11}}>Stop and talk</button>}/>
        </div>

        {/* Right: live preview */}
        <div style={{padding:'24px 24px 24px', display:'grid', gridTemplateRows:'auto 1fr', gap:14, minHeight:0}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <div className="wk-eyebrow">live preview</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:19, color:'var(--cream)', marginTop:4, letterSpacing:'-0.012em', fontWeight:500}}>copper-kettle.coldanvil.com</div>
            </div>
            <div style={{display:'flex', gap:8}}>
              <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Globe size={12}/> open in new tab</button>
              <button className="wk-btn wk-btn--ghost wk-btn--sm"><Icon.Refresh size={12}/> refresh</button>
            </div>
          </div>
          <div style={{minHeight:0}}>
            <Browser height={620}><PreviewSite/></Browser>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 06 · Refinement. User clicked the hero in the preview. Selection is anchored
// to their next message. Annie has just shipped a change and shows a diff.
// ════════════════════════════════════════════════════════════════════════════
function ScreenRefine() {
  return (
    <Shell project="Copper Kettle" section="Preview">
      <div style={{display:'grid', gridTemplateColumns:'440px 1fr', height:'100%', minHeight:0}}>
        {/* Conversation column */}
        <div style={{borderRight:'1px solid var(--border-subtle)', display:'grid', gridTemplateRows:'1fr auto', minHeight:0}}>
          <div className="wk-scroll" style={{padding:'28px 28px 18px', display:'flex', flexDirection:'column', gap:20}}>

            <UserLine>
              <span>The hero is too cold. It reads like a finance app. Can you make it feel more like a thing friends would do?</span>
              <div style={{marginTop:8, display:'flex', alignItems:'center', gap:8, fontSize:11, color:'var(--ink-dim)'}}>
                <Chip accent>hero headline</Chip><span>you pointed at this</span>
              </div>
            </UserLine>

            <AnnieLine>
              Changed. I kept the <em>chip in together</em> line &mdash; that came from you &mdash; and softened the rest. Here&apos;s the before and after:
            </AnnieLine>

            {/* Diff card */}
            <div className="wk-card" style={{padding:16, background:'transparent'}}>
              <div className="wk-eyebrow" style={{marginBottom:10}}>change · hero headline</div>
              <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'8px 12px', fontFamily:'var(--font-display)', fontSize:15, lineHeight:1.4, color:'var(--ink-muted)'}}>
                <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-dim)', paddingTop:4}}>was</span>
                <span style={{textDecoration:'line-through', textDecorationColor:'var(--ink-dim)'}}>Pool money for gifts, together.</span>
                <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', paddingTop:4}}>now</span>
                <span style={{color:'var(--cream)'}}>Chip in together. Give something they&apos;ll keep.</span>
              </div>
              <div style={{display:'flex', gap:8, marginTop:14}}>
                <button className="wk-btn wk-btn--sm"><Icon.Refresh size={11}/> revert</button>
                <button className="wk-btn wk-btn--sm">change again</button>
              </div>
            </div>

          </div>
          <Composer placeholder="keep refining — or point at something else"/>
        </div>

        {/* Preview column with Point demo */}
        <div style={{padding:'24px 24px 24px', display:'grid', gridTemplateRows:'auto 1fr', gap:14, minHeight:0}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div className="wk-eyebrow">click any element to point at it — Annie will use your next message to change it</div>
            <Chip live>preview running</Chip>
          </div>
          <div style={{minHeight:0}}>
            <Browser height={620}><PreviewSite editing="hero"/></Browser>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 07 · Publishing. The plan to publish. Annie runs the checks.
// ════════════════════════════════════════════════════════════════════════════
function ScreenPublish() {
  return (
    <Shell project="Copper Kettle" section="Preview">
      <div style={{display:'grid', gridTemplateColumns:'440px 1fr', height:'100%', minHeight:0}}>
        <div style={{borderRight:'1px solid var(--border-subtle)', display:'grid', gridTemplateRows:'1fr auto', minHeight:0}}>
          <div className="wk-scroll" style={{padding:'28px 28px 18px', display:'flex', flexDirection:'column', gap:20}}>

            <UserLine>Let&apos;s put it on the real domain. copper-kettle.co.</UserLine>

            <AnnieLine>
              Before I point <em>copper-kettle.co</em> at your site, I&apos;m going to check three things. Takes about a minute. You can keep working.
            </AnnieLine>

            <div className="wk-card" style={{padding:'16px 18px', background:'transparent'}}>
              <div className="wk-eyebrow" style={{marginBottom:12}}>publishing checks</div>
              <div style={{display:'grid', gap:10, fontSize:14, color:'var(--ink-bright)'}}>
                <div style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:12, alignItems:'start'}}>
                  <Icon.Check size={14} style={{color:'var(--accent)', marginTop:3}}/>
                  <div>Your waitlist inbox receives mail. <span style={{color:'var(--ink-muted)'}}>(sent a test; it arrived.)</span></div>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:12, alignItems:'start'}}>
                  <Icon.Check size={14} style={{color:'var(--accent)', marginTop:3}}/>
                  <div>Your domain is pointing the right way. <span style={{color:'var(--ink-muted)'}}>(DNS propagated 3 minutes ago.)</span></div>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'18px 1fr', gap:12, alignItems:'start'}}>
                  <span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', background:'var(--accent)', marginTop:7, animation:'mHold 1.4s ease-in-out infinite'}}/>
                  <div>Certificate is being issued. <span style={{color:'var(--ink-muted)'}}>(≈ 40 seconds.)</span></div>
                </div>
              </div>
            </div>

            <AnnieLine mark="a">
              I&apos;ll mark it &ldquo;published&rdquo; once the certificate is live. You&apos;ll know because the URL in the preview will change.
            </AnnieLine>
          </div>
          <Composer placeholder="ask Annie about publishing, or keep building"/>
        </div>

        <div style={{padding:'24px 24px 24px', display:'grid', gridTemplateRows:'auto 1fr', gap:14, minHeight:0}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <div className="wk-eyebrow">about to publish</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:19, color:'var(--cream)', marginTop:4, letterSpacing:'-0.012em', fontWeight:500}}>copper-kettle.co</div>
            </div>
            <Chip accent>issuing certificate</Chip>
          </div>
          <div style={{minHeight:0}}>
            <Browser url="copper-kettle.coldanvil.com" height={620}><PreviewSite/></Browser>
          </div>
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { ScreenArrival, ScreenDiscovery, ScreenVision, ScreenPlan, ScreenBuild, ScreenRefine, ScreenPublish });
