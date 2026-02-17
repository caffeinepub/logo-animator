# Specification

## Summary
**Goal:** Build a single-page logo generator that deterministically creates a static SVG logo and a matching animated preview from a user’s text description, with saving per signed-in user and export options.

**Planned changes:**
- Create a single-page UI with a multiline English description input, generate action, and clear loading/error/retry states.
- Implement an offline, deterministic logo generator that turns the description into a structured logo spec and renders a scalable SVG containing a mark plus a derived wordmark.
- Add an animated preview derived from the same logo spec, with play/pause and real-time speed control.
- Add authenticated persistence: save generated projects (description, logo spec, timestamps) and show a “My logos” list to reopen prior projects, scoped to the current user.
- Add export actions to download the generated logo as SVG and as a client-side rendered PNG (default ~1024x1024).
- Apply a cohesive, creative-tool oriented UI theme used consistently across all states.

**User-visible outcome:** Users can describe a company/logo vibe, generate a crisp static SVG and matching animated preview with controls, save and reopen past logos when signed in, and download the result as SVG or PNG.
