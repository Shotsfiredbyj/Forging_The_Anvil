// sections/filmstrips.jsx — interaction sequences for the 5 moments
// where the product lives or dies. Each filmstrip is a horizontal row of
// frames (captions below), annotated with motion tokens from motion.jsx.
//
// The point: stills show what a screen IS; filmstrips show what a screen DOES.
// A developer reading the package needs both.

const strip = (props) => ({
  display:'grid',
  gridTemplateColumns:`repeat(${props.cols}, 1fr)`,
  gap: 16,
  alignItems:'stretch',
});

// ── Frame: a single still with a caption and a motion-token stamp below. ───
function Frame({ label, token, children, h = 240, active }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:10}}>
      <div style={{
        border: active ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
        borderRadius: 6,
        padding: 18,
        height: h,
        background: 'transparent',
        position:'relative',
        overflow:'hidden',
      }}>
        {children}
      </div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10}}>
        <div style={{fontSize:12.5, color:'var(--ink)', fontFamily:'var(--font-body)', lineHeight:1.45}}>{label}</div>
        {token && (
          <div style={{
            fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-dim)',
            letterSpacing:'0.04em', whiteSpace:'nowrap', flexShrink:0,
          }}>{token}</div>
        )}
      </div>
    </div>
  );
}

// ── Filmstrip wrapper with a title + preamble. ─────────────────────────────
function Filmstrip({ kicker, title, preamble, cols, children, postamble }) {
  return (
    <section style={{display:'flex', flexDirection:'column', gap:18}}>
      <div>
        <div className="wk-eyebrow">{kicker}</div>
        <div style={{fontFamily:'var(--font-display)', fontSize:26, color:'var(--cream)', letterSpacing:'-0.014em', marginTop:6, lineHeight:1.22, fontWeight:500, maxWidth:780}}>{title}</div>
        {preamble && <p style={{fontSize:14.5, color:'var(--ink-bright)', lineHeight:1.6, margin:'10px 0 0', maxWidth:780, fontFamily:'var(--font-body-paragraph)'}}>{preamble}</p>}
      </div>
      <div style={strip({cols})}>{children}</div>
      {postamble && (
        <div style={{fontSize:13, color:'var(--ink-muted)', fontFamily:'var(--font-body)', maxWidth:780, lineHeight:1.55, fontStyle:'italic'}}>{postamble}</div>
      )}
    </section>
  );
}

// ── Small atoms used across multiple frames. ───────────────────────────────
const fauxSentence = 'a group-gift coordinator for people who already know what to buy';

