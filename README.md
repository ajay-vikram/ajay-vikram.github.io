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

Poster PDFs are deliberately excluded from the published files. Newsreader is
licensed under the SIL Open Font License; see `assets/fonts/OFL.txt`.
