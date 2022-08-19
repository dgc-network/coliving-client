import { formatSeconds } from '-client/src/common/utils/timeUtil'
import type { ViewStyle } from 'react-native'
import { StyleSheet, View } from 'react-native'
import type { SvgProps } from 'react-native-svg'

import IconHidden from 'app/assets/images/iconHidden.svg'
import IconStar from 'app/assets/images/iconStar.svg'
import Text from 'app/components/text'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { flexRowCentered } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { createStyles as createAgreementTileStyles } from './styles'

const messages = {
  artistPick: "Artist's Pick",
  hiddenAgreement: 'Hidden Agreement'
}

const flexRowEnd = (): ViewStyle => ({
  ...flexRowCentered(),
  justifyContent: 'flex-end'
})

const styles = StyleSheet.create({
  topRight: {
    ...flexRowEnd(),
    position: 'absolute',
    top: 10,
    right: 10,
    left: 0
  },
  item: {
    ...flexRowEnd(),
    marginRight: 8
  },
  icon: {
    marginRight: 4
  }
})

type ItemProps = {
  /**
   * Icon shown on the left hand side of the item
   */
  icon: React.FC<SvgProps>
  /**
   * Label shown on the right hand side of the item
   */
  label: string
}

const LineupTileTopRightItem = ({ icon: Icon, label }: ItemProps) => {
  const { neutralLight4 } = useThemeColors()
  const agreementTileStyles = useThemedStyles(createAgreementTileStyles)
  return (
    <View style={styles.item}>
      <Icon height={16} width={16} fill={neutralLight4} style={styles.icon} />
      <Text style={agreementTileStyles.statText}>{label}</Text>
    </View>
  )
}

type Props = {
  /**
   * The duration of the agreement or agreements
   */
  duration?: number
  /**
   * Whether or not the agreement is the artist pick
   */
  isArtistPick?: boolean
  /**
   * Whether or not the agreement is unlisted (hidden)
   */
  isUnlisted?: boolean
  /**
   * Whether or not to show the artist pick icon
   */
  showArtistPick?: boolean
}

export const LineupTileTopRight = ({
  duration,
  isArtistPick,
  isUnlisted,
  showArtistPick
}: Props) => {
  const agreementTileStyles = useThemedStyles(createAgreementTileStyles)

  return (
    <View style={styles.topRight}>
      {showArtistPick && isArtistPick && (
        <LineupTileTopRightItem icon={IconStar} label={messages.artistPick} />
      )}
      {isUnlisted && (
        <LineupTileTopRightItem
          icon={IconHidden}
          label={messages.hiddenAgreement}
        />
      )}
      <Text style={agreementTileStyles.statText}>
        {duration && formatSeconds(duration)}
      </Text>
    </View>
  )
}
