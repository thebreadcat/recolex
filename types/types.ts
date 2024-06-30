// src/types/types.ts
export type ContractFunctionArgs = {
  createItem: [string, boolean];
  mint: [bigint, bigint];
  renounceOwnership: [];
  safeBatchTransferFrom: [string, string, bigint[], bigint[], string];
  safeTransferFrom: [string, string, bigint, bigint, string];
  setApprovalForAll: [string, boolean];
  setContractURI: [string];
  setFirstMint: [string, bigint];
  setFreeFirstMint: [boolean];
  setMintPrice: [bigint];
  setTokenUri: [bigint, string];
  setUsdcToken: [string];
  togglePublicMinting: [bigint];
  transferOwnership: [string];
  withdraw: [];
};

export type ContractFunctionName = keyof ContractFunctionArgs;
