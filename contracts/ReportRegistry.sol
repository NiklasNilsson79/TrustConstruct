// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ReportRegistry
/// @notice Stores a deterministic report hash on-chain as immutable proof-of-existence.
contract ReportRegistry {
    error ZeroHash();
    error AlreadyRegistered(bytes32 reportHash);
    error NotOwner();

    event ReportRegistered(bytes32 indexed reportHash, address indexed submitter, uint256 timestamp);

    address public immutable owner;

    struct Record {
        address submitter;
        uint64 timestamp; // fits until year ~2554
        bool exists;
    }

    mapping(bytes32 => Record) private records;

    constructor(address _owner) {
        owner = _owner == address(0) ? msg.sender : _owner;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    /// @notice Register a report hash as proof-of-existence.
    /// @dev Reverts if already registered.
    function registerReport(bytes32 reportHash) external onlyOwner {
        if (reportHash == bytes32(0)) revert ZeroHash();
        if (records[reportHash].exists) revert AlreadyRegistered(reportHash);

        records[reportHash] = Record({
            submitter: msg.sender,
            timestamp: uint64(block.timestamp),
            exists: true
        });

        emit ReportRegistered(reportHash, msg.sender, block.timestamp);
    }

    function isRegistered(bytes32 reportHash) external view returns (bool) {
        return records[reportHash].exists;
    }

    function getRecord(bytes32 reportHash)
        external
        view
        returns (address submitter, uint256 timestamp, bool exists)
    {
        Record memory r = records[reportHash];
        return (r.submitter, r.timestamp, r.exists);
    }

    function getTimestamp(bytes32 reportHash) external view returns (uint256) {
        return records[reportHash].timestamp;
    }
}
