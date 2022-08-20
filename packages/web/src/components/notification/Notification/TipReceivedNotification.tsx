import { ComponentType, useCallback, useState } from 'react'

import { Name, Nullable } from '@coliving/common'
import { useDispatch } from 'react-redux'

import { useUIAudio } from 'common/hooks/useUIAudio'
import { getNotificationUser } from 'common/store/notifications/selectors'
import { TipReceive } from 'common/store/notifications/types'
import {
  makeGetReactionForSignature,
  reactionOrder,
  ReactionTypes,
  writeReactionValue
} from 'common/store/ui/reactions/slice'
import { make } from 'store/analytics/actions'
import { useSelector } from 'utils/reducer'

import styles from './TipReceivedNotification.module.css'
import { AudioText } from './components/AudioText'
import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { NotificationTitle } from './components/NotificationTitle'
import { ProfilePicture } from './components/ProfilePicture'
import { ReactionProps, reactionMap } from './components/Reaction'
import { TwitterShareButton } from './components/TwitterShareButton'
import { UserNameLink } from './components/UserNameLink'
import { IconTip } from './components/icons'
import { useGoToProfile } from './useGoToProfile'

const reactionList: [ReactionTypes, ComponentType<ReactionProps>][] =
  reactionOrder.map((r) => [r, reactionMap[r]])

const messages = {
  title: 'You Received a Tip!',
  sent: 'sent you a tip of',
  live: '$LIVE',
  sayThanks: 'Say Thanks With a Reaction',
  reactionSent: 'Reaction Sent!',
  twitterShare: (senderHandle: string, amount: number) =>
    `Thanks ${senderHandle} for the ${amount} $LIVE tip on @dgc-network! #Coliving #LIVETip`
}

type TipReceivedNotificationProps = {
  notification: TipReceive
}

const useSetReaction = (tipTxSignature: string) => {
  const dispatch = useDispatch()

  const setReactionValue = useCallback(
    (reaction: Nullable<ReactionTypes>) => {
      dispatch(writeReactionValue({ reaction, entityId: tipTxSignature }))
    },
    [tipTxSignature, dispatch]
  )
  return setReactionValue
}

export const TipReceivedNotification = (
  props: TipReceivedNotificationProps
) => {
  const [isTileDisabled, setIsTileDisabled] = useState(false)
  const { notification } = props
  const { amount, timeLabel, isViewed, tipTxSignature } = notification

  const user = useSelector((state) => getNotificationUser(state, notification))

  const reactionValue = useSelector(makeGetReactionForSignature(tipTxSignature))
  const setReaction = useSetReaction(tipTxSignature)

  const uiAmount = useUIAudio(amount)

  const handleClick = useGoToProfile(user)

  const handleShare = useCallback(
    (senderHandle: string) => {
      const shareText = messages.twitterShare(senderHandle, uiAmount)
      const analytics = make(
        Name.NOTIFICATIONS_CLICK_TIP_RECEIVED_TWITTER_SHARE,
        { text: shareText }
      )

      return { shareText, analytics }
    },
    [uiAmount]
  )

  const handleMouseEnter = useCallback(() => setIsTileDisabled(true), [])
  const handleMouseLeave = useCallback(() => setIsTileDisabled(false), [])

  if (!user) return null

  return (
    <NotificationTile
      notification={notification}
      disabled={isTileDisabled}
      disableClosePanel
      onClick={handleClick}
    >
      <NotificationHeader icon={<IconTip />}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationBody className={styles.body}>
        <div className={styles.bodyText}>
          <ProfilePicture className={styles.profilePicture} user={user} />
          <span>
            <UserNameLink user={user} notification={notification} />{' '}
            {messages.sent} <AudioText value={uiAmount} />
          </span>
        </div>
        <div className={styles.sayThanks}>
          {reactionValue ? (
            <>
              <i className='emoji small white-heavy-check-mark' />{' '}
              {messages.reactionSent}{' '}
            </>
          ) : (
            messages.sayThanks
          )}
        </div>
        <div
          className={styles.reactionList}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {reactionList.map(([reactionType, Reaction]) => (
            <Reaction
              key={reactionType}
              onClick={(e) => {
                e.stopPropagation()
                setReaction(reactionType)
              }}
              isActive={
                reactionValue // treat 0 and null equivalently here
                  ? reactionType === reactionValue
                  : undefined
              }
              isResponsive
            />
          ))}
        </div>
      </NotificationBody>
      <TwitterShareButton
        type='dynamic'
        handle={user.handle}
        shareData={handleShare}
      />
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}
