import React from 'react';
import { CSSProperties } from 'react';

export function InputField({
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'search' | 'password';
  placeholder?: string;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <input
      disabled={disabled}
      value={value}
      type={type}
      placeholder={placeholder}
      style={{
        appearance: 'none',
        WebkitAppearance: 'none',
        flex: '1',
        color: 'black',
        background: 'white',
        padding: '8px 8px',
        fontSize: '16px',
        opacity: disabled ? 0.5 : undefined,
        ...style,
      }}
      onChange={(event) => {
        const newValue = event.target.value;
        onChange(newValue);
      }}
    />
  );
}
