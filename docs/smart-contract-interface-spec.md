# Smart Contract Interface Specification — TrustConstruct

**Version:** 1.0  
**Last updated:** 2025-12-10  
**Author:** Niklas Nilsson  
**Scope:** Sprint 1 – Smart Contract Architecture

---

## 1. Purpose

This document defines the **smart contract interface** for the TrustConstruct blockchain layer.

The contract does **not** store full inspection reports.  
Only **hashed values and essential metadata** are anchored on-chain.

This ensures:

- Tamper detection
- Proof-of-existence
- Integrity verification
- Low gas usage

---

## 2. Contract Responsibilities

The TrustConstruct smart contract must:

1. Accept a submitted hash of an off‑chain report
2. Store report metadata (project, component, timestamp, sender)
3. Allow managers to look up the on‑chain hash
4. Enable the system to verify whether the off‑chain report matches on‑chain data
5. Emit events so backend & frontend can react in real time

---

## 3. Data Structures

### 3.1 `ReportRecord`

```solidity
struct ReportRecord {
    bytes32 reportHash;
    string projectId;
    string componentId;
    uint256 timestamp;
    address anchoredBy;
}
```

---

## 4. Storage Layout

```solidity
mapping(string => ReportRecord) private reports;
```

- Key: `reportId`
- Value: `ReportRecord` struct

---

## 5. Events

```solidity
event ReportAnchored(
    string indexed reportId,
    bytes32 indexed reportHash,
    string projectId,
    string componentId,
    address indexed anchoredBy,
    uint256 timestamp
);
```

Purpose:

- Emitted whenever a new report is anchored
- Used for backend listeners and UI notifications

---

## 6. Errors

```solidity
error ReportAlreadyAnchored(string reportId);
error InvalidReportId();
error EmptyHash();
```

---

## 7. Public Functions

### 7.1 `anchorReport`

Anchors a report hash on-chain.

```solidity
function anchorReport(
    string memory reportId,
    bytes32 reportHash,
    string memory projectId,
    string memory componentId
) public;
```

#### Requirements:

- `reportId` must not be empty
- `reportHash` must not be empty
- Report must not already be anchored

#### Effects:

- Stores a new `ReportRecord`
- Emits `ReportAnchored` event

---

### 7.2 `getReport`

Fetches on-chain metadata for a report.

```solidity
function getReport(string memory reportId)
    public
    view
    returns (ReportRecord memory);
```

Use case:

- Backend compares `reportHash` with a newly computed hash
- UI verification panel displays status

---

### 7.3 `verifyReport`

Compares an externally computed hash with the on-chain hash.

```solidity
function verifyReport(string memory reportId, bytes32 externalHash)
    public
    view
    returns (bool);
```

Returns:

- `true` if hashes match
- `false` otherwise

Used by:

- Backend verification
- Manager “Read Report” page

---

## 8. Example Interaction Flow

### Step 1 — Backend computes hash of report JSON

### Step 2 — Backend calls `anchorReport`

### Step 3 — Smart contract emits event

### Step 4 — Manager loads report → backend fetches on-chain hash

### Step 5 — Backend recomputes local hash

### Step 6 — Backend calls `verifyReport`

### Step 7 — UI shows green/yellow/red panel

---

## 9. Security Considerations

- Contract uses `bytes32` hashes only — no sensitive data on-chain
- No ownership required; anchoring is permissionless
- Metadata strings must not contain PII
- Gas cost minimized by avoiding arrays or large strings

---

## 10. Sprint Completion Checklist

- [x] Struct defined
- [x] Storage mapping defined
- [x] Events defined
- [x] Errors defined
- [x] Function signatures defined
- [x] Verification flow established
- [x] Ready for implementation in Sprint 2

---

**End of File**
