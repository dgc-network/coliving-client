import {
  ID,
  Name,
  Status,
  Agreement,
  FeatureFlags,
  IntKeys,
  remoteConfigIntDefaults
} from '@coliving/common'
import moment from 'moment'
import { eventChannel } from 'redux-saga'
import {
  call,
  delay,
  fork,
  all,
  take,
  put,
  takeEvery,
  select,
  takeLatest
} from 'typed-redux-saga/macro'

import { getUserId, getHasAccount } from 'common/store/account/selectors'
import { retrieveCollections } from 'common/store/cache/collections/utils'
import { retrieveAgreements } from 'common/store/cache/agreements/utils'
import { fetchUsers } from 'common/store/cache/users/sagas'
import * as notificationActions from 'common/store/notifications/actions'
import {
  getLastNotification,
  getNotificationUserList,
  getNotificationPanelIsOpen,
  getNotificationStatus,
  makeGetAllNotifications,
  getContentListUpdates
} from 'common/store/notifications/selectors'
import {
  Notification,
  Entity,
  NotificationType,
  Achievement
} from 'common/store/notifications/types'
import { getIsReachable } from 'common/store/reachability/selectors'
import { fetchReactionValues } from 'common/store/ui/reactions/slice'
import { getBalance } from 'common/store/wallet/slice'
import ColivingBackend from 'services/ColivingBackend'
import { ResetNotificationsBadgeCount } from 'services/native-mobile-interface/notifications'
import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import { make } from 'store/analytics/actions'
import { waitForBackendSetup } from 'store/backend/sagas'
import { isElectron } from 'utils/clientUtil'
import { getErrorMessage } from 'utils/error'
import { waitForValue } from 'utils/sagaHelpers'

import { watchNotificationError } from './errorSagas'
import mobileSagas from './mobileSagas'

type ResponseNotification = Notification & {
  id: string
  entityIds: number[]
  userIds: number[]
}

type NotificationsResponse =
  | {
      notifications: ResponseNotification[]
      totalUnread: number
      content listUpdates: number[]
    }
  | {
      error: { message: string }
      isRequestError: true
    }

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

// The initial user count to load in for each notification
// NOTE: the rest are loading in in the user list modal
export const USER_INITIAL_LOAD_COUNT = 9

// Gets the polling interval from remoteconfig
const getPollingIntervalMs = () => {
  const pollingInterval = remoteConfigInstance.getRemoteVar(
    IntKeys.NOTIFICATION_POLLING_FREQ_MS
  )
  return (
    pollingInterval ??
    (remoteConfigIntDefaults[IntKeys.NOTIFICATION_POLLING_FREQ_MS] as number)
  )
}

const getTimeAgo = (now: moment.Moment, date: string) => {
  const notifDate = moment(date)
  const weeksAgo = now.diff(notifDate, 'weeks')
  if (weeksAgo) return `${weeksAgo} Week${weeksAgo > 1 ? 's' : ''} ago`
  const daysAgo = now.diff(notifDate, 'days')
  if (daysAgo) return `${daysAgo} Day${daysAgo > 1 ? 's' : ''} ago`
  const hoursAgo = now.diff(notifDate, 'hours')
  if (hoursAgo) return `${hoursAgo} Hour${hoursAgo > 1 ? 's' : ''} ago`
  const minutesAgo = now.diff(notifDate, 'minutes')
  if (minutesAgo) return `${minutesAgo} Minute${minutesAgo > 1 ? 's' : ''} ago`
  return 'A few moments ago'
}

const NOTIFICATION_LIMIT_DEFAULT = 20

function* recordContentListUpdatesAnalytics(content listUpdates: ID[]) {
  const existingUpdates: ID[] = yield* select(getContentListUpdates)
  yield* put(notificationActions.setContentListUpdates(content listUpdates))
  if (
    content listUpdates.length > 0 &&
    existingUpdates.length !== content listUpdates.length
  ) {
    const event = make(Name.CONTENT_LIST_LIBRARY_HAS_UPDATE, {
      count: content listUpdates.length
    })
    yield* put(event)
  }
}

/**
 * Fetch notifications, used by notification pagination
 * This is the function used to fetch more notifcations after the initial load in getNotifications
 */
