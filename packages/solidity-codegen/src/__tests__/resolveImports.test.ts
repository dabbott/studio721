import {
  getContractURI,
  normalizeImport,
  parseImports,
} from '../resolveImports';

it('parses imports', () => {
  const imports = parseImports(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "gwei-slim-nft-contracts/contracts/base/ERC721Base.sol";
import {IBaseERC721Interface, ConfigSettings} from "gwei-slim-nft-contracts/contracts/base/ERC721Base.sol";
import {ERC721Delegated} from "gwei-slim-nft-contracts/contracts/base/ERC721Delegated.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TestToken is ERC721, ReentrancyGuard, Ownable {}  
`);

  expect(imports).toEqual([
    'gwei-slim-nft-contracts/contracts/base/ERC721Base.sol',
    'gwei-slim-nft-contracts/contracts/base/ERC721Base.sol',
    'gwei-slim-nft-contracts/contracts/base/ERC721Delegated.sol',
    '@openzeppelin/contracts/security/ReentrancyGuard.sol',
    '@openzeppelin/contracts/token/ERC721/ERC721.sol',
    '@openzeppelin/contracts/access/Ownable.sol',
    '@openzeppelin/contracts/utils/Counters.sol',
  ]);
});

it('normalizes relative import', async () => {
  const normalized = normalizeImport(
    '@openzeppelin/contracts/token/ERC721/ERC721.sol',
    '../../utils/Address.sol',
  );

  expect(normalized).toEqual('@openzeppelin/contracts/utils/Address.sol');
});

it('normalizes absolute import', async () => {
  const normalized = normalizeImport(
    '@openzeppelin/contracts/token/ERC721/ERC721.sol',
    '@openzeppelin/contracts/utils/Address.sol',
  );

  expect(normalized).toEqual('@openzeppelin/contracts/utils/Address.sol');
});

it('get contract uri', async () => {
  const uri = getContractURI('@openzeppelin/contracts/token/ERC721/ERC721.sol');

  expect(uri).toEqual(
    'https://unpkg.com/@openzeppelin/contracts/token/ERC721/ERC721.sol',
  );
});

it('get contract uri with version', async () => {
  const uri = getContractURI(
    '@openzeppelin/contracts/token/ERC721/ERC721.sol',
    {
      '@openzeppelin/contracts': '4.3.2',
      'gwei-slim-nft-contracts': '1.0.3',
    },
  );

  expect(uri).toEqual(
    'https://unpkg.com/@openzeppelin/contracts@4.3.2/token/ERC721/ERC721.sol',
  );
});

// it("downloads dependencies", async () => {
//   const dependencies = await downloadDependencies(
//     fetch,
//     ["@openzeppelin/contracts/token/ERC721/ERC721.sol"],
//     "4.3.2"
//   );

//   expect(Object.keys(dependencies).sort()).toMatchSnapshot();
// });

// it("downloads dependencies for source", async () => {
//   const dependencies = await downloadDependenciesForSource(
//     fetch,
//     "TestToken.sol",
//     `// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// contract TestToken is ERC721 {}`
//   );

//   expect(Object.keys(dependencies).sort()).toMatchSnapshot();
// });
