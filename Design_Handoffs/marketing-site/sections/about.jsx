// sections/about.jsx — the studio story.
// Mirrors the currently-deployed /workshop/about.html section-for-section:
//   Hero → The story → Sister products → Three commitments → Cream pocket → Final CTA
// Shape preserved. Rhythm upgraded to C-era: contained pocket (not full-bleed),
// tighter editorial type, MkClaim underlines, real eyebrows.

const { MkNav, MkEyebrow, MkFooter, MkClaim } = window;

// ── Contained cream pocket — mirrors the "manifesto" section on the live page,
// but shrunk into a card so it punctuates instead of dominating (matches Home C).
function AboutCreamPocket({ children, style }) {
  return (
    <section style={{padding:'56px', maxWidth:1320, margin:'0 auto'}}>
      <div style={{
        background:'var(--cream)', color:'var(--ca-bg0s)',
        padding:'72px 64px', borderRadius:10,
        boxShadow:'inset 0 0 0 1px rgba(60,56,54,0.08)',
        ...style,
      }}>
        {children}
      </div>
    </section>
  );
}

// ── Rule between sections — mirrors the live page's <hr class="rule">
const AboutRule = () => (
  <div style={{maxWidth:1320, margin:'0 auto', padding:'0 56px'}}>
    <div style={{height:1, background:'var(--border-subtle)'}}/>
  </div>
);

