# Umut Usta Cognitive-Load-Focused UX/UI Research Report

**Project:** `the-welding-expert-app`

**Date:** July 19, 2026

**Version:** 3.0 - premium experience and redesign audit

**Scope:** Customer entry page, appointment request flow, customer self-service, and direct contact paths

**Out of scope:** Redesigning the admin dashboard

**Companion study:** [Umut Usta Premium Design Language Benchmark Report](./Umut_Usta_Premium_Tasarim_Dili_Benchmark_Raporu_2026-07-19.md)

## 1. Executive Summary

The customer experience was already functional, secure, and content-rich, but the original baseline attempted to serve too many goals at once. Appointment booking, WhatsApp, phone, location, work samples, company information, eight services, process guidance, gallery content, and FAQs competed at similar visual weights. The customer's primary job - describing a need and leaving a suitable time preference - became visible too late.

The main baseline sources of cognitive load were:

1. Three equally prominent hero buttons plus additional utility links.
2. A mobile sticky bar with three persistent actions that could cover content.
3. Eight services shown simultaneously in the appointment tool.
4. A service preselected before the customer made a decision.
5. Marketing content placed before the primary task.
6. Repeated explanations that a request was not yet a confirmed appointment.
7. Quick dates, a date input, week controls, seven day cards, and time slots visible at the same time.

The recommended direction was not indiscriminate visual replacement. The brand, trust content, and technical platform were retained while the information and choice architecture were reorganized around task priority.

The implemented direction is a three-step flow:

- **Service:** begin with four understandable need groups, then reveal only relevant services.
- **Date and time:** use one weekly calendar model and reveal time slots after a day is chosen.
- **Contact:** request only name and phone first; keep optional details behind disclosure.

The structural cognitive load is now substantially lower. The remaining premium-design challenge was repetition: correct information and actions appeared on multiple surfaces, while the visual identity did not consistently communicate the promised level of craftsmanship. The PUX program therefore focused on removing duplication, consolidating brand signals, improving proof of workmanship, and reducing the number of competing accents within each viewport.

## 2. Current Product State

| Area | Original baseline | Implemented direction | Validation need |
| --- | --- | --- | --- |
| Hero actions | Three equivalent buttons | One primary request action and one lower-weight photo consultation path | Five-second comprehension test |
| Mobile sticky actions | Three persistent actions | Context-aware visibility; hidden while the wizard is active | Real-device occlusion test |
| Service selection | Eight services at once | Four groups followed by one to three relevant services | Selection correction rate |
| Default service | First service selected automatically | No default selection | Wrong-service rate |
| Time selection | Several date mechanisms together | Weekly calendar as the single selection model | Task time and backtracking |
| Contact form | Optional fields always visible | Name and phone first; extra details disclosed on demand | Abandonment and error rate |
| Page order | Marketing content before the task | Hero, concise trust, then the appointment task | Scroll and wizard-start behavior |
| Progress | Passive step indicator | Clickable completed steps with preserved state | Navigation and focus testing |
| Self-service | Team-dependent changes | Private tracking link for cancellation/change requests | Comprehension and duplicate-request handling |

Reduced page height or fewer controls are indicators of lower interface density, not proof of better outcomes. Conversion, task success, perceived effort, and accessibility must still be measured.

## 3. Research Method

The report combines five evidence layers:

1. Code inspection and visual regression review of the React customer journey.
2. Earlier product, copy, Plerdy, and Sprint 0-6 evaluations.
3. Plerdy checklists for local services, usability, conversion, content, and Core Web Vitals.
4. Cognitive psychology and HCI research on working memory, Hick-Hyman, progressive disclosure, processing fluency, and choice overload.
5. WCAG 2.2 and task-oriented data-visualization principles.

### Evidence hierarchy

Predictive heatmaps, attention estimates, scan patterns, and checklist scores are useful for forming hypotheses. They are not observed customer behavior. Decisions should follow this order:

1. Accessibility and task-blocking defects
2. Observed customer behavior and moderated task tests
3. Production analytics and funnel evidence
4. Code, layout, and content audits
5. Predictive tools and expert heuristics

