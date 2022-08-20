import IconAlbum from 'app/assets/images/iconAlbum.svg'
import IconNote from 'app/assets/images/iconNote.svg'
import IconPlaylists from 'app/assets/images/iconPlaylists.svg'
import { Screen } from 'app/components/core'
import { Header } from 'app/components/header'
import { TopTabNavigator } from 'app/components/top-tab-bar'
import { usePopToTopOnDrawerOpen } from 'app/hooks/usePopToTopOnDrawerOpen'

import { AlbumsTab } from './AlbumsTab'
import { PlaylistsTab } from './PlaylistsTab'
import { AgreementsTab } from './AgreementsTab'

const favoritesScreens = [
  {
    name: 'agreements',
    Icon: IconNote,
    component: AgreementsTab
  },
  {
    name: 'albums',
    Icon: IconAlbum,
    component: AlbumsTab
  },
  {
    name: 'content lists',
    Icon: IconPlaylists,
    component: PlaylistsTab
  }
]

const FavoritesScreen = () => {
  usePopToTopOnDrawerOpen()

  return (
    <Screen>
      <Header text='Favorites' />
      <TopTabNavigator screens={favoritesScreens} />
    </Screen>
  )
}

export default FavoritesScreen
