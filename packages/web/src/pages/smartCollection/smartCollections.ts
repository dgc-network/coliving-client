import {
  SmartCollection,
  Variant,
  SmartCollectionVariant
} from '@coliving/common'

import { ReactComponent as IconExploreFeelingLucky } from 'assets/img/iconExploreFeelingLucky.svg'
import { ReactComponent as IconExploreMostLoved } from 'assets/img/iconExploreMostLoved.svg'
import { ReactComponent as IconExploreNewReleases } from 'assets/img/iconExploreNewReleases.svg'
import { ReactComponent as IconExploreRemixables } from 'assets/img/iconExploreRemixables.svg'
import { ReactComponent as IconExploreRotation } from 'assets/img/iconExploreRotation.svg'
import { ReactComponent as IconExploreUnderRadar } from 'assets/img/iconExploreUnderRadar.svg'
import {
  EXPLORE_HEAVY_ROTATION_PAGE,
  EXPLORE_BEST_NEW_RELEASES_PAGE,
  EXPLORE_UNDER_THE_RADAR_PAGE,
  EXPLORE_MOST_LOVED_PAGE,
  EXPLORE_FEELING_LUCKY_PAGE,
  EXPLORE_REMIXABLES_PAGE,
  LIVE_NFT_CONTENT_LIST_PAGE
} from 'utils/route'

export const HEAVY_ROTATION: SmartCollection = {
  variant: Variant.SMART,
  content_list_name: SmartCollectionVariant.HEAVY_ROTATION,
  description: 'Your top agreements, in one place',
  gradient: 'linear-gradient(316deg, #C751C0 0%, #4158D0 100%)',
  shadow: 'rgba(196,81,193,0.35)',
  icon: IconExploreRotation,
  link: EXPLORE_HEAVY_ROTATION_PAGE
}

export const BEST_NEW_RELEASES: SmartCollection = {
  variant: Variant.SMART,
  content_list_name: SmartCollectionVariant.BEST_NEW_RELEASES,
  description: 'From the landlords you follow',
  gradient: 'linear-gradient(135deg, #FF3C6C 0%, #A04B8E 100%)',
  shadow: 'rgba(160,74,141,0.35)',
  icon: IconExploreNewReleases,
  link: EXPLORE_BEST_NEW_RELEASES_PAGE
}

export const UNDER_THE_RADAR: SmartCollection = {
  variant: Variant.SMART,
  content_list_name: SmartCollectionVariant.UNDER_THE_RADAR,
  description: 'Agreements you might have missed from the landlords you follow',
  gradient: 'linear-gradient(135deg, #FFA63B 0%, #FF2525 100%)',
  shadow: 'rgba(255,47,39,0.35)',
  icon: IconExploreUnderRadar,
  link: EXPLORE_UNDER_THE_RADAR_PAGE
}

export const MOST_LOVED: SmartCollection = {
  variant: Variant.SMART,
  content_list_name: SmartCollectionVariant.MOST_LOVED,
  description: 'Agreements favorited by the people you follow',
  gradient: 'linear-gradient(135deg, #896BFF 0%, #0060FF 100%)',
  shadow: 'rgba(3,96,255,0.35)',
  icon: IconExploreMostLoved,
  link: EXPLORE_MOST_LOVED_PAGE
}

export const REMIXABLES: SmartCollection = {
  variant: Variant.SMART,
  content_list_name: SmartCollectionVariant.REMIXABLES,
  description:
    'Popular agreements with remixes & stems you can use in your own agreements.',
  gradient: 'linear-gradient(137.65deg, #FF00F5 -5.01%, #00D1FF 110.47%)',
  shadow: 'rgba(87,170,255,0.35)',
  icon: IconExploreRemixables,
  link: EXPLORE_REMIXABLES_PAGE
}

export const FEELING_LUCKY: SmartCollection = {
  variant: Variant.SMART,
  content_list_name: SmartCollectionVariant.FEELING_LUCKY,
  description: 'A purely random collection of agreements from Coliving',
  gradient: 'linear-gradient(135deg, #19CCA2 0%, #61FA66 100%)',
  shadow: 'rgba(95,249,103,0.35)',
  icon: IconExploreFeelingLucky,
  link: EXPLORE_FEELING_LUCKY_PAGE
}

export const LIVE_NFT_CONTENT_LIST: SmartCollection = {
  variant: Variant.SMART,
  content_list_name: SmartCollectionVariant.LIVE_NFT_CONTENT_LIST,
  makeDescription: (name: string) =>
    `A collection of Audio NFTs owned and created by ${name}`,
  link: LIVE_NFT_CONTENT_LIST_PAGE
}

export const SMART_COLLECTION_MAP = {
  [SmartCollectionVariant.HEAVY_ROTATION]: HEAVY_ROTATION,
  [SmartCollectionVariant.BEST_NEW_RELEASES]: BEST_NEW_RELEASES,
  [SmartCollectionVariant.UNDER_THE_RADAR]: UNDER_THE_RADAR,
  [SmartCollectionVariant.MOST_LOVED]: MOST_LOVED,
  [SmartCollectionVariant.FEELING_LUCKY]: FEELING_LUCKY,
  [SmartCollectionVariant.REMIXABLES]: REMIXABLES,
  [SmartCollectionVariant.LIVE_NFT_CONTENT_LIST]: LIVE_NFT_CONTENT_LIST
}