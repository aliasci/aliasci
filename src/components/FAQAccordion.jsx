import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center gap-3 p-4 text-left transition active:bg-slate-50"
            >
              <span className="flex-1 text-sm font-semibold text-slate-800">
                {item.question}
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isOpen ? 'max-h-96 pb-4' : 'max-h-0'
              }`}
            >
              <p className="px-4 text-[13px] leading-relaxed text-slate-500">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
