# Security Policy

## Supported versions

Clothes Never Come is a static site. Only the latest commit on `main` is supported.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| Anything older | No |

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub's private vulnerability reporting: go to the repository's **Security** tab and choose **Report a vulnerability**.

Please include:

- What the issue is and where it lives (file, route, or dependency)
- Steps to reproduce, or a proof of concept
- The impact you expect

You can expect an acknowledgement within **3 business days** and a status update within **10 business days**. Unlike our deliveries, these will actually arrive.

## Scope

The app is designed to hold as little as possible:

- **No backend, accounts, or analytics.** The cart and order history live only in the visitor's `localStorage`.
- **No real payment data.** The checkout is a parody. Every field is read-only and pre-filled with obviously fake values, and nothing is transmitted.
- **No third-party requests at runtime.** Fonts are self-hosted, and the catalog is static JSON served from the same origin.

In scope:

- Cross-site scripting or HTML injection (including via URL parameters such as `/search?q=`)
- Vulnerable or compromised dependencies
- Anything that makes the site request, store, or transmit real personal or payment data
- CI/CD weaknesses in `.github/workflows`

Out of scope:

- The fact that your order never arrives (that's a feature)
- Clearing or editing your own `localStorage`
- Denial of service against the static host
