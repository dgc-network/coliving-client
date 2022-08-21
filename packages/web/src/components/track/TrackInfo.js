import { PureComponent } from 'react'

import cn from 'classnames'
import PropTypes from 'prop-types'

import { ReactComponent as IconVolume } from 'assets/img/iconVolume.svg'
import { LandlordPopover } from 'components/landlord/LandlordPopover'
import Skeleton from 'components/skeleton/Skeleton'
import UserBadges from 'components/user-badges/UserBadges'

import styles from './AgreementInfo.module.css'

class AgreementInfo extends PureComponent {
  onClickAgreementName = (e) => {
    e.stopPropagation()
    if (!this.props.disabled && this.props.onClickAgreementName)
      this.props.onClickAgreementName()
  }

  onClickLandlordName = (e) => {
    e.stopPropagation()
    if (!this.props.disabled && this.props.onClickLandlordName)
      this.props.onClickLandlordName()
  }

  render() {
    const {
      contentTitle,
      isLoading,
      agreementTitle,
      active,
      landlordName,
      disabled,
      landlordHandle,
      size,
      onClickAgreementName,
      onClickLandlordName,
      popover,
      condense,
      userId
    } = this.props

    const style = {
      [styles.extraLarge]: size === 'extraLarge',
      [styles.large]: size === 'large',
      [styles.medium]: size === 'medium',
      [styles.small]: size === 'small',
      [styles.tiny]: size === 'tiny',
      [styles.miniscule]: size === 'miniscule'
    }

    const agreementTitleStyle = cn(styles.agreementTitle, style, {
      [styles.active]: active,
      [styles.condense]: condense
    })
    const landlordNameStyle = cn(styles.landlordName, style, {
      [styles.active]: active,
      [styles.contentListCreator]: contentTitle === 'contentList'
    })

    const hideShow = cn({
      [styles.hide]: isLoading,
      [styles.show]: !isLoading
    })

    return (
      <div
        className={cn(styles.agreementInfoWrapper, {
          [styles.disabled]: disabled
        })}
      >
        <div className={agreementTitleStyle}>
          <div className={hideShow}>
            <div
              className={cn(styles.agreementName, {
                [styles.agreementNameLink]: onClickAgreementName
              })}
              onClick={this.onClickAgreementName}
            >
              {agreementTitle}
            </div>
            {active ? (
              <span className={styles.volumeIcon}>
                <IconVolume />
              </span>
            ) : null}
          </div>
          {isLoading && <Skeleton width='80%' className={styles.skeleton} />}
        </div>
        <div className={landlordNameStyle}>
          <div className={hideShow}>
            {contentTitle === 'contentList' ? (
              <span className={styles.createdBy}>{'Created by'}</span>
            ) : null}
            {popover ? (
              <LandlordPopover handle={landlordHandle}>
                <span
                  className={cn({ [styles.landlordNameLink]: onClickLandlordName })}
                  onClick={this.onClickLandlordName}
                >
                  {landlordName}
                </span>
              </LandlordPopover>
            ) : (
              <span
                className={cn(styles.landlordName, {
                  [styles.landlordNameLink]: onClickLandlordName
                })}
                onClick={this.onClickLandlordName}
              >
                {landlordName}
              </span>
            )}
            {
              <UserBadges
                userId={userId}
                className={styles.iconVerified}
                badgeSize={10}
              />
            }
          </div>
          {isLoading && <Skeleton width='60%' className={styles.skeleton} />}
        </div>
      </div>
    )
  }
}

AgreementInfo.propTypes = {
  agreementTitle: PropTypes.string,
  landlordName: PropTypes.string,
  landlordHandle: PropTypes.string,
  isLoading: PropTypes.bool,
  condense: PropTypes.bool,
  size: PropTypes.oneOf([
    'extraLarge',
    'large',
    'medium',
    'small',
    'tiny',
    'miniscule'
  ]),
  popover: PropTypes.bool,
  disabled: PropTypes.bool,
  onClickAgreementName: PropTypes.func,
  onClickLandlordName: PropTypes.func,
  userId: PropTypes.number
}

AgreementInfo.defaultProps = {
  agreementTitle: '\u200B',
  landlordName: '\u200B',
  landlordHandle: '',
  size: 'medium',
  active: false,
  disabled: false,
  condense: false,
  isLoading: false,
  routeLandlordPage: false,
  routeAgreementPage: false,
  popover: true
}

export default AgreementInfo
