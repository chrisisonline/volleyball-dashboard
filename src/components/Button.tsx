import type { LucideIcon } from 'lucide-react'

interface ButtonProps {
  children?: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  icon?: LucideIcon
  href?: string
  variant?: 'default' | 'primary'
}

export default function Button({
  children,
  onClick,
  type = 'button',
  className,
  icon: Icon,
  href,
  variant = 'default',
}: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'bg-teal-700 hover:bg-teal-600'
      : 'bg-mist-700 hover:bg-mist-600'
  const baseClass = `inline-flex items-center gap-2 rounded-md ${variantClass} px-6 py-2 font-semibold text-mist-100 transition-all duration-200 active:scale-95${className ? ` ${className}` : ''}`
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
