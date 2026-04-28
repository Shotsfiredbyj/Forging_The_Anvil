/* eslint-disable */

// Pull shared symbols from window so this file can be loaded as its own
// <script type="text/babel"> after workshop-shared.jsx.
const AnvilGlyph = window.AnvilGlyph;
const Ico = window.Ico;
const ICONS = window.ICONS;
const CONVO = window.CONVO;
const PLAN_BODY = window.PLAN_BODY;

/* Vibe A — desktop screens */
/* ============================================================
   VIBE A — dark + serif
   ============================================================ */
function VA_TopBar({ crumb = 'Booking · Park Slope Yoga' }) {
  return (
    <div className="vA-bar">
      <div className="left">
        <span className="mark">Cold Anvil <em>Studios</em></span>
        <div className="crumbs"><span>Workshop</span><span className="sep">/</span><b>{crumb}</b></div>
      </div>
      <div className="right">
        <span className="pulse"><i></i>annie at the bench</span>
        <span className="logout">Log out</span>
      </div>
    </div>
  );
}
function VA_Nav({ active = 'workshop' }) {
  const item = (id, label, icon, badge, live) => (
    <div className={"item " + (active === id ? 'active' : '') + (live ? ' live' : '')}>
      <span className="ico"><Ico d={icon}/></span>
      <span>{label}</span>
      {badge && <span className="badge">{badge}</span>}
    </div>
  );
  return (
    <div className="vA-nav">
      <div className="proj-row">
        <span className="dot"></span>
        <span className="who">
          <em>project</em>
          <b>Park Slope Yoga</b>
        </span>
      </div>
      <div className="group">In this project</div>
      {item('workshop', 'Conversation', ICONS.chat, '· live', true)}
      {item('vision',   'Vision',       ICONS.eye)}
      {item('voice',    'Brand voice',  ICONS.voice)}
      {item('content',  'Content',      ICONS.doc)}
      {item('arch',     'Architecture', ICONS.arch)}
      {item('plan',     'Preview',      ICONS.bench)}
      {item('history',  'History',      ICONS.history, '142')}
      <div className="group">Studio</div>
      {item('projects', 'Projects',     ICONS.folder, '6')}
      {item('settings', 'Settings',     ICONS.gear)}
      <div className="profile">
        <span className="avatar">M</span>
        <span className="who">
          <b>Maya Ortiz</b>
          <em>Park Slope Yoga</em>
        </span>
        <span className="profile-gear"><Ico d={ICONS.gear} size={13}/></span>
      </div>
    </div>
  );
}
function VA_Status() {
  return (
    <div className="vA-status">
      <div className="left"><span>Cold Anvil. <b>An idea is enough.</b></span></div>
      <div className="center">Engineered by AI, imagined by humans.</div>
      <div className="right"><span>© 2026 Cold Anvil Studios</span></div>
    </div>
  );
}
function VA_PreviewRail() {
  return (
    <div className="vA-rail">
      <div className="head"><span>Live preview</span><span className="live"><i></i>building</span></div>
      <div className="pane">
        <div className="url"><span className="dots"><i></i><i></i><i></i></span><span>parkslopeyoga.com /book</span></div>
        <div className="body">
          <h4>Book a class</h4>
          <p>Pick a time. We'll show you who's teaching.</p>
          <div className="skel"></div>
          <div className="skel s2"></div>
          <div className="skel s3"></div>
          <span className="pill">See times</span>
          <div className="building"><span>building · slot picker</span><span>02:14</span></div>
        </div>
      </div>
      <div className="ticks">
        <div><span>routes</span><b>4</b></div>
        <div><span>tables</span><b>3</b></div>
        <div><span>tests</span><span className="ok">passing</span></div>
        <div><span>deploy</span><span className="ok">staged</span></div>
      </div>
    </div>
  );
}

function VA_Convo() {
  return (
    <div className="vA-stream">
      <div className="vA-msg"><span className="who">M</span>
        <span className="body">{CONVO[0].body}</span><span className="when">7m</span></div>
      <div className="vA-msg a"><span className="who">a</span>
        <span className="body">{CONVO[1].body}</span><span className="when">7m</span></div>
      <div className="vA-msg"><span className="who">M</span>
        <span className="body">{CONVO[2].body}</span><span className="when">5m</span></div>
      <div className="vA-msg a"><span className="who">a</span>
        <span className="body">Holding what I have. Sketching a plan now.</span><span className="when">4m</span></div>
      <div className="vA-msg a thinking"><span className="who">a</span>
        <span className="body">working on the slot picker<span className="dots"><i></i><i></i><i></i></span></span><span className="when">now</span></div>
    </div>
  );
}

function VA_Composer({ placeholder, value }) {
  return (
    <div className="vA-composer">
      <div className="row1"><span className="live"><i></i>BENCH OPEN</span><span className="line"></span><span>⌘K</span></div>
      <div className={"input " + (placeholder ? 'placeholder' : '')}>{placeholder || value}</div>
      <div className="row2"><span>NEWSREADER · 16</span><span className="send">Send <span style={{transform:'translateY(-1px)'}}><Ico d={ICONS.send} size={11}/></span></span></div>
    </div>
  );
}

