import { ethers } from 'ethers';

/**
 * Minimal ABI for ReportRegistry
 * - registerReport(bytes32)
 * - isRegistered(bytes32) -> bool
 * - getRecord(bytes32) -> (submitter, timestamp, exists)
 */
const ABI = [
  'function registerReport(bytes32 reportHash)',
  'function isRegistered(bytes32 reportHash) view returns (bool)',
  'function getRecord(bytes32 reportHash) view returns (address submitter, uint256 timestamp, bool exists)',
];

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Read-only client: provider + contract connected to provider
 * Does NOT require CHAIN_PRIVATE_KEY.
 */
export function getReportRegistryReadClient() {
  const rpcUrl = requireEnv('CHAIN_RPC_URL');
  const address = requireEnv('REPORT_REGISTRY_ADDRESS');

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(address, ABI, provider);

  return { provider, contract };
}

/**
 * Write client: provider + wallet + contract connected to wallet
 * Requires CHAIN_PRIVATE_KEY.
 */
export function getReportRegistryWriteClient() {
  const rpcUrl = requireEnv('CHAIN_RPC_URL');
  const address = requireEnv('REPORT_REGISTRY_ADDRESS');
  const pk = requireEnv('CHAIN_PRIVATE_KEY');

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);
  const contract = new ethers.Contract(address, ABI, wallet);

  return { provider, wallet, contract };
}

/**
 * Backwards compatibility:
 * If other code imports getReportRegistryClient(), make it a read client by default
 * (so verify never needs a private key).
 */
export function getReportRegistryClient() {
  return getReportRegistryReadClient();
}

export async function registerReportOnChain(reportHash) {
  // Write requires CHAIN_PRIVATE_KEY
  const { contract } = getReportRegistryWriteClient();

  const tx = await contract.registerReport(reportHash);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

export async function verifyReportOnChain(reportHash) {
  // Read-only (no private key)
  const { contract } = getReportRegistryReadClient();

  const isRegistered = await contract.isRegistered(reportHash);
  if (!isRegistered) return { isRegistered: false };

  const [submitter, timestamp, exists] = await contract.getRecord(reportHash);
  return {
    isRegistered: Boolean(exists),
    submitter,
    timestamp: Number(timestamp),
  };
}
