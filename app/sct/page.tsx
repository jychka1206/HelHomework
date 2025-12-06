import Link from 'next/link'

export default function SCTPage() {
	return (
		<main className="container-p max-w-[1200px] mx-auto py-8 md:py-12">
			<div className="soft-card p-6 md:p-10">
				<Link href="/" className="inline-block mb-6 text-purple-400 hover:text-purple-600 hover:underline">
					← Back to Campaign Plan
				</Link>
				<h1 className="text-3xl md:text-5xl font-display font-extrabold leading-tight text-gray-800 mb-6">
					Social Cognitive Theory (SCT)
				</h1>
				
				<div className="prose prose-slate max-w-none space-y-6">
					<p className="mb-4">
						Social Cognitive Theory (SCT), initially introduced by Bandura (2002a, 2002b), posits that human behavior results from the reciprocal interaction among personal cognition, the environment, and behavior. In other words, through the interaction and mutual influence of these three factors, people either maintain, change, or reinforce their thoughts, feelings, and actions (Bandura, 2002a, 2002b). Initial key constructs within this framework, including self-efficacy, outcome expectations, goals, and socio-structural impediments and facilitators, represent the core personal and environmental elements that drive this cycle (Conner & Norman, 2015).
					</p>
					
					<p className="mb-4">
						According to Conner and Norman (2015), SCT has been widely applied in health intervention research across various areas, such as adherence to medication and rehabilitation, sexual risk behaviors, physical exercise, and nutrition and weight control. However, many of these studies have primarily focused on SCT's self-efficacy construct for assessment, research, and intervention development (Conner & Norman, 2015).
					</p>
					
					<p className="mb-4">
						In the context of this campaign, there is no exact research using SCT specifically focused on teen screen use in bed, but a series of studies on screen use among early adolescents and some related intervention trials based in school or family settings do exist (Arundell et al., 2020; Bickham et al., 2018; Bowers & Moyer, 2019; Lubans et al., 2016; Xu, 2021).
					</p>
				</div>
			</div>
		</main>
	)
}

