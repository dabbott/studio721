import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Caret } from 'components';
import { SpacerHorizontal } from './Spacer';
import { Body } from './Text';

export type ButtonVariant = 'thin' | 'medium' | 'regular' | 'header';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  showsCaret?: boolean;
  as?: any;
  href?: string;
  variant?: ButtonVariant;
}

const Container = styled.button<{ variant: ButtonVariant }>(
  ({ theme, disabled, variant }) => ({
    appearance: 'none',
    padding:
      variant === 'header'
        ? '4px 8px'
        : variant === 'thin'
        ? '0 16px'
        : variant === 'medium'
        ? '8px 12px'
        : '12px 16px',
    // background: "#7a6af7",
    background: disabled ? '#444' : 'linear-gradient(45deg, #7a6af7, #bb47bb)',
    border: disabled ? '1px solid #555' : undefined,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    cursor: 'pointer',
    userSelect: 'none',
  }),
);

const CaretContainer = styled.span({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  height: '24px',
  width: '24px',
  borderRadius: '50%',
  cursor: 'pointer',
  userSelect: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export function Button({
  as,
  children,
  onClick,
  disabled,
  showsCaret = false,
  variant = 'regular',
  href,
}: Props) {
  return (
    <Container
      as={as}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      {...(href && {
        href,
      })}
    >
      <Body
        color={disabled ? '#888' : 'white'}
        fontWeight={600}
        {...((variant === 'thin' || variant === 'header') && {
          fontSize: '0.9rem',
        })}
      >
        {children}
      </Body>
      {!disabled && showsCaret && (
        <>
          <SpacerHorizontal size={8} />
          <CaretContainer>
            <Caret strokeWidth={3.5} color="white" direction="right" />
          </CaretContainer>
        </>
      )}
    </Container>
  );
}