function MiniClaim({hot, active, children}) {
  return (
    <span style={{
      borderBottom: active ? '2px solid var(--accent)' : '1px dashed color-mix(in oklab, var(--accent) 50%, transparent)',
      color: active ? 'var(--cream)' : (hot ? 'var(--cream)' : 'var(--ink-bright)'),
      padding: '0 1px',
      transition:'all 220ms cubic-bezier(0.2,0.8,0.2,1)',
    }}>{children}</span>
  );
}
function MiniPlanCard({pending, accepted}) {
  return (
    <div style={{
      padding:'12px 14px', borderRadius: 4,
      border: accepted ? '1px solid var(--accent)' : (pending ? '1px dashed var(--ink-muted)' : '1px solid var(--border-subtle)'),
      background: accepted ? 'var(--cream)' : 'transparent',
      color: accepted ? 'var(--ca-bg0s)' : 'var(--ink-bright)',
      fontFamily:'var(--font-display)', fontSize:13, lineHeight:1.4, fontWeight:500,
      position:'relative',
    }}>
      Build a one-page waitlist site.
      {accepted && (
        <div style={{
          position:'absolute', bottom:-16, right:0,
          fontFamily:'var(--font-mono)', fontSize:9, color:'var(--accent)',
          letterSpacing:'0.12em', textTransform:'uppercase',
        }}>accepted · 23 apr</div>
      )}
    </div>
  );
}
function MiniSite({selected = null, headline = 'Chip in together.'}) {
  return (
    <div style={{
      background:'#fafaf7', color:'#111', borderRadius:4, border:'1px solid var(--border-subtle)',
      padding:'14px 14px', fontFamily:'Inter, sans-serif', fontSize:11, height:'100%', overflow:'hidden', position:'relative',
    }}>
      <div style={{fontSize:9, color:'#888', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6}}>copper kettle</div>
      <div style={{
        fontFamily:'Fraunces, Georgia, serif', fontSize:18, color:'#d8a65c', fontWeight:500, letterSpacing:'-0.01em', lineHeight:1.15,
        outline: selected === 'hero' ? '2px solid var(--accent)' : 'none',
        outlineOffset: 4, borderRadius: 2,
      }}>{headline}</div>
      <div style={{fontSize:10.5, color:'#555', marginTop:6, lineHeight:1.4}}>Pool for birthdays, house-warmings, farewells. One link, many tap-to-give.</div>
      <div style={{display:'flex', gap:4, marginTop:10}}>
        <div style={{flex:1, border:'1px solid #ccc', borderRadius:3, padding:'4px 6px', fontSize:9, color:'#999'}}>you@…</div>
        <div style={{background:'#222', color:'#fff', borderRadius:3, padding:'4px 8px', fontSize:9}}>Join</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// F1 · Challenging a claim
// ════════════════════════════════════════════════════════════════════════════
function FilmChallenge() {
  return (
    <Filmstrip
      kicker="filmstrip · F1"
      title="Challenging a claim"
      preamble={<>Every underlined phrase in a vision is a <em style={{color:'var(--cream)'}}>Claim</em>. Tapping one doesn&apos;t open a modal — it attaches the phrase to the user&apos;s next message, so the challenge stays in conversation. The reversal that makes the vision theirs.</>}
      cols={4}
      postamble="No modal. No dialog. The composer swallows the claim and waits. Cancelling is: remove the chip."
    >
      <Frame label="Rest. Claims are calm, dash-underlined." token="0ms">
        <div style={{fontSize:14, color:'var(--ink-bright)', lineHeight:1.55, fontFamily:'var(--font-body-paragraph)'}}>
          Copper Kettle is <MiniClaim>{fauxSentence}</MiniClaim>.
        </div>
      </Frame>
      <Frame label="Hover. The dash thickens. Cursor becomes a pointer." token="warm · 180ms" active>
        <div style={{fontSize:14, color:'var(--ink-bright)', lineHeight:1.55, fontFamily:'var(--font-body-paragraph)'}}>
          Copper Kettle is <MiniClaim hot>{fauxSentence}</MiniClaim>.
        </div>
        <div style={{position:'absolute', bottom:14, left:14, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-dim)', letterSpacing:'0.04em'}}>hovered · pointer</div>
      </Frame>
      <Frame label="Click. The phrase flies to the composer as an attached chip." token="point · 220ms">
        <div style={{fontSize:14, color:'var(--ink-muted)', lineHeight:1.55, fontFamily:'var(--font-body-paragraph)'}}>
          Copper Kettle is <span style={{color:'var(--ink-dim)', opacity:0.5}}>{fauxSentence}</span>.
        </div>
        <div style={{position:'absolute', bottom:14, left:14, right:14,
          border:'1px solid var(--border)', borderRadius:6, padding:'8px 10px',
          display:'flex', alignItems:'center', gap:8,
          background:'color-mix(in oklab, var(--accent) 6%, transparent)',
        }}>
          <Chip accent>&ldquo;people who already know what to buy&rdquo;</Chip>
          <span style={{fontSize:10, color:'var(--ink-muted)'}}>attached</span>
        </div>
      </Frame>
      <Frame label="User types their correction. Annie replies; Claim re-renders." token="settle · 280ms">
        <div style={{fontSize:14, color:'var(--ink-bright)', lineHeight:1.55, fontFamily:'var(--font-body-paragraph)'}}>
          Copper Kettle is <MiniClaim active>a group-gift coordinator for organisers who still haven&apos;t picked the gift</MiniClaim>.
        </div>
        <div style={{position:'absolute', bottom:14, left:14, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', letterSpacing:'0.04em'}}>claim v4 · 10:42</div>
      </Frame>
    </Filmstrip>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// F2 · Click-to-point in the preview (refinement)
// ════════════════════════════════════════════════════════════════════════════
function FilmPoint() {
  return (
    <Filmstrip
      kicker="filmstrip · F2"
      title="Pointing at the live site"
      preamble={<>The preview is clickable but not editable. Clicking an element doesn&apos;t open an inline editor &mdash; it attaches that element to the next message, so Annie changes it in conversation. The product has opinions; the user has intent.</>}
      cols={4}
      postamble="This pattern keeps the AI in the loop on intent. Direct manipulation would have been a WYSIWYG; we chose the slower-feeling, clearer-thinking path."
    >
      <Frame label="Rest. Preview is flat. No affordances visible." token="0ms">
        <div style={{height:'100%'}}><MiniSite/></div>
      </Frame>
      <Frame label="Hover. The element lifts with a quiet warm outline." token="warm · 180ms" active>
        <div style={{height:'100%'}}><MiniSite selected="hero"/></div>
        <div style={{position:'absolute', bottom:10, right:10, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:3, padding:'3px 6px', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--accent)'}}>hero headline</div>
      </Frame>
      <Frame label="Click. Outline locks. Element appears as a chip in composer." token="point · 220ms">
        <div style={{height:'100%', marginBottom:-4}}><MiniSite selected="hero"/></div>
        <div style={{position:'absolute', bottom:14, left:14, right:14,
          border:'1px solid var(--border)', borderRadius:6, padding:'8px 10px',
          display:'flex', alignItems:'center', gap:8,
          background:'color-mix(in oklab, var(--accent) 6%, transparent)',
        }}>
          <Chip accent>hero headline</Chip>
          <span style={{fontSize:10, color:'var(--ink-muted)', fontStyle:'italic'}}>the hero is too cold…</span>
        </div>
      </Frame>
      <Frame label="Annie ships the change. A diff appears in conversation." token="settle · 280ms">
        <div style={{height:'100%'}}><MiniSite headline="Chip in together. Give something they'll keep."/></div>
        <div style={{position:'absolute', top:10, right:10, background:'var(--accent)', color:'var(--ca-bg0s)', borderRadius:3, padding:'2px 6px', fontFamily:'var(--font-mono)', fontSize:9, fontWeight:600}}>changed</div>
      </Frame>
    </Filmstrip>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// F3 · The Strike (accepting a plan)
// ════════════════════════════════════════════════════════════════════════════
function FilmStrike() {
  return (
    <Filmstrip
      kicker="filmstrip · F3 — signature moment"
      title="The Strike"
      preamble={<>The product&apos;s one ritual. A pending plan accepts into a stamped, dated, cream-filled card that will never be deleted. The motion is small &mdash; a 1px settle, a cream fill, a date-stamp fade-in &mdash; and on purpose. Ceremony without spectacle.</>}
      cols={4}
      postamble="The date stamp is JetBrains Mono because it looks like a real receipt and not a sticker. The ring is mustard (Cold Anvil accent). No confetti. Not ever."
    >
      <Frame label="Rest. Pending plan. Dashed border, no fill." token="0ms">
        <MiniPlanCard pending/>
        <div style={{position:'absolute', bottom:14, left:14, display:'flex', gap:6}}>
          <div style={{background:'var(--accent)', color:'var(--ca-bg0s)', fontSize:9, fontWeight:600, padding:'3px 7px', borderRadius:3}}>Accept plan</div>
          <div style={{border:'1px solid var(--border)', color:'var(--ink)', fontSize:9, padding:'3px 7px', borderRadius:3}}>Refine</div>
        </div>
      </Frame>
      <Frame label="Click. Border solidifies, cream begins to fill, 1px down-settle." token="settle · 280ms · ease-settle" active>
        <div style={{
          padding:'12px 14px', borderRadius:4,
          border:'1px solid var(--accent)',
          background:'color-mix(in oklab, var(--cream) 60%, transparent)',
          color:'color-mix(in oklab, var(--ca-bg0s) 80%, var(--ink))',
          fontFamily:'var(--font-display)', fontSize:13, lineHeight:1.4, fontWeight:500,
          transform:'translateY(1px)',
        }}>
          Build a one-page waitlist site.
        </div>
      </Frame>
      <Frame label="Date stamp fades in below. No confetti. No sound." token="emerge · 180ms">
        <MiniPlanCard accepted/>
      </Frame>
      <Frame label="Three days later. Still in place. Dated. Reference-able." token="0ms">
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <MiniPlanCard accepted/>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-dim)', letterSpacing:'0.04em', marginTop:12}}>referenced in: ledger · operator note · 2nd plan</div>
        </div>
      </Frame>
    </Filmstrip>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// F4 · Operator update (Annie tells you something broke)
// ════════════════════════════════════════════════════════════════════════════
function FilmOperator() {
  return (
    <Filmstrip
      kicker="filmstrip · F4"
      title="Annie surfaces an operator event"
      preamble={<>When something breaks that affects a real person, Annie tells you &mdash; in conversation, dated, with what she did and what&apos;s still open. Never a red alert. Never a modal. The operator card is calm because the situation is already resolved by the time you read it.</>}
      cols={3}
      postamble="Internal hiccups that didn't affect users never reach the conversation. They're in the ledger if you look."
    >
      <Frame label="Return to the project after 2 days away." token="0ms">
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <div style={{fontSize:11, color:'var(--ink-dim)', letterSpacing:'0.12em', textTransform:'uppercase'}}>while you were gone · 2 days</div>
          <div className="wk-eyebrow">3 signups · 1 operator note</div>
        </div>
      </Frame>
      <Frame label="Annie leads with the fact. Matter-of-fact. No apology theatre." token="arrive · 240ms" active>
        <div style={{fontSize:13.5, color:'var(--ink-bright)', lineHeight:1.55, fontFamily:'var(--font-body-paragraph)'}}>
          Something went wrong on <em style={{color:'var(--cream)', fontStyle:'italic'}}>Sunday morning</em>. I&apos;ve already fixed it &mdash; but one submission didn&apos;t reach you.
        </div>
      </Frame>
      <Frame label="A dated operator card. What happened · what I did · what's open." token="settle · 280ms">
        <div style={{
          padding:'10px 12px', borderRadius:4, border:'1px solid var(--accent)',
          background:'transparent',
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <div className="wk-eyebrow" style={{fontSize:9}}>operator · sun 21 apr</div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--accent)', letterSpacing:'0.08em'}}>resolved</div>
          </div>
          <div style={{fontFamily:'var(--font-display)', fontSize:13, color:'var(--cream)', marginTop:6, lineHeight:1.35, fontWeight:500}}>
            Waitlist form stopped for 47 min. One email bounced.
          </div>
          <div style={{marginTop:10, fontSize:10, color:'var(--ink-muted)', lineHeight:1.45}}>
            <span style={{fontFamily:'var(--font-mono)', color:'var(--accent)'}}>what&apos;s open:</span> message <span style={{fontFamily:'var(--font-mono)'}}>j.tanaka@…</span> directly.
          </div>
        </div>
      </Frame>
    </Filmstrip>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// F5 · Project resume (returning user)
// ════════════════════════════════════════════════════════════════════════════
function FilmResume() {
  return (
    <Filmstrip
      kicker="filmstrip · F5"
      title="Resuming the workshop"
      preamble={<>Annie doesn&apos;t greet you with a dashboard. She tells you what happened since you left, in order of relevance to you &mdash; then offers two concrete next steps pulled from your own earlier conversation. Not &ldquo;how can I help?&rdquo; &mdash; &ldquo;here&apos;s where we were; here&apos;s what you said you wanted next.&rdquo;</>}
      cols={3}
      postamble="The worst outcome of a returning-user screen is 'what was I doing?' Annie's job is to make that question unanswerable — because the answer is already on screen."
    >
      <Frame label="Open the project. The URL is the project; there&apos;s no landing page." token="0ms">
        <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-muted)', letterSpacing:'0.04em'}}>coldanvil.com/copper-kettle</div>
        <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--cream)', marginTop:14, letterSpacing:'-0.014em', fontWeight:500}}>Copper Kettle</div>
        <div style={{fontSize:11, color:'var(--ink-dim)', marginTop:4, letterSpacing:'0.1em', textTransform:'uppercase'}}>last accepted · 3 days ago</div>
      </Frame>
      <Frame label="Annie leads. One factual sentence about what changed." token="arrive · 240ms" active>
        <div style={{fontSize:13.5, color:'var(--ink-bright)', lineHeight:1.55, fontFamily:'var(--font-body-paragraph)'}}>
          Welcome back. Since you left, <em style={{color:'var(--cream)', fontStyle:'italic'}}>14 people</em> joined your waitlist. Nothing else has changed.
        </div>
      </Frame>
      <Frame label="Two concrete next steps. Both are things the user said earlier." token="settle · 280ms">
        <div style={{fontSize:13, color:'var(--ink-bright)', lineHeight:1.6, fontFamily:'var(--font-body-paragraph)'}}>
          Two things you could do next: <MiniClaim>draft a newsletter to those 14 people</MiniClaim>, or <MiniClaim>add the &ldquo;about the organiser&rdquo; section you said you wanted</MiniClaim>.
        </div>
        <div style={{position:'absolute', bottom:12, left:14, fontFamily:'var(--font-mono)', fontSize:9, color:'var(--ink-dim)', letterSpacing:'0.08em'}}>both pulled from: conversation · 19 apr</div>
      </Frame>
    </Filmstrip>
  );
}

// ── The section shell ──────────────────────────────────────────────────────
function FilmstripsSection() {
  return (
    <div className="wk-root wk-type-b" style={{padding:'40px 48px 50px', overflow:'auto', height:'100%', boxSizing:'border-box'}}>
      <div style={{display:'flex', flexDirection:'column', gap:48}}>
        <div>
          <div className="wk-eyebrow">interaction filmstrips</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:38, color:'var(--cream)', letterSpacing:'-0.018em', marginTop:10, lineHeight:1.1, fontWeight:500, maxWidth:880}}>
            Five moments where the product lives or dies.
          </div>
          <p style={{fontSize:15, color:'var(--ink-bright)', lineHeight:1.65, maxWidth:780, marginTop:14, fontFamily:'var(--font-body-paragraph)'}}>
            Stills show what a screen <em>is</em>. Filmstrips show what a screen <em>does</em>. For each sequence, motion tokens point back to the five gestures in the motion language &mdash; <span style={{fontFamily:'var(--font-mono)'}}>arrive · settle · warm · point · emerge</span>. A developer implementing these without the rest of the package should still get the feel right.
          </p>
        </div>

        <div style={{height:1, background:'var(--border-subtle)'}}/>
        <FilmChallenge/>
        <div style={{height:1, background:'var(--border-subtle)'}}/>
        <FilmPoint/>
        <div style={{height:1, background:'var(--border-subtle)'}}/>
        <FilmStrike/>
        <div style={{height:1, background:'var(--border-subtle)'}}/>
        <FilmOperator/>
        <div style={{height:1, background:'var(--border-subtle)'}}/>
        <FilmResume/>
      </div>
    </div>
  );
}

Object.assign(window, { FilmstripsSection });
