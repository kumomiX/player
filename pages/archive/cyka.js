import { useState } from 'react'
import dayjs from 'dayjs'
import ArchivePlayer from '../../features/archive/Player'
import Head from 'next/head'

export default function ({ ...props }) {
  const [date, setDate] = useState(dayjs().startOf('day'))
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#d2d2d2',
        overflow: 'hidden',
      }}>
      <Head>
        <title>Player</title>
      </Head>
      <ArchivePlayer date={date} setDate={setDate} />
    </div>
  )
}
