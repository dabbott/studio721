import { Interface } from '@ethersproject/abi';
import { Address, CHAIN_ID, getChainName } from '@openpalette/contract';
import {
  Button,
  CodeHighlight,
  ConnectButton,
  Divider,
  getHeadTags,
  HStack,
  LinkChip,
  Regular,
  SpacerHorizontal,
  SpacerVertical,
  TwitterChip,
  VStack,
} from 'components';
import { useChainId, useWeb3Data } from 'contexts';
import { usePrismExtensions } from 'hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import theme from 'prism-react-renderer/themes/vsDark';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  downloadDependenciesForSource,
  generateContractSource,
  getBaseURI,
  getValidContractName,
} from 'solidity-codegen';
import { createCompilerInput } from 'solidity-compiler';
import {
  ContractConfigState,
  createInitialState,
  GWEI_SLIM_VERSION,
  OPEN_ZEPPELIN_VERSION,
  reducer,
  ScopedAccessToken,
} from 'state';
import { SolidityCompilerOutput, WorkerRequest, WorkerResponse } from 'utils';
import { getEtherscanApiUrl } from 'web3-utils';
import { AllowlistSection } from '../components/contract/AllowlistSection';
import { ContractConsole } from '../components/contract/ContractConsole';
import { MintingSection } from '../components/contract/MintingSection';
import { ParametersSection } from '../components/contract/ParametersSection';
import { PayoutSection } from '../components/contract/PayoutSection';
import { TokenPreview } from '../components/contract/TokenPreview';
import { VerificationSection } from '../components/contract/VerificationSection';
import { deployContract } from '../utils/deploy';
import { socialConfig } from '../utils/socialConfig';
import {
  checkVerificationStatus,
  toCheckStatusRequest,
  toVerifyRequest,
  verifyContract,
} from '../utils/verify';

const SCHEMA_VERSION_KEY = 'schemaVersion';

try {
  theme.plain.backgroundColor = 'black';
} catch {
  //
}

const erc721DelegatedAddress: ScopedAccessToken = {
  mainnet: '0x43955024b1985e2b933a59021500ae5f55b04091',
  rinkeby: '0x86c67a16c16bf784bdfe7d4b7575db664d191f88',
  ropsten: '',
  goerli: '',
  polygon: '',
  mumbai: '',
};

function useCompiler() {
  const requestId = useRef(0);
  const worker = useRef<Worker>();

  useEffect(() => {
    worker.current = new Worker(new URL('../worker.ts', import.meta.url));
  }, [worker]);

  return {
    compile: (files: Record<string, string>) => {
      return new Promise<SolidityCompilerOutput>((resolve) => {
        const request: WorkerRequest = {
          id: requestId.current++,
          type: 'compile',
          request: {
            input: createCompilerInput(files),
          },
        };

        function handler(e: MessageEvent) {
          const data = e.data as WorkerResponse;

          if (!(data.id === request.id && data.type === request.type)) return;

          worker.current?.removeEventListener('message', handler);

          resolve(data.response.output);
        }

        worker.current?.addEventListener('message', handler);
        worker.current?.postMessage(request);
      });
    },
  };
}

