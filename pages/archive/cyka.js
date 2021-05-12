import ArchiveControls from '../../features/archive/Controls'

export default function Page(params) {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        height: '100vh',
        background: '#d2d2d2',
      }}>
      <ArchiveControls />
    </div>
  )
}
