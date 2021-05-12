import { useState } from 'react'
import dayjs from 'dayjs'
import ArchivePlayer from '../../features/archive/Player'
import Head from 'next/head'

//api.stage.sirin.cc/api/public/v2/cameras/7171f0d0-7763-48b4-b5d7-05624f96cc58/archive_timeline?start_date=1619902800&end_date=1619989199
const start_date = 1619902800
const end_date = 1619989199

export default function ({ ...props }) {
  const [date, setDate] = useState(dayjs.unix(1619902800))
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
      <ArchivePlayer date={date} setDate={setDate} />
    </div>
  )
}
