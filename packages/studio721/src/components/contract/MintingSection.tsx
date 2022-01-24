import { CHAIN_ID, getContractAddress } from '@openpalette/contract';
import {
  Blockquote,
  Checkbox,
  HStack,
  LinkChip,
  Small,
  SpacerHorizontal,
  SpacerVertical,
  TwitterChip,
} from 'components';
import { InputField, Select } from 'designsystem';
import React, { memo, useMemo } from 'react';
import {
  Action,
  ContractConfigState,
  createDefaultConfig,
  createOpenPaletteConfig,
  EthereumChainName,
  ScopedAccessToken,
} from 'state';
import { isDeepEqual, upperFirst } from 'utils';
import { getProxyAddress } from 'web3-utils';
import { FormRow, FormSection } from 'components';

interface Props {
  config: ContractConfigState;
  disabled: boolean;
  dispatch: (action: Action) => void;
}

function isConfigEqual(
  config: ContractConfigState,
  partial: Partial<ContractConfigState>,
) {
  const projection = Object.fromEntries(
    Object.entries(partial).map(([key]) => [
      key,
      config[key as keyof ContractConfigState],
    ]),
  );

  return isDeepEqual(projection, partial);
}

type Preset = 'none' | 'default' | 'openPalette';

const AccessTokenInputField = ({
  disabled,
  requireAccessToken,
  dispatch,
  chainName,
}: {
  disabled: boolean;
  requireAccessToken: ScopedAccessToken;
  dispatch: (action: Action) => void;
  chainName: keyof ScopedAccessToken;
}) => {
  return (
    <FormRow indent={1} title={`${upperFirst(chainName)} address`}>
      <InputField.Root id={`input-access-token-${chainName}-address`}>
        <InputField.Input
          style={{
            fontFamily: 'monospace',
          }}
          disabled={disabled}
          value={requireAccessToken[chainName]}
          onChange={(value) => {
            dispatch({
              type: 'setAccessToken',
              value: {
                ...(requireAccessToken ?? {
                  mainnet: '',
                  rinkeby: '',
                  ropsten: '',
                  goerli: '',
                  polygon: '',
                  mumbai: '',
                }),
                [chainName]: value,
              },
            });
          }}
        />
      </InputField.Root>
    </FormRow>
  );
};

const ApprovalProxyInputField = ({
  disabled,
  approvalProxyAddress,
  dispatch,
  chainName,
}: {
  disabled: boolean;
  approvalProxyAddress: ScopedAccessToken;
  dispatch: (action: Action) => void;
  chainName: keyof ScopedAccessToken;
}) => {
  return (
    <FormRow indent={1} title={`${upperFirst(chainName)} address`}>
      <InputField.Root id={`input-approval-proxy-${chainName}-address`}>
        <InputField.Input
          style={{
            fontFamily: 'monospace',
          }}
          disabled={disabled}
          value={approvalProxyAddress[chainName]}
          onChange={(value) => {
            dispatch({
              type: 'setApprovalProxyAddress',
              value: {
                ...(approvalProxyAddress ?? {
                  mainnet: '',
                  rinkeby: '',
                  ropsten: '',
                  goerli: '',
                  polygon: '',
                  mumbai: '',
                }),
                [chainName]: value,
              },
            });
          }}
        />
      </InputField.Root>
    </FormRow>
  );
};

const chainNames: EthereumChainName[] = [
  'mainnet',
  'rinkeby',
  'ropsten',
  'polygon',
  'mumbai',
];

