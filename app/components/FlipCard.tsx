'use client'

import { useState } from 'react'

interface FlipCardProps {
	front: React.ReactNode
	back: string
	className?: string
	showRipple?: boolean
}

export default function FlipCard({ front, back, className = '', showRipple = false }: FlipCardProps) {
	const [isFlipped, setIsFlipped] = useState(false)

	return (
		<div
			className={`flip-card-container ${className} ${showRipple ? 'ripple-enabled' : ''}`}
			onClick={() => setIsFlipped(!isFlipped)}
		>
			{showRipple && !isFlipped && (
				<>
					<div className="ripple-animation"></div>
					<div className="cursor-hint">
						<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="rgba(139, 92, 246, 0.9)" stroke="rgba(139, 92, 246, 1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							<circle cx="18" cy="8" r="2" fill="rgba(139, 92, 246, 0.9)"/>
						</svg>
					</div>
				</>
			)}
			<div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
				<div className="flip-card-front">
					{front}
				</div>
				<div className="flip-card-back">
					<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{back}</p>
				</div>
			</div>
		</div>
	)
}

