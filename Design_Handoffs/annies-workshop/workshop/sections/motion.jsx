// sections/motion.jsx — five gestures, each with a live demo.
// Settle · Hold · Warm · Point · Undo.
// Click a demo to replay. Each cell shows name / role / timing / example.

function MotionLanguage() {
  const gestures = [
    {
      name: 'Settle',
      role: 'Commitment. A sentence or card accepting its new, accepted state.',
      timing: '280ms · cubic-bezier(0.2, 0.8, 0.2, 1) · ease-settle',
      where: 'plan card, vision-claim acceptance, publishing confirmation.',
      demo: SettleDemo,
    },
    {
      name: 'Hold',
      role: 'Annie is working. The surface stays calm — the only movement is a single pulse on the active task line.',
      timing: '1400ms loop · linear · breathing pulse at 0→1→0 opacity on 2px accent bar',
      where: 'Build line, active task item, mid-generation states.',
      demo: HoldDemo,
    },
    {
      name: 'Warm',
      role: 'Colour shift on hover / focus. Replaces most accent-on-press flickers — borders warm slowly from ink-dim to mustard.',
      timing: '180ms · cubic-bezier(0.2, 0.8, 0.2, 1)',
      where: 'Claim underlines, focusable inputs, buttons, challengeable claims.',
      demo: WarmDemo,
    },
    {
      name: 'Point',
      role: 'The user pointed at something. A thin mustard outline blooms at the selection.',
      timing: '220ms outline grow · 140ms inner glow · holds until the message sends',
      where: 'Click-to-edit selection in the preview, artefact claim challenge.',
      demo: PointDemo,
    },
    {
      name: 'Undo',
      role: 'A accepted plan is being retracted. The reverse of Settle — the cream drains, the border cools, the sentence lifts 1px. No celebration.',
      timing: '380ms · cubic-bezier(0.4, 0.1, 0.4, 1) · heavier out than Settle',
      where: 'Plan reversals, undo on a refinement, rollback on a failed task.',
      demo: UndoDemo,
    },
  ];
  return (
    <div className="wk-root wk-type-b" style={{padding:'38px 40px 28px', overflow:'auto', height:'100%', boxSizing:'border-box'}}>
      <SectionHead
        kicker="motion language"
        title="Five gestures. No more."
        sub="The whole product moves in one of these five ways. Nothing bounces. Nothing fades in from below. Nothing celebrates. Annie is calm, and so is her workshop."
        right={<span className="wk-chip">click a cell to replay</span>}
      />
      <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:16, alignItems:'stretch'}}>
        {gestures.map((g,i) => <MotionCell key={i} {...g}/>)}
      </div>
    </div>
  );
}

