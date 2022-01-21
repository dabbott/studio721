import styled from 'styled-components';

export const OrderedList = styled.ol({
  marginTop: '0px',
  marginBottom: '10px',
  display: 'block',
  paddingLeft: '40px',
  paddingTop: '5px',
  paddingBottom: '5px',
  fontSize: '1.1rem',
  fontWeight: 400,
  lineHeight: '1.75',
  listStylePosition: 'outside',
});

export const UnorderedList = styled.ul<{ itemGap?: string }>(
  ({ itemGap = '20px' }) => ({
    marginTop: '0px',
    marginBottom: '10px',
    display: 'block',
    paddingTop: '5px',
    paddingBottom: '5px',
    fontSize: '1.1rem',
    fontWeight: 400,
    lineHeight: '1.75',
    listStylePosition: 'outside',

    '& > li + & > li': {
      marginTop: itemGap,
    },
  }),
);

export const ListItem = styled.li({});
