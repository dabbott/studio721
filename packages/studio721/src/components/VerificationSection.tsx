import React, { memo } from 'react';
import { LinkChip } from 'components';
import { SpacerVertical } from 'components';
import { FormRow, FormSection, InfoHoverCard } from 'components';
import { InputField } from 'designsystem';
import { Action } from 'state';

interface Props {
  etherscanApiKey: string;
  dispatch: (action: Action) => void;
}

export const VerificationSection = memo(function VerificationSection({
  etherscanApiKey,
  dispatch,
}: Props) {
  return (
    <FormSection
      title={
        <>
          Contract Verification{' '}
          <InfoHoverCard top="1px">
            Verifying your contract lets other people read the source code and
            interact with the contract API on Etherscan.
            <SpacerVertical size={20} />
            This is highly recommended so that people can choose whether or not
            they trust and want to use a contract.
            <SpacerVertical size={20} />
            You{"'"}ll need to create an account on Etherscan, but the default
            plan is free and sufficient for most usage.{' '}
            <LinkChip href="https://etherscan.io/apis" openInNewTab>
              Etherscan API portal
            </LinkChip>
          </InfoHoverCard>
        </>
      }
    >
      <FormRow title="Etherscan API Key">
        <InputField.Root id="input-etherscan-api-key">
          <InputField.Input
            type="password"
            value={etherscanApiKey}
            onChange={(value) => {
              dispatch({ type: 'setEtherscanApiKey', value });
            }}
          />
        </InputField.Root>
      </FormRow>
    </FormSection>
  );
});
