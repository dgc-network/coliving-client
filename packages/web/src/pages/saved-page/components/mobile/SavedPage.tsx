import { ReactNode, useCallback, useEffect, useContext } from 'react'

import { ID, UID, Name, Lineup, Status, User } from '@coliving/common'
import { Button, ButtonType } from '@coliving/stems'
import cn from 'classnames'

import { ReactComponent as IconAlbum } from 'assets/img/iconAlbum.svg'
import { ReactComponent as IconFilter } from 'assets/img/iconFilter.svg'
import { ReactComponent as IconNote } from 'assets/img/iconNote.svg'
import { ReactComponent as IconContentLists } from 'assets/img/iconContentLists.svg'
import {
  Tabs,
  SavedPageAgreement,
  SavedPageCollection
} from 'common/store/pages/saved-page/types'
import { QueueItem } from 'common/store/queue/types'
import Card from 'components/card/mobile/Card'
import Header from 'components/header/mobile/Header'
import { HeaderContext } from 'components/header/mobile/HeaderContextProvider'
import CardLineup from 'components/lineup/CardLineup'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import MobilePageContainer from 'components/mobile-page-container/MobilePageContainer'
import { useMainPageHeader } from 'components/nav/store/context'
import AgreementList from 'components/agreement/mobile/AgreementList'
import { AgreementItemAction } from 'components/agreement/mobile/AgreementListItem'
import useTabs from 'hooks/useTabs/useTabs'
import { make, useRecord } from 'store/analytics/actions'
import { albumPage, TRENDING_PAGE, content listPage } from 'utils/route'

import NewContentListButton from './NewContentListButton'
import styles from './SavedPage.module.css'

const emptyTabMessages = {
  afterSaved: "Once you have, this is where you'll find them!",
  goToTrending: 'Go to Trending'
}

type EmptyTabProps = {
  message: string | ReactNode
  onClick: () => void
}

export const EmptyTab = (props: EmptyTabProps) => {
  return (
    <div className={styles.emptyTab}>
      <div className={styles.message}>{props.message}</div>
      <div className={styles.afterSaved}>{emptyTabMessages.afterSaved}</div>
      <Button
        type={ButtonType.PRIMARY_ALT}
        className={styles.emptyButton}
        textClassName={styles.emptyButtonText}
        text={emptyTabMessages.goToTrending}
        onClick={props.onClick}
      />
    </div>
  )
}

const OFFSET_HEIGHT = 142
const SCROLL_HEIGHT = 88

/**
 * The Filter input should be hidden and displayed on scroll down.
 * The content container's height is set as the height plus the scroll
 * height so the search conatiner can be hidden under the top bar.
 * On component mount, the child component is scrolled to hide the input.
 */
const useOffsetScroll = () => {
  // Set the child's height base on it's content vs window height
  const contentRefCallback = useCallback((node) => {
    if (node !== null) {
      const contentHeight = (window as any).innerHeight - OFFSET_HEIGHT
      const useContentHeight = contentHeight > node.scrollHeight
      node.style.height = useContentHeight
        ? `calc(${contentHeight}px + ${SCROLL_HEIGHT}px)`
        : `${node.scrollHeight + SCROLL_HEIGHT}px`
      window.scroll(0, SCROLL_HEIGHT)
    }
  }, [])

  return contentRefCallback
}

