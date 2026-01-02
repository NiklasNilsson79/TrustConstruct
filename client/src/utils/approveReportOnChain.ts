import { ethers } from 'ethers';
import type { Eip1193Provider } from 'ethers';

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

const REGISTRY_ADDRESS_RAW = import.meta.env.VITE_REPORT_REGISTRY_ADDRESS;

function getRegistryAddress(): string {
  try {
    return ethers.getAddress(REGISTRY_ADDRESS_RAW);
  } catch (e) {
    console.error('Invalid REPORT_REGISTRY_ADDRESS:', REGISTRY_ADDRESS_RAW, e);
    throw new Error(
      'Invalid ReportRegistry address (check env/address string).'
    );
  }
}

const ReportRegistryAbi = ['function registerReport(bytes32 reportHash)'];

function toBytes32(hash: string): string {
  if (!hash) throw new Error('Missing reportHash');
  const with0x = hash.startsWith('0x') ? hash : `0x${hash}`;
  if (with0x.length !== 66) {
    throw new Error(
      `reportHash must be 32 bytes (66 chars with 0x). Got length ${with0x.length}`
    );
  }
  return with0x;
}

async function ensureSepolia(provider: ethers.BrowserProvider) {
  const network = await provider.getNetwork();
  if (Number(network.chainId) === SEPOLIA_CHAIN_ID) return;

  await provider.send('wallet_switchEthereumChain', [
    { chainId: SEPOLIA_CHAIN_ID_HEX },
  ]);
}

export async function approveReportOnChain(
  reportHash: string
): Promise<{ txHash: string; blockNumber: number }> {
  const ethereum = (window as unknown as { ethereum?: Eip1193Provider })
    .ethereum;
  if (!ethereum) throw new Error('No injected wallet found (OKX).');

  const provider = new ethers.BrowserProvider(ethereum);

  // triggers OKX connect popup
  await provider.send('eth_requestAccounts', []);

  // ensure Sepolia
  await ensureSepolia(provider);

  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    getRegistryAddress(),
    ReportRegistryAbi,
    signer
  );

  const hashBytes32 = toBytes32(reportHash);

  // triggers OKX signing popup
  const tx = await contract.registerReport(hashBytes32);

  const receipt = await tx.wait();

  return {
    txHash: tx.hash as string,
    blockNumber: Number(receipt.blockNumber),
  };
}
