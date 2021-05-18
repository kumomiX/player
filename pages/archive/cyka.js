import { useState } from 'react'
import dayjs from 'dayjs'
import ArchivePlayer from '../../features/archive/Player'
import Head from 'next/head'

export default function Page({ ...props }) {
  const [date, setDate] = useState(dayjs.unix(1621198800))
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#E6E9EC',
        overflow: 'hidden',
      }}>
      <Head>
        <title>Player</title>
      </Head>
      <ArchivePlayer
        // url="https://cvs.fastel.biz/e8533209-14a6-4346-954f-86bfaa7040e5/archive-1619902800-3600"
        date={date}
        setDate={setDate}
      />
    </div>
  )
}