No single heuristic should override direct evidence from the target audience.

## 4. Users and Jobs to Be Done

Personas are research hypotheses and must be validated against real customer data.

### Canan, 32 - fast mobile customer

- **Situation:** Has a visible repair problem and wants to act quickly from a phone.
- **Job:** Understand whether the business handles the issue and leave a request without a call.
- **Risk:** Long scrolling, channel indecision, or being asked to classify technical work.
- **Product response:** A visible request path, plain-language service groups, short steps, and preserved input.

### Mehmet, 58 - trust- and phone-oriented customer

- **Situation:** Wants evidence that the provider is real, local, and reachable.
- **Job:** Confirm service area, working hours, and a phone path before committing.
- **Risk:** Small text, icon-only controls, technical terminology, or hidden contact information.
- **Product response:** Real work imagery, clear location and hours, readable labels, and a reachable phone path.

### Selin, 44 - scope and quotation decision-maker

- **Situation:** Coordinates several jobs for a residence, apartment building, or workplace.
- **Job:** Request an on-site assessment, explain scope, and keep a record for follow-up.
- **Risk:** Being forced into one narrow service, losing notes, or mistaking an estimate for a final price.
- **Product response:** Discovery path, optional notes, request summary, tracking, and explicit confirmation expectations.

## 5. Customer Decision Hierarchy

The interface should answer these questions in order:

1. Does this business handle my type of problem?
2. Does it serve my location?
3. Does it look trustworthy and reachable?
4. Can I understand how price and scope are determined?
5. Is there a suitable time?
6. What happens after I submit?

Requesting personal information or a technical service label before these questions are answered increases extraneous load.

## 6. Scientific Design Basis

### 6.1 Working memory

Working-memory research supports reducing simultaneous, unrelated signals. It does not establish a universal four-item UI rule. For this product, the practical implication is to group related options, present one decision at a time, and keep prior choices visible where recognition is useful.

### 6.2 Hick-Hyman law

Decision time generally increases with the information carried by the available alternatives. The response is not simply to remove options; it is to improve grouping, labels, defaults, and comparison quality. Four need groups followed by relevant services are easier to interpret than eight technical services in one flat list.

### 6.3 Choice overload

Choice overload is contextual rather than universal. Fewer choices can still fail when categories are ambiguous. The product should reduce irrelevant comparison while retaining an explicit "I am not sure" path.

### 6.4 Progressive disclosure

Secondary information should appear when it becomes relevant. Optional notes, detailed service scope, and additional contact information can remain behind disclosure. Critical constraints, validation errors, and confirmation expectations must not be hidden.

### 6.5 Processing fluency

Clear figure-ground separation, consistent alignment, restrained color roles, and familiar controls can improve perceived coherence. Premium quality should therefore come from intentional hierarchy and craft evidence, not added visual complexity.

### 6.6 Cognitive accessibility

Accessibility supports comprehension as well as physical interaction. Semantic HTML, stable focus, text labels, non-color status cues, large enough targets, reflow, and reduced-motion behavior are part of the cognitive-load strategy.

## 7. Operational Definition of Cognitive Load

There is no universal maximum number of buttons or accepted cognitive-load score for every website. Low load for Umut Usta requires three evidence layers:

1. **Structural load:** the number of decisions, actions, and messages interpreted together.
2. **Behavioral load:** task time, errors, backtracking, abandonment, and help requests.
3. **Perceived load:** reported mental demand, effort, confidence, and ease after the task.

A visually sparse screen that prevents customers from finding the correct service has hidden complexity rather than reduced it.

### Load types

| Load type | Product example | Design response |
| --- | --- | --- |
| Intrinsic | The customer may not know which service owns the problem | Problem language, examples, and an uncertainty path |
| Extraneous | Comparing eight services, three channels, and repeated warnings | Grouping, one active decision, progressive disclosure |
| Germane | Distinguishing painting from structural repair | Concise descriptions and scope factors |

## 8. Product Cognitive-Load Budget

These are local product standards to validate through testing, not universal scientific thresholds.

