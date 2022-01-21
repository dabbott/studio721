import styled from "styled-components";

export const Divider = styled.div<{ variant?: "dark" | "light" }>(
  ({ variant = "dark" }) => ({
    height: "1px",
    minHeight: "1px",
    maxHeight: "1px",
    backgroundColor:
      variant === "dark" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.1)",
  })
);
