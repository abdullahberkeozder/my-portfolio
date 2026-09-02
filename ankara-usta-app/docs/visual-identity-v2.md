# Orkestra visual identity V2

Historical direction: the active palette is now documented in [visual-identity-v3.md](visual-identity-v3.md). The circular geometry is retained.

Source: the six user-supplied V2 identity boards. This first implementation covers shared tokens, typography, the vector mark, header, homepage and receipt branding. It does not change authentication or request behavior.

## Palette and hierarchy

- Deep teal `#0D2C34`: headings, primary controls and dark brand surfaces.
- Copper `#E05A36`: the right-hand logo satellite and selected primary actions.
- Parchment `#FAF8F5`: light page and receipt surfaces.
- Charcoal `#1B242A`: body text.
- On-copper ink `#10191E`: accessible small text on copper buttons; white and deep teal do not reach 4.5:1 against the supplied copper.
- Outfit: headings, navigation and buttons. Geist: body copy and forms. Geist Mono: receipt metadata. Latin extended subsets support Turkish text.

The 60/30/10 guideline is a brand composition reference, not a mandatory pixel ratio for every screen. Transactional forms retain light surfaces. Warning, error and information colors retain their semantic roles.

## Mark and motion

The square 96-unit mark has four 17-unit-radius satellites around a 12-unit-radius core. The copper satellite always stays on the right. Inverse marks use parchment and a light muted satellite so all five circles remain visible on dark backgrounds. The mark is decorative alongside the visible brand name.

Scroll-linked motion separates and reunites the four satellites; the core stays fixed. Existing reduced-motion support disables the intro and scroll transforms. Unsupported scroll-timeline browsers retain the assembled mark.

## Remaining rollout

Legacy laboratory/concept screens, service imagery and social-share artwork remain separate follow-up scope. This slice does not claim a complete asset migration or real-device visual verification.
