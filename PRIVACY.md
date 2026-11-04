# Decrity Privacy Policy

> **Draft status**: This is a first draft, written to match the data-handling decisions already recorded in `DOC.md` Section 10 and `.wayfinder/tickets/004-privacy-policy-disclosure.md`. It has not been reviewed by a lawyer and should not be published or linked from the Chrome Web Store listing until it has been.

Decrity is built to protect you from AI-specific threats without becoming a surveillance tool itself. This page explains, in plain language, what Decrity does and doesn't collect.

## What we never collect

Decrity never stores the actual text you type, paste, or upload into an AI chat platform, and never stores the pages you visit. Only a one-way hash of scanned content is ever kept; the original text cannot be recovered from it.

## What we do collect

| What | Why | Kept for |
|---|---|---|
| A one-way hash of scanned content (not the content itself) | To avoid re-scanning the same content twice | 90 days |
| Whether content was flagged clean, suspicious, or a threat | So you can see your own scan history | 90 days |
| Which AI platform you were using (e.g. ChatGPT, Claude) | Same as above | 90 days |
| Your email address, if you create an account | To let you sign in and sync settings | Until you delete your account |
| Your extension settings (Privacy Mode, alert preferences, etc.) | To remember your preferences | Indefinitely, or until you change them |
| When a supported AI site changes in a way we haven't caught up with yet, your browser tells us which site, when, and which version of Decrity you have, so our team can fix it quickly. We never see what you typed or any page content. | So we notice a broken platform integration fast, without you having to file a bug | 30 days |

That last row is what we call a **Gap Report**. It carries no content and no identifying information beyond the platform name, a timestamp, and your extension version, never selector details or anything about the page itself. It's sent automatically, at most once per platform per day, whether or not you're signed in.

## Privacy Mode

Privacy Mode is on by default. While it's on, Decrity only runs local, offline pattern-matching in your browser: nothing about the content you scan ever leaves your device, and no scan-related network calls are made at all. Gap Reports are the one exception: they're metadata about the extension's own health, not about your content, and are sent regardless of Privacy Mode so we can still fix a broken platform even for privacy-conscious users.

## Data you can delete

You can delete your account and associated scan history at any time from the dashboard (once available) or by contacting us. Gap Reports aren't tied to any account and age out automatically after 30 days.

## Changes to this policy

If this policy changes in a way that affects what we collect, we'll update this document and note the change in `CHANGELOG.md`.
