import dayjs from 'dayjs'

export const convertUnixToThumbUrl = (unix) => {
  const date = dayjs.unix(unix).utc()
  return `${date.year()}/${date.format('MM')}/${date.format(
    'DD'
  )}/${date.format('HH')}/${date.format('mm')}/${date.format('ss')}-preview.mp4`
}

export const convertArchiveUrl = (url, from, duration) =>
  url.replace('$utc_time_from_sec', from).replace('$duration_sec', duration) +
  '.m3u8'
