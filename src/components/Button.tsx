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
  const baseClass = `inline-flex items-center gap-2 rounded-md bg-mist-700 px-6 py-2 font-semibold text-mist-100 transition-all duration-200 hover:bg-mist-600 active:scale-95${className ? ` ${className}` : ''}`
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
