import {
  FavoriteSource,
  FollowSource,
  ID,
  RepostSource,
  ShareSource
} from '@coliving/common'
import { push as pushRoute } from 'connected-react-router'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { publishContentList } from 'common/store/cache/collections/actions'
import { getCollection } from 'common/store/cache/collections/selectors'
import { getAgreement } from 'common/store/cache/agreements/selectors'
import { getUser } from 'common/store/cache/users/selectors'
import { unsubscribeUser } from 'common/store/notifications/actions'
import { getNotificationById } from 'common/store/notifications/selectors'
import {
  Notification,
  NotificationType
} from 'common/store/notifications/types'
import { makeGetCurrent } from 'common/store/queue/selectors'
import {
  repostCollection,
  saveCollection,
  shareCollection,
  undoRepostCollection,
  unsaveCollection
} from 'common/store/social/collections/actions'
import {
  repostAgreement,
  saveAgreement,
  undoRepostAgreement,
  unsaveAgreement
} from 'common/store/social/agreements/actions'
import {
  followUser,
  shareUser,
  unfollowUser
} from 'common/store/social/users/actions'
import { requestOpen as openAddToContentList } from 'common/store/ui/addToContentList/actions'
import { open as openEditContentList } from 'common/store/ui/createContentListModal/actions'
import { requestOpen as openDeleteContentList } from 'common/store/ui/delete-content-list-confirmation-modal/slice'
import { getMobileOverflowModal } from 'common/store/ui/mobileOverflowMenu/selectors'
import { OverflowSource } from 'common/store/ui/mobileOverflowMenu/types'
import { getModalVisibility, setVisibility } from 'common/store/ui/modals/slice'
import { AppState } from 'store/types'
import {
  albumPage,
  collectibleDetailsPage,
  contentListPage,
  profilePage
} from 'utils/route'

import MobileOverflowModal from './components/mobileOverflowModal'

type ConnectedMobileOverflowModalProps = {} & ReturnType<
  typeof mapStateToProps
> &
  ReturnType<typeof mapDispatchToProps>

const getCurrent = makeGetCurrent()

