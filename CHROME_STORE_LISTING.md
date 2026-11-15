# Chrome Web Store Listing

Draft copy for the Chrome Web Store submission. Written in the plain-language
voice `CLAUDE.md` requires for user-facing text (no "payload", "heuristic",
"classifier", "endpoint", "API").

**Not ready to submit yet** — two blockers, both outside what this doc can
fix:

- `PRIVACY.md` is a first draft, not legally reviewed. The Chrome Web Store
  requires a privacy policy URL before publishing; don't link it until that
  review happens (see the warning at the top of `PRIVACY.md`).
- No screenshots or promo images exist yet. The store requires at least one
  1280x800 (or 640x400) screenshot; these need the real extension running
  against a live AI platform page, not something this doc can produce.

## Extension name

Decrity

## Short description (132 characters max)

Catches hidden instructions buried in text before they can hijack ChatGPT, Gemini, Claude, or Copilot. Never stores what you type.

(130 characters)

## Category

Productivity (closest fit in the Chrome Web Store's fixed category list; no dedicated "security" category exists for extensions).

## Detailed description

```
Decrity watches for a specific kind of trick: hidden instructions planted
inside something you paste or upload into ChatGPT, Gemini, Claude, or
Copilot, written to make the AI ignore its own rules and do something you
didn't ask for.

Most of the time, you'd never see it coming. The instructions can be hidden
in a document, a pasted block of text, or even invisible characters you'd
never notice while reading. Decrity checks what you're about to send, and
warns you before the AI acts on it.

WHAT IT DOES
- Checks text you paste or type into ChatGPT, Gemini, Claude, and Copilot for
  signs of hidden instructions, before you send it
- Shows a clear warning banner right on the page if something looks off, in
  plain language, not technical jargon
- Tells you if one of these sites changes its layout in a way Decrity can't
  recognize yet, instead of silently stopping and leaving you unprotected
  without knowing it

WHAT IT DOESN'T DO
- It doesn't read your messages for any other reason. Checking happens on
  your own device first, and the actual text you typed is never saved,
  anywhere, by anyone.
- It doesn't slow you down. Checking takes a fraction of a second and
  happens quietly in the background.
- It doesn't need an account. Install it and it works right away.

PRIVACY MODE, ON BY DEFAULT
With Privacy Mode on, every check happens entirely on your own device.
Nothing about what you typed is ever sent anywhere, by Decrity or anyone
else, not even to improve detection. You can turn this off later if you
want deeper checks that use more computing power elsewhere, but it stays on
unless you choose otherwise.

WORKS WHERE YOU ALREADY CHAT
ChatGPT, Gemini, Claude, and Copilot, today. More on the way.

Decrity is free to use. No account needed to get started.
```

## Single purpose description (required by Chrome Web Store review)

Decrity's single purpose is to detect and warn users about prompt injection attacks (hidden instructions intended to manipulate an AI chat assistant) in content they are about to send to a supported AI chat platform.

## Permission justifications (required per-permission in the CWS developer dashboard)

| Permission | Justification |
|---|---|
| `storage` | Remembers the user's settings (Privacy Mode on/off, alert preferences) and caches recent scan results locally, so the same content isn't re-checked twice. |
| `activeTab` | Lets the popup identify which supported AI platform the active tab is on, to show the right Protection Gap status, only for the tab the user is actively viewing. |
| `notifications` | Shows a system notification for a flagged threat if the user has enabled that alert style in settings, so they notice it even if the tab isn't focused. |
| Host permission: `chat.openai.com`, `chatgpt.com`, `gemini.google.com`, `claude.ai`, `copilot.microsoft.com` | These are the only sites Decrity runs on. It needs to read the message box and inject a warning banner on these specific domains, and nowhere else; the extension does not request broad/all-site access. |

## Promotional images still needed

- At least one 1280x800 or 640x400 screenshot showing the warning banner in action on a real platform page
- Optional: small (440x280) and marquee (1400x560) promo tiles, if aiming for a Chrome Web Store featured placement later

## Support

- Repository / issue tracker: https://github.com/MALTOisHERE/Decrity/issues
- Privacy policy: link once `PRIVACY.md` has been legally reviewed and is ready to publish