export const MintingSection = memo(function MintingSection({
  config,
  disabled,
  dispatch,
}: Props) {
  const presetValue: Preset = useMemo(() => {
    if (isConfigEqual(config, createDefaultConfig())) {
      return 'default';
    } else if (isConfigEqual(config, createOpenPaletteConfig())) {
      return 'openPalette';
    } else {
      return 'none';
    }
  }, [config]);

  return (
    <FormSection
      title="Minting Options"
      right={
        <>
          <HStack width={180} alignItems="center">
            <Small>Preset</Small>
            <SpacerHorizontal size={10} />
            <Select<Preset>
              id="input-preset"
              disabled={disabled}
              value={presetValue}
              options={[
                ...(presetValue === 'none' ? ['none' as const] : []),
                'default',
                'openPalette',
              ]}
              getTitle={(id: Preset) => upperFirst(id)}
              onChange={(id: Preset) => {
                switch (id) {
                  case 'default':
                    dispatch({
                      type: 'setConfig',
                      config: createDefaultConfig(),
                    });
                    break;
                  case 'openPalette':
                    dispatch({
                      type: 'setConfig',
                      config: createOpenPaletteConfig(),
                    });
                    break;
                }
              }}
            />
          </HStack>
        </>
      }
    >
      <FormRow
        title="Reduce deployment costs"
        tooltip={
          <>
            This option reduces the costs of deploying a contract using a
            technique called <em>delegation</em>. Typically costs are reduced by
            around 65%.
            <br />
            <br />
            Most NFT contracts contain a lot of the same code; we can therefore
            reuse (or delegate to) the code that's already been deployed to the
            blockchain, rather than deploying a separate copy each time.
            Deploying less code means lower costs.
            <br />
            <br />
            The deployed code that we're reusing was created by{' '}
            <TwitterChip hasMargin={false} value="@isiain" /> and is available
            on GitHub{' '}
            <LinkChip
              openInNewTab
              href="https://github.com/iainnash/gwei-slim-erc721"
            >
              GitHub
            </LinkChip>
            .
          </>
        }
      >
        <Checkbox
          variant="dark"
          disabled={disabled}
          checked={config.usesDelegatedContract}
          onCheckedChange={(value: boolean) => {
            dispatch({ type: 'setUsesDelegatedContract', value });
          }}
        />
      </FormRow>
      <FormRow
        title="Multimint"
        tooltip={
          <>
            You may optionally allow minting multiple NFTs at once.
            <SpacerVertical size={20} />
            This is a great way to save people time and transaction fees (gas),
            though it may lead to your NFTs being owned by a smaller number of
            people.
          </>
        }
      >
        <Checkbox
          variant="dark"
          disabled={disabled}
          checked={config.multimint !== undefined}
          onCheckedChange={(value: boolean) => {
            dispatch({
              type: 'setMultiMint',
              value: value ? 20 : undefined,
            });
          }}
        />
        <InputField.Root id="input-multi-mint">
          <InputField.NumberInput
            disabled={disabled || config.multimint === undefined}
            value={config.multimint ?? 20}
            onSubmit={(value) => {
              const numberValue = Number(value);

              if (!Number.isInteger(numberValue) || numberValue <= 0) return;

              dispatch({ type: 'setMultiMint', value: numberValue });
            }}
          />
        </InputField.Root>
      </FormRow>
      <FormRow
        title="Minting limit per wallet"
        tooltip={
          <>
            This limits the amount of NFTs any wallet/address can mint.
            <SpacerVertical size={20} />
            This can help prevent one wallet (potentially a bot) from minting a
            large amount of the supply. However, it's only a preventative
            measure that adds some friction; somebody can still split their
            Ether into several wallets and mint from each.
            <SpacerVertical size={20} />
            If you add addresses via the allowlist, any addresses listed will be
            able to mint <em>the greater</em> of their allowed amount and this
            limit after the sale starts.
          </>
        }
      >
        <Checkbox
          variant="dark"
          disabled={disabled}
          checked={config.limitPerWallet !== undefined}
          onCheckedChange={(value: boolean) => {
            dispatch({
              type: 'setMintingLimitPerWallet',
              value: value ? 5 : undefined,
            });
          }}
        />
        <InputField.Root id="input-limit-per-wallet">
          <InputField.NumberInput
            disabled={disabled || config.limitPerWallet === undefined}
            value={config.limitPerWallet ?? 5}
            onSubmit={(value) => {
              const numberValue = Number(value);

              if (!Number.isInteger(numberValue) || numberValue <= 0) return;

              dispatch({
                type: 'setMintingLimitPerWallet',
                value: numberValue,
              });
            }}
          />
        </InputField.Root>
      </FormRow>
      <FormRow
        title="Mint specific ids"
        tooltip={
          <>
            Should the minter be required to specify the id of the NFTs they
            want to mint?
            <SpacerVertical size={20} />
            If this isn{"'"}t checked, NFT ids will auto-increment.
          </>
        }
      >
        <Checkbox
          variant="dark"
          disabled={disabled}
          checked={config.usesIdParameter}
          onCheckedChange={(value: boolean) => {
            dispatch({
              type: 'setUsesIdParameter',
              value,
            });
          }}
        />
      </FormRow>
      {config.usesIdParameter && (
        <FormRow
          indent={1}
          title="Maximum token id"
          tooltip={
            <>
              The maximum token id is this number minus one.
              <SpacerVertical size={20} />
              This should be greater than or equal to the supply.
            </>
          }
        >
          <Checkbox
            variant="dark"
            disabled={disabled}
            checked={config.customMaxTokenId !== undefined}
            onCheckedChange={(value: boolean) => {
              dispatch({
                type: 'setCustomMaxTokenId',
                value: value ? config.supply ?? 2000 : undefined,
              });
            }}
          />

          <InputField.Root id="input-max-token-id">
            <InputField.NumberInput
              disabled={disabled || config.customMaxTokenId === undefined}
              value={config.customMaxTokenId ?? config.supply ?? 2000}
              onChange={(value) => {
                const numberValue = Number(value);

                if (!Number.isInteger(numberValue) || numberValue <= 0) return;

                dispatch({
                  type: 'setCustomMaxTokenId',
                  value: numberValue,
                });
              }}
            />
          </InputField.Root>
        </FormRow>
      )}
      <FormRow
        title="Require access token"
        tooltip={
          <>
            Another ERC721 (NFT) contract can be used to gate access to minting.
            <SpacerVertical size={20} />
            The ID from the {'"'}access token{'"'} will be used for the minted
            token.
          </>
        }
      >
        <Checkbox
          variant="dark"
          disabled={disabled}
          checked={!!config.requireAccessToken}
          onCheckedChange={(value: boolean) => {
            dispatch({
              type: 'setAccessToken',
              value: value
                ? {
                    mainnet: getContractAddress(CHAIN_ID.MAINNET),
                    rinkeby: getContractAddress(CHAIN_ID.RINKEBY),
                    ropsten: '',
                    goerli: '',
                    polygon: '',
                    mumbai: '',
                  }
                : undefined,
            });
          }}
        />
      </FormRow>
      {config.requireAccessToken && (
        <>
          <FormRow
            indent={1}
            title="Add function to disable"
            tooltip={
              <>
                Exposes a function <code>setAccessTokenIsActive</code> to
                enable/disable the access token.
                <SpacerVertical size={20} />
                This can be useful if the access token is used for a "presale",
                but after that, minting is open to all.
              </>
            }
          >
            <Checkbox
              variant="dark"
              disabled={disabled}
              checked={config.toggleAccessToken}
              onCheckedChange={(value: boolean) => {
                dispatch({
                  type: 'setToggleAccessToken',
                  value,
                });
              }}
            />
          </FormRow>
          <FormRow
            indent={1}
            title="Add function to change"
            tooltip={
              <>
                Exposes a function <code>setAccessTokenAddress</code> to change
                the access token address.
                <SpacerVertical size={20} />
                This can be useful if the original access token contract has a
                bug and you need to switch to a new access token.
              </>
            }
          >
            <Checkbox
              variant="dark"
              disabled={disabled}
              checked={config.mutableAccessToken}
              onCheckedChange={(value: boolean) => {
                dispatch({
                  type: 'setMutableAccessToken',
                  value,
                });
              }}
            />
          </FormRow>
          {chainNames.map((chainName) => (
            <AccessTokenInputField
              disabled={disabled}
              chainName={chainName}
              dispatch={dispatch}
              requireAccessToken={config.requireAccessToken!}
            />
          ))}
        </>
      )}
      <FormRow
        title="Only the owner can mint"
        tooltip={
          <>
            Only the contract owner is allowed to call the <code>mint</code>{' '}
            function.
            <SpacerVertical size={20} />
            This is useful if you want to mint the NFTs yourself, and then list
            them for sale or transfer afterward.
            <SpacerVertical size={20} />
            Initially, you are the contract owner. However, you can call{' '}
            <code>transferOwnership</code> to choose a different owner.
          </>
        }
      >
        <Checkbox
          variant="dark"
          disabled={disabled}
          checked={config.onlyOwnerCanMint}
          onCheckedChange={(value: boolean) => {
            dispatch({
              type: 'setOnlyOwnerCanMint',
              value,
            });
          }}
        />
      </FormRow>
      <FormRow
        title="Enumerable"
        tooltip={
          <>
            Use the ERC721Enumerable extension.
            <SpacerVertical size={20} />
            This extension provides an API for looking up the list of NFTs owned
            by an address. This is primarily useful if you want to build related
            projects that use the NFTs.
            <SpacerVertical size={20} />
            The downside is that it increases transaction fees (gas) when
            minting and transfering the NFTs. From some quick testing, this
            seems to increase fees by around 50%.
            <SpacerVertical size={20} />
            This option isn't currently supported when using the{' '}
            <em>reduced deployment costs</em> option.
            <SpacerVertical size={20} />
            <Blockquote style={{ fontSize: 'inherit' }}>
              Due to rising gas costs, many developers choose not to use this
              extension anymore. You can typically provide the same "list of
              NFTs" functionality on your website using an indexing service such
              as{' '}
              <LinkChip
                openInNewTab
                style={{
                  whiteSpace: 'pre',
                }}
                href="https://thegraph.com"
              >
                The Graph
              </LinkChip>
              , though it's more work and relies on off-chain data.
            </Blockquote>
          </>
        }
      >
        <Checkbox
          variant="dark"
          disabled={disabled || config.usesDelegatedContract}
          checked={config.enumerable}
          onCheckedChange={(value: boolean) => {
            dispatch({
              type: 'setEnumerable',
              value,
            });
          }}
        />
      </FormRow>
      <FormRow
        title="Minting starts active"
        tooltip={
          <>
            This NFT contract has a function <code>setSaleIsActive</code>, which
            you can call to activate and deactivate the sale. If you check this
            box, the sale will be activated as soon as you deploy the contract.
          </>
        }
      >
        <Checkbox
          variant="dark"
          disabled={disabled}
          checked={config.activateAutomatically}
          onCheckedChange={(value: boolean) => {
            dispatch({
              type: 'setActivateAutomatically',
              value,
            });
          }}
        />
      </FormRow>
      <FormRow
        title="Approval Proxy"
        tooltip={
          <>
            This is a technique used by OpenSea to enable users to list their
            NFTs without paying transaction fees ("gasless listing"). Read more
            in the{' '}
            <LinkChip
              openInNewTab
              href="https://docs.opensea.io/docs/1-structuring-your-smart-contract"
            >
              OpenSea documentation
            </LinkChip>
            <SpacerVertical size={20} />
            The default addresses come from their{' '}
            <LinkChip
              openInNewTab
              href="https://github.com/ProjectOpenSea/opensea-creatures/blob/1c9ee693b3c69467bdc5d025cc667ab1d1c4c873/migrations/2_deploy_contracts.js#L28"
            >
              Example Code{' '}
            </LinkChip>
            <SpacerVertical size={20} />
            This option isn't currently supported when using the{' '}
            <em>reduced deployment costs</em> option.
          </>
        }
      >
        <Checkbox
          variant="dark"
          disabled={disabled || config.usesDelegatedContract}
          checked={!!config.approvalProxyAddress}
          onCheckedChange={(value: boolean) => {
            dispatch({
              type: 'setApprovalProxyAddress',
              value: value
                ? {
                    mainnet: getProxyAddress(CHAIN_ID.MAINNET),
                    rinkeby: getProxyAddress(CHAIN_ID.RINKEBY),
                    ropsten: '',
                    goerli: '',
                    polygon: '',
                    mumbai: '',
                  }
                : undefined,
            });
          }}
        />
      </FormRow>
      {config.approvalProxyAddress && (
        <>
          {chainNames.map((chainName) => (
            <ApprovalProxyInputField
              disabled={disabled}
              chainName={chainName}
              dispatch={dispatch}
              approvalProxyAddress={config.approvalProxyAddress!}
            />
          ))}
        </>
      )}
      <FormRow
        title="Set token URIs individually"
        tooltip={
          <>
            This lets you set a unique URI for each token, overriding the
            default <em>Token URI</em> used for the entire collection.
            <SpacerVertical size={20} />
            This is useful when you don't create the artwork for your entire
            collection in advance, but rather mint a few tokens at a time.
            <SpacerVertical size={20} />
            Call the <code>setTokenURI</code> function to set a URI for a
            specific token.
          </>
        }
      >
        <Checkbox
          variant="dark"
          disabled={disabled}
          checked={config.usesUriStorage}
          onCheckedChange={(value: boolean) => {
            dispatch({
              type: 'setUsesUriStorage',
              value,
            });
          }}
        />
      </FormRow>
    </FormSection>
  );
});
