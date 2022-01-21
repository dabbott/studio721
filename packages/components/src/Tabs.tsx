import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { HStack, VStack } from './Stack';
import { Label } from './Text';

const Tab = styled.button<{ selected: boolean }>(({ theme, selected }) => ({
  padding: '8px 16px',
  border: 'none',
  background: selected ? theme.colors.primary : 'rgba(255,255,255,0.2)',
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
}));

interface Props<T extends string> {
  selectedTabId: T;
  tabIds: T[];
  renderTitle?: (id: T) => ReactNode;
  renderContent: (id: T) => ReactNode;
  onChangeTabId?: (id: T) => void;
}

export function Tabs<T extends string>({
  selectedTabId,
  onChangeTabId,
  tabIds,
  renderTitle,
  renderContent,
}: Props<T>) {
  return (
    <VStack gap={40}>
      <HStack gap={10}>
        {tabIds.map((id) => {
          const selected = id === selectedTabId;

          return (
            <Tab
              key={id}
              selected={selected}
              onClick={() => {
                onChangeTabId?.(id);
              }}
            >
              <Label color={selected ? 'white' : 'lightgrey'}>
                {renderTitle?.(id) ?? id}
              </Label>
            </Tab>
          );
        })}
      </HStack>
      <VStack>{renderContent(selectedTabId)}</VStack>
    </VStack>
  );
}