function VA_PlanCard() {
  return (
    <div className="vA-plan">
      <div className="stamp-row"><span>PLAN · STAMPED 04.26.26 · 14:32</span><span className="actions"><span>edit</span><span>refuse</span></span></div>
      <div className="body">{PLAN_BODY(({children}) => <em>{children}</em>)}</div>
      <div className="seal">CA · v3</div>
    </div>
  );
}

window.VA_MidConvo = function VA_MidConvo() {
  return (
    <div className="vA cv-screen">
      <VA_TopBar/>
      <VA_Nav active="workshop"/>
      <div className="vA-main">
        <div className="vA-main-head">
          <h1 className="sans">The booking <em>system</em></h1>
          <span className="meta">07 turns · plan v3</span>
        </div>
        <VA_Convo/>
        <VA_Composer placeholder="Tell Annie what to change…"/>
      </div>
      <VA_PreviewRail/>
      <VA_Status/>
    </div>
  );
};

window.VA_Plan = function VA_PlanScreen() {
  return (
    <div className="vA cv-screen">
      <VA_TopBar crumb="Plan v3 · Park Slope Yoga"/>
      <VA_Nav active="plan"/>
      <div className="vA-main">
        <div className="vA-main-head">
          <h1>Plan, <em>stamped</em></h1>
          <span className="meta">v3 · 03 revisions</span>
        </div>
        <div className="vA-stream">
          <div className="vA-msg a"><span className="who">a</span>
            <span className="body">Here's what I heard. <em>Refuse anything I got wrong</em> — I'd rather rework than build a thing you didn't ask for.</span><span className="when">2m</span></div>
          <VA_PlanCard/>
          <div style={{display:'flex',gap:8,marginLeft:38,marginTop:14}}>
            <span style={{background:'#d8a65c',color:'#32302f',padding:'7px 14px',borderRadius:5,fontSize:12,fontFamily:'var(--font-sans)',fontWeight:500}}>Accept the plan · build now</span>
            <span style={{border:'1px solid #3c3836',color:'#d4be9a',padding:'7px 14px',borderRadius:5,fontSize:12,fontFamily:'var(--font-sans)'}}>Refuse — keep talking</span>
          </div>
        </div>
        <VA_Composer placeholder="Annie, the slot picker should also show price by class…"/>
      </div>
      <VA_PreviewRail/>
      <VA_Status/>
    </div>
  );
};

