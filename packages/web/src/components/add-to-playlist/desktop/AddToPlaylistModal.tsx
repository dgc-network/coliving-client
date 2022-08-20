import { useContext, useMemo, useState } from 'react'

import { CreateContentListSource, Collection, SquareSizes } from '@coliving/common'
import { Modal, Scrollbar } from '@coliving/stems'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconMultiselectAdd } from 'assets/img/iconMultiselectAdd.svg'
import { useModalState } from 'common/hooks/useModalState'
import { getAccountWithOwnContentLists } from 'common/store/account/selectors'
import {
  addAgreementToContentList,
  createContentList
} from 'common/store/cache/collections/actions'
import { getCollectionId } from 'common/store/pages/collection/selectors'
import {
  getAgreementId,
  getAgreementTitle
} from 'common/store/ui/add-to-content list/selectors'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import SearchBar from 'components/search-bar/SearchBar'
import { ToastContext } from 'components/toast/ToastContext'
import ToastLinkContent from 'components/toast/mobile/ToastLinkContent'
import { useCollectionCoverArt } from 'hooks/useCollectionCoverArt'
import { newCollectionMetadata } from 'schemas'
import { AppState } from 'store/types'
import { content listPage } from 'utils/route'

import styles from './AddToContentListModal.module.css'

const messages = {
  title: 'Add to ContentList',
  newContentList: 'New ContentList',
  searchPlaceholder: 'Find one of your content lists',
  addedToast: 'Added To ContentList!',
  createdToast: 'ContentList Created!',
  view: 'View'
}

const AddToContentListModal = () => {
  const dispatch = useDispatch()
  const { toast } = useContext(ToastContext)

  const [isOpen, setIsOpen] = useModalState('AddToContentList')
  const agreementId = useSelector(getAgreementId)
  const agreementTitle = useSelector(getAgreementTitle)
  const currentCollectionId = useSelector(getCollectionId)
  const account = useSelector((state: AppState) =>
    getAccountWithOwnContentLists(state)
  )

  const [searchValue, setSearchValue] = useState('')

  const filteredContentLists = useMemo(() => {
    return (account?.content lists ?? []).filter(
      (content list: Collection) =>
        // Don't allow adding to this content list if already on this content list's page.
        content list.content list_id !== currentCollectionId &&
        (searchValue
          ? content list.content list_name
              .toLowerCase()
              .includes(searchValue.toLowerCase())
          : true)
    )
  }, [searchValue, account, currentCollectionId])

  const handleContentListClick = (content list: Collection) => {
    dispatch(addAgreementToContentList(agreementId, content list.content list_id))
    if (account && agreementTitle) {
      toast(
        <ToastLinkContent
          text={messages.addedToast}
          linkText={messages.view}
          link={content listPage(account.handle, agreementTitle, content list.content list_id)}
        />
      )
    }
    setIsOpen(false)
  }

  const handleCreateContentList = () => {
    const metadata = newCollectionMetadata({
      content list_name: agreementTitle,
      is_private: false
    })
    const tempId = `${Date.now()}`
    dispatch(
      createContentList(tempId, metadata, CreateContentListSource.FROM_AGREEMENT, agreementId)
    )
    dispatch(addAgreementToContentList(agreementId, tempId))
    if (account && agreementTitle) {
      toast(
        <ToastLinkContent
          text={messages.createdToast}
          linkText={messages.view}
          link={content listPage(account.handle, agreementTitle, tempId)}
        />
      )
    }
    setIsOpen(false)
  }

  return (
    <Modal
      isOpen={isOpen === true}
      showTitleHeader
      showDismissButton
      title={messages.title}
      onClose={() => setIsOpen(false)}
      allowScroll={false}
      bodyClassName={styles.modalBody}
      headerContainerClassName={styles.modalHeader}
    >
      <SearchBar
        className={styles.searchBar}
        iconClassname={styles.searchIcon}
        open
        value={searchValue}
        onSearch={setSearchValue}
        onOpen={() => {}}
        onClose={() => {}}
        placeholder={messages.searchPlaceholder}
        shouldAutoFocus={false}
      />
      <Scrollbar>
        <div className={styles.listContent}>
          <div className={cn(styles.listItem)} onClick={handleCreateContentList}>
            <IconMultiselectAdd className={styles.add} />
            <span>{messages.newContentList}</span>
          </div>
          <div className={styles.list}>
            {filteredContentLists.map((content list) => (
              <div key={`${content list.content list_id}`}>
                <ContentListItem
                  content list={content list}
                  handleClick={handleContentListClick}
                />
              </div>
            ))}
          </div>
        </div>
      </Scrollbar>
    </Modal>
  )
}

type ContentListItemProps = {
  handleClick: (content list: Collection) => void
  content list: Collection
}

const ContentListItem = ({ handleClick, content list }: ContentListItemProps) => {
  const image = useCollectionCoverArt(
    content list.content list_id,
    content list._cover_art_sizes,
    SquareSizes.SIZE_150_BY_150
  )

  return (
    <div className={cn(styles.listItem)} onClick={() => handleClick(content list)}>
      <DynamicImage
        className={styles.image}
        wrapperClassName={styles.imageWrapper}
        image={image}
      />
      <span className={styles.content listName}>{content list.content list_name}</span>
    </div>
  )
}

export default AddToContentListModal
