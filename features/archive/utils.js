import dayjs from 'dayjs'

export const convertDateToThumbUrl = (url, d) => {
  const date = dayjs(d).utc()
  return `${url}${date.year()}/${date.format('MM')}/${date.format(
    'DD'
  )}/${date.format('HH')}/${date.format('mm')}/${date.format('ss')}-preview.mp4`
}

export const convertRanges = (ranges, archiveUrl) => {
  const re = /^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+)\//i
  const [url] = archiveUrl.match(re)

  return ranges.map((d) => convertDateToThumbUrl(url, d))
}

export const convertArchiveUrl = (url, from, duration) =>
  url.replace('$utc_time_from_sec', from).replace('$duration_sec', duration) +
  '.m3u8'