export default function NFTStudio() {
  usePrismExtensions();

  const router = useRouter();

  const initialConfig = useMemo(() => {
    if (typeof router.query.config !== 'string') return {};

    const config = router.query.config
      ? JSON.parse(decodeURIComponent(router.query.config))
      : {};

    delete config[SCHEMA_VERSION_KEY];

    return config;
  }, [router.query.config]);

  const [state, dispatch] = useReducer(
    reducer,
    createInitialState(initialConfig),
  );

  const configJSON = useMemo(() => {
    const clone = { ...state.config };

    (
      Object.entries(createInitialState({}).config) as [
        keyof ContractConfigState,
        any,
      ][]
    ).forEach(([key, value]) => {
      if (JSON.stringify(clone[key]) === JSON.stringify(value)) {
        delete clone[key];
      }
    });

    return JSON.stringify({
      ...clone,
      [SCHEMA_VERSION_KEY]: '1.0.0',
    });
  }, [state.config]);

  useEffect(() => {
    const config = `config=${encodeURIComponent(configJSON)}`;

    if (router.asPath.includes(config)) return;

    router.replace(
      {
        query: config,
      },
      undefined,
      {
        scroll: false,
        shallow: true,
      },
    );
  }, [configJSON, router]);

  const compiler = useCompiler();
  const provider = useWeb3Data()?.provider;
  const chainId = useChainId();

  const handleCompile = useCallback(() => {
    async function main() {
      const contractName = getValidContractName(state.config.tokenName);
      const sourceName = contractName + '.sol';

      const source = generateContractSource(state.config);

      dispatch({ type: 'downloadFiles' });

      const files = await downloadDependenciesForSource(
        fetch,
        sourceName,
        source,
        {
          '@openzeppelin/contracts': OPEN_ZEPPELIN_VERSION,
          'gwei-slim-nft-contracts': GWEI_SLIM_VERSION,
        },
      );

      dispatch({ type: 'setCompilerReady', value: files });

      const output = await compiler.compile(files);

      dispatch({
        type: 'setCompilerDone',
        value: output,
        sourceName,
        contractName,
      });
    }

    main();
  }, [compiler, state.config]);

  const handleDeploy = useCallback(() => {
    async function main() {
      if (state.compiler.type !== 'done' || !provider || !chainId) return;

      const { sourceName, contractName, contracts } = state.compiler;

      const mainContract = contracts[sourceName][contractName];

      const {
        abi,
        evm: { bytecode },
      } = mainContract;

      dispatch({
        type: 'setDeploying',
      });

      let deploymentAddress: Address;

      const chainName = getChainName(chainId);

      try {
        if (
          state.config.usesDelegatedContract &&
          !(chainId === CHAIN_ID.MAINNET || chainId === CHAIN_ID.RINKEBY)
        ) {
          alert(
            "You can't use the 'Reduce deployment costs' option on this network! Mainnet and Rinkeby only for now.",
          );

          throw new Error("Can't use delegated contracts on this network");
        }

        deploymentAddress = await deployContract(
          provider.getSigner(),
          abi,
          bytecode,
          [
            ...(state.config.usesDelegatedContract
              ? [erc721DelegatedAddress[chainName] ?? undefined]
              : []),
            getBaseURI(state.config.tokenURI),
            ...(state.config.requireAccessToken
              ? [state.config.requireAccessToken[chainName]]
              : []),
            ...(state.config.approvalProxyAddress
              ? [state.config.approvalProxyAddress[chainName]]
              : []),
          ],
        );
      } catch (e) {
        console.warn('deploy failure', e);

        dispatch({
          type: 'deployFailure',
        });

        return;
      }

      dispatch({
        type: 'setDeploymentAddress',
        value: deploymentAddress,
      });
    }

    main();
  }, [
    state.compiler,
    state.config.usesDelegatedContract,
    state.config.tokenURI,
    state.config.requireAccessToken,
    state.config.approvalProxyAddress,
    provider,
    chainId,
  ]);

  const handleVerify = useCallback(() => {
    async function main() {
      if (
        state.compiler.type !== 'done' ||
        state.deployment.type !== 'deployed' ||
        !chainId
      )
        return;

      const { contracts, contractName, sourceName } = state.compiler;

      const contractInterface = new Interface(
        contracts[sourceName][contractName].abi,
      );

      const chainName = getChainName(chainId);

      const deployArguments = contractInterface
        .encodeDeploy([
          ...(state.config.usesDelegatedContract
            ? [erc721DelegatedAddress[chainName] ?? undefined]
            : []),
          getBaseURI(state.config.tokenURI),
          ...(state.config.requireAccessToken
            ? [state.config.requireAccessToken[chainName]]
            : []),
          ...(state.config.approvalProxyAddress
            ? [state.config.approvalProxyAddress[chainName]]
            : []),
        ])
        .replace('0x', '');

      const verifyRequest = toVerifyRequest({
        apiKey: state.apiKeys.etherscan,
        compilerVersion: 'v0.8.9+commit.e5eed63a',
        constructorArguments: deployArguments,
        contractAddress: state.deployment.address,
        contractName: state.compiler.contractName,
        sourceCode: JSON.stringify(createCompilerInput(state.compiler.files)),
        sourceName: state.compiler.contractName + '.sol',
      });

      dispatch({ type: 'setVerifying' });

      // console.log('req', verifyRequest);

      const verificationResult = await verifyContract(
        getEtherscanApiUrl(chainId),
        verifyRequest,
      );

      if (verificationResult instanceof Error) {
        dispatch({ type: 'setVerificationFailed', error: verificationResult });

        return;
      }

      // console.log('res', verificationResult);

      const checkStatusRequest = toCheckStatusRequest({
        apiKey: state.apiKeys.etherscan,
        guid: verificationResult.result,
      });

      const checkStatusResult = await checkVerificationStatus(
        getEtherscanApiUrl(chainId),
        checkStatusRequest,
      );

      if (checkStatusResult instanceof Error) {
        console.warn('Failed to verify', checkStatusResult);

        dispatch({ type: 'setVerificationFailed', error: checkStatusResult });
      } else {
        dispatch({ type: 'setVerified' });
      }
    }

    main();
  }, [
    chainId,
    state.apiKeys.etherscan,
    state.compiler,
    state.config.approvalProxyAddress,
    state.config.tokenURI,
    state.config.requireAccessToken,
    state.config.usesDelegatedContract,
    state.deployment,
  ]);

  const hasStartedDeploying = state.deployment.type !== 'notStarted';

  useEffect(() => {
    localStorage.setItem('etherscanApiKey', state.apiKeys.etherscan);
  }, [state.apiKeys.etherscan]);

  return (
    <>
      <Head>
        <title>Studio 721 Contract</title>
        {getHeadTags({
          pageTitle: 'Studio 721 Contract',
          pageDescription:
            'The free, all-in-one tool for configuring, deploying, and verifying NFT smart contracts.',
          config: socialConfig,
        })}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HStack
        margin={'60px 0 0 0'}
        flex={'1 1 0%'}
        breakpoints={{
          [800]: {
            flexDirection: 'column',
          },
        }}
      >
        <VStack
          flex="1 1 0px"
          breakpoints={{
            [800]: {
              flex: '0 0 auto',
            },
          }}
        >
          <VStack
            overflowY="auto"
            flex="1 1 0px"
            gap={40}
            padding={'20px 40px'}
            breakpoints={{
              [800]: {
                overflowY: 'initial',
              },
            }}
          >
            <VStack gap={10}>
              <Regular>
                <strong>Studio 721</strong> is a free tool for configuring,
                compiling, deploying, and verifying custom{' '}
                <LinkChip
                  openInNewTab
                  href="https://docs.openzeppelin.com/contracts/2.x/api/token/erc721"
                  style={{
                    whiteSpace: 'pre',
                  }}
                >
                  ERC 721
                </LinkChip>{' '}
                NFT smart contracts. Studio 721 doesn{"'"}t host your assets or
                metadata; use your favorite hosting service and link it to your
                NFT via {'"'}
                Token URI{'"'}. Not sure where to start? There's a{' '}
                <LinkChip href="/guide/studio/contract">
                  video walkthrough!
                </LinkChip>
              </Regular>
              <Regular>
                Created by <TwitterChip value="@dvnabbott" />
              </Regular>
            </VStack>
            <TokenPreview
              config={state.config}
              disabled={hasStartedDeploying}
              dispatch={dispatch}
            />
            <MintingSection
              config={state.config}
              disabled={hasStartedDeploying}
              dispatch={dispatch}
            />
            <ParametersSection
              disabled={hasStartedDeploying}
              dispatch={dispatch}
              parameters={state.config.tokenParameters}
            />
            <PayoutSection
              disabled={hasStartedDeploying}
              dispatch={dispatch}
              destinations={state.config.payoutDestinations}
            />
            <AllowlistSection
              allowedForOwner={state.config.amountAllowedForOwner}
              disabled={hasStartedDeploying}
              dispatch={dispatch}
              destinations={state.config.allowlistDestinations}
            />
            <VerificationSection
              etherscanApiKey={state.apiKeys.etherscan}
              dispatch={dispatch}
            />
            <SpacerVertical size={10} />
          </VStack>
        </VStack>
        <VStack
          flex="1 1 0%"
          background="black"
          breakpoints={{
            [800]: {
              flex: '0 0 auto',
            },
          }}
        >
          <VStack
            overflowY="auto"
            flex="2 2 0px"
            breakpoints={{
              [800]: {
                minHeight: 400,
              },
            }}
          >
            <VStack flex="1 1 0px" padding={20}>
              <CodeHighlight
                code={generateContractSource(state.config)}
                language={'solidity' as any}
              />
            </VStack>
          </VStack>
          <Divider variant="light" />
          <VStack
            overflowY="auto"
            flex="1 1 0px"
            breakpoints={{
              [800]: {
                minHeight: 400,
              },
            }}
          >
            <ContractConsole
              compiler={state.compiler}
              deployment={state.deployment}
              verification={state.verification}
            />
          </VStack>
          <Divider variant="light" />
          <VStack gap={20} padding={20}>
            <HStack gap={20} flexWrap="wrap">
              <Button
                disabled={state.compiler.type === 'done'}
                onClick={handleCompile}
              >
                Compile
              </Button>
              <Button
                disabled={
                  !provider ||
                  state.compiler.type !== 'done' ||
                  state.deployment.type !== 'notStarted'
                }
                onClick={handleDeploy}
              >
                {chainId
                  ? `Deploy on ${getChainName(chainId)}`
                  : 'Deploy' +
                    (state.compiler.type === 'done' && !provider
                      ? ' (connect wallet to deploy)'
                      : '')}
              </Button>
              <Button
                disabled={
                  state.deployment.type !== 'deployed' ||
                  state.verification.type !== 'notStarted' ||
                  !state.apiKeys.etherscan
                }
                onClick={handleVerify}
              >
                Verify{' '}
                {!state.apiKeys.etherscan &&
                state.deployment.type === 'deployed'
                  ? '(need API key)'
                  : ''}
              </Button>
              <SpacerHorizontal />
              <HStack alignItems="center">
                <ConnectButton />
              </HStack>
            </HStack>
          </VStack>
        </VStack>
      </HStack>
    </>
  );
}

// Next router only picks up parameters if we render server-side
export async function getServerSideProps(context: any) {
  return { props: {} };
}
