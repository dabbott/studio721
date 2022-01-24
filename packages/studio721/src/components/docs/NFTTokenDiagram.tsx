import { HStack, Label, Small, SpacerVertical, VStack } from 'components';
import { ReactNode } from 'react';
import { VerticalSpacer } from 'react-guidebook';
import styled, { useTheme } from 'styled-components';

function LinkCell({ href }: { href: string }) {
  return (
    <a
      style={{ color: 'white', textDecoration: 'underline' }}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {href}
    </a>
  );
}

const PillElement = styled.span<{ background: string }>(({ background }) => ({
  padding: '4px 16px',
  background,
  borderRadius: 100,
  display: 'flex',
  flex: '1 1 0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'pre',
}));

function Pill({
  children,
  background,
}: {
  children: ReactNode;
  background: string;
}) {
  return (
    <HStack>
      <PillElement background={background}>
        <Small
          fontWeight="bold"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="pre"
        >
          {children}
        </Small>
      </PillElement>
    </HStack>
  );
}

export function NFTTokenDiagram() {
  const theme = useTheme();

  const mapping = [
    {
      id: '0',
      owner: '0x5BF4be9de72713bFE39A30EbE0691afd5fb7413a',
      uri: <LinkCell href="https://www.721.so/api/example/metadata/0" />,
      background: theme.colors.primary,
    },
    {
      id: '1',
      owner: '0x61E1a6Ed9109F554Bb785815D9f2C65f4a4C41A5',
      uri: <LinkCell href="https://www.721.so/api/example/metadata/1" />,
      background: '#578cf1',
    },
    {
      id: '2',
      owner: '0xb794f5Ea0ba39494cE839613fffba74279579268',
      uri: <LinkCell href="https://www.721.so/api/example/metadata/2" />,
      background: '#42b1a3',
    },
  ];

  return (
    <VStack
      margin={'20px 0'}
      padding={20}
      // border={`1px solid ${theme.colors.primary}`}
      borderRadius={4}
      background={'#8c7dfd40'}
    >
      <HStack gap={30}>
        <VStack gap={10} flex="0 0 auto" alignItems="flex-start">
          <Label fontFamily="monospace" fontWeight="bold">
            ID
          </Label>
          <SpacerVertical size={0} />
          {mapping.map(({ id, background }) => (
            <Pill background={background} key={id}>
              {id}
            </Pill>
          ))}
        </VStack>
        <VStack gap={10} flex="1" overflow="hidden">
          <Label fontFamily="monospace" fontWeight="bold">
            Owner
          </Label>
          <SpacerVertical size={0} />
          {mapping.map(({ id, background, owner }) => (
            <Pill background={background} key={id}>
              {owner}
            </Pill>
          ))}
        </VStack>
        <VStack gap={10} flex="1" overflow="hidden">
          <Label fontFamily="monospace" fontWeight="bold">
            Token URI
          </Label>
          <SpacerVertical size={0} />
          {mapping.map(({ id, background, uri }) => (
            <Pill background={background} key={id}>
              {uri}
            </Pill>
          ))}
        </VStack>
      </HStack>
      <VerticalSpacer size={10} />
    </VStack>
  );
}
