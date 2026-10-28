# UIT S3T - LAB 3 AI GOVERNANCE RULES (HW 3)

1. **STACK**: React 19 + Vite + ES2024.
2. **NO LEGACY APIS**: Ban `class extends React.Component`, `ReactDOM.render`, `defaultProps`, `keyCode`, `window.alert`.
3. **ZERO DIV-SOUP**: Use `<main>`, `<section>`, `<article>`, `<header>`, `<ul>`, `<li>`, `<output>`.
4. **STATE HYGIENE**: Immutable updates only. Never mutate objects/arrays in place.
5. **EFFECT CLEANUP**: Every timer, listener, or fetch in `useEffect` MUST return a cleanup / `AbortController`.
6. **ANTI-DRIFT TIMER**: Ban naive `setInterval(s => s - 1)`. Must recompute from `Date.now()` and listen to `visibilitychange`.
7. **OPTIMISTIC UI**: Claim actions must have an in-flight lock (`claimId`), optimistic decrement, and rollback on HTTP 409.
8. **CSS**: Use CSS Modules (`*.module.css`) and CSS Custom Properties. No inline styles.
