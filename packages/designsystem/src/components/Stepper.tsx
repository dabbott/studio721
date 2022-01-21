import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { HStack } from 'components';
import { Button, InputField } from 'designsystem';
import React, { useCallback, useMemo } from 'react';

interface Props {
  inputValue: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  placeholder?: string;
  disabled?: boolean;
}

export function validateNumberInput(
  inputValue: string,
  min: number,
  max: number,
) {
  const number = Number(inputValue);

  if (!Number.isInteger(number) || number < min || number > max)
    return undefined;

  return number;
}

export function Stepper({
  inputValue,
  onChange,
  min,
  max,
  placeholder,
  disabled,
}: Props) {
  const inputNumber = useMemo(
    () => validateNumberInput(inputValue, min, max),
    [inputValue, max, min],
  );

  const handleClickPlus = useCallback(() => {
    onChange(
      inputNumber === undefined ? '1' : String(Math.min(inputNumber + 1, max)),
    );
  }, [inputNumber, max, onChange]);

  const handleClickMinus = useCallback(() => {
    onChange(
      inputNumber === undefined ? '1' : String(Math.max(inputNumber - 1, min)),
    );
  }, [inputNumber, min, onChange]);

  return (
    <HStack alignItems="center" flex="1 1 0px" gap={10}>
      <Button
        onClick={handleClickMinus}
        disabled={disabled}
        style={{ alignSelf: 'stretch' }}
      >
        <MinusIcon />
      </Button>
      <InputField.Root id="input-multi-mint" flex="1 1 0px">
        <InputField.Input
          disabled={disabled}
          value={inputValue}
          placeholder={placeholder}
          type="text"
          style={{
            textAlign: 'center',
            padding: '8px 8px',
            fontSize: '1rem',
            lineHeight: '1',
            opacity: disabled ? 0.5 : undefined,
          }}
          onChange={onChange}
          onBlur={() => {
            const number = validateNumberInput(inputValue, min, max);

            if (number === undefined) {
              onChange('1');
            }
          }}
        />
      </InputField.Root>
      <Button
        onClick={handleClickPlus}
        disabled={disabled}
        style={{ alignSelf: 'stretch' }}
      >
        <PlusIcon />
      </Button>
    </HStack>
  );
}