export function* fetchNotifications(
  action: notificationActions.FetchNotifications
) {
  try {
    yield* put(notificationActions.fetchNotificationsRequested())
    const limit = action.limit || NOTIFICATION_LIMIT_DEFAULT
    const lastNotification = yield* select(getLastNotification)
    const timeOffset = lastNotification
      ? lastNotification.timestamp
      : moment().toISOString()
    const withTips = getFeatureEnabled(FeatureFlags.TIPPING_ENABLED)
    const notificationsResponse: NotificationsResponse = yield* call(
      ColivingBackend.getNotifications,
      {
        limit,
        timeOffset,
        withTips
      }
    )
    if ('error' in notificationsResponse) {
      yield* put(
        notificationActions.fetchNotificationsFailed(
          notificationsResponse.error.message
        )
      )
      return
    }
    const {
      notifications: notificationItems,
      totalUnread: totalUnviewed,
      content listUpdates
    } = notificationsResponse

    const notifications = yield* parseAndProcessNotifications(notificationItems)

    const hasMore = notifications.length >= limit

    yield* fork(recordContentListUpdatesAnalytics, content listUpdates)
    yield* put(
      notificationActions.fetchNotificationSucceeded(
        notifications,
        totalUnviewed,
        hasMore
      )
    )
  } catch (error) {
    const isReachable = yield* select(getIsReachable)
    if (isReachable) {
      yield* put(
        notificationActions.fetchNotificationsFailed(
          `Error in fetch notifications requested: ${getErrorMessage(error)}`
        )
      )
    }
  }
}

