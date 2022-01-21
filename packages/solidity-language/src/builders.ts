import { Optional } from 'utility-types';
import * as AST from './ast';

export function identifierExpression(name: string): AST.IdentifierExpression {
  return {
    type: 'identifier',
    value: name,
  };
}

export function literalExpression(
  value: string | number | boolean,
): AST.LiteralExpression {
  return {
    type: 'literal',
    value: {
      type:
        typeof value === 'string'
          ? 'stringLiteral'
          : typeof value === 'number'
          ? 'numberLiteral'
          : 'booleanLiteral',
      value: String(value),
    },
  };
}

export function contractDeclaration(
  options: Optional<Omit<AST.ContractDeclaration, 'type'>, 'extends' | 'body'>,
): AST.ContractDeclaration {
  return {
    type: 'contractDeclaration',
    ...options,
    extends: options.extends ?? [],
    body: options.body ?? [],
  };
}

export function variableDeclaration(
  options: Optional<Omit<AST.VariableDeclaration, 'type'>, 'modifiers'>,
): AST.VariableDeclaration {
  return {
    type: 'variableDeclaration',
    ...options,
    modifiers: options.modifiers ?? [],
  };
}

export function structDeclaration(
  options: Omit<AST.StructDeclaration, 'type'>,
): AST.StructDeclaration {
  return {
    type: 'structDeclaration',
    ...options,
  };
}

export function structMemberDeclaration(
  options: Omit<AST.StructMemberDeclaration, 'type'>,
): AST.StructMemberDeclaration {
  return {
    type: 'structMemberDeclaration',
    ...options,
  };
}

export function functionDeclaration(
  options: Optional<Omit<AST.FunctionDeclaration, 'type'>, 'arguments'>,
): AST.FunctionDeclaration {
  return {
    type: 'functionDeclaration',
    ...options,
    arguments: options.arguments ?? [],
  };
}

export function usingDeclaration(
  options: Omit<AST.UsingDeclaration, 'type'>,
): AST.UsingDeclaration {
  return {
    type: 'usingDeclaration',
    ...options,
  };
}

export function memberExpression(
  options: Omit<AST.MemberExpression, 'type'>,
): AST.MemberExpression {
  return {
    type: 'memberExpression',
    ...options,
  };
}

export function indexAccessExpression(
  options: Omit<AST.IndexAccessExpression, 'type'>,
): AST.IndexAccessExpression {
  return {
    type: 'indexAccessExpression',
    ...options,
  };
}

export function assignmentExpression(
  options: Omit<AST.AssignmentExpression, 'type'>,
): AST.AssignmentExpression {
  return {
    type: 'assignmentExpression',
    ...options,
  };
}

export function binaryExpression(
  options: Omit<AST.BinaryExpression, 'type'>,
): AST.BinaryExpression {
  return {
    type: 'binaryExpression',
    ...options,
  };
}

export function functionCallExpression(
  options: Optional<Omit<AST.FunctionCallExpression, 'type'>, 'arguments'>,
): AST.FunctionCallExpression {
  return {
    type: 'functionCallExpression',
    ...options,
    arguments: options.arguments ?? [],
  };
}

export function expressionStatement(
  options: Omit<AST.ExpressionStatement, 'type'>,
): AST.ExpressionStatement {
  return {
    type: 'expressionStatement',
    ...options,
  };
}

export function declarationStatement(
  options: Omit<AST.DeclarationStatement, 'type'>,
): AST.DeclarationStatement {
  return {
    type: 'declarationStatement',
    ...options,
  };
}

export function returnStatement(
  expression?: AST.Expression,
): AST.ReturnStatement {
  return {
    type: 'returnStatement',
    expression,
  };
}

export function forStatement(
  options: Omit<AST.ForStatement, 'type'>,
): AST.ForStatement {
  return {
    type: 'forStatement',
    ...options,
  };
}

export function ifStatement(
  options: Omit<AST.IfStatement, 'type'>,
): AST.IfStatement {
  return {
    type: 'ifStatement',
    ...options,
  };
}

export function blockComment(
  options: Optional<Omit<AST.BlockComment, 'type'>, 'commentType'>,
): AST.BlockComment {
  return {
    type: 'blockComment',
    commentType: '//',
    ...options,
  };
}

export function program(options: AST.Program): AST.Program {
  return {
    ...options,
  };
}

export function parseExpression(value: string): AST.Expression {
  if (value === 'true' || value === 'false') {
    return {
      type: 'literal',
      value: {
        type: 'booleanLiteral',
        value,
      },
    };
  } else if (/^[0-9]/.test(value)) {
    return {
      type: 'literal',
      value: {
        type: 'numberLiteral',
        value,
      },
    };
  }

  return {
    type: 'identifier',
    value,
  };
}

export function parseVariableDeclaration(value: string) {
  const tokens = value.split(' ').filter((x) => !!x);
  const assignmentIndex = tokens.indexOf('=');

  if (assignmentIndex !== -1) {
    const variablePart = tokens.slice(0, assignmentIndex);
    const initializerPart = tokens.slice(assignmentIndex + 1);

    return variableDeclaration({
      typeAnnotation: variablePart[0],
      modifiers: variablePart.slice(1, assignmentIndex - 1),
      name: variablePart[variablePart.length - 1],
      initializer: parseExpression(initializerPart.join(' ')),
    });
  } else {
    return variableDeclaration({
      typeAnnotation: tokens[0],
      modifiers: tokens.slice(1, -1),
      name: tokens[tokens.length - 1],
    });
  }
}

export function compact<T>(values: (T | boolean | null | undefined)[]): T[] {
  return values.filter(
    (value): value is T =>
      value !== null &&
      value !== undefined &&
      value !== true &&
      value !== false,
  );
}