function MotionCell({name, role, timing, where, demo: Demo}) {
  const [key, setKey] = useState(0);
  return (
    <div className="wk-card" style={{padding:18, display:'flex', flexDirection:'column', gap:10, cursor:'pointer', background: 'transparent'}} onClick={()=>setKey(k=>k+1)}>
      <div className="wk-eyebrow">{String(1).padStart(2,'0')} · gesture</div>
      <div style={{fontFamily:'var(--font-display)', fontStyle:'italic', fontSize:24, color:'var(--accent)', letterSpacing:'-0.01em'}}>{name}</div>
      <div style={{fontSize:12, color:'var(--ink)', lineHeight:1.55, minHeight:66}}>{role}</div>
      <div style={{borderTop:'1px solid var(--border-subtle)', marginTop:4, paddingTop:12, minHeight:140, display:'grid', placeItems:'center'}}>
        <Demo key={key}/>
      </div>
      <div style={{fontSize:10, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', letterSpacing:'0.03em', lineHeight:1.5, marginTop:6}}>{timing}</div>
      <div style={{fontSize:11, color:'var(--ink-muted)', lineHeight:1.5, borderTop:'1px solid var(--border-subtle)', paddingTop:8}}>{where}</div>
    </div>
  );
}

// ────────────── Demos ──────────────
function SettleDemo() {
  const [accepted, setAccepted] = useState(false);
  useEffect(()=>{
    const t = setTimeout(()=>setAccepted(true), 400);
    return ()=>clearTimeout(t);
  },[]);
  return (
    <div style={{width:'100%', display:'grid', placeItems:'center'}}>
      <div style={{
        padding:'14px 14px', borderRadius:6,
        border: accepted ? '1px solid var(--accent)' : '1px dashed var(--ink-muted)',
        background: accepted ? 'var(--cream)' : 'transparent',
        color: accepted ? 'var(--ca-bg0s)' : 'var(--ink)',
        fontFamily:'var(--font-display)', fontSize:13, lineHeight:1.4,
        width: '100%', textAlign:'left', position:'relative',
        transform: accepted ? 'translateY(1px)' : 'translateY(0)',
        transition: 'all 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        Build a waitlist site.
        {accepted && <span style={{position:'absolute', bottom:-16, right:0, fontSize:8, color:'var(--ink-dim)', fontFamily:'var(--font-mono)', letterSpacing:'0.12em', textTransform:'uppercase'}}>accepted</span>}
      </div>
    </div>
  );
}
function HoldDemo() {
  return (
    <div style={{width:'100%', display:'flex', flexDirection:'column', gap:6, alignItems:'flex-start'}}>
      <div style={{fontSize:12, color:'var(--ink-bright)', fontFamily:'var(--font-body)'}}>Laying out your waitlist form</div>
      <div style={{width:'100%', height:2, background:'var(--border-subtle)', overflow:'hidden', borderRadius:1, position:'relative'}}>
        <div style={{
          position:'absolute', inset:0, background:'var(--accent)', width:'35%',
          animation:'mHold 1.4s ease-in-out infinite',
        }}/>
      </div>
      <style>{`@keyframes mHold { 0%,100% { opacity: 0.4; transform: translateX(0); } 50% { opacity: 1; transform: translateX(180%); } }`}</style>
      <div style={{fontSize:11, color:'var(--ink-dim)'}}>≈ 12 seconds</div>
    </div>
  );
}
function WarmDemo() {
  const [hot, setHot] = useState(false);
  useEffect(()=>{
    let v = false;
    const id = setInterval(()=>{ v = !v; setHot(v); }, 1200);
    return ()=>clearInterval(id);
  },[]);
  return (
    <div style={{width:'100%', display:'grid', placeItems:'center', gap:10}}>
      <div style={{padding:'10px 14px', borderRadius:6,
        border: hot ? '1px solid var(--accent)' : '1px solid var(--border)',
        color: hot ? 'var(--cream)' : 'var(--ink)',
        fontSize:12, fontFamily:'var(--font-body)',
        transition:'all 180ms cubic-bezier(0.2, 0.8, 0.2, 1)'}}>
        your email address
      </div>
      <div style={{fontSize:11, color:'var(--ink-dim)'}}>focus → warm</div>
    </div>
  );
}
function PointDemo() {
  const [selected, setSelected] = useState(false);
  useEffect(()=>{
    const t = setTimeout(()=>setSelected(true), 500);
    return ()=>clearTimeout(t);
  },[]);
  return (
    <div style={{width:'100%', display:'grid', placeItems:'center'}}>
      <div style={{
        padding:'14px 16px', background:'#fff', color:'#111',
        border: selected ? '1px solid var(--accent)' : '1px solid transparent',
        boxShadow: selected ? '0 0 0 4px color-mix(in oklab, var(--accent) 25%, transparent)' : 'none',
        borderRadius:4, fontFamily:'Fraunces, Georgia, serif', fontSize:16,
        transition:'all 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        Chip in together.
      </div>
      <div style={{fontSize:11, color:'var(--ink-dim)', marginTop:8}}>selected for the next message</div>
    </div>
  );
}
function UndoDemo() {
  const [accepted, setAccepted] = useState(true);
  useEffect(()=>{
    const t = setTimeout(()=>setAccepted(false), 600);
    return ()=>clearTimeout(t);
  },[]);
  return (
    <div style={{width:'100%', display:'grid', placeItems:'center'}}>
      <div style={{
        padding:'14px 14px', borderRadius:6,
        border: accepted ? '1px solid var(--accent)' : '1px dashed var(--ink-muted)',
        background: accepted ? 'var(--cream)' : 'transparent',
        color: accepted ? 'var(--ca-bg0s)' : 'var(--ink-muted)',
        fontFamily:'var(--font-display)', fontSize:13, lineHeight:1.4,
        width: '100%', textAlign:'left',
        transform: accepted ? 'translateY(0)' : 'translateY(-1px)',
        textDecorationLine: accepted ? 'none' : 'line-through',
        textDecorationColor: 'var(--ink-dim)',
        opacity: accepted ? 1 : 0.7,
        transition: 'all 380ms cubic-bezier(0.4, 0.1, 0.4, 1)',
      }}>
        Build a waitlist site.
      </div>
    </div>
  );
}

Object.assign(window, { MotionLanguage });