export function* parseAndProcessNotifications(
  notifications: Notification[]
): Generator<any, Notification[], any> {
  /**
   * Parse through the notifications & collect user /agreement / collection IDs
   * that the notification references to fetch
   */
  const agreementIdsToFetch: ID[] = []
  const collectionIdsToFetch: ID[] = []
  const userIdsToFetch: ID[] = []
  const reactionSignatureToFetch: string[] = []

  notifications.forEach((notification) => {
    if (notification.type === NotificationType.UserSubscription) {
      if (notification.entityType === Entity.Agreement) {
        // @ts-ignore
        notification.entityIds = [...new Set(notification.entityIds)]
        agreementIdsToFetch.push(...notification.entityIds)
      } else if (
        notification.entityType === Entity.ContentList ||
        notification.entityType === Entity.Album
      ) {
        // @ts-ignore
        notification.entityIds = [...new Set(notification.entityIds)]
        collectionIdsToFetch.push(...notification.entityIds)
      }
      userIdsToFetch.push(notification.userId)
    }
    if (
      notification.type === NotificationType.Repost ||
      notification.type === NotificationType.Favorite ||
      (notification.type === NotificationType.Milestone &&
        'entityType' in notification)
    ) {
      if (notification.entityType === Entity.Agreement) {
        agreementIdsToFetch.push(notification.entityId)
      } else if (
        notification.entityType === Entity.ContentList ||
        notification.entityType === Entity.Album
      ) {
        collectionIdsToFetch.push(notification.entityId)
      } else if (notification.entityType === Entity.User) {
        userIdsToFetch.push(notification.entityId)
      }
    }
    if (
      notification.type === NotificationType.Follow ||
      notification.type === NotificationType.Repost ||
      notification.type === NotificationType.Favorite
    ) {
      // @ts-ignore
      notification.userIds = [...new Set(notification.userIds)]
      userIdsToFetch.push(
        ...notification.userIds.slice(0, USER_INITIAL_LOAD_COUNT)
      )
    }
    if (notification.type === NotificationType.RemixCreate) {
      agreementIdsToFetch.push(
        notification.parentAgreementId,
        notification.childAgreementId
      )
      notification.entityType = Entity.Agreement
      notification.entityIds = [
        notification.parentAgreementId,
        notification.childAgreementId
      ]
    }
    if (notification.type === NotificationType.RemixCosign) {
      agreementIdsToFetch.push(notification.childAgreementId)
      userIdsToFetch.push(notification.parentAgreementUserId)
      notification.entityType = Entity.Agreement
      notification.entityIds = [notification.childAgreementId]
      notification.userId = notification.parentAgreementUserId
    }
    if (notification.type === NotificationType.TrendingAgreement) {
      agreementIdsToFetch.push(notification.entityId)
    }
    if (
      notification.type === NotificationType.TipSend ||
      notification.type === NotificationType.TipReceive ||
      notification.type === NotificationType.SupporterRankUp ||
      notification.type === NotificationType.SupportingRankUp ||
      notification.type === NotificationType.Reaction
    ) {
      userIdsToFetch.push(notification.entityId)
    }
    if (notification.type === NotificationType.TipReceive) {
      reactionSignatureToFetch.push(notification.tipTxSignature)
    }
    if (notification.type === NotificationType.AddAgreementToContentList) {
      agreementIdsToFetch.push(notification.agreementId)
      userIdsToFetch.push(notification.content listOwnerId)
      collectionIdsToFetch.push(notification.content listId)
    }
  })

  const [agreements]: Agreement[][] = yield* all([
    call(retrieveAgreements, { agreementIds: agreementIdsToFetch }),
    call(
      retrieveCollections,
      null, // userId
      collectionIdsToFetch, // collection ids
      false // fetchAgreements
    ),
    call(
      fetchUsers,
      userIdsToFetch, // userIds
      undefined, // requiredFields
      false // forceRetrieveFromSource
    ),
    reactionSignatureToFetch.length
      ? put(fetchReactionValues({ entityIds: reactionSignatureToFetch }))
      : () => {}
  ])

  /**
   * For Milestone and Followers, update the notification entityId as the userId
   * For Remix Create, add the userId as the agreement owner id of the fetched child agreement
   * Attach a `timeLabel` to each notification as well to be displayed ie. 2 Hours Ago
   */
  const now = moment()
  const userId = yield* select(getUserId)
  if (!userId) return []
  const remixAgreementParents: Array<ID> = []
  const processedNotifications = notifications.map((notif) => {
    if (
      notif.type === NotificationType.Milestone &&
      notif.achievement === Achievement.Followers
    ) {
      notif.entityId = userId
    } else if (notif.type === NotificationType.RemixCreate) {
      const childAgreement = agreements.find(
        (agreement) => agreement.agreement_id === notif.childAgreementId
      )
      if (childAgreement) {
        notif.userId = childAgreement.owner_id
      }
    } else if (notif.type === NotificationType.RemixCosign) {
      const childAgreement = agreements.find(
        (agreement) => agreement.agreement_id === notif.childAgreementId
      )
      if (childAgreement && childAgreement.remix_of) {
        const parentAgreementIds = childAgreement.remix_of.agreements.map(
          (t) => t.parent_agreement_id
        )
        remixAgreementParents.push(...parentAgreementIds)
        notif.entityIds.push(...parentAgreementIds)
      }
    }
    notif.timeLabel = getTimeAgo(now, notif.timestamp)
    return notif
  })
  if (remixAgreementParents.length > 0)
    yield* call(retrieveAgreements, { agreementIds: remixAgreementParents })
  return processedNotifications
}

/**
 * Run side effects for new notifications
 */
const LIVE_TRANSFER_NOTIFICATION_TYPES = new Set([
  NotificationType.ChallengeReward,
  NotificationType.TipSend,
  NotificationType.TipReceive
])
export function* handleNewNotifications(notifications: Notification[]) {
  const hasAudioTransferNotification = notifications.some((notification) =>
    LIVE_TRANSFER_NOTIFICATION_TYPES.has(notification.type)
  )
  if (hasAudioTransferNotification) {
    yield* put(getBalance())
  }
}

export function* fetchNotificationUsers(
  action: notificationActions.FetchNotificationUsers
) {
  try {
    const userList = yield* select(getNotificationUserList)
    if (userList.status === Status.LOADING) return
    yield* put(notificationActions.fetchNotificationUsersRequested())
    const { userIds, limit } = yield* select(getNotificationUserList)
    const newLimit = limit + action.limit
    const userIdsToFetch = userIds.slice(limit, newLimit)
    yield* call(
      fetchUsers,
      userIdsToFetch,
      new Set(),
      /* forceRetrieveFromSource */ true
    )
    yield* put(notificationActions.fetchNotificationUsersSucceeded(newLimit))
  } catch (error) {
    yield* put(
      notificationActions.fetchNotificationUsersFailed(getErrorMessage(error))
    )
  }
}

