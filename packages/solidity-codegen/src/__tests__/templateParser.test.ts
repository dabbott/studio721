import { generateURI, parseURITemplate } from '../templateParser';

it('parses', () => {
  const result = parseURITemplate('hello');

  expect(result).toMatchSnapshot();
});

it('parses identifier', () => {
  const result = parseURITemplate('a {tokenId} c {parameters}');

  expect(result).toMatchSnapshot();
});

it('fails to parse', () => {
  const result = parseURITemplate('a {tokenId} c parameters}');

  expect(result).toMatchSnapshot();
});

it('generates basic uri', () => {
  const result = generateURI('hello', 0, []);

  expect(result).toEqual('hello');
});

it('generates uri with token', () => {
  const result = generateURI('hello{tokenId}', 0, []);

  expect(result).toEqual('hello0');
});

it('generates uri with token & parameters', () => {
  const result = generateURI('hello{tokenId}{parameters}', 0, [
    {
      name: 'a',
      type: 'uint256',
    },
  ]);

  expect(result).toEqual('hello0?a=0');
});
