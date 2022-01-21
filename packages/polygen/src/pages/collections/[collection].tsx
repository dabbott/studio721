import { GetStaticPaths, GetStaticProps } from 'next';
import { variant } from '../../components/Grid';

export default function Collection() {
  return (
    <>
      <h1 css={{ gridColumn: '2/-2' }}>Geo Terraces #349/1000</h1>

      <p css={{ gridColumn: '2/6' }}>
        Animated terraces using various materials to produce one of a kind art.
        10% of the proceeds go to ThreeJS, React Three Fiber, and The Processing
        Foundation.
      </p>

      <div
        css={variant({
          small: { gridColumn: '1/-1' },
          medium: { gridColumn: '2/8' },
        })}
      >
        <div css={{ width: '100%', height: 400, backgroundColor: 'grey' }} />
      </div>

      <div
        css={variant({
          small: {
            display: 'flex',
            flexDirection: 'column',
            gridColumn: '1/-1',
            placeSelf: 'center',
            gap: 8,
          },
          medium: {
            gridColumn: '8/-2',
          },
        })}
      >
        <dl
          css={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 8,
            dt: { textAlign: 'right' },
          }}
        >
          <dt>Owned By:</dt>
          <dd>xXCryptoKidXx</dd>
          <dt>Library:</dt>
          <dd>react-three-fiber</dd>
          <dt>Artist:</dt>
          <dd>@souporserious</dd>
        </dl>
        <a>View on OpenSea</a>
        <a>View on Etherscan</a>
      </div>

      <div css={{ gridColumn: '2/-2' }}>
        <h3>Tokens</h3>
        <ul>
          <li>Token</li>
        </ul>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { collection: 'geo-terraces' } }],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  return {
    props: { collection: params?.collection },
  };
};
