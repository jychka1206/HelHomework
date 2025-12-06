 'use client'
import Link from 'next/link'
import clsx from 'clsx'
import { useScrollSpy } from './useScrollSpy'

export default function Nav({ sections }: { sections: { id: string; label: string }[] }) {
	const active = useScrollSpy(sections.map(s => s.id))
	return (
		<nav className="sticky top-4 soft-card p-3 hidden lg:block h-fit">
			<div className="font-semibold text-sm mb-2">On this page</div>
			<ul className="space-y-1 text-sm max-h-[70vh] overflow-auto pr-1">
				{sections.map(s => (
					<li key={s.id}>
						<Link
							href={`#${s.id}`}
							className={clsx(
								'block px-3 py-1 rounded-lg',
								active === s.id ? 'bg-softLavender/60 text-ink' : 'text-gray-600 hover:bg-gray-50'
							)}
						>
							{s.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	)
}