// A connected `MobileOverflowModal`. Builds and injects callbacks for it's contained MobileOverflowModal component.
const ConnectedMobileOverflowModal = ({
  id,
  overflowActions,
  overflowActionCallbacks,
  isOpen,
  onClose,
  source,
  notification,
  ownerId,
  handle,
  landlordName,
  title,
  permalink,
  isAlbum,
  shareCollection,
  repostAgreement,
  unrepostAgreement,
  saveAgreement,
  unsaveAgreement,
  repostCollection,
  unrepostCollection,
  saveCollection,
  unsaveCollection,
  addToContentList,
  editContentList,
  deleteContentList,
  publishContentList,
  visitAgreementPage,
  visitLandlordPage,
  visitCollectiblePage,
  visitContentListPage,
  visitAlbumPage,
  unsubscribeUser,
  follow,
  unfollow,
  shareUser
}: ConnectedMobileOverflowModalProps) => {
  // Create callbacks
  const {
    onRepost,
    onUnrepost,
    onFavorite,
    onUnfavorite,
    onShare,
    onAddToContentList,
    onEditContentList,
    onPublishContentList,
    onDeleteContentList,
    onVisitAgreementPage,
    onVisitLandlordPage,
    onVisitCollectionPage,
    onVisitCollectiblePage,
    onUnsubscribeUser,
    onFollow,
    onUnfollow
  } = ((): {
    onRepost?: () => void
    onUnrepost?: () => void
    onFavorite?: () => void
    onUnfavorite?: () => void
    onShare?: () => void
    onAddToContentList?: () => void
    onEditContentList?: () => void
    onPublishContentList?: () => void
    onDeleteContentList?: () => void
    onVisitAgreementPage?: () => void
    onVisitLandlordPage?: () => void
    onVisitCollectiblePage?: () => void
    onVisitCollectionPage?: () => void
    onUnsubscribeUser?: () => void
    onFollow?: () => void
    onUnfollow?: () => void
  } => {
    switch (source) {
      case OverflowSource.AGREEMENTS: {
        if (!id || !ownerId || !handle || !title || isAlbum === undefined)
          return {}
        return {
          onRepost: () => repostAgreement(id as ID),
          onUnrepost: () => unrepostAgreement(id as ID),
          onFavorite: () => saveAgreement(id as ID),
          onUnfavorite: () => unsaveAgreement(id as ID),
          onAddToContentList: () => addToContentList(id as ID, title),
          onVisitCollectiblePage: () => {
            visitCollectiblePage(handle, id as string)
          },
          onVisitAgreementPage: () =>
            permalink === undefined
              ? console.error(`Permalink missing for agreement ${id}`)
              : visitAgreementPage(permalink),
          onVisitLandlordPage: () => visitLandlordPage(handle),
          onFollow: () => follow(ownerId),
          onUnfollow: () => unfollow(ownerId)
        }
      }
      case OverflowSource.COLLECTIONS: {
        if (!id || !handle || !title || isAlbum === undefined) return {}
        return {
          onRepost: () => repostCollection(id as ID),
          onUnrepost: () => unrepostCollection(id as ID),
          onFavorite: () => saveCollection(id as ID),
          onUnfavorite: () => unsaveCollection(id as ID),
          onShare: () => shareCollection(id as ID),
          onVisitLandlordPage: () => visitLandlordPage(handle),
          onVisitCollectionPage: () =>
            (isAlbum ? visitAlbumPage : visitContentListPage)(
              id as ID,
              handle,
              title
            ),
          onVisitCollectiblePage: () =>
            visitCollectiblePage(handle, id as string),
          onEditContentList: isAlbum ? () => {} : () => editContentList(id as ID),
          onDeleteContentList: isAlbum ? () => {} : () => deleteContentList(id as ID),
          onPublishContentList: isAlbum
            ? () => {}
            : () => publishContentList(id as ID)
        }
      }
      case OverflowSource.NOTIFICATIONS: {
        if (!id || !notification) return {}
        return {
          ...(notification.type === NotificationType.UserSubscription
            ? {
                onUnsubscribeUser: () => unsubscribeUser(notification.userId)
              }
            : {})
        }
      }

      case OverflowSource.PROFILE: {
        if (!id || !handle || !landlordName) return {}
        return {
          onFollow: () => follow(id as ID),
          onUnfollow: () => unfollow(id as ID),
          onShare: () => shareUser(id as ID)
        }
      }
    }
  })()

  return (
    <MobileOverflowModal
      actions={overflowActions}
      callbacks={overflowActionCallbacks}
      isOpen={isOpen}
      onClose={onClose}
      onRepost={onRepost}
      onUnrepost={onUnrepost}
      onFavorite={onFavorite}
      onUnfavorite={onUnfavorite}
      onShare={onShare}
      onAddToContentList={onAddToContentList}
      onVisitAgreementPage={onVisitAgreementPage}
      onEditContentList={onEditContentList}
      onPublishContentList={onPublishContentList}
      onDeleteContentList={onDeleteContentList}
      onVisitLandlordPage={onVisitLandlordPage}
      onVisitCollectionPage={onVisitCollectionPage}
      onVisitCollectiblePage={onVisitCollectiblePage}
      onUnsubscribeUser={onUnsubscribeUser}
      onFollow={onFollow}
      onUnfollow={onUnfollow}
    />
  )
}

// Returns { handle, title, isAlbum }, used in mapStateToProps
const getAdditionalInfo = ({
  state,
  id,
  source
}: {
  state: AppState
  id: ID | string | null
  source: OverflowSource
}): {
  id?: string
  handle?: string
  landlordName?: string
  title?: string
  permalink?: string
  isAlbum?: boolean
  notification?: Notification
  ownerId?: ID
} => {
  if (!id) return {}

  switch (source) {
    case OverflowSource.AGREEMENTS: {
      const agreement = getAgreement(state, { id: id as number })
      if (!agreement) {
        const { collectible, user } = getCurrent(state)
        if (!collectible || !user) return {}

        return {
          id: collectible.id,
          title: collectible.name ?? '',
          ownerId: user.user_id,
          handle: user.handle,
          landlordName: user.name,
          permalink: '',
          isAlbum: false
        }
      }

      const user = getUser(state, { id: agreement.owner_id })
      if (!user) return {}
      return {
        handle: user.handle,
        landlordName: user.name,
        title: agreement.title,
        permalink: agreement.permalink,
        isAlbum: false,
        ownerId: agreement.owner_id
      }
    }
    case OverflowSource.COLLECTIONS: {
      const col = getCollection(state, { id: id as number })
      if (!col) return {}
      const user = getUser(state, { id: col.content_list_owner_id })
      if (!user) return {}
      return {
        handle: user.handle,
        landlordName: user.name,
        title: col.content_list_name,
        isAlbum: col.is_album
      }
    }
    case OverflowSource.PROFILE: {
      const user = getUser(state, { id: id as number })
      if (!user) return {}
      return {
        handle: user.handle,
        landlordName: user.name
      }
    }
    case OverflowSource.NOTIFICATIONS: {
      const notification = getNotificationById(state, id as string)
      return {
        notification
      }
    }
  }
}

