import { useCallback } from 'react'

import {
  CID,
  ID,
  Name,
  SquareSizes,
  CoverArtSizes,
  FieldVisibility,
  Remix
} from '@coliving/common'
import { Button, ButtonType, IconPause, IconPlay } from '@coliving/stems'
import cn from 'classnames'
import Linkify from 'linkifyjs/react'

import placeholderArt from 'assets/img/imageBlank2x.png'
import { OverflowAction } from 'common/store/ui/mobileOverflowMenu/types'
import { squashNewLines } from 'common/utils/formatUtil'
import { getCanonicalName } from 'common/utils/genres'
import { formatSeconds, formatDate } from 'common/utils/timeUtil'
import CoSign from 'components/coSign/coSign'
import HoverInfo from 'components/coSign/hoverInfo'
import { Size } from 'components/coSign/types'
import DownloadButtons from 'components/downloadButtons/downloadButtons'
import DynamicImage from 'components/dynamicImage/dynamicImage'
import UserBadges from 'components/userBadges/userBadges'
import { useAgreementCoverArt } from 'hooks/useAgreementCoverArt'
import { make, useRecord } from 'store/analytics/actions'
import { moodMap } from 'utils/moods'
import { isDarkMode } from 'utils/theme/theme'

import HiddenAgreementHeader from '../hiddenAgreementHeader'

import ActionButtonRow from './actionButtonRow'
import StatsButtonRow from './statsButtonRow'
import styles from './agreementHeader.module.css'

const messages = {
  agreement: 'AGREEMENT',
  remix: 'REMIX',
  play: 'PLAY',
  pause: 'PAUSE'
}

const PlayButton = (props: { playing: boolean; onPlay: () => void }) => {
  return props.playing ? (
    <Button
      className={cn(styles.playAllButton, styles.buttonFormatting)}
      textClassName={styles.playAllButtonText}
      type={ButtonType.PRIMARY_ALT}
      text={messages.pause}
      leftIcon={<IconPause />}
      onClick={props.onPlay} css={undefined}    />
  ) : (
    <Button
        className={cn(styles.playAllButton, styles.buttonFormatting)}
        textClassName={styles.playAllButtonText}
        type={ButtonType.PRIMARY_ALT}
        text={messages.play}
        leftIcon={<IconPlay />}
        onClick={props.onPlay} css={undefined}    />
  )
}

type AgreementHeaderProps = {
  isLoading: boolean
  isPlaying: boolean
  isOwner: boolean
  isSaved: boolean
  isReposted: boolean
  isFollowing: boolean
  title: string
  agreementId: ID
  userId: ID
  coverArtSizes: CoverArtSizes | null
  landlordName: string
  landlordVerified: boolean
  description: string
  released: string
  genre: string
  mood: string
  credits: string
  tags: string
  listenCount: number
  duration: number
  saveCount: number
  repostCount: number
  isUnlisted: boolean
  isRemix: boolean
  fieldVisibility: FieldVisibility
  coSign: Remix | null
  onClickTag: (tag: string) => void
  onClickLandlordName: () => void
  onClickMobileOverflow: (
    agreementId: ID,
    overflowActions: OverflowAction[]
  ) => void
  onPlay: () => void
  onShare: () => void
  onSave: () => void
  onRepost: () => void
  onDownload: (
    agreementId: ID,
    cid: CID,
    category?: string,
    parentAgreementId?: ID
  ) => void
  goToFavoritesPage: (agreementId: ID) => void
  goToRepostsPage: (agreementId: ID) => void
}

