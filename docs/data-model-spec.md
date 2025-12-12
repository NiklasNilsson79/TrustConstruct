# Data Model Specification — TrustConstruct

**Version:** 1.0  
**Last updated:** 2025-12-10  
**Author:** Niklas Nilsson  
**Scope:** Sprint 1 – Backend & Blockchain Architecture

---

## 1. Purpose

This document defines the **backend data model** for the TrustConstruct application.

The goal is to establish a clear and stable schema for storing inspection reports off-chain, anchoring them on-chain, and enabling blockchain-based verification.

This specification is intended for:

- Backend developers
- Smart contract developers
- Frontend developers
- QA and architectural documentation

---

## 2. Core Concepts

| Concept              | Description                                           |
| -------------------- | ----------------------------------------------------- |
| **Report**           | A construction inspection report created by a worker. |
| **ChecklistItem**    | One checklist row with a status.                      |
| **BlockchainAnchor** | Metadata linking a report to the blockchain.          |
| **User**             | Represents a worker (write) or manager (read).        |

---

## 3. Entities

---

### 3.1 `User`

Used for authentication and role-based access.

```ts
type User = {
  _id: ObjectId;
  email: string;
  password: string; // hashed
  role: 'worker' | 'manager';
  name?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

---

### 3.2 ChecklistItem

```ts
type ChecklistItem = {
  label: string;
  status: 'ok' | 'not_ok' | 'na';
  comment?: string;
};
```

---

### 3.3 BlockchainAnchor

```ts
type BlockchainAnchor = {
  status: 'pending' | 'anchored' | 'mismatch';
  onChainHash?: string;
  localHash?: string;
  blockNumber?: number;
  anchoredBy?: string;
  anchoredAt?: Date;
  transactionHash?: string;
  lastCheckedAt?: Date;
};
```

---

### 3.4 Report

```ts
type Report = {
  _id: ObjectId;
  reportId: string;

  projectId: string;
  apartmentId: string;
  roomId: string;
  componentId: string;

  checklist: ChecklistItem[];

  comments?: string;
  photoUrls?: string[];

  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;

  blockchain: BlockchainAnchor;
};
```

---

## 4. Example JSON Payloads

### 4.1 New Report (Pending Anchoring)

```json
{
  "reportId": "RPT-005-QRST",
  "projectId": "PROJ-2024-001",
  "apartmentId": "APT-A12",
  "roomId": "ROOM-101",
  "componentId": "COMP-WALL-01",
  "checklist": [{ "label": "Surface preparation complete", "status": "ok" }],
  "comments": "Wall 2 cm off from drawings.",
  "photoUrls": ["https://example.com/photo1.jpg"],
  "createdBy": "65f1a2b3c4d5e6f789000111",
  "createdAt": "2025-12-09T14:32:00.000Z",
  "updatedAt": "2025-12-09T14:32:00.000Z",
  "blockchain": { "status": "pending" }
}
```

---

### 4.2 Anchored & Verified Report

```json
{
  "reportId": "RPT-005-QRST",
  "projectId": "PROJ-2024-001",
  "apartmentId": "APT-A12",
  "roomId": "ROOM-101",
  "componentId": "COMP-WALL-01",
  "checklist": [{ "label": "Ductwork installed", "status": "ok" }],
  "comments": "HVAC system installation complete.",
  "photoUrls": ["pic1.jpg", "pic2.jpg"],
  "createdBy": "65f1a2b3c4d5e6f789000111",
  "createdAt": "2025-12-09T14:32:00.000Z",
  "updatedAt": "2025-12-09T15:32:21.000Z",
  "blockchain": {
    "status": "anchored",
    "onChainHash": "0x1c8ebffea51eba238",
    "localHash": "0x1c8ebffea51eba238",
    "blockNumber": 18235657
  }
}
```

---

## 5. UI Verification Logic

- `pending` → Yellow panel
- `anchored` + hash match → Green panel
- `mismatch` → Red panel

---

## 6. Sprint Completion Checklist

- [x] Core entities defined
- [x] Relationships mapped
- [x] Checklist structure completed
- [x] Blockchain verification model defined
- [x] JSON examples provided
- [x] Ready for backend implementation (Sprint 2)
