'use client'
import { useState } from 'react'
import clsx from 'clsx'

export type Tab = {
	key: string
	label: string
	content: React.ReactNode
}

export default function Tabs({ tabs, initialKey }: { tabs: Tab[]; initialKey?: string }) {
	const [active, setActive] = useState<string>(initialKey ?? tabs[0]?.key)
	return (
		<div className="soft-card p-4">
			<div className="flex flex-wrap gap-2">
				{tabs.map(t => (
					<button
						key={t.key}
						type="button"
						onClick={() => setActive(t.key)}
						className={clsx(
							'px-3 py-1.5 rounded-full text-sm border',
							active === t.key
								? 'bg-softMint border-softMint text-ink'
								: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
						)}
					>
						{t.label}
					</button>
				))}
			</div>
			<div className="mt-4">
				{tabs.map(t => (
					<div key={t.key} className={active === t.key ? 'block' : 'hidden'}>
						{t.content}
					</div>
				))}
			</div>
		</div>
	)
}