export function* subscribeUserSettings(
  action: notificationActions.SubscribeUser
) {
  yield* call(ColivingBackend.updateUserSubscription, action.userId, true)
}

export function* unsubscribeUserSettings(
  action: notificationActions.UnsubscribeUser
) {
  yield* call(ColivingBackend.updateUserSubscription, action.userId, false)
}

export function* updateContentListLastViewedAt(
  action: notificationActions.UpdateContentListLastViewedAt
) {
  yield* call(ColivingBackend.updateContentListLastViewedAt, action.content listId)
}

// Action Watchers
function* watchFetchNotifications() {
  yield* takeEvery(notificationActions.FETCH_NOTIFICATIONS, fetchNotifications)
}

function* watchRefreshNotifications() {
  yield* takeLatest(notificationActions.REFRESH_NOTIFICATIONS, function* () {
    yield* put(notificationActions.fetchNotificationsRequested())
    // Add an artificial timeout here for the sake of debouncing the sync to
    // react native store. Currently this refresh saga should only be called by
    // notifications on mobile.
    // TODO: This should be removed when we move common store to react native
    yield* delay(1000)
    yield* call(getNotifications, true)
    yield* put(
      notificationActions.fetchNotificationSucceeded(
        [], // notifications
        0, // totalUnviewed
        false // hasMore
      )
    )
  })
}

function* watchFetchNotificationUsers() {
  yield* takeEvery(
    notificationActions.FETCH_NOTIFICATIONS_USERS,
    fetchNotificationUsers
  )
}

function* watchMarkAllNotificationsViewed() {
  yield* takeEvery(
    notificationActions.MARK_ALL_AS_VIEWED,
    markAllNotificationsViewed
  )
}

function* watchSubscribeUserSettings() {
  yield* takeEvery(notificationActions.SUBSCRIBE_USER, subscribeUserSettings)
}

function* watchUnsubscribeUserSettings() {
  yield* takeEvery(
    notificationActions.UNSUBSCRIBE_USER,
    unsubscribeUserSettings
  )
}

function* watchUpdateContentListLastViewedAt() {
  yield* takeEvery(
    notificationActions.UPDATE_CONTENT_LIST_VIEW,
    updateContentListLastViewedAt
  )
}

// Notifications have changed if some of the incoming ones have
// different ids or changed length in unique entities/users
const checkIfNotificationsChanged = (
  current: Notification[],
  incoming: ResponseNotification[]
): boolean => {
  return (
    incoming.length > current.length ||
    incoming.some((item: any, index: number) => {
      const notif = current[index]
      const isIdDifferent = notif.id !== item.id
      const isEntitySizeDiff =
        'entityIds' in notif &&
        notif.entityIds &&
        item.entityIds &&
        new Set(notif.entityIds).size !== new Set(item.entityIds).size
      const isUsersSizeDiff =
        'userIds' in notif &&
        notif.userIds &&
        item.userIds &&
        new Set(notif.userIds).size !== new Set(item.userIds).size
      return isIdDifferent || isEntitySizeDiff || isUsersSizeDiff
    })
  )
}

/**
 * Get notifications, used the polling daemon
 */
