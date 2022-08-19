import { LineupActions } from 'common/store/lineup/actions'

export const PREFIX = 'AGREEMENT_AGREEMENTS'

class AgreementsActions extends LineupActions {
  constructor() {
    super(PREFIX)
  }
}

export const agreementsActions = new AgreementsActions()
