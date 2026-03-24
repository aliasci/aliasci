import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function SectionHeader({ title, linkTo, linkText = 'Tümünü Gör' }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-0.5 text-sm font-semibold text-emerald-600"
        >
          {linkText}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  )
}
