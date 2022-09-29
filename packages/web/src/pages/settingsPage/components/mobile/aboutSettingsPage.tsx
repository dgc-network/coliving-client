import { useState, useEffect } from 'react'

import appIcon from 'assets/img/appIcon.png'
import { ReactComponent as IconCareers } from 'assets/img/iconCareers.svg'
import { ReactComponent as IconContact } from 'assets/img/iconContact.svg'
import { ReactComponent as IconDiscord } from 'assets/img/iconDiscord.svg'
import { ReactComponent as IconInstagram } from 'assets/img/iconInstagram.svg'
import { ReactComponent as IconTwitter } from 'assets/img/iconTwitterBird.svg'
import GroupableList from 'components/groupableList/groupableList'
import Grouping from 'components/groupableList/grouping'
import Row from 'components/groupableList/row'
import Page from 'components/page/page'
import { GetVersion } from 'services/nativeMobileInterface/version'
import { COPYRIGHT_TEXT } from 'utils/copyright'

import packageInfo from '../../../../../package.json'

import styles from './AboutSettingsPage.module.css'
import { SettingsPageProps } from './settingsPage'
import settingsPageStyles from './SettingsPage.module.css'

const { version } = packageInfo

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const links = {
  discord: 'https://discordapp.com/invite/yNUg2e2',
  instagram: 'https://www.instagram.com/colivingmusic/',
  twitter: 'https://twitter.com/dgc-network',
  contact: 'mailto:contact@coliving.lol',
  careers: 'https://jobs.lever.co/coliving',
  help: 'https://help.coliving.lol/',
  terms: 'https://coliving.lol/legal/terms-of-use'
}

const messages = {
  discord: 'Join our community on Discord',
  twitter: 'Follow us on Twitter',
  instagram: 'Follow us on Instagram',
  contact: 'Contact Us',
  careers: 'Careers at Coliving',
  help: 'Help / FAQ',
  terms: 'Terms & Privacy Policy',

  title: 'Coliving',
  version: 'Coliving Version',
  copyright: COPYRIGHT_TEXT
}

/** Gets the latest app or dapp version */
const useAppVersion = (): string => {
  const [appVersion, setAppVersion] = useState(NATIVE_MOBILE ? '0' : version)

  useEffect(() => {
    if (NATIVE_MOBILE) {
      const getVersionMessage = new GetVersion()
      getVersionMessage.send()
      getVersionMessage.receive().then(({ version }) => {
        setAppVersion(version)
      })
    }
  }, [])

  return appVersion
}

const AboutSettingsPage = (props: SettingsPageProps) => {
  const appVersion = useAppVersion()

  const openLink = (link: string) => {
    window.open(link, '_blank')
  }

  return (
    <Page
      title='About'
      contentClassName={settingsPageStyles.pageContent}
      containerClassName={settingsPageStyles.page}
    >
      <div className={settingsPageStyles.bodyContainer}>
        <div className={styles.header}>
          <img src={appIcon} alt='Coliving' />
          <div className={styles.info}>
            <div className={styles.title}>{messages.title}</div>
            <div className={styles.versionInfo}>
              <div>{`${messages.version} ${appVersion}`}</div>
              <div>{messages.copyright}</div>
            </div>
          </div>
        </div>
        <GroupableList>
          <Grouping>
            <Row
              prefix={<IconDiscord className={styles.icon} />}
              title={messages.discord}
              onClick={() => openLink(links.discord)}
            />
            <Row
              prefix={<IconTwitter className={styles.icon} />}
              title={messages.twitter}
              onClick={() => openLink(links.twitter)}
            />
            <Row
              prefix={<IconInstagram className={styles.icon} />}
              title={messages.instagram}
              onClick={() => openLink(links.instagram)}
            />
            <Row
              prefix={<IconContact className={styles.icon} />}
              title={messages.contact}
              onClick={() => openLink(links.contact)}
            />
            <Row
              prefix={<IconCareers className={styles.icon} />}
              title={messages.careers}
              onClick={() => openLink(links.careers)}
            />
          </Grouping>
          <Grouping>
            <Row title={messages.help} onClick={() => openLink(links.help)} />
            <Row title={messages.terms} onClick={() => openLink(links.terms)} />
          </Grouping>
        </GroupableList>
      </div>
    </Page>
  )
}

export default AboutSettingsPage