| Dimension | Product budget | Failure signal |
| --- | ---: | --- |
| Dominant task per view | 1 | Two filled primary buttons with equal weight |
| Contact paths per view | Maximum 2 | Appointment, phone, and WhatsApp compete equally |
| Simultaneous comparable choices | Target 2-4; maximum 5 | Eight services in one list |
| Main wizard steps | 3 | Unnecessary confirmation stages |
| Main decision per step | 1 | Date, channel, and contact requested together |
| Required contact fields | 2 | Email or address required initially |
| Main message per alert | 1 | Three unrelated warnings in one container |
| Primary touch target | Preferably at least 44x44 CSS px | Mistaps or targets below 24 px |
| Normal text contrast | At least 4.5:1 | Low-contrast gray body copy |
| UI and focus contrast | At least 3:1 | Indistinct focus indicator |
| Motion | 140-240 ms; large transition at most 320 ms | Decorative motion delays the task |
| First meaningful selection | P75 below 20 seconds | Category hesitation |
| Request completion | Median below 2 minutes | Long pauses or abandonment |
| Wrong-service selection | Hypothesis at or below 10% | Correction after reading details |
| Critical task success | At least 90% | Cannot complete without help |
| Single Ease Question | Median at least 5.5/7 | Median below 5 |
| NASA-TLX mental demand | Median at or below 35/100; P75 at or below 50 | High-demand clustering |

The NASA-TLX target is not clinical or universal. The redesign must lower mental demand relative to its baseline while preserving task success.

## 9. Screen-Level Attention Budget

| Surface | Customer's question | Initially visible | Deferred |
| --- | --- | --- | --- |
| Hero | Can this business do my job, and how do I start? | Service proposition, Ankara, one primary path, one alternative, concise proof | Long story and full catalog |
| Service group | Which group is closest to my need? | Four need groups | Technical scope and price factors |
| Service selection | Which service is the closest fit? | One to three relevant services and one continue action | Other groups and gallery |
| Time | When am I available? | Weekly dates and selected day's times | Additional detail until needed |
| Contact | How will the team reach me? | Name, phone, privacy cue, submit | Email and notes |
| Success | What happens now? | Saved state, response expectation, tracking | Marketing content and competing CTAs |

The first viewport target is one brand signal, one task statement, one primary CTA, one alternative channel, and no more than three concise trust signals.

## 10. Target Information Architecture

Recommended customer-page order:

`compact navigation -> hero -> concise trust strip -> appointment wizard -> selected work evidence -> service overview -> three-step process -> location/contact -> FAQ -> minimal footer`

Rules:

- The appointment task appears before extended marketing content.
- Work examples serve as evidence, not decoration.
- The service overview informs; it does not duplicate wizard selection or unexpectedly scroll the page.
- Contact and location remain findable without competing with the primary conversion action.
- Footer content does not reproduce the complete page navigation.

## 11. Target Choice Architecture

### Service step

First-level groups:

1. Paint and small repairs
2. Welding and metalwork
3. Gates and automation
4. Garden and outdoor work

The uncertainty path sits outside the main grid and remains visually available. After a group is selected, only its relevant services appear. Each option uses a short title and one example line. No option is selected by default.

### Date and time step

- One weekly calendar is the source of date selection.
- Week navigation belongs next to the day row.
- "Today" and "Tomorrow" shortcuts are omitted because they duplicate the calendar model.
- Day tiles show date and minimal availability status without slot-count copy.
- Time slots appear in a balanced grid below the selected date.
- The service-change action is visually recognizable but secondary.
- A single concise message explains that the selected time is a preference pending team confirmation.

### Contact step

- Name and phone are the only required fields.
- Labels remain visible above inputs; placeholders do not replace labels.
- Email and notes stay under an optional-details disclosure.
- Input values persist across step navigation, validation, and recoverable server errors.
- The request summary follows the form on smaller layouts and does not compete with data entry.
- Submission loading must not resize the button or remove focus unexpectedly.

## 12. Button and Action Budget

