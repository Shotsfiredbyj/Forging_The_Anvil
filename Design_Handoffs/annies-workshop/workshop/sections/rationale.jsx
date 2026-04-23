// sections/rationale.jsx — 4 artboards that precede every screen.
// Cover · Signature · IA + navigator · Scope.
// These are documents. They should feel like pages in a small book —
// rule above, generous margin, no dashboard noise.

const R = {
  Page: ({children, type='wk-type-b'}) => (
    <div className={'wk-root '+type} style={{padding:'56px 72px', overflow:'auto', height:'100%', boxSizing:'border-box'}}>
      <div style={{maxWidth:620, margin:'0 auto', fontFamily:'var(--font-body)'}}>
        {children}
      </div>
    </div>
  ),
  H: ({children, kicker, sub}) => (
    <div style={{marginBottom:30}}>
      {kicker && <div className="wk-eyebrow">{kicker}</div>}
      <div style={{fontFamily:'var(--font-display)', fontSize:36, lineHeight:1.12, color:'var(--cream)', letterSpacing:'-0.018em', marginTop: kicker?10:0, fontWeight:500}}>{children}</div>
      {sub && <div style={{color:'var(--ink-muted)', marginTop:10, fontSize:15, lineHeight:1.6}}>{sub}</div>}
    </div>
  ),
  P: ({children, lead, style}) => (
    <p style={{
      color: lead ? 'var(--cream)' : 'var(--ink)',
      fontFamily:'var(--font-body-paragraph)',
      fontSize: lead ? 17 : 15.5,
      lineHeight: lead ? 1.58 : 1.65,
      margin:'0 0 16px',
      letterSpacing:'-0.002em',
      ...style,
    }}>{children}</p>
  ),
  Q: ({children}) => (
    <blockquote style={{
      margin:'24px 0', padding:'0 0 0 22px', borderLeft:'2px solid var(--accent)',
      fontFamily:'var(--font-display)', fontStyle:'italic', fontSize:18, lineHeight:1.55,
      color:'var(--cream)',
    }}>{children}</blockquote>
  ),
  List: ({items, kind='disc'}) => (
    <ul style={{margin:'8px 0 20px', padding:0, listStyle:'none', display:'grid', gap:10}}>
      {items.map((it, i) => (
        <li key={i} style={{display:'grid', gridTemplateColumns:'24px 1fr', gap:10, fontSize:14.5, lineHeight:1.6, color:'var(--ink)'}}>
          <span style={{color:'var(--accent)', fontFamily:'var(--font-display)', fontStyle:'italic', textAlign:'right'}}>{kind === 'num' ? `${i+1}.` : '—'}</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  ),
};

// 01 — Cover
function RationaleCover() {
  return (
    <R.Page>
      <div className="wk-eyebrow">A design package for Cold Anvil</div>
      <div style={{fontFamily:'var(--font-display)', fontSize:52, lineHeight:1.02, color:'var(--cream)', letterSpacing:'-0.022em', marginTop:14, fontWeight:500}}>
        Annie's<br/>Workshop.
      </div>
      <div style={{fontFamily:'var(--font-display)', fontStyle:'italic', fontSize:20, color:'var(--accent)', marginTop:12, lineHeight:1.4}}>
        A place for a non-technical person to <span style={{color:'var(--cream)'}}>make something real.</span>
      </div>

      <div style={{height:1, background:'var(--border-subtle)', margin:'40px 0 24px'}}/>

      <R.P lead>
        This package is a single design canvas. It opens with four short rationale pages. Then it gives you three typography pairings, five motion primitives, the full first-session arc at 1440&times;900, four ongoing-relationship screens, a state library, and a component spec.
      </R.P>
      <R.P>
        Read the rationale first. It names the one signature I'd defend in the feedback round, explains the typography trade-off, and answers the three navigator questions (agency, pushing back, going a different way) for every key surface.
      </R.P>
      <R.P>
        The rest is design.
      </R.P>

      <div style={{height:1, background:'var(--border-subtle)', margin:'40px 0 24px'}}/>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, marginTop:30}}>
        <div>
          <div className="wk-eyebrow">Load-bearing inputs</div>
          <ul style={{margin:'10px 0 0', padding:0, listStyle:'none', color:'var(--ink)', fontSize:13.5, lineHeight:1.7}}>
            <li>respec/03-spec.md §1–3, §9–10</li>
            <li>Product_Specs/user-journey.md (mechanics only)</li>
            <li>Product_Specs/conversational-flows.md</li>
            <li>Cold_Anvil/BRAND.md</li>
          </ul>
        </div>
        <div>
          <div className="wk-eyebrow">Locked, carried forward</div>
          <ul style={{margin:'10px 0 0', padding:0, listStyle:'none', color:'var(--ink)', fontSize:13.5, lineHeight:1.7}}>
            <li>Bullfinch Forge palette</li>
            <li>Outlined cards, never filled</li>
            <li>Mustard is for moments</li>
            <li>Olive is non-text only</li>
            <li>Italic-as-emphasis</li>
          </ul>
        </div>
      </div>

      <div style={{marginTop:50, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.04em'}}>
        v1 · 23 apr 2026 · designed for the first feedback round
      </div>
    </R.Page>
  );
}

// 02 — The signature
function RationaleSignature() {
  return (
    <R.Page>
      <R.H kicker="The one signature">The plan.</R.H>
      <R.P lead>
        In §3 of the spec there is a single moment of commitment — Annie&apos;s one-sentence plan. The user reads a plan and either accepts it or keeps refining. That moment is the whole product&apos;s hinge. Everything before it is listening; everything after is doing. I&apos;ve made it the signature.
      </R.P>

      <R.Q>
        <span style={{color:'var(--ink)'}}>&ldquo;</span>I&apos;m going to build you a one-page site with a waitlist form that sends submissions to an inbox you control. I&apos;ll have something for you to click in about ten minutes.<span style={{color:'var(--ink)'}}>&rdquo;</span>
      </R.Q>

      <R.P>
        When the user accepts, the sentence doesn&apos;t just save. It <em style={{color:'var(--cream)', fontStyle:'italic'}}>accepted plans</em> — the card drops 1px into the page, its border warms to mustard, the cream contrast pocket fills in behind the text, and a small impression stamp pins to the bottom right. It is now a mark. It shows up in the project&apos;s ledger as the first accepted plan of the project, dated. Every subsequent plan (adding a pricing page, rewriting the hero) is another dated plan.
      </R.P>

      <R.P>
        This is the signature for four reasons.
      </R.P>

      <R.List kind="num" items={[
        <span><strong style={{color:'var(--cream)'}}>It&apos;s what the brand is literally about.</strong> Cold Anvil — cold meaning stopped, commitments recorded without forging the user into a corner they can&apos;t back out of. The anvil is not decoration; it is the surface where commitments are accepted and preserved. Without this gesture the name is mustard-coloured decoration.</span>,
        <span><strong style={{color:'var(--cream)'}}>It answers the three navigator questions explicitly.</strong> Only the user can accept &mdash; Annie can only propose. Refining is one click on the same card. &ldquo;Going a different way&rdquo; means asking Annie for a different plan. Every accepted plan can also be unstruck for as long as the project exists; the commitment is durable, not permanent.</span>,
        <span><strong style={{color:'var(--cream)'}}>It gives the ongoing relationship a vocabulary for free.</strong> &ldquo;The third plan on Copper Kettle.&rdquo; &ldquo;Annie accepted a new plan on Tuesday &mdash; you asked for a pricing page.&rdquo; A returning user sees their project&apos;s history as a dated sequence of accepted plans, not a flat activity log. The ledger is what makes Cold Anvil a <em style={{fontStyle:'italic', color:'var(--cream)'}}>dream-building machine</em>, not a one-shot builder.</span>,
        <span><strong style={{color:'var(--cream)'}}>It passes the swap test.</strong> Replace the plan card with a flat Accept button and you&apos;ve removed the only moment in the whole product where Annie is held to something specific and dated. Every subsequent &ldquo;go a different way&rdquo; gesture only makes sense because there was a named, accepted plan to push back against.</span>,
      ]}/>

      <div style={{height:1, background:'var(--border-subtle)', margin:'32px 0 24px'}}/>

      <div className="wk-eyebrow">What it is not</div>
      <R.P style={{marginTop:10}}>
        Not a hammer icon. Not a particle burst. Not a celebratory confetti moment. The accepted plan is <em style={{color:'var(--cream)', fontStyle:'italic'}}>settled</em>: the sentence dims half a shade, the border warms, the cream fills in behind. About 280ms. The motion library calls this gesture <em style={{color:'var(--cream)', fontStyle:'italic'}}>Settle</em> &mdash; it&apos;s used on every commitment moment in the product.
      </R.P>
    </R.Page>
  );
}

// 03 — IA + the navigator answers
function RationaleIA() {
  const rows = [
    {
      s: 'Arrival → Workshop',
      agency: 'User brings the text they typed on coldanvil.com — it arrives in Annie\'s first line as her reading of it, not as a saved form.',
      push:   'If Annie has the idea wrong, the user just replies — the conversation was already open.',
      away:   'Side link in the top right: "Start over with a different idea." Always present.',
    },
    {
      s: 'Discovery conversation',
      agency: 'The user types anywhere — the composer is the whole bottom of the screen, not a sidebar panel.',
      push:   'Each of Annie\'s summary claims carries a soft underline. Click it and the composer preloads "Actually, that\'s…".',
      away:   'Top-right: "Build something simpler." Takes the minimum covered fields and jumps to a plan.',
    },
    {
      s: 'Vision artefact',
      agency: 'The artefact is rendered inline in the conversation AND lives in the project as a browsable document. Same source.',
      push:   'Every claim in the artefact is individually challengeable — click the phrase that\'s wrong. Annie replies in-conversation with a replacement claim.',
      away:   '"Skip the vision, go straight to a plan" — always available as a quiet link below the artefact.',
    },
    {
      s: 'The plan',
      agency: 'Only the user can accept. Annie can propose as many times as the conversation asks for, but the mark is never hers.',
      push:   'Refine = plain-language reply on the same surface. The pending sentence updates in place.',
      away:   '"Ask for a different plan" rephrases to Annie and replaces the pending sentence with something new.',
    },
    {
      s: 'Build with live preview',
      agency: 'The preview URL is real and open. The user can refresh, open in a new tab, share with a friend while Annie is still working.',
      push:   'Annie narrates what she\'s doing in the conversation, one user-facing line per task — "Laying out your waitlist form…" The user can interrupt with "pause" or "different approach".',
      away:   '"Stop and talk" — always present. Halts the in-flight task safely and returns to conversation.',
    },
    {
      s: 'Refinement (click-to-edit)',
      agency: 'Any element in the preview is selectable with a single click. The selection becomes an anchor on the user\'s next message.',
      push:   'After each refinement Annie shows a before/after diff in the conversation — one tap to revert.',
      away:   '"Undo that change" is a durable verb, not a toast. It lives in the history ledger.',
    },
    {
      s: 'Project home (returning)',
      agency: 'The landing view is the live preview, not a dashboard. The conversation is waiting where the user left it.',
      push:   'Every artefact (vision, voice, content, architecture) is a claim surface — click a line to challenge it to Annie.',
      away:   '"Export this project" is a persistent, quiet link in the sidebar. Never a modal, never a final door.',
    },
  ];
  return (
    <R.Page>
      <R.H kicker="Information architecture">One project, one surface, one conversation.</R.H>
      <R.P lead>
        The whole workshop is a single two-column screen. Left: the project (navigation to the conversation, the four artefacts, the live preview, the ledger). Right: whatever the user is looking at right now. Annie&apos;s voice runs in a consistent slot inside whichever section is open &mdash; she is not a panel; she is a speaker.
      </R.P>
      <R.P>
        The composer is always present at the bottom of the main column, even on artefact and preview screens. This is the single most load-bearing IA choice: you can reply to Annie without switching screens. The conversation follows the user wherever they go.
      </R.P>

      <R.Q>
        Where is the user&apos;s agency here? What does pushing back look like? What does &ldquo;go a different way&rdquo; look like?
      </R.Q>

      <div className="wk-eyebrow" style={{marginTop:20}}>The three answers, per surface</div>

      <div style={{marginTop:18, display:'grid', gap:0, borderTop:'1px solid var(--border-subtle)'}}>
        {rows.map((r, i) => (
          <div key={i} style={{display:'grid', gridTemplateColumns:'150px 1fr', gap:18, padding:'18px 0', borderBottom:'1px solid var(--border-subtle)'}}>
            <div style={{fontFamily:'var(--font-display)', color:'var(--cream)', fontSize:15, lineHeight:1.35, letterSpacing:'-0.01em'}}>{r.s}</div>
            <div style={{display:'grid', gap:8, fontSize:13.5, lineHeight:1.58, color:'var(--ink)'}}>
              <div><span className="wk-eyebrow" style={{marginRight:8}}>agency</span>{r.agency}</div>
              <div><span className="wk-eyebrow" style={{marginRight:8}}>pushback</span>{r.push}</div>
              <div><span className="wk-eyebrow" style={{marginRight:8}}>other way</span>{r.away}</div>
            </div>
          </div>
        ))}
      </div>
    </R.Page>
  );
}

// 04 — Scope
function RationaleScope() {
  return (
    <R.Page>
      <R.H kicker="Scope for this pass">What&apos;s finished, what&apos;s sketched, what&apos;s next.</R.H>

      <R.P lead>
        A single round in full would be a thin pass across nine deliverables. I chose instead to carry the load-bearing surfaces to a finish that passes the squint and swap tests, and to sketch the supporting ones at a density you can still critique.
      </R.P>

      <Rule label="To finish"/>
      <R.List items={[
        <span><strong style={{color:'var(--cream)'}}>First-session arc</strong> &mdash; seven screens, 1440&times;900, real copy that obeys §9. Arrival, discovery, vision artefact, Plan card, build with preview, refinement, publishing.</span>,
        <span><strong style={{color:'var(--cream)'}}>Ongoing relationship</strong> &mdash; four screens. Project home on return, Annie-as-operator update, the four artefacts browsable, the project ledger.</span>,
        <span><strong style={{color:'var(--cream)'}}>State library</strong> &mdash; empty, first typing, mid-build, failure with rollback, reconnection, publishing, deployed. All in Annie&apos;s voice.</span>,
        <span><strong style={{color:'var(--cream)'}}>Component spec</strong> &mdash; every atom used above, with tokens. Implementable without another design round.</span>,
        <span><strong style={{color:'var(--cream)'}}>Motion language</strong> &mdash; five gestures: <em style={{color:'var(--cream)', fontStyle:'italic'}}>Settle</em>, <em style={{color:'var(--cream)', fontStyle:'italic'}}>Hold</em>, <em style={{color:'var(--cream)', fontStyle:'italic'}}>Warm</em>, <em style={{color:'var(--cream)', fontStyle:'italic'}}>Point</em>, <em style={{color:'var(--cream)', fontStyle:'italic'}}>Undo</em>. Every animation in the product is one of these.</span>,
        <span><strong style={{color:'var(--cream)'}}>Typography</strong> &mdash; three pairings side-by-side. Pick one in the feedback round and I&apos;ll propagate.</span>,
      ]}/>

      <Rule label="Deliberately thin this round"/>
      <R.List items={[
        <span><strong style={{color:'var(--cream)'}}>Mobile.</strong> The spec names mobile-web as a real use (nurses, carpenters on a phone on break). One artboard shows the composer and Plan card on a phone breakpoint; full responsive is a second round.</span>,
        <span><strong style={{color:'var(--cream)'}}>Account settings and billing.</strong> Non-load-bearing for the first-ten-user evaluation in §7. Out of scope this pass.</span>,
        <span><strong style={{color:'var(--cream)'}}>Rubric conversation (&sect;Step&nbsp;6).</strong> In the deprecated user-journey.md &mdash; superseded by the respec, which folds rubric preferences into the ongoing conversation with Annie. Not drawn this round.</span>,
      ]}/>

      <Rule label="Questions I have for you"/>
      <R.List items={[
        <span><strong style={{color:'var(--cream)'}}>Plan permanence.</strong> I have the user able to undo any past plan. Is that right, or should accepted plans older than (say) the current session become a durable record that can only be supplemented, not retracted? Argues for the latter because commitments should mean something; argues for the former because the navigator principle is absolute.</span>,
        <span><strong style={{color:'var(--cream)'}}>Operator-mode threshold.</strong> The spec says &ldquo;Annie notices and narrates on the user&apos;s next return.&rdquo; I have her narrate only failures that affect the user&apos;s product (bounced emails, DNS, expired tokens). Silent on internal warnings. Correct?</span>,
        <span><strong style={{color:'var(--cream)'}}>Export copy.</strong> I have the sidebar link read &ldquo;Take it with you anytime.&rdquo; Warmer than &ldquo;Export project.&rdquo; Feels right to me &mdash; never points at the door, just names it. Defer to your ear.</span>,
      ]}/>

      <div style={{height:1, background:'var(--border-subtle)', margin:'36px 0 22px'}}/>

      <div style={{fontFamily:'var(--font-display)', fontStyle:'italic', color:'var(--accent)', fontSize:17, lineHeight:1.5}}>
        Annie drives. The user navigates. The workshop is the room where an accepted plan is the only commitment that matters.
      </div>
    </R.Page>
  );
}

Object.assign(window, { RationaleCover, RationaleSignature, RationaleIA, RationaleScope });
