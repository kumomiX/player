import { useState } from 'react'
import * as d3 from 'd3'
import dayjs from 'dayjs'
import useResizeObserver from 'use-resize-observer'

//api.stage.sirin.cc/api/public/v2/cameras/7171f0d0-7763-48b4-b5d7-05624f96cc58/archive_timeline?start_date=1619902800&end_date=1619989199
const start_date = 1619902800
const end_date = 1619989199
const timeline = {
  archive: [
    { duration: 9486, from: 1619902800 },
    { duration: 66099, from: 1619912303 },
    { duration: 2087, from: 1619987112 },
  ],
  events: [],
}

const fitsOnScreen = 64 / 4 // 16
const date = dayjs('05/02/2020')
//
const width = 375 * fitsOnScreen
const height = 70
const margin = {
  left: 10,
  right: 10,
}

const xScale = d3
  .scaleTime()
  .domain([date.startOf('day'), date.endOf('day')])
  .range([margin.left, width - margin.right])
  .nice()
  .clamp(true)

export default function VideoPlayer() {
  const { ref, width: playerWidth = 1 } = useResizeObserver()

  const [seekOffset, setSeekOffset] = useState(-5000)
  const cur = playerWidth / 2 - seekOffset
  console.log(cur)
  return (
    <div>
      player {date.format('DD MMMM YYYY')}{' '}
      {dayjs(xScale.invert(cur)).format('HH:mm')}
      <div
        style={{ background: '#000', overflow: 'hidden', width: '100%' }}
        ref={ref}>
        <svg
          viewBox={[0, 0, width, height]}
          style={{
            width,
            height,
          }}>
          <g transform={`translate(${seekOffset},0)`}>
            <rect width={width} height={height} fill="#cea6a6" />
            <rect width={width} height={10} fill="#536bd4" />
            <rect
              height={height}
              width={2}
              fill={'#000'}
              transform={`translate(${cur},0)`}
            />

            <g id="bigticks">
              {xScale.ticks(64).map((tick) => {
                const date = dayjs(tick)
                return (
                  <g
                    transform={`translate(${xScale(tick)},${height / 2})`}
                    id="tick">
                    <rect width={1} height={height / 4} y="-50%"></rect>
                    <text style={{ fontSize: 10 }} fill="#000">
                      {date.format('HH:mm')}
                    </text>{' '}
                  </g>
                )
              })}
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}
