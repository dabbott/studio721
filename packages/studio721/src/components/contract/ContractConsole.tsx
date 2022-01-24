import { Code, Regular } from 'components';
import { useChainId } from 'contexts';
import React, { memo } from 'react';
import {
  CompilerState,
  DeploymentState,
  GWEI_SLIM_VERSION,
  OPEN_ZEPPELIN_VERSION,
  VerificationState,
} from 'state';
import { UTF16 } from 'utils';
import { createCompilerInput } from 'solidity-compiler';
import { saveFile } from '../../utils/download';
import { Console } from './Console';
import { Zip } from 'files';
import { getBlockExplorerName, getEtherscanAddressUrl } from 'web3-utils';

interface Props {
  compiler: CompilerState;
  deployment: DeploymentState;
  verification: VerificationState;
}

export const ContractConsole = memo(function ContractConsole({
  compiler,
  deployment,
  verification,
}: Props) {
  const chainId = useChainId();

  return (
    <Console
      elements={[
        compiler.type === 'downloading' && (
          <Code loading>Downloading @openzeppelin contracts...</Code>
        ),
        compiler.type === 'ready' && <Code loading>Compiling...</Code>,
        compiler.type === 'error' && (
          <Code>
            Compiler errors:
            {'\n\n'}
            {compiler.errors.map((e): any => e.formattedMessage).join('\n\n')}
          </Code>
        ),
        compiler.type === 'done' && (
          <Code>
            {Object.keys(compiler.contracts)
              .map((name) =>
                name
                  .replace(
                    '@openzeppelin/contracts',
                    `@openzeppelin/contracts@${OPEN_ZEPPELIN_VERSION}`,
                  )
                  .replace(
                    'gwei-slim-nft-contracts',
                    `gwei-slim-nft-contracts@${GWEI_SLIM_VERSION}`,
                  ),
              )
              .sort()
              .join('\n')}
            {'\n\n'}
            Optional downloads:{'\n'}-{' '}
            <a
              style={{
                fontSize: 'inherit',
              }}
              onClick={async () => {
                const files = Object.fromEntries(
                  Object.entries(compiler.files).map(([name, string]) => [
                    name,
                    UTF16.toUTF8(string),
                  ]),
                );

                const zip = await Zip.zip(files);

                await saveFile(`contract.zip`, 'application/zip', '.zip', zip);
              }}
            >
              solidity files
            </a>{' '}
            {'\n'}-{' '}
            <a
              style={{
                fontSize: 'inherit',
              }}
              onClick={async () => {
                const input = JSON.stringify(
                  createCompilerInput(compiler.files),
                );

                await saveFile(
                  `input.json`,
                  'application/json',
                  '.json',
                  UTF16.toUTF8(input),
                );
              }}
            >
              compiler input
            </a>
            {'\n'}-{' '}
            <a
              style={{
                fontSize: 'inherit',
              }}
              onClick={async () => {
                const output = JSON.stringify(
                  compiler.contracts[compiler.sourceName][
                    compiler.contractName
                  ],
                  null,
                  2,
                );

                await saveFile(
                  `output.json`,
                  'application/json',
                  '.json',
                  UTF16.toUTF8(output),
                );
              }}
            >
              compiler output
            </a>
            {'\n'}-{' '}
            <a
              style={{
                fontSize: 'inherit',
              }}
              onClick={async () => {
                const output = JSON.stringify(
                  compiler.contracts[compiler.sourceName][compiler.contractName]
                    .abi,
                  null,
                  2,
                );

                await saveFile(
                  `abi.json`,
                  'application/json',
                  '.json',
                  UTF16.toUTF8(output),
                );
              }}
            >
              ABI
            </a>
            {'\n\n'}
            🛠 Compiled successfully
          </Code>
        ),

        deployment.type === 'deploying' && <Code loading>Deploying...</Code>,
        chainId && deployment.type === 'deployed' && (
          <>
            <Regular>
              <a
                href={getEtherscanAddressUrl(chainId, deployment.address)}
                target="_blank"
                rel="noreferrer"
              >
                {getBlockExplorerName(chainId)} →
              </a>
            </Regular>
            <Code>🚀 Deployed at: {deployment.address}</Code>
          </>
        ),
        verification.type === 'notStarted' && verification.previousError && (
          <Code>
            {verification.previousError.message}
            {'\n\n'}Wait a few seconds and try again
          </Code>
        ),
        verification.type === 'verifying' && <Code loading>Verifying...</Code>,
        verification.type === 'verified' && <Code>✅ Verified</Code>,
      ]}
    />
  );
});