const AgreementsLineup = ({
  agreements,
  goToTrending,
  onFilterChange,
  filterText,
  getFilteredData,
  playingUid,
  queuedAndPlaying,
  onSave,
  onTogglePlay
}: {
  agreements: Lineup<SavedPageAgreement>
  goToTrending: () => void
  onFilterChange: (e: any) => void
  filterText: string
  getFilteredData: (agreementMetadatas: any) => [SavedPageAgreement[], number]
  playingUid: UID | null
  queuedAndPlaying: boolean
  onSave: (isSaved: boolean, agreementId: ID) => void
  onTogglePlay: (uid: UID, agreementId: ID) => void
}) => {
  const [agreementEntries] = getFilteredData(agreements.entries)
  const agreementList = agreementEntries.map((entry) => ({
    isLoading: false,
    isSaved: entry.has_current_user_saved,
    isReposted: entry.has_current_user_reposted,
    isActive: playingUid === entry.uid,
    isPlaying: queuedAndPlaying && playingUid === entry.uid,
    artistName: entry.user.name,
    artistHandle: entry.user.handle,
    agreementTitle: entry.title,
    agreementId: entry.agreement_id,
    uid: entry.uid,
    isDeleted: entry.is_delete || !!entry.user.is_deactivated
  }))
  const contentRefCallback = useOffsetScroll()
  return (
    <div className={styles.agreementsLineupContainer}>
      {agreements.status !== Status.LOADING ? (
        agreements.entries.length === 0 ? (
          <EmptyTab
            message={
              <>
                {messages.emptyAgreements}
                <i className={cn('emoji', 'face-with-monocle', styles.emoji)} />
              </>
            }
            onClick={goToTrending}
          />
        ) : (
          <div ref={contentRefCallback} className={styles.tabContainer}>
            <div className={styles.searchContainer}>
              <div className={styles.searchInnerContainer}>
                <input
                  placeholder={messages.filterAgreements}
                  onChange={onFilterChange}
                  value={filterText}
                />
                <IconFilter className={styles.iconFilter} />
              </div>
            </div>
            {agreementList.length > 0 && (
              <div className={styles.agreementListContainer}>
                <AgreementList
                  agreements={agreementList}
                  showDivider
                  showBorder
                  onSave={onSave}
                  togglePlay={onTogglePlay}
                  agreementItemAction={AgreementItemAction.Save}
                />
              </div>
            )}
          </div>
        )
      ) : null}
    </div>
  )
}

