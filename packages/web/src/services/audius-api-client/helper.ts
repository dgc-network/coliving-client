import {
  UserCollectionMetadata,
  UserAgreementMetadata,
  UserMetadata,
  removeNullable
} from '@coliving/common'

import * as adapter from './ResponseAdapter'
import { APIResponse, APISearch } from './types'

const SEARCH_MAX_SAVED_RESULTS = 10
const SEARCH_MAX_TOTAL_RESULTS = 50

const AUTOCOMPLETE_MAX_SAVED_RESULTS = 2
const AUTOCOMPLETE_TOTAL_RESULTS = 3

/**
 * Combines two lists by concatting `maxSaved` results from the `savedList` onto the head of `normalList`,
 * ensuring that no item is duplicated in the resulting list (deduped by `uniqueKey`). The final list length is capped
 * at `maxTotal` items.
 */
const combineLists = (
  savedList: Array<Record<string, any>>,
  normalList: Array<Record<string, any>>,
  uniqueKey: string,
  maxSaved: number,
  maxTotal: number
) => {
  const truncatedSavedList = savedList.slice(
    0,
    Math.min(maxSaved, savedList.length)
  )
  const saveListsSet = new Set(truncatedSavedList.map((s) => s[uniqueKey]))
  const filteredList = normalList.filter((n) => !saveListsSet.has(n[uniqueKey]))
  const combinedLists = savedList.concat(filteredList)
  return combinedLists.slice(0, Math.min(maxTotal, combinedLists.length))
}

type ProcessSearchResultsArgs = {
  agreements?: UserAgreementMetadata[]
  albums?: UserCollectionMetadata[]
  playlists?: UserCollectionMetadata[]
  users?: UserMetadata[]
  saved_agreements?: UserAgreementMetadata[]
  saved_albums?: UserCollectionMetadata[]
  saved_playlists?: UserCollectionMetadata[]
  followed_users?: UserMetadata[]
  searchText?: string | null
  isAutocomplete?: boolean
}

export const adaptSearchResponse = (searchResponse: APIResponse<APISearch>) => {
  return {
    agreements:
      searchResponse.data.agreements
        ?.map(adapter.makeAgreement)
        .filter(removeNullable) ?? undefined,
    saved_agreements:
      searchResponse.data.saved_agreements
        ?.map(adapter.makeAgreement)
        .filter(removeNullable) ?? undefined,
    users:
      searchResponse.data.users?.map(adapter.makeUser).filter(removeNullable) ??
      undefined,
    followed_users:
      searchResponse.data.followed_users
        ?.map(adapter.makeUser)
        .filter(removeNullable) ?? undefined,
    playlists:
      searchResponse.data.playlists
        ?.map(adapter.makePlaylist)
        .filter(removeNullable) ?? undefined,
    saved_playlists:
      searchResponse.data.saved_playlists
        ?.map(adapter.makePlaylist)
        .filter(removeNullable) ?? undefined,
    albums:
      searchResponse.data.albums
        ?.map(adapter.makePlaylist)
        .filter(removeNullable) ?? undefined,
    saved_albums:
      searchResponse.data.saved_albums
        ?.map(adapter.makePlaylist)
        .filter(removeNullable) ?? undefined
  }
}
export const processSearchResults = async ({
  agreements = [],
  albums = [],
  playlists = [],
  users = [],
  saved_agreements: savedAgreements = [],
  saved_albums: savedAlbums = [],
  saved_playlists: savedPlaylists = [],
  followed_users: followedUsers = [],
  isAutocomplete = false
}: ProcessSearchResultsArgs) => {
  const maxSaved = isAutocomplete
    ? AUTOCOMPLETE_MAX_SAVED_RESULTS
    : SEARCH_MAX_SAVED_RESULTS
  const maxTotal = isAutocomplete
    ? AUTOCOMPLETE_TOTAL_RESULTS
    : SEARCH_MAX_TOTAL_RESULTS
  const combinedAgreements = combineLists(
    savedAgreements,
    agreements,
    'agreement_id',
    maxSaved,
    maxTotal
  )
  const combinedAlbums = combineLists(
    savedAlbums,
    albums,
    'playlist_id',
    maxSaved,
    maxTotal
  )
  const combinedPlaylists = combineLists(
    savedPlaylists,
    playlists,
    'playlist_id',
    maxSaved,
    maxTotal
  )
  const combinedUsers = combineLists(
    followedUsers,
    users,
    'user_id',
    maxSaved,
    maxTotal
  )

  return {
    agreements: combinedAgreements,
    albums: combinedAlbums,
    playlists: combinedPlaylists,
    users: combinedUsers
  }
}
