# AutoBox Project Prompt

Project: markus-ruhl
Purpose: Content platform focused on publishing and discoverability
Complexity: medium (35.27)
Primary priorities: reliability, security, performance, architecture

Execution Rules:
1. Never run indefinite loops. Hard stop after bounded phase plan.
2. Use placeholders for missing secrets/integrations to keep shipping velocity.
3. Finish with a handoff list of required real values and integration keys.
4. Prefer smallest robust diff that passes lint, typecheck, tests, build.

Risk Policy:
- High-risk changes require rollback notes and explicit verification proof.
- Never delete user data paths without backup/restore path.
