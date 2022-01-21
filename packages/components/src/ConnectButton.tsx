import { Cross2Icon } from '@radix-ui/react-icons';
import React from 'react';
import { useAddress, useChainId, useWeb3API } from 'contexts';
import { Button } from './Button';
import { SpacerHorizontal } from './Spacer';
import { HStack } from './Stack';
import { Body } from './Text';
import { ButtonVariant } from '.';
import { CHAIN_ID, getChainName } from '@openpalette/contract';

export function formatDisplayAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectionDisplay() {
  const address = useAddress();
  const chainId = useChainId();
  const { disconnect } = useWeb3API();

  if (!address) return <></>;

  return (
    <HStack background="#111" paddingHorizontal={10}>
      <Body>
        <span style={{ fontFamily: 'monospace' }}>
          {getChainName(chainId ?? CHAIN_ID.MAINNET)} |{' '}
          {formatDisplayAddress(address)}
        </span>
        <SpacerHorizontal inline size={6} />
        <Cross2Icon
          onClick={disconnect}
          style={{
            cursor: 'pointer',
            position: 'relative',
            top: '1px',
          }}
        />
      </Body>
    </HStack>
  );
}

export function ConnectButton({ variant }: { variant?: ButtonVariant }) {
  const address = useAddress();
  const { connect } = useWeb3API();

  return address ? (
    <ConnectionDisplay />
  ) : (
    <Button
      variant={variant}
      onClick={() => {
        connect();
      }}
    >
      Connect wallet
    </Button>
  );
}
