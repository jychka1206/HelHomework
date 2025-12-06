 'use client'
import { useEffect, useState } from 'react'

export function useScrollSpy(sectionIds: string[], rootMargin: string = '-40% 0px -55% 0px') {
	const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null)

	useEffect(() => {
		const elements = sectionIds
			.map(id => document.getElementById(id))
			.filter(Boolean) as HTMLElement[]
		if (elements.length === 0) return

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id)
					}
				})
			},
			{ rootMargin, threshold: [0, 0.25, 0.5, 0.75, 1] }
		)

		elements.forEach(el => observer.observe(el))
		return () => observer.disconnect()
	}, [sectionIds, rootMargin])

	return activeId
}