function MkAbout() {
  return (
    <div className="mk-root">
      <div className="mk-scroll">
        <MkNav active="about"/>

        {/* ── HERO — compact, headline-first ── */}
        <section style={{padding:'96px 56px 80px', maxWidth:1320, margin:'0 auto'}}>
          <MkEyebrow num="00">About</MkEyebrow>
          <h1 style={{
            fontFamily:'var(--font-display-b)', fontSize:92, lineHeight:1.02,
            letterSpacing:'-0.025em', color:'var(--cream)', margin:0, fontWeight:500,
            maxWidth:'14ch', textWrap:'balance',
          }}>
            We built this for <em style={{color:'var(--accent)', fontStyle:'italic'}}>ourselves</em>, first.
          </h1>
          <p style={{
            fontFamily:'var(--font-body-b)', fontSize:20, lineHeight:1.55,
            color:'var(--ink-bright)', maxWidth:'58ch', marginTop:32,
          }}>
            Cold Anvil is a product technology company. We make software to solve problems we care about — and we've ended up packaging the tools we built for ourselves so anyone with an idea can use them too.
          </p>
        </section>

        <AboutRule/>

        {/* ── THE STORY — two-column editorial, longform on the right ── */}
        <section style={{padding:'88px 56px', maxWidth:1320, margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns:'0.85fr 1.15fr', gap:80, alignItems:'start'}}>
            <div>
              <MkEyebrow num="01">The story</MkEyebrow>
              <h2 style={{
                fontFamily:'var(--font-display-b)', fontSize:48, color:'var(--cream)',
                margin:'20px 0 0', letterSpacing:'-0.018em', lineHeight:1.1,
                maxWidth:'14ch', textWrap:'balance',
              }}>
                Built for us. Opened up to <em style={{color:'var(--accent)', fontStyle:'italic'}}>everyone</em>.
              </h2>
            </div>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:17, color:'var(--ink)', lineHeight:1.75, maxWidth:'56ch'}}>
              <p style={{margin:0}}>
                We've spent over fifteen years making products — web, mobile, platform capabilities for hundreds of millions of users. We care about building things well.
              </p>
              <p style={{marginTop:20}}>
                Along the way we kept running into the same thing: <MkClaim>good ideas that never got made</MkClaim>. Sometimes ours, sometimes other people's. The cost of getting from idea to working thing was always too high.
              </p>
              <p style={{marginTop:20}}>
                So we built our own workshop. A tool that takes an idea, asks the right questions, and builds a first version you can see and use. We used it to start the products we cared about — and it worked well enough that we opened it up.
              </p>
              <p style={{marginTop:28, fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:22, color:'var(--cream)', lineHeight:1.4, letterSpacing:'-0.005em'}}>
                Cold Anvil is that workshop, now yours to use.
              </p>
            </div>
          </div>
        </section>

        <AboutRule/>

        {/* ── SISTER PRODUCTS — honest context for "problems we care about" ── */}
        <section style={{padding:'88px 56px', maxWidth:1320, margin:'0 auto'}}>
          <MkEyebrow num="02">What we're working on</MkEyebrow>
          <h2 style={{
            fontFamily:'var(--font-display-b)', fontSize:44, color:'var(--cream)',
            margin:'20px 0 40px', letterSpacing:'-0.018em', lineHeight:1.12,
            maxWidth:'22ch', textWrap:'balance',
          }}>
            The products that came out of our workshop.
          </h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:40}}>
            {[
              {
                name: 'Fourth Age',
                line: "An AI creative partner for content creators. For people who have something to say and want help shaping it without losing their voice.",
              },
              {
                name: 'Celyn',
                line: "A clinical tool for functional medicine practitioners. Helping clinicians spend less time sifting through patient data and more time actually with the patient.",
              },
            ].map((p, i) => (
              <div key={i} style={{
                padding:'32px 32px 36px',
                border:'1px solid var(--border-subtle)',
                borderRadius:8,
                background:'var(--ca-bg1)',
              }}>
                <h3 style={{
                  fontFamily:'var(--font-display-b)', fontSize:28, color:'var(--cream)',
                  margin:0, letterSpacing:'-0.012em',
                }}>{p.name}</h3>
                <p style={{
                  fontFamily:'var(--font-body-b)', fontSize:16, color:'var(--ink)',
                  lineHeight:1.65, marginTop:14, maxWidth:'46ch',
                }}>{p.line}</p>
              </div>
            ))}
          </div>
          <p style={{
            fontFamily:'var(--font-body-b)', fontSize:15, fontStyle:'italic',
            color:'var(--ink-muted)', marginTop:28, maxWidth:'56ch',
          }}>
            Both were problems we wanted to solve. The workshop that built them is now Cold Anvil.
          </p>
        </section>

        <AboutRule/>

        {/* ── THREE COMMITMENTS — the trust spine ── */}
        <section style={{padding:'88px 56px 56px', maxWidth:1320, margin:'0 auto'}}>
          <MkEyebrow num="03">What we believe</MkEyebrow>
          <h2 style={{
            fontFamily:'var(--font-display-b)', fontSize:44, color:'var(--cream)',
            margin:'20px 0 12px', letterSpacing:'-0.018em', lineHeight:1.12,
            maxWidth:'22ch', textWrap:'balance',
          }}>
            Three commitments. No exceptions.
          </h2>
          <p style={{
            fontFamily:'var(--font-body-b)', fontSize:18, color:'var(--ink-bright)',
            lineHeight:1.55, maxWidth:'58ch', marginTop:8,
          }}>
            Said plainly, once, because they matter — and because every pricing tier and product decision comes back to them.
          </p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:48, marginTop:48}}>
            {[
              {
                title: 'Quality over speed.',
                body: "Every output is checked and reworked until it meets the bar. We never trade depth for speed. When there's a choice between shipping fast and doing it right, we do it right.",
              },
              {
                title: 'Your ideas are yours.',
                body: "We run our own computers. Your work never touches third-party AI services and is never used for training. Your project stays your project — full stop.",
              },
              {
                title: 'Imagination matters.',
                body: "We named this studio for a love of Tolkien — for the obsession required to make something not just good, but deeply imaginative. The goal is work that feels like yours.",
              },
            ].map((c, i) => (
              <div key={i}>
                <h3 style={{
                  fontFamily:'var(--font-display-b)', fontSize:22, color:'var(--cream)',
                  margin:0, letterSpacing:'-0.01em',
                }}>{c.title}</h3>
                <p style={{
                  fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink)',
                  lineHeight:1.7, marginTop:14, maxWidth:'40ch',
                }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CREAM POCKET — "Who this is for" · contained, matches Home C rhythm ── */}
        <AboutCreamPocket>
          <div style={{
            fontFamily:'var(--font-body-b)', fontSize:11, letterSpacing:'0.22em',
            textTransform:'uppercase', color:'var(--ca-bg3)', marginBottom:20,
          }}>
            Who this is for
          </div>
          <h2 style={{
            fontFamily:'var(--font-display-b)', fontSize:54, color:'var(--ca-bg0s)',
            margin:0, letterSpacing:'-0.02em', lineHeight:1.08, maxWidth:'20ch',
          }}>
            Anyone with an idea they want <em style={{color:'var(--ca-bg0s)', fontStyle:'italic'}}>made real</em>.
          </h2>
          <p style={{
            fontFamily:'var(--font-display-b)', fontSize:20, fontStyle:'italic',
            color:'var(--ca-bg0s)', lineHeight:1.55, maxWidth:'50ch', marginTop:28,
          }}>
            It doesn't matter what you do for a living, or what you've built before, or whether you've ever touched code.
          </p>
          <p style={{
            fontFamily:'var(--font-display-b)', fontSize:20, fontStyle:'italic',
            color:'var(--ca-bg0s)', lineHeight:1.55, maxWidth:'50ch', marginTop:14,
          }}>
            If you've had an idea you can't get out of your head — bring it. Annie takes it from there.
          </p>
        </AboutCreamPocket>

        {/* ── FINAL CTA ── */}
        <section style={{padding:'72px 56px 120px', maxWidth:1320, margin:'0 auto'}}>
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'end',
            borderTop:'1px solid var(--border-subtle)', paddingTop:64,
          }}>
            <h2 style={{
              fontFamily:'var(--font-display-b)', fontSize:56, color:'var(--cream)',
              margin:0, letterSpacing:'-0.02em', lineHeight:1.08, maxWidth:'16ch',
            }}>
              Bring an idea. See what <em style={{color:'var(--accent)', fontStyle:'italic'}}>comes out</em>.
            </h2>
            <div>
              <p style={{
                fontFamily:'var(--font-body-b)', fontSize:16, color:'var(--ink-bright)',
                lineHeight:1.6, margin:0, maxWidth:'42ch',
              }}>
                Free to start. No card required. Bring the idea — Annie will help you out.
              </p>
              <div style={{display:'flex', alignItems:'center', gap:14, marginTop:24}}>
                <button className="wk-btn wk-btn--primary" style={{fontSize:15, padding:'12px 22px'}}>Talk to Annie →</button>
                <button className="wk-btn" style={{fontSize:15, padding:'12px 22px', background:'transparent', border:'1px solid var(--border-subtle)', color:'var(--ink-bright)'}}>See pricing</button>
              </div>
            </div>
          </div>
        </section>

        <MkFooter/>
      </div>
    </div>
  );
}

Object.assign(window, { MkAbout });