const AlbumCardLineup = ({
  albums,
  goToTrending,
  onFilterChange,
  filterText,
  goToRoute,
  getFilteredAlbums,
  formatCardSecondaryText
}: {
  albums: SavedPageCollection[]
  goToTrending: () => void
  onFilterChange: (e: any) => void
  filterText: string
  formatCardSecondaryText: (saves: number, agreements: number) => string
  getFilteredAlbums: (albums: SavedPageCollection[]) => SavedPageCollection[]
  goToRoute: (route: string) => void
}) => {
  const filteredAlbums = getFilteredAlbums(albums || [])
  const albumCards = filteredAlbums.map((album) => {
    return (
      <Card
        key={album.content list_id}
        id={album.content list_id}
        userId={album.content list_owner_id}
        imageSize={album._cover_art_sizes}
        primaryText={album.content list_name}
        secondaryText={formatCardSecondaryText(
          album.save_count,
          album.content list_contents.agreement_ids.length
        )}
        onClick={() =>
          goToRoute(
            albumPage(album.ownerHandle, album.content list_name, album.content list_id)
          )
        }
      />
    )
  })

  const contentRefCallback = useOffsetScroll()

  return (
    <div className={styles.cardLineupContainer}>
      {albums.length === 0 ? (
        <EmptyTab
          message={
            <>
              {messages.emptyAlbums}
              <i className={cn('emoji', 'face-with-monocle', styles.emoji)} />
            </>
          }
          onClick={goToTrending}
        />
      ) : (
        <div ref={contentRefCallback} className={styles.tabContainer}>
          <div className={styles.searchContainer}>
            <div className={styles.searchInnerContainer}>
              <input
                placeholder={messages.filterAlbums}
                onChange={onFilterChange}
                value={filterText}
              />
              <IconFilter className={styles.iconFilter} />
            </div>
          </div>
          {filteredAlbums.length > 0 && (
            <div className={styles.cardsContainer}>
              <CardLineup
                cardsClassName={styles.cardLineup}
                cards={albumCards}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const ContentListCardLineup = ({
  content lists,
  goToTrending,
  onFilterChange,
  filterText,
  goToRoute,
  getFilteredContentLists,
  formatCardSecondaryText,
  content listUpdates,
  updateContentListLastViewedAt
}: {
  content lists: SavedPageCollection[]
  goToTrending: () => void
  onFilterChange: (e: any) => void
  filterText: string
  formatCardSecondaryText: (saves: number, agreements: number) => string
  getFilteredContentLists: (
    content lists: SavedPageCollection[]
  ) => SavedPageCollection[]
  goToRoute: (route: string) => void
  content listUpdates: number[]
  updateContentListLastViewedAt: (content listId: number) => void
}) => {
  const record = useRecord()

  const filteredContentLists = getFilteredContentLists(content lists || [])
  const content listCards = filteredContentLists.map((content list) => {
    const hasUpdate = content listUpdates.includes(content list.content list_id)
    return (
      <Card
        key={content list.content list_id}
        id={content list.content list_id}
        userId={content list.content list_owner_id}
        imageSize={content list._cover_art_sizes}
        primaryText={content list.content list_name}
        secondaryText={formatCardSecondaryText(
          content list.save_count,
          content list.content list_contents.agreement_ids.length
        )}
        onClick={() => {
          goToRoute(
            content listPage(
              content list.ownerHandle,
              content list.content list_name,
              content list.content list_id
            )
          )
          updateContentListLastViewedAt(content list.content list_id)
          record(
            make(Name.CONTENT_LIST_LIBRARY_CLICKED, {
              content listId: content list.content list_id,
              hasUpdate
            })
          )
        }}
        updateDot={hasUpdate}
      />
    )
  })

  const contentRefCallback = useOffsetScroll()

  return (
    <div className={styles.cardLineupContainer}>
      {content lists.length === 0 ? (
        <>
          <EmptyTab
            message={
              <>
                {messages.emptyContentLists}
                <i className={cn('emoji', 'face-with-monocle', styles.emoji)} />
              </>
            }
            onClick={goToTrending}
          />
          <NewContentListButton />
        </>
      ) : (
        <div ref={contentRefCallback} className={styles.tabContainer}>
          <div className={styles.searchContainer}>
            <div className={styles.searchInnerContainer}>
              <input
                placeholder={messages.filterContentLists}
                onChange={onFilterChange}
                value={filterText}
              />
              <IconFilter className={styles.iconFilter} />
            </div>
          </div>
          <NewContentListButton />
          {filteredContentLists.length > 0 && (
            <div className={styles.cardsContainer}>
              <CardLineup
                cardsClassName={styles.cardLineup}
                cards={content listCards}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const messages = {
  emptyAgreements: "You haven't favorited any agreements yet.",
  emptyAlbums: "You haven't favorited any albums yet.",
  emptyContentLists: "You haven't favorited any content lists yet.",
  filterAgreements: 'Filter Agreements',
  filterAlbums: 'Filter Albums',
  filterContentLists: 'Filter ContentLists',
  agreements: 'Agreements',
  albums: 'Albums',
  content lists: 'ContentLists'
}

const tabHeaders = [
  { icon: <IconNote />, text: messages.agreements, label: Tabs.AGREEMENTS },
  { icon: <IconAlbum />, text: messages.albums, label: Tabs.ALBUMS },
  { icon: <IconContentLists />, text: messages.content lists, label: Tabs.CONTENT_LISTS }
]

export type SavedPageProps = {
  title: string
  description: string
  onFilterChange: (e: any) => void
  isQueued: boolean
  playingUid: UID | null
  getFilteredData: (agreementMetadatas: any) => [SavedPageAgreement[], number]
  onTogglePlay: (uid: UID, agreementId: ID) => void

  onSave: (isSaved: boolean, agreementId: ID) => void
  onPlay: () => void
  onSortAgreements: (sorters: any) => void
  formatCardSecondaryText: (saves: number, agreements: number) => string
  filterText: string
  initialOrder: UID[] | null
  account:
    | (User & {
        albums: SavedPageCollection[]
        content lists: SavedPageCollection[]
      })
    | undefined
  agreements: Lineup<SavedPageAgreement>
  currentQueueItem: QueueItem
  playing: boolean
  buffering: boolean
  fetchSavedAgreements: () => void
  resetSavedAgreements: () => void
  updateLineupOrder: (updatedOrderIndices: UID[]) => void
  getFilteredAlbums: (albums: SavedPageCollection[]) => SavedPageCollection[]
  getFilteredContentLists: (
    content lists: SavedPageCollection[]
  ) => SavedPageCollection[]

  fetchSavedAlbums: () => void
  goToRoute: (route: string) => void
  repostAgreement: (agreementId: ID) => void
  undoRepostAgreement: (agreementId: ID) => void
  saveAgreement: (agreementId: ID) => void
  unsaveAgreement: (agreementId: ID) => void
  onClickRemove: any
  onReorderAgreements: any
  content listUpdates: number[]
  updateContentListLastViewedAt: (content listId: number) => void
}

const SavedPage = ({
  title,
  description,
  account,
  playingUid,
  agreements,
  goToRoute,
  playing,
  isQueued,
  onTogglePlay,
  getFilteredData,
  getFilteredAlbums,
  getFilteredContentLists,
  onFilterChange,
  filterText,
  formatCardSecondaryText,
  onSave,
  content listUpdates,
  updateContentListLastViewedAt
}: SavedPageProps) => {
  useMainPageHeader()

  const queuedAndPlaying = playing && isQueued

  const goToTrending = () => goToRoute(TRENDING_PAGE)
  const elements = [
    <AgreementsLineup
      key='agreementsLineup'
      agreements={agreements}
      goToTrending={goToTrending}
      onFilterChange={onFilterChange}
      filterText={filterText}
      getFilteredData={getFilteredData}
      playingUid={playingUid}
      queuedAndPlaying={queuedAndPlaying}
      onSave={onSave}
      onTogglePlay={onTogglePlay}
    />,
    <AlbumCardLineup
      key='albumLineup'
      getFilteredAlbums={getFilteredAlbums}
      albums={account ? account.albums : []}
      goToTrending={goToTrending}
      onFilterChange={onFilterChange}
      filterText={filterText}
      goToRoute={goToRoute}
      formatCardSecondaryText={formatCardSecondaryText}
    />,
    <ContentListCardLineup
      key='content listLineup'
      getFilteredContentLists={getFilteredContentLists}
      content lists={account ? account.content lists : []}
      goToTrending={goToTrending}
      onFilterChange={onFilterChange}
      filterText={filterText}
      goToRoute={goToRoute}
      formatCardSecondaryText={formatCardSecondaryText}
      content listUpdates={content listUpdates}
      updateContentListLastViewedAt={updateContentListLastViewedAt}
    />
  ]
  const { tabs, body } = useTabs({
    tabs: tabHeaders,
    elements,
    initialScrollOffset: SCROLL_HEIGHT
  })

  const { setHeader } = useContext(HeaderContext)
  useEffect(() => {
    setHeader(
      <>
        <Header className={styles.header} title={title} />
        <div className={styles.tabBar}>{tabs}</div>
      </>
    )
  }, [title, setHeader, tabs])

  return (
    <MobilePageContainer
      title={title}
      description={description}
      containerClassName={styles.mobilePageContainer}
    >
      {agreements.status === Status.LOADING ? (
        <LoadingSpinner className={styles.spinner} />
      ) : (
        <div className={styles.tabContainer}>
          <div className={styles.pageContainer}>{body}</div>
        </div>
      )}
    </MobilePageContainer>
  )
}

export default SavedPage
