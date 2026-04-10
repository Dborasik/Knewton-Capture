<div align="center">

<img src="https://img.shields.io/badge/type-bookmarklet-orange?style=for-the-badge&logo=javascript&logoColor=white" alt="type"/>
<img src="https://img.shields.io/badge/browser-Edge%20%7C%20Chrome-0078D4?style=for-the-badge&logo=microsoftedge&logoColor=white" alt="browser"/>
<img src="https://img.shields.io/badge/install-zero_dependencies-brightgreen?style=for-the-badge&logo=checkmarx&logoColor=white" alt="no deps"/>
<img src="https://img.shields.io/badge/personal_use-only-red?style=for-the-badge&logo=shield&logoColor=white" alt="personal use only"/>

<br/><br/>

# 📄 Knewton Alta → PDF
### A one-click bookmarklet that saves your Knewton Alta assignment pages as clean, organized PDFs. 
### Because retyping your own notes shouldn't be part of the assignment.

<br/>

> **No server. No extensions. Just your browser's print dialog, automated.**

<br/>

</div>

---

## ✨ What It Does

When you're working through a Knewton Alta assignment, each page has two sections:

- A **learning material block** — textbook-style content, theorems, examples, diagrams
- A **question block** — the interactive problem you solve

Normally, saving this for your notes means manually scrolling, screenshotting, and stitching images together in Word. This bookmarklet automates that entire process:

1. **Click the bookmark** on any Knewton Alta assignment page
2. An **animated overlay card** appears, confirming what was detected and showing your print settings
3. The overlay dismisses itself, then the **print dialog opens** — already configured with the topic name as the filename
4. Set **Save as PDF**, click **Save**
5. Done — a clean, multi-page PDF with the topic, learning material, and question

<br/>

## 🖼️ What the Output Looks Like

Each PDF includes:
- ✅ **Current Objective header** — the topic name, clearly labelled at the top
- ✅ **Full learning material** — text, math notation, diagrams, charts
- ✅ **Interactive graphs** — Desmos graphs are captured as static images
- ✅ **Embedded videos** — YouTube videos become a thumbnail + title + direct watch link
- ✅ **The question** — complete with any embedded figures
- ✅ **Filename pre-filled** — named after the objective (e.g. `Performing Basic Division.pdf`)

<br/>

## 🎬 The Overlay UI

When triggered, a floating card appears in the centre of the screen:

- Shows **how many content cards** were detected
- Displays the **current objective** pulled from the page
- Animated **loading dots** while it prepares the print container
- Switches to a **green checkmark** and "Ready — opening print dialog" once complete
- **Gravity-fall dismiss animation** — the card drops away before the print dialog opens, so it never appears in the PDF

<br/>

## 🚀 How to Install

### Option A — Console (test it first)

1. Navigate to a Knewton Alta assignment page
2. Press **F12** → click the **Console** tab
3. Paste the contents of [`knewton_capture_bookmarklet.js`](./knewton_capture_bookmarklet.js) and press **Enter**
4. The animated overlay will appear, then the print dialog opens automatically

### Option B — Bookmarklet (one-click, permanent)

1. Copy the minified `javascript:(function(){...})();` line from the bottom of the `.js` file
2. Right-click your bookmarks bar → **Add bookmark** (or **Add favorite** in Edge)
3. Set the **Name** to: `📄 Capture Knewton`
4. Paste the copied line as the **URL**
5. Click **Save**

From now on, just navigate to any Knewton assignment and click the bookmark.

<br/>

### Print Settings to Use

When the dialog opens:

| Setting | Value |
|---|---|
| Destination | **Save as PDF** |
| Layout | Portrait |
| Scale | **80%** |
| Background graphics | **ON** ← important for colored boxes |

These settings are also shown in the overlay card before the dialog opens.

<br/>

## ⚙️ How It Works (Technically)

1. Reads the **Current Objective** text visible on the page and uses it as the filename
2. Finds the content cards already rendered in your browser
3. Snapshots any Desmos `<canvas>` graphs as PNG images via `toDataURL`
4. Replaces YouTube `<iframe>` embeds with a thumbnail, title, and watch link — printable without needing an active connection
5. Clones all cards into a hidden print container
6. Shows the **animated overlay card** with detection summary and print settings
7. After ~1.6 seconds: overlay plays its exit animation, is fully **removed from the DOM**, then `window.print()` fires — ensuring the overlay never appears in the captured PDF
8. Injects a `@media print` stylesheet to hide Knewton's nav, UI chrome, and other non-content elements
9. Cleans everything up after you close the dialog via the `afterprint` event

No network requests. No data leaves your browser. It's essentially a smarter Ctrl+P.

<br/>

---

## ⚠️ Personal Use Only

This tool is for **your own study notes** — that's it.

- ✅ Saving your own homework to review later
- ✅ Building a personal study guide
- ✅ Offline reference for your own coursework
- ❌ Do not share, redistribute, or publish the generated PDFs
- ❌ Do not use this for any commercial purpose

The content in Knewton Alta belongs to **John Wiley & Sons, Inc.** Please use this responsibly and in the spirit of your subscription. You can review Wiley's full terms here:

🔗 **[Knewton Alta Terms of Service](https://www.wiley.com/en-us/education/alta/terms-of-service)**

<br/>

---

## 🛠️ Maintenance Note

Knewton Alta uses hashed CSS class names (e.g. `.theme__card___3E6YM`) that can change after a Wiley deploy. If the bookmarklet stops working:

1. Open the browser console on a Knewton page
2. Run: `document.querySelectorAll('[class*="card__card"]')` to find the new selector
3. Update the `CARD_SELECTOR` constant at the top of the script

Pull requests welcome.

<br/>

---

## 📋 Requirements

- Microsoft Edge or Google Chrome (any recent version)
- An active Knewton Alta subscription
- No installs, no Node.js, no Python, no extensions required

<br/>

---

<div align="center">

Made for students, by a student. &nbsp;|&nbsp; For personal study use only. &nbsp;|&nbsp; Not affiliated with Wiley or Knewton.

<br/>

<img src="https://img.shields.io/badge/not%20affiliated%20with-Wiley%20%2F%20Knewton-lightgrey?style=flat-square" alt="not affiliated"/>
<img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT license"/>
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs welcome"/>

</div>
