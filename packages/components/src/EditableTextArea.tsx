import React from 'react';
import styled from 'styled-components';

const StyledTextArea = styled.textarea({
  background: 'none',
  appearance: 'none',
  resize: 'none',
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  fontFamily: 'inherit',
  fontWeight: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  color: 'inherit',
  outline: '1px solid rgba(255,255,255,0.2)',

  '&::placeholder': {
    color: 'inherit',
    opacity: 0.5,
  },
});

export function EditableTextArea({
  editing,
  value,
  placeholder,
  onChange,
}: {
  editing: boolean;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return editing ? (
    <>
      <StyledTextArea
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
      <span
        style={{
          visibility: 'hidden',
          whiteSpace: 'pre-wrap',
        }}
      >
        {!value || value.endsWith('\n') ? `${value} ` : value}
      </span>
    </>
  ) : (
    <>{value || ''}</>
  );
}
