// sections/states.jsx — edge states for the marketing site itself.
// The workshop has its own states deck; this one covers what happens
// on the marketing surface: waitlist success/error, 404, handoff-in-progress,
// composer empty / too-long / rate-limited.

const { MkEyebrow, MkNote, MkAnnie } = window;

function StateCard({ label, kind, children, style }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      <div style={{display:'flex', alignItems:'baseline', gap:10}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', letterSpacing:'0.12em'}}>{kind}</span>
        <span style={{fontFamily:'var(--font-display-b)', fontSize:16, color:'var(--cream)', letterSpacing:'-0.005em'}}>{label}</span>
      </div>
      <div style={{
        border:'1px solid var(--border-subtle)', borderRadius:8, background:'var(--ca-bg1)',
        padding:22, minHeight:200, display:'flex', flexDirection:'column', gap:10, ...style,
      }}>
        {children}
      </div>
    </div>
  );
}

function MkStates() {
  return (
    <div style={{padding:36, background:'var(--bg)', minHeight:'100%'}}>
      <MkEyebrow num="07">Marketing-surface states</MkEyebrow>
      <h2 style={{fontFamily:'var(--font-display-b)', fontSize:36, color:'var(--cream)', margin:'0 0 10px', letterSpacing:'-0.016em', lineHeight:1.15, maxWidth:'28ch'}}>
        The moments the marketing site has to handle on its own.
      </h2>
      <p style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink)', lineHeight:1.6, maxWidth:'70ch', marginBottom:28}}>
        Workshop states live in the other deck. These are the five the marketing surface owns before or after the handoff.
      </p>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24}}>
        <StateCard kind="01 · Success" label="Waitlist joined">
          <MkAnnie size={36} listening/>
          <div style={{fontFamily:'var(--font-display-b)', fontSize:18, color:'var(--cream)', lineHeight:1.35, letterSpacing:'-0.005em', marginTop:4}}>
            "Got your email. I'll find you."
          </div>
          <div style={{fontFamily:'var(--font-body-b)', fontStyle:'italic', fontSize:12, color:'var(--ink-muted)', lineHeight:1.55, marginTop:'auto'}}>
            No confirmation email. The page mutates in place — a line through the form, Annie's reply in italic. Deliberate choice: we don't send a "welcome" email we know we can't keep warm.
          </div>
        </StateCard>

        <StateCard kind="02 · Error" label="Waitlist submission failed">
          <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-muted)', letterSpacing:'0.06em'}}>network hiccup — not you</div>
          <div style={{fontFamily:'var(--font-display-b)', fontSize:17, color:'var(--cream)', lineHeight:1.4, marginTop:4}}>
            "Couldn't reach our bench. Try again in a moment — or email hello@coldanvil.com."
          </div>
          <button className="wk-btn" style={{alignSelf:'flex-start', marginTop:12}}>Try again</button>
          <div style={{fontFamily:'var(--font-body-b)', fontStyle:'italic', fontSize:12, color:'var(--ink-muted)', marginTop:'auto'}}>
            No red banners. No stack trace. A human sentence + a button + a fallback email.
          </div>
        </StateCard>

        <StateCard kind="03 · 404" label="Page not found">
          <div style={{fontFamily:'var(--font-display-b)', fontSize:44, color:'var(--cream)', lineHeight:1, letterSpacing:'-0.02em'}}>404</div>
          <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:18, color:'var(--accent)', marginTop:4}}>
            "Not here. But the bench is."
          </div>
          <div style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink)', marginTop:4, lineHeight:1.55}}>
            A workshop you weren't meant to see, or a page we moved. Either way — the composer still works.
          </div>
          <button className="wk-btn wk-btn--primary" style={{alignSelf:'flex-start', marginTop:'auto'}}>Back to the front →</button>
        </StateCard>

        <StateCard kind="04 · Loading" label="Handoff in progress">
          <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:14}}>
            <div style={{width:80, height:1, background:'var(--border-subtle)', position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute', inset:0, background:'linear-gradient(90deg, transparent, var(--accent), transparent)', animation:'mkShimmer 1.8s infinite'}}/>
            </div>
            <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:18, color:'var(--cream)', textAlign:'center', letterSpacing:'-0.005em'}}>
              "Opening the workshop"
            </div>
          </div>
          <div style={{fontFamily:'var(--font-body-b)', fontStyle:'italic', fontSize:12, color:'var(--ink-muted)', marginTop:'auto'}}>
            Between mkt and app. Never called a spinner, never shows a percentage. Just the phrase and a line that pulses.
          </div>
        </StateCard>

        <StateCard kind="05 · Composer empty" label="Start with nothing">
          <div style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink-muted)', fontStyle:'italic', lineHeight:1.55}}>
            Caret blink. Placeholder rotates (3 rotations): "a booking page for..." / "a leaderboard for..." / "a directory of..."
          </div>
          <div style={{border:'1px solid var(--border-subtle)', borderRadius:6, padding:14, marginTop:4, background:'var(--bg)'}}>
            <span style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink-dim)', fontStyle:'italic'}}>a booking page for a carpenter…</span>
          </div>
          <div style={{fontFamily:'var(--font-body-b)', fontStyle:'italic', fontSize:12, color:'var(--ink-muted)', marginTop:'auto'}}>
            Start button stays present but dim. No tooltip, no error.
          </div>
        </StateCard>

        <StateCard kind="06 · Composer rate-limited" label="Too many tries from here today">
          <div style={{fontFamily:'var(--font-display-b)', fontSize:17, color:'var(--cream)', lineHeight:1.4}}>
            "Slow down — I can't forge that fast. Give me a minute."
          </div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--accent)', marginTop:4}}>retry in 00:42</div>
          <div style={{fontFamily:'var(--font-body-b)', fontStyle:'italic', fontSize:12, color:'var(--ink-muted)', marginTop:'auto'}}>
            Composer disabled with Annie's voice, not a toast. Countdown monospace.
          </div>
        </StateCard>
      </div>

      <MkNote label="ORG PRINCIPLE" style={{marginTop:28, maxWidth:840}}>
        Every edge state is a voice moment, not a UI pattern. No toasts, no banners, no modals. A hiccup is a sentence from Annie; a 404 is a sentence from Annie; a success is a sentence from Annie. Consistency of voice is how the site earns the claim that it's her place and not a website.
      </MkNote>

      <style>{`@keyframes mkShimmer { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} }`}</style>
    </div>
  );
}

Object.assign(window, { MkStates });
