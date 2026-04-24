// sections/signature.jsx — the Live Hand.
// The composer on this artboard is wired to window.claude.complete.
// A visitor types, Annie replies. That's the signature.

function MkSignatureLiveHand() {
  return (
    <div className="mk-root" style={{padding:'64px 56px', display:'grid', gridTemplateColumns:'1fr 420px', gap:56, alignItems:'start'}}>
      <div style={{display:'flex', flexDirection:'column', gap:32}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-dim)'}}>signature moment · home, above the fold</span>
          <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
        </div>

        <h1 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:76, lineHeight:1.02, letterSpacing:'-0.022em', color:'var(--cream)', margin:0, maxWidth:'11ch', textWrap:'balance'}}>
          Bring the idea.<br/>Annie <em style={{color:'var(--accent)'}}>makes it work</em>.
        </h1>

        <p style={{fontFamily:'var(--font-display-b)', fontSize:22, lineHeight:1.5, color:'var(--ink-bright)', maxWidth:'40ch', margin:0, fontWeight:400}}>
          Annie is our product engineer — she builds <window.MkClaim>an app, a website, or a small tool</window.MkClaim> that does the thing you've been imagining. No code. No briefs. No team to hire.
        </p>

        <div style={{maxWidth:620}}>
          <window.MkLiveComposer variant="full"/>
        </div>

        <div style={{display:'flex', gap:28, marginTop:8, paddingTop:24, borderTop:'1px solid var(--border-subtle)', fontFamily:'var(--font-body-b)', fontSize:13, lineHeight:1.55, color:'var(--ink-muted)', maxWidth:620}}>
          <div style={{flex:1}}>
            <strong style={{color:'var(--cream)', fontWeight:500, display:'block'}}>Private and safe.</strong>
            <span>Nothing leaves our own computers. No third-party AI service ever sees your work.</span>
          </div>
          <div style={{flex:1}}>
            <strong style={{color:'var(--cream)', fontWeight:500, display:'block'}}>Same care for everyone.</strong>
            <span>Free or paid, the work gets the same attention.</span>
          </div>
          <div style={{flex:1}}>
            <strong style={{color:'var(--cream)', fontWeight:500, display:'block'}}>Your work is yours.</strong>
            <span>Never used for training. Not shared. Not sold.</span>
          </div>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:18, paddingTop:40}}>
        <window.MkNote label="TRY IT" tone="signal">
          Type a real idea into the composer on the left. Annie will reply in 3–4 sentences. Not a demo, not a loop — a live call to Claude Haiku, briefed as Annie. That is the signature.
        </window.MkNote>

        <window.MkNote label="WHY">
          Every other AI marketing site shows you a <em>screenshot</em> of the product and asks for your email. Cold Anvil hands you the product. The bet: five seconds of Annie is worth every word of copy we could write about her.
        </window.MkNote>

        <window.MkNote label="HERO COPY">
          Lifted verbatim from the existing site — BRAND.md §Hero rules it hits all three beats (promise, who Annie is + transaction, what it isn't). The <em>"app, website, or small tool"</em> phrasing replaces "something online that does the thing" from the live site; three concrete examples, as the hero rules ask.
        </window.MkNote>

        <window.MkNote label="CLAIM UNDERLINE" tone="default">
          The mustard underline on <em>"an app, a website, or a small tool"</em> is the workshop's <code style={{fontFamily:'var(--font-mono)', fontSize:11}}>wk-claim</code> primitive. Here it's decorative — a quiet signal that claims on Cold Anvil surfaces are always challengeable. In the workshop proper, clicking it opens the challenge flow.
        </window.MkNote>

        <window.MkNote label="FAIL MODE" tone="dissent">
          If the Claude call fails, Annie falls back to a hand-written sentence. The signature is graceful under failure — it never breaks, and the fallback reads as warmly as the live version.
        </window.MkNote>
      </div>
    </div>
  );
}

function MkSignatureAnatomy() {
  return (
    <div className="mk-root" style={{padding:'64px 56px', display:'flex', flexDirection:'column', gap:40}}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ink-dim)'}}>anatomy · what the signature is made of</span>
        <span style={{flex:1, height:1, background:'var(--border-subtle)'}}/>
      </div>

      <h2 style={{fontFamily:'var(--font-display-b)', fontWeight:500, fontSize:44, lineHeight:1.12, letterSpacing:'-0.018em', color:'var(--cream)', margin:0, maxWidth:'18ch'}}>
        Six parts, each load-bearing.
      </h2>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:40}}>
        <div>
          <window.MkLiveComposer variant="full" defaultValue=""/>
          <div style={{marginTop:24, padding:'16px 18px', background:'var(--cream)', color:'var(--ink-on-light)', border:'1px solid var(--accent)', borderRadius:6, fontFamily:'var(--font-body-b)', fontSize:12, lineHeight:1.5}}>
            <strong style={{fontWeight:600, display:'block', marginBottom:4, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase'}}>Try it — type and submit.</strong>
            <span>The composer is wired to Claude. A real reply, in the voice defined by BRAND.md §Voice. You can type the same idea three times and get three different replies.</span>
          </div>
        </div>

        <ol style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:22, fontFamily:'var(--font-body-b)', fontSize:14, lineHeight:1.6, color:'var(--ink)', counterReset:'part'}}>
          {[
            ['The ready pulse', 'The olive dot next to "Talk to Annie" pulses softly. Not a cursor — a signal that someone is on the other end. Workshop\'s ready state, extended to marketing.'],
            ['The input', 'Newsreader italic placeholder. "Half-formed hunches welcome" gives the visitor permission to type something unfinished.'],
            ['The hint row', 'Below the textarea: the one sentence that tells them what enough looks like. Changes to "Annie is reading it…" during the call, then "She\'ll pick it up" after.'],
            ['The mustard button', 'The workshop\'s wk-btn--primary, verbatim. Same geometry. Same warmth-on-hover.'],
            ['The echo', 'The visitor\'s words appear below the composer, quoted in the user-line pattern from the workshop. Says "I heard you" before anything else.'],
            ['Annie\'s reply', 'The workshop\'s Annie voice line: mustard-ringed italic A, warm Newsreader body. Three sentences that hit BRAND.md\'s voice rules — contractions, em-dashes, one good question, no jargon.'],
          ].map((item, i) => (
            <li key={i} style={{display:'grid', gridTemplateColumns:'32px 1fr', gap:18, alignItems:'baseline'}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)', letterSpacing:'0.04em'}}>0{i+1}</span>
              <div>
                <strong style={{color:'var(--cream)', fontWeight:500, display:'block', fontSize:15, marginBottom:2}}>{item[0]}</strong>
                <span>{item[1]}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, marginTop:12}}>
        <window.MkNote label="LIMIT">
          One call per visitor per minute, rate-limited by the built-in Claude helper. Enough for the signature; not enough to be used as a free Annie.
        </window.MkNote>
        <window.MkNote label="MOBILE">
          On 390px, the composer stays the full width of the column; the hint row and the button sit on the same line, smaller. The ready pulse never shrinks — it's the one unchanging landmark.
        </window.MkNote>
        <window.MkNote label="A11Y">
          Textarea is the first focusable element after the nav. Esc dismisses the reply. The pulse has aria-label="Annie is online". The reply is aria-live="polite".
        </window.MkNote>
      </div>
    </div>
  );
}

Object.assign(window, { MkSignatureLiveHand, MkSignatureAnatomy });
