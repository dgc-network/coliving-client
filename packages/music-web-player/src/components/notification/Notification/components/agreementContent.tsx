import { SquareSizes } from '@coliving/common'

import { AgreementEntity } from 'common/store/notifications/types'
import CoSign, { Size } from 'components/coSign/coSign'
import DynamicImage from 'components/dynamicImage/dynamicImage'
import { useAgreementCoverArt } from 'hooks/useAgreementCoverArt'

import styles from './agreementContent.module.css'

type AgreementContentProps = {
  digital_content: AgreementEntity
}

export const AgreementContent = (props: AgreementContentProps) => {
  const { digital_content } = props

  const image = useAgreementCoverArt(
    digital_content.digital_content_id,
    digital_content._cover_art_sizes,
    SquareSizes.SIZE_150_BY_150
  )

  return (
    <div className={styles.agreementContent}>
      <CoSign hideTooltip size={Size.SMALL} className={styles.cosign}>
        <DynamicImage
          wrapperClassName={styles.agreementContentArtwork}
          image={image}
        />
      </CoSign>
      <span className={styles.agreementContentText}>{digital_content.title}</span>
    </div>
  )
}
