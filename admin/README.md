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

## Option B — Edit online with an access token (recommended over OAuth)

At the deployed `/admin/` URL, use **"Sign In Using Access Token"**. No server,
no OAuth app, no config changes. Sveltia recommends this whenever the editors are
just you or other technical users.

1. Click the **🔑 Generate a GitHub token** link at the bottom of the sign-in
   screen. It opens GitHub with the token name and the one required permission
   already selected. (Sveltia's own dialog doesn't link to this — hence the link
   on our page. Direct URL:
   <https://github.com/settings/personal-access-tokens/new?name=Sveltia+CMS&contents=write>)
2. Set **Repository access → Only select repositories → `michael-collins/nominalco`**.
   Permissions needed:
   - **Contents: Read and write** — the only one you pick
   - **Metadata: Read-only** — GitHub enables this automatically
3. Pick an expiration (90 days is reasonable), generate, and paste the token into
   the CMS. It's kept in your browser's local storage, so treat it as disposable
   and regenerate when it lapses.

Note: **"Sign In with GitHub" will not complete** — that button needs an OAuth
handler, which isn't set up (see Option C).

## Option C — OAuth (only if a non-technical editor needs access)

Only worth it if someone who shouldn't manage their own token needs to sign in.
A browser can't hold a client secret, so this requires a small auth worker:

1. Deploy **sveltia-cms-auth**: https://github.com/sveltia/sveltia-cms-auth
   (Cloudflare Workers → "Deploy with Workers"). Note the worker URL.
2. Register an OAuth app at https://github.com/settings/applications/new:
   - **Authorization callback URL** = `<YOUR_WORKER_URL>/callback` (must be exact)
   - Generate a client secret.
3. In the worker's Settings → Variables, set `GITHUB_CLIENT_ID`,
   `GITHUB_CLIENT_SECRET` (click **Encrypt**), and optionally
   `ALLOWED_DOMAINS=michaelcollins.xyz`.
4. Add the worker URL to `admin/config.yml` under `backend`:
   ```yaml
   backend:
     name: github
     repo: michael-collins/nominalco
     branch: main
     base_url: https://<your-worker-subdomain>.workers.dev
   ```

GitHub is adding client-side PKCE auth, after which this worker becomes
unnecessary: https://github.com/github/roadmap/issues/1153

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
