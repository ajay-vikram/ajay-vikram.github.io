# Portfolio

The current portfolio lives at the repository root. The previous design is
archived under `old/`, with its own CSS, JavaScript, and fonts. Both versions
share the media and documents in `assets/`.

Run locally from the repository root:

```sh
python3 -m http.server 8000
```

- Current site: http://localhost:8000/
- Previous site: http://localhost:8000/old/

No installation or build step is required. The former `/v2/` page URLs redirect
to the current site, preserving query strings and section anchors. Archived
pages and redirects are marked `noindex`; the current site is not.

The current design retains its `portfolio-v2-theme` local-storage key so existing
theme preferences continue to work independently of the archived site's theme.
Blogs features the SSM article and writeups on LLM post-training,
SkillBlenderLC, and ternary CNNs.
Other project detail pages remain available at their existing URLs.

The research radar uses `assets/data/research-experience.json` as its single
data source. Update the snapshot month, domain totals, projects, and basis notes
together. Month ranges are counted inclusively; overlaps within a domain count
once, while the same month may contribute to multiple domains. Values describe
approximate research-associated calendar months, not full-time effort or skill.
The snapshot does not advance automatically. The SVG and accessible table are
generated from the same data. The table is screen-reader-only on screen and
visible in print; without JavaScript or valid data, a CV link remains.
The same configuration defines modality colors, labels, domain assignments,
and supporting notes. Dots describe modalities involved in the work, including
supervision and feedback, not necessarily direct sensor inputs. Colors are
supplemented by modality names in the legend, tooltips, and accessible text.
`axisOrder` controls the chart's clockwise layout without changing the domain
totals or the source order of the accessible table.

Run the radar checks with `node --test tests/research-radar.test.mjs`.
No package installation is needed.

Poster PDFs are deliberately excluded from the published files. Newsreader is
licensed under the SIL Open Font License; see `assets/fonts/OFL.txt`.
