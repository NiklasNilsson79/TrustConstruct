# TrustConstruct

_A blockchain-based quality assurance system for the construction industry_

TrustConstruct is a decentralized application (dApp) that replaces traditional paper-based construction control reports with a transparent, tamper-proof blockchain solution.  
The system allows construction workers and site managers to digitally document work tasks, sign them, and store them immutably on the Ethereum Sepolia test network.

Built with React, Solidity and Foundry, TrustConstruct demonstrates how blockchain can modernize and streamline quality documentation in the construction sector.

---

## 🚧 Background & Industry Problem

With more than 20 years of experience in the Swedish construction industry, one challenge has always remained the same:

- Quality control reports are written on paper
- Stored in binders
- Scanned or archived manually
- Difficult to search
- Easy to lose or manipulate
- Lacking transparency for clients or inspectors

These reports document critical work steps — such as bathroom waterproofing, wall installation, sealing, flooring, and structural work.

TrustConstruct solves all of these problems by storing documentation on-chain, ensuring traceability, integrity and accessibility.

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

When a task is “performed according to AMA”, it means it follows a recognized, industry-approved method.

---

## 🎯 Project Purpose

The goal is to build a functional blockchain-powered prototype where users can:

- Select a project
- Choose an apartment / room / component
- Fill out a digital control report
- Reference AMA standards
- Sign and submit the report to the blockchain
- Search historical reports by location

---

## 👥 Target Audience

- Construction workers
- Site managers
- Subcontractors
- Quality inspectors
- Property developers
- Clients who demand transparency

---

## 🛠 Tech Stack

**Smart Contracts**

- Solidity
- Foundry
- OpenZeppelin
- Sepolia testnet

**Frontend**

- React (Vite)
- OKX Wallet integration
- Viem (for blockchain communication)

**Infrastructure**

- GitHub repository
- Foundry deployment scripts
- Documentation in `/docs`

---

## 📡 System Overview — How It Works

1. User connects OKX Wallet
2. Selects building → apartment → room → component
3. Fills a digital AMA-referenced control report
4. Signs the report
5. Smart contract stores metadata on-chain
6. Reports become searchable

---

## 📁 Project Structure (Planned)

```
trustconstruct/
 ├── client/
 ├── contracts/
 ├── scripts/
 ├── docs/
 ├── README.md
 └── foundry.toml
```

---

## 👤 About the Author

**Niklas Nilsson**  
Construction Entrepreneur with 20+ years of experience in building, site coordination and quality documentation.  
Now transitioning into blockchain development to bring transparency, trust and digital innovation to the construction sector.

---

## 📄 License

This project is created as part of the Degree Project at Medieinstitutet, 2025–2026.
