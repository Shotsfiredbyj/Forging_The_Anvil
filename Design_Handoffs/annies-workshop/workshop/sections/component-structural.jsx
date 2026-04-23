// sections/component-structural.jsx — props/states/tokens table for developer handoff.
// Complements components.jsx (visual spec) with a machine-friendlier view.
// The rule: every row names the CSS class, the props, the states, and the
// tokens it reads. A dev should be able to implement from this alone.

const SX = {
  row: {
    display:'grid',
    gridTemplateColumns:'180px 1fr 1fr 1fr',
    gap:'0 24px',
    padding:'18px 0',
    borderTop:'1px solid var(--border-subtle)',
    alignItems:'start',
  },
  headRow: {
    display:'grid',
    gridTemplateColumns:'180px 1fr 1fr 1fr',
    gap:'0 24px',
    padding:'10px 0 10px',
    fontFamily:'var(--font-body)', fontSize:10,
    color:'var(--ink-dim)',
    letterSpacing:'0.14em', textTransform:'uppercase',
  },
  cellLabel: {
    fontFamily:'var(--font-display)', fontSize:16, color:'var(--cream)',
    letterSpacing:'-0.012em', lineHeight:1.25, fontWeight:500,
  },
  cellClass: {
    fontFamily:'var(--font-mono)', fontSize:11, color:'var(--accent)',
    letterSpacing:'0.02em', marginTop:4,
  },
  col: { display:'flex', flexDirection:'column', gap:4 },
  code: {
    fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--ink-bright)',
    lineHeight:1.6, letterSpacing:'0.02em', whiteSpace:'pre-wrap',
  },
  codeTag: {
    display:'inline-block',
    padding:'2px 6px',
    fontFamily:'var(--font-mono)', fontSize:10.5,
    color:'var(--ink-bright)',
    background:'color-mix(in oklab, var(--ink) 10%, transparent)',
    borderRadius:3,
    marginRight:4, marginBottom:4,
    letterSpacing:'0.02em',
  },
  note: {
    fontFamily:'var(--font-body)', fontSize:11.5,
    color:'var(--ink-muted)', lineHeight:1.55, marginTop:6,
  },
};

function Head() {
  return (
    <div style={SX.headRow}>
      <div>component</div>
      <div>props / api</div>
      <div>states</div>
      <div>tokens read</div>
    </div>
  );
}

function Row({ label, cls, notes, props, states, tokens }) {
  return (
    <div style={SX.row}>
      <div>
        <div style={SX.cellLabel}>{label}</div>
        <div style={SX.cellClass}>{cls}</div>
        {notes && <div style={SX.note}>{notes}</div>}
      </div>
      <div style={SX.col}>
        {props.map((p, i) => <div key={i} style={SX.code}>{p}</div>)}
      </div>
      <div style={{...SX.col, flexDirection:'row', flexWrap:'wrap'}}>
        {states.map((s, i) => <span key={i} style={SX.codeTag}>{s}</span>)}
      </div>
      <div style={SX.col}>
        {tokens.map((t, i) => <div key={i} style={SX.code}>{t}</div>)}
      </div>
    </div>
  );
}

