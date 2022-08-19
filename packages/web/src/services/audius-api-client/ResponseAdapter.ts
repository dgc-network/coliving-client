import {
  ID,
  UserCollectionMetadata,
  Variant,
  Favorite,
  Repost,
  Remix,
  StemAgreementMetadata,
  AgreementMetadata,
  UserAgreementMetadata,
  UserMetadata,
  StringWei,
  removeNullable
} from '@coliving/common'

import { decodeHashId } from 'utils/route/hashIds'

import {
  APIActivity,
  APIFavorite,
  APIRemix,
  APIRepost,
  APIAgreement,
  APIPlaylist,
  APISearchUser,
  APIUser,
  APIStem,
  APIResponse,
  APISearch,
  APISearchAgreement,
  APISearchAutocomplete,
  APISearchPlaylist
} from './types'

export const makeUser = (
  user: APISearchUser | APIUser
): UserMetadata | undefined => {
  const decodedUserId = decodeHashId(user.id)
  if (!decodedUserId) {
    return undefined
  }

  const balance = user.balance as StringWei
  const associated_wallets_balance =
    user.associated_wallets_balance as StringWei
  const album_count = 'album_count' in user ? user.album_count : 0
  const followee_count = 'followee_count' in user ? user.followee_count : 0
  const follower_count = 'follower_count' in user ? user.follower_count : 0
  const playlist_count = 'playlist_count' in user ? user.playlist_count : 0
  const repost_count = 'repost_count' in user ? user.repost_count : 0
  const agreement_count = 'agreement_count' in user ? user.agreement_count : 0
  const current_user_followee_follow_count =
    'current_user_followee_follow_count' in user
      ? user.current_user_followee_follow_count
      : 0
  const does_current_user_follow =
    'does_current_user_follow' in user ? user.does_current_user_follow : false
  const supporter_count = user.supporter_count ?? 0
  const supporting_count = user.supporting_count ?? 0

  const newUser = {
    ...user,
    balance,
    associated_wallets_balance,
    album_count,
    followee_count,
    follower_count,
    playlist_count,
    repost_count,
    agreement_count,
    current_user_followee_follow_count,
    does_current_user_follow,
    user_id: decodedUserId,
    cover_photo: user.cover_photo_sizes || user.cover_photo_legacy,
    profile_picture: user.profile_picture_sizes || user.profile_picture_legacy,
    metadata_multihash: user.metadata_multihash || null,
    id: undefined,
    supporter_count,
    supporting_count
  }

  delete newUser.id

  return newUser
}

const makeFavorite = (favorite: APIFavorite): Favorite | undefined => {
  const decodedSaveItemId = decodeHashId(favorite.favorite_item_id)
  const decodedUserId = decodeHashId(favorite.user_id)
  if (!decodedSaveItemId || !decodedUserId) {
    return undefined
  }
  return {
    save_item_id: decodedSaveItemId,
    user_id: decodedUserId,
    save_type: favorite.favorite_type
  }
}

const makeRepost = (repost: APIRepost): Repost | undefined => {
  const decodedRepostItemId = decodeHashId(repost.repost_item_id)
  const decodedUserId = decodeHashId(repost.user_id)
  if (!decodedRepostItemId || !decodedUserId) {
    return undefined
  }

  return {
    repost_item_id: decodedRepostItemId,
    user_id: decodedUserId,
    repost_type: repost.repost_type
  }
}

const makeRemix = (remix: APIRemix): Remix | undefined => {
  const decodedAgreementId = decodeHashId(remix.parent_agreement_id)
  const user = makeUser(remix.user)
  if (!decodedAgreementId || !user) {
    return undefined
  }

  return {
    ...remix,
    parent_agreement_id: decodedAgreementId,
    user
  }
}

export const makeUserlessAgreement = (
  agreement: APIAgreement | APISearchAgreement
): AgreementMetadata | undefined => {
  const decodedAgreementId = decodeHashId(agreement.id)
  const decodedOwnerId = decodeHashId(agreement.user_id)
  if (!decodedAgreementId || !decodedOwnerId) return undefined

  const saves =
    'followee_favorites' in agreement
      ? agreement.followee_favorites?.map(makeFavorite).filter(removeNullable) ?? []
      : []

  const reposts =
    'followee_reposts' in agreement
      ? agreement.followee_reposts?.map(makeRepost).filter(removeNullable) ?? []
      : []

  const remixes =
    agreement.remix_of.agreements?.map(makeRemix).filter(removeNullable) ?? []
  const play_count = 'play_count' in agreement ? agreement.play_count : 0
  const save_count = 'favorite_count' in agreement ? agreement.favorite_count : 0
  const repost_count = 'repost_count' in agreement ? agreement.repost_count : 0
  const has_current_user_reposted =
    'has_current_user_reposted' in agreement
      ? agreement.has_current_user_reposted
      : false
  const has_current_user_saved =
    'has_current_user_saved' in agreement ? agreement.has_current_user_saved : false
  const marshalled = {
    ...agreement,
    agreement_id: decodedAgreementId,
    owner_id: decodedOwnerId,
    followee_saves: saves,
    followee_reposts: reposts,
    play_count,
    save_count,
    repost_count,
    has_current_user_reposted,
    has_current_user_saved,
    remix_of:
      remixes.length > 0
        ? {
            agreements: remixes
          }
        : null,

    stem_of: agreement.stem_of.parent_agreement_id === null ? null : agreement.stem_of,

    // Fields to prune
    id: undefined,
    user_id: undefined,
    followee_favorites: undefined,
    artwork: undefined,
    downloadable: undefined,
    favorite_count: undefined
  }

  delete marshalled.id
  delete marshalled.user_id
  delete marshalled.followee_favorites
  delete marshalled.artwork
  delete marshalled.downloadable
  delete marshalled.favorite_count

  return marshalled
}

