import Link from 'next/link'

export default function TTMPage() {
	return (
		<main className="container-p max-w-[1200px] mx-auto py-8 md:py-12">
			<div className="soft-card p-6 md:p-10">
				<Link href="/" className="inline-block mb-6 text-purple-400 hover:text-purple-600 hover:underline">
					← Back to Campaign Plan
				</Link>
				<h1 className="text-3xl md:text-5xl font-display font-extrabold leading-tight text-gray-800 mb-6">
					Transtheoretical Model (TTM)
				</h1>
				
				<div className="prose prose-slate max-w-none space-y-6">
					<p className="mb-4">
						The Transtheoretical Model (TTM) is another classic behavioral theory. It is distinguished by its synthesis of stages of change with other processes and principles derived from major intervention theories, which is why it is named transtheoretical (Prochaska et al., 2015). Its primary and most explored domain is the Stages of Change, which posits that behavior change is a process that moves through five stages: precontemplation, contemplation, preparation, action, and maintenance, ultimately aiming for termination (Carter et al., 2013; Menezes et al., 2018; Nakabayashi et al., 2020; Prochaska et al., 2015). It is important to note that this process is non-linear and can be experienced in a back-and-forth manner (Prochaska et al., 2015). Other core constructs of TTM include the Processes of Change (overt and covert activities used to progress through stages), Decisional Balance, and Self-Efficacy (Prochaska et al., 2015).
					</p>
					
					<p className="mb-4">
						The TTM has demonstrated effectiveness in a variety of health education initiatives, including programs for smoking cessation, fitness, dietary improvement, and weight management (Carter et al., 2013; Menezes et al., 2018; Prochaska et al., 2015; Zare et al., 2016). Those TTM-based research and interventions specifically targeting children and adolescents have also been synthesized and analyzed by researchers such as Nakabayashi et al. (2020) and Xie et al. (2025). They respectively reviewed TTM-based interventions in nutrition intake and physical activity among children and adolescents and concluded that the initiatives had overall effectiveness.
					</p>
					
					<p className="mb-4">
						Considering the campaign's target behavior, there is no research explicitly addressing the issue with TTM guidance. However, a few studies focusing on early adolescents' screen use and another on sleep procrastination can be referenced (Bistricky et al., 2025; Bozkurt et al., 2024; Noroozi et al., 2024; Velicer et al., 2013).
					</p>
				</div>
			</div>
		</main>
	)
}