function ComponentStructural() {
  return (
    <div className="wk-root wk-type-b" style={{padding:'36px 40px 48px', overflow:'auto', height:'100%', boxSizing:'border-box'}}>
      <div style={{maxWidth:900}}>
        <div className="wk-eyebrow">component spec · structural</div>
        <div style={{fontFamily:'var(--font-display)', fontSize:32, color:'var(--cream)', letterSpacing:'-0.016em', marginTop:10, lineHeight:1.15, fontWeight:500}}>
          Props, states, tokens. Implementable without another design round.
        </div>
        <p style={{fontSize:14.5, color:'var(--ink-bright)', lineHeight:1.65, maxWidth:780, marginTop:14, fontFamily:'var(--font-body-paragraph)'}}>
          Every component in the prototype is named below with its React-style prop shape, every state it can be in, and the CSS custom properties it reads. Where a motion token appears in &ldquo;states,&rdquo; it points to a named gesture in <span style={{fontFamily:'var(--font-mono)'}}>motion.jsx</span>. Token references map 1:1 to <span style={{fontFamily:'var(--font-mono)'}}>tokens.css</span>.
        </p>
      </div>

      <div style={{marginTop:28}}>
        <Head/>

        <Row
          label="Shell"
          cls=".wk-root + layout primitive"
          notes="Page-level shell. Sidebar rail + main column + header."
          props={[
            `project: string`,
            `section: 'Conversation'|'Vision'|'Brand voice'|'Content'|'Architecture'|'Preview'|'History'`,
            `children: ReactNode`,
          ]}
          states={['desktop ≥1440','tablet 768–1439','mobile <768']}
          tokens={['--bg, --ink', '--border-subtle', '--font-display, --font-body']}
        />

        <Row
          label="AnnieLine"
          cls=".wk-annie-line / .wk-annie-mark / .wk-annie-body"
          notes="Annie's voice in conversation. Always has a margin glyph."
          props={[
            `mark: 'a'|'a.n'|'a.o'  // 'a.o' = operator mode`,
            `tail?: boolean         // renders caret when true`,
            `children: ReactNode`,
          ]}
          states={['rest','typing (caret)','operator (mark=a.o)']}
          tokens={['--accent (mark)', '--ink-bright (body)', '--font-body-paragraph']}
        />

        <Row
          label="UserLine"
          cls=".wk-user-line"
          notes="User-authored turn. 2px left rule, 'you' kicker."
          props={[`children: ReactNode`]}
          states={['rest','with-attachment (chip visible in composer)']}
          tokens={['--ink-dim (rule)', '--ink (body)']}
        />

        <Row
          label="Claim"
          cls=".wk-claim / .wk-claim--hot"
          notes="Underlined, challengeable phrase in a vision or conversation."
          props={[
            `hot?: boolean          // elevated — 'this is the crux'`,
            `children: ReactNode`,
          ]}
          states={['rest (dash-underline)','hover (warm)','hot (filled bar)','pointed (chip attached to composer)']}
          tokens={['--accent (bar)', 'motion/warm 180ms', 'motion/point 220ms']}
        />

        <Row
          label="StruckPlan"
          cls=".wk-struck / .wk-struck--pending"
          notes="The signature. One-sentence plan with Accept / Refine actions or a dated stamp."
          props={[
            `pending?: boolean      // pre-accept state`,
            `stamp?: string         // e.g. 'accepted · v1'`,
            `date?: string          // e.g. '23 apr 2026'`,
            `onStrike?: () => void`,
            `onRefine?: () => void`,
            `children: ReactNode`,
          ]}
          states={['pending (dashed)','accepting (transition)','accepted (cream)','referenced (read-only)']}
          tokens={['--accent (ring)', '--cream (fill)', '--font-mono (date stamp)', 'motion/settle 280ms', 'motion/emerge 180ms']}
        />

        <Row
          label="Composer"
          cls="(inline in first-session.jsx)"
          notes="Persistent input at the bottom of any conversation column. Never a modal."
          props={[
            `value?: string`,
            `placeholder?: string`,
            `attach?: string        // attached claim or pointed-element`,
            `right?: ReactNode      // slot for context, e.g. 'Stop and talk'`,
          ]}
          states={['empty','typing','with-attachment','sending']}
          tokens={['--border', '--ink-bright', '--accent (send button)', 'motion/warm on focus']}
        />

        <Row
          label="Browser"
          cls=".wk-browser / .wk-browser__bar / .wk-browser__url"
          notes="Live preview chrome. Only used for the preview pane."
          props={[
            `url?: string`,
            `state?: 'live'|'staging'|'issuing'`,
            `height?: number`,
            `children: ReactNode`,
          ]}
          states={['staging (no badge)','live (green badge)','issuing (mustard pulse)']}
          tokens={['--border', '--font-mono (url)', '--accent (live badge border)']}
        />

        <Row
          label="Chip"
          cls=".wk-chip / .wk-chip--accent / .wk-chip--live"
          notes="Status and tag pill. Three variants."
          props={[
            `accent?: boolean       // mustard border + dot`,
            `live?: boolean         // green dot, usually 'live'/'running'`,
            `children: ReactNode`,
          ]}
          states={['default','accent','live','with-remove (in composer attachment)']}
          tokens={['--border', '--accent', '--cream']}
        />

        <Row
          label="Button"
          cls=".wk-btn / .wk-btn--primary / .wk-btn--sm / .wk-btn--ghost"
          notes="Primary is mustard-filled. No icon unless it earns its place."
          props={[
            `variant?: 'default'|'primary'|'ghost'`,
            `size?: 'default'|'sm'`,
            `disabled?: boolean`,
          ]}
          states={['rest','hover (warm)','focus-visible','active (1px translate)','disabled']}
          tokens={['--accent (primary)', '--border (default)', 'motion/warm 180ms']}
        />

        <Row
          label="LedgerRow"
          cls="(inline in ongoing.jsx — ScreenLedger)"
          notes="One row of the project history. 82px date gutter + dot + body."
          props={[
            `date: string           // '23 apr'`,
            `kind: 'struck'|'refined'|'operator'|'unstrike'`,
            `body: ReactNode`,
          ]}
          states={['struck (cream)','refined (ink)','operator (olive dot)','unstrike (italic, muted)']}
          tokens={['--accent', '--ink-dim', '--secondary (olive)', '--font-mono (date)']}
        />

        <Row
          label="Phone (mobile frame)"
          cls="(inline in mobile.jsx)"
          notes="iPhone-style content frame. 390×844 content area. Status bar + dynamic island + home indicator."
          props={[
            `timeHint?: string      // default '9:41'`,
            `statusTint?: CSSColor`,
            `children: ReactNode`,
          ]}
          states={['—']}
          tokens={['--bg', '--border-subtle']}
        />

        <Row
          label="MobileTopBar"
          cls="(inline in mobile.jsx)"
          notes="Replaces the desktop sidebar on mobile. Brand + project title + right slot."
          props={[
            `project?: string`,
            `section?: string`,
            `right?: ReactNode      // menu button by default`,
          ]}
          states={['default','with-chip (e.g. 'live · 3d')']}
          tokens={['--accent (brand)', '--ink-dim (section kicker)', '--border-subtle']}
        />

        <Row
          label="MobileTabBar"
          cls="(inline in mobile.jsx)"
          notes="The four destinations the sidebar exposed on desktop: Talk · Vision · Preview · History."
          props={[
            `active: 'chat'|'vision'|'preview'|'ledger'`,
          ]}
          states={['rest','active-tab']}
          tokens={['--cream (active)', '--ink-dim (inactive)', '--border-subtle']}
        />

        <Row
          label="MobileComposer"
          cls="(inline in mobile.jsx)"
          notes="Pill composer. 44px tap target. Sits above MobileTabBar."
          props={[
            `value?: string`,
            `placeholder?: string`,
            `attach?: string`,
          ]}
          states={['empty','typing','with-attachment']}
          tokens={['--border', '--ink-bright', '--accent (send)']}
        />
      </div>

      {/* Motion tokens cross-reference */}
      <div style={{marginTop:40, borderTop:'1px solid var(--border-subtle)', paddingTop:24}}>
        <div className="wk-eyebrow">motion tokens</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:16, marginTop:14}}>
          {[
            {name:'arrive', ms:'240ms', curve:'cubic-bezier(0.2, 0.9, 0.25, 1)', where:'new conversation line, operator card on return'},
            {name:'settle', ms:'280ms', curve:'cubic-bezier(0.2, 0.8, 0.2, 1)', where:'Strike acceptance, claim update, diff applied'},
            {name:'warm',   ms:'180ms', curve:'cubic-bezier(0.2, 0.8, 0.2, 1)', where:'hover on Claim, focus on input, button hover'},
            {name:'point',  ms:'220ms', curve:'cubic-bezier(0.2, 0.8, 0.2, 1)', where:'click on Claim, click on preview element'},
            {name:'emerge', ms:'180ms', curve:'cubic-bezier(0.3, 0.0, 0.2, 1)', where:'date stamp fade-in after Strike'},
          ].map(m => (
            <div key={m.name} className="wk-card" style={{padding:'14px 16px', background:'transparent'}}>
              <div style={{fontFamily:'var(--font-mono)', fontSize:12, color:'var(--accent)', letterSpacing:'0.04em'}}>{m.name}</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:14, color:'var(--cream)', marginTop:6, letterSpacing:'-0.01em', fontWeight:500}}>{m.ms}</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-muted)', marginTop:2, letterSpacing:'0.02em'}}>{m.curve}</div>
              <div style={{fontSize:11.5, color:'var(--ink-bright)', lineHeight:1.5, marginTop:10, fontFamily:'var(--font-body)'}}>{m.where}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Token reference */}
      <div style={{marginTop:32, borderTop:'1px solid var(--border-subtle)', paddingTop:24}}>
        <div className="wk-eyebrow">token reference</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, marginTop:14}}>
          <div>
            <div style={{fontFamily:'var(--font-display)', fontSize:14, color:'var(--cream)', fontWeight:500, marginBottom:8}}>Color</div>
            <div style={{display:'grid', gap:4, fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--ink-bright)', lineHeight:1.5}}>
              <div>--bg          #32302f  page base (Bullfinch core)</div>
              <div>--bg-surface  #3c3836  card surface</div>
              <div>--bg-elevated #4b4441  lifted elevation</div>
              <div>--ink         #d4be9a  body on page bg · 7.27:1 AAA</div>
              <div>--ink-bright  #ebdbb2  body on lifted surfaces · 9.57:1 AAA</div>
              <div>--ink-muted   #a89984  captions, secondary</div>
              <div>--ink-dim     #928374  tertiary / mono stamp</div>
              <div>--border      #928374  visible card border · 3.58:1</div>
              <div>--border-subtle  #4b4441  hairline</div>
              <div>--accent      #d8a65c  mustard · Cold Anvil signature</div>
              <div>--cream       #fbf1c7  accepted-plan fill</div>
              <div>--secondary   #8c945c  olive · non-text dots only</div>
            </div>
          </div>
          <div>
            <div style={{fontFamily:'var(--font-display)', fontSize:14, color:'var(--cream)', fontWeight:500, marginBottom:8}}>Type, space, radius</div>
            <div style={{display:'grid', gap:4, fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--ink-bright)', lineHeight:1.5}}>
              <div>--font-display        "Newsreader" · display only</div>
              <div>--font-body           "Inter" · UI 14/1.45</div>
              <div>--font-body-paragraph "Inter" · 16/1.62</div>
              <div>--font-mono           "JetBrains Mono" · stamps, code</div>
              <div>--eyebrow             11px / 0.18em / uppercase</div>
              <div/>
              <div>spacing base  4px</div>
              <div>radii         4 / 6 / 10 (no hard corners &gt; 10)</div>
              <div>max paragraph 72ch</div>
              <div>min paragraph 32ch</div>
              <div>touch target  44×44</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ComponentStructural });
