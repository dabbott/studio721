import { Interface } from '@ethersproject/abi';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { Contract, Event } from '@ethersproject/contracts';
import { ChainId } from '@openpalette/contract';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import {
  Body,
  Code,
  HStack,
  OpenSeaLogoIcon,
  ScrollableStack,
  Small,
  SpacerHorizontal,
  SpacerVertical,
  VStack,
} from 'components';
import {
  FAILURE_ABORTED,
  FAILURE_NOT_LOADED,
  FAILURE_UNKNOWN,
  MintStatus,
} from 'contexts';
import { useReadOnlyContractData } from 'contract-data';
import { Button } from 'designsystem';
import { BigNumber } from 'ethers';
import { PromiseState, useFetch } from 'hooks';
import React, { ReactNode, useReducer } from 'react';
import {
  CoverAsset,
  mintStateReducer,
  MintStyleAction,
  MintStyleState,
} from 'state';
import styled, { useTheme } from 'styled-components';
import { getFirstFunctionFragment, getSignerFromProvider } from 'utils';
import { getOpenSeaUrl } from 'web3-utils';
import { BackgroundFill } from './BackgroundFill';
import {
  getMintingParameters,
  MintingCardDetails,
  MintOptions,
} from './MintingCardDetails';
import { baseURIToHTTPS, proxyURL } from '../contract/TokenPreview';

interface ContractConnection {
  abi: Interface;
  contract: Contract;
  chainId: ChainId;
}

function useTokenImageUrl({
  abi,
  contract,
  chainId,
  tokenId,
}: ContractConnection & { tokenId: number }): PromiseState<{
  name: string;
  imageUrl: string;
}> {
  const tokenURIFunction = abi.functions['tokenURI(uint256)'];
  const tokenURIResult = useReadOnlyContractData({
    fragment: tokenURIFunction,
    contract,
    chainId,
    args: [tokenId],
  });

  const proxyTokenURI =
    tokenURIResult.type === 'success'
      ? proxyURL(baseURIToHTTPS(tokenURIResult.value as string))
      : undefined;
  const tokenMetadata = useFetch<{ image?: string; name?: string }>(
    proxyTokenURI,
    'json',
  );

  if (tokenMetadata.type !== 'success') return tokenMetadata;

  return {
    type: 'success',
    value: {
      name: tokenMetadata.value.name || '',
      imageUrl: baseURIToHTTPS(tokenMetadata.value.image || ''),
    },
  };
}

function MintedTokenCard({
  abi,
  contract,
  chainId,
  tokenId,
  invert,
}: ContractConnection & { tokenId: number; invert: boolean }) {
  const metadata = useTokenImageUrl({
    abi,
    contract,
    chainId,
    tokenId,
  });

  return (
    <VStack gap={4}>
      <HStack alignItems="center">
        <Body>{metadata.type === 'success' && metadata.value.name}</Body>
        <SpacerHorizontal />
        <Button
          as="a"
          {...{
            href: getOpenSeaUrl(chainId, contract.address, tokenId),
            target: '_blank',
            rel: 'noreferrer',
          }}
        >
          <OpenSeaLogoIcon width={20} height={20} />
        </Button>
      </HStack>
      <AspectRatio.Root ratio={1}>
        <VStack position="absolute" inset="0" overflow="hidden">
          {metadata.type !== 'success' && (
            <VStack flex="1" alignItems="center" justifyContent="center">
              <Small className="flickerAnimation">Loading...</Small>
            </VStack>
          )}
          {metadata.type === 'success' && (
            <img
              alt="Token preview"
              src={metadata.value.imageUrl}
              style={{
                maxWidth: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                ...(invert && { filter: 'invert()' }),
              }}
            />
          )}
        </VStack>
      </AspectRatio.Root>
    </VStack>
  );
}

const Grid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, calc(50% - 5px)))',
  gridTemplateRows: '1fr',
  gridGap: '10px',
  flex: '1 1 0%',
});

