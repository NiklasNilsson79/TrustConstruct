# TrustConstruct

A blockchain-anchored quality assurance system for the construction industry

TrustConstruct is a hybrid Web2/Web3 solution that modernizes construction quality documentation.
Instead of paper-based control reports stored in binders, TrustConstruct enables workers, subcontractors and site managers to create AMA-referenced digital reports that are stored securely in a backend while a cryptographic hash of each report is anchored immutably on the Ethereum Sepolia test network.

This ensures transparency, long-term verifiability and protection against manipulation — without exposing sensitive information on-chain.

---

## 🚧 Background & Industry Problem

Based on more than 20 years of experience in the Swedish construction sector, traditional quality documentation suffers from several issues:

- Reports are written on paper
- They are stored in binders or scanned manually
- They are difficult to search and track
- They can be misplaced or altered
- Transparency for inspectors, clients or developers is limited

These reports are critical because they verify that work steps — such as waterproofing, installation, structural components and AMA-referenced tasks — have been executed correctly.

TrustConstruct replaces the analogue process with a digital, verifiable workflow supported by blockchain.

---

## 📘 What is AMA (Swedish Construction Standard)?

AMA stands for “Allmän Material- och Arbetsbeskrivning”, meaning _General Material and Work Descriptions_.  
It is Sweden’s national technical standard for how construction work must be performed.

AMA covers:

- Work methods
- Material requirements
- Quality levels
- Safety standards
- Technical descriptions for each building element

TrustConstruct references AMA sections without reproducing licensed text,
ensuring legal compliance while improving documentation quality.

---

## 🎯 Project Purpose

The goal is to deliver a working prototype where users can:

- Select a project → apartment → room → component
- Fill an AMA-referenced control report
- Digitally sign the report through OKX Wallet
- Store the full human-readable report in a secure backend
- Store a hashed representation + metadata immutably on-chain
- Search and verify previous reports
- Confirm report authenticity by comparing recomputed and on-chain hashes

This creates a transparent and tamper-proof documentation system suitable for contractors,
inspectors and property developers.

---

## 👥 Target Audience

- Construction workers
- Site managers
- Subcontractors
- Quality inspectors
- Developers and real estate owners
- Clients who require trusted documentation

---

## 🛠 Tech Stack

**Smart Contracts**

- Solidity
- Foundry
- OpenZeppelin
- Ethereum Sepolia test network

**Frontend**

- React (Vite)
- OKX Wallet integration
- Viem (for blockchain communication)

**Backend**

- Node.js + Express
- MongoDB (off-chain storage)
- Crypto module (hashing)
- REST API for report submission, retrieval and verification

**Other**

- GitHub for version control
- Documentation stored in /docs

---

## 📡 System Overview — How It Works

1.  User opens the application.
2.  User connects via OKX Wallet.
3.  User selects project → apartment → room → component.
4.  User fills in an AMA-referenced quality report.
5.  User signs the submission.
6.  The full report is sent to the backend.
7.  Backend stores the human-readable report in MongoDB.
8.  Backend calculates a cryptographic SHA-256 hash of the report and sends
    the hash + key metadata (project, apartment, room, component) to the smart contract.
9.  Report becomes searchable in the application.
10. When verifying a report, the frontend retrieves the stored report from the backend,
    recomputes the hash and compares it to the on-chain hash.
11. If hashes match, the report is confirmed authentic and unchanged.

This architecture ensures:

- No personal data is stored on-chain
- GDPR compliance
- Immutable proof of authenticity
- Searchable, human-readable documentation off-chain

---

## 📁 Project Structure (Planned)

```
trustconstruct/
 ├── client/           # React frontend
 ├── contracts/        # Solidity smart contracts + Foundry tests
 ├── backend/          # Node.js/Express backend (off-chain storage + hashing)
 │    ├── src/
 │    │    ├── config/
 │    │    ├── controllers/
 │    │    ├── models/
 │    │    ├── routes/
 │    │    ├── services/
 │    │    ├── middlewares/
 │    │    └── utils/
 │    └── tests/
 ├── docs/             # Documentation and project plan
 ├── scripts/          # Deployment and utility scripts (Foundry)
 ├── README.md
 └── foundry.toml

```

---

## 📁 Legal & Ethical Considerations

- Only hashed values + metadata are stored on-chain.
- Full human-readable reports remain securely off-chain in the backend.
- Blockchain data is immutable — accidental or incorrect on-chain entries cannot be removed.
- AMA references are used legally without reproducing copyrighted text.
- On-chain data is non-sensitive and cannot be interpreted from Etherscan alone.
- The verification process relies on recomputing the hash locally, not exposing any personal data publicly.

This approach ensures GDPR compliance while providing transparency and security.

## 👤 About the Author

**Niklas Nilsson**  
Construction Entrepreneur with 20+ years of experience in building, site coordination and quality documentation.  
Now transitioning into blockchain development to bring transparency, trust and digital innovation to the construction sector.

---

## 📄 License

This project is created as part of the Degree Project at Medieinstitutet, 2025–2026.
