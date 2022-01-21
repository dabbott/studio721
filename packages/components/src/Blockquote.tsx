import styled from "styled-components";

export const Blockquote = styled.blockquote(({ theme }) => ({
  ...theme.textStyles.body,
  backgroundColor: "rgba(255,255,255,0.1)",
  borderLeft: `4px solid ${theme.colors.primaryMuted}`,
  padding: "8px 12px",
  marginBottom: "12px",
}));
