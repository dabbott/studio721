import { Lexer, rule, state, Token } from 'language-tools';
import { TokenParameter } from 'state';
import { encodeQueryParameters } from 'utils';

const lexer = new Lexer([
  state('main', [
    rule('open', '{', {
      discard: true,
      action: { type: 'push', value: 'variable' },
    }),
    ['content', '([^{]+)'],
  ]),
  state('variable', [
    rule('close', '}', { discard: true, action: { type: 'pop' } }),
    ['identifier', '([^}]+)'],
  ]),
]);

export type TokenizerResult =
  | { type: 'success'; value: Token[] }
  | { type: 'failure'; message: string };

export function parseTemplate(string: string): TokenizerResult {
  const result = lexer.tokenize(string);

  for (const token of result) {
    if (
      token.type === 'content' &&
      token.values.some((value) => value.includes('{') || value.includes('}'))
    ) {
      return { type: 'failure', message: "Brackets {} don't match!" };
    }
  }

  return { type: 'success', value: result };
}

export function parseURITemplate(string: string): TokenizerResult {
  const result = parseTemplate(string);

  if (result.type === 'success') {
    for (const token of result.value) {
      if (
        token.type === 'identifier' &&
        token.values.some((value) => !['tokenId', 'parameters'].includes(value))
      ) {
        return {
          type: 'failure',
          message: `Unrecognized variable {${token.values[0]}}.`,
        };
      }
    }
  }

  return result;
}

export function generateURI(
  template: string,
  tokenId: number,
  tokenParameters: TokenParameter[],
): string | undefined {
  const parsed = parseURITemplate(template);

  if (parsed.type === 'failure') return;

  return parsed.value
    .map((token) => {
      switch (token.type) {
        case 'content':
          return token.values.join('');
        case 'identifier': {
          switch (token.values[0]) {
            case 'tokenId':
              return tokenId.toString();
            case 'parameters':
              if (tokenParameters.length === 0) return '';

              return (
                '?' +
                encodeQueryParameters(
                  Object.fromEntries(tokenParameters.map((p) => [p.name, 0])),
                )
              );
            default:
              return '';
          }
        }
        default:
          throw new Error('Bad token type');
      }
    })
    .join('');
}

export function populateTemplate(
  template: string,
  parameters: Record<string, string>,
): string | undefined {
  const parsed = parseTemplate(template);

  if (parsed.type === 'failure') return;

  return parsed.value
    .map((token) => {
      switch (token.type) {
        case 'content':
          return token.values.join('');
        case 'identifier':
          return parameters[token.values[0]] ?? '';
        default:
          throw new Error('Bad token type');
      }
    })
    .join('');
}

export function getBaseURI(template: string): string | undefined {
  const parsed = parseURITemplate(template);

  if (parsed.type === 'failure' || parsed.value[0].type === 'identifier')
    return '';

  return parsed.value[0].values.join('');
}
