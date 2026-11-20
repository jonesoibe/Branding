# Putting the site online

This folder is the whole website: `index.html`, `style.css`, `script.js` and the `assets` folder.
Upload the folder as it is. There is nothing to build.

## Easiest: Netlify Drop (free)

1. Go to https://app.netlify.com/drop and sign in (free account).
2. Drag this whole folder onto the page.
3. Netlify gives you a public address like `something.netlify.app`.
4. Site settings > Domain management lets you rename it or attach your own domain.

## Alternative: GitHub Pages (free)

1. Create a new public repository on GitHub and upload these files to it.
2. Settings > Pages > Deploy from branch > `main` / root.
3. Your site appears at `https://<your-username>.github.io/<repo-name>/`.

## Your own domain

Buy a domain (for example `favouroibejones.com`) from any registrar, then follow
the host's "Add custom domain" steps. Both Netlify and GitHub Pages give HTTPS for free.

## Things to know

- Your email `jonesoibe@gmail.com` is in `index.html` and will be public. Search for it to change it.
- To edit text, open `index.html`. To change a photo, replace the file in `assets` (keep the same name).
- Local preview: run `python -m http.server 5173` in this folder and open http://localhost:5173.
