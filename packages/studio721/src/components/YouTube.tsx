import { memo } from 'react';
import styled from 'styled-components';

const Embed = styled.iframe({
  width: '100%',
  aspectRatio: '16 / 9',
  border: 'none',
});

export const YouTube = memo(function YouTube({ src }: { src: string }) {
  return (
    <Embed
      src={src}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
});
