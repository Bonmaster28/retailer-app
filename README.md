# RetailerPro — Quick Deploy & Troubleshooting

This file contains short instructions to push changes to GitHub, verify GitHub Pages deployment, and resolve a common issue where the service worker keeps serving a cached (old) version of the app.

## Push your local changes (PowerShell)
Run these commands from the project folder:

```powershell
cd "C:\Users\SIBO\OneDrive\Desktop\New folder"
git add .
git commit -m "Bump SW cache, remove manifest screenshots, harden validation"
git push origin main
```

If your branch is not `main` or `origin` isn't set, replace `main` with your branch name or add the remote:

```powershell
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Verify GitHub Actions & Pages
1. On GitHub, open the repository → **Actions** → confirm the Pages workflow run succeeded.
2. Open **Settings** → **Pages** and confirm the published site URL.
3. Open the published URL and verify `index.html` shows the new content.

## If the site still shows the old version (service worker cache)
Browsers may keep serving cached assets via the service worker. To force the browser to fetch the new files:

Developer approach (recommended for you):
1. Open the site in Chrome.
2. Press F12 to open DevTools.
3. Go to the **Application** tab → **Service Workers**.
4. Click **Unregister** for the service worker.
5. With DevTools open, enable **Network** → check **Disable cache** and reload the page.

User approach:
- Open the site in an Incognito/Private window (fresh profile) — it won't use the previous service worker.

After the service worker is unregistered, the page should load the new assets. Because the service worker cache name was bumped and it calls `skipWaiting()`/`clients.claim()`, subsequent navigations should pick up the new SW automatically.

## Contact / Next steps
- After pushing, tell me the repository URL or paste the Actions run link and I will re-verify the live site and run a final PWA check.

---
Generated: October 7, 2025
