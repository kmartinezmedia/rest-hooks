import { ReadShape, Schema, reducer, __INTERNAL__ } from 'rest-hooks';
const { initialState } = __INTERNAL__;

export interface Fixture {
  request: ReadShape<Schema, object>;
  params: object;
  result: object | string | number;
}

export default function mockInitialState<
  S extends Schema,
  Params extends Readonly<object> = Readonly<object>,
  Body extends Readonly<object | string> | void = Readonly<object> | undefined
>(results: Fixture[]) {
  const now = Date.now();
  const mockState = results.reduce((acc, { request, params, result }) => {
    const { schema, getFetchKey } = request;
    const url = getFetchKey(params);
    return reducer(acc, {
      type: 'rest-hooks/receive',
      payload: result,
      meta: { schema, url, date: now, expiresAt: now * 2 },
    });
  }, initialState);
  return mockState;
}
