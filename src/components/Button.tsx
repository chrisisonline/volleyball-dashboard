interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  children,
  onClick,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="rounded-md bg-mist-700 px-6 py-2 font-semibold text-mist-100 transition-all duration-200 hover:bg-mist-600 active:scale-95"
    >
      {children}
    </button>
  )
}
