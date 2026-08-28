import { ICON_MAP } from '../../constants/icons'

function FeatureBadge({ feature, size = 'sm' }) {
  const IconComponent = feature.icon ? ICON_MAP[feature.icon] : null

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-1'
    : 'text-sm px-3 py-1.5'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-violet-100 text-violet-700 font-semibold ${sizeClasses}`}>
      {IconComponent && <IconComponent className="text-violet-500" />}
      {feature.name}
    </span>
  )
}

export default FeatureBadge
