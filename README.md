# Artefact for ACM Web Conference 2027 Submission

## UI Deception by Exploiting Structural Vulnerability in Progressive Web Application Framework

This repository contains the proof-of-concept implementation, automation scripts, and web-measurement pipeline accompanying our paper submission to The Web Conference (WWW) 2027.

---

## Repository structure

```
PWA_Artefact/
├── SSO_login/         # PWA proof-of-concept: fake landing page, spoofed SSO/2FA
│                       #   interface, and backend credential-relay automation
├── Web_Measurement/    # Tranco top-10k crawl pipeline (installability + SSO detection)
├── images_and_video/   # Figures and demo videos used in the paper
└── README.md
```

### `SSO_login/`

The end-to-end PWA attack demonstrated in Sections 2–4 of the paper:

- `manifest.json` — PWA manifest with a `start_url` that diverges from the install-time landing page
- `index.html` / `index2.html` — the legitimate landing page vs. the divergent page loaded post-install (Fig. 1)
- `service-worker.js` — service worker registration required for installability
- Fake SSO/2FA pages that replicate the in-window navigation bar in HTML/CSS
- Install dependencies from `package.json` using `npm install`
- `server/server.js` — local Node.js server for running the PoC (`node server/server.py`, serves on `http://localhost:3005`)
- Backend automation script(s) implementing the credential-relay and 2FA-bypass pipeline described in Section 3 (Playwright-based, SMS-OTP handling shown in Fig. 7 of the paper)

### `Web_Measurement/`

The four-stage crawl pipeline behind Section 5.2, run in order:

| Script                 | Purpose                                                                                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1_pwa_measurement.py` | Crawls the Tranco top 10,000 domains; checks each domain's manifest for installability criteria (`display`, `name`/`short_name`, `icons`)                                                           |
| `2_pwa_picker.py`      | Filters the output to installable PWAs only                                                                                                                                                         |
| `3_sso_finder.py`      | Visits each installable PWA, probes for SSO login options (homepage scan, modal interaction, common auth paths, network request logging), matches against regex patterns for 13 candidate providers |
| `4_analyze.py`         | Aggregates per-provider adoption counts from the final CSV (produces the numbers behind Fig. 5)                                                                                                     |

**Requirements:** Python 3.x, `playwright`, `pandas`. Install with:

```bash
pip install playwright pandas
playwright install chromium
```

**Usage:**

```bash
python3 1_pwa_measurement.py
python3 2_pwa_picker.py
python3 3_sso_finder.py 2_filtered.csv 3_output.csv
python3 4_analyze.py
```

You will need a local copy of the Tranco top-1M list (`top-1m.csv`) in this directory — available from [tranco-list.eu](https://tranco-list.eu).

### `images_and_video/`

Screenshots and demo recordings referenced throughout the paper, including:

- Cross-browser screenshots (Chrome, Edge, Firefox, Samsung Internet, Vivaldi, Safari) of the spoofed SSO interface
- The original vs. fake taskbar comparison (Fig. 2–3)
- The GitHub phishing-page vs. automated-browser side-by-side (Fig. 8)
- Demo video(s) showing the full attack flow end to end

---

## Reproducing the results

1. **Web measurement (Section 5.2):** follow the `Web_Measurement/` instructions above.
2. **Cross-browser comparison (Section 5.1):** install the PWA from `SSO_login/` in each browser listed in Table 1 and manually verify the trust-indicator behavior described there; exact browser versions used are listed in the table 1 in the paper.
3. **Attack PoC:** Install dependencies from `SSO_login/package.json` using `npm install` and run `SSO_login/server/server.js` to start server, go to `http://localhost:3005`, install the PWA, and follow the reproduction steps in the paper's Section 2,3 and 4 to observe the `start_url` divergence, the spoofed navigation bar and 2FA bypass. Videos provided in `images_and_video` folder can provide a clearer picture.

---

<!--## Citation

If you use this artefact, please cite:

```bibtex
@inproceedings{anonymous2027pwadeception,
  title     = {UI Deception by Exploiting Structural Vulnerability in Progressive Web Application Framework},
  author    = {Anonymous},
  booktitle = {Proceedings of the ACM Web Conference 2027 (WWW '27)},
  year      = {2027}
}
```-->
