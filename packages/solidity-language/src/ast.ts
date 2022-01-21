export interface Program {
  license?: string;
  pragma?: Pragma;
  imports: Import[];
  body: ProgramBodyNode[];
}

export type ProgramBodyNode = ContractDeclaration | BlockComment;

export interface BlockComment {
  type: 'blockComment';
  value: string;
  commentType: '/*' | '//';
}

export interface Import {
  path: string;
  names: string[];
}

export interface Pragma {
  value: string;
}

export interface UsingDeclaration {
  type: 'usingDeclaration';
  alias: string;
  forProperty: string;
}

export interface VariableDeclaration {
  type: 'variableDeclaration';
  typeAnnotation: string;
  modifiers: string[];
  name: string;
  initializer?: Expression;
}

export interface NumberLiteral {
  type: 'numberLiteral';
  value: string;
}

export interface StringLiteral {
  type: 'stringLiteral';
  value: string;
}

export interface BooleanLiteral {
  type: 'booleanLiteral';
  value: string;
}

export type Literal = NumberLiteral | StringLiteral | BooleanLiteral;

export type Identifier = string;

export interface LiteralExpression {
  type: 'literal';
  value: Literal;
}

export type Expression =
  | LiteralExpression
  | IdentifierExpression
  | IndexAccessExpression
  | FunctionCallExpression
  | AssignmentExpression
  | MemberExpression
  | BinaryExpression;

export interface IdentifierExpression {
  type: 'identifier';
  value: Identifier;
}

export interface MemberExpression {
  type: 'memberExpression';
  object: Expression;
  member: Expression;
}

export interface FunctionCallExpression {
  type: 'functionCallExpression';
  callee: Expression;
  arguments?: Expression[] | Record<string, Expression>;
}

export interface IndexAccessExpression {
  type: 'indexAccessExpression';
  object: Expression;
  index: Expression;
}

export interface AssignmentExpression {
  type: 'assignmentExpression';
  lhs: Expression;
  rhs: Expression;
}

export interface BinaryExpression {
  type: 'binaryExpression';
  lhs: Expression;
  operator: string;
  rhs: Expression;
}

export interface StructMemberDeclaration {
  type: 'structMemberDeclaration';
  name: string;
  typeAnnotation: string;
}

export interface StructDeclaration {
  type: 'structDeclaration';
  name: string;
  body: StructMemberDeclaration[];
}

export interface ContractDeclaration {
  type: 'contractDeclaration';
  name: string;
  extends: string[];
  body: (Declaration | BlockComment)[];
}

export interface FunctionDeclaration {
  name: string;
  type: 'functionDeclaration';
  arguments: string[];
  modifiers: string[];
  body: Statement[];
  returns?: { modifiers: string[]; typeAnnotation: string };
}

export interface ConstructorDeclaration {
  type: 'constructorDeclaration';
  arguments: string[];
  super?: Expression;
  body: Statement[];
}

export interface ExpressionStatement {
  type: 'expressionStatement';
  expression: Expression;
}

export interface ForStatement {
  type: 'forStatement';
  pre: string;
  update: string;
  post: string;
  body: Statement[];
}

export interface IfStatement {
  type: 'ifStatement';
  condition: Expression;
  body: Statement[];
  alternate?: Statement[];
}

export interface DeclarationStatement {
  type: 'declarationStatement';
  declaration: Declaration;
}

export interface ReturnStatement {
  type: 'returnStatement';
  expression?: Expression;
}

export type Statement =
  | ReturnStatement
  | DeclarationStatement
  | ExpressionStatement
  | ForStatement
  | IfStatement;

export type Declaration =
  | FunctionDeclaration
  | VariableDeclaration
  | StructDeclaration
  | ContractDeclaration
  | UsingDeclaration
  | ConstructorDeclaration;