const mapStateToProps = (state: AppState) => {
  const modalState = getMobileOverflowModal(state)
  const modalVisibleState = getModalVisibility(state, 'Overflow')
  return {
    ...modalState,
    isOpen: modalVisibleState === true,
    ...getAdditionalInfo({
      state,
      id: modalState.id,
      source: modalState.source
    })
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onClose: () =>
      dispatch(setVisibility({ modal: 'Overflow', visible: false })),
    // Agreements
    repostAgreement: (agreementId: ID) =>
      dispatch(repostAgreement(agreementId, RepostSource.OVERFLOW)),
    unrepostAgreement: (agreementId: ID) =>
      dispatch(undoRepostAgreement(agreementId, RepostSource.OVERFLOW)),
    saveAgreement: (agreementId: ID) =>
      dispatch(saveAgreement(agreementId, FavoriteSource.OVERFLOW)),
    unsaveAgreement: (agreementId: ID) =>
      dispatch(unsaveAgreement(agreementId, FavoriteSource.OVERFLOW)),

    // Collections
    shareCollection: (collectionId: ID) =>
      dispatch(shareCollection(collectionId, ShareSource.OVERFLOW)),
    repostCollection: (collectionId: ID, metadata?: any) =>
      dispatch(repostCollection(collectionId, metadata)),
    unrepostCollection: (collectionId: ID, metadata?: any) =>
      dispatch(undoRepostCollection(collectionId, metadata)),
    saveCollection: (collectionId: ID) =>
      dispatch(saveCollection(collectionId, FavoriteSource.OVERFLOW)),
    unsaveCollection: (collectionId: ID) =>
      dispatch(unsaveCollection(collectionId, FavoriteSource.OVERFLOW)),
    editContentList: (contentListId: ID) => dispatch(openEditContentList(contentListId)),
    deleteContentList: (contentListId: ID) =>
      dispatch(openDeleteContentList({ contentListId })),
    publishContentList: (contentListId: ID) => dispatch(publishContentList(contentListId)),

    // Users
    follow: (userId: ID) => dispatch(followUser(userId, FollowSource.OVERFLOW)),
    unfollow: (userId: ID) =>
      dispatch(unfollowUser(userId, FollowSource.OVERFLOW)),
    shareUser: (userId: ID) =>
      dispatch(shareUser(userId, ShareSource.OVERFLOW)),

    // Notification
    unsubscribeUser: (userId: ID) => dispatch(unsubscribeUser(userId)),

    // Routes
    addToContentList: (agreementId: ID, title: string) =>
      dispatch(openAddToContentList(agreementId, title)),
    visitAgreementPage: (permalink: string) => dispatch(pushRoute(permalink)),
    visitLandlordPage: (handle: string) =>
      dispatch(pushRoute(profilePage(handle))),
    visitCollectiblePage: (handle: string, id: string) => {
      dispatch(pushRoute(collectibleDetailsPage(handle, id)))
    },
    visitContentListPage: (
      contentListId: ID,
      handle: string,
      contentListTitle: string
    ) => dispatch(pushRoute(contentListPage(handle, contentListTitle, contentListId))),
    visitAlbumPage: (albumId: ID, handle: string, albumTitle: string) =>
      dispatch(pushRoute(albumPage(handle, albumTitle, albumId)))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedMobileOverflowModal)