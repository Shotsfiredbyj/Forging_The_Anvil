// Stubs — placeholders so the canvas loads. Real implementations ship in the same file
// as they're built. Each stub names its section clearly so review mid-build is meaningful.

function _MkStub(label, note) {
  return function Stub() {
    return (
      <div className="mk-root" style={{padding:48, display:'flex', flexDirection:'column', gap:20, alignItems:'flex-start', justifyContent:'flex-start'}}>
        <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)', letterSpacing:'0.14em', textTransform:'uppercase'}}>
          {label}
        </div>
        <div style={{fontFamily:'var(--font-display-b)', fontSize:32, fontWeight:500, color:'var(--cream)', letterSpacing:'-0.012em', maxWidth:'26ch', lineHeight:1.15}}>
          Building now.
        </div>
        <div style={{fontFamily:'var(--font-body-b)', fontSize:14, color:'var(--ink)', maxWidth:'52ch', lineHeight:1.6}}>
          {note}
        </div>
        <div style={{marginTop:16, display:'flex', gap:8, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-dim)'}}>
          <span style={{width:8, height:8, borderRadius:'50%', background:'var(--accent)', animation:'mkDot 1s ease-in-out infinite'}}/>
          placeholder
        </div>
      </div>
    );
  };
}

Object.assign(window, {
  MkHomeA:         _MkStub('Home · variant A · editorial + live composer', 'Full home page at 1440 desktop. Hero with the live composer signature, the workshop band (documentary photo placeholder), Meet Annie, the Gap, Trust, How it works, cream pocket manifesto, audience filmstrip, mustard manifesto, final CTA, footer.'),
  MkHomeB:         _MkStub('Home · variant B · workshop window + ambient demo', 'Same sections; different hero shape. Full-bleed workshop photograph above the fold, composer offered as a lower-profile "talk to Annie" block — scripted ambient demo instead of live. Threshold handoff (deliberate crossing beat).'),
  MkHomeAMobile:   _MkStub('Home A · 390px mobile', 'Mobile adaptation of variant A. Composer stays above the fold, full width; hero headline drops to 48px; trust row becomes three stacked lines; sticky talk bar gets dropped (signature replaces its job).'),
  MkHandoffOptions: _MkStub('Three handoff options, compared', 'Side-by-side comparison of the three crossing strategies from the pre-flight. Seamless (composer morphs into workshop), Threshold (deliberate beat with wordmark), Hard cut (clean redirect with matching geometry). Recommendation called out.'),
  MkHandoffFilmstrip: _MkStub('Filmstrip — the chosen crossing', 'Frame-by-frame of the recommended handoff. Tied to motion tokens (settle, emerge).'),
  MkAbout:         _MkStub('About · 1440 desktop', 'Current copy kept, re-rhythmed. Origin story, sister products (Fourth Age and Celyn), three beliefs, one cream pocket, final CTA. Adds a "ledger of what we\'ve built" strip using the workshop\'s ledger primitive.'),
  MkPricingA:      _MkStub('Pricing · variant A · plain outlined grid', 'Four tiers, outlined-only, "Build" gets the accent border. Monthly/annual toggle. Same-standard section. FAQ. Final CTA.'),
  MkPricingB:      _MkStub('Pricing · variant B · grid + signature pockets', 'Same grid. Adds a "what\'s the same at every tier" pocket at the top (mustard manifesto pattern) and a plan-stamp below the grid summarising the commitment — the workshop signature reused as a pricing header.'),
  MkWaitlist:      _MkStub('Waitlist · pre-launch home', 'Holding page pattern from the current site, re-fitted. Short hero, email form, the signature compressed: "what do you want Annie to build? Leave it here, she\'ll reply when she opens." Decorative teaser of the workshop at a slight angle, off the right edge.'),
  MkWaitlistMobile: _MkStub('Waitlist · 390px mobile', 'Mobile waitlist. Vertical. Teaser collapses to a contained preview frame between form and footer.'),
  MkHandoff:       _MkStub('Handoff moment', 'See the Handoff section.'),
  MkStates:        _MkStub('Waitlist success · error · 404 · handoff-loading', 'Four states, one per column. Waitlist success inline (no modal). Error inline under the form. 404 as editorial "this workbench is empty" rather than tech ASCII. Handoff-loading: the signature composer stays, Annie says "one moment — the workshop is opening".'),
  MkComponents:    _MkStub('Marketing-only components', 'Tier card, trust row, ledger row (new), sticky-mark (new), nav, footer, section-head, manifesto-block, cream-spread — annotated with workshop-origin where inherited.'),
  MkMotion:        _MkStub('Motion — four inherited + one new', 'arrive, settle, warm, point, emerge — as defined in workshop. Plus draw: editorial rule lines stroke in as they enter the viewport.'),
});
