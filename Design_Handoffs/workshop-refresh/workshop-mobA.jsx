/* eslint-disable */

// Pull shared symbols from window so this file can be loaded as its own
// <script type="text/babel"> after workshop-shared.jsx.
const AnvilGlyph = window.AnvilGlyph;
const Ico = window.Ico;
const ICONS = window.ICONS;
const CONVO = window.CONVO;
const PLAN_BODY = window.PLAN_BODY;

/* MobBar + Vibe A mobile screens */
/* ============================================================
   MOBILE
   ============================================================ */
const MobBar = window.MobBar;

window.Mob_A_Convo = function() {
  return (
    <div className="mob mob-A">
      <MobBar vibe="A"/>
      <div className="mob-body">
        <div className="mob-msg"><div className="who-row"><span>YOU</span><span>· 7m</span></div><p>Booking system for my yoga studio. Six teachers, members pick a time first.</p></div>
        <div className="mob-msg a"><div className="who-row a"><span className="name">annie</span><span>· 7m</span></div><p>Got it. Holding what I have. Sketching a plan now — <em>refuse anything I get wrong</em>.</p></div>
        <div className="mob-plan">
          <div className="lbl">PLAN · STAMPED 04.26</div>
          <div className="body">Members <em>pick a time slot</em>, then see six teachers — one-tap reserve. Admin roster for <em>cover swaps</em>.</div>
        </div>
        <div className="mob-comp">
          <div className="lbl">BENCH · WARM</div>
          <div className="input">Tell Annie what to change…</div>
          <div className="row"><span>⌘↵</span><span className="send">Send</span></div>
        </div>
      </div>
    </div>
  );
};
window.Mob_A_Empty = function() {
  return (
    <div className="mob mob-A">
      <MobBar vibe="A"/>
      <div className="mob-body" style={{justifyContent:'space-between'}}>
        <div style={{display:'flex',flexDirection:'column',gap:14,marginTop:24}}>
          <div style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'#d8a65c'}}>— THE WORKSHOP IS OPEN —</div>
          <h1>Tell Annie <em>your idea</em></h1>
          <p className="lead">Speak the way you'd speak to a friend. She'll hold what she heard, sketch a plan, refuse the parts that don't fit.</p>
        </div>
        <div className="mob-comp">
          <div className="lbl">BENCH · LISTENING</div>
          <div className="input">A booking system for my yoga studio…</div>
          <div className="row"><span>Newsreader · ⌘↵</span><span className="send">Open</span></div>
        </div>
      </div>
    </div>
  );
};
window.Mob_A_Dash = function() {
  const items = [['Park Slope Yoga · booking','LIVE · v3','live'],['Bouquet · order desk','PLAN STAMPED','plan'],['Margate library · events','COOLING','cool'],['Tilt · stand-up notes','LIVE · DEPLOYED','live']];
  return (
    <div className="mob mob-A">
      <MobBar vibe="A"/>
      <div className="mob-body">
        <h1 style={{fontSize:24,marginBottom:4}}>Things I'm <em>building</em></h1>
        <div className="mob-list">
          {items.map(([n,t,s],i)=>(
            <div key={i} className="mob-list-item">
              <div className="row1"><span className="stage">{s==='live' && <i style={{width:5,height:5,borderRadius:'50%',background:'#8c945c'}}></i>}{t}</span><span>›</span></div>
              <h3>{n.split('·')[0]}<em>·{n.split('·')[1]}</em></h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
