import { AbstractInstanceType } from '~/types';

const DefinedMembersKey = Symbol('Defined Members');
type Filter<T, U> = T extends U ? T : never;
interface SimpleResourceMembers<T extends typeof SimpleRecord> {
  [DefinedMembersKey]: Filter<keyof AbstractInstanceType<T>, string>[];
}

/** Immutable record that keeps track of which members are defined vs defaults. */
export default abstract class SimpleRecord {
  // a 'unique' identifier to make referential equality comparisons easy
  declare readonly _unq: string;

  toString(): string {
    return this._unq;
  }

  /** Factory method to convert from Plain JS Objects.
   *
   * @param [props] Plain Object of properties to assign.
   * @param [parent] When normalizing, the object which included the record
   * @param [key] When normalizing, the key where this record was found
   */
  static fromJS<T extends typeof SimpleRecord>(
    this: T,
    props: Partial<AbstractInstanceType<T>>,
    parent?: any,
    key?: string,
  ) {
    // we type guarded abstract case above, so ok to force typescript to allow constructor call
    const instance = new (this as any)(props) as Readonly<
      AbstractInstanceType<T>
    >;

    Object.defineProperty(instance, DefinedMembersKey, {
      value: Object.keys(props),
      writable: false,
    });

    // a 'unique' identifier to make referential equality comparisons easy
    Object.defineProperty(instance, '_unq', {
      value: `${Math.random()}`,
      writable: false,
    });

    Object.assign(instance, props);

    // to trick normalizr into thinking we're Immutable.js does it doesn't copy
    // TODO: remove when schemas.EntitySchema is deleted as this will not longer be needed
    Object.defineProperty(instance, '__ownerID', {
      value: 1337,
      writable: false,
    });
    return instance;
  }

  /** Creates new instance copying over defined values of arguments */
  static merge<T extends typeof SimpleRecord>(
    this: T,
    first: AbstractInstanceType<T>,
    second: AbstractInstanceType<T>,
  ) {
    const props = Object.assign(
      {},
      this.toObjectDefined(first),
      this.toObjectDefined(second),
    );
    return this.fromJS(props);
  }

  /** Whether key is non-default */
  static hasDefined<T extends typeof SimpleRecord>(
    this: T,
    instance: AbstractInstanceType<T>,
    key: Filter<keyof AbstractInstanceType<T>, string>,
  ) {
    return ((instance as any) as SimpleResourceMembers<T>)[
      DefinedMembersKey
    ].includes(key);
  }

  /** Returns simple object with all the non-default members */
  static toObjectDefined<T extends typeof SimpleRecord>(
    this: T,
    instance: AbstractInstanceType<T>,
  ) {
    const defined: Partial<AbstractInstanceType<T>> = {};
    for (const member of ((instance as any) as SimpleResourceMembers<T>)[
      DefinedMembersKey
    ]) {
      defined[member] = instance[member];
    }
    return defined;
  }

  /** Returns array of all keys that have values defined in instance */
  static keysDefined<T extends typeof SimpleRecord>(
    this: T,
    instance: AbstractInstanceType<T>,
  ) {
    return ((instance as any) as SimpleResourceMembers<T>)[DefinedMembersKey];
  }
}
