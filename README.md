# 🎯 TrustConstruct

## 🧱 Overview

TrustConstruct is a blockchain-powered system designed to modernize AMA-referenced construction quality documentation.  
Traditional paper reports are inefficient, hard to verify, and easy to lose.  
TrustConstruct replaces them with a **digital, immutable, and verifiable** workflow anchored on the Ethereum Sepolia test network.

Workers authenticate internally (name + PIN or worker ID), while a **company-owned OKX Wallet** performs all blockchain anchoring.  
This approach mirrors real-world enterprise workflows and ensures strong data integrity without requiring users to interact with wallets.

---

## 🚀 Key Features

- Digital AMA-referenced control reports
- Internal worker authentication (no personal wallet required)
- Immutable blockchain anchoring via a company-owned OKX Wallet
- Secure backend storage for full human-readable reports
- SHA-256 hashing to prevent tampering
- Verification through hash comparison with the blockchain
- Project → Apartment → Room → Component navigation flow
- Searchable history of submitted reports

---

## 🎯 Purpose

TrustConstruct ensures that every AMA control report is:

- Authenticated to a specific worker
- Safely stored in a backend database
- Anchored on-chain using tamper-proof hashing
- Verifiable long after the project is completed

This provides **traceability, transparency, and long-term reliability** for construction quality documentation.

---

## 🛠 Tech Stack

### Frontend

- React (Vite)
- Internal login system (name + PIN / worker ID)
- Viem (read-only blockchain queries)
- Component-based architecture

### Backend

- Node.js / Express
- Worker authentication
- Cryptographic hashing (SHA-256)
- MongoDB (local development, off-chain storage)
- OKX Wallet integration (company-owned) for blockchain anchoring
- REST API for submissions and verifications

### Blockchain

- Ethereum Sepolia Testnet
- Smart contract storing:
  - report hash
  - metadata (project, apartment, room, component)
- No human-readable or personal data stored on-chain

---

## 🧪 Local Development Setup

### Prerequisites

- Node.js v18 or later
- MongoDB Community Edition
- OKX Wallet (Sepolia testnet)

The project does not depend on any specific MongoDB data path or service manager.

---

### Start MongoDB (Local)

MongoDB can be started in any standard way depending on the local environment.

Example (manual start):

```
mongod --dbpath <your-local-db-path>
```

Example (system service):

```
brew services start mongodb-community
```

---

### Backend

```
cd backend
npm install
npm start
```

Backend runs on:

```
http://localhost:4000
```

---

### Frontend

```
cd client
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

### Environment Variables

Create a `.env` file in `/backend`:

```
MONGO_URI=mongodb://127.0.0.1:27017/trustconstruct
PORT=4000
```

---

## 🔧 How the System Works (Simplified Flow)

1. Worker opens the application
2. Authenticates via internal login (name + PIN or worker ID)
3. Selects project → apartment → room → component
4. Fills out AMA-referenced control form
5. Backend logs worker identity, timestamp, and full human-readable report
6. Backend computes SHA-256 hash
7. Backend uses the company-owned OKX Wallet to anchor hash and metadata on Sepolia
8. During verification, the stored report is fetched, the hash is recomputed, and compared with the blockchain value
9. If the values match, the report is verified

---

## 🔍 Blockchain Anchoring Explained

When a report is submitted:

- The full report is stored securely in the backend
- Backend computes a SHA-256 hash
- Hash and metadata are written to the blockchain on Sepolia via the company OKX Wallet

On-chain data contains no personal information, only a cryptographic fingerprint.

For verification:

- The stored report is retrieved
- A new hash is computed
- The system checks if it matches the blockchain hash

Matching values prove the report has never been altered.

---

## ⚖️ Legal & Ethical Considerations

- No personal data stored on-chain
- Only hashed values and non-sensitive metadata are public
- Worker identity handled internally, not via wallet
- Organization controls private keys used on-chain
- GDPR compliant through strict separation of storage layers
- AMA references used legally without reproducing copyrighted text

---

## 📁 Project Structure (Planned)

```
trustconstruct/
├── client/
├── contracts/
├── backend/
│   └── src/
│
├── docs/
├── scripts/
├── README.md
└── foundry.toml
```

---

## 👤 About the Author

Niklas Nilsson  
Construction entrepreneur with 20+ years of experience in building, site coordination, and quality documentation.  
Now transitioning into blockchain development to bring transparency, trust, and digital innovation to the construction sector.

---

## 📄 License

This project is created as part of the Degree Project at Medieinstitutet, 2025–2026.
