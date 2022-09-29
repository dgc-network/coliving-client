import { useCallback, useEffect } from 'react'

import cn from 'classnames'

import {
  EmailFrequency,
  PushNotificationSetting
} from 'common/store/pages/settings/types'
import TabSlider from 'components/dataEntry/tabSlider'
import GroupableList from 'components/groupableList/groupableList'
import Grouping from 'components/groupableList/grouping'
import Row from 'components/groupableList/row'
import Page from 'components/page/page'
import Switch from 'components/switch/switch'
import { HapticFeedbackMessage } from 'services/nativeMobileInterface/haptics'
import { PromptPushNotificationPermissions } from 'services/nativeMobileInterface/notifications'

import styles from './NotificationsSettingsPage.module.css'
import { SettingsPageProps } from './settingsPage'
import settingsPageStyles from './SettingsPage.module.css'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const ToggleNotification = ({
  text,
  isOn,
  type,
  onToggle,
  isDisabled
}: {
  text: string
  isOn: boolean
  type: PushNotificationSetting
  onToggle: (type: PushNotificationSetting, toggle: boolean) => void
  isDisabled: boolean
}) => {
  const handleToggle = useCallback(() => {
    onToggle(type, !isOn)
    new HapticFeedbackMessage().send()
  }, [isOn, onToggle, type])

  return (
    <div className={styles.toggleContainer}>
      <div
        className={cn(styles.bodyText, {
          [styles.isOn]: isOn && !isDisabled
        })}
      >
        {text}
      </div>
      <div>
        <Switch
          isOn={isOn}
          handleToggle={handleToggle}
          isDisabled={isDisabled}
        />
      </div>
    </div>
  )
}

const messages = {
  title: 'Notifications',
  enablePn: 'Enable Push Notifications',
  milestones: 'Milestones and Achievements',
  followers: 'New Followers',
  reposts: 'Reposts',
  favorites: 'Favorites',
  remixes: 'Remixes of My Agreements',
  emailFrequency: '‘What You Missed’ Email Frequency'
}

const emailOptions = [
  { key: EmailFrequency.Live, text: 'Live' },
  { key: EmailFrequency.Daily, text: 'Daily' },
  { key: EmailFrequency.Weekly, text: 'Weekly' },
  { key: EmailFrequency.Off, text: 'Off' }
]

// Prompts the native layer to check if push notifications are
// enabled, presenting a push notifications reminder if not
const usePromptForPushNotifications = () => {
  useEffect(() => {
    const msg = new PromptPushNotificationPermissions()
    msg.send()
  }, [])
}

const NotificationsSettingsPage = ({
  notificationSettings,
  emailFrequency,
  pushNotificationSettings,
  togglePushNotificationSetting,
  updateEmailFrequency
}: SettingsPageProps) => {
  usePromptForPushNotifications()

  const notificationToggles = [
    {
      text: messages.enablePn,
      isOn: pushNotificationSettings[PushNotificationSetting.MobilePush],
      type: PushNotificationSetting.MobilePush
    },
    {
      text: messages.milestones,
      isOn: pushNotificationSettings[
        PushNotificationSetting.MilestonesAndAchievements
      ],
      type: PushNotificationSetting.MilestonesAndAchievements
    },
    {
      text: messages.followers,
      isOn: pushNotificationSettings[PushNotificationSetting.Followers],
      type: PushNotificationSetting.Followers
    },
    {
      text: messages.reposts,
      isOn: pushNotificationSettings[PushNotificationSetting.Reposts],
      type: PushNotificationSetting.Reposts
    },
    {
      text: messages.favorites,
      isOn: pushNotificationSettings[PushNotificationSetting.Favorites],
      type: PushNotificationSetting.Favorites
    },
    {
      text: messages.remixes,
      isOn: pushNotificationSettings[PushNotificationSetting.Remixes],
      type: PushNotificationSetting.Remixes
    }
  ]

  return (
    <Page
      title={messages.title}
      contentClassName={settingsPageStyles.pageContent}
      containerClassName={settingsPageStyles.page}
    >
      <div className={settingsPageStyles.bodyContainer}>
        <div className={styles.notificationsSettings}>
          <GroupableList>
            {NATIVE_MOBILE && (
              // The user should be able to configure push notifications only w/in
              // an app-context, not the mobile website.
              <Grouping>
                {notificationToggles.map((notification) => (
                  <Row key={notification.text} includeSpacing={false}>
                    <ToggleNotification
                      isDisabled={
                        // Everything is disabled if MobilePush is "off" (except for MobilePush itself)
                        !pushNotificationSettings[
                          PushNotificationSetting.MobilePush
                        ] &&
                        notification.type !== PushNotificationSetting.MobilePush
                      }
                      key={notification.type}
                      onToggle={togglePushNotificationSetting}
                      {...notification}
                    />
                  </Row>
                ))}
              </Grouping>
            )}
            <Grouping>
              <Row title={messages.emailFrequency}>
                <TabSlider
                  isMobile
                  fullWidth
                  options={emailOptions}
                  selected={emailFrequency}
                  onSelectOption={updateEmailFrequency}
                />
              </Row>
            </Grouping>
          </GroupableList>
        </div>
      </div>
    </Page>
  )
}

export default NotificationsSettingsPage
