import { CompilerInput, CompilerOutput } from "hardhat/types";

export type SolidityCompilerContract = {
  abi: any[];
  evm: {
    bytecode: any;
    deployedBytecode: any;
  };
};

export type SolidityCompilerOutput = { errors: any[] } | CompilerOutput;

export type WorkerCommand = {
  id: number;
  type: "compile";
  request: {
    input: CompilerInput;
  };
  response: {
    output: SolidityCompilerOutput;
  };
};

export type WorkerRequest = Pick<WorkerCommand, "id" | "type" | "request">;
export type WorkerResponse = Pick<WorkerCommand, "id" | "type" | "response">;
