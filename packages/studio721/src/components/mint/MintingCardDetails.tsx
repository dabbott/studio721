import { FunctionFragment, Interface } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { ChainId, CHAIN_ID, getChainName } from '@openpalette/contract';
import { Link1Icon } from '@radix-ui/react-icons';
import {
  Body,
  Checkbox,
  Divider,
  EditableTextArea,
  FormRow,
  FormSection,
  Heading1,
  HStack,
  Label,
  Small,
  SpacerHorizontal,
  VStack,
} from 'components';
import { useChainId, useWeb3API } from 'contexts';
import { priceToString, useReadOnlyContractData } from 'contract-data';
import { Button, InputField, Popover, Select, Stepper } from 'designsystem';
import { mapPromiseState, PromiseState } from 'hooks';
import React, { CSSProperties, ReactNode, useState } from 'react';
import {
  AssetType,
  CoverAsset,
  DEFAULT_FUNCTION_NAME,
  DEFAULT_PARAMETER_NAME,
  MintStyleAction,
  MintStyleState,
} from 'state';
import styled, { useTheme } from 'styled-components';
import {
  FunctionFragmentFilters,
  getAllFunctionFragments,
  getFirstFunctionFragment,
  upperFirst,
} from 'utils';
import { isMainnetOrPolygon } from 'web3-utils';

export const SimplePrimaryButton = styled.button({
  appearance: 'none',
  padding: '12px 16px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  userSelect: 'none',
  background: 'white',
});

export function getMintingParameters(
  mint: FunctionFragment,
  parameterMapping: MintStyleState['dataSources']['mint']['parameters'],
): string[] | undefined {
  const inputNames = mint.inputs.map((input) => input.name);

  const supportedInputs = inputNames.filter((name): name is string =>
    Object.values(parameterMapping).includes(name),
  );

  if (inputNames.length !== supportedInputs.length) return undefined;

  return supportedInputs;
}

export function getUnsupportedMintingParameters(
  mint: FunctionFragment,
  parameterMapping: MintStyleState['dataSources']['mint']['parameters'],
): string[] {
  const inputNames = mint.inputs.map((input) => input.name);

  const unsupportedInputs = inputNames.filter(
    (name): name is string => !Object.values(parameterMapping).includes(name),
  );

  return unsupportedInputs;
}

function useMintingData({
  contract,
  abi,
  chainId,
  dataSources,
}: {
  contract?: Contract;
  abi: Interface;
  chainId: ChainId;
  dataSources: MintStyleState['dataSources'];
}) {
  const mintFunction = getFirstFunctionFragment(abi, {
    ...fragmentFilters.mint,
    name: dataSources.mint.name,
  });
  const mintParameters = mintFunction
    ? getMintingParameters(mintFunction, dataSources.mint.parameters)
    : undefined;
  const unsupportedMintParameters = mintFunction
    ? getUnsupportedMintingParameters(mintFunction, dataSources.mint.parameters)
    : [];

  const saleIsActiveFunction = getFirstFunctionFragment(abi, {
    ...fragmentFilters.saleIsActive,
    name: dataSources.saleIsActive.name,
  });
  const saleIsActiveResult = useReadOnlyContractData<boolean>({
    fragment: saleIsActiveFunction,
    contract,
    chainId,
  });

  const maxSupplyFunction = getFirstFunctionFragment(abi, {
    ...fragmentFilters.price,
    name: dataSources.MAX_SUPPLY.name,
  });
  const maxSupplyResult = useReadOnlyContractData<BigNumber>({
    fragment: maxSupplyFunction,
    contract,
    chainId,
  });

  const totalSupplyFunction = getFirstFunctionFragment(abi, {
    ...fragmentFilters.price,
    name: dataSources.totalSupply.name,
  });

  const totalSupplyResult = useReadOnlyContractData<BigNumber>({
    fragment: totalSupplyFunction,
    contract,
    chainId,
  });

  const priceFunction = getFirstFunctionFragment(abi, {
    ...fragmentFilters.price,
    name: dataSources.price.name,
  });

  const priceResult = useReadOnlyContractData<BigNumber>({
    fragment: priceFunction,
    contract,
    chainId,
  });

  const multimintFunction = getFirstFunctionFragment(abi, {
    ...fragmentFilters.price,
    name: dataSources.MAX_MULTIMINT.name,
  });
  const multimintResult = mapPromiseState(
    useReadOnlyContractData<BigNumber>({
      fragment: multimintFunction,
      contract,
      chainId,
    }),
    (value) => value.toNumber(),
  );

  const totalSupplyNumber =
    totalSupplyResult.type === 'success' ? totalSupplyResult.value : undefined;
  const maxSupplyNumber =
    maxSupplyResult.type === 'success' ? maxSupplyResult.value : undefined;
  const remainingSupplyResult: PromiseState<BigNumber> =
    totalSupplyNumber instanceof BigNumber &&
    maxSupplyNumber instanceof BigNumber
      ? { type: 'success', value: maxSupplyNumber.sub(totalSupplyNumber) }
      : { type: 'pending' };

  return {
    saleIsActiveResult,
    maxSupplyResult,
    totalSupplyResult,
    remainingSupplyResult,
    priceResult,
    multimintResult,
    hasPrice: !!priceFunction,
    hasMaxSupply: !!maxSupplyFunction,
    hasMultiMint: !!multimintFunction,
    mintParameters,
    unsupportedMintParameters,
    mintFunction,
  };
}

