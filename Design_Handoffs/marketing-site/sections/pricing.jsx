// sections/pricing.jsx — two variants. Both built on the same primitive
// (outlined card with a mustard-cream accent); they diverge on rhythm, hierarchy,
// and what the page is really for.

const { MkNav, MkEyebrow, MkFooter, MkNote, MkClaim } = window;

// ---------------------------------------------------------------- shared

const TIERS = [
  {
    name: '[Tier 1 — placeholder]',
    monthly: 0, annual: 0,
    price: '$0',
    period: 'forever',
    lede: 'See if Annie gets you. No card, no pressure.',
    for: 'For trying things out.',
    includes: [
      'One live project',
      'Annie, available in short sessions',
      'Publish to a coldanvil.app subdomain',
      'Weekly export of your project',
      'The door (anytime full export)',
    ],
    ceiling: 'Sessions cap at ~30 min. Deployments rate-limited.',
  },
  {
    name: '[Tier 2 — placeholder]',
    monthly: 24, annual: 20,
    price: '$24',
    period: 'per month',
    lede: 'The price of a cheap lunch a week. Unlimited Annie.',
    for: 'For ideas you keep coming back to.',
    featured: true,
    includes: [
      'Unlimited projects',
      'Unlimited Annie, no session cap',
      'Custom domain',
      'Private projects',
      'Annie as operator (asks before changing)',
      'Daily export',
    ],
    ceiling: "Fair-use on generation. You'd have to try to hit it.",
  },
  {
    name: '[Tier 3 — placeholder]',
    monthly: 120, annual: 100,
    price: '$120',
    period: 'per month',
    lede: 'For the things that are going to be someone\'s job.',
    for: 'For work you rely on.',
    includes: [
      'Everything in Regular',
      'Team seats (5 included)',
      'Priority Annie (shorter queues)',
      'Scheduled Annie updates',
      'SOC-2 report, DPA, contract',
      'Direct channel to us',
    ],
    ceiling: "If you're asking whether you need this, you don't yet.",
  },
];