function MintedTokenGrid({ children }: { children: ReactNode }) {
  return (
    <VStack id="container" flex="1 1 auto" position="relative">
      <VStack
        overflowY="auto"
        position="absolute"
        inset="0"
        breakpoints={{
          [800]: {
            position: 'relative',
            maxHeight: '600px',
            inset: 'initial',
          },
        }}
      >
        <Grid>{children}</Grid>
      </VStack>
    </VStack>
  );
}

async function handleMint(
  contract: Contract,
  options: MintOptions,
): Promise<MintStatus> {
  const signer = getSignerFromProvider(contract.provider);

  if (!contract || !signer) return FAILURE_NOT_LOADED;

  contract = contract.connect(signer);

  const mintFunction = getFirstFunctionFragment(contract.interface, {
    name: 'mint',
  });

  if (!mintFunction) {
    return {
      type: 'failure',
      reason: 'error',
      message: `Couldn't find compatible mint function`,
    };
  }

  const mintParameters = getMintingParameters(
    mintFunction,
    options.parameterMapping,
  );

  if (!mintParameters) {
    return {
      type: 'failure',
      reason: 'error',
      message: `This site doesn't support minting with this contract. Not all mint functions are supported.`,
    };
  }

  try {
    const count = Number(options.countInputValue);

    if (mintFunction.payable && options.price === undefined) {
      return {
        type: 'failure',
        reason: 'error',
        message: `Mint price isn't properly defined.`,
      };
    }

    const args = [
      ...mintParameters.flatMap((name) =>
        name === options.parameterMapping.count ? [count] : [],
      ),
      ...(mintFunction.payable
        ? [
            {
              value: options.price!.mul(count),
            },
          ]
        : []),
    ];

    // console.log('mint args', args, options.price.mul(count).toString());

    const transaction = await contract.mint(...args);

    const result: TransactionReceipt & { events: Event[] } =
      await transaction.wait();

    const tokenIds = result.events
      .filter((event) => event.event === 'Transfer')
      .flatMap((event) => {
        const tokenId: BigNumber | undefined = event.args?.tokenId;
        return tokenId !== undefined ? [tokenId.toNumber()] : [];
      });

    return { type: 'success', tokenIds };
  } catch (error: any) {
    console.warn(error);

    if (!('code' in error)) return FAILURE_UNKNOWN;

    if (error.code === 4001) return FAILURE_ABORTED;

    return {
      type: 'failure',
      reason: 'error',
      message: error.message,
    };
  }
}

