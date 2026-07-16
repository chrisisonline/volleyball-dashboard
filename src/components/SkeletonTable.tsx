interface SkeletonTableProps {
  columns: number
  rows: number
}

// Square placeholder bar — mirrors the sharp-cornered look of the real UI.
function Bar({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-mist-500/50 ${className ?? ''}`} />
}

export default function SkeletonTable({ columns, rows }: SkeletonTableProps) {
  return (
    <div className="table-wrapper">
      <table className="w-full">
        <thead>
          {/* Location title block — matches the h2 + address header of a real table */}
          <tr>
            <th colSpan={columns} className="text-left">
              <Bar className="h-6 w-48" />
              <Bar className="mt-2 h-4 w-64" />
            </th>
          </tr>
          {/* Column headers */}
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <Bar className="h-4 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx}>
                  <Bar className="h-9" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
