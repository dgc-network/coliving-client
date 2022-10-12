import {
  ID,
  Collection,
  CollectionMetadata,
  UserCollectionMetadata,
  Kind,
  DigitalContent,
  makeUid
} from '@coliving/common'
import { call, select } from 'redux-saga/effects'

import { CommonState } from 'common/store'
import { getUserId } from 'common/store/account/selectors'
import { getCollections } from 'common/store/cache/collections/selectors'
import { retrieve } from 'common/store/cache/sagas'
import { getEntryTimestamp } from 'common/store/cache/selectors'
import { retrieveAgreements } from 'common/store/cache/agreements/utils'
import ColivingBackend from 'services/colivingBackend'
import apiClient from 'services/colivingAPIClient/colivingAPIClient'

import { addAgreementsFromCollections } from './addAgreementsFromCollections'
import { addUsersFromCollections } from './addUsersFromCollections'
import { reformat } from './reformat'

function* markCollectionDeleted(
  collectionMetadatas: CollectionMetadata[]
): Generator<any, CollectionMetadata[], any> {
  const collections = yield select(getCollections, {
    ids: collectionMetadatas.map((c) => c.content_list_id)
  })
  return collectionMetadatas.map((metadata) => {
    if (!(metadata.content_list_id in collections)) return metadata
    return {
      ...metadata,
      _marked_deleted: !!collections[metadata.content_list_id]._marked_deleted
    }
  })
}

export function* retrieveAgreementsForCollections(
  collections: CollectionMetadata[],
  excludedAgreementIdSet: Set<ID>
) {
  const allAgreementIds = collections.reduce((acc, cur) => {
    const agreementIds = cur.content_list_contents.digital_content_ids.map((t) => t.digital_content)
    return [...acc, ...agreementIds]
  }, [] as ID[])
  const filteredAgreementIds = [
    ...new Set(allAgreementIds.filter((id) => !excludedAgreementIdSet.has(id)))
  ]
  const agreements: DigitalContent[] = yield call(retrieveAgreements, {
    agreementIds: filteredAgreementIds
  })

  // If any agreements failed to be retrieved for some reason,
  // remove them from their collection.
  const unfetchedIdSet = new Set()
  for (let i = 0; i < agreements.length; i++) {
    if (!agreements[i]) {
      unfetchedIdSet.add(filteredAgreementIds[i])
    }
  }

  return collections.map((c) => {
    // Filter out unfetched agreements
    const filteredIds = c.content_list_contents.digital_content_ids.filter(
      (t) => !unfetchedIdSet.has(t.digital_content)
    )
    // Add UIDs
    const withUids = filteredIds.map((t) => ({
      ...t,
      // Make a new UID if one doesn't already exist
      uid: t.uid || makeUid(Kind.AGREEMENTS, t.digital_content, `collection:${c.content_list_id}`)
    }))

    return {
      ...c,
      content_list_contents: {
        digital_content_ids: withUids
      }
    }
  })
}

/**
 * Retrieves a single collection via API client
 * @param contentListId
 */
export function* retrieveCollection(contentListId: ID) {
  const userId: ReturnType<typeof getUserId> = yield select(getUserId)
  const contentLists: UserCollectionMetadata[] = yield apiClient.getContentList({
    contentListId,
    currentUserId: userId
  })
  return contentLists
}

/**
 * Retrieves collections from the cache or from source
 * @param userId optional owner of collections to fetch (TODO: to be removed)
 * @param collectionIds ids to retrieve
 * @param fetchAgreements whether or not to fetch the agreements inside the contentList
 * @param requiresAllAgreements whether or not fetching this collection requires it to have all its agreements.
 * In the case where a collection is already cached with partial agreements, use this flag to refetch from source.
 * @returns
 */
export function* retrieveCollections(
  userId: ID | null,
  collectionIds: ID[],
  fetchAgreements = false,
  requiresAllAgreements = false
) {
  // @ts-ignore retrieve should be refactored to ts first
  const { entries, uids } = yield call(retrieve, {
    ids: collectionIds,
    selectFromCache: function* (ids: ID[]) {
      const res: {
        [id: number]: Collection
      } = yield select(getCollections, { ids })
      if (requiresAllAgreements) {
        const keys = Object.keys(res) as any
        keys.forEach((collectionId: number) => {
          const fullAgreementCount = res[collectionId].digital_content_count
          const currentAgreementCount = res[collectionId].agreements?.length ?? 0
          if (currentAgreementCount < fullAgreementCount) {
            // Remove the collection from the res so retrieve knows to get it from source
            delete res[collectionId]
          }
        })
      }
      return res
    },
    getEntriesTimestamp: function* (ids: ID[]) {
      const selector = (state: CommonState, ids: ID[]) =>
        ids.reduce((acc, id) => {
          acc[id] = getEntryTimestamp(state, { kind: Kind.COLLECTIONS, id })
          return acc
        }, {} as { [id: number]: number | null })
      const selected: ReturnType<typeof selector> = yield select(selector, ids)
      return selected
    },
    retrieveFromSource: function* (ids: ID[]) {
      let metadatas: UserCollectionMetadata[]

      if (ids.length === 1) {
        metadatas = yield call(retrieveCollection, ids[0])
      } else {
        // TODO: Remove this branch when we have batched endpoints in new V1 api.
        metadatas = yield call(ColivingBackend.getContentLists, userId, ids)
      }

      // Process any local deletions on the client
      const metadatasWithDeleted: UserCollectionMetadata[] = yield call(
        markCollectionDeleted,
        metadatas
      )

      return metadatasWithDeleted
    },
    onBeforeAddToCache: function* (metadatas: UserCollectionMetadata[]) {
      yield addUsersFromCollections(metadatas)
      yield addAgreementsFromCollections(metadatas)

      if (fetchAgreements) {
        yield call(retrieveAgreementsForCollections, metadatas, new Set())
      }

      const reformattedCollections = metadatas.map((c) => reformat(c))

      return reformattedCollections
    },
    kind: Kind.COLLECTIONS,
    idField: 'content_list_id',
    forceRetrieveFromSource: false,
    shouldSetLoading: true,
    deleteExistingEntry: false
  })

  return { collections: entries, uids }
}