const AgreementHeader = ({
  title,
  agreementId,
  userId,
  coverArtSizes,
  landlordName,
  landlordVerified,
  description,
  isOwner,
  isFollowing,
  released,
  duration,
  isLoading,
  isPlaying,
  isSaved,
  isReposted,
  isUnlisted,
  isRemix,
  fieldVisibility,
  coSign,
  saveCount,
  repostCount,
  listenCount,
  mood,
  credits,
  genre,
  tags,
  onClickLandlordName,
  onClickTag,
  onPlay,
  onShare,
  onSave,
  onRepost,
  onDownload,
  onClickMobileOverflow,
  goToFavoritesPage,
  goToRepostsPage
}: AgreementHeaderProps) => {
  const image = useAgreementCoverArt(
    agreementId,
    coverArtSizes,
    SquareSizes.SIZE_480_BY_480
  )
  const onSaveHeroAgreement = () => {
    if (!isOwner) onSave()
  }
  const filteredTags = (tags || '').split(',').filter(Boolean)

  const agreementLabels: { isHidden?: boolean; label: string; value: any }[] = [
    {
      label: 'Duration',
      value: formatSeconds(duration)
    },
    {
      label: 'Genre',
      isHidden: isUnlisted && !fieldVisibility?.genre,
      value: getCanonicalName(genre)
    },
    { value: formatDate(released), label: 'Released', isHidden: isUnlisted },
    {
      isHidden: isUnlisted && !fieldVisibility?.mood,
      label: 'Mood',
      // @ts-ignore
      value: mood && mood in moodMap ? moodMap[mood] : mood
    },
    { label: 'Credit', value: credits }
  ].filter(({ isHidden, value }) => !isHidden && !!value)

  const record = useRecord()
  const onExternalLinkClick = useCallback(
    (event) => {
      record(
        make(Name.LINK_CLICKING, {
          url: event.target.href,
          source: 'agreement page' as const
        })
      )
    },
    [record]
  )

  const onClickOverflow = () => {
    const overflowActions = [
      isOwner || isUnlisted
        ? null
        : isReposted
        ? OverflowAction.UNREPOST
        : OverflowAction.REPOST,
      isOwner || isUnlisted
        ? null
        : isSaved
        ? OverflowAction.UNFAVORITE
        : OverflowAction.FAVORITE,
      OverflowAction.ADD_TO_CONTENT_LIST,
      isFollowing
        ? OverflowAction.UNFOLLOW_LANDLORD
        : OverflowAction.FOLLOW_LANDLORD,
      OverflowAction.VIEW_LANDLORD_PAGE
    ].filter(Boolean) as OverflowAction[]

    onClickMobileOverflow(agreementId, overflowActions)
  }

  const renderTags = () => {
    if (isUnlisted && !fieldVisibility.tags) return null
    return (
      <>
        {filteredTags.length > 0 ? (
          <div className={styles.tags}>
            {filteredTags.map((tag) => (
              <h2
                key={tag}
                onClick={() => onClickTag(tag)}
                className={styles.tag}
              >
                {tag}
              </h2>
            ))}
          </div>
        ) : null}
      </>
    )
  }

  const renderDownloadButtons = () => {
    return (
      <DownloadButtons
        className={styles.downloadButtonsContainer}
        agreementId={agreementId}
        isOwner={isOwner}
        following={isFollowing}
        onDownload={onDownload}
      />
    )
  }

  const renderAgreementLabels = () => {
    return agreementLabels.map((infoFact) => {
      return (
        <div key={infoFact.label} className={styles.infoFact}>
          <h2 className={styles.infoLabel}>{infoFact.label}</h2>
          <h2 className={styles.infoValue}>{infoFact.value}</h2>
        </div>
      )
    })
  }

  const onClickFavorites = useCallback(() => {
    goToFavoritesPage(agreementId)
  }, [goToFavoritesPage, agreementId])

  const onClickReposts = useCallback(() => {
    goToRepostsPage(agreementId)
  }, [goToRepostsPage, agreementId])

  const imageElement = coSign ? (
    <CoSign
      size={Size.LARGE}
      hasFavorited={coSign.has_remix_author_saved}
      hasReposted={coSign.has_remix_author_reposted}
      coSignName={coSign.user.name}
      className={styles.coverArt}
      userId={coSign.user.user_id}
    >
      <DynamicImage image={image} wrapperClassName={styles.imageWrapper} />
    </CoSign>
  ) : (
    <DynamicImage
      image={image}
      wrapperClassName={cn(styles.coverArt, styles.imageWrapper)}
    />
  )

  return (
    <div className={styles.agreementHeader}>
      {isUnlisted ? (
        <div className={styles.hiddenAgreementHeaderWrapper}>
          <HiddenAgreementHeader />
        </div>
      ) : (
        <div className={styles.typeLabel}>
          {isRemix ? messages.remix : messages.agreement}
        </div>
      )}
      {imageElement}
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.landlord} onClick={onClickLandlordName}>
        <h2>{landlordName}</h2>
        <UserBadges
          className={styles.verified}
          badgeSize={16}
          userId={userId}
        />
      </div>
      <div className={styles.buttonSection}>
        <PlayButton playing={isPlaying} onPlay={onPlay} />
        <ActionButtonRow
          showRepost={!isUnlisted}
          showFavorite={!isUnlisted}
          showShare={!isUnlisted || fieldVisibility.share}
          showOverflow
          shareToastDisabled
          isOwner={isOwner}
          isReposted={isReposted}
          isSaved={isSaved}
          onClickOverflow={onClickOverflow}
          onRepost={onRepost}
          onFavorite={onSaveHeroAgreement}
          onShare={onShare}
          darkMode={isDarkMode()}
        />
      </div>
      {coSign && (
        <div className={styles.coSignInfo}>
          <HoverInfo
            coSignName={coSign.user.name}
            hasFavorited={coSign.has_remix_author_saved}
            hasReposted={coSign.has_remix_author_reposted}
            userId={coSign.user.user_id}
          />
        </div>
      )}
      <StatsButtonRow
        showListenCount={!isUnlisted || fieldVisibility.play_count}
        showFavoriteCount={!isUnlisted}
        showRepostCount={!isUnlisted}
        listenCount={listenCount}
        favoriteCount={saveCount}
        repostCount={repostCount}
        onClickFavorites={onClickFavorites}
        onClickReposts={onClickReposts}
      />
      {description ? (
        // https://github.com/Soapbox/linkifyjs/issues/292
        // @ts-ignore
        <Linkify options={{ attributes: { onClick: onExternalLinkClick } }}>
          <h3 className={styles.description}>{squashNewLines(description)}</h3>
        </Linkify>
      ) : null}
      <div
        className={cn(styles.infoSection, {
          [styles.noStats]: isUnlisted && !fieldVisibility.play_count
        })}
      >
        {renderAgreementLabels()}
      </div>
      {renderDownloadButtons()}
      {renderTags()}
    </div>
  )
}

AgreementHeader.defaultProps = {
  loading: false,
  playing: false,
  active: true,
  coverArtUrl: placeholderArt,
  landlordVerified: false,
  description: '',

  isOwner: false,
  isAlbum: false,
  hasAgreements: false,
  isPublished: false,
  isSaved: false,

  saveCount: 0,
  tags: [],
  onPlay: () => {}
}

export default AgreementHeader