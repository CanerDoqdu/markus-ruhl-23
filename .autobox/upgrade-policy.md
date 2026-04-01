# AutoBox Upgrade Policy

Generated: 2026-03-06T18:31:12.459Z
Project: markus-ruhl
Purpose: Content platform focused on publishing and discoverability
Complexity Ceiling: medium (35.27)

Rules:
1. Do not rewrite architecture unless required by breakage.
2. Prefer patch/minor upgrades first, then limited major upgrades.
3. After each upgrade slice: lint -> typecheck -> test -> build.
4. Stop on first regression and document rollback.

Safe candidates (0):

Major candidates (selected up to 2):
