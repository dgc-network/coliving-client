import { Scrollbar } from '@coliving/stems'
import cn from 'classnames'
import PropTypes from 'prop-types'

import TabSlider from 'components/dataEntry/tabSlider'
import AgreementPreview from 'components/upload/agreementPreview'

import styles from './agreementsPreview.module.css'
import UploadType from './uploadType'

const uploadDescriptions = {
  [UploadType.CONTENT_LIST]:
    'A contentList is a living thing that can change and grow over time. ContentLists can contain your own agreements, as well as agreements uploaded by others.',
  [UploadType.ALBUM]:
    'An album is a curated listening experience that is frozen in time and does not change. Albums can only contain agreements that you upload.',
  [UploadType.INDIVIDUAL_AGREEMENTS]:
    'Every digital_content you upload will be a separate post.',
  [UploadType.INDIVIDUAL_AGREEMENT]:
    'Every digital_content you upload will be a separate post.'
}

const AgreementsPreview = (props) => {
  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.header}>Release Type</div>
        <TabSlider
          className={styles.tabSlider}
          onSelectOption={props.setUploadType}
          selected={props.uploadType}
          options={[
            { key: UploadType.INDIVIDUAL_AGREEMENTS, text: 'Agreements' },
            { key: UploadType.ALBUM, text: 'Album' },
            { key: UploadType.CONTENT_LIST, text: 'ContentList' }
          ]}
        />
        <div className={styles.typeDescription}>
          {uploadDescriptions[props.uploadType]}
        </div>
      </div>
      <Scrollbar
        className={cn(styles.agreements, {
          [styles.shortScroll]:
            props.uploadType !== UploadType.INDIVIDUAL_AGREEMENTS
        })}
      >
        {props.agreements.map((digital_content, i) => (
          <AgreementPreview
            key={digital_content.metadata.title + i}
            agreementTitle={digital_content.metadata.title}
            fileType={digital_content.file.type}
            fileSize={digital_content.file.size}
            playing={props.previewIndex === i}
            onRemove={() => props.onRemove(i)}
            onPlayPreview={() => props.playPreview(i)}
            onStopPreview={() => props.stopPreview()}
          />
        ))}
      </Scrollbar>
    </div>
  )
}

AgreementsPreview.propTypes = {
  uploadType: PropTypes.oneOf([
    UploadType.INDIVIDUAL_AGREEMENT,
    UploadType.INDIVIDUAL_AGREEMENTS,
    UploadType.CONTENT_LIST,
    UploadType.ALBUM
  ]),
  agreements: PropTypes.array,
  setUploadType: PropTypes.func,
  playPreview: PropTypes.func,
  stopPreview: PropTypes.func,
  onRemove: PropTypes.func,
  previewIndex: PropTypes.number
}

export default AgreementsPreview
