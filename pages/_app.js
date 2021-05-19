import '../styles/globals.css'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
