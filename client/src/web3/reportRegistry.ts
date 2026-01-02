import reportRegistryArtifact from '../artifacts/ReportRegistry.json';
import type { InterfaceAbi } from 'ethers';

// Exportera ABI via en enda källa
export const REPORT_REGISTRY_ABI =
  reportRegistryArtifact.abi as unknown as InterfaceAbi;