export function MintingCard({
  editing,
  title,
  intrinsicName,
  description,
  contract,
  abi,
  background,
  invertForeground,
  coverAsset,
  contractChainId,
  dataSources,
  dispatch,
}: {
  editing: boolean;
  title?: string;
  intrinsicName: PromiseState<string>;
  description?: string;
  contract?: Contract;
  abi: Interface;
  background: string;
  invertForeground: boolean;
  coverAsset: CoverAsset;
  contractChainId: ChainId;
  dataSources: MintStyleState['dataSources'];
  dispatch: (action: MintStyleAction) => void;
}) {
  const theme = useTheme();

  const [mintingState, dispatchMintingState] = useReducer(mintStateReducer, {
    type: 'ready',
  });

  const widthNumber = Number(coverAsset.size.width);

  return (
    <VStack
      order={1}
      position="relative"
      maxWidth={
        coverAsset.size.width && !isNaN(widthNumber)
          ? Math.max(widthNumber, 800)
          : 500
      }
      borderRadius={4}
      overflow="hidden"
      padding={'30px 40px'}
      boxShadow={[
        '2.8px 2.8px 2.2px rgba(0, 0, 0, 0.02)',
        '6.7px 6.7px 5.3px rgba(0, 0, 0, 0.028)',
        '12.5px 12.5px 10px rgba(0, 0, 0, 0.035)',
        '22.3px 22.3px 17.9px rgba(0, 0, 0, 0.042)',
        '41.8px 41.8px 33.4px rgba(0, 0, 0, 0.05)',
        '100px 100px 80px rgba(0, 0, 0, 0.07)',
      ].join(', ')}
      breakpoints={{
        [600]: {
          padding: '20px',
        },
      }}
    >
      <BackgroundFill background={background} />
      <VStack gap={20} filter={invertForeground ? 'invert()' : undefined}>
        {mintingState.type === 'ready' && (
          <MintingCardDetails
            editing={editing}
            title={title}
            intrinsicName={intrinsicName}
            description={description}
            contract={contract}
            abi={abi}
            invertForeground={invertForeground}
            coverAsset={coverAsset}
            contractChainId={contractChainId}
            dataSources={dataSources}
            dispatch={dispatch}
            onClickMint={async (options) => {
              if (!contract) return;

              dispatchMintingState({ type: 'mint' });

              const status = await handleMint(contract, options);

              switch (status.type) {
                case 'success':
                  dispatchMintingState({
                    type: 'success',
                    tokenIds: status.tokenIds,
                  });
                  return;
                case 'failure':
                  if (status.reason === 'aborted') {
                    dispatchMintingState({
                      type: 'reset',
                    });
                    return;
                  }

                  dispatchMintingState({
                    type: 'failure',
                    message: status.message,
                    reason: status.reason,
                  });
                  return;
              }
            }}
          />
        )}
        {mintingState.type === 'minting' && (
          <VStack maxWidth={250}>
            <Body className="flickerAnimation">Minting...</Body>
            <SpacerVertical size={10} />
            <Small>
              After you confirm the transaction, this typically takes between 20
              seconds to 1 minute, but can take longer.
            </Small>
          </VStack>
        )}
        {mintingState.type === 'success' && (
          <VStack>
            <Body>Success!</Body>
            <SpacerVertical size={4} />
            <Small>
              You minted{' '}
              {title ||
                (intrinsicName.type === 'success'
                  ? intrinsicName.value
                  : '')}{' '}
              {mintingState.tokenIds.map((n) => `#${n}`).join(', ')}.
            </Small>
            <SpacerVertical size={4} />
            <Small>
              Note: NFTs may take 30 minutes or longer before they appear on
              marketplaces like OpenSea.
            </Small>
            <SpacerVertical size={20} />
            <VStack minWidth={250}>
              {mintingState.tokenIds.length > 1 ? (
                <AspectRatio.Root ratio={1}>
                  <VStack position="absolute" inset="0" overflow="hidden">
                    <MintedTokenGrid>
                      {contract &&
                        mintingState.tokenIds.map((id) => (
                          <MintedTokenCard
                            key={id.toString()}
                            invert={invertForeground}
                            tokenId={id}
                            abi={abi}
                            contract={contract}
                            chainId={contractChainId}
                          />
                        ))}
                    </MintedTokenGrid>
                  </VStack>
                </AspectRatio.Root>
              ) : (
                contract &&
                mintingState.tokenIds.map((id) => (
                  <MintedTokenCard
                    key={id.toString()}
                    invert={invertForeground}
                    tokenId={id}
                    abi={abi}
                    contract={contract}
                    chainId={contractChainId}
                  />
                ))
              )}
            </VStack>
          </VStack>
        )}
        {mintingState.type === 'failure' && (
          <VStack>
            <Body>Looks like there was an error.</Body>
            <SpacerVertical size={10} />
            <Small>Here's what we know:</Small>
            <SpacerVertical size={10} />
            <VStack height={200} background={theme.colors.inputBackground}>
              <ScrollableStack innerProps={{ padding: 10 }}>
                <Code>{mintingState.message}</Code>
              </ScrollableStack>
            </VStack>
            <SpacerVertical size={10} />
            <Small>Please refresh if you'd like to try again.</Small>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
