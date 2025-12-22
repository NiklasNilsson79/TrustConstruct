import { ethers } from 'ethers';

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

export function getReportRegistryClient() {
  const rpcUrl = requireEnv('CHAIN_RPC_URL');
  const pk = requireEnv('CHAIN_PRIVATE_KEY');
  const address = requireEnv('REPORT_REGISTRY_ADDRESS');

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);
  const contract = new ethers.Contract(address, ABI, wallet);

  return { provider, wallet, contract };
}

export async function registerReportOnChain(reportHash) {
  const { contract } = getReportRegistryClient();

  // reportHash måste vara "0x" + 64 hex
  const tx = await contract.registerReport(reportHash);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

export async function verifyReportOnChain(reportHash) {
  const { contract } = getReportRegistryClient();

  const isRegistered = await contract.isRegistered(reportHash);
  if (!isRegistered) return { isRegistered: false };

  const [submitter, timestamp, exists] = await contract.getRecord(reportHash);
  return {
    isRegistered: Boolean(exists),
    submitter,
    timestamp: Number(timestamp),
  };
}