| Level | Style | Count per view | Example |
| --- | --- | ---: | --- |
| Primary | Filled forged copper | 1 | Submit request |
| Secondary | Border or low-emphasis surface | 1 | Consult with a photo |
| Tertiary | Text and optional icon | Contextual | Change service, go back |
| Destructive | Red and context-specific | 1 | Send cancellation request |

Use radio behavior for one-of-many selection, checkbox or toggle for binary preferences, segmented controls for modes, and icon buttons for familiar navigation commands. Disabled controls must have an understandable nearby reason.

## 13. Visual System

### Direction

The chosen direction is **Quiet Craft**: premium quality communicated through precision, material honesty, consistency, concise copy, and restrained motion.

Premium does not mean more gradients, glow, dark surfaces, oversized logos, card nesting, or decorative animation. It means that the product feels deliberate, trustworthy, and easy to resolve.

### Core light-theme tokens

| Role | Token/value | Use |
| --- | --- | --- |
| Primary ink | `ink-950` / `#181A18` | Headings, logo, critical content |
| Graphite | `graphite-800` / `#292B29` | Secondary dark surfaces |
| Body text | `steel-650` / `#555953` | Body and metadata |
| Muted text | `steel-550` / `#676B65` | Contrast-tested supporting copy |
| Page surface | `bone-50` / `#F7F6F2` | Main background |
| Active surface | `paper-0` / `#FFFFFF` | Forms and controls |
| Border | `line-200` / `#DDDCD5` | Dividers and boundaries |
| Primary action | `copper-700` / `#8F4021` | Single primary CTA and selection |
| Primary hover | `copper-800` / `#713019` | Hover and pressed states |
| Copper detail | `copper-500` / `#C56A37` | Decorative detail, not small white text |
| Selected wash | `copper-50` / `#FBF0E9` | Selected background |
| Success | `success-700` / `#11633F` | Success status |
| WhatsApp | `whatsapp-700` / `#128044` | Channel identity only |
| Warning | `warning-800` / `#7A470C` | Warning text |
| Danger | `danger-700` / `#A92A20` | Error and destructive action |

Target distribution: 78-84% bone/paper and imagery, 12-17% ink/graphite/steel, 3-5% copper, and 1-2% semantic colors. Status must never rely on color alone.

### Typography

Plus Jakarta Sans remains appropriate. Premium character should come from hierarchy, spacing, and imagery rather than a second decorative font.

| Role | Desktop/mobile size | Line height | Weight |
| --- | --- | --- | --- |
| Hero H1 | 38-44 / 30-34 px | 1.08-1.15 | 700 |
| Section H2 | 24-30 px | 1.2 | 650-700 |
| Panel title | 20-22 px | 1.25 | 700 |
| Card title | 16-18 px | 1.3 | 700 |
| Body | 16 px | 1.55-1.65 | 400-500 |
| Supporting | 14 px | 1.45-1.6 | 400-600 |
| Label | 13-14 px | 1.3-1.4 | 600-700 |

Font size does not scale continuously with viewport width. Letter spacing remains `0`; negative tracking and long uppercase labels are avoided.

### Surfaces and geometry

- Main content aligns to a 1120-1200 px container; long reading content stays near 680-760 px.
- The wizard aligns with the main content grid; single-column form content can narrow to approximately 840 px.
- Mobile uses one 16 px horizontal task gutter without stacked page and component padding.
- Section spacing ranges from 48-80 px; form spacing from 12-24 px.
- The main radius family is 6-8 px, with up to 12 px for genuinely large surfaces.
- Cards are reserved for repeated items and framed tools; page sections remain unframed.
- Borders and tonal change are preferred to exaggerated shadows or vertical hover movement.

## 14. Logo and Image Direction

The logo system uses a **Forged Iron U** with a restrained weld-seam micro-detail.

Required variants:

| Variant | Use | Rule |
| --- | --- | --- |
| Forged U master | Brand documentation and large imagery | Transparent 1024/2048 PNG or WebP |
| Forged U vector | Navigation, forms, footer | True paths; no blur, raster embed, or external font |
| Horizontal wordmark | Desktop navigation and documents | Export-safe text or HTML wordmark |
| Favicon micro | 16-48 px | Monochrome U with at most one copper seam |
| Monochrome | Print and constrained surfaces | Solid black or white, no gradient |

