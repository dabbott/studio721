import { FunctionFragment } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { parseEther } from '@ethersproject/units';
import { ChainId, CHAIN_ID } from '@openpalette/contract';
import { formatDisplayAddress } from 'components';
import { FunctionOutput } from './types';

export function getCurrencySymbol(chainId: ChainId) {
  switch (chainId) {
    case CHAIN_ID.POLYGON:
    case CHAIN_ID.MUMBAI:
      return `MATIC`;
    default:
      return `Ξ`;
  }
}

export function priceToString(chainId: ChainId, value: BigNumber) {
  const minimumValue = parseEther('0.001');

  // A large value is probably ether
  if (value.gte(minimumValue)) {
    return (
      value.div(minimumValue).toNumber() / 1000 +
      ' ' +
      getCurrencySymbol(chainId)
    );
  }

  return value.toString();
}

export function functionOutputToString(
  chainId: ChainId,
  fragment: FunctionFragment,
  output: FunctionOutput,
): string {
  if (fragment.outputs && fragment.outputs.length > 0) {
    const outputType = fragment.outputs[0].type;

    switch (outputType) {
      case 'address':
        return formatDisplayAddress(output.toString());
    }
  }

  if (BigNumber.isBigNumber(output)) {
    return priceToString(chainId, output);
  }

  return output.toString();
}
