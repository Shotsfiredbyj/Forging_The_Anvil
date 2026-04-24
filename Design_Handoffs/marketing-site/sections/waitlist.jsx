// sections/waitlist.jsx — the holding page, freshened.
// Mirrors the currently-deployed / (holding) page section-for-section:
//   Wordmark → Eyebrow → Headline → Tagline → Lead → Email form → Reassurance
//   → Workshop teaser (rotated, bleeding off the right edge)
//   → Footer
//
// Shape preserved exactly. Rhythm upgraded to C-era: tokens-native,
// MkClaim underlines, tighter type, unified with the rest of the canvas.

const { MkWordmark, MkAnnie } = window;

// ── WorkshopTeaser — an aspirational, non-interactive still of Annie's workshop.
// Matches the "peek inside" pattern on the live holding page: browser chrome,
// sidebar with a project name, conversation in progress, plan visible at the
// bottom of the thread. Rotated and bleeding off the right edge on desktop.
// Also exported for reuse elsewhere on the canvas.
function WorkshopTeaser({ tilted = false }) {
  const wrap = {
    display:'flex', flexDirection:'column',
    background:'var(--ca-bg0s)',
    border:'1px solid var(--border-subtle)',
    borderRadius:12,
    boxShadow:'0 32px 64px -24px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.02) inset',
    overflow:'hidden',
    fontFamily:'var(--font-body-b)',
    color:'var(--ink)',
  };
  return (
    <div style={{
      ...wrap,
      ...(tilted ? {transform:'rotate(-2deg)', transformOrigin:'top left'} : null),
    }}>
      {/* Browser chrome */}
      <div style={{
        display:'flex', alignItems:'center', gap:14, padding:'11px 16px',
        background:'var(--ca-bg1)', borderBottom:'1px solid var(--border-subtle)',
      }}>
        <div style={{display:'flex', gap:6}}>
          <span style={{width:10, height:10, borderRadius:'50%', background:'#3c3836'}}/>
          <span style={{width:10, height:10, borderRadius:'50%', background:'#3c3836'}}/>
          <span style={{width:10, height:10, borderRadius:'50%', background:'#3c3836'}}/>
        </div>
        <div style={{
          flex:1, textAlign:'center', fontSize:11, color:'var(--ink-muted)',
          fontFamily:'var(--font-mono)', letterSpacing:'0.02em',
        }}>
          annie.coldanvil.com
        </div>
        <div style={{width:40}}/>
      </div>
      {/* Body — sidebar + conversation */}
      <div style={{display:'grid', gridTemplateColumns:'200px 1fr', minHeight:360}}>
        {/* Sidebar */}
        <aside style={{
          borderRight:'1px solid var(--border-subtle)',
          padding:'20px 18px',
          background:'var(--ca-bg1)',
          display:'flex', flexDirection:'column', gap:24,
        }}>
          <div style={{display:'flex', alignItems:'center', gap:10, color:'var(--cream)', fontFamily:'var(--font-display-b)', fontSize:14, letterSpacing:'0.01em'}}>
            <span style={{width:18, height:18, borderRadius:4, background:'var(--accent)'}}/>
            Cold Anvil
          </div>
          <div>
            <div style={{
              fontFamily:'var(--font-body-b)', fontSize:10, letterSpacing:'0.18em',
              textTransform:'uppercase', color:'var(--ink-muted)', marginBottom:10,
            }}>Project</div>
            <div style={{fontFamily:'var(--font-display-b)', fontSize:16, color:'var(--cream)', letterSpacing:'-0.005em'}}>Copper Kettle</div>
            <div style={{fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-muted)', marginTop:4}}>book club · host picks</div>
          </div>
          <div>
            <div style={{
              fontFamily:'var(--font-body-b)', fontSize:10, letterSpacing:'0.18em',
              textTransform:'uppercase', color:'var(--ink-muted)', marginBottom:10,
            }}>In the shop</div>
            <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:8, fontSize:13, color:'var(--ink)'}}>
              <li>· a first site</li>
              <li>· the host-picks page</li>
              <li style={{color:'var(--ink-muted)'}}>· rsvp (soon)</li>
            </ul>
          </div>
        </aside>
        {/* Conversation */}
        <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:16}}>
          <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
            <MkAnnie size={24}/>
            <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:16, color:'var(--cream)', lineHeight:1.5, maxWidth:'46ch'}}>
              What one thing should the page do when someone lands on it?
            </div>
          </div>
          <div style={{alignSelf:'flex-end', maxWidth:'56ch'}}>
            <div style={{
              background:'var(--ca-bg1)', border:'1px solid var(--border-subtle)',
              borderRadius:10, padding:'12px 16px',
              fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink-bright)', lineHeight:1.5,
            }}>
              Show the book, who picked it, and when we're meeting.
            </div>
          </div>
          <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
            <MkAnnie size={24}/>
            <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:16, color:'var(--cream)', lineHeight:1.5, maxWidth:'46ch'}}>
              Good. One page, mobile-first. I'll draft it — you tell me if it's too plain.
            </div>
          </div>
          {/* Plan stamp */}
          <div style={{
            marginTop:8, padding:'12px 14px', borderRadius:8,
            border:'1px dashed var(--accent)',
            display:'flex', alignItems:'center', gap:12,
            fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink-bright)',
          }}>
            <span style={{
              fontFamily:'var(--font-body-b)', fontSize:10, letterSpacing:'0.18em',
              textTransform:'uppercase', color:'var(--accent)',
            }}>The plan</span>
            <span style={{color:'var(--ink-muted)'}}>one page · host picks · rsvp later</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── The waitlist page (canonical) ──