export function* getNotifications(isFirstFetch: boolean) {
  try {
    const isOpen: ReturnType<typeof getNotificationPanelIsOpen> = yield* select(
      getNotificationPanelIsOpen
    )
    const status: ReturnType<typeof getNotificationStatus> = yield* select(
      getNotificationStatus
    )
    if (
      (!isOpen || isFirstFetch) &&
      (status !== Status.LOADING || isFirstFetch)
    ) {
      isFirstFetch = false
      const limit = NOTIFICATION_LIMIT_DEFAULT
      const hasAccount: ReturnType<typeof getHasAccount> = yield* select(
        getHasAccount
      )
      if (!hasAccount) return
      const timeOffset = moment().toISOString()
      const withTips = getFeatureEnabled(FeatureFlags.TIPPING_ENABLED)

      const notificationsResponse: NotificationsResponse | undefined =
        yield* call(ColivingBackend.getNotifications, {
          limit,
          timeOffset,
          withTips
        })
      if (
        !notificationsResponse ||
        ('error' in notificationsResponse &&
          'isRequestError' in notificationsResponse)
      ) {
        const isReachable: ReturnType<typeof getIsReachable> = yield* select(
          getIsReachable
        )
        if (isReachable) {
          yield* put(
            notificationActions.fetchNotificationsFailed(
              `Error in notification polling daemon, server returned error: ${
                notificationsResponse?.error?.message ?? 'no error defined'
              }`
            )
          )
        }
        yield* delay(getPollingIntervalMs())
        return
      }
      const {
        notifications: notificationItems,
        totalUnread: totalUnviewed,
        content listUpdates
      } = notificationsResponse

      yield* fork(recordContentListUpdatesAnalytics, content listUpdates)

      if (notificationItems.length > 0) {
        const currentNotifications = yield* select(makeGetAllNotifications())
        const isChanged = checkIfNotificationsChanged(
          currentNotifications,
          notificationItems
        )
        if (isChanged) {
          const notifications = yield* parseAndProcessNotifications(
            notificationItems
          )

          const hasMore = notifications.length >= limit
          yield* put(
            notificationActions.setNotifications(
              notifications,
              totalUnviewed,
              hasMore
            )
          )
          yield* handleNewNotifications(notificationItems)
        }
      } else if (status !== Status.SUCCESS) {
        yield* put(
          notificationActions.fetchNotificationSucceeded(
            [], // notifications
            0, // totalUnviewed
            false // hasMore
          )
        )
      }
    }
  } catch (error) {
    const isReachable = yield* select(getIsReachable)
    if (isReachable) {
      yield* put(
        notificationActions.fetchNotificationsFailed(
          `Notification Polling Daemon Error: ${getErrorMessage(error)}`
        )
      )
    }
  }
}

function* notificationPollingDaemon() {
  yield* call(waitForBackendSetup)
  yield* call(waitForValue, getHasAccount, {})
  yield* call(ColivingBackend.getEmailNotificationSettings)

  // Set up daemon that will watch for browser into focus and refetch notifications
  // as soon as it goes into focus
  const visibilityChannel = eventChannel((emitter) => {
    if (NATIVE_MOBILE) {
      // The focus and visibitychange events are wonky on native mobile webviews,
      // so poll for visiblity change instead
      let lastHidden = true
      setInterval(() => {
        if (!document.hidden && lastHidden) {
          emitter(true)
        }
        lastHidden = document.hidden
      }, 500)
    } else {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          emitter(true)
        }
      })
    }
    return () => {}
  })
  yield* fork(function* () {
    while (true) {
      yield* take(visibilityChannel)
      yield* call(getNotifications, false)
    }
  })

  // Set up daemon that will poll for notifications every 10s if the browser is
  // in the foreground
  const isFirstFetch = true
  let isBrowserInBackground = false
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) {
        isBrowserInBackground = true
      } else {
        isBrowserInBackground = false
      }
    },
    false
  )

  while (true) {
    if (!isBrowserInBackground || isElectron()) {
      yield* call(getNotifications, isFirstFetch)
    }
    yield* delay(getPollingIntervalMs())
  }
}

export function* markAllNotificationsViewed() {
  yield* call(waitForBackendSetup)
  yield* call(ColivingBackend.markAllNotificationAsViewed)
  if (NATIVE_MOBILE) {
    const message = new ResetNotificationsBadgeCount()
    message.send()
  }
}

function* watchTogglePanel() {
  yield* call(waitForBackendSetup)
  yield* takeEvery(notificationActions.TOGGLE_NOTIFICATION_PANEL, function* () {
    const isOpen = yield* select(getNotificationPanelIsOpen)
    if (isOpen) {
      yield* put(notificationActions.setTotalUnviewedToZero())
    } else {
      yield* put(notificationActions.markAllAsViewed())
    }
  })
}

export default function sagas() {
  const sagas: (() => Generator)[] = [
    watchFetchNotifications,
    watchRefreshNotifications,
    watchFetchNotificationUsers,
    watchMarkAllNotificationsViewed,
    watchSubscribeUserSettings,
    watchUnsubscribeUserSettings,
    notificationPollingDaemon,
    watchTogglePanel,
    watchNotificationError,
    watchUpdateContentListLastViewedAt
  ]
  return NATIVE_MOBILE ? sagas.concat(mobileSagas()) : sagas
}
