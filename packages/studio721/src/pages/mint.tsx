import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import { getLuminance } from '@openpalette/color';
import { CHAIN_ID } from '@openpalette/contract';
import {
  CheckIcon,
  ExternalLinkIcon,
  Pencil1Icon,
} from '@radix-ui/react-icons';
import {
  Blockquote,
  Body,
  ConnectionDisplay,
  Divider,
  FormRow,
  Heading2,
  Heading3,
  HStack,
  Small,
  SpacerHorizontal,
  SpacerVertical,
  VStack,
} from 'components';
import { useAddress, useChainId, useWeb3API, useWeb3Data } from 'contexts';
import { useReadOnlyContractData } from 'contract-data';
import { parseCSSColor } from 'csscolorparser-ts';
import { Button, InputField } from 'designsystem';
import { useFetch } from 'hooks';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialMintStyle,
  mintStyleReducer,
  MintStyleState,
} from 'state';
import { getEtherActorBaseURL, getEtherscanAddressUrl } from 'web3-utils';
import delegatedAbi from '../assets/slim-gwei-abi.json';
import { BackgroundFill } from '../components/mint/BackgroundFill';
import { ColorPicker } from '../components/mint/ColorPicker';
import { MintingCard } from '../components/mint/MintingCard';
import { SimplePrimaryButton } from '../components/mint/MintingCardDetails';
import {
  decodeConfigParameter,
  useUrlConfigReducer,
} from '../hooks/useUrlConfigReducer';

interface ServerProps {
  isAddressLocked: boolean;
  isCreatorLocked: boolean;
  abi: any;
}

// If this is a delegated contract, we need to add in the delegated
// ABI to be able to call those functions. This primitive check for
// `implementation` could be improved, but is probably fine for now
//
// Currently it seems ether.actor doesn't support calling the delegated
// functions, so this will only work if there's a connected wallet
function addDelegatedImplementation(abi: any) {
  const isDelegatedContract = abi.find(
    (item: any) => item.name === 'implementation',
  );

  return isDelegatedContract ? [...abi, ...delegatedAbi] : abi;
}

