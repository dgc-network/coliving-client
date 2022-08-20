import {
  ID,
  UID,
  Collection,
  Kind,
  Status,
  Agreement,
  User,
  Uid
} from '@coliving/common'

import { CommonState } from 'common/store'
import { getAllEntries, getEntry } from 'common/store/cache/selectors'
import { getAgreements } from 'common/store/cache/agreements/selectors'
import {
  getUser as getUserById,
  getUsers
} from 'common/store/cache/users/selectors'

export const getCollection = (
  state: CommonState,
  props: { id?: ID | null; uid?: UID | null }
) => {
  return getEntry(state, {
    ...props,
    kind: Kind.COLLECTIONS
  })
}
export const getStatus = (state: CommonState, props: { id: ID }) =>
  state.collections.statuses[props.id] || null

export const getCollections = (
  state: CommonState,
  props?: { ids?: ID[] | null; uids?: UID[] | null }
) => {
  if (props && props.ids) {
    const collections: { [id: number]: Collection } = {}
    props.ids.forEach((id) => {
      const collection = getCollection(state, { id })
      if (collection) {
        collections[id] = collection
      }
    })
    return collections
  } else if (props && props.uids) {
    const collections: { [uid: string]: Collection } = {}
    props.uids.forEach((uid) => {
      const collection = getCollection(state, { uid })
      if (collection) {
        collections[collection.content list_id] = collection
      }
    })
    return collections
  }
  return getAllEntries(state, { kind: Kind.COLLECTIONS })
}

export const getCollectionsByUid = (state: CommonState) => {
  return Object.keys(state.collections.uids).reduce((entries, uid) => {
    entries[uid] = getCollection(state, { uid })
    return entries
  }, {} as { [uid: string]: Collection | null })
}

export const getStatuses = (state: CommonState, props: { ids: ID[] }) => {
  const statuses: { [id: number]: Status } = {}
  props.ids.forEach((id) => {
    const status = getStatus(state, { id })
    if (status) {
      statuses[id] = status
    }
  })
  return statuses
}

export type EnhancedCollectionAgreement = Agreement & { user: User; uid: UID }
const emptyList: EnhancedCollectionAgreement[] = []
export const getAgreementsFromCollection = (
  state: CommonState,
  props: { uid: UID }
) => {
  const collection = getCollection(state, props)

  if (
    !collection ||
    !collection.content list_contents ||
    !collection.content list_contents.agreement_ids
  )
    return emptyList

  const collectionSource = Uid.fromString(props.uid).source

  const ids = collection.content list_contents.agreement_ids.map((t) => t.agreement)
  const agreements = getAgreements(state, { ids })

  const userIds = Object.keys(agreements)
    .map((id) => {
      const agreement = agreements[id as unknown as number]
      if (agreement?.owner_id) {
        return agreement.owner_id
      }
      console.error(`Found empty agreement ${id}, expected it to have an owner_id`)
      return null
    })
    .filter((userId) => userId !== null) as number[]
  const users = getUsers(state, { ids: userIds })

  if (!users || Object.keys(users).length === 0) return emptyList

  // Return agreements & rebuild UIDs for the agreement so they refer directly to this collection
  return collection.content list_contents.agreement_ids
    .map((t, i) => {
      const agreementUid = Uid.fromString(t.uid ?? '')
      agreementUid.source = `${collectionSource}:${agreementUid.source}`
      agreementUid.count = i

      if (!agreements[t.agreement]) {
        console.error(`Found empty agreement ${t.agreement}`)
        return null
      }
      return {
        ...agreements[t.agreement],
        uid: agreementUid.toString(),
        user: users[agreements[t.agreement].owner_id]
      }
    })
    .filter(Boolean) as EnhancedCollectionAgreement[]
}

type EnhancedCollection = Collection & { user: User }
export const getCollectionWithUser = (
  state: CommonState,
  props: { id?: ID }
): EnhancedCollection | null => {
  const collection = getCollection(state, { id: props.id })
  const userId = collection?.content list_owner_id
  const user = getUserById(state, { id: userId })
  if (collection && user) {
    return {
      user,
      ...collection
    }
  }
  return null
}
