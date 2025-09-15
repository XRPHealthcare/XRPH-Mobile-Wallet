# XRPH Wallet — Open-Source XRPL Wallet

## Overview
XRPH Wallet is an open-source, non-custodial payments wallet built on the XRP Ledger (XRPL).
It enables users and developers to send and receive XRP, XRPH, and RLUSD with ~3-second confirmations and low on-chain fees.

- **Project established:** 2022
- **Mobile wallet launched:** 2023
- **Maintained by:** XRP Healthcare LLC

> **Note:** XRPH Wallet is a payments wallet. It does not store PHI and does not claim HIPAA compliance.

## Features

- **Multi-asset support:** XRP (native), XRPH, RLUSD (issued assets on XRPL)
- **Trustlines:** automatic (user-approved) trustline creation for XRPH and RLUSD
- **Destination tags:** prompts when a tag/memo is required by an external service (e.g., some exchanges)
- **Non-custodial keys:** keys remain on device; the user controls funds
- **On-chain memos:** optional references (for internal IDs) to aid reconciliation
- **Performance and fees:** XRPL typically finalizes in ~3 seconds; fees are measured in drops (fractions of a cent)

## Tech overview

- **Mobile stack:** React Native + JavaScript (reference implementation for iOS and Android)
- **XRPL integration:** WebSocket/HTTP endpoints, issued-asset trustlines, transaction signing
- **Configuration via .env** for endpoints, issuer addresses, and defaults

## Quick start

1. **Prerequisites:** Node LTS, Yarn, Java 17/Android SDK, Xcode (for iOS)
2. **Copy environment file:** `cp .env.example .env`
3. **Edit .env** to set XRPL endpoints and issuer addresses
4. **Install dependencies:** `yarn`
5. **Run on iOS:** `yarn ios`
6. **Run on Android:** `yarn android`

## .env essentials (example keys)
```
XRPL_ENDPOINT = wss://your-xrpl-endpoint
XRPH_ISSUER_ADDRESS = rXXXXXXXXXXXXXXXXXXXXXXXXXXXX (XRPH issuer)
RLUSD_ISSUER_ADDRESS = rXXXXXXXXXXXXXXXXXXXXXXXXXXXX (RLUSD issuer on XRPL)
DEFAULT_ASSETS = XRP,XRPH,RLUSD
MEMO_PREFIX = REF:
```

## Security and compliance

- **Non-custodial:** users hold their keys; provide a secure backup/restore flow
- **No PHI:** do not place personally identifiable medical data on-chain
- **Local rules:** confirm tax/VAT treatment, KYC/AML, and any on/off-ramp obligations in your region

## Fees and settlement

- **XRPL network fee:** typically 10–200 drops (about 0.00001–0.0002 XRP)
- **Settlement speed:** commonly ~3 seconds per ledger close
- **External services:** some platforms require destination tags or memos for deposits; the app will prompt when detected

## Roadmap (community-driven)

- Additional asset configuration helpers
- Extended import/export and backup flows
- Optional web SDK for light clients

## Contributing
Pull requests are welcome. Please open an issue for discussion before major changes. See `/CONTRIBUTING.md`.

## UI Design - App Screenshots

### Light Mode
![AppLight](https://firebasestorage.googleapis.com/v0/b/xrphwallet.appspot.com/o/assets%2FLight%20Mode.jpg?alt=media&token=078874f4-0052-4811-be5a-814c32cc0505)

### Dark Mode
![AppDark](https://firebasestorage.googleapis.com/v0/b/xrphwallet.appspot.com/o/assets%2FDark%20Mode.jpg?alt=media&token=6b344246-67c4-47fd-a096-b29695bd9fb1)
