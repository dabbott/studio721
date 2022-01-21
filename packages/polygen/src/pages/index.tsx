import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import { Address, ChainId, createAddress } from '@openpalette/contract';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import {
  getHeadTags,
  Heading1,
  Heading2,
  HStack,
  Label,
  Regular,
  Small,
  VStack,
} from 'components';
import { useWeb3Data } from 'contexts';
import { functionOutputToString, useReadOnlyContractData } from 'contract-data';
import { ethers } from 'ethers';
import { useFetch } from 'hooks';
import Head from 'next/head';
import React, { memo, useMemo } from 'react';
import styled from 'styled-components';
import { getFirstFunctionFragment, GuidebookConfig } from 'utils';

const ImagePreview = styled.img({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  objectPosition: 'center',
});

const config: GuidebookConfig = {
  title: 'polygen.art',
  location: {
    host: 'www.polygen.art',
  },
  author: {
    twitter: 'polygenart',
  },
  favicons: [
    {
      type: 'image/x-icon',
      path: '/favicon.ico',
    },
  ],
  previewImage: {
    type: 'image/png',
    width: '1200',
    height: '630',
    alt: 'polygen.art',
    path: '/replace-me.png',
  },
};

const contractUriAbi = {
  inputs: [],
  name: 'contractURI',
  outputs: [
    {
      internalType: 'string',
      name: '',
      type: 'string',
    },
  ],
  stateMutability: 'view',
  type: 'function',
} as const;

const ownerAbi = {
  inputs: [],
  name: 'owner',
  outputs: [
    {
      internalType: 'address',
      name: '',
      type: 'address',
    },
  ],
  stateMutability: 'view',
  type: 'function',
};

type ContractMetadata = {
  name: string;
  description: string;
  image: string;
  external_link: string;
  seller_fee_basis_points: number;
  fee_recipient: Address;
};

const ContractOverview = memo(function ContractOverview({
  contractAddress,
  chainId,
  provider,
}: {
  contractAddress: Address;
  chainId: ChainId;
  provider: ethers.providers.Web3Provider;
}) {
  // const abi = useFetch<{ abi: any }>(
  //   `${getEtherActorBaseURL(chainId)}/${contractAddress}.json`,
  // );

  const contract = useMemo(() => {
    const iface = new Interface([contractUriAbi, ownerAbi]);
    return new Contract(contractAddress, iface, provider);
  }, [contractAddress, provider]);

  const contractURIFragment = getFirstFunctionFragment(contract.interface, {
    name: 'contractURI',
  })!;

  const ownerFragment = getFirstFunctionFragment(contract.interface, {
    name: 'owner',
  })!;

  const contractURI = useReadOnlyContractData({
    fragment: contractURIFragment,
    contract,
    chainId,
  });

  const owner = useReadOnlyContractData({
    fragment: ownerFragment,
    contract,
    chainId,
  });

  const contractMetadata = useFetch<ContractMetadata>(
    contractURI.type === 'success'
      ? functionOutputToString(chainId, contractURIFragment, contractURI.value)
      : undefined,
  );

  if (contractMetadata.type === 'pending' || owner.type === 'pending') {
    return <Small>Loading</Small>;
  }

  if (contractMetadata.type === 'failure') {
    return <Small>Error: {contractMetadata.value.message}</Small>;
  }

  if (owner.type === 'failure') {
    return <Small>Error: {owner.value.message}</Small>;
  }

  return (
    <HStack background="#f7d41a" padding={20} borderRadius={4} gap={20}>
      <VStack flex="1 1 auto">
        <Heading2 color="black">{contractMetadata.value.name}</Heading2>
        <Regular>{contractMetadata.value.description}</Regular>
        <Label color={'rgba(0,0,0,0.5)'}>By {owner.value}</Label>
      </VStack>
      <VStack minWidth={200}>
        <AspectRatio.Root ratio={1}>
          <ImagePreview src={contractMetadata.value.image} />
        </AspectRatio.Root>
      </VStack>
    </HStack>
  );
});

const contractList = [
  '0xC70E5CCcFFBAF16F1E3e1E33B3b3FCcdE543cd0a',
  '0xC70E5CCcFFBAF16F1E3e1E33B3b3FCcdE543cd0a',
].map(createAddress);

export default function PolygenArt() {
  const data = useWeb3Data();

  return (
    <>
      <Head>
        <title>polygen.art</title>
        {getHeadTags({
          pageTitle: 'polygen.art',
          pageDescription:
            'A generative art platform on the Polygon blockchain',
          config,
        })}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <VStack
        margin={'60px 0 0 0'}
        flex={'1 1 0px'}
        background={'linear-gradient(white, #d5d0ff)'}
      >
        <Heading1>polygen.art</Heading1>
        <VStack gap={20}>
          {data &&
            contractList.map((contractAddress) => (
              <ContractOverview
                provider={data.provider}
                chainId={data.chainId}
                contractAddress={contractAddress}
              />
            ))}
        </VStack>
      </VStack>
    </>
  );
}