function MkWaitlistC() {
  const [submitted, setSubmitted] = React.useState(false);
  const onSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div className="mk-root">
      <div className="mk-scroll" style={{
        position:'relative', minHeight:'100%',
        background:'var(--ca-bg0s)',
        overflow:'hidden',
      }}>
        {/* Subtle warm gradient wash — quieter than Home C's hero, because this
            is a holding page: the content is the event, not the backdrop. */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          background:'radial-gradient(60% 40% at 30% 20%, rgba(216,166,92,0.10), transparent 60%), radial-gradient(40% 30% at 70% 80%, rgba(140,148,92,0.06), transparent 60%)',
        }}/>

        {/* Wordmark — top-left, matches live holding page */}
        <div style={{position:'absolute', top:40, left:56, zIndex:3}}>
          <MkWordmark size={18} tone="default"/>
        </div>

        {/* Main content grid: left column letter, right column teaser */}
        <div style={{
          position:'relative', zIndex:2,
          display:'grid', gridTemplateColumns:'minmax(0, 620px) 1fr',
          gap:40, alignItems:'center', minHeight:'100vh',
          padding:'140px 56px 96px',
          maxWidth:1440, margin:'0 auto',
        }}>
          {/* ── Left: the letter ── */}
          <div>
            <p style={{
              fontFamily:'var(--font-body-b)', fontSize:12, letterSpacing:'0.22em',
              textTransform:'uppercase', color:'var(--accent)', margin:0,
            }}>
              A peek inside the workshop
            </p>
            <h1 style={{
              fontFamily:'var(--font-display-b)', fontSize:80, fontWeight:500,
              color:'var(--cream)', lineHeight:1.03, letterSpacing:'-0.025em',
              margin:'22px 0 0', maxWidth:'14ch', textWrap:'balance',
            }}>
              Annie's workshop opens <em style={{color:'var(--accent)', fontStyle:'italic'}}>soon</em>.
            </h1>
            <p style={{
              fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:22,
              color:'var(--ink-bright)', lineHeight:1.4, margin:'28px 0 0', maxWidth:'30ch',
            }}>
              Product development, for anyone with an idea.
            </p>
            <p style={{
              fontFamily:'var(--font-body-b)', fontSize:17, color:'var(--ink)',
              lineHeight:1.65, margin:'24px 0 0', maxWidth:'46ch',
            }}>
              Annie is our product engineer. She builds the thing you've been meaning to build — clickable by the end of the day. We're putting the finishing touches to her workshop.
            </p>

            {/* Form */}
            {!submitted ? (
              <form onSubmit={onSubmit} style={{marginTop:36, maxWidth:520}}>
                <div style={{
                  display:'flex', gap:0,
                  border:'1px solid var(--border-subtle)',
                  borderRadius:8, overflow:'hidden',
                  background:'rgba(12,11,10,0.45)',
                  backdropFilter:'blur(6px)',
                  WebkitBackdropFilter:'blur(6px)',
                }}>
                  <input
                    type="email" required
                    placeholder="you@example.com"
                    style={{
                      flex:1, border:'none', outline:'none',
                      padding:'16px 18px',
                      background:'transparent',
                      color:'var(--cream)',
                      fontFamily:'var(--font-body-b)', fontSize:15,
                    }}
                  />
                  <button type="submit" className="wk-btn wk-btn--primary" style={{borderRadius:0, padding:'0 22px', fontSize:14}}>
                    Get on the list
                  </button>
                </div>
                <p style={{
                  fontFamily:'var(--font-body-b)', fontSize:13, fontStyle:'italic',
                  color:'var(--ink-muted)', margin:'14px 0 0',
                }}>
                  When Annie's ready, you'll be one of the first to meet her. No newsletters. No noise.
                </p>
              </form>
            ) : (
              <div style={{
                marginTop:36, maxWidth:520,
                padding:'20px 22px',
                border:'1px solid var(--accent)',
                borderRadius:8,
                background:'rgba(216,166,92,0.08)',
              }}>
                <div style={{fontFamily:'var(--font-display-b)', fontSize:17, color:'var(--cream)'}}>
                  Thanks — you're on the list.
                </div>
                <div style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink-bright)', marginTop:6}}>
                  We'll be in touch when Annie's ready.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Workshop teaser: rotated, bleeding off the right edge ── */}
        <div style={{
          position:'absolute',
          top:'50%', right:-140,
          transform:'translateY(-50%) rotate(-4deg)',
          transformOrigin:'center center',
          width:720,
          zIndex:1,
          pointerEvents:'none',
          filter:'drop-shadow(0 40px 80px rgba(0,0,0,0.45))',
        }}>
          <WorkshopTeaser/>
        </div>

        {/* Footer — matches live holding page: one line, dim, below the fold */}
        <footer style={{
          position:'relative', zIndex:2,
          padding:'32px 56px 40px',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          flexWrap:'wrap', gap:16,
          fontFamily:'var(--font-body-b)', fontSize:12, color:'var(--ink-muted)',
          borderTop:'1px solid var(--border-subtle)',
          marginTop:60, maxWidth:1440, marginLeft:'auto', marginRight:'auto',
        }}>
          <span>
            Cold Anvil. <em style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', color:'var(--ink-bright)'}}>An idea is enough.</em>
          </span>
          <span style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', color:'var(--ink-bright)'}}>
            Built with AI, imagined by humans.
          </span>
          <span>© 2026 Cold Anvil Studios</span>
        </footer>
      </div>
    </div>
  );
}

