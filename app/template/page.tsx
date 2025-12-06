import Link from 'next/link'

export default function TemplatePage() {
	return (
		<main className="container-p max-w-[1200px] mx-auto py-8 md:py-12">
			<div className="soft-card p-6 md:p-10">
				<Link href="/" className="inline-block mb-6 text-purple-400 hover:text-purple-600 hover:underline">
					← Back to Campaign Plan
				</Link>
				<h1 className="text-3xl md:text-5xl font-display font-extrabold leading-tight text-gray-800 mb-6">
					Family Bedtime Screen Rule Template
				</h1>
				
				<div className="prose prose-slate max-w-none space-y-6">
					<div className="space-y-4">
						<h2 className="text-2xl font-display font-semibold text-gray-800 mt-8 mb-4">1. One Bedtime Screen Rule on School Nights for ___________ (The Name of Kids)</h2>
						<p className="mb-4 font-medium">Pick ONE or write your own:</p>
						
						<div className="space-y-3 pl-4">
							<div className="flex items-start">
								<input type="checkbox" className="mt-1 mr-3" />
								<div>
									<p className="font-medium mb-1">No screens in bed:</p>
									<p className="text-gray-700">On school nights, phones, tablets, and laptops can stay in the room, but no screen brought into bed or screen use in bed</p>
								</div>
							</div>
							
							<div className="flex items-start">
								<input type="checkbox" className="mt-1 mr-3" />
								<div>
									<p className="font-medium mb-1">Audio only after we get into bed:</p>
									<p className="text-gray-700">Once we are in bed, we only use audio (music, stories, white noise) and do not hold any screen in our hands. If we want audio, we use a speaker, radio, or simple device.</p>
								</div>
							</div>
							
							<div className="flex items-start">
								<input type="checkbox" className="mt-1 mr-3" />
								<div>
									<p className="font-medium mb-1">Stop new fun content at a set time:</p>
									<p className="text-gray-700">On school nights, we stop starting new videos, games, or endless scrolling after ____ : ____ p.m. Anything fun after that is saved for tomorrow.</p>
								</div>
							</div>
							
							<div className="flex items-start">
								<input type="checkbox" className="mt-1 mr-3" />
								<div>
									<p className="font-medium mb-1">Phones sleep in a "parking spot" after a set time:</p>
									<p className="text-gray-700">After ____ : ____ p.m., phones go to their "parking spot" (desk / shelf / hallway / other) to charge, and they stay there for the night.</p>
								</div>
							</div>
							
							<div className="flex items-start">
								<input type="checkbox" className="mt-1 mr-3" />
								<div>
									<p className="font-medium mb-1">Custom rule:</p>
									<p className="text-gray-700">On school nights, we agree that:</p>
									<div className="mt-2 border-b-2 border-gray-300 min-h-[2rem]"></div>
								</div>
							</div>
						</div>
						
						<p className="font-medium mt-6 mb-2">Write your chosen rule here in one sentence (so it's clear to everyone):</p>
						<p className="font-medium mb-2">Our family's one bedtime screen rule is:</p>
						<div className="space-y-2 border-b-2 border-gray-300 min-h-[6rem] mb-4"></div>
					</div>
					
					<div className="space-y-4 mt-8">
						<h2 className="text-2xl font-display font-semibold text-gray-800 mt-8 mb-4">2. Where Our Devices "Sleep" at Night</h2>
						<p className="mb-4">Step 2. We decide where devices stay after we follow the rule.</p>
						
						<div className="space-y-3">
							<div>
								<p className="font-medium mb-2">• Phones usually stay:</p>
								<p className="text-gray-600 text-sm mb-2">(e.g., desk, shelf by the door, living room)</p>
								<div className="border-b-2 border-gray-300 min-h-[2rem]"></div>
							</div>
							
							<div>
								<p className="font-medium mb-2">• Tablets / laptops usually stay:</p>
								<div className="border-b-2 border-gray-300 min-h-[2rem]"></div>
							</div>
							
							<div>
								<p className="font-medium mb-2">• If we use audio at night, it comes from:</p>
								<div className="space-y-2 pl-4">
									<div className="flex items-center">
										<input type="checkbox" className="mr-2" />
										<span>A small speaker / radio</span>
									</div>
									<div className="flex items-center">
										<input type="checkbox" className="mr-2" />
										<span>A smart speaker (voice-controlled)</span>
									</div>
									<div className="flex items-center">
										<input type="checkbox" className="mr-2" />
										<span>Other: </span>
										<div className="flex-1 border-b-2 border-gray-300 ml-2 min-h-[1.5rem]"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
					
					<div className="space-y-4 mt-8">
						<h2 className="text-2xl font-display font-semibold text-gray-800 mt-8 mb-4">3. Exceptions We Agree On (Optional)</h2>
						<p className="mb-4">Step 3. We agree on any exceptions so they are clear, not constant.</p>
						
						<div className="space-y-3">
							<div>
								<p className="font-medium mb-2">• Our "late screen night" (if we have one):</p>
								<p className="text-gray-600 text-sm mb-2">(e.g., Friday, Saturday, or none)</p>
								<div className="border-b-2 border-gray-300 min-h-[2rem]"></div>
							</div>
							
							<div>
								<p className="font-medium mb-2">• Special exceptions (birthdays, holidays, travel, etc.):</p>
								<div className="space-y-2 border-b-2 border-gray-300 min-h-[4rem]"></div>
							</div>
						</div>
					</div>
					
					<div className="space-y-4 mt-8">
						<h2 className="text-2xl font-display font-semibold text-gray-800 mt-8 mb-4">4. One Bedtime Screen Rule on Work Nights for ___________ (The Name of Parents)</h2>
						<p className="mb-4 font-medium">Pick ONE or write your own:</p>
						
						<div className="space-y-3 pl-4">
							<div className="flex items-start">
								<input type="checkbox" className="mt-1 mr-3" />
								<span className="font-medium">Same rule as the child</span>
							</div>
							
							<div className="flex items-start">
								<input type="checkbox" className="mt-1 mr-3" />
								<div>
									<p className="font-medium mb-1">Slightly different, but still a clear limit:</p>
									<p className="text-gray-700 text-sm">• Example: no work emails after ____ : ____ p.m.</p>
									<p className="text-gray-700 text-sm">• Example: phone stays on the nightstand, but not in bed.</p>
								</div>
							</div>
						</div>
						
						<p className="font-medium mt-6 mb-2">Our parents' bedtime screen rule is:</p>
						<div className="space-y-2 border-b-2 border-gray-300 min-h-[6rem] mb-4"></div>
					</div>
					
					<div className="space-y-4 mt-8">
						<h2 className="text-2xl font-display font-semibold text-gray-800 mt-8 mb-4">5. If Someone Breaks the Rule…</h2>
						<p className="mb-4">If someone breaks the rule, we will (choose what fits your family):</p>
						
						<div className="space-y-3 pl-4">
							<div className="flex items-center">
								<input type="checkbox" className="mr-3" />
								<span>Talk briefly about what made it hard that night.</span>
							</div>
							<div className="flex items-center">
								<input type="checkbox" className="mr-3" />
								<span>Try again the next night (no punishment, just reset).</span>
							</div>
							<div className="flex items-center">
								<input type="checkbox" className="mr-3" />
								<span>Adjust the rule if we realize it was too strict.</span>
							</div>
							<div className="flex items-center">
								<input type="checkbox" className="mr-3" />
								<span>Have/Cancel ________ as "punishment"</span>
							</div>
							<div className="flex items-center">
								<input type="checkbox" className="mr-3" />
								<span>Other: </span>
								<div className="flex-1 border-b-2 border-gray-300 ml-2 min-h-[1.5rem]"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}