function ItemMetadataRow({
  title,
  children,
  color = 'white',
  labelColor,
  labelOpacity,
}: {
  title: string;
  children: ReactNode;
  color?: string;
  labelColor?: string;
  labelOpacity?: number;
}) {
  return (
    <HStack flex="1">
      <Label color={labelColor} opacity={labelOpacity}>
        {title}
      </Label>
      <SpacerHorizontal size={10} />
      <SpacerHorizontal />
      <Label color={color}>{children}</Label>
    </HStack>
  );
}

function LinkedDataPopover({ children }: { children: ReactNode }) {
  return (
    <Popover
      width={400}
      trigger={
        <Button>
          <Link1Icon />
        </Button>
      }
    >
      <VStack padding={10} gap={10}>
        <FormSection title="Data Source">{children}</FormSection>
      </VStack>
    </Popover>
  );
}

function union<T>(array1: T[], array2: T[]): T[] {
  return [...new Set([...array1, ...array2])];
}

export type MintOptions = {
  countInputValue: string;
  price?: BigNumber;
  parameterMapping: MintStyleState['dataSources']['mint']['parameters'];
};

const fragmentFilters = {
  price: {
    inputs: 0,
    outputs: ['uint256'],
    stateMutability: 'view',
  } as FunctionFragmentFilters,
  saleIsActive: {
    inputs: 0,
    outputs: ['bool'],
    stateMutability: 'view',
  } as FunctionFragmentFilters,
  mint: {
    stateMutability: ['payable', 'nonpayable'],
  } as FunctionFragmentFilters,
};

