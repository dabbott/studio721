import {
  decodeConfigParameter,
  encodeConfigParameter,
} from '../hooks/useUrlConfigReducer';

type BasicState = {
  hello: string;
};

type NestedState = {
  nested: {
    a: string;
    b: string;
  };
};

function createBasicState(): BasicState {
  return { hello: '' };
}

function createNestedState(): NestedState {
  return { nested: { a: '', b: '' } };
}

describe('serialization', () => {
  it('default data', () => {
    const data = createBasicState();

    const encoded = encodeConfigParameter<BasicState>(data, createBasicState);

    const decoded = decodeConfigParameter(encoded);

    expect(decoded).toEqual({});
  });

  it('changed data', () => {
    const data = {
      hello: 'world',
    };

    const encoded = encodeConfigParameter<BasicState>(data, createBasicState);

    const decoded = decodeConfigParameter(encoded);

    expect(decoded).toEqual(data);
  });

  it('nested default data', () => {
    const data = createNestedState();

    const encoded = encodeConfigParameter<NestedState>(data, createNestedState);

    const decoded = decodeConfigParameter(encoded);

    expect(decoded).toEqual({});
  });

  it('nested single key', () => {
    const data: NestedState = { nested: { a: 'a', b: '' } };

    const encoded = encodeConfigParameter<NestedState>(data, createNestedState);

    const decoded = decodeConfigParameter(encoded);

    expect(decoded).toEqual({ nested: { a: 'a' } });
  });
});
