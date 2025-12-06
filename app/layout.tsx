import type { Metadata } from 'next'
import './globals.css'
import { Inter, Nunito } from 'next/font/google'
import clsx from 'clsx'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap'
})

const nunito = Nunito({
	subsets: ['latin'],
	variable: '--font-nunito',
	display: 'swap',
	weight: ['400', '600', '700', '800']
})

export const metadata: Metadata = {
	title: "Let’s Go into Sleep Mode | Campaign",
	description:
		'School-based campaign to eliminate in-bed screen use among early adolescents at Hardy Middle School, Washington, D.C.',
	metadataBase: new URL('https://example.com')
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={clsx('min-h-screen antialiased', inter.variable, nunito.variable)}>
				{children}
			</body>
		</html>
	)
}