Acceptance tests include legibility from 16 to 64 px, intact negative space, no noisy weld beads, valid Turkish wordmark encoding, clear-space consistency, and only one brand mark in the first viewport.

Photography should show the real problem, process, or result. Before/after pairs should preserve camera angle and scale where possible. Dark, blurred, stock-like, or purely atmospheric images cannot serve as primary proof of service quality.

## 15. Content and Microcopy

| Content | Standard |
| --- | --- |
| Hero | One clear promise and at most two short supporting sentences |
| CTA | Verb plus result |
| Choice description | Target no more than two mobile lines |
| Help text | Present only when it prevents an error |
| Warning | What happened and what the customer should do |
| Success | What was saved and what happens next |
| Price | Starting point and influencing factors; no false certainty |

Confirmation language appears once in the time-selection context and once as a next-step explanation after success. Interface narration such as "use the cards below" should be removed.

## 16. System States and Motion

| State | Visual response | Customer action |
| --- | --- | --- |
| Initial load | Stable-size skeleton | Wait |
| Availability refresh | Selection area remains in place | Wait or retry |
| No data | Cause and alternative | Choose another date or contact |
| Network failure | Alert with short explanation | Retry |
| Slot conflict | Warning in the relevant step | Select an alternative |
| Success | One outcome and response expectation | Track request |

Motion rules:

- Hover/focus: 140 ms
- Selection/disclosure: 180-220 ms
- Step transition: 200-240 ms
- Large transition: maximum 320 ms
- One dominant motion focus at a time
- No autoplay, parallax, continuous pulse, or decorative loading
- Preserve all information under `prefers-reduced-motion`
- Never delay clicking or data entry for animation

## 17. End-to-End Scenarios

| # | Scenario | Main risk | Acceptance criterion |
| ---: | --- | --- | --- |
| 1 | Painting request through service, time, and contact | Catalog reading and sticky occlusion | First selection under 20 s; total under 2 min |
| 2 | Customer is unsure and consults with a photo | Forced technical classification | Clearly labeled uncertainty path and neutral prepared message |
| 3 | Customer verifies trust and calls | Hidden phone and small text | Phone reachable within two interactions; location/hours consistent |
| 4 | Apartment manager requests on-site discovery | Narrow service and lost notes | Discovery path visible; notes preserved; pricing not presented as final |
| 5 | Selected slot becomes unavailable | Lost form data and orientation | Contact data preserved; alternative times shown; focus restored |
| 6 | Availability service fails | Empty screen or endless spinner | Stable skeleton, retry path, no unverified selection |
| 7 | Phone validation fails | Color-only or unclear error | `aria-invalid`, associated copy, retained values |
| 8 | Customer requests cancellation/change | Assumes immediate automatic cancellation | Request semantics clear; previous request status visible |
| 9 | Customer is outside the service area | Learns too late | Service area visible near the first CTA |
| 10 | Keyboard and zoom use | Lost focus, overflow, motion | Keyboard completion, reduced motion, reflow at 195 CSS px |

Test instructions should describe a goal rather than the interface. Example: "Leave a request for wall damage tomorrow afternoon" instead of "click the service card."

## 18. Plerdy Findings Applied to the Product

| Plerdy theme | Product interpretation | Implementation response |
| --- | --- | --- |
| Clear value proposition | State service, location, and next action immediately | Literal H1, Ankara signal, one primary CTA |
| CTA visibility | Important action must be discoverable without repetition | Context-aware primary action; no duplicate simultaneous sticky CTA |
| Local trust | Contact, area, and real proof should be easy to verify | Compact trust strip and real work gallery |
| Form friction | Ask only for information needed at that stage | Name and phone required; optional details disclosed |
| Mobile usability | Prevent obstruction and unstable control geometry | Touch targets, safe-area handling, keyboard and viewport tests |
| Content hierarchy | Put the customer task before long company content | Task-first page order |
| Core Web Vitals | Visual redesign must not regress speed or stability | Responsive images, stable dimensions, budgets, Lighthouse checks |

