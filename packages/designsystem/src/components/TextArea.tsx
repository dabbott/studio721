import styled from 'styled-components';
import { Property } from 'csstype';

export const TextArea = styled.textarea<{
  textAlign?: Property.TextAlign;
  disabled?: boolean;
}>(({ theme, textAlign, disabled }) => ({
  ...theme.textStyles.small,
  color: disabled ? theme.colors.textDisabled : theme.colors.text,
  width: '0px', // Reset intrinsic width
  flex: '1 1 0px',
  position: 'relative',
  border: '0',
  outline: 'none',
  minWidth: '0',
  textAlign: textAlign ?? 'left',
  alignSelf: 'stretch',
  borderRadius: '4px',
  paddingTop: '4px',
  paddingBottom: '4px',
  paddingLeft: '6px',
  paddingRight: '6px',
  background: disabled ? '#282828' : theme.colors.inputBackground,
  '&:focus': {
    boxShadow: `0 0 0 2px ${theme.colors.primary}`,
  },
}));
