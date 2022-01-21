import { AST } from 'solidity-language';

export function generateImports({
  address,
  strings,
  enumerable,
  royalties,
  delegation,
  hasAccessToken,
}: {
  address: boolean;
  strings: boolean;
  enumerable: boolean;
  royalties: boolean;
  delegation: boolean;
  hasAccessToken: boolean;
}): AST.Import[] {
  const paths: (string | AST.Import)[] = [
    ...(delegation
      ? [
          {
            path: 'gwei-slim-nft-contracts/contracts/base/ERC721Base.sol',
            names: ['ConfigSettings'],
          },
          {
            path: 'gwei-slim-nft-contracts/contracts/base/ERC721Delegated.sol',
            names: ['ERC721Delegated'],
          },
          ...(hasAccessToken
            ? ['@openzeppelin/contracts/token/ERC721/IERC721.sol']
            : []),
        ]
      : [
          '@openzeppelin/contracts/token/ERC721/ERC721.sol',
          '@openzeppelin/contracts/access/Ownable.sol',
        ]),
    '@openzeppelin/contracts/security/ReentrancyGuard.sol',
    ...(enumerable
      ? ['@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol']
      : []),
    ...(royalties ? ['@openzeppelin/contracts/interfaces/IERC2981.sol'] : []),
    '@openzeppelin/contracts/utils/Counters.sol',
    ...(address ? ['@openzeppelin/contracts/utils/Address.sol'] : []),
    ...(strings ? ['@openzeppelin/contracts/utils/Strings.sol'] : []),
  ];

  return paths.map((pathOrImport) => {
    if (typeof pathOrImport === 'string') {
      return { path: pathOrImport, names: [] };
    } else {
      return pathOrImport;
    }
  });
}
