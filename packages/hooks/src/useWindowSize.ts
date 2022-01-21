import { useEffect, useState } from "react";

export function useWindowSize() {
  const [size, setSize] = useState(
    typeof window !== "undefined"
      ? {
          width: window.innerWidth,
          height: window.innerHeight,
        }
      : { width: 0, height: 0 }
  );

  useEffect(() => {
    function handleLayoutChange() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleLayoutChange);

    return () => {
      window.removeEventListener("resize", handleLayoutChange);
    };
  }, []);

  return size;
}
