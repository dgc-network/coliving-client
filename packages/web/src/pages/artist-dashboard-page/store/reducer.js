import { Status } from '@coliving/common'

import {
  FETCH_DASHBOARD,
  FETCH_DASHBOARD_SUCCEEDED,
  FETCH_DASHBOARD_FAILED,
  FETCH_DASHBOARD_LISTEN_DATA_SUCCEEDED,
  FETCH_DASHBOARD_LISTEN_DATA_FAILED
} from './actions'

const initialState = {
  status: Status.LOADING,
  agreements: [],
  unlistedAgreements: [],
  collections: [],
  listenData: {}
}

const actionsMap = {
  [FETCH_DASHBOARD](state, action) {
    return {
      ...state,
      status: Status.LOADING
    }
  },
  [FETCH_DASHBOARD_SUCCEEDED](state, action) {
    return {
      ...state,
      agreements: action.agreements,
      collections: action.collections,
      unlistedAgreements: action.unlistedAgreements,
      status: Status.SUCCESS
    }
  },
  [FETCH_DASHBOARD_FAILED](state, action) {
    return {
      ...state,
      status: Status.ERROR
    }
  },
  [FETCH_DASHBOARD_LISTEN_DATA_SUCCEEDED](state, action) {
    return {
      ...state,
      listenData: action.listenData
    }
  },
  [FETCH_DASHBOARD_LISTEN_DATA_FAILED](state, action) {
    return {
      ...state,
      listenData: {}
    }
  }
}

export default function dashboard(state = initialState, action) {
  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}
