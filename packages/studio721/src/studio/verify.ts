// Mostly adapted from:
// https://github.com/nomiclabs/hardhat/tree/master/packages/hardhat-etherscan (MIT)

export interface EtherscanRequest {
  apikey: string;
  module: 'contract';
  action: string;
}

export interface EtherscanVerifyRequest extends EtherscanRequest {
  action: 'verifysourcecode';
  contractaddress: string;
  sourceCode: string;
  codeformat: 'solidity-standard-json-input';
  contractname: string;
  compilerversion: string;
  // This is misspelt in Etherscan's actual API parameters.
  // See: https://etherscan.io/apis#contracts
  constructorArguements: string;
}

export interface EtherscanCheckStatusRequest extends EtherscanRequest {
  action: 'checkverifystatus';
  guid: string;
}

export function toVerifyRequest(params: {
  apiKey: string;
  contractAddress: string;
  sourceCode: string;
  sourceName: string;
  contractName: string;
  compilerVersion: string;
  constructorArguments: string;
}): EtherscanVerifyRequest {
  return {
    apikey: params.apiKey,
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: params.contractAddress,
    sourceCode: params.sourceCode,
    codeformat: 'solidity-standard-json-input',
    contractname: `${params.sourceName}:${params.contractName}`,
    compilerversion: params.compilerVersion,
    constructorArguements: params.constructorArguments,
  };
}

export function toCheckStatusRequest(params: {
  apiKey: string;
  guid: string;
}): EtherscanCheckStatusRequest {
  return {
    apikey: params.apiKey,
    module: 'contract',
    action: 'checkverifystatus',
    guid: params.guid,
  };
}

//////

export interface EtherscanVerifyResponse {
  message: string; // "OK"
  result: string; // guid
  status: string; // "1"
}

export async function verifyContract(
  etherscanApiUrl: string,
  req: EtherscanVerifyRequest,
): Promise<EtherscanVerifyResponse | Error> {
  const parameters = new URLSearchParams({ ...req });
  const requestDetails = {
    method: 'post',
    body: parameters,
  };

  let response: Response;
  try {
    response = await fetch(etherscanApiUrl, requestDetails);
  } catch (error) {
    console.error('Failed to validate');
    return error as Error;
  }

  if (!response.ok) {
    const responseText = await response.text();

    return new Error(`Error: HTTP request failed. ${responseText}`);
  }

  const json: EtherscanVerifyResponse = await response.json();

  if (json.status === '0') {
    return new Error(`Error: ${json.result}`);
  }

  return json;
}

export async function checkVerificationStatus(
  etherscanApiUrl: string,
  req: EtherscanCheckStatusRequest,
): Promise<void | Error> {
  console.log('checking');

  const parameters = new URLSearchParams({ ...req });
  const urlWithQuery = new URL(etherscanApiUrl);
  urlWithQuery.search = parameters.toString();

  try {
    const response = await fetch(urlWithQuery.toString());

    if (!response.ok) {
      const responseText = await response.text();
      const message = `Error: HTTP request failed. ${responseText}`;

      return new Error(message);
    }

    const json = (await response.json()) as EtherscanVerifyResponse;

    if (json.result === 'Pending in queue') {
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          const result = await checkVerificationStatus(etherscanApiUrl, req);

          if (result instanceof Error) {
            reject(result);
          } else {
            resolve();
          }
        }, 1200);
      });
    }

    if (
      json.result !== 'Pass - Verified' &&
      json.result !== 'Already Verified'
    ) {
      return new Error('Failed to verify: ' + json.result);
    }

    console.log('result', json);
  } catch (error) {
    return error as Error;
  }
}
