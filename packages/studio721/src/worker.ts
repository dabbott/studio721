import { WorkerRequest, WorkerResponse } from 'utils';

import { getCompiler } from 'solidity-compiler';

const compilerPromise = getCompiler();

// eslint-disable-next-line no-restricted-globals
addEventListener('message', async (event) => {
  const request = event.data as WorkerRequest;

  switch (request.type) {
    case 'compile': {
      const compiler = await compilerPromise;

      const output = compiler.compile(request.request.input);

      const response: WorkerResponse = {
        id: request.id,
        type: request.type,
        response: { output },
      };

      postMessage(response);
    }
  }
});