Plerdy outputs remain heuristic inputs. They must be validated with real analytics and customer tests.

## 19. Data Visualization and Measurement

### Customer-facing data

- Days use a common alignment and scale.
- Availability combines text, shape/icon, and color.
- Decorative heatmaps are not used when no meaningful density information exists.
- Prices share one format and typographic alignment.
- The stepper shows progress without implying a misleading percentage.

### Admin analytics

Following graphical-perception research, position and length on a common scale are preferred over area, angle, or volume for accurate comparison.

- **Funnel:** count and rate in a fixed stage order.
- **Channel conversion:** horizontal bars with a shared zero baseline.
- **Service confirmation:** sorted dot plot or bar with sample size `n` visible.
- **Day/hour demand:** heatmap only when the sample is sufficient, with legend and exact values.
- **Duration:** median, P75, and sample size rather than mean alone.
- **Low samples:** explicit "insufficient data" state instead of a misleading faded chart.
- **Color:** semantic and accessible category colors; brand copper is not the default data series.

### Event model

Measure at minimum:

- Landing and primary/secondary CTA use
- Wizard start and step completion
- Service-group and service selection
- Date, week, and slot selection
- Validation errors and submission result
- Back navigation and service changes
- Gallery-assisted sessions
- Tracking, cancellation, and change requests

Analytics must avoid names, phone numbers, email addresses, notes, and free-form messages.

## 20. Design Thinking Validation Loop

1. **Empathize:** Observe five to eight customers on mobile, including at least two older or lower-digital-confidence participants.
2. **Define:** Break "does not feel premium" into trust, consistency, task clarity, craft evidence, and brand recall.
3. **Ideate:** Compare the improved baseline, Quiet Craft Light, and a darker workshop direction.
4. **Prototype:** Validate navigation, hero, and the first wizard step before the whole page.
5. **Test:** Measure task success separately from aesthetic preference; observe hesitation and correction even when participants say the design is attractive.
6. **Implement:** Apply the winning direction through tokens and shared components rather than page-specific exceptions.

## 21. Success Criteria

| Dimension | Measure | Decision gate |
| --- | --- | --- |
| First-task clarity | Five-second test | At least 80% correctly identify service and location |
| CTA hierarchy | First click | Wrong channel at or below 10% in the primary scenario |
| Choice load | First service-group time | Median at or below 12 s; P75 at or below 20 s hypothesis |
| Task success | Request journey | At least 90% without help |
| Perceived ease | SEQ | Median at least 5.5/7 |
| Mental demand | NASA-TLX subscale | Lower than baseline; no universal absolute claim |
| Premium perception | Semantic differential | "Careful," "trustworthy," and "skilled" rise; "artificial" and "cluttered" fall |
| Brand recall | Delayed recall | Participants connect the U mark with metal craft |
| Repetition | First-viewport inventory | One primary and one secondary; no simultaneous duplicate action |
| Accessibility | WCAG and E2E | No P0 issue; focus, target, and reflow pass |
| Performance | Lighthouse and RUM | Visual changes do not regress loading quality |

Premium direction is not accepted on "looks better" feedback alone. If task success drops or first-selection time rises, the design must be revised.

## 22. Quality Gates

### UX Definition of Done

- One dominant action per step
- No unrequested default service
- No duplicate primary action in the same viewport
- State preserved across backward navigation and recoverable errors
- Empty, loading, error, conflict, and success states designed
- Copy audit confirms no redundant confirmation language

### Accessibility Definition of Done

- Keyboard completion of the full appointment journey
- Visible and high-contrast focus indicators
- Minimum target-size and spacing review
- Text and UI contrast checks
- Status never communicated by color alone
- 200% zoom/reflow and 195 CSS px testing
- Reduced-motion and forced-colors support
- Mobile keyboard does not cover focused inputs or primary actions

### Engineering Definition of Done

- Unit and integration tests for state transitions and validation
- Playwright journeys for desktop and mobile breakpoints
- Stable dimensions for controls and asynchronous states
- No duplicate submit or analytics events
- Analytics property sanitization
- Production build, asset audit, and performance budget pass

