# Kalanagarcha Mahaganapati

A traditional, responsive Ganpati mandal website in English and Marathi. It includes
festival programmes, announcements, sponsor advertisements, celebrity and guest visits,
past years’ showcases, visiting information, and a contact message builder.

The current programme, notices, sponsors, and yearly archive are labelled samples.
The artwork is original illustration, not photographs of actual mandal events.
No celebrity visits have been invented.

## View the website

Double-click **start.cmd**, then open **http://localhost:8791**.
Node.js 22 or newer is required for the local editor. No npm install is needed.

## Edit and publish without coding

1. Double-click **edit.cmd**. Keep its window open while editing.
2. The editor opens at **http://localhost:8791/editor/**.
3. Choose a section and edit its fields. Add events, announcements, photographs,
   guest records, sponsors, or advertisements. English and Marathi fields appear together.
4. Check the draft preview, including the mobile view.
5. Click **Save draft**. This saves to this computer; it does not change the public website.
6. Click **Publish website**. Check the GitHub account, repository, and branch.
7. Click **Review publication**, review the destination and files, then click
   **Publish these changes**. The editor uploads the site and configures GitHub Pages.
8. Follow the deployment-progress link. The site updates after GitHub Pages finishes.

The repository is `hedaprateek/kalanagarcha-mahaganapati`, branch `main`.
The public website is hosted with GitHub Pages at
https://hedaprateek.github.io/kalanagarcha-mahaganapati/.
You can change the account and repository in the publication window. If the repository
does not exist, the review explicitly says that a new public repository will be created.

Install **Git for Windows** and sign in using **Git Credential Manager** or the
existing Git account switcher before publishing. The selected GitHub username must
match the signed-in account. Credentials stay in Git Credential Manager and are never
returned to the browser, placed in backups, or published with the website.

If GitHub allows the upload but denies Pages setup, the editor reports that separately
and provides the exact repository’s Pages settings link. Choose **Deploy from a branch**,
the publishing branch, and **/ (root)**. GitHub’s official instructions are at
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site.

## Drafts, photographs, and backups

- Local drafts, revision backups, and publication records are in `.editor-data/`.
  They are excluded from Git and the published files. Keep this folder when moving
  the project to another computer.
- Uploaded JPG, PNG, and WebP files are placed in `assets/uploads/`. Images must
  be smaller than 8 MB. Keep this folder with the project.
- **Download content backup** exports the editable data. **Restore a content backup**
  loads it into the editor; save and publish after reviewing it. The JSON backup does
  not contain the image files, so copy `assets/` separately as well.
- Published data lives in `site.config.js`; the layout is in `index.html`, `styles.css`,
  and `app.js`. Advanced edits to `site.config.js` must retain its JSON object format.
- Publication sends only the public HTML, CSS, JavaScript, `.nojekyll`, and assets.
  It preserves unrelated remote repository files and refuses to overwrite a branch
  that changed after the publication review. It does not alter the local Git index.
- Replace sample content with confirmed details before turning off the sample-content
  labels in **Mandal details**. This also hides the gallery’s preview-artwork note.
  Use real images and accurate alternative text when replacing illustrations.

The public site is static and can still be opened from `index.html` or hosted elsewhere.
The editor runs only on the local computer at `127.0.0.1`; no hosted backend or online
admin account is required. Its save and publishing endpoints require a local session
token and reject requests from other website origins.

The contact form prepares a draft for the visitor to review. It does not submit or
store enquiries. Add the official contact email to enable an email draft link.

## Development checks

```powershell
npm run check
npm test
```

The editor tests use a temporary site and a simulated GitHub API. They verify draft
isolation, revision conflicts, preview escaping, uploads, local access checks, reviewed
publication, remote branch conflicts, and Pages setup failures without publishing anything.
