import IconForYou from 'app/assets/images/iconExploreForYou.svg'
import IconMoods from 'app/assets/images/iconExploreMoods.svg'
import IconContentLists from 'app/assets/images/iconContentLists.svg'
import IconUser from 'app/assets/images/iconUser.svg'
import { Screen } from 'app/components/core'
import { Header } from 'app/components/header'
import { TopTabNavigator } from 'app/components/top-tab-bar'
import { usePopToTopOnDrawerOpen } from 'app/hooks/usePopToTopOnDrawerOpen'

import { LandlordsTab } from './tabs/LandlordsTab'
import { ForYouTab } from './tabs/ForYouTab'
import { MoodsTab } from './tabs/MoodsTab'
import { ContentListsTab } from './tabs/ContentListsTab'

const exploreScreens = [
  {
    name: 'forYou',
    label: 'For You',
    Icon: IconForYou,
    component: ForYouTab
  },
  {
    name: 'moods',
    Icon: IconMoods,
    component: MoodsTab
  },
  {
    name: 'contentLists',
    Icon: IconContentLists,
    component: ContentListsTab
  },
  {
    name: 'landlords',
    Icon: IconUser,
    component: LandlordsTab
  }
]

const ExploreScreen = () => {
  usePopToTopOnDrawerOpen()

  return (
    <Screen>
      <Header text='Explore' />
      <TopTabNavigator screens={exploreScreens} />
    </Screen>
  )
}

export default ExploreScreen
