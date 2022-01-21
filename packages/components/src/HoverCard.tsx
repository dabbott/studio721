import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import React, { ReactNode } from "react";
import styled from "styled-components";

const StyledContent = styled(HoverCardPrimitive.Content)(({ theme }) => ({
  ...theme.textStyles.small,
  padding: "8px 12px",
  width: 400,
  lineHeight: "1.7",
  backgroundColor: "#333",
  boxShadow:
    "hsl(206 22% 7% / 50%) 0px 10px 38px -10px, hsl(206 22% 7% / 35%) 0px 10px 20px -15px",
  wordBreak: "break-word",
  borderRadius: "4px",
}));

const StyledArrow = styled(HoverCardPrimitive.Arrow)({
  fill: "#333",
});

const HoverCardRoot = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;
const HoverCardContent = StyledContent;
const HoverCardArrow = StyledArrow;

export const HoverCard = ({
  trigger,
  children,
}: {
  trigger: ReactNode;
  children: ReactNode;
}) => (
  <HoverCardRoot>
    <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
    <HoverCardContent sideOffset={4}>
      {children}
      <HoverCardArrow offset={4} />
    </HoverCardContent>
  </HoverCardRoot>
);
