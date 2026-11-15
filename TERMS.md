# Decrity Terms of Service

> **Draft status**: This is a first draft, written to match the product as it
> actually works today (see `DOC.md` and `PROGRESS.md`), not aspirational
> language. It has **not** been reviewed by a lawyer. Two sections below are
> placeholders a lawyer needs to fill in, not just proofread: **Governing
> law** and the exact wording of **Limitation of liability**. Do not publish
> this or link it from the Chrome Web Store listing until it has been
> reviewed.

By installing or using Decrity, you agree to these terms. If you don't agree,
don't use Decrity.

## What Decrity is

Decrity is a browser extension (and, once an account exists, a companion web
dashboard) that checks content you paste or type into supported AI chat
platforms for signs of prompt injection: hidden instructions written to make
the AI ignore its own rules. See `PRIVACY.md` for exactly what Decrity does
and doesn't collect while doing that.

**Decrity is a detection aid, not a guarantee.** It can miss a real threat
(a false negative) and it can flag something harmless (a false positive).
Don't rely on Decrity as your only safeguard for anything where getting it
wrong would cause real harm.

## Accounts

The free tier works without creating an account: content checking, local-only
Privacy Mode, and the last 7 days of threat history (stored locally, not
synced anywhere). Creating an account (just an email address, see
`PRIVACY.md`) adds a web dashboard and longer history.

You're responsible for keeping your account credentials to yourself, and for
anything that happens through your account as a result of not doing that.

## Acceptable use

Don't use Decrity to:

- Interfere with, overload, or try to break the service for other users
- Reverse engineer the service to bypass rate limits or access controls
- Use the service for anything illegal where you are

We can suspend or terminate access for a violation of this section.

## Premium (planned, not live yet)

`DOC.md` describes a planned Premium tier ($7/month or $59/year: full ML-based
checking, unlimited history, a weekly summary email, family members on one
plan). **This isn't implemented yet** — there's no billing integration in the
product today. When it ships, this section will be replaced with real
billing, cancellation, and refund terms matching whatever payment provider is
actually used; until then, nothing in this document should be read as a
binding pricing or billing commitment.

## Your content

Decrity checks the content you paste or type, but per `PRIVACY.md`, it never
stores the content itself, only a one-way hash and a verdict. We don't claim
any ownership over what you type or paste; it's yours.

## Disclaimer of warranties

Decrity is provided "as is," without warranties of any kind, express or
implied, including that it will be uninterrupted, error-free, or will catch
every threat. You use it at your own risk.

## Limitation of liability

*(Placeholder — needs a lawyer's exact wording for your jurisdiction, not a
rewrite of this sentence.)* To the maximum extent the law allows, Decrity and
its team aren't liable for indirect, incidental, or consequential damages
arising from your use of the service, and total liability for any claim is
capped at whatever you paid us in the past 12 months (which, on the free
tier, is nothing).

## Termination

You can stop using Decrity any time by uninstalling the extension and, if you
have an account, deleting it (see `PRIVACY.md`). We can suspend or terminate
an account for violating the Acceptable use section above, with notice where
that's practical.

## Governing law

*(Placeholder — a lawyer needs to pick the jurisdiction. Not filled in here
because it's a real legal decision, not a documentation detail.)*

## Changes to these terms

If these terms change in a way that matters, we'll update this document and
note the change in `CHANGELOG.md`, same as `PRIVACY.md` does.

## Contact

[Open an issue](https://github.com/MALTOisHERE/Decrity/issues) on the project's GitHub repository.