// ── Mobile variant ──
// Upright teaser, stacked between form and footer — matches the live holding
// page's < 720px behavior.
function MkWaitlistMobile() {
  const [submitted, setSubmitted] = React.useState(false);
  const onSubmit = (e) => { e.preventDefault(); setSubmitted(true); };
  return (
    <div className="mk-root">
      <div className="mk-scroll" style={{background:'var(--ca-bg0s)', minHeight:'100%'}}>
        <div style={{padding:'28px 20px 8px'}}>
          <MkWordmark size={15}/>
        </div>
        <div style={{padding:'24px 20px 0'}}>
          <p style={{fontFamily:'var(--font-body-b)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--accent)', margin:0}}>A peek inside the workshop</p>
          <h1 style={{fontFamily:'var(--font-display-b)', fontSize:44, fontWeight:500, color:'var(--cream)', lineHeight:1.05, letterSpacing:'-0.02em', margin:'16px 0 0', textWrap:'balance'}}>
            Annie's workshop opens <em style={{color:'var(--accent)', fontStyle:'italic'}}>soon</em>.
          </h1>
          <p style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:17, color:'var(--ink-bright)', lineHeight:1.4, margin:'18px 0 0'}}>
            Product development, for anyone with an idea.
          </p>
          <p style={{fontFamily:'var(--font-body-b)', fontSize:15, color:'var(--ink)', lineHeight:1.6, margin:'16px 0 0'}}>
            Annie is our product engineer. She builds the thing you've been meaning to build — clickable by the end of the day. We're putting the finishing touches to her workshop.
          </p>
          {!submitted ? (
            <form onSubmit={onSubmit} style={{marginTop:22}}>
              <div style={{display:'flex', flexDirection:'column', gap:10, border:'1px solid var(--border-subtle)', borderRadius:8, overflow:'hidden', background:'rgba(12,11,10,0.45)'}}>
                <input type="email" required placeholder="you@example.com" style={{border:'none', outline:'none', padding:'14px 16px', background:'transparent', color:'var(--cream)', fontFamily:'var(--font-body-b)', fontSize:14}}/>
                <button type="submit" className="wk-btn wk-btn--primary" style={{borderRadius:0, padding:'12px 16px', fontSize:13}}>Get on the list</button>
              </div>
              <p style={{fontFamily:'var(--font-body-b)', fontSize:12, fontStyle:'italic', color:'var(--ink-muted)', margin:'12px 0 0'}}>
                When Annie's ready, you'll be one of the first to meet her. No newsletters. No noise.
              </p>
            </form>
          ) : (
            <div style={{marginTop:22, padding:'16px 18px', border:'1px solid var(--accent)', borderRadius:8, background:'rgba(216,166,92,0.08)'}}>
              <div style={{fontFamily:'var(--font-display-b)', fontSize:15, color:'var(--cream)'}}>Thanks — you're on the list.</div>
              <div style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink-bright)', marginTop:4}}>We'll be in touch when Annie's ready.</div>
            </div>
          )}
        </div>
        <div style={{padding:'32px 20px 24px'}}>
          <WorkshopTeaser/>
        </div>
        <footer style={{padding:'24px 20px 32px', borderTop:'1px solid var(--border-subtle)', fontFamily:'var(--font-body-b)', fontSize:11, color:'var(--ink-muted)', display:'flex', flexDirection:'column', gap:8}}>
          <span>Cold Anvil. <em style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', color:'var(--ink-bright)'}}>An idea is enough.</em></span>
          <span style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', color:'var(--ink-bright)'}}>Built with AI, imagined by humans.</span>
          <span>© 2026 Cold Anvil Studios</span>
        </footer>
      </div>
    </div>
  );
}

// ── Retired variants (kept only to prevent canvas crashes — the archive rows
// in index.html reference these; if you remove the archive rows, delete these).
function MkWaitlistA() {
  return (
    <div className="mk-root" style={{display:'grid', placeItems:'center', background:'var(--ca-bg0s)'}}>
      <div style={{fontFamily:'var(--font-body-b)', fontSize:13, color:'var(--ink-muted)', textAlign:'center', maxWidth:'40ch'}}>
        <div style={{fontFamily:'var(--font-display-b)', fontStyle:'italic', fontSize:22, color:'var(--cream)', marginBottom:12}}>Waitlist A — retired</div>
        The "letter" variant. Replaced by Waitlist C, which mirrors the deployed holding page.
      </div>
    </div>
  );
}
const MkWaitlistB = MkWaitlistA;

Object.assign(window, { MkWaitlistC, MkWaitlistMobile, MkWaitlistA, MkWaitlistB, WorkshopTeaser });
