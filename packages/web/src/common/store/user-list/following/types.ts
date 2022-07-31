import { ID } from '@coliving/common'

import { UserListStoreState } from 'common/store/user-list/types'

export type FollowingOwnState = {
  id: ID | null
}

export type FollowingPageState = {
  followingPage: FollowingOwnState
  userList: UserListStoreState
}
