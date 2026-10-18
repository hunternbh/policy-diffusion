# Policy diffusion: public empirical report

Public companion to **Disclosure Regulation, Stock Liquidity and Policy Diffusion Around the World**, first empirical draft, 18 October 2026.

Website: https://hunternbh.github.io/policy-diffusion/

The HTML includes both PDF figures, both equations, all nine tables, the complete manuscript text, an interactive view of primary liquidity comparisons, and aggregate CSV/PDF downloads.

## Interpretation

These are preliminary descriptive comparisons conditional on documented cases. Missing country-family records are not untreated controls. Liquidity cluster-deletion ranges are sensitivity ranges, not confidence intervals; liquidity p-values are withheld. Only two exposure-only timing specifications meet support/stability criteria; learning fits are unstable. The pooled timing fit covers two policy families.

## Files and scope

- `index.html`, `assets/report.css`, `assets/report.js`: buildless static website.
- `assets/`: original report figures/equations and vector figure PDFs.
- `downloads/paper.pdf`: original 20-page paper.
- `data/`: aggregate result tables, report data and manuscript text/table snapshots.
- `downloads/aggregate-tables.zip`: aggregate CSV bundle.

No quote-level vendor data, raw portfolio positions, credentials or third-party literature PDFs are included. This repository does not confer redistribution rights over the original vendor data. No blanket open-source or data license is asserted.

## Local preview

Serve this directory with `python -m http.server 8767`, then open http://127.0.0.1:8767/ . All original tables and manuscript content remain readable without JavaScript. Interactive controls load `data/report-data.json` over HTTP.

## Hosting

GitHub Pages serves the `main` branch root; `.nojekyll` disables Jekyll processing.

## Regulation register update

The source archive update adds 441 event JSONs, fourteen family indices, 51 separate inherited ESG document JSONs, a master register, source/document manifests, explicit source gaps, and searchable catalogue controls. Original documents and full-text/OCR outputs remain in the local project archive. Downloadable metadata distinguishes saved originals, linked sources, author repository data, excerpts and unavailable material. Legal coding and empirical estimates are unchanged.
