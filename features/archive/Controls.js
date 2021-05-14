import * as React from 'react'
import { motion, useMotionValue } from 'framer-motion'
import * as d3 from 'd3'
import useResizeObserver from 'use-resize-observer'
import dayjs from 'dayjs'
import { UilAngleDown } from '@iconscout/react-unicons'
import styles from './Controls.module.scss'

const dimensions = {
  width: 1600,
  height: 150,
  margin: { top: 5, right: 0, bottom: 5, left: 0 },
}
const ticksNum = 25

const f = (d) => {
  return d.getMinutes() === 30 ? null : d3.timeFormat('%H:%M')(d)
}

//  const ticks = scale.ticks(tickCount);
// const tickFormat = scale.tickFormat(tickCount);

// TODO: START USING MARGIN TOP / BOTTOM

export default function ArchiveControls({
  date = dayjs().startOf('day'),
  segments,
  onDragEnd,
  onDragStart,
  children,
}) {
  const { ref, width = 1 } = useResizeObserver()
  const x = useMotionValue(width / 2)

  const timeScale = React.useMemo(
    () =>
      d3
        .scaleUtc()
        .domain([date.startOf('day'), date.endOf('day')])
        .range([
          dimensions.margin.left,
          dimensions.width - dimensions.margin.right,
        ])
        .clamp(true),
    [date]
  )
  const jumpTo = (time = date.hour(19)) => {
    // console.log('jump to ', time)
    const t = -1 * (timeScale(time) - width / 2)
    x.set(t)
  }

  React.useEffect(() => {
    if (width > 1) {
      x.set(width / 2)
      if (date) {
        jumpTo(date)
      }
    }
  }, [width, date])

  const handleDrag = () => {
    const offset = -1 * x.get() + width / 2
    const time = timeScale.invert(offset)
    if (onDragEnd) {
      onDragEnd(time)
    }
  }

  return (
    <div className={styles.wrapper}>
      <motion.div className={styles.dragArea} ref={ref} />
      <motion.div
        className={styles.timeline}
        drag="x"
        dragConstraints={{
          left: -1 * dimensions.width + width / 2, //-1 * dimensions.width,
          right: width / 2,
        }}
        dragTransition={{
          bounceStiffness: 100,
          bounceDamping: 14,
          min: 50,
          max: 100,
          // power: 1,
          restDelta: 1,
        }}
        onDragStart={onDragStart}
        onDragEnd={handleDrag}
        onDragTransitionEnd={handleDrag}
        style={{ x }}>
        {timeScale && (
          <svg
            viewBox={'0 0 ' + dimensions.width + ' ' + dimensions.height}
            width={dimensions.width}
            height={dimensions.height}>
            <g fill="currentColor" id="bounds">
              {segments?.map(drawSegment(timeScale))}
              <g id="ticks">
                {timeScale.ticks(ticksNum).map(drawTick(timeScale))}
              </g>
              <g id="axis">
                {timeScale.ticks(ticksNum * 3).map(drawAxis(timeScale))}
              </g>
              <rect
                width="100%"
                height={1}
                transform={`translate(0, ${dimensions.height / 2 + 10})`}
              />
            </g>
          </svg>
        )}
      </motion.div>
      <div className={styles.cursor}>
        <UilAngleDown
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: 'translate(-50%,-100%)',
          }}
        />
        <UilAngleDown
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            transform: 'translate(-50%,100%) rotate(180deg)',
          }}
        />
      </div>
      {children && typeof children === 'function' && children({ jumpTo })}
    </div>
  )
}

const drawTick = (scale) => (d, i) =>
  (
    <g key={d} transform={`translate(${scale(d)}, 0)`}>
      <rect
        width={dimensions.width / ticksNum + 2}
        height={dimensions.height}
        fill="#fff"
        fillOpacity={i % 2 === 0 ? 0.4 : 0.6}
      />
      <text
        transform={`translate(${dimensions.width / ticksNum / 2 - 10}, ${
          dimensions.height / 2 + 5
        })`}>
        {f(d)}
      </text>
    </g>
  )
const drawAxis = (scale) => (d, i) =>
  (
    <g key={d} transform={`translate(${scale(d)}, 0)`}>
      <rect width={1} height={i % 4 === 0 ? 15 : i % 4 === 2 ? 10 : 5} />
      <rect
        width={1}
        height={i % 4 === 0 ? 15 : i % 4 === 2 ? 10 : 5}
        transform={`translate(0, ${dimensions.height}) rotate(180)`}
      />
    </g>
  )
const drawSegment = (scale) => (segment, i) =>
  (
    <g
      key={segment.from}
      transform={`translate(${scale(dayjs.unix(segment.from))}, 0)`}
      className={styles.segment}>
      <rect
        width={(() => {
          const start = dayjs.unix(segment.from) //new Date(segment.from * 1000)
          const end = dayjs.unix(segment.from).add(segment.duration, 's')
          //new Date((from + duration) * 1000)
          return scale(end) - scale(start)
        })()}
        height={dimensions.height}
      />
    </g>
  )