export const makeAgreement = (
  agreement: APIAgreement | APISearchAgreement
): UserAgreementMetadata | undefined => {
  const decodedAgreementId = decodeHashId(agreement.id)
  const decodedOwnerId = decodeHashId(agreement.user_id)
  const user = makeUser(agreement.user)
  if (!decodedAgreementId || !decodedOwnerId || !user) {
    return undefined
  }

  const saves =
    'followee_favorites' in agreement
      ? agreement.followee_favorites?.map(makeFavorite).filter(removeNullable) ?? []
      : []

  const reposts =
    'followee_reposts' in agreement
      ? agreement.followee_reposts?.map(makeRepost).filter(removeNullable) ?? []
      : []

  const remixes =
    agreement.remix_of.agreements?.map(makeRemix).filter(removeNullable) ?? []
  const play_count = 'play_count' in agreement ? agreement.play_count : 0
  const save_count = 'favorite_count' in agreement ? agreement.favorite_count : 0
  const repost_count = 'repost_count' in agreement ? agreement.repost_count : 0
  const has_current_user_reposted =
    'has_current_user_reposted' in agreement
      ? agreement.has_current_user_reposted
      : false
  const has_current_user_saved =
    'has_current_user_saved' in agreement ? agreement.has_current_user_saved : false
  const marshalled = {
    ...agreement,
    user,
    agreement_id: decodedAgreementId,
    owner_id: decodedOwnerId,
    followee_saves: saves,
    followee_reposts: reposts,
    play_count,
    save_count,
    repost_count,
    has_current_user_reposted,
    has_current_user_saved,
    remix_of:
      remixes.length > 0
        ? {
            agreements: remixes
          }
        : null,

    stem_of: agreement.stem_of.parent_agreement_id === null ? null : agreement.stem_of,

    // Fields to prune
    id: undefined,
    user_id: undefined,
    followee_favorites: undefined,
    artwork: undefined,
    downloadable: undefined,
    favorite_count: undefined
  }

  delete marshalled.id
  delete marshalled.user_id
  delete marshalled.followee_favorites
  delete marshalled.artwork
  delete marshalled.downloadable
  delete marshalled.favorite_count

  return marshalled
}

export const makeAgreementId = (agreement: { id: string }): ID | undefined => {
  const decodedAgreementId = decodeHashId(agreement.id)
  if (!decodedAgreementId) {
    return undefined
  }
  return decodedAgreementId
}

export const makePlaylist = (
  playlist: APIPlaylist | APISearchPlaylist
): UserCollectionMetadata | undefined => {
  const decodedPlaylistId = decodeHashId(playlist.id)
  const decodedOwnerId = decodeHashId(playlist.user_id)
  const user = makeUser(playlist.user)
  if (!decodedPlaylistId || !decodedOwnerId || !user) {
    return undefined
  }

  const saves =
    'followee_favorites' in playlist
      ? playlist.followee_favorites?.map(makeFavorite).filter(removeNullable) ??
        []
      : []

  const reposts =
    'followee_reposts' in playlist
      ? playlist.followee_reposts?.map(makeRepost).filter(removeNullable) ?? []
      : []
  const has_current_user_reposted =
    'has_current_user_reposted' in playlist
      ? playlist.has_current_user_reposted
      : false
  const has_current_user_saved =
    'has_current_user_saved' in playlist
      ? playlist.has_current_user_saved
      : false
  const save_count = 'favorite_count' in playlist ? playlist.favorite_count : 0
  const repost_count = 'repost_count' in playlist ? playlist.repost_count : 0
  const total_play_count =
    'total_play_count' in playlist ? playlist.total_play_count : 0
  const agreement_count = 'agreement_count' in playlist ? playlist.agreement_count : 0

  const playlistContents = {
    agreement_ids: playlist.added_timestamps
      .map((ts) => {
        const decoded = decodeHashId(ts.agreement_id)
        if (decoded) {
          return {
            agreement: decoded,
            time: ts.timestamp
          }
        }
        return null
      })
      .filter(removeNullable)
  }

  const agreements =
    'agreements' in playlist
      ? playlist.agreements
          ?.map((agreement) => makeAgreement(agreement))
          .filter(removeNullable) ?? []
      : []

  const marshalled = {
    ...playlist,
    variant: Variant.USER_GENERATED,
    user,
    agreements,
    playlist_id: decodedPlaylistId,
    playlist_owner_id: decodedOwnerId,
    followee_saves: saves,
    followee_reposts: reposts,
    has_current_user_reposted,
    has_current_user_saved,
    save_count,
    repost_count,
    agreement_count,
    total_play_count,
    playlist_contents: playlistContents,

    // Fields to prune
    id: undefined,
    user_id: undefined,
    followee_favorites: undefined,
    artwork: undefined,
    favorite_count: undefined,
    added_timestamps: undefined
  }

  delete marshalled.id
  delete marshalled.user_id
  delete marshalled.followee_favorites
  delete marshalled.artwork
  delete marshalled.favorite_count
  delete marshalled.added_timestamps

  return marshalled as UserCollectionMetadata
}