export function MintingCardDetails({
  editing,
  title,
  intrinsicName,
  description,
  contract,
  abi,
  invertForeground,
  coverAsset,
  contractChainId,
  dataSources,
  dispatch,
  onClickMint,
}: {
  editing: boolean;
  title?: string;
  intrinsicName: PromiseState<string>;
  description?: string;
  contract?: Contract;
  abi: Interface;
  invertForeground: boolean;
  coverAsset: CoverAsset;
  contractChainId: ChainId;
  dataSources: MintStyleState['dataSources'];
  dispatch: (action: MintStyleAction) => void;
  onClickMint: (options: MintOptions) => void;
}) {
  const theme = useTheme();
  const { connect } = useWeb3API();
  const chainId = useChainId();

  const {
    saleIsActiveResult,
    maxSupplyResult,
    remainingSupplyResult,
    priceResult,
    hasPrice,
    hasMaxSupply,
    hasMultiMint,
    multimintResult,
    mintParameters,
    unsupportedMintParameters,
    mintFunction,
  } = useMintingData({
    contract,
    abi,
    chainId: contractChainId,
    dataSources,
  });

  const widthNumber = Number(coverAsset.size.width);
  const heightNumber = Number(coverAsset.size.height);

  const assetStyle: CSSProperties = {
    filter: invertForeground ? 'invert()' : undefined,
    alignSelf: 'center',
    width:
      coverAsset.size.width && !isNaN(widthNumber)
        ? `${widthNumber}px`
        : coverAsset.size.width,
    height:
      coverAsset.size.height && !isNaN(heightNumber)
        ? `${heightNumber}px`
        : coverAsset.size.height,
    maxWidth: '100%',
    // These properties cause layout problems for iframes on safari
    ...(coverAsset.type !== 'webpage' && {
      objectFit: 'cover',
      objectPosition: 'center',
    }),
  };

  const wrongNetwork = chainId && contractChainId !== chainId;

  const intrinsicNameString =
    intrinsicName.type === 'success' ? intrinsicName.value : '';

  const [mintAmount, setMintAmount] = useState('1');

  const possibleMintFunctionFragments = getAllFunctionFragments(
    abi,
    fragmentFilters.mint,
  );
  const possibleMintFunctionNames = possibleMintFunctionFragments.map(
    (fragment) => fragment.name,
  );
  const possibleMintFunctionNameOptions = union(possibleMintFunctionNames, [
    dataSources.mint.name,
    DEFAULT_FUNCTION_NAME.mint,
  ]);
  const possibleMintParameterNameOptions = mintFunction
    ? union(
        mintFunction.inputs.map((input) => input.name),
        [dataSources.mint.parameters.count, DEFAULT_PARAMETER_NAME.mint.count],
      )
    : [];

  const possiblePriceFunctionFragments = getAllFunctionFragments(
    abi,
    fragmentFilters.price,
  );
  const possiblePriceFunctionNames = possiblePriceFunctionFragments.map(
    (fragment) => fragment.name,
  );
  const priceFunctionNameOptions = union(possiblePriceFunctionNames, [
    dataSources.price.name,
    DEFAULT_FUNCTION_NAME.PRICE,
  ]);
  const totalSupplyFunctionNameOptions = union(possiblePriceFunctionNames, [
    dataSources.totalSupply.name,
    DEFAULT_FUNCTION_NAME.totalSupply,
  ]);
  const maxSupplyFunctionNameOptions = union(possiblePriceFunctionNames, [
    dataSources.MAX_SUPPLY.name,
    DEFAULT_FUNCTION_NAME.MAX_SUPPLY,
  ]);
  const maxMultimintFunctionNameOptions = union(possiblePriceFunctionNames, [
    dataSources.MAX_MULTIMINT.name,
    DEFAULT_FUNCTION_NAME.MAX_MULTIMINT,
  ]);

  const possibleSaleIsActiveFunctionFragments = getAllFunctionFragments(
    abi,
    fragmentFilters.saleIsActive,
  );
  const possibleSaleIsActiveFunctionNames =
    possibleSaleIsActiveFunctionFragments.map((fragment) => fragment.name);
  const saleIsActiveFunctionNameOptions = union(
    possibleSaleIsActiveFunctionNames,
    [DEFAULT_FUNCTION_NAME.saleIsActive, dataSources.saleIsActive.name],
  );

  return (
    <>
      <VStack gap={3}>
        {!isMainnetOrPolygon(contractChainId) && (
          <HStack
            background={theme.colors.inputBackground}
            alignSelf="flex-start"
            padding="2px 4px"
            borderRadius={4}
          >
            <Label color="white">
              This is a {getChainName(contractChainId)} testnet contract
            </Label>
          </HStack>
        )}
        <Heading1 position="relative">
          {!title && intrinsicName.type !== 'success' && !editing ? (
            <span className="flickerAnimation">Contract Loading...</span>
          ) : (
            <EditableTextArea
              editing={editing}
              value={
                editing
                  ? title !== undefined
                    ? title
                    : intrinsicNameString
                  : title || intrinsicNameString
              }
              placeholder={intrinsicNameString || 'Title'}
              onChange={(value) => {
                dispatch({ type: 'setTitle', value });
              }}
            />
          )}
        </Heading1>
        {(description || editing) && (
          <Body position="relative">
            <EditableTextArea
              editing={editing}
              placeholder="Description"
              value={description ?? ''}
              onChange={(value) => {
                dispatch({ type: 'setDescription', value });
              }}
            />
          </Body>
        )}
      </VStack>
      {(coverAsset.type !== 'none' || editing) && (
        <VStack
          gap={10}
          position="relative"
          {...(editing && {
            outline: '1px solid rgba(255,255,255,0.2)',
          })}
        >
          {coverAsset.type === 'image' && coverAsset.url && (
            <img src={coverAsset.url} style={assetStyle} alt="Token preview" />
          )}
          {coverAsset.type === 'video' && coverAsset.url && (
            <video
              src={coverAsset.url}
              loop
              controls
              preload="auto"
              style={assetStyle}
            >
              <source src={coverAsset.url} />
            </video>
          )}
          {coverAsset.type === 'webpage' && coverAsset.url && (
            <iframe
              title="Interactive token"
              src={coverAsset.url}
              style={assetStyle}
            />
          )}
          {editing && (
            <VStack gap={8} paddingVertical={2}>
              <FormRow variant="small" title="Cover Asset">
                <Select<AssetType>
                  id="input-preset"
                  value={coverAsset.type}
                  options={['none', 'image', 'video', 'webpage']}
                  getTitle={(id) => upperFirst(id)}
                  onChange={(id) => {
                    dispatch({
                      type: 'setCoverAssetType',
                      value: id,
                    });
                  }}
                />
              </FormRow>
              {coverAsset.type !== 'none' && (
                <FormRow variant="small" title="Asset URL">
                  <InputField.Root>
                    <InputField.Input
                      value={coverAsset.url}
                      placeholder={'https://...'}
                      onChange={(value) => {
                        dispatch({
                          type: 'setCoverAssetUrl',
                          value,
                        });
                      }}
                    />
                  </InputField.Root>
                </FormRow>
              )}
              {coverAsset.type !== 'none' && coverAsset.url && (
                <FormRow variant="small" title="Preferred Size">
                  <HStack flex="1" gap={8}>
                    <HStack width={70}>
                      <InputField.Root flex="1">
                        <InputField.Input
                          value={coverAsset.size.width}
                          placeholder={'500'}
                          onChange={(value) => {
                            dispatch({
                              type: 'setCoverAssetWidth',
                              value,
                            });
                          }}
                        />
                        <InputField.Label>W</InputField.Label>
                      </InputField.Root>
                    </HStack>
                    <HStack width={70}>
                      <InputField.Root flex="1">
                        <InputField.Input
                          value={coverAsset.size.height}
                          placeholder={'500'}
                          onChange={(value) => {
                            dispatch({
                              type: 'setCoverAssetHeight',
                              value,
                            });
                          }}
                        />
                        <InputField.Label>H</InputField.Label>
                      </InputField.Root>
                    </HStack>
                  </HStack>
                </FormRow>
              )}
            </VStack>
          )}
        </VStack>
      )}
      <VStack gap={4}>
        <HStack
          background={theme.colors.inputBackground}
          padding={6}
          borderRadius={4}
          display="block"
        >
          <HStack flex="1">
            {editing && (
              <>
                <LinkedDataPopover>
                  <FormRow variant="small" title="Price">
                    <Select
                      id="input-preset"
                      value={dataSources.price.name}
                      options={priceFunctionNameOptions}
                      getTitle={(name) =>
                        name === DEFAULT_FUNCTION_NAME.PRICE
                          ? `${name} (default)`
                          : name
                      }
                      onChange={(id) => {
                        dispatch({
                          type: 'setPriceFunctionName',
                          value: id,
                        });
                      }}
                    />
                  </FormRow>
                </LinkedDataPopover>
                <SpacerHorizontal size={10} />
              </>
            )}
            <ItemMetadataRow
              labelColor={theme.colors.text}
              labelOpacity={0.8}
              title="Price"
            >
              {!hasPrice ? (
                'Free'
              ) : priceResult.type === 'pending' ? (
                <span className="flickerAnimation">Loading</span>
              ) : priceResult.type === 'success' ? (
                priceToString(chainId || CHAIN_ID.MAINNET, priceResult.value)
              ) : (
                '?'
              )}
            </ItemMetadataRow>
          </HStack>
        </HStack>
        <HStack
          background={theme.colors.inputBackground}
          padding={6}
          borderRadius={4}
          display="block"
        >
          <HStack flex="1">
            {editing && (
              <>
                <LinkedDataPopover>
                  <FormRow variant="small" title="Current # minted">
                    <Select
                      id="input-preset"
                      value={dataSources.totalSupply.name}
                      options={totalSupplyFunctionNameOptions}
                      getTitle={(name) =>
                        name === DEFAULT_FUNCTION_NAME.totalSupply
                          ? `${name} (default)`
                          : name
                      }
                      onChange={(id) => {
                        dispatch({
                          type: 'setTotalSupplyFunctionName',
                          value: id,
                        });
                      }}
                    />
                  </FormRow>
                  <FormRow variant="small" title="Max possible">
                    <Select
                      id="input-preset"
                      value={dataSources.MAX_SUPPLY.name}
                      options={maxSupplyFunctionNameOptions}
                      getTitle={(name) =>
                        name === DEFAULT_FUNCTION_NAME.MAX_SUPPLY
                          ? `${name} (default)`
                          : name
                      }
                      onChange={(id) => {
                        dispatch({
                          type: 'setMaxSupplyFunctionName',
                          value: id,
                        });
                      }}
                    />
                  </FormRow>
                </LinkedDataPopover>
                <SpacerHorizontal size={10} />
              </>
            )}
            <ItemMetadataRow
              labelColor={theme.colors.text}
              labelOpacity={0.8}
              title="Remaining"
            >
              {!hasMaxSupply ? (
                'Unlimited'
              ) : remainingSupplyResult.type === 'pending' ||
                maxSupplyResult.type === 'pending' ? (
                <span className="flickerAnimation">Loading</span>
              ) : (
                <>
                  {remainingSupplyResult.type === 'success'
                    ? remainingSupplyResult.value.toString()
                    : '?'}
                  {' / '}
                  {maxSupplyResult.type === 'success'
                    ? maxSupplyResult.value.toString()
                    : '?'}
                </>
              )}
            </ItemMetadataRow>
          </HStack>
        </HStack>
      </VStack>
      <VStack gap={20}>
        {hasMultiMint && multimintResult.type === 'success' && (
          <VStack gap={4}>
            <Small textAlign="center">
              Amount to mint ({multimintResult.value} max)
            </Small>
            <Stepper
              min={1}
              max={multimintResult.value}
              inputValue={mintAmount}
              onChange={setMintAmount}
            />
          </VStack>
        )}
        <HStack>
          {editing && (
            <>
              <LinkedDataPopover>
                <FormRow variant="small" title="Mint function">
                  <Select
                    id="input-preset"
                    value={dataSources.mint.name}
                    options={possibleMintFunctionNameOptions}
                    getTitle={(name) =>
                      name === DEFAULT_FUNCTION_NAME.mint
                        ? `${name} (default)`
                        : name
                    }
                    onChange={(id) => {
                      dispatch({
                        type: 'setMintFunctionName',
                        value: id,
                      });
                    }}
                  />
                </FormRow>
                {mintFunction && (
                  <FormRow variant="small" title="Quantity" indent={1}>
                    <Select
                      id="input-preset"
                      value={dataSources.mint.parameters.count}
                      options={possibleMintParameterNameOptions}
                      getTitle={(name) =>
                        name === DEFAULT_PARAMETER_NAME.mint.count
                          ? `${name} (default)`
                          : name
                      }
                      onChange={(id) => {
                        dispatch({
                          type: 'setMintCountParameterName',
                          value: id,
                        });
                      }}
                    />
                  </FormRow>
                )}
                <Divider variant="light" />
                <FormRow variant="small" title="Sale is active">
                  <Checkbox
                    variant="dark"
                    checked={!dataSources.saleIsActive.disabled}
                    onCheckedChange={(value: boolean) => {
                      dispatch({
                        type: 'setSaleIsActiveEnabled',
                        value,
                      });
                    }}
                  />
                  <Select
                    id="input-preset"
                    value={dataSources.saleIsActive.name}
                    disabled={dataSources.saleIsActive.disabled}
                    options={saleIsActiveFunctionNameOptions}
                    getTitle={(name) =>
                      name === DEFAULT_FUNCTION_NAME.saleIsActive
                        ? `${name} (default)`
                        : name
                    }
                    onChange={(id) => {
                      dispatch({
                        type: 'setSaleIsActiveFunctionName',
                        value: id,
                      });
                    }}
                  />
                </FormRow>
                <FormRow variant="small" title="Multimint max">
                  <Select
                    id="input-preset"
                    value={dataSources.MAX_MULTIMINT.name}
                    options={maxMultimintFunctionNameOptions}
                    getTitle={(name) =>
                      name === DEFAULT_FUNCTION_NAME.MAX_MULTIMINT
                        ? `${name} (default)`
                        : name
                    }
                    onChange={(id) => {
                      dispatch({
                        type: 'setMaxMultimintFunctionName',
                        value: id,
                      });
                    }}
                  />
                </FormRow>
              </LinkedDataPopover>
              <SpacerHorizontal size={10} />
            </>
          )}
          <SimplePrimaryButton
            style={{ flex: 1 }}
            onClick={() => {
              if (!contract?.provider) {
                connect();
                return;
              }

              if (hasPrice && priceResult.type !== 'success') {
                console.warn(`Fetching price failed, can't mint`);
                return;
              }

              onClickMint({
                countInputValue: mintAmount,
                price:
                  hasPrice && priceResult.type === 'success'
                    ? priceResult.value
                    : undefined,
                parameterMapping: dataSources.mint.parameters,
              });
            }}
            disabled={
              wrongNetwork ||
              !mintParameters ||
              // If saleIsActive isn't explicitly ignored...
              (!dataSources.saleIsActive.disabled &&
                // Disable only if there's already a contract provider (a connected wallet).
                // If Http/JsonRpc providers fail, people can still connect a wallet, and we
                // can fall back to the wallet to fetch again.
                contract?.provider &&
                (saleIsActiveResult.type !== 'success' ||
                  !saleIsActiveResult.value))
            }
          >
            {!mintParameters
              ? `This contract isn't supported!`
              : !contract?.provider
              ? 'Connect wallet'
              : wrongNetwork
              ? 'Connected to wrong network!'
              : dataSources.saleIsActive.disabled
              ? 'Mint'
              : saleIsActiveResult.type === 'pending' ||
                (hasPrice && priceResult.type === 'pending')
              ? 'Loading...'
              : saleIsActiveResult.type === 'failure' ||
                (hasPrice && priceResult.type === 'failure')
              ? 'Failed to load - please reload the page'
              : saleIsActiveResult.value
              ? 'Mint'
              : 'Not Started'}
          </SimplePrimaryButton>
        </HStack>
        {!mintParameters && (
          <HStack
            background={theme.colors.inputBackground}
            alignSelf="flex-start"
            padding="2px 4px"
            borderRadius={4}
          >
            <Label color="white">
              Unsupported mint parameters:{' '}
              {unsupportedMintParameters.join(', ')}
            </Label>
          </HStack>
        )}
      </VStack>
    </>
  );
}
