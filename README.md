# Aspire Research Site

Local dev, collaboration, and deploy notes for contributors.

## Quick start (local)

1. Install Node (recommended v18).
2. Install dependencies:

```bash
npm ci
```

3. Run local dev server with live reload:

```bash
npm start
```

4. Build for production:

```bash
npm run build
```

The site is generated into `_site/`.

## Live Share (real-time pairing)

We recommend using Visual Studio Code Live Share for simultaneous editing.

1. In VS Code, open the Extensions view (Cmd/Ctrl+Shift+X).
2. Install these extensions:
   - **Live Share** (ms-vsliveshare.vsliveshare)
   - Optional: **Live Share Extension Pack** (adds audio/chat)

3. Sign in for Live Share (required for hosting):
   - After installing, click the Live Share status entry in the lower-left or open the Command Palette and run `Live Share: Sign in`.
   - By default Live Share supports GitHub and Microsoft accounts. If you don't see a popup, sign-in may be blocked by a popup blocker or the OS — try signing in via the browser manually and then returning to VS Code.

4. Host a session:
   - Click the Live Share button in the status bar or open the Command Palette and run `Live Share: Start Collaboration Session`.
   - Copy the invitation link and share it with your partner.

5. Join a session:
   - Open the invitation link in your browser and choose **Open in Visual Studio Code** (or paste it into the Command Palette with `Live Share: Join Collaboration Session`).

6. Useful Live Share features:
   - Share terminals and ports (useful to run `npm start` and preview the dev server).
   - Follow participants to track what they're doing.
   - Give/revoke read/write access.

If the extension does not prompt to sign in (no popup):
- Make sure you are signed into VS Code with the same account type you want to use (GitHub or Microsoft). Open the Accounts menu in the Activity Bar and sign in.
- Disable strict popup blockers or try the sign-in flow in an external browser (the extension opens a browser auth window).
- If problems persist, open the Command Palette and run `Live Share: Sign out`, then `Live Share: Sign in` again.

## Collaboration workflow (recommended)

- Use feature branches for independent work:

```bash
git checkout -b feature/your-change
git add .
git commit -m "Describe change"
git push origin feature/your-change
```

- Open a Pull Request on GitHub for code review. Netlify (connected) will create a preview URL for each PR so you can test changes before merging.

## Netlify

- The site is already configured with `netlify.toml`. Build command: `npm run build`, publish directory: `_site`.
- If Netlify build fails, check the deploy logs in the Netlify dashboard — common fixes are ensuring `@11ty/eleventy` is listed in `dependencies` and setting a compatible Node version in `package.json`.

## Dev containers / Codespaces (optional)

If you want identical development environments, I can add a `.devcontainer` for GitHub Codespaces or Gitpod. Tell me if you want Codespaces and I will scaffold it.

---

If you'd like, I can also: start a Live Share session now, create a `devcontainer.json`, or add a short CONTRIBUTING.md with branch + PR rules. Which would you prefer next?