window.VA_Preview = function VA_PreviewScreen() {
  return (
    <div className="vA cv-screen">
      <VA_TopBar crumb="Live preview · build 14"/>
      <VA_Nav active="workshop"/>
      <div className="vA-main">
        <div className="vA-main-head">
          <h1>Building, <em>quietly</em></h1>
          <span className="meta">build #14 · 02:14</span>
        </div>
        <div className="vA-stream">
          <div className="vA-msg a thinking"><span className="who">a</span>
            <span className="body">wiring the time-slot picker to the teacher list<span className="dots"><i></i><i></i><i></i></span></span><span className="when">now</span></div>
          <div style={{margin:'8px 0 0 38px',padding:'14px 16px',background:'#1c1a18',border:'1px solid #3c3836',borderRadius:6}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.16em',textTransform:'uppercase',color:'#6a625c',marginBottom:10}}>WORK LEDGER · 04:23 elapsed</div>
            {[
              ['scaffolded /book route','done'],
              ['drafted Slot model · 7 fields','done'],
              ['wrote teacher_availability join','done'],
              ['picker UI · time-first layout','active'],
              ['admin roster · cover swaps','queued'],
            ].map(([t,s],i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderTop:i?'1px solid #3c3836':'none',fontSize:13,color:'#d4be9a'}}>
                <span style={{fontFamily:'var(--font-serif)'}}>{t}</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',color:s==='done'?'#8c945c':s==='active'?'#d8a65c':'#6a625c'}}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <VA_Composer placeholder="Watching her work…"/>
      </div>
      <VA_PreviewRail/>
      <VA_Status/>
    </div>
  );
};

window.VA_Empty = function VA_EmptyScreen() {
  return (
    <div className="vA empty cv-screen">
      <VA_TopBar crumb="New project"/>
      <VA_Nav active="workshop"/>
      <div className="vA-main">
        <div className="vA-empty">
          <div className="hallmark">— THE WORKSHOP IS OPEN —</div>
          <h1>Tell Annie <em>your idea</em></h1>
          <p>Speak the way you'd speak to a friend who builds things. She'll hold what she heard, sketch a plan, and refuse the parts that don't fit.</p>
          <div className="composer-big">
            <div className="label"><span className="dot"></span>BENCH · WARM · LISTENING</div>
            <div className="input">A booking system for my yoga studio in Brooklyn — six teachers, members pick a time first…</div>
            <div className="row"><span>Newsreader · auto-grow · ⌘↵ to send</span><span className="send">Open the bench <Ico d={ICONS.send} size={11}/></span></div>
          </div>
          <div className="seeds"><span>booking system</span><span>internal tool</span><span>landing page</span><span>directory</span><span>community board</span></div>
        </div>
      </div>
      <VA_Status/>
    </div>
  );
};

window.VA_Dash = function VA_Dashboard() {
  const cards = [
    { name: 'Park Slope Yoga · booking', stage:'live', tag:'BENCH OPEN · v3', desc:'Members pick a time slot, then see six teachers. Annie is wiring the admin roster.', ledger:[['v3','PLAN'],['build 14','LIVE'],['07 turns','TODAY']] },
    { name: 'Bouquet · order desk', stage:'plan', tag:'PLAN STAMPED', desc:'Florist intake form that drops orders into a printable run sheet at 6am every day.', ledger:[['v1','PLAN'],['build 02','STAGED'],['—','HEARD 2D']]},
    { name: 'Margate library · events', stage:'cooling', tag:'COOLING', desc:'Public events calendar with RSVP. Plan refused twice — Annie waiting for clarity on volunteer roles.', ledger:[['v2','REFUSED'],['—','—'],['—','HEARD 5D']]},
    { name: 'Tilt · stand-up notes', stage:'live', tag:'LIVE · DEPLOYED', desc:'Slack-to-shared-doc nightly digest. Quiet for two weeks; running clean.', ledger:[['v1','PLAN'],['build 21','LIVE'],['—','QUIET']]},
  ];
  return (
    <div className="vA dash cv-screen">
      <VA_TopBar crumb="All projects"/>
      <VA_Nav active="projects"/>
      <div className="vA-main">
        <div className="vA-dash-head">
          <h1>Things I'm <em>building</em></h1>
          <span className="new"><Ico d={ICONS.plus} size={11}/>New project</span>
        </div>
        <div className="vA-dash-grid">
          {cards.map((c,i)=>(
            <div key={i} className="vA-card">
              <div className="row1">
                <span className={"stage " + (c.stage === 'live' ? 'live' : 'dim')}>{c.stage === 'live' && <i></i>}{c.tag}</span>
                <span>···</span>
              </div>
              <h3>{c.name.split('·')[0]}<em>·{c.name.split('·')[1]}</em></h3>
              <p>{c.desc}</p>
              <div className="ledger">
                {c.ledger.map(([v,k],j)=>(<span key={j}>{k} <b>{v}</b></span>))}
              </div>
            </div>
          ))}
          <div className="vA-card ghost">+ start a new project</div>
        </div>
      </div>
      <VA_Status/>
    </div>
  );
};

window.VA_Settings = function VA_SettingsScreen() {
  return (
    <div className="vA settings cv-screen">
      <VA_TopBar crumb="Settings · billing"/>
      <VA_Nav active="settings"/>
      <div className="vA-main">
        <div className="vA-set-head">
          <h1>Your <em>tier</em></h1>
          <p>Cold Anvil bills the way Annie talks: clearly, and only for what got built. No hidden seats, no quiet upgrades.</p>
        </div>
        <div className="vA-set-grid">
          <div className="vA-set-card">
            <div className="label">CURRENT TIER</div>
            <h3>The <em>Bench</em></h3>
            <div className="lead">Two live projects, plans stamped same day, one studio admin. The most popular tier for studios under 30 staff.</div>
            <div className="vA-set-tier"><span className="price">$240<span>/ mo</span></span><span className="change">change tier →</span></div>
          </div>
          <div className="vA-set-card">
            <div className="label">USAGE · APRIL</div>
            <div className="vA-set-row"><span>Live projects</span><span className="v">2 of 2</span></div>
            <div className="vA-set-row"><span>Plans stamped</span><span className="v">11</span></div>
            <div className="vA-set-row"><span>Plans refused</span><span className="v">3</span></div>
            <div className="vA-set-row"><span>Bench hours</span><span className="v ok">unlimited</span></div>
          </div>
          <div className="vA-set-card full">
            <div className="label">STUDIO</div>
            <div className="vA-set-row"><span>Studio name</span><span className="v">Park Slope Yoga</span></div>
            <div className="vA-set-row"><span>Owner</span><span className="v">m@parkslopeyoga.com</span></div>
            <div className="vA-set-row"><span>Annie's voice</span><span className="v">Newsreader · italic accents</span></div>
            <div className="vA-set-row"><span>Time zone</span><span className="v">America / New York</span></div>
            <div className="vA-set-row"><span>Receipts</span><span className="v ok">on, monthly</span></div>
          </div>
        </div>
      </div>
      <VA_Status/>
    </div>
  );
};

// Expose shared sub-components for use in other script files
Object.assign(window, { VA_TopBar, VA_Nav, VA_Composer, VA_Status, VA_PreviewRail });
