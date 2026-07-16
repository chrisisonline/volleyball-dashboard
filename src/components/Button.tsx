import type { LucideIcon } from 'lucide-react'

interface ButtonProps {
  children?: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  icon?: LucideIcon
  href?: string
}

export default function Button({
  children,
  onClick,
  type = 'button',
  className,
  icon: Icon,
  href,
}: ButtonProps) {
  // Square, thin-bordered grey button: light-grey fill, lightening on hover/active.
  const variantClass =
    'border border-mist-600 bg-mist-800 text-mist-100 hover:bg-mist-700 active:bg-mist-600'
  const baseClass = `inline-flex items-center gap-2 rounded-none border-solid ${variantClass} px-6 py-2 font-semibold transition-all duration-200 active:scale-95${className ? ` ${className}` : ''}`
  const content = (
    <>
      {Icon && <Icon size={20} absoluteStrokeWidth strokeWidth={2} />}
      {children}
    </>
  )

  if (href) {
    return (
      <a href={href} className={baseClass}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} className={baseClass}>
      {content}
    </button>
  )
}
