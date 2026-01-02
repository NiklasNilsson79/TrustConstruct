// DEV TOOLING ONLY: used during contract deployment/testing.
// Not part of the Worker/Manager approval flow.

import { useState } from 'react';
import { BrowserProvider, ContractFactory, Contract } from 'ethers';
import reportRegistryArtifact from '../artifacts/ReportRegistry.json';

type ReportRegistryArtifact = {
  abi: unknown;
  bytecode?: {
    object?: string;
  };
};

const artifact = reportRegistryArtifact as unknown as ReportRegistryArtifact;

type DeployState =
  | 'idle'
  | 'request_wallet'
  | 'deploying'
  | 'waiting'
  | 'done'
  | 'error';

export default function DeployRegistryPage() {
  const [state, setState] = useState<DeployState>('idle');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const deploy = async () => {
    setError('');
    setMessage('');
    setContractAddress('');
    setTxHash('');

    try {
      if (!window.ethereum) {
        throw new Error(
          'No injected wallet found. Open in a browser with OKX Wallet enabled.'
        );
      }

      setState('request_wallet');
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const owner = await signer.getAddress();

      const abi = artifact.abi;
      const bytecode = artifact.bytecode?.object;

      if (!Array.isArray(abi) || !bytecode) {
        throw new Error('Artifact missing abi array or bytecode.object');
      }

      if (!abi || !bytecode) {
        throw new Error('Artifact missing abi or bytecode.object');
      }

      setState('deploying');
      const factory = new ContractFactory(abi, bytecode, signer);

      // constructor(address _owner)
      const contract = await factory.deploy(owner);

      const deploymentTx = contract.deploymentTransaction();
      if (deploymentTx?.hash) setTxHash(deploymentTx.hash);

      setState('waiting');
      await contract.waitForDeployment();

      const addr = await contract.getAddress();
      setContractAddress(addr);
      setMessage('Deployed successfully.');

      setState('done');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setState('error');
    }
  };

  const registerTestHash = async () => {
    setError('');
    setMessage('');
    setTxHash('');

    try {
      if (!window.ethereum) {
        throw new Error('No injected wallet found.');
      }

      const address = import.meta.env.VITE_REPORT_REGISTRY_ADDRESS as
        | string
        | undefined;
      if (!address) {
        throw new Error('Missing VITE_REPORT_REGISTRY_ADDRESS in client env');
      }

      const abi = artifact.abi;

      if (!Array.isArray(abi)) {
        throw new Error('Artifact missing abi array');
      }

      if (!abi) {
        throw new Error('Artifact missing abi');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const registry = new Contract(address, abi, signer);

      // bytes32 test hash (valid length)
      const testHash = '0x' + '11'.repeat(32);

      setState('request_wallet');
      const tx = await registry.registerReport(testHash);
      setTxHash(tx.hash);

      setState('waiting');
      await tx.wait();

      setMessage(`Registered test hash: ${testHash}`);
      setState('done');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setState('error');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Deploy ReportRegistry (Sepolia via OKX)</h1>

      <button
        onClick={deploy}
        disabled={
          state === 'request_wallet' ||
          state === 'deploying' ||
          state === 'waiting'
        }>
        Deploy
      </button>

      <button
        onClick={registerTestHash}
        style={{ marginLeft: 12 }}
        disabled={
          state === 'request_wallet' ||
          state === 'deploying' ||
          state === 'waiting'
        }>
        Register test hash
      </button>

      <p>Status: {state}</p>

      {message && <p>{message}</p>}

      {txHash && (
        <p>
          Tx Hash: <code>{txHash}</code>
        </p>
      )}

      {contractAddress && (
        <p>
          Contract Address: <code>{contractAddress}</code>
        </p>
      )}

      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
    </div>
  );
}
