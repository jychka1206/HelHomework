import Link from 'next/link'

export default function SurveyPage() {
	return (
		<main className="container-p max-w-[1200px] mx-auto py-8 md:py-12">
			<div className="soft-card p-6 md:p-10">
				<Link href="/" className="inline-block mb-6 text-purple-400 hover:text-purple-600 hover:underline">
					← Back to Campaign Plan
				</Link>
				<h1 className="text-3xl md:text-5xl font-display font-extrabold leading-tight text-gray-800 mb-6">
					Campaign Survey
				</h1>
				
				<div className="prose prose-slate max-w-none space-y-6">
					<p className="mb-4">The campaign will also use the <Link href="/ttm" className="text-purple-400 hover:text-purple-600 hover:underline">Transtheoretical Model (TTM)</Link> to evaluate behavioral change. A brief, anonymous survey will be given before the campaign begins and again at the end.</p>
					
					<div className="space-y-6 mt-8">
						<div>
							<p className="font-semibold mb-2">Q1. Right now, do you usually keep all screens out of your bed before you fall asleep?</p>
							<div className="space-y-2 pl-4">
								<div className="flex items-center">
									<input type="radio" name="q1" className="mr-2" />
									<span>Yes, on most nights (4 or more nights a week) [go to Q3]</span>
								</div>
								<div className="flex items-center">
									<input type="radio" name="q1" className="mr-2" />
									<span>No, I still use screens in bed on most school nights [go to Q2]</span>
								</div>
							</div>
						</div>
						
						<div>
							<p className="font-semibold mb-2">Q2. Are you seriously thinking about stopping screen use in bed on school nights?</p>
							<div className="space-y-2 pl-4">
								<div className="flex items-center">
									<input type="radio" name="q2" className="mr-2" />
									<span>No, I am not thinking about changing this in the next 6 months.</span>
								</div>
								<div className="flex items-center">
									<input type="radio" name="q2" className="mr-2" />
									<span>I am thinking about changing this sometime in the next 6 months, but not in the next 30 days.</span>
								</div>
								<div className="flex items-center">
									<input type="radio" name="q2" className="mr-2" />
									<span>I plan to start changing this in the next 30 days.</span>
								</div>
							</div>
						</div>
						
						<div>
							<p className="font-semibold mb-2">Q3. How long have you been keeping screens out of your bed on most school nights?</p>
							<div className="space-y-2 pl-4">
								<div className="flex items-center">
									<input type="radio" name="q3" className="mr-2" />
									<span>Less than 1 month</span>
								</div>
								<div className="flex items-center">
									<input type="radio" name="q3" className="mr-2" />
									<span>1–5 months</span>
								</div>
								<div className="flex items-center">
									<input type="radio" name="q3" className="mr-2" />
									<span>6 months or longer</span>
								</div>
							</div>
						</div>
					</div>
					
					<div className="mt-8 p-4 bg-gray-50 rounded-xl">
						<h2 className="text-xl font-display font-semibold text-gray-800 mb-4">Stages of Change Classification</h2>
						<div className="space-y-3">
							<div>
								<p className="font-medium mb-1">• Precontemplation</p>
								<p className="text-sm text-gray-600">Q1 = No</p>
								<p className="text-sm text-gray-600">Q2 = "No, not thinking about changing in the next 6 months"</p>
							</div>
							<div>
								<p className="font-medium mb-1">• Contemplation</p>
								<p className="text-sm text-gray-600">Q1 = No</p>
								<p className="text-sm text-gray-600">Q2 = "Thinking about changing in the next 6 months, but not in the next 30 days"</p>
							</div>
							<div>
								<p className="font-medium mb-1">• Preparation</p>
								<p className="text-sm text-gray-600">Q1 = No</p>
								<p className="text-sm text-gray-600">Q2 = "Plan to start changing in the next 30 days"</p>
							</div>
							<div>
								<p className="font-medium mb-1">• Action</p>
								<p className="text-sm text-gray-600">Q1 = Yes</p>
								<p className="text-sm text-gray-600">Q3 = "Less than 1 month" or "1–5 months"</p>
							</div>
							<div>
								<p className="font-medium mb-1">• Maintenance</p>
								<p className="text-sm text-gray-600">Q1 = Yes</p>
								<p className="text-sm text-gray-600">Q3 = "6 months or longer"</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}

