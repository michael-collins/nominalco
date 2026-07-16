# Editing content with Sveltia CMS

The site's content lives in three version-controlled files:

| File | What it holds |
|------|---------------|
| [`data/projects.json`](../data/projects.json) | Portfolio projects (title, images, tags, markdown body, etc.) |
| [`data/content.json`](../data/content.json) | Site strings — hero, about, nav, contact, section titles |
| [`data/footer.json`](../data/footer.json) | Footer logo, tagline, CTA, link columns |

You edit them through the Sveltia CMS admin (this folder), which writes to those
files for you. The website reads the same files at load time, so a saved edit is
a content change — no spreadsheet, no build step.

---

## Option A — Edit locally (recommended for quick changes)

**Requires a Chromium browser (Chrome, Edge, Brave).** Uses the browser's File
System Access API — no server-side auth, edits go straight to your local files.

1. From the repo root, start any static server, e.g.:
   ```sh
   python3 -m http.server 4601
   ```
2. Open **http://localhost:4601/admin/** in Chrome.
3. Click **"Work with Local Repository"** and select this repo's root folder.
4. Edit content. Saves write directly to `data/*.json` on disk.
5. Preview at http://localhost:4601/ , then commit + push with git as usual:
   ```sh
   git add data images && git commit -m "Update content" && git push
   ```

## Option B — Edit online (commits straight to GitHub)

Editing at the deployed `/admin/` URL needs a GitHub OAuth handler, because the
browser can't hold your GitHub secret. The standard free option is Sveltia's own
auth worker on Cloudflare (one-click deploy):

1. Deploy **sveltia-cms-auth**: https://github.com/sveltia/sveltia-cms-auth
   (Cloudflare Workers → "Deploy with Workers", follow the prompts).
2. Create a GitHub OAuth App (Settings → Developer settings → OAuth Apps):
   - **Authorization callback URL** = your worker URL + `/callback`
   - Put the Client ID / Secret into the worker's environment variables.
3. Add the worker's base URL to `admin/config.yml` under `backend`:
   ```yaml
   backend:
     name: github
     repo: michael-collins/nominalco
     branch: main
     base_url: https://<your-worker-subdomain>.workers.dev
   ```
4. Visit `https://michaelcollins.xyz/nominalco/admin/` and **Sign In with GitHub**.

Until the worker is set up, "Sign In with GitHub" online won't complete — use
Option A. (A Personal Access Token via "Sign In Using Access Token" also works
without a worker, if you prefer.)

---

## Notes

- **Images:** the media button uploads into `/images` in the repo. Existing
  projects reference full `raw.githubusercontent.com` URLs, which also still work.
- **Google Sheets is now a fallback**, not the source. `script.js` reads the
  local JSON first and only falls back to the old Sheet if a file is missing.
  Once you're comfortable, the Sheets fetch blocks (and the `*.csv` templates and
  `setup-*google-sheets*.md` guides in the repo root) can be deleted.
- **Version pin:** the CMS is pinned to a specific Sveltia version in
  `admin/index.html`. Bump it to update — see
  https://github.com/sveltia/sveltia-cms/releases
