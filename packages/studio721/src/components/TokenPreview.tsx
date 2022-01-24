import { CHAIN_ID } from '@openpalette/contract';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import {
  Blockquote,
  Checkbox,
  Code,
  CodeHighlight,
  HStack,
  LinkChip,
  Small,
  SpacerVertical,
  VStack,
} from 'components';
import { useChainId } from 'contexts';
import { InputField, TextArea } from 'designsystem';
import { useFetch } from 'hooks';
import React, { memo, useCallback, useState } from 'react';
import { generateURI, parseURITemplate } from 'solidity-codegen';
import { Action, ContractConfigState } from 'state';
import { encodeQueryParameters } from 'utils';
import { getCurrencySymbol } from 'contract-data';
import { FormRow, FormRowError, InfoHoverCard } from 'components';

interface Props {
  config: ContractConfigState;
  disabled: boolean;
  dispatch: (action: Action) => void;
}

export function baseURIToHTTPS(baseURI: string) {
  if (baseURI.startsWith('ipfs://')) {
    return baseURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }

  return baseURI;
}

export function proxyURL(url: string) {
  return `/api/proxy?${encodeQueryParameters({ url })}`;
}

export const TokenPreview = memo(function TokenPreview({
  dispatch,
  config,
  disabled,
}: Props) {
  const [tokenPreviewId, setTokenPreviewId] = useState(0);
  const parsedURI = parseURITemplate(config.tokenURI);
  const tokenURI =
    generateURI(config.tokenURI, tokenPreviewId, config.tokenParameters) ?? '';
  const httpsTokenURI = baseURIToHTTPS(tokenURI);
  const proxyTokenURI = proxyURL(httpsTokenURI);
  const tokenMetadata = useFetch<{ image?: string }>(proxyTokenURI, 'json');
  const tokenImageUrl =
    tokenMetadata.type === 'success' && tokenMetadata.value.image;
  const chainId = useChainId();

  return (
    <HStack
      background="linear-gradient(to bottom right, #6A78FD, #8163FF)"
      justifyContent="center"
      padding={20}
      margin={'0 -40px'}
    >
      <VStack
        background={'#222'}
        padding={20}
        gap={8}
        boxShadow={[
          '1.3px 1.6px 2.2px rgba(0, 0, 0, 0.031)',
          '3.2px 3.9px 5.3px rgba(0, 0, 0, 0.044)',
          '6px 7.3px 10px rgba(0, 0, 0, 0.055)',
          '10.7px 13px 17.9px rgba(0, 0, 0, 0.066)',
          '20.1px 24.2px 33.4px rgba(0, 0, 0, 0.079)',
          '48px 58px 80px rgba(0, 0, 0, 0.11)',
        ].join(', ')}
      >
        <VStack alignItems="center" background="black">
          <VStack width={300}>
            <AspectRatio.Root ratio={1}>
              <VStack
                width={'100%'}
                height={'100%'}
                padding={10}
                background={[
                  'black',
                  ...(tokenImageUrl
                    ? [`center / cover url("${baseURIToHTTPS(tokenImageUrl)}")`]
                    : []),
                ].join(' ')}
                alignItems="flex-start"
              >
                <HStack
                  gap={8}
                  background="#222"
                  alignItems="center"
                  padding="4px 8px"
                >
                  <Small flex="0 0 auto">Preview of Token</Small>
                  <HStack width="60px" opacity={0.8}>
                    <InputField.Root
                      id="input-token-preview-id"
                      size={60}
                      flex="0 0 60px"
                    >
                      <InputField.NumberInput
                        value={tokenPreviewId}
                        onNudge={useCallback((value) => {
                          setTokenPreviewId((x) => x + value);
                        }, [])}
                        onChange={useCallback((value) => {
                          const numberValue = Number(value);

                          if (!Number.isInteger(numberValue)) return;

                          setTokenPreviewId(numberValue);
                        }, [])}
                      />
                    </InputField.Root>
                  </HStack>
                  <InfoHoverCard top="0">
                    <VStack gap={8}>
                      <Small>Token URI</Small>
                      <VStack background="black" padding={8}>
                        <Code>{tokenURI}</Code>
                      </VStack>
                      {tokenURI !== httpsTokenURI && (
                        <>
                          <Small>HTTPS URI</Small>
                          <VStack background="black" padding={8}>
                            <Code>{httpsTokenURI}</Code>
                          </VStack>
                        </>
                      )}
                      {tokenMetadata.type === 'success' && (
                        <>
                          <Small>The metadata for this token:</Small>
                          <VStack
                            overflowY="auto"
                            background="black"
                            padding={8}
                          >
                            <VStack flex="1 1 0px" maxHeight="300px">
                              <CodeHighlight
                                code={JSON.stringify(
                                  tokenMetadata.value,
                                  null,
                                  2,
                                )}
                                language="json"
                              />
                            </VStack>
                          </VStack>
                        </>
                      )}
                      {tokenMetadata.type === 'pending' && (
                        <>
                          <Small className="flickerAnimation">
                            Fetching metadata...
                          </Small>
                        </>
                      )}
                      {tokenMetadata.type === 'failure' && (
                        <>
                          <Small>Failed to fetch metadata...</Small>
                          <VStack padding={8} background="black">
                            <Code>{tokenMetadata.value.message}</Code>
                          </VStack>
                        </>
                      )}
                    </VStack>
                  </InfoHoverCard>
                </HStack>
              </VStack>
            </AspectRatio.Root>
          </VStack>
        </VStack>
        <FormRow
          title="Name"
          variant="small"
          tooltip={
            <>
              The name of the{' '}
              <LinkChip
                openInNewTab
                href="https://docs.openzeppelin.com/contracts/2.x/api/token/erc721"
              >
                ERC 721
              </LinkChip>{' '}
              non-fungible token (NFT). This also becomes the name of the smart
              contract. The name will be detected automatically by some
              marketplaces like OpenSea.
            </>
          }
        >
          <InputField.Root id="input-token-name">
            <InputField.Input
              disabled={disabled}
              value={config.tokenName}
              onChange={useCallback(
                (value) => {
                  dispatch({ type: 'setTokenName', value });
                },
                [dispatch],
              )}
            />
          </InputField.Root>
        </FormRow>
        <FormRow
          title="Abbreviation"
          variant="small"
          tooltip={
            <>
              A short, usually 3-4 letter abbreviation for the{' '}
              <LinkChip
                href="https://docs.openzeppelin.com/contracts/2.x/api/token/erc721"
                openInNewTab
              >
                ERC 721
              </LinkChip>{' '}
              token. This typically isn{"'"}t used for much with NFTs, though it
              sometimes appears on e.g. rarity tracking tools.
            </>
          }
        >
          <InputField.Root id="input-short-name">
            <InputField.Input
              disabled={disabled}
              value={config.shortName}
              onChange={(value) => {
                dispatch({ type: 'setShortName', value });
              }}
            />
          </InputField.Root>
        </FormRow>
        <FormRow
          title="Supply"
          variant="small"
          tooltip={
            <>
              The total quantity of NFTs that can be minted.
              <SpacerVertical size={20} />
              If you don't want to limit the quantity that can be minted,
              uncheck this option.
            </>
          }
        >
          <Checkbox
            variant="dark"
            disabled={disabled}
            checked={config.supply !== null}
            onCheckedChange={(value: boolean) => {
              dispatch({
                type: 'setSupply',
                value: value ? 2000 : null,
              });
            }}
          />
          <InputField.Root id="input-supply">
            <InputField.NumberInput
              disabled={disabled || config.supply === null}
              value={config.supply ?? undefined}
              placeholder={'Unlimited'}
              onSubmit={(value) => {
                const numberValue = Number(value);

                if (!Number.isInteger(numberValue) && numberValue > 0) return;

                dispatch({ type: 'setSupply', value: numberValue });
              }}
            />
          </InputField.Root>
        </FormRow>
        <FormRow title="Price" variant="small">
          <Checkbox
            variant="dark"
            disabled={disabled}
            checked={config.price !== undefined}
            onCheckedChange={(value: boolean) => {
              dispatch({
                type: 'setPrice',
                value: value ? '0.02' : undefined,
              });
            }}
          />
          <InputField.Root id="input-price">
            <InputField.NumberInput
              disabled={disabled || config.price === undefined}
              value={Number(config.price ?? '0')}
              onSubmit={(value) => {
                dispatch({ type: 'setPrice', value: value.toString() });
              }}
            />
            <InputField.Label>
              {getCurrencySymbol(chainId || CHAIN_ID.MAINNET)}
            </InputField.Label>
          </InputField.Root>
        </FormRow>
        <FormRow
          title="Royalties"
          variant="small"
          tooltip={
            <>
              A percentage of each sale paid back to this NFT contract. Call the{' '}
              <code>withdraw()</code> function to transfer funds from this
              contract to the payout addresses you configure below.
              <SpacerVertical size={20} />
              Note: it's currently the responsibility of the marketplace (e.g.
              OpenSea) to honor the number set here.
            </>
          }
        >
          <Checkbox
            variant="dark"
            disabled={disabled}
            checked={config.royaltyBps !== undefined}
            onCheckedChange={(value: boolean) => {
              dispatch({
                type: 'setRoyaltyBps',
                value: value ? '10' : undefined,
              });
            }}
          />
          <InputField.Root id="input-royalties" labelSize={12}>
            <InputField.NumberInput
              disabled={disabled || config.royaltyBps === undefined}
              value={Number(config.royaltyBps ?? '0')}
              onSubmit={(value) => {
                dispatch({ type: 'setRoyaltyBps', value: value.toString() });
              }}
            />
            <InputField.Label>%</InputField.Label>
          </InputField.Root>
        </FormRow>
        <FormRow
          title="Token URI"
          variant="small"
          tooltip={
            <>
              The URI of the metadata for each token.
              <SpacerVertical size={20} />
              The <Code>{`{tokenId}`}</Code> variable will be replaced with the
              current token ID. As an example,{' '}
              <Code>https://www.721.so/api/example/metadata/{`{tokenId}`}</Code>{' '}
              becomes{' '}
              <LinkChip
                openInNewTab
                href="https://www.721.so/api/example/metadata/0"
              >
                https://www.721.so/api/example/metadata/0
              </LinkChip>
              <SpacerVertical size={20} />
              If you choose to add parameters to your NFT, you can use the{' '}
              <Code>{`{parameters}`}</Code> variable to add them in a query
              string.
              <SpacerVertical size={20} />
              The part of the URI before any bracket variables can be changed
              after deploying the contract by calling <code>setBaseURI</code>.
              <SpacerVertical size={20} />
              The metadata should be a JSON object as documented here on
              OpenSea:{' '}
              <LinkChip
                openInNewTab
                href="https://docs.opensea.io/docs/metadata-standards#metadata-structure"
              >
                Metadata structure
              </LinkChip>
              <SpacerVertical size={20} />
              <Blockquote style={{ fontSize: 'inherit' }}>
                Studio 721 doesn{"'"}t host your assets or metadata - you can
                host it anywhere you like.{' '}
                <LinkChip href="https://ipfs.io/" openInNewTab>
                  IPFS
                </LinkChip>{' '}
                is a popular decentalized solution for hosting NFT assets and
                metadata, but you can also use more traditional hosting services
                like{' '}
                <LinkChip href="https://aws.amazon.com/s3/" openInNewTab>
                  Amazon S3
                </LinkChip>
                .
              </Blockquote>
            </>
          }
        >
          <HStack flex="1 1 auto">
            <TextArea
              disabled={disabled}
              value={config.tokenURI}
              onChange={(event) => {
                dispatch({ type: 'setTokenURI', value: event.target.value });
              }}
              style={{
                minHeight: '100px',
                maxWidth: '1000px',
                minWidth: '0px',
                flex: '1 1 auto',
              }}
            />
          </HStack>
        </FormRow>
        <FormRow
          title="Contract URI"
          variant="small"
          tooltip={
            <>
              The URI of the metadata for the marketplace storefront.
              <SpacerVertical size={20} />
              This an OpenSea-specific feature, and most contracts don't use it.
              You may also configure this metadata through the OpenSea website
              after deploying your contract.
              <SpacerVertical size={20} />
              If you choose to use this, the metadata should be a JSON object as
              documented here on OpenSea:{' '}
              <LinkChip
                openInNewTab
                href="https://docs.opensea.io/docs/contract-level-metadata"
              >
                Contract-level Metadata
              </LinkChip>
            </>
          }
        >
          <Checkbox
            variant="dark"
            disabled={disabled}
            checked={config.contractURI !== undefined}
            onCheckedChange={(value: boolean) => {
              dispatch({
                type: 'setContractURI',
                value: value ? '' : undefined,
              });
            }}
          />
          <InputField.Root id="input-contract-uri">
            <InputField.Input
              disabled={disabled || config.contractURI === undefined}
              value={config.contractURI ?? ''}
              onChange={(value) => {
                dispatch({ type: 'setContractURI', value });
              }}
            />
          </InputField.Root>
        </FormRow>
        {parsedURI.type === 'failure' && (
          <FormRowError>{parsedURI.message}</FormRowError>
        )}
      </VStack>
    </HStack>
  );
});