// Billing toggle — a quiet two-pill segmented control.
// Not a flashy "save 17%" sticker; a small honest label instead.
function BillingToggle({ value, onChange }) {
  return (
    <div style={{display:'inline-flex', alignItems:'center', gap:14, fontFamily:'var(--font-body-b)', fontSize:13}}>
      <span style={{color: value === 'monthly' ? 'var(--cream)' : 'var(--ink-muted)'}}>Monthly</span>
      <button
        type="button"
        onClick={() => onChange(value === 'monthly' ? 'annual' : 'monthly')}
        aria-label="Toggle billing period"
        style={{
          position:'relative', width:46, height:24, borderRadius:999,
          background: value === 'annual' ? 'var(--accent)' : 'var(--border)',
          border:'1px solid var(--border-subtle)', cursor:'pointer', padding:0,
          transition:'background 180ms ease',
        }}
      >
        <span style={{
          position:'absolute', top:2, left: value === 'annual' ? 24 : 2,
          width:18, height:18, borderRadius:'50%',
          background:'var(--cream)',
          transition:'left 180ms ease',
        }}/>
      </button>
      <span style={{display:'inline-flex', alignItems:'baseline', gap:8}}>
        <span style={{color: value === 'annual' ? 'var(--cream)' : 'var(--ink-muted)'}}>Annual</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- VARIANT A
// "Reading order." Three cards, left to right, hierarchy by type.
// Feels like a reasonable restaurant menu.

function PriceCardA({ tier, billing }) {
  const amount = billing === 'annual' ? tier.annual : tier.monthly;
  const showPrice = amount === 0 ? '$0' : `$${amount}`;
  const showPeriod = amount === 0 ? 'forever' : (billing === 'annual' ? 'per month, billed yearly' : 'per month');
  return (
    <div style={{
      border:'1px solid var(--border-subtle)',
      borderRadius:8,
      padding:'32px 28px',
      background: tier.featured ? 'color-mix(in oklab, var(--accent) 5%, var(--bg))' : 'transparent',
      borderColor: tier.featured ? 'var(--accent)' : 'var(--border-subtle)',
      display:'flex', flexDirection:'column', gap:20, position:'relative',
    }}>
      {tier.featured && <div style={{position:'absolute', top:-10, left:20, background:'var(--bg)', padding:'0 10px', color:'var(--accent)', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase'}}>The one most people want</div>}
      <div>
        <div className="wk-eyebrow" style={{color:'var(--ink-muted)'}}>{tier.for}</div>
        <div style={{fontFamily:'var(--font-display-b)', fontSize:30, color:'var(--cream)', letterSpacing:'-0.014em', marginTop:4}}>{tier.name}</div>
      </div>
      <div style={{display:'flex', alignItems:'baseline', gap:8, borderBottom:'1px solid var(--border-subtle)', paddingBottom:20}}>
        <span style={{fontFamily:'var(--font-display-b)', fontSize:44, color:'var(--cream)', letterSpacing:'-0.02em', lineHeight:1}}>{showPrice}</span>
        <span style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink-muted)'}}>{showPeriod}</span>
      </div>
      <p style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink-bright)', lineHeight:1.55, margin:0, textWrap:'pretty'}}>{tier.lede}</p>
      <ul style={{listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:8}}>
        {tier.includes.map((line, i) => (
          <li key={i} style={{display:'flex', gap:10, fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.5}}>
            <span style={{color:'var(--accent)', fontFamily:'var(--font-mono)', fontSize:11, lineHeight:1.8, flexShrink:0}}>—</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <div style={{fontFamily:'var(--font-body-b)', fontStyle:'italic', fontSize:12, color:'var(--ink-muted)', paddingTop:12, borderTop:'1px solid var(--border-subtle)', lineHeight:1.55}}>
        {tier.ceiling}
      </div>
      <button className={tier.featured ? 'wk-btn wk-btn--primary' : 'wk-btn'} style={{width:'100%', justifyContent:'center', marginTop:4}}>
        {tier.featured ? 'Start with this one' : `Choose ${tier.name}`}
      </button>
    </div>
  );
}

// A designer's note banner — sits above the nav on pricing artboards
// so anyone viewing the deck sees the prices are placeholders.
function PlaceholderBanner() {
  return (
    <div style={{
      background:'repeating-linear-gradient(45deg, rgba(216,166,92,0.08) 0 12px, rgba(216,166,92,0.02) 12px 24px)',
      borderBottom:'1px solid color-mix(in oklab, var(--accent) 30%, transparent)',
      padding:'10px 56px',
      fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase',
      color:'var(--ink)', display:'flex', alignItems:'center', gap:12,
    }}>
      <span style={{display:'inline-block', width:8, height:8, borderRadius:'50%', background:'var(--accent)', flexShrink:0}}/>
      <span style={{color:'var(--accent)'}}>Designer's note</span>
      <span style={{color:'var(--ink-muted)', textTransform:'none', fontFamily:'var(--font-body-b)', letterSpacing:0, fontSize:13}}>
        Tier names and prices shown are <em style={{color:'var(--cream)'}}>illustrative placeholders</em>. Final names, numbers, and copy TBD — don't copy verbatim.
      </span>
    </div>
  );
}

function MkPricingA() {
  const [billing, setBilling] = React.useState('monthly');
  return (
    <div className="mk-root">
      <div className="mk-scroll">
        <PlaceholderBanner/>
        <MkNav active="pricing"/>
        <section style={{padding:'96px 56px 48px', maxWidth:1320, margin:'0 auto'}}>
          <MkEyebrow num="·">Pricing · plain and arithmetic</MkEyebrow>
          <h1 style={{fontFamily:'var(--font-display-b)', fontSize:72, lineHeight:1.05, letterSpacing:'-0.022em', color:'var(--cream)', margin:0, maxWidth:'18ch', textWrap:'balance'}}>
            Three sizes. Name the one that fits this month.
          </h1>
          <p style={{fontFamily:'var(--font-body-b)', fontSize:19, color:'var(--ink-bright)', lineHeight:1.55, maxWidth:'60ch', marginTop:28}}>
            You can change any time. Your project comes with you. There is no per-token pricing, no credit counter, and no talk of cascades.
          </p>
        </section>

        <section style={{padding:'0 56px 24px', maxWidth:1320, margin:'0 auto'}}>
          <BillingToggle value={billing} onChange={setBilling}/>
        </section>

        <section style={{padding:'16px 56px 96px', maxWidth:1320, margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24}}>
            {TIERS.map((t, i) => <PriceCardA key={i} tier={t} billing={billing}/>)}
          </div>
        </section>

        {/* The FAQ is part of the price page, not a separate one */}
        <section style={{padding:'0 56px 120px', maxWidth:1120, margin:'0 auto'}}>
          <div className="wk-eyebrow" style={{marginBottom:24}}>The three things everyone asks</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:48}}>
            {[
              { q: 'What happens if I hit a limit?', a: 'Annie says so, in the conversation. No modal, no upsell page. She says: "we\'re at the ceiling of what\'s included — here\'s what I\'d do." You decide.' },
              { q: 'Can I really leave?', a: 'Yes. Export → Download. Your whole project arrives as a zip with a README. Works the same on all three plans.' },
              { q: 'Why no "Enterprise — contact us"?', a: "Because the Serious plan is the honest version of it. If you need something beyond it, we'd rather talk about your specific thing than pretend we have 'Enterprise' as a tier."},
            ].map((f, i) => (
              <div key={i}>
                <div style={{fontFamily:'var(--font-display-b)', fontSize:17, color:'var(--cream)', letterSpacing:'-0.005em', marginBottom:10}}>{f.q}</div>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.65}}>{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        <MkFooter/>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- VARIANT B
// "Choose by what you're doing, not by what you can afford."
// Vertical rhythm. Each tier is a scene with a scenario, not a pricing card.
// Price is present but not the lede.

function PriceSceneB({ tier, idx }) {
  const isFeatured = tier.featured;
  return (
    <section style={{borderTop:'1px solid var(--border-subtle)', padding:'72px 56px'}}>
      <div style={{maxWidth:1120, margin:'0 auto', display:'grid', gridTemplateColumns:'0.55fr 1fr', gap:72, alignItems:'start'}}>
        <div>
          <div className="wk-eyebrow" style={{color: isFeatured ? 'var(--accent)' : 'var(--ink-dim)', marginBottom:12}}>
            Tier 0{idx+1} · {tier.for}
          </div>
          <div style={{fontFamily:'var(--font-display-b)', fontSize:56, color:'var(--cream)', letterSpacing:'-0.02em', lineHeight:1.05}}>{tier.name}</div>
          <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:20}}>
            <span style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:28, color: isFeatured ? 'var(--accent)' : 'var(--cream)', letterSpacing:'-0.012em'}}>{tier.price}</span>
            <span style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink-muted)'}}>{tier.period}</span>
          </div>
          <div style={{marginTop:28}}>
            <button className={isFeatured ? 'wk-btn wk-btn--primary' : 'wk-btn'}>{isFeatured ? 'Start with this →' : `Choose ${tier.name}`}</button>
          </div>
        </div>

        <div>
          <p style={{fontFamily:'var(--font-display-b)', fontSize:24, color:'var(--cream)', lineHeight:1.35, letterSpacing:'-0.01em', margin:0, maxWidth:'30ch', textWrap:'balance'}}>
            {tier.lede}
          </p>
          <div style={{marginTop:28, display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'14px 32px'}}>
            {tier.includes.map((line, i) => (
              <div key={i} style={{display:'flex', gap:10, fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', lineHeight:1.55}}>
                <span style={{color:'var(--accent)', fontFamily:'var(--font-mono)', fontSize:11, flexShrink:0}}>{String(i+1).padStart(2,'0')}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:28, paddingTop:20, borderTop:'1px solid var(--border-subtle)', fontFamily:'var(--font-body-b)', fontStyle:'italic', fontSize:13, color:'var(--ink-muted)', lineHeight:1.6, maxWidth:'60ch'}}>
            The ceiling, honestly: {tier.ceiling}
          </div>
        </div>
      </div>
    </section>
  );
}

function MkPricingB() {
  return (
    <div className="mk-root">
      <div className="mk-scroll">
        <PlaceholderBanner/>
        <MkNav active="pricing"/>
        <section style={{padding:'96px 56px 72px', maxWidth:1320, margin:'0 auto'}}>
          <MkEyebrow num="B">Variant B · choose by what you're doing</MkEyebrow>
          <h1 style={{fontFamily:'var(--font-display-b)', fontSize:88, lineHeight:1.02, letterSpacing:'-0.025em', color:'var(--cream)', margin:0, maxWidth:'14ch', textWrap:'balance'}}>
            Three plans, each a <em style={{color:'var(--accent)', fontStyle:'italic'}}>different relationship</em> with Annie.
          </h1>
          <p style={{fontFamily:'var(--font-body-b)', fontSize:20, color:'var(--ink-bright)', lineHeight:1.55, maxWidth:'60ch', marginTop:32}}>
            Pick the one that matches what you're actually doing. Not what you think you'll do next quarter. You can move up or down any time; the project comes with you.
          </p>
        </section>

        {TIERS.map((t, i) => <PriceSceneB key={i} tier={t} idx={i}/>)}

        <section style={{padding:'96px 56px 120px', maxWidth:1120, margin:'0 auto'}}>
          <div style={{borderTop:'1px solid var(--border-subtle)', paddingTop:56}}>
            <div className="wk-eyebrow" style={{marginBottom:16}}>Three things that are true across all plans</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:32, fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink)', lineHeight:1.65}}>
              <div><strong style={{color:'var(--cream)'}}>No token pricing.</strong> You're not billed per word Annie says or per commit she makes. Subscriptions, not meters.</div>
              <div><strong style={{color:'var(--cream)'}}>Your code is yours.</strong> One-click full export on every tier. The door is always open.</div>
              <div><strong style={{color:'var(--cream)'}}>Your data doesn't leave.</strong> Conversations and builds run on our fleet. No cloud-AI passthrough. Ever.</div>
            </div>
          </div>
        </section>

        <MkFooter/>
      </div>
    </div>
  );
}

Object.assign(window, { MkPricingA, MkPricingB });