export default function Mint({
  isAddressLocked,
  isCreatorLocked,
  abi: serverAbi,
}: ServerProps) {
  const { connect } = useWeb3API();
  const address = useAddress();
  const provider = useWeb3Data()?.provider;
  const chainId = useChainId() ?? CHAIN_ID.MAINNET;

  const [style, dispatch] = useUrlConfigReducer({
    reducer: mintStyleReducer,
    createInitialState: createInitialMintStyle,
  });

  const [showStyleEditor, setShowStyleEditor] = useState(false);

  const etherActorAbi = useFetch<{ abi: any }>(
    style.contractAddress
      ? `${getEtherActorBaseURL(style.chainId || chainId)}/${
          style.contractAddress
        }.json`
      : undefined,
  );

  useEffect(() => {
    if (!serverAbi && etherActorAbi.type !== 'success') return;

    // If there's already a chainId, don't overwrite
    if (style.chainId) return;

    // Note that this also updates the url in the case where we have a serverAbi
    // but no style.chainId. It will default to mainnet.
    dispatch({ type: 'setChainId', value: chainId });
  }, [serverAbi, etherActorAbi, style.chainId, chainId, dispatch]);

  useEffect(() => {
    if (isCreatorLocked || !address) return;

    dispatch({ type: 'setCreatorAddress', value: address });
  }, [isCreatorLocked, address, dispatch]);

  const abi = useMemo(() => {
    if (serverAbi) {
      return new Interface(addDelegatedImplementation(serverAbi));
    }

    if (etherActorAbi.type !== 'success') return;

    return new Interface(addDelegatedImplementation(etherActorAbi.value.abi));
  }, [etherActorAbi, serverAbi]);

  const contract = useMemo(() => {
    if (!abi) return;

    return new Contract(style.contractAddress, abi, provider);
  }, [style.contractAddress, abi, provider]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const parsedBackground = parseCSSColor(style.background);
  const parsedCardBackground = parseCSSColor(style.cardBackground);
  const actualBackground =
    parsedCardBackground && parsedCardBackground[3] > 0
      ? parsedCardBackground
      : parsedBackground;
  const invertForeground = actualBackground
    ? getLuminance({
        r: actualBackground[0] / 255,
        g: actualBackground[1] / 255,
        b: actualBackground[2] / 255,
      }) > 0.5
    : false;

  const nameFunction = abi ? abi.functions['name()'] : undefined;
  const nameResult = useReadOnlyContractData<string>({
    fragment: nameFunction,
    contract,
    chainId: style.chainId,
  });

  // TODO: When abi is fetched and we know contract address is OK, put
  // chainname in config and use that to fetch from server. Show error if
  // user's wallet is connected to the wrong network

  return (
    <VStack flex={'1 1 auto'} position="relative">
      {!abi && <BackgroundFill background={style.background} />}
      {!serverAbi && etherActorAbi.type !== 'success' && (
        <VStack flex="1" alignItems="center" justifyContent="center">
          <VStack width={450} gap={20}>
            <VStack>
              <Heading2 textAlign="center">Contract Address</Heading2>
              <SpacerVertical size={20} />
              <HStack>
                <InputField.Root id="input-contract-address" flex="1">
                  <InputField.Input
                    ref={inputRef}
                    disabled={isAddressLocked}
                    value={style.contractAddress}
                    placeholder={'Enter Contract Address'}
                    type="text"
                    style={{
                      textAlign: 'center',
                      padding: '8px 8px',
                      fontSize: '16px',
                      fontFamily: 'monospace',
                    }}
                    onChange={(value) => {
                      dispatch({ type: 'setContractAddress', value });
                    }}
                  />
                </InputField.Root>
              </HStack>
              <SpacerVertical size={10} />
              {style.contractAddress && etherActorAbi.type === 'pending' && (
                <>
                  <Body
                    textAlign="center"
                    fontFamily="monospace"
                    className="flickerAnimation"
                  >
                    Loading...
                  </Body>
                </>
              )}
              {etherActorAbi.type === 'failure' && (
                <>
                  <Body textAlign="center" color="red" fontFamily="monospace">
                    {etherActorAbi.value.message}
                  </Body>
                  {!provider && (
                    <>
                      <SpacerVertical size={10} />
                      <Blockquote>
                        If this contract is on a network other than Ethereum
                        mainnet, please connect your wallet first.
                      </Blockquote>
                    </>
                  )}
                </>
              )}
            </VStack>
            <Divider variant="light" />
            <VStack>
              <HStack alignItems="center">
                <Heading3>Connected Wallet</Heading3>
                <SpacerHorizontal />
                {provider ? (
                  <ConnectionDisplay />
                ) : (
                  <SimplePrimaryButton onClick={connect}>
                    Connect wallet
                  </SimplePrimaryButton>
                )}
              </HStack>
            </VStack>
          </VStack>
        </VStack>
      )}
      {abi && style.chainId && (
        <HStack flex="1 1 auto" position="relative">
          <BackgroundFill background={style.background} />
          <VStack
            flex="2"
            padding={40}
            alignItems="center"
            justifyContent="center"
            position="relative"
            breakpoints={{
              [600]: {
                padding: 20,
              },
            }}
          >
            <VStack position="relative" gap={20}>
              <MintingCard
                dispatch={dispatch}
                editing={showStyleEditor}
                intrinsicName={nameResult}
                title={style.title}
                description={style.description || undefined}
                abi={abi}
                contract={contract}
                background={style.cardBackground}
                invertForeground={invertForeground}
                coverAsset={style.coverAsset}
                contractChainId={style.chainId}
                dataSources={style.dataSources}
              />
              {(!isAddressLocked || style.creatorAddress === address) && (
                <VStack
                  position="absolute"
                  left={'calc(100% + 20px)'}
                  top={0}
                  alignItems="flex-start"
                  gap={20}
                  breakpoints={{
                    [800]: {
                      position: 'unset',
                    },
                  }}
                >
                  <HStack background="#222" borderRadius={4}>
                    <Button
                      onClick={() => setShowStyleEditor(!showStyleEditor)}
                    >
                      {showStyleEditor ? <CheckIcon /> : <Pencil1Icon />}
                      <SpacerHorizontal size={8} inline />
                      {showStyleEditor ? 'Confirm' : 'Edit'}
                    </Button>
                  </HStack>
                  {showStyleEditor && (
                    <VStack
                      minWidth={300}
                      gap={8}
                      background="#222"
                      borderRadius={4}
                      padding="4px 6px"
                    >
                      <FormRow
                        variant="small"
                        title="Background"
                        tooltip={
                          <VStack gap={20}>
                            <Small>
                              This field supports any CSS background value. You
                              can use solid colors, gradients, images, multiple
                              backgrounds, and more.
                            </Small>
                            <Small>
                              Example gradient:{' '}
                              <code
                                style={{
                                  background: '#222',
                                  padding: '2px 4px',
                                  borderRadius: '2px',
                                }}
                              >
                                linear-gradient(pink, black)
                              </code>
                            </Small>
                            <Small>
                              Example Image:{' '}
                              <code
                                style={{
                                  background: '#222',
                                  padding: '2px 4px',
                                  borderRadius: '2px',
                                }}
                              >
                                center/cover
                                url("https://picsum.photos/id/237/500/500")
                              </code>
                            </Small>
                          </VStack>
                        }
                      >
                        <HStack flex="1" gap={6}>
                          <ColorPicker
                            color={style.background}
                            onChange={(value) => {
                              dispatch({ type: 'setBackground', value });
                            }}
                          />
                          <InputField.Root>
                            <InputField.Input
                              value={style.background}
                              onChange={(value) => {
                                dispatch({ type: 'setBackground', value });
                              }}
                            />
                          </InputField.Root>
                        </HStack>
                      </FormRow>
                      <FormRow variant="small" title="Card Color">
                        <HStack flex="1" gap={6}>
                          <ColorPicker
                            color={style.cardBackground}
                            onChange={(value) => {
                              dispatch({ type: 'setCardBackground', value });
                            }}
                          />
                          <InputField.Root>
                            <InputField.Input
                              value={style.cardBackground}
                              onChange={(value) => {
                                dispatch({
                                  type: 'setCardBackground',
                                  value,
                                });
                              }}
                            />
                          </InputField.Root>
                        </HStack>
                      </FormRow>
                    </VStack>
                  )}
                  {showStyleEditor && (
                    <VStack
                      minWidth={300}
                      gap={8}
                      background="#222"
                      borderRadius={4}
                      padding="4px 6px"
                      alignSelf="start"
                    >
                      <Heading3>How it works</Heading3>
                      <Small>
                        The configuration for this page is stored in your
                        browser's URL (address bar). When you're done editing,
                        you can share the URL and collectors can mint with it.
                      </Small>
                      <Small>
                        We recommend using a URL shortener like{' '}
                        <a
                          href="https://bitly.com/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          bitly →
                        </a>
                        , both so the URL looks nicer, and so you can make
                        updates to it after sharing.
                      </Small>
                      <Small>
                        You can edit your page if you connect with the same
                        wallet. If you make edits, you'll need to re-share the
                        new URL and/or update any shortened URL links.
                      </Small>
                    </VStack>
                  )}
                </VStack>
              )}
            </VStack>
          </VStack>
        </HStack>
      )}
      {abi && (
        <HStack
          position="relative"
          padding={'20px 40px'}
          gap={20}
          breakpoints={{
            [1000]: {
              flexDirection: 'column',
              padding: '20px',
              order: 0,
            },
          }}
        >
          <BackgroundFill
            background={style.cardBackground || style.background}
          />
          <HStack
            flex="1"
            alignItems="center"
            gap={20}
            filter={invertForeground ? 'invert()' : undefined}
          >
            <Heading3>NFT Contract Address</Heading3>
            <HStack alignSelf="stretch" gap={10} flex="1" maxWidth={470}>
              <InputField.Root id="input-multi-mint" flex="1">
                <InputField.Input
                  value={style.contractAddress}
                  // disabled
                  type="text"
                  style={{
                    textAlign: 'center',
                    padding: '8px 8px',
                    fontSize: '16px',
                    fontFamily: 'monospace',
                  }}
                  onChange={(value) => {}}
                />
              </InputField.Root>
              <Button
                as="a"
                {...{
                  href: getEtherscanAddressUrl(chainId, style.contractAddress),
                  target: '_blank',
                  rel: 'noreferrer',
                }}
              >
                <ExternalLinkIcon />
              </Button>
            </HStack>
          </HStack>
          {address && (
            <HStack
              alignItems="center"
              gap={20}
              filter={invertForeground ? 'invert()' : undefined}
            >
              <Heading3>Wallet</Heading3>
              <ConnectionDisplay />
            </HStack>
          )}
        </HStack>
      )}
    </VStack>
  );
}

export async function getServerSideProps(
  context: any,
): Promise<{ props: ServerProps }> {
  const parsedConfig: Partial<MintStyleState> = decodeConfigParameter(
    context.query.config,
  );

  let abi: any;

  try {
    if (parsedConfig.contractAddress) {
      const response = await fetch(
        `${getEtherActorBaseURL(parsedConfig.chainId ?? CHAIN_ID.MAINNET)}/${
          parsedConfig.contractAddress
        }.json`,
      );
      const data = await response.json();
      abi = data.abi;
    }
  } catch {
    //
  }

  return {
    props: {
      isAddressLocked: !!parsedConfig.contractAddress,
      isCreatorLocked: !!parsedConfig.creatorAddress,
      ...(abi && { abi }),
    },
  };
}
