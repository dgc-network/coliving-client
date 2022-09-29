import { Component } from 'react'

import cn from 'classnames'
import PropTypes from 'prop-types'

import { ReactComponent as IconOptions } from 'assets/img/iconKebabHorizontal.svg'
import stylesTab from 'components/actions-tab/ActionsTab.module.css'
import Menu from 'components/menu/menu'

import styles from './TableOptionsButton.module.css'

class TableOptionsButton extends Component {
  render() {
    const {
      onClick,
      className,
      agreementId,
      index,
      uid,
      date,
      isFavorited,
      isOwner,
      isOwnerDeactivated,
      isLandlordPick,
      onRemove,
      removeText,
      hiddenUntilHover
    } = this.props

    const removeMenuItem = {
      text: removeText,
      onClick: () => onRemove(agreementId, index, uid, date.unix())
    }

    const overflowMenu = {
      menu: {
        type: 'agreement',
        mount: 'page',
        includeShare: true,
        isOwner,
        isOwnerDeactivated,
        isLandlordPick,
        ...this.props,
        extraMenuItems: onRemove ? [removeMenuItem] : []
      }
    }
    if (isOwnerDeactivated && !onRemove && !isFavorited) {
      return null
    }

    return (
      <div
        onClick={onClick}
        className={cn(
          styles.tableOptionsButton,
          className,
          'tableOptionsButton'
        )}
      >
        <div>
          <Menu {...overflowMenu}>
            {(ref, triggerPopup) => (
              <div
                className={stylesTab.iconKebabHorizontalWrapper}
                onClick={triggerPopup}
              >
                <IconOptions
                  className={cn(stylesTab.iconKebabHorizontal, styles.icon, {
                    [styles.iconHidden]: hiddenUntilHover
                  })}
                  ref={ref}
                />
              </div>
            )}
          </Menu>
        </div>
      </div>
    )
  }
}

TableOptionsButton.propTypes = {
  className: PropTypes.string,
  handle: PropTypes.string,
  agreementId: PropTypes.number,
  index: PropTypes.number,
  isFavorited: PropTypes.bool,
  isReposted: PropTypes.bool,
  isDeleted: PropTypes.bool,
  agreementTitle: PropTypes.string,
  albumId: PropTypes.number,
  albumName: PropTypes.string,
  date: PropTypes.object,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
  removeText: PropTypes.string,
  isLandlordPick: PropTypes.bool,
  isOwner: PropTypes.bool,
  isOwnerDeactivated: PropTypes.bool,
  hiddenUntilHover: PropTypes.bool,
  agreementPermalink: PropTypes.string
}

TableOptionsButton.defaultProps = {
  onRemove: null,
  remoteText: '',
  hiddenUntilHover: true
}

export default TableOptionsButton