### Product Owner GO/NO-GO

Release requires no critical task blocker, no accessibility P0, successful rollback readiness, correct database migrations, and validated customer communication expectations.

## 23. Priorities

### P0

- Preserve reliable appointment submission and input focus.
- Keep one explicit primary action and one decision per wizard step.
- Maintain keyboard, focus, validation, and responsive behavior.
- Prevent duplicate requests and scheduling conflicts.

### P1

- Consolidate brand, trust, and confirmation copy.
- Refine the logo, color roles, spacing, and work-proof imagery.
- Validate service grouping and weekly calendar behavior with customers.
- Measure funnel, channel, service, and cancellation quality.

### P2

- Expand qualitative research and premium-perception measurement.
- Improve real-user monitoring and sample-size guidance.
- Iterate gallery attribution and advanced operational analytics.

## 24. Sources

- [Plerdy Website Checklists Hub](https://www.plerdy.com/check/)
- [Plerdy Local Service Website Leak Checklist](https://www.plerdy.com/local-service-website-money-leak-checklist/)
- [Plerdy Website Usability Checklist](https://www.plerdy.com/usability-testing-website-checklist/)
- [Plerdy UX and Usability Testing Guide](https://www.plerdy.com/blog/plerdy-ux-usability-testing-how-to-use-it/)
- [Plerdy Website Conversion Rate Checklist](https://www.plerdy.com/conversion-boosting-ideas-for-your-website/)
- [Plerdy Website Content Checklist](https://www.plerdy.com/website-content-checklist/)
- [Hick - On the Rate of Gain of Information](https://doi.org/10.1080/17470215208416600)
- [Hyman - Stimulus Information as a Determinant of Reaction Time](https://pubmed.ncbi.nlm.nih.gov/13052851/)
- [Scheibehenne, Greifeneder, and Todd - Choice Overload Meta-analysis](https://ideas.repec.org/a/oup/jconrs/v37y2010i3p409-425.html)
- [Cowan - The Magical Number 4 in Short-Term Memory](https://pubmed.ncbi.nlm.nih.gov/11515286/)
- [Reber, Schwarz, and Winkielman - Processing Fluency and Aesthetic Pleasure](https://journals.sagepub.com/doi/10.1207/s15327957pspr0804_3)
- [Springer and Whittaker - Progressive Disclosure](https://doi.org/10.1145/3374218)
- [Munzner - Nested Model for Visualization Design and Validation](https://www.cs.ubc.ca/labs/imager/tr/2009/NestedModel/)
- [Cleveland and McGill - Graphical Perception](https://www.tandfonline.com/doi/abs/10.1080/01621459.1984.10478080)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C - Understanding Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)
- [W3C - Understanding Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)
- [W3C - Understanding Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [W3C COGA - Clear and Understandable Content](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/)
- [NASA Task Load Index](https://www.nasa.gov/human-systems-integration-division/nasa-task-load-index-tlx/)
- [NASA-TLX Paper and Pencil Package](https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20000021488.pdf)
- [ACM Survey on Measuring Cognitive Workload in HCI](https://doi.org/10.1145/3582272)
- [GOV.UK Service Manual - Structuring Forms](https://www.gov.uk/service-manual/design/form-structure)
- [Reinecke et al. - Visual Complexity, Colorfulness, and First Impressions](https://doi.org/10.1145/2470654.2481281)
- [IDEO.org - Human-Centered Design](https://www.designkit.org/human-centered-design.html)
- [Stanford d.school - Design Thinking Bootleg](https://dschool.stanford.edu/tools/design-thinking-bootleg)
- [Vitsoe](https://www.vitsoe.com/)
- [Gaggenau Company Profile](https://www.gaggenau.com/press/company-profile)
- [Buster + Punch - Behind the Design](https://uk.busterandpunch.com/es/pages/behind-the-design)

## 25. Document Status

This report records the research basis and validation framework behind the customer-experience redesign. Several recommendations have since been implemented through the PUX sprint sequence. Historical baseline observations remain valuable as rationale; current behavior should always be verified against the application and the latest release-candidate evidence.
