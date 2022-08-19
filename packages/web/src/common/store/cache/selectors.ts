import {
  Kind,
  ID,
  UID,
  Cache,
  Collection,
  Agreement,
  User,
  Uid
} from '@coliving/common'

import { CommonState } from 'common/store'

import { AgreementsCacheState } from './agreements/types'
import { UsersCacheState } from './users/types'

/**
 * Selects from the cache and strips away cache-only fields.
 * @param {CommonState} state
 * @param {object} props { kind, id?, uid? }
 */
export function getEntry(
  state: CommonState,
  props: {
    kind: Kind.USERS
    id?: ID | null
    uid?: UID | null
  }
): User | null
export function getEntry(
  state: CommonState,
  props: {
    kind: Kind.COLLECTIONS
    id?: ID | null
    uid?: UID | null
  }
): Collection | null
export function getEntry(
  state: CommonState,
  props: {
    kind: Kind.AGREEMENTS
    id?: ID | null
    uid?: UID | null
  }
): Agreement | null
export function getEntry(
  state: CommonState,
  props: {
    kind: Kind
    id?: ID | null
    uid?: UID | null
  }
): Agreement | User | Collection | null
export function getEntry(
  state: CommonState,
  props: {
    kind: Kind
    id?: ID | null
    uid?: UID | null
  }
) {
  if (props.id) {
    const entry = getCache(state, props).entries[props.id]
    return entry ? entry.metadata : null
  }
  if (props.uid) {
    const id = Uid.fromString(props.uid).id
    const entry = getCache(state, props).entries[id]
    return entry ? entry.metadata : null
  }
  return null
}

/**
 * Selects the timestamps from the cache.
 * @param {CommonState} state
 * @param {object} props { kind, ids }
 */
export const getEntryTimestamp = (
  state: CommonState,
  { kind, id }: { kind: Kind; id?: ID | null }
) => {
  if (kind && id) {
    const entries = getCache(state, { kind }).entries
    if (entries[id] !== undefined) return entries[id]._timestamp
  }
  return null
}

/**
 * Gets all cache entries and strips away cache-only fields.
 * @param {CommonState} state
 * @param {object} props { kind }
 * @returns {object}
 */
export function getAllEntries(
  state: CommonState,
  props: { kind: Kind.USERS }
): { [id: string]: User }
export function getAllEntries(
  state: CommonState,
  props: { kind: Kind.COLLECTIONS }
): { [id: string]: Collection }
export function getAllEntries(
  state: CommonState,
  props: { kind: Kind.AGREEMENTS }
): { [id: string]: Agreement }
export function getAllEntries(
  state: CommonState,
  props: { kind: Kind.USERS }
):
  | { [id: string]: User }
  | { [id: string]: Agreement }
  | { [id: string]: Collection }
export function getAllEntries(state: CommonState, props: { kind: Kind }) {
  const entries = getCache(state, props).entries
  return Object.keys(entries).reduce((acc, id) => {
    acc[id] = entries[id as unknown as number].metadata
    return acc
  }, {} as { [id: string]: Agreement | Collection | User })
}

export function getCache(
  state: CommonState,
  props: { kind: Kind.USERS }
): UsersCacheState
export function getCache(
  state: CommonState,
  props: { kind: Kind.COLLECTIONS }
): Cache<Collection>
export function getCache(
  state: CommonState,
  props: { kind: Kind.AGREEMENTS }
): AgreementsCacheState
export function getCache(
  state: CommonState,
  props: { kind: Kind }
): AgreementsCacheState | Cache<Collection> | UsersCacheState
export function getCache(state: CommonState, props: { kind: Kind }) {
  switch (props.kind) {
    case Kind.AGREEMENTS:
      return state.agreements
    case Kind.COLLECTIONS:
      return state.collections
    case Kind.USERS:
    default:
      return state.users
  }
}

export function getId(state: CommonState, props: { kind: Kind; uid: UID }) {
  switch (props.kind) {
    case Kind.AGREEMENTS: {
      return state.agreements.uids[props.uid]
    }
    case Kind.COLLECTIONS: {
      return state.collections.uids[props.uid]
    }
    case Kind.USERS:
    default: {
      return state.users.uids[props.uid]
    }
  }
}
