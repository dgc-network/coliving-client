export const UPLOAD_AGREEMENTS = 'UPLOAD/UPLOAD_AGREEMENTS'
export const UPLOAD_AGREEMENTS_REQUESTED = 'UPLOAD/UPLOAD_AGREEMENTS_REQUESTED'
export const UPLOAD_AGREEMENTS_SUCCEEDED = 'UPLOAD/UPLOAD_AGREEMENTS_SUCCEEDED'
export const UPLOAD_AGREEMENTS_FAILED = 'UPLOAD/UPLOAD_AGREEMENTS_FAILED'
export const UPLOAD_SINGLE_AGREEMENT_FAILED = 'UPLOAD/UPLOAD_SINGLE_AGREEMENT_FAILED'

export const UPDATE_PERCENT = 'UPLOAD/UPDATE_PERCENT'
export const INCREMENT_PERCENT = 'UPLOAD/INCREMENT_PERCENT'
export const UPDATE_PROGRESS = 'UPLOAD/UPDATE_PROGRESS'
export const RESET = 'UPLOAD/RESET'
export const RESET_STATE = 'UPLOAD/RESET_STATE'
export const UNDO_RESET_STATE = 'UPLOAD/UNDO_RESET_STATE'
export const TOGGLE_MULTI_AGREEMENT_NOTIFICATION =
  'UPLOAD/TOGGLE_MULTI_AGREEMENT_NOTIFICATION'

// Errors
export const UPGRADE_TO_CREATOR_ERROR = 'UPLOAD/ERROR/UPGRADE_TO_CREATOR'
export const SINGLE_AGREEMENT_UPLOAD_ERROR = 'UPLOAD/ERROR/SINGLE_AGREEMENT_UPLOAD'
export const SINGLE_AGREEMENT_UPLOAD_TIMEOUT_ERROR =
  'UPLOAD/ERROR/SINGLE_AGREEMENT_UPLOAD_TIMEOUT'
export const MULTI_AGREEMENT_UPLOAD_ERROR = 'UPLOAD/ERROR/MULTI_AGREEMENT_UPLOAD'
export const MULTI_AGREEMENT_TIMEOUT_ERROR = 'UPLOAD/ERROR/MULTI_AGREEMENT_TIMEOUT'
export const COLLECTION_CONTENT_NODE_UPLOAD_ERROR =
  'UPLOAD/ERROR/COLLECTION_CONTENT_NODE_UPLOAD'
export const COLLECTION_CONTENT_NODE_TIMEOUT_ERROR =
  'UPLOAD/ERROR/COLLECTION_CONTENT_NODE_TIMEOU'
export const COLLECTION_ADD_AGREEMENT_TO_CHAIN_ERROR =
  'UPLOAD/ERROR/COLLECTION_ADD_AGREEMENT_TO_CHAIN'
export const COLLECTION_ASSOCIATE_AGREEMENTS_ERROR =
  'UPLOAD/ERROR/COLLECTION_ASSOCIATE_AGREEMENTS'
export const COLLECTION_CREATE_CONTENT_LIST_NO_ID_ERROR =
  'UPLOAD/ERROR/COLLECTION_CREATE_CONTENT_LIST_NO_ID'
export const COLLECTION_CREATE_CONTENT_LIST_ID_EXISTS_ERROR =
  'UPLOAD/ERROR/COLLECTION_CREATE_CONTENT_LIST_ID_EXISTS'
export const COLLECTION_POLL_CONTENT_LIST_TIMEOUT_ERROR =
  'UPLOAD/ERROR/COLLECTION_POLL_CONTENT_LIST_TIMEOUT'

export const uploadDigitalContents = (digitalContents, metadata, uploadType, stems) => {
  return { type: UPLOAD_AGREEMENTS, digitalContents, metadata, uploadType, stems }
}

export const uploadSingleDigitalContentFailed = (index) => {
  return { type: UPLOAD_SINGLE_AGREEMENT_FAILED, index }
}

export const uploadDigitalContentsRequested = (digitalContents, metadata, uploadType, stems) => {
  return {
    type: UPLOAD_AGREEMENTS_REQUESTED,
    digitalContents,
    metadata,
    uploadType,
    stems
  }
}

export const uploadDigitalContentsSucceeded = (id, digitalContentMetadatas) => {
  return { type: UPLOAD_AGREEMENTS_SUCCEEDED, id, digitalContentMetadatas }
}

export const uploadDigitalContentFailed = () => {
  return { type: UPLOAD_AGREEMENTS_FAILED }
}

export const updateProgress = (index, progress) => {
  return { type: UPDATE_PROGRESS, index, progress }
}

export const reset = () => {
  return { type: RESET }
}

// Actions used to reset the react state and then the store state of upload from external container
export const resetState = () => {
  return { type: RESET_STATE }
}
export const undoResetState = () => {
  return { type: UNDO_RESET_STATE }
}

export const toggleMultiDigitalContentNotification = (open = false) => {
  return { type: TOGGLE_MULTI_AGREEMENT_NOTIFICATION, open }
}

export const upgradeToCreatorError = (error) => ({
  type: UPGRADE_TO_CREATOR_ERROR,
  error
})

export const singleDigitalContentUploadError = (error, phase, digitalContentSizeBytes) => ({
  type: SINGLE_AGREEMENT_UPLOAD_ERROR,
  digitalContentSizeBytes,
  error,
  phase
})

export const singleDigitalContentTimeoutError = () => ({
  type: SINGLE_AGREEMENT_UPLOAD_TIMEOUT_ERROR
})

export const multiDigitalContentUploadError = (error, phase, numDigitalContents, isStem) => ({
  type: MULTI_AGREEMENT_UPLOAD_ERROR,
  error,
  phase,
  numDigitalContents,
  isStem
})

export const multiDigitalContentTimeoutError = () => ({
  type: MULTI_AGREEMENT_TIMEOUT_ERROR
})

export const contentNodeUploadError = (error) => ({
  type: COLLECTION_CONTENT_NODE_UPLOAD_ERROR,
  error
})

export const contentNodeTimeoutError = () => ({
  type: COLLECTION_CONTENT_NODE_TIMEOUT_ERROR
})

export const addDigitalContentToChainError = (error) => ({
  type: COLLECTION_ADD_AGREEMENT_TO_CHAIN_ERROR,
  error
})

export const associateDigitalContentsError = (error) => ({
  type: COLLECTION_ASSOCIATE_AGREEMENTS_ERROR,
  error
})

export const createContentListErrorIDExists = (error) => ({
  type: COLLECTION_CREATE_CONTENT_LIST_ID_EXISTS_ERROR,
  error
})

export const createContentListErrorNoId = (error) => ({
  type: COLLECTION_CREATE_CONTENT_LIST_NO_ID_ERROR,
  error
})

export const createContentListPollingTimeout = () => ({
  type: COLLECTION_POLL_CONTENT_LIST_TIMEOUT_ERROR
})
