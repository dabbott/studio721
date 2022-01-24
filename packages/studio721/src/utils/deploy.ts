import { createAddress } from '@openpalette/contract';
import { ContractFactory, Signer } from 'ethers';

export async function deployContract(
  signer: Signer,
  contractAbi: any,
  contractByteCode: any,
  constructorArguments: any[],
) {
  const factory = new ContractFactory(contractAbi, contractByteCode, signer);

  const contract = await factory.deploy(...constructorArguments);

  await contract.deployed();

  return createAddress(contract.address);
}
