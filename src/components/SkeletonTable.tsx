interface SkeletonTableProps {
  columns: number
  rows: number
}

export default function SkeletonTable({ columns, rows }: SkeletonTableProps) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="bg-mist-900">
                <div className="h-8 animate-pulse rounded-md bg-mist-500/50" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="even:bg-mist-700/30">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx}>
                  <div className="h-7 animate-pulse rounded-md bg-mist-500/50" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
