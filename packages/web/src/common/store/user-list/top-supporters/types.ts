import { ID } from '@coliving/common'

import { UserListStoreState } from 'common/store/user-list/types'

export type TopSupportersOwnState = {
  id: ID | null
}

export type TopSupportersPageState = {
  topSupportersPage: TopSupportersOwnState
  userList: UserListStoreState
}
