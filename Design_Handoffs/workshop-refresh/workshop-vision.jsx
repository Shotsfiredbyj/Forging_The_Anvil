/* eslint-disable */
/* Vision tab — product brief document + stylized preview rail */

const AnvilGlyph = window.AnvilGlyph;
const Ico = window.Ico;
const ICONS = window.ICONS;

/* ── Commentable paragraph ──
   Every paragraph has a + gutter icon on hover. Clicking attaches
   that paragraph to the composer so the user can tell Annie what's wrong. */
function VPara({ children, dim }) {
  return (
    <div className="vA-vision-para" style={dim ? {opacity:0.55} : undefined}>
      <div className="gutter"><span className="comment-btn">+</span></div>
      <div className="text">{children}</div>
    </div>
  );
}

function VSection({ label, children }) {
  return (
    <div className="vA-vision-section">
      <div className="vA-vision-section-label">{label}</div>
      {children}
    </div>
  );
}

/* ── Vision preview rail (right pane when on Vision tab) ── */
function VA_VisionRail() {
  return (
    <div className="vA-rail">
      <div className="head"><span>Vision · summary</span><span className="live"><i></i>draft</span></div>
      <div className="vA-vision-rail-body">
        <div className="vA-vr-card">
          <div className="vA-vr-label">THE BET</div>
          <div className="vA-vr-text">Members pick a time, then see who's free — not the other way around.</div>
        </div>
        <div className="vA-vr-card">
          <div className="vA-vr-label">WHO IT'S FOR</div>
          <div className="vA-vr-text">150 active members across 6 teachers in Park Slope, Brooklyn.</div>
        </div>
        <div className="vA-vr-card accent">
          <div className="vA-vr-label">WHAT GOOD LOOKS LIKE</div>
          <div className="vA-vr-text">A member books in under 30 seconds. Teachers see their week at a glance. Admin swaps covers without calling anyone.</div>
        </div>
        <div className="vA-vr-card">
          <div className="vA-vr-label">NOT BUILDING</div>
          <div className="vA-vr-text">Payments, waitlists, or class creation. Those stay in the existing system.</div>
        </div>
        <div className="vA-vr-stamp">
          <span className="anvil"><AnvilGlyph size={11} color="#d8a65c"/></span>
          <span>DRAFT · v1 · 04.26</span>
        </div>
      </div>
    </div>
  );
}

/* ── Vision tab main content — the product brief ── */
window.VA_Vision = function VA_VisionScreen() {
  const TopBar = window.VA_TopBar;
  const Nav = window.VA_Nav;
  const Composer = window.VA_Composer;
  const Status = window.VA_Status;

  return (
    <div className="vA cv-screen">
      <TopBar crumb="Vision · Park Slope Yoga"/>
      <Nav active="vision"/>
      <div className="vA-main">
        <div className="vA-main-head">
          <h1 className="sans">Product <em>brief</em></h1>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span className="meta">draft · v1 · Annie is writing</span>
            <span className="vA-vision-help" title="Annie writes this brief based on your conversation. Review it, click any paragraph to comment, and tell her what she got wrong.">?</span>
          </div>
        </div>
        <div className="vA-vision-doc">
          <div className="vA-vision-banner">
            <div className="vA-vision-banner-label">ANNIE'S DRAFT — REVIEW AND PUSH BACK</div>
            <div className="vA-vision-banner-sub">Click the + next to any paragraph to tell me what I got wrong.</div>
          </div>

          <VSection label="The bet">
            <VPara>Park Slope Yoga needs a booking system where <em>members pick a time first, then see which of six teachers is available</em>. Today, members call or text the front desk — teachers don't know their own schedule until the morning of.</VPara>
            <VPara>The bet is that a time-first flow removes the coordination burden from staff and gives members the confidence to book on their own, anytime.</VPara>
          </VSection>

          <VSection label="Who it's for">
            <VPara><b>Members</b> — ~150 active, ranging from daily practitioners to once-a-weekers. Most are on mobile. They want to see a time, pick it, and be done.</VPara>
            <VPara><b>Teachers</b> (6) — they want to see their week at a glance, know who's coming, and swap covers without phone calls.</VPara>
            <VPara><b>Studio admin</b> (Maya) — manages the roster, handles cover swaps, and needs a weekly export for payroll.</VPara>
          </VSection>

          <VSection label="What good looks like">
            <VPara>A member opens the page, sees available times for this week, taps one, sees which teachers are free at that time, and reserves — <em>under 30 seconds, no account required for the first booking</em>.</VPara>
            <VPara>A teacher opens their view and sees Mon–Sun with slots filled. If they need a cover, they tap the slot and it goes to the available pool — no phone call, no group text.</VPara>
            <VPara>Maya gets a weekly CSV export every Monday at 7am — teacher name, hours, classes taught. She pastes it into her payroll spreadsheet.</VPara>
          </VSection>

          <VSection label="What we're building">
            <VPara><b>Booking page</b> — public URL at parkslopeyoga.com/book. Time-first grid, teacher cards, one-tap reserve. Responsive, works on phone.</VPara>
            <VPara><b>Teacher dashboard</b> — authenticated view. Weekly calendar, student list per slot, cover-swap flow.</VPara>
            <VPara><b>Admin roster</b> — Maya's view. All teachers' weeks side by side. Drag to reassign. Weekly export button + automated Monday email.</VPara>
            <VPara dim><b>Confirmation flow</b> — email confirmation to the member with calendar invite (.ics). No SMS for now.</VPara>
          </VSection>

          <VSection label="What we're NOT building">
            <VPara>Payments or pricing. The studio handles that separately — this system is scheduling only.</VPara>
            <VPara>Waitlists. If a slot is full, it's full. We can revisit after launch if members ask for it.</VPara>
            <VPara>Class creation or curriculum management. Teachers and class types are set up by Maya in the admin, not self-serve.</VPara>
          </VSection>

          <VSection label="Open questions for you">
            <VPara><em>Do members need accounts?</em> — The simplest version is: book with name + email, no password. We can add accounts later if repeat-booking history matters.</VPara>
            <VPara><em>How far ahead can members book?</em> — Rolling 2 weeks is my assumption. If you want longer, the teacher availability setup gets more complex.</VPara>
            <VPara><em>Should cancelled slots re-open automatically?</em> — I'd say yes, but you might want a 24-hour buffer so last-minute cancels don't churn the schedule.</VPara>
          </VSection>
        </div>
        <Composer placeholder="Click + next to any section, or type here to tell Annie what to change…"/>
      </div>
      <VA_VisionRail/>
      <Status/>
    </div>
  );
};
