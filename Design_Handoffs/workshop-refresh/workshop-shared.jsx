/* eslint-disable */
/* Shared helpers + sample content (icons, CONVO, PLAN_BODY) */

/* Workshop app — desktop screens for vibes A, B, C.
   Each export is a full-bleed product surface that fills its artboard. */

const AnvilGlyph = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h13l3 3h2"/>
    <path d="M16 9v3"/>
    <path d="M6 12v3a2 2 0 0 0 2 2h6"/>
    <path d="M8 19h6"/>
    <path d="M9 19v2"/>
    <path d="M13 19v2"/>
  </svg>
);
const Ico = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const ICONS = {
  spark: 'M12 3v3M12 18v3M5 12H2M22 12h-3M6.3 6.3 4.2 4.2M19.8 19.8l-2.1-2.1M6.3 17.7l-2.1 2.1M19.8 4.2l-2.1 2.1',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  bench: 'M3 7h18M3 12h18M3 17h18M7 7v10M17 7v10',
  plan: 'M5 4h11l3 3v13H5z M14 4v4h4',
  history: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5',
  gear: 'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  send: 'M5 12l14-7-5 14-3-7z',
  plus: 'M12 5v14M5 12h14',
  chat: 'M21 12a8 8 0 1 1-3.1-6.3L21 4l-1.3 4a8 8 0 0 1 1.3 4z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  voice: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5 11v1a7 7 0 0 0 14 0v-1 M12 19v3',
  doc: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M14 3v6h6 M9 13h6 M9 17h4',
  arch: 'M3 21h18 M5 21V8l7-5 7 5v13 M9 21v-6h6v6',
  back: 'M15 18l-6-6 6-6',
  collapse: 'M19 12H5 M12 5l-7 7 7 7',
  expand: 'M5 12h14 M12 5l7 7-7 7',
};

/* shared content for sample conversation */
const CONVO = [
  { who: 'me', body: <>I want a yoga teacher booking system for my studio in Brooklyn. Members should pick a time and a teacher.</> },
  { who: 'a', body: <>Got it. Two questions before I sketch a plan: <em>how many teachers</em>, and do members know which one they want, or do they pick by <em>time first, teacher second?</em></> },
  { who: 'me', body: <>Six teachers. Most members pick a time, then see who's free.</> },
];

const PLAN_BODY = (Em) => (
  <>I'll build a booking page where members <Em>pick a time slot first</Em>, then see the six teachers available — <s>filtered by class type</s> — with a one-tap reserve. Studio admins get a roster view to <Em>swap covers</Em> and a weekly export. Annie keeps the schedule synced to the existing calendar.</>
);

/* Mobile chrome — used by all three vibes */
function MobBar({ vibe }) {
  return (
    <div className="mob-bar">
      <span className="mark">Cold Anvil Studios</span>
      <span style={{display:'inline-flex',alignItems:'center',gap:4}}>
        <i style={{width:5,height:5,borderRadius:'50%',background:vibe==='B'?'#8c945c':'#d8a65c',display:'inline-block'}}></i>BENCH
      </span>
    </div>
  );
}

// Expose shared symbols across <script type="text/babel"> scopes.
Object.assign(window, { AnvilGlyph, Ico, ICONS, CONVO, PLAN_BODY, MobBar });
