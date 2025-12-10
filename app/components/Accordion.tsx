'use client'
import { useState } from 'react'
import clsx from 'clsx'

type AccordionProps = {
	title: string
	children: React.ReactNode
	defaultOpen?: boolean
}

export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
	const [open, setOpen] = useState(defaultOpen)
	return (
		<div className="soft-card">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between gap-4"
				aria-expanded={open}
			>
				<span className="font-medium">{title}</span>
				<span
					className={clsx(
						'transition-transform duration-200 inline-flex h-6 w-6 items-center justify-center rounded-full bg-softBlue/50 text-ink',
						open ? 'rotate-180' : 'rotate-0'
					)}
				>
					▾
				</span>
			</button>
			<div className={clsx('px-4 pb-4', open ? 'block' : 'hidden')}>
				<div className="text-gray-700">{children}</div>
			</div>
		</div>
	)
}



