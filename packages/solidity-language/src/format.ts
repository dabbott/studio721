import { Doc, doc } from 'prettier';
import * as AST from './ast';

const { group, join, hardline, softline, line, indent, ifBreak } = doc.builders;

export function formatBlockComment(node: AST.BlockComment): Doc {
  switch (node.commentType) {
    case '/*':
      return `/** ${node.value} **/`;
    case '//':
      return group(
        join(
          hardline,
          node.value.split('\n').map((v) => `// ${v}`),
        ),
      );
  }
}

export function formatProgram(node: AST.Program): Doc {
  const importsDoc = join(hardline, node.imports.map(formatImport));
  return join(
    [hardline, hardline],
    [
      ...(node.license ? [`// SPDX-License-Identifier: ${node.license}`] : []),
      ...(node.pragma ? [formatPragma(node.pragma)] : []),
      importsDoc,
      ...node.body.map((child) => {
        switch (child.type) {
          case 'blockComment':
            return formatBlockComment(child);
          case 'contractDeclaration':
            return formatContract(child);
          default:
            throw new Error('Bad node type');
        }
      }),
    ],
  );
}

export function formatVariableDeclaration(node: AST.VariableDeclaration): Doc {
  if (node.initializer) {
    return group([
      group(
        join(line, [node.typeAnnotation, ...node.modifiers, node.name, '=']),
      ),
      indent([line, [formatExpression(node.initializer), ';']]),
    ]);
  } else {
    return group(
      join(line, [node.typeAnnotation, ...node.modifiers, [node.name, ';']]),
    );
  }
}

export function formatDeclaration(
  node: AST.Declaration | AST.BlockComment,
): Doc {
  switch (node.type) {
    case 'usingDeclaration':
      return `using ${node.alias} for ${node.forProperty};`;
    case 'blockComment':
      return formatBlockComment(node);
    case 'functionDeclaration':
      return group(
        join(line, [
          group([
            group([
              group([
                'function',
                line,
                [node.name, ['(', node.arguments.join(', '), ')']],
              ]),
              indent([line, join(line, node.modifiers)]),
            ]),
            ...(node.returns
              ? [
                  indent([
                    line,
                    'returns ',
                    '(',
                    node.returns.typeAnnotation,
                    ...(node.returns.modifiers.length > 0
                      ? [' ', ...node.returns.modifiers]
                      : []),
                    ')',
                  ]),
                ]
              : []),
          ]),
          [
            '{',
            indent([
              hardline,
              join([hardline, hardline], node.body.map(formatStatement)),
            ]),
            hardline,
            '}',
          ],
        ]),
      );
    case 'constructorDeclaration':
      return group(
        join(line, [
          group([
            group([
              'constructor',
              group([
                '(',
                indent([softline, join([',', line], node.arguments)]),
                softline,
                ')',
              ]),
            ]),
            ...(node.super
              ? [indent([line, formatExpression(node.super)])]
              : []),
          ]),
          [
            '{',
            ...(node.body.length > 0
              ? [
                  indent([
                    hardline,
                    join([hardline, hardline], node.body.map(formatStatement)),
                  ]),
                  hardline,
                ]
              : []),
            '}',
          ],
        ]),
      );
    case 'structDeclaration':
      return group(
        join(line, [
          group([group(['struct', line, node.name])]),
          [
            '{',
            indent([
              hardline,
              join(
                [hardline],
                node.body.map((item) => `${item.typeAnnotation} ${item.name};`),
              ),
            ]),
            hardline,
            '}',
          ],
        ]),
      );
    case 'variableDeclaration':
      return formatVariableDeclaration(node);
    case 'contractDeclaration':
      return formatContract(node);
  }
}

export function formatStatement(node: AST.Statement | AST.BlockComment): Doc {
  switch (node.type) {
    case 'blockComment':
      return formatBlockComment(node);
    case 'declarationStatement':
      return formatDeclaration(node.declaration);
    case 'expressionStatement':
      return [formatExpression(node.expression), ';'];
    case 'returnStatement': {
      if (!node.expression) {
        return 'return;';
      }

      return group([
        'return',
        ifBreak([' (']),
        group(indent([line, formatExpression(node.expression)])),
        ifBreak([line, ')']),
        ';',
      ]);
    }
    case 'forStatement':
      return [
        'for (',
        node.pre,
        '; ',
        node.update,
        '; ',
        node.post,
        ') ',
        [
          '{',
          indent([
            hardline,
            join([hardline, hardline], node.body.map(formatStatement)),
          ]),
          hardline,
          '}',
        ],
      ];
    case 'ifStatement':
      return [
        'if (',
        formatExpression(node.condition),
        ') {',
        indent([
          hardline,
          join([hardline, hardline], node.body.map(formatStatement)),
        ]),
        hardline,
        '}',
        ...(node.alternate
          ? [
              ' else {',
              indent([
                hardline,
                join([hardline, hardline], node.alternate.map(formatStatement)),
              ]),
              hardline,
              '}',
            ]
          : []),
      ];
  }
}

export function formatContract(node: AST.ContractDeclaration): Doc {
  return group([
    group(
      join(line, [
        'contract',
        node.name,
        ...(node.extends.length > 0
          ? ['is', join([',', line], node.extends)]
          : []),
      ]),
    ),
    line,
    '{',
    ...(node.body.length > 0
      ? [
          indent([
            hardline,
            join([hardline, hardline], node.body.map(formatDeclaration)),
          ]),
          hardline,
        ]
      : []),
    '}',
  ]);
}

export function formatImport(node: AST.Import): Doc {
  if (node.names.length > 0) {
    return `import {${node.names.join(', ')}} from "${node.path}";`;
  }

  return `import "${node.path}";`;
}

export function formatPragma(node: AST.Pragma): Doc {
  return `pragma ${node.value};`;
}

export function formatLiteral(node: AST.Literal): Doc {
  return node.value;
}

export function formatExpression(node: AST.Expression): Doc {
  switch (node.type) {
    case 'identifier':
      return node.value;
    case 'literal':
      return formatLiteral(node.value);
    case 'assignmentExpression':
      return group([
        formatExpression(node.lhs),
        ' = ',
        formatExpression(node.rhs),
      ]);
    case 'binaryExpression':
      return group([
        group([formatExpression(node.lhs), line, node.operator]),
        line,
        formatExpression(node.rhs),
      ]);
    case 'memberExpression':
      return group([
        formatExpression(node.object),
        '.',
        formatExpression(node.member),
      ]);
    case 'indexAccessExpression':
      return group([
        formatExpression(node.object),
        '[',
        formatExpression(node.index),
        ']',
      ]);
    case 'functionCallExpression':
      const args = node.arguments ?? [];
      const hasNamedArgs = !Array.isArray(args);

      return group([
        formatExpression(node.callee),
        group([
          hasNamedArgs ? '({' : '(',
          indent([
            softline,
            join(
              [',', line],
              Array.isArray(args)
                ? args.map(formatExpression)
                : Object.entries(args).map(([key, value]) =>
                    group([key, ':', line, formatExpression(value)]),
                  ),
            ),
          ]),
          softline,
          hasNamedArgs ? '})' : ')',
        ]),
      ]);
  }
}

export function print(
  document: Doc,
  options: doc.printer.Options = {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
  },
) {
  return doc.printer.printDocToString(document, options).formatted;
}