export const makeActivity = (
  activity: APIActivity
): UserAgreementMetadata | UserCollectionMetadata | undefined => {
  switch (activity.item_type) {
    case 'agreement':
      return makeAgreement(activity.item)
    case 'playlist':
      return makePlaylist(activity.item)
  }
}

export const makeStemAgreement = (stem: APIStem): StemAgreementMetadata | undefined => {
  const [id, parentId, ownerId] = [stem.id, stem.parent_id, stem.user_id].map(
    decodeHashId
  )
  if (!(id && parentId && ownerId)) return undefined

  return {
    blocknumber: stem.blocknumber,
    is_delete: false,
    agreement_id: id,
    created_at: '',
    isrc: null,
    iswc: null,
    credits_splits: null,
    description: null,
    followee_reposts: [],
    followee_saves: [],
    genre: '',
    has_current_user_reposted: false,
    has_current_user_saved: false,
    download: {
      is_downloadable: true,
      requires_follow: false,
      cid: stem.cid
    },
    license: null,
    mood: null,
    play_count: 0,
    owner_id: ownerId,
    release_date: null,
    repost_count: 0,
    save_count: 0,
    tags: null,
    title: '',
    agreement_segments: [],
    cover_art: null,
    cover_art_sizes: null,
    is_unlisted: false,
    stem_of: {
      parent_agreement_id: parentId,
      category: stem.category
    },
    remix_of: null,
    duration: 0,
    updated_at: '',
    permalink: '',
    is_available: true
  }
}

export const adaptSearchResponse = (searchResponse: APIResponse<APISearch>) => {
  return {
    agreements:
      searchResponse.data.agreements?.map(makeAgreement).filter(removeNullable) ??
      undefined,
    saved_agreements:
      searchResponse.data.saved_agreements?.map(makeAgreement).filter(removeNullable) ??
      undefined,
    users:
      searchResponse.data.users?.map(makeUser).filter(removeNullable) ??
      undefined,
    followed_users:
      searchResponse.data.followed_users
        ?.map(makeUser)
        .filter(removeNullable) ?? undefined,
    playlists:
      searchResponse.data.playlists?.map(makePlaylist).filter(removeNullable) ??
      undefined,
    saved_playlists:
      searchResponse.data.saved_playlists
        ?.map(makePlaylist)
        .filter(removeNullable) ?? undefined,
    albums:
      searchResponse.data.albums?.map(makePlaylist).filter(removeNullable) ??
      undefined,
    saved_albums:
      searchResponse.data.saved_albums
        ?.map(makePlaylist)
        .filter(removeNullable) ?? undefined
  }
}

export const adaptSearchAutocompleteResponse = (
  searchResponse: APIResponse<APISearchAutocomplete>
) => {
  return {
    agreements:
      searchResponse.data.agreements?.map(makeAgreement).filter(removeNullable) ??
      undefined,
    saved_agreements:
      searchResponse.data.saved_agreements?.map(makeAgreement).filter(removeNullable) ??
      undefined,
    users:
      searchResponse.data.users?.map(makeUser).filter(removeNullable) ??
      undefined,
    followed_users:
      searchResponse.data.followed_users
        ?.map(makeUser)
        .filter(removeNullable) ?? undefined,
    playlists:
      searchResponse.data.playlists?.map(makePlaylist).filter(removeNullable) ??
      undefined,
    saved_playlists:
      searchResponse.data.saved_playlists
        ?.map(makePlaylist)
        .filter(removeNullable) ?? undefined,
    albums:
      searchResponse.data.albums?.map(makePlaylist).filter(removeNullable) ??
      undefined,
    saved_albums:
      searchResponse.data.saved_albums
        ?.map(makePlaylist)
        .filter(removeNullable) ?? undefined
  }
}
