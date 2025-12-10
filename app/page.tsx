import { promises as fs } from 'fs'
import path from 'path'
import Image from 'next/image'
import Nav from './components/Nav'
import Accordion from './components/Accordion'
import Tabs from './components/Tabs'
import FlipCard from './components/FlipCard'

type Section = { id: string; title: string; html: string }

function slugify(input: string) {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
}

function stripTags(s: string) {
	return s.replace(/<[^>]*>/g, '').trim()
}

function splitHtmlIntoSections(html: string): Section[] {
	const headingRegex = /<(h1|h2|h3)[^>]*>(.*?)<\/\1>/gi
	const sections: Section[] = []
	let match: RegExpExecArray | null
	const indices: { level: string; title: string; start: number; end?: number }[] = []
	while ((match = headingRegex.exec(html)) !== null) {
		indices.push({ level: match[1], title: stripTags(match[2]), start: match.index })
	}
	for (let i = 0; i < indices.length; i++) {
		indices[i].end = i + 1 < indices.length ? indices[i + 1].start : html.length
	}
	for (const idx of indices) {
		const chunk = html.slice(idx.start, idx.end)
		const id = slugify(idx.title)
		sections.push({ id, title: idx.title, html: chunk })
	}
	if (sections.length === 0) {
		return [{ id: 'content', title: 'Content', html }]
	}
	return sections
}

function norm(s: string) {
	return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function convertUrlsToLinks(text: string): string {
	// Match URLs (http://, https://, or www.)
	const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+|www\.[^\s<>"{}|\\^`\[\]]+)/gi
	return text.replace(urlRegex, (url) => {
		// Ensure URL has protocol
		const href = url.startsWith('http') ? url : `https://${url}`
		return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline">${url}</a>`
	})
}

function generateReferencesHTML(): string {
	const references = [
		'Accountable Tech, & LOG OFF. (2023). Prevalence of design harms among young people. https://accountabletech.org/wp-content/uploads/Prevalence-of-design-harms-in-young-people.pdf',
		'Ahn, S., Jung, S., Kim, H., Kim, J., Weon, Y., & Kwon, O. (2021). Differences in neck muscle activity according to lying positions using a smartphone. <em>Journal of Back and Musculoskeletal Rehabilitation</em>, 35(2), 383–391. https://doi.org/10.3233/BMR-200315',
		'Alim-Marvasti, A., Bi, W., Mahroo, O. A., Barbur, J. L., & Plant, G. T. (2016). Transient smartphone "blindness." <em>New England Journal of Medicine</em>, 374(25), 2502–2504. https://doi.org/10.1056/NEJMc1514294',
		'Anastasiades, P. G., de Vivo, L., Bellesi, M., & Jones, M. W. (2022). Adolescent sleep and the foundations of prefrontal cortical development and dysfunction. <em>Progress in Neurobiology</em>, 218, 102338. https://doi.org/10.1016/j.pneurobio.2022.102338',
		'Arundell, L., Parker, K., Timperio, A., Salmon, J., & Veitch, J. (2020). Home-based screen time behaviours amongst youth and their parents: Familial typologies and their modifiable correlates. <em>BMC Public Health</em>, 20, 1312. https://doi.org/10.1186/s12889-020-09581-w',
		'Bandura, A. (2002a). Social cognitive theory in cultural context. <em>Applied Psychology: An International Review</em>, 51(2), 269–290.',
		'Bandura, A. (2002b). Social cognitive theory of mass communication. In J. Bryant & D. Zillmann (Eds.), <em>Media effects: Advances in theory and research</em> (2nd ed., pp. 121–153). Lawrence Erlbaum.',
		'Bickham, D. S., Hswen, Y., Slaby, R. G., & Rich, M. (2018). A preliminary evaluation of a school-based media education and reduction intervention. <em>Journal of Primary Prevention</em>, 39(3), 229–245. https://doi.org/10.1007/s10935-018-0510-2',
		'Bistricky, S. L., Lopez, A. K., Pollard, T. B., Egan, A., Gimenez-Zapiola, M., Pascuzzi, B., Velasquez, K. M., & Graves, M. (2025). Brief multimodal intervention to address students\' bedtime procrastination and sleep through self-compassion and sleep hygiene during stressful times. <em>Journal of College Student Mental Health</em>, 1–25. https://doi.org/10.1080/28367138.2025.2491521',
		'Bozkurt, A., Demirdöğen, E. Y., & Akıncı, M. A. (2024). The association between bedtime procrastination, sleep quality, and problematic smartphone use in adolescents: A mediation analysis. <em>The Eurasian Journal of Medicine</em>, 56(1), 69. https://doi.org/10.5152/eurasianjmed.2024.23379',
		'Bowers, J. M., & Moyer, A. (2019). Adolescent sleep and technology-use rules: Results from the California Health Interview Survey. <em>Sleep Health</em>, 6(1), 14–19. https://doi.org/10.1016/j.sleh.2019.08.011',
		'Brosnan, B., Haszard, J. J., Meredith-Jones, K. A., Wickham, S. R., Galland, B. C., & Taylor, R. W. (2024). Screen use at bedtime and sleep duration and quality among youths. <em>JAMA Pediatrics</em>, 178(11), 1147–1154. https://doi.org/10.1001/jamapediatrics.2024.2914',
		'Cappuccio, F. P., Taggart, F. M., Kandala, N.-B., Currie, A., Peile, E., Stranges, S., & Miller, M. A. (2008). Meta-analysis of short sleep duration and obesity in children and adults. <em>Sleep</em>, 31(5), 619–626. https://doi.org/10.1093/sleep/31.5.619',
		'Carter, M. C., Burley, V. J., Nykjaer, C., & Cade, J. E. (2013). Adherence to a smartphone application for weight loss compared to website and paper diary: Pilot randomized controlled trial. <em>Journal of Medical Internet Research</em>, 15(4), e32. https://doi.org/10.2196/jmir.2283',
		'CDC. (2024b, July 2). Sleep and health. Physical Education and Physical Activity. https://www.cdc.gov/physical-activity-education/staying-healthy/sleep.html',
		'Census Reporter. (n.d.). Ward 2, DC profile. https://censusreporter.org/profiles/61000US11002-ward-2-dc/',
		'Chang, A.-M., Aeschbach, D., Duffy, J. F., & Czeisler, C. A. (2015). Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness. <em>Proceedings of the National Academy of Sciences</em>, 112(4), 1232–1237. https://doi.org/10.1073/pnas.1418490112',
		'Common Sense Media. (March 23, 2022). Share of children with a personal electronic device in the United States in 2021, by type [Graph]. In Statista. Retrieved September 22, 2025, from https://www-statista-com.proxy1.library.jhu.edu/statistics/1324257/children-owning-a-personal-electronic-device-by-type-us/',
		'Conner, M., & Norman, P. (2015). <em>Predicting and changing health behaviour: Research and practice with social cognition models</em> (3rd ed.). Open University Press.',
		'Cooley, S., Elenbaas, L., & Killen, M. (2012). Moral judgments and emotions: Adolescents\' evaluations in intergroup social exclusion contexts. <em>New Directions for Youth Development</em>, 2012(136), 41–57. https://doi.org/10.1002/yd.20037',
		'Crowley, S. J., Cain, S. W., Burns, A. C., Acebo, C., & Carskadon, M. A. (2015). Increased sensitivity of the circadian system to light in early/mid-puberty. <em>The Journal of Clinical Endocrinology & Metabolism</em>, 100(11), 4067–4073. https://doi.org/10.1210/jc.2015-2775',
		'Cumsille, P., Darling, N., Flaherty, B., & Loreto Martínez, M. (2009). Heterogeneity and change in the patterning of adolescents\' perceptions of the legitimacy of parental authority: A latent transition model. <em>Child Development</em>, 80(2), 418–432. https://doi.org/10.1111/j.1467-8624.2009.01269.x',
		'Daniels, A., Pillion, M., Rullo, B., Mikulcic, J., Whittall, H., Bartel, K., Kahn, M., Gradisar, M., & Bauducco, S. V. (2022). Technology use as a sleep-onset aid: Are adolescents using apps to distract themselves from negative thoughts? <em>Sleep Advances</em>, 4(1), zpac047. https://doi.org/10.1093/sleepadvances/zpac047',
		'District of Columbia Public Schools. (2023). DC Public Schools fast facts 2023. https://dcps.dc.gov/sites/default/files/dc/sites/dcps/publication/attachments/DCPS%20Fast%20Facts%202023%20FINAL.pdf',
		'DiClemente, C. C., Prochaska, J. O., Fairhurst, S. K., Velicer, W. F., Velasquez, M. M., & Rossi, J. S. (1991). The process of smoking cessation: An analysis of precontemplation, contemplation, and preparation stages of change. <em>Journal of Consulting and Clinical Psychology</em>, 59(2), 295–304. 10.1037//0022-006x.59.2.295',
		'Dresp-Langley, B., & Hutt, A. (2022). Digital addiction and sleep. <em>International Journal of Environmental Research and Public Health</em>, 19(11), 6910. https://doi.org/10.3390/ijerph19116910',
		'Feinberg, M. E., Solmeyer, A. R., & McHale, S. M. (2011). The third rail of family systems: Sibling relationships, mental and behavioral health, and preventive intervention in childhood and adolescence. <em>Clinical Child and Family Psychology Review</em>, 15(1), 43–57. https://doi.org/10.1007/s10567-011-0104-5',
		'Fuller, C., Lehman, E., Hicks, S., & Novick, M. B. (2017). Bedtime use of technology and associated sleep problems in children. <em>Global Pediatric Health</em>, 4, 2333794X17736972. https://doi.org/10.1177/2333794X17736972',
		'Gradisar, M., Wolfson, A. R., Harvey, A. G., Hale, L., Rosenberg, R., & Czeisler, C. A. (2013). The sleep and technology use of Americans: Findings from the National Sleep Foundation\'s 2011 Sleep in America poll. <em>Journal of Clinical Sleep Medicine</em>, 9(12), 1291–1299. https://doi.org/10.5664/jcsm.3272',
		'Granic, I., Morita, H., & Scholten, H. (2020). Beyond screen time: Identity development in the digital age. <em>Psychological Inquiry</em>, 31(3), 195–223. https://doi.org/10.1080/1047840X.2020.1820214',
		'Hale, L., & Guan, S. (2015). Screen time and sleep among school-aged children and adolescents: A systematic literature review. <em>Sleep Medicine Reviews</em>, 21, 50–58. https://doi.org/10.1016/j.smrv.2014.07.007',
		'Hale, L., Kirschen, G. W., LeBourgeois, M. K., Gradisar, M., Garrison, M. M., Montgomery-Downs, H., Kirschen, H., McHale, S. M., Chang, A. M., & Buxton, O. M. (2018). Youth screen media habits and sleep: Sleep-friendly screen behavior recommendations for clinicians, educators, and parents. <em>Child and Adolescent Psychiatric Clinics of North America</em>, 27(2), 229–245. https://doi.org/10.1016/j.chc.2017.11.014',
		'Hui, S. K., & Grandner, M. A. (2015). Associations between poor sleep quality and stages of change of multiple health behaviors among participants of an employee wellness program. <em>Preventive Medicine Reports</em>, 2, 292–299. https://doi.org/10.1016/j.pmedr.2015.04.002',
		'Hysing, M., Pallesen, S., Stormark, K. M., Jakobsen, R., Lundervold, A. J., & Sivertsen, B. (2015). Sleep and use of electronic devices in adolescence: Results from a large population-based study. <em>BMJ Open</em>, 5(1), e006748. https://doi.org/10.1136/bmjopen-2014-006748',
		'Lang, I.-M., Fischer, A. L., Antonakos, C. L., Miller, S. S., Hasson, R. E., Pate, R. R., Collie-Akers, V. L., & Colabianchi, N. (2024). Neighborhood environments underpin screen time intervention success in children: Evidence from a study of greenspace and community programming across 130 US communities. <em>Health & Place</em>, 89, 103341. https://doi.org/10.1016/j.healthplace.2024.103341',
		'Lemola, S., Perkinson-Gloor, N., Brand, S., Dewald-Kaufmann, J. F., & Grob, A. (2015). Adolescents\' electronic media use at night, sleep disturbance, and depressive symptoms in the smartphone age. <em>Journal of Youth and Adolescence</em>, 44(2), 405–418. https://doi.org/10.1007/s10964-014-0176-x',
		'Logan, A., & Schneider, D. (2024). Parental exposure to work schedule instability and child sleep quality. <em>Work, Employment and Society</em>, 39(1). https://doi.org/10.1177/09500170241235863',
		'Lubans, D. R., Smith, J. J., Plotnikoff, R. C., Dally, K. A., Okely, A. D., Salmon, J., & Morgan, P. J. (2016). Assessing the sustained impact of a school-based obesity prevention program for adolescent boys: The ATLAS cluster randomized controlled trial. <em>International Journal of Behavioral Nutrition and Physical Activity</em>, 13, 92. https://doi.org/10.1186/s12966-016-0420-8',
		'MacKenzie, M. D., Scott, H., Reid, K., & Gardani, M. (2022). Adolescent perspectives of bedtime social media use: A qualitative systematic review and thematic synthesis. <em>Sleep Medicine Reviews</em>, 63, 101626. https://doi.org/10.1016/j.smrv.2022.101626',
		'Menezes, M. C. de, Mendonça, R. de D., Ferreira, N. L., Guimarães, L. M. F., & Lopes, A. C. S. (2018). Promoting fruit and vegetable consumption: Methodological protocol of a randomized controlled community trial. <em>Contemporary Clinical Trials Communications</em>, 10, 131–136. https://doi.org/10.1016/j.conctc.2018.04.003',
		'Mintel. (2024). Activities of teens and tweens – US – 2024 [Market research report]. Mintel. https://clients.mintel.com/content/report/activities-of-teens-and-tweens-us-2024',
		'Mireku, M. O., Barker, M. M., Mutz, J., Dumontheil, I., Thomas, M. S. C., Röösli, M., Elliott, P., & Toledano, M. B. (2019). Night-time screen-based media device use and adolescents\' sleep and health-related quality of life. <em>Environment International</em>, 124, 66–78. https://doi.org/10.1016/j.envint.2018.11.069',
		'Mitchell, M. E., & Nugiel, T. (2024). Puberty interacts with sleep and brain network organization to predict mental health. <em>Frontiers in Human Neuroscience</em>, 18, 1379945. https://doi.org/10.3389/fnhum.2024.1379945',
		'Musshafen, L. A., Tyrone, R. S., Abdelaziz, A., Sims-Gomillia, C. E., Pongetti, L. S., Teng, F., Fletcher, L. M., & Reneker, J. C. (2021). Associations between sleep and academic performance in US adolescents: A systematic review and meta-analysis. <em>Sleep Medicine</em>, 83, 130–140. https://doi.org/10.1016/j.sleep.2021.04.015',
		'MY SCHOOL DC. (2025). Hardy Middle School | my school DC. https://www.myschooldc.org/schools/profile/40',
		'Nagare, R., Plitnick, B., & Figueiro, M. (2018). Effect of exposure duration and light spectra on nighttime melatonin suppression in adolescents and adults. <em>Lighting Research & Technology</em>, 51(4), 530–543. https://doi.org/10.1177/1477153518763003',
		'Nagare, R., Rea, M. S., Plitnick, B., & Figueiro, M. G. (2019). Nocturnal melatonin suppression for adolescents and adults exposed to different levels, spectra, and durations of light. <em>Journal of Biological Rhythms</em>, 34(2), 178–194. https://doi.org/10.1177/0748730419828056',
		'Nagata, J. M., Cheng, C. M., Shim, J., Kiss, O., Ganson, K. T., Testa, A., He, J., & Baker, F. C. (2024). Bedtime screen use behaviors and sleep outcomes in early adolescents: A prospective cohort study. <em>Journal of Adolescent Health</em>, 75(4). https://doi.org/10.1016/j.jadohealth.2024.06.006',
		'Nagata, J. M., Singh, G., Yang, J. H., Smith, N., Kiss, O., Ganson, K. T., Testa, A., Jackson, D. B., & Baker, F. C. (2023). Bedtime screen use behaviors and sleep outcomes: Findings from the Adolescent Brain Cognitive Development (ABCD) Study. <em>Sleep Health</em>, 9(4), 420–427. https://doi.org/10.1016/j.sleh.2023.02.005',
		'Nakabayashi, J., Melo, G. R., & Toral, N. (2020). Transtheoretical Model-based nutritional interventions in adolescents: A systematic review. <em>BMC Public Health</em>, 20, 1544. https://doi.org/10.1186/s12889-020-09643-z',
		'Noroozi, A., Mondanizadee, R., & Tahmasebi, R. (2024). Effect of educational intervention on reducing mobile phone addiction: Application of Transtheoretical Model. <em>International Journal of Psychiatry and Behavioral Sciences</em>, 18(2). https://doi.org/10.5812/ijpbs-143215',
		'Parker, C. (2014, March 10). More than two hours of homework may be counterproductive, research suggests. Stanford Graduate School of Education. https://ed.stanford.edu/news/more-two-hours-homework-may-be-counterproductive-research-suggests',
		'Pew Research Center. (2024). Teens, social media and technology 2024. https://www.pewresearch.org/internet/2024/12/12/teens-social-media-and-technology-2024/',
		'Pew Research Center, & MarketingCharts. (January 25, 2024). Percentage of teenagers in the United States who have access to a smartphone at home as of October 2023, by age group [Graph]. In Statista. Retrieved September 22, 2025, from https://www-statista-com.proxy1.library.jhu.edu/statistics/476050/usage-of-smartphone-teens-age/',
		'Pillion, M., Gradisar, M., Bartel, K., Whittall, H., Mikulcic, J., Daniels, A., Rullo, B., & Kahn, M. (2022). Wi-Fi off, devices out: Do parent-set technology rules play a role in adolescent sleep? <em>Sleep Medicine: X</em>, 4, 100046. https://doi.org/10.1016/j.sleepx.2022.100046',
		'Prochaska, J. O., Redding, C. A., & Evers, K. E. (2015). The transtheoretical model and stages of change. In K. Glanz, B. K. Rimer, & K. Viswanath (Eds.), <em>Health behavior: Theory, research, and practice</em> (5th ed., pp. 125–148). Jossey-Bass. https://ares.library.jhu.edu/shib/ares.dll?Action=10&Type=10&Value=1453495',
		'Robb, M. B. (2019). The new normal: Parents, teens, screens, and sleep in the United States. Common Sense Media. https://www.commonsensemedia.org/sites/default/files/research/report/2019-new-normal-parents-teens-screens-and-sleep-united-states-report.pdf',
		'Sanjeev, R., Krishnan, B., & Latti, R. (2020). Quality of sleep among bedtime smartphone users. <em>International Journal of Preventive Medicine</em>, 11(1), 114. https://doi.org/10.4103/ijpvm.ijpvm_266_19',
		'Scott, H., & Woods, H. C. (2018). Fear of missing out and sleep: Cognitive behavioural factors in adolescents\' nighttime social media use. <em>Journal of Adolescence</em>, 68, 61–65. https://doi.org/10.1016/j.adolescence.2018.07.009',
		'Smith, J. J., Morgan, P. J., Plotnikoff, R. C., Dally, K. A., Salmon, J., Okely, A. D., Finn, T. L., Babic, M. J., Skinner, G., & Lubans, D. R. (2014). Rationale and study protocol for the "Active Teen Leaders Avoiding Screen-time" (ATLAS) group randomized controlled trial: An obesity prevention intervention for adolescent boys from schools in low-income communities. <em>Contemporary Clinical Trials</em>, 37(1), 106–119. https://doi.org/10.1016/j.cct.2013.11.008',
		'Tija Ragelienė. (2016). Links of adolescents\' identity development and relationship with peers: A systematic literature review. <em>Social Inquiry into Well-Being</em>, 2(2), 97–119. https://pmc.ncbi.nlm.nih.gov/articles/PMC4879949/',
		'Troxel, W. M., Hunter, G., & Scharf, D. (2015). Say "GDNT": Frequency of adolescent texting at night. <em>Sleep Health</em>, 1(4), 300–303. https://doi.org/10.1016/j.sleh.2015.09.006',
		'Velicer, W. F., Redding, C. A., Paiva, A. L., Mauriello, L. M., Blissmer, B., Oatley, K., Meier, K. S., Babbin, S. F., McGee, H., Prochaska, J. O., Burditt, C., & Fernandez, A. C. (2013). Multiple behavior interventions to prevent substance abuse and increase energy balance behaviors in middle school students. <em>Translational Behavioral Medicine</em>, 3(1), 82–93. https://doi.org/10.1007/s13142-013-0197-0',
		'Xie, C., Zhang, Z., Zhang, X., Li, Y., Shi, P., & Wang, S. (2025). Effects of interventions on physical activity behavior change in children and adolescents based on a trans-theoretical model: a systematic review. <em>BMC public health</em>, 25(1), 657. https://doi.org/10.1186/s12889-025-21336-z',
		'Xu, J. (2021). Factors affecting adolescents\' screen viewing duration: A social cognitive approach based on the Family Life, Activity, Sun, Health and Eating (FLASHE) survey. <em>Journal of Health Communication</em>, 26(1), 19–27. https://doi.org/10.1080/10810730.2021.1887979',
		'Zare, F., Aghamolaei, T., Zare, M., & Ghanbarnejad, A. (2016). The effect of educational intervention based on the Transtheoretical Model on stages of change of physical activity in a sample of employees in Iran. <em>Health Scope</em>, 5(2), e24345. https://doi.org/10.17795/jhealthscope-24345'
	]

	return `<div class="text-sm space-y-3">${references.map(ref => `<p class="mb-2">${convertUrlsToLinks(ref)}</p>`).join('')}</div>`
}

function findIndexByKeys(sections: Section[], keys: string[]): number {
	const nkeys = keys.map(norm)
	for (let i = 0; i < sections.length; i++) {
		const t = norm(sections[i].title)
		if (nkeys.some(k => t.includes(k) || k.includes(t))) return i
	}
	return -1
}

async function listDocx(dir: string) {
	try {
		const entries = await fs.readdir(dir)
		return entries.filter(f => f.toLowerCase().endsWith('.docx'))
	} catch {
		return []
	}
}

function escapeHtml(text: string) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}

function textToHtml(text: string) {
	const safe = escapeHtml(text)
	return safe
		.split(/\n\s*\n+/)
		.map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`) 
		.join('\n')
}

async function convertWithMammoth(filePath: string) {
	try {
		const buf = await fs.readFile(filePath)
		const mammothMod: any = await import('mammoth')
		const mammothLib: any = mammothMod?.default ?? mammothMod
		const styleMap = [
			"p[style-name='Title'] => h1:fresh",
			"p[style-name='Heading 1'] => h2:fresh",
			"p[style-name='Heading 2'] => h3:fresh",
			"p[style-name='Heading 3'] => h3:fresh",
			"p[style-name='标题'] => h1:fresh",
			"p[style-name='标题 1'] => h2:fresh",
			"p[style-name='标题1'] => h2:fresh",
			"p[style-name='标题 2'] => h3:fresh",
			"p[style-name='标题2'] => h3:fresh",
			"p[style-name='标题 3'] => h3:fresh",
			"p[style-name='标题3'] => h3:fresh",
			"p[style-name='t1'] => h2:fresh",
			"p[style-name='T1'] => h2:fresh",
			"p[style-name='t 1'] => h2:fresh",
			"p[style-name='T 1'] => h2:fresh",
			"p[style-name='t2'] => h3:fresh",
			"p[style-name='T2'] => h3:fresh",
			"p[style-name='t 2'] => h3:fresh",
			"p[style-name='T 2'] => h3:fresh",
			"p[style-name='t3'] => h3:fresh",
			"p[style-name='T3'] => h3:fresh",
			"p[style-name='t 3'] => h3:fresh",
			"p[style-name='T 3'] => h3:fresh"
		]
		const result = await mammothLib.convertToHtml({ buffer: buf }, { styleMap })
		const raw = await mammothLib.extractRawText({ buffer: buf })
		return { ok: true as const, html: result.value, raw: raw.value as string }
	} catch (e: any) {
		return { ok: false as const, error: String(e?.stack || e?.message || e) }
	}
}

async function loadDocx() {
	const cwd = process.cwd()
	const candidates: string[] = []
	const locations = [
		path.join(cwd, 'sources'),
		path.join(cwd, 'content'),
		cwd
	]
	for (const loc of locations) {
		try {
			const docs = await listDocx(loc)
			for (const d of docs) candidates.push(path.join(loc, d))
		} catch {}
	}
	const tryOrder = [
		candidates.find(p => path.basename(p).toLowerCase() === 'behavior change final plan.docx'),
		...candidates
	].filter(Boolean) as string[]
	for (const p of tryOrder) {
		const res: any = await convertWithMammoth(p)
		if (res.ok) return res
	}
	return { ok: false as const, error: 'not found' }
}

function segmentRawByTitles(raw: string, titles: { id: string; label: string }[]) {
	const lines = raw.split(/\r?\n/)
	const idxMap: Record<string, number> = {}
	for (let i = 0; i < lines.length; i++) {
		const ln = lines[i].trim()
		for (const t of titles) {
			if (ln.toLowerCase() === t.label.toLowerCase()) {
				if (!(t.id in idxMap)) idxMap[t.id] = i
			}
		}
	}
	const grouped: Section[] = []
	for (let i = 0; i < titles.length; i++) {
		const cur = titles[i]
		const start = idxMap[cur.id]
		if (start === undefined) {
			grouped.push({ id: cur.id, title: cur.label, html: '<p>—</p>' })
			continue
		}
		let end = lines.length
		for (let j = i + 1; j < titles.length; j++) {
			const nxt = idxMap[titles[j].id]
			if (nxt !== undefined && nxt > start) { end = Math.min(end, nxt) }
		}
		const content = lines.slice(start + 1, end).join('\n').trim()
		grouped.push({ id: cur.id, title: cur.label, html: textToHtml(content) || '<p>—</p>' })
	}
	return grouped
}

const problemDefinitionContent = `
<p class="mb-4">When night falls, you finally sink into bed and pick up a screen "just for a minute." You scroll through social media, reply to a few messages, watch an episode of a show, or queue up one more round of a game. The room is dark, the screen is bright, and time feels like it belongs only to you.</p>

<p class="mb-4">This scene is so familiar... For many people, late-night in-bed screen use has quietly become part of the bedtime routine. Yet this ordinary habit can strongly shape how well we sleep, how we feel, and how we function the next day.</p>

<p class="mt-8 mb-5"><strong><em class="text-ink">Target Behavior: In-Bed Screen Use</em></strong></p>

<p class="mb-4">This nighttime in-bed screen use, defined as engaging with phones, tablets, consoles, or TVs while in bed before or at bedtime, or during the sleep period, is the target behavior in this campaign (Nagata et al., 2024).</p>

<p class="mb-4">Emerging evidence indicates that in-bed screen time predicts later sleep onset, shorter sleep duration, and poorer sleep quality, especially with interactive uses such as texting, gaming, and social media (Hale & Guan, 2015; Sanjeev et al., 2020). For example, a 2024 study showed that each additional 10 minutes of in-bed screen time was linked to an approximately 10-minute delay in sleep onset and a measurable loss of total sleep duration that night (Brosnan et al., 2024). Beyond direct time displacement, in-bed screen use can disrupt the sleep–wake cycle through psychophysiological arousal from engaging with content and anticipating social responses, screen light suppressing melatonin production, and nocturnal notifications that fragment sleep (Chang et al., 2015; Nagata et al., 2023; Scott & Woods, 2018).</p>

<p class="mt-8 mb-5"><strong><em class="text-ink">Scope of the Problem and Affected Population</em></strong></p>

<p class="mb-4">This campaign specifically targets U.S. early adolescents, as they are among the populations most affected by using screens in bed. This focus is based on research showing their high rates of digital device ownership and significant use of screens during typical sleeping hours.</p>

<p class="mb-4">In detail, by 2021, about half of children and early adolescents in the U.S. reported having their own digital devices, and by 2023, mobile phone ownership among 13–14-year-olds had reached 92% (Common Sense Media, 2022; Pew Research Center & MarketingCharts, 2024). A 2019 study reported that over half of teens brought their devices into bed, 29% actually slept with them, and 36% were awakened by notifications during the night—figures that have likely increased along with device ownership (Robb, 2019).</p>

<p class="mt-8 mb-5"><strong><em class="text-ink">Why This Behavior Is Problematic</em></strong></p>

<p class="mb-4">Screen use in bed is problematic because it significantly disrupts sleep, while poor sleep, in turn, can lead to a range of other health and everyday life issues.</p>

<p class="mb-4">Numerous studies of early adolescents have shown that screen use around bedtime is associated with reduced sleep quality, shorter sleep duration, and greater difficulty falling asleep (Fuller et al., 2017; Hysing et al., 2015; Lemola et al., 2015; Mireku et al., 2019). A recent longitudinal study, in particular, focused on U.S. early adolescents and provided further evidence for the prospective relationship between their in-bed screen use and these sleep problems (Nagata et al., 2024). Other issues stemming from sleep problems, such as depression, emotional dysregulation, obesity, poor academic and cognitive performance, and a higher risk of accidental injury, have also been well-researched in this population (Cappuccio et al., 2008; CDC, 2024; Musshafen et al., 2021).</p>

<p class="mb-4">In addition to sleep issues and their resulting consequences, the physical postures often adopted while using screens in bed, such as side-lying, supine, or prone positions in low light, can cause additional harm to the eyes and increase the burden on the shoulders and neck, adding another layer of health risk (Ahn et al., 2021; Alim-Marvasti et al., 2016).</p>

<p class="mt-8 mb-5"><strong><em class="text-ink">Why Early Adolescents Are Especially Vulnerable</em></strong></p>

<p class="mb-4">Early adolescence is a developmental period in which the prefrontal cortex and endocrine systems are rapidly maturing to support emotion regulation, cognition, and physical growth. Research suggests that stable and sufficient sleep is essential for healthy development in these domains (Anastasiades et al., 2022; Mitchell & Nugiel, 2024). Laboratory studies also show that early adolescents are particularly sensitive to evening, blue-enriched light even at low to moderate brightness—conditions that closely resemble typical in-bed screen use at night (Crowley et al., 2015; Nagare et al., 2018; Nagare et al., 2019). These factors make nighttime in-bed screen use especially disruptive for this age group.</p>

<p class="mb-4">Taken together, existing evidence shows that nighttime in-bed screen use is a clearly defined and highly prevalent behavior among U.S. early adolescents. It is strongly associated with later bedtimes, shorter and poorer-quality sleep, and a wide range of downstream health problems. This makes in-bed screen use a critical and appropriate target for health communication and behavior change interventions in this population.</p>
`

const keyConsiderationsContent = `
<p class="mb-5"><strong><em class="text-ink">Barriers and Broader Issues</em></strong></p>

<p class="mb-4">Early adolescents' in-bed screen use is driven by a series of environmental, individual, social, and structural factors. The sleeping environment is the most direct influence. Having devices in the bedroom, bringing phones into bed, and keeping notifications on are consistently associated with greater in-bed screen exposure, nighttime awakenings, repeated checking, and poorer sleep among early adolescents (Gradisar et al., 2013; Nagata et al., 2023). In addition, the digital content environment, with its readily available resources and persuasive features like algorithmic feeds, infinite scrolling, and variable rewards, can overstimulate the mind at bedtime and lead to prolonged, addictive screen use (Accountable Tech & LOG OFF, 2023; Dresp-Langley & Hutt, 2022).</p>

<p class="mb-4">On an individual level, an eagerness for social connection and a fear of missing out (FOMO) create a perceived need to stay connected around bedtime (Scott & Woods, 2018). Additionally, bedtime procrastination often normalizes the use of screens as a way to relax and entertain after a busy day, or as a distraction from difficult emotions during the sleep-onset period (Daniels et al., 2022; Bozkurt et al., 2024). Furthermore, a lack of awareness regarding the negative consequences and a potential third-person effect may lead individuals to believe they have more control over their screen use, thereby neglecting the issue themselves (Common Sense Media, 2022; MacKenzie et al., 2022; Mintel, 2024; Pillion et al., 2022)</p>

<p class="mb-4">At the social level, family and peer dynamics can influence in-bed device use, including the existence and adherence to family technology rules and the screen usage habits of parents, siblings, and friends (Feinberg et al., 2011; Hale et al., 2018; Pillion et al., 2022; Troxel et al., 2015).</p>

<p class="mb-4">Finally, upstream economic and structural factors may include the limited free time and psychological stress from schoolwork and extracurriculars, the discrepancy between parents' work schedules and available supervision, and a lack of outdoor recreational spaces and facilities (Lang et al., 2024; Logan & Schneider, 2024; Parker, 2014). These factors, in turn, increase the likelihood of in-bed screen exposure among U.S. early adolescents.</p>

<p class="mb-4 mt-8"><strong><em class="text-ink">Enablers</em></strong></p>

<p class="mb-4">The same factors also create leverage points for change. For example, since family dynamics matter, setting clear household rules about technology, even if they are not perfectly followed, is linked to better sleep and less nighttime screen use in teens (Bowers & Moyer, 2019). This also suggests that having clear expectations on its own can be a powerful enabler.</p>

<p class="mb-4">School-based interventions are another key opportunity. When behavior-change activities are built into regular classes, teachers can guide the process, and students can watch and learn from each other, turning peer influence into a positive resource.</p>

<p class="mb-4">From a theoretical perspective, well-established behavior-change theories, especially <a href="/sct" class="text-purple-400 hover:text-purple-600 hover:underline">Social Cognitive Theory (SCT)</a> and the <a href="/ttm" class="text-purple-400 hover:text-purple-600 hover:underline">Transtheoretical Model (TTM)</a>, help identify the most effective leverage points. These models have been widely used in health interventions focused on adolescent screen use and sleep. The examples above just reflect core elements of SCT: environmental influences, outcome expectations, peer norms, modeling, and observational learning.</p>

<p class="mb-4">In this campaign, SCT and the TTM are fully integrated into the design of the intervention programs and messages, and I will elaborate below on how they operate within the specific campaign components.</p>
`

const campaignStrategyContent = `
<p class="mb-4">The campaign begins in schools and uses coordinated activities to involve families. The goal is to extend behavior changes related to in-bed screen use into the students' real homes and daily lives.</p>

<p class="mb-4">Based on the principles of autonomy, openness, and equality, the campaign strictly avoids any experimental manipulation, pressure, exclusion, or stigmatization of students who choose not to participate.</p>

<p class="mb-4">The campaign consists of two stages of activities. Its effectiveness is measured by pre- and post-activity <a href="/survey" class="text-purple-400 hover:text-purple-600 hover:underline">surveys</a> that evaluate changes in students' stages of change regarding in-bed screen use behavior.</p>

<p class="mb-4 mt-8"><strong><em class="text-ink">Stage 1: Class-Based Workshop and Parents-Oriented Webinar</em></strong></p>

<p class="mb-5"><strong><em class="text-ink">Workshop</em></strong></p>

<p class="mb-4">The workshop will be an opportunity for well-trained educators leading a conversation around screen use in bed among the early adolescents.</p>

<p class="mb-4">The speaker will deliver information across different stages, based on the results of a pre-intervention survey. This approach is supported not only by the TTM, which posits that individuals in different stages of change have different mindsets, motivations, and barriers, making it necessary to craft messages that address their specific problems, but also by relevant empirical research (Noroozi et al., 2024; Prochaska et al., 2015; Velicer et al., 2013). For example, studies by Velicer et al. (2013) and Noroozi at al. (2024) on screen use control among early adolescents customized messages for participants at different stages of change and demonstrated effective outcomes.</p>

<p class="mb-4">However, in this campaign, the TTM will not be used for deliberate segmenting or gatekeeping. In other words, participants will not be staged and then assigned to different or separate sessions, nor will anyone be selected in or out of the program on that basis. Instead, different messages will be prepared and delivered to adolescents within the same shared sessions. Although students at different stages of change are not equally likely to benefit from the intervention, this approach is chosen because the campaign is a whole-school initiative rather than a tightly controlled experiment. It (1) avoids direct labeling, which could be stigmatizing in a visible school setting, (2) is practical to deliver when thousands of students and parents are involved, and (3) more closely reflects real-world public interventions, where it is usually not possible to deliver and enforce highly selective information only to specific subgroups.</p>

<p class="mb-4">Additionally, SCT is thoroughly woven into strategy and message design, not only for this first stage but across the entire campaign. Research from Bickham et al. (2018), Bowers and Moyer (2019), Lubans et al. (2016), and Smith et al. (2014) has proven SCT can offer a relatively comprehensive perspective and various constructs to guide effective school- and family-based interventions that are relevant to early adolescents' in-bed screen use. In detail, this includes a whole list of SCT's personal, environmental, and behavioral elements and their reciprocal interplay, such as self-efficacy, self-regulation, self-monitoring, goal setting, outcome expectations, observational learning, peer norms, parenting style, family rules, media susceptibility, and physical activity (Arundell et al., 2020; Bickham et al., 2018; Bowers & Moyer, 2019; Conner & Norman, 2015; Lubans et al., 2016; Xu, 2021).</p>

<p class="mb-5 mt-6"><strong><em class="text-ink">Sample Messages for the Workshop</em></strong></p>

<p class="mb-4"><em class="text-indigo-600">"We all use our phones in different ways at night. Some feel fine, some feel stuck. Today is just a chill space to talk and share and see what might help you feel better."</em></p>

<p class="mb-4">This message is designed for teens in the Precontemplation stage (assuming survey results indicate that such students exist). Precontemplation is the first stage in TTM's stages of change, where people do not intend to change, and may even resist it, in the near term (typically defined as within the next six months) (Conner & Norman, 2015). The reason behind this indifference or reluctance could be a lack of understanding of the consequences or frustration from repeated failures (Conner & Norman, 2015). This message, therefore, aims to comfort them and lower their defensiveness about reading, talking, or thinking about the behavior. It is positioned as nonjudgmental, open, and respectful of individual differences, and avoids pressuring them to take immediate action.</p>

<p class="mb-4"><em class="text-indigo-600">"When you put your phone and other screens away before you go to sleep, you usually fall asleep faster, sleep better, feel less grumpy, and feel more awake in class the next day."</em></p>

<p class="mb-4">This message presents research-backed facts that demonstrate the benefits of eliminating screen use in bed before sleep (Mireku et al., 2019; Mitchell & Nugiel, 2024)</p>

<p class="mb-4">It primarily builds outcome expectations within the SCT framework (Conner & Norman, 2015). Outcome expectations have been shown in practical research to be one of the key constructs that can effectively reduce digital use among children aged around 12, a demographic close to the target audience for this campaign (Bickham et al., 2018).</p>

<p class="mb-4">Furthermore, the message is effective for teens in both the Precontemplation and Contemplation stages of the TTM, since the former requires facts to trigger awareness of the need for change and the latter needs stronger perceived consequences to shift the decisional balance (Prochaska et al., 2015).</p>

<p class="mb-4"><em class="text-indigo-600">"You can start with one small, funny way you like. For example, you can make a cozy 'phone parking spot' where your devices go to sleep, or agree with friends to save chats and games for tomorrow morning. After a few nights, see if your sleep, mood, and focus level up."</em></p>

<p class="mb-4">This message provides practical tips for behavior change, mainly targeting those in the Preparation stage (Prochaska et al., 2015). It is also developed following the key structure and constructs of SCT, including the effects of environment (the idea of "phone parking spot" that restructures the environment), self-efficacy (encouraging students to explore their own favorable ways of change), social support/norms (agree to support each other with peers), and outcome expectations (an expected improved sleep, mood, and focus) (Conner & Norman, 2015).</p>

<p class="mb-5 mt-6"><strong><em class="text-ink">Webinar</em></strong></p>

<p class="mb-4">The webinar will be held in parallel with the workshop, but it is targeted toward parents of teens. It will focus on the theme of how they can improve their kids' sleep, health, social, and study quality, (and even their own). All parents will receive the invitation for the webinar and the recap material in case they are unable to attend.</p>

<p class="mb-5 mt-6"><strong><em class="text-ink">Sample Messages for the Webinar</em></strong></p>

<p class="mb-4"><em class="text-indigo-600">"Research shows that kids fall asleep earlier and sleep longer when families have rules about screens at night. Even just having a rule can help, even if it isn't followed perfectly every day. Kids often copy how their parents use phones and tablets, so even small rules you agree on can make a difference.</em></p>

<p class="mb-4"><em class="text-indigo-600">You can start by agreeing on one thing at home, like where phones charge at night, or 'audio only, no screens in our hands after we get into bed.'</em></p>

<p class="mb-4"><em class="text-indigo-600">We've prepared a short "family bedtime screen rule" <a href="/template" class="text-purple-500 hover:text-purple-700 hover:underline">template</a> that you can fill out together with your child."</em></p>

<p class="mb-4">This message also draws on SCT in several ways. First, it targets the environmental and social context of behavior. Research on adolescent sleep demonstrates that family rules about technology are linked to children having earlier bedtimes and more total sleep time (Bowers & Moyer, 2019). While full compliance is associated with the best results, the mere presence of a rule also helps (Bowers & Moyer, 2019).</p>

<p class="mb-4">Second, the message highlights that children often copy their parents' screen habits, which aligns with SCT's emphasis on observational learning and modeling. This statement is supported by a study from Arundell et al. (2020), which examined the screen time behaviors of 542 parent-child pairs (children aged 9–14). The researchers found that parents and their children exhibited similar patterns of screen usage, regardless of the purpose, device, or frequency of use.</p>

<p class="mb-6">Third, the message promotes collaborative goal setting and self-regulation by inviting parents and children to co-complete a family bedtime screen rule using a provided <a href="/template" class="text-purple-400 hover:text-purple-600 hover:underline">template</a>. This action also supports a sense of collective efficacy, all of which are key concepts addressed by SCT.</p>

<p class="mb-4"><em class="text-indigo-600">"I completely understand that many of you struggle with your own digital devices at night…I have, too. That's why I will never simply say 'be a role model' and leave it at that.</em></p>

<p class="mb-4"><em class="text-indigo-600">In this webinar, I want to walk you through three simple, hand-picked tools that I have personally tried and selected from the most popular ones available. All of them are designed to help you separate the 'useful' features of your phone from the temptation of endless scrolling. They can help you and your child enjoy an effortlessly calm, restful, and sweet night.</em></p>

<p class="mb-4 pl-6"><em class="text-indigo-600">• A Sleep-Tracking Watch or Band: This device records your sleep and uses a gentle alarm. You'll wake up on time and clearly see your sleep patterns improve.</em></p>

<p class="mb-4 pl-6"><em class="text-indigo-600">Example: <a href="https://join.whoop.com/us/en/?irclickid=T0rw5tQkdxycTn30t-QkHSGoUkpTW43QeQ89UM0&irgwc=1&afsrc=1" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline">https://join.whoop.com/us/en/?irclickid=T0rw5tQkdxycTn30t-QkHSGoUkpTW43QeQ89UM0&irgwc=1&afsrc=1</a></em></p>

<p class="mb-4 pl-6"><em class="text-indigo-600">• A Bluetooth Alarm Clock: This clock plays your alarm and calming music from a phone placed in another room. This way, you get the sound and comfort without the screen in bed.</em></p>

<p class="mb-4 pl-6"><em class="text-indigo-600">Example: <a href="https://ihome.com/collections/bluetooth-alarm-clock?srsltid=AfmBOoqE2E07JHKqivTyYZzsXv5upydTT1MuqZqJy9KIyKq1ighezMBZ&" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline">https://ihome.com/collections/bluetooth-alarm-clock?srsltid=AfmBOoqE2E07JHKqivTyYZzsXv5upydTT1MuqZqJy9KIyKq1ighezMBZ&</a></em></p>

<p class="mb-4 pl-6"><em class="text-indigo-600">• A Large, Timed Lock Box: This box has small holes for charging cables. Everyone can put their devices inside at an agreed-upon time.</em></p>

<p class="mb-4 pl-6"><em class="text-indigo-600">Example: <a href="https://lockabox.com/lockable-storage-box/lockable-phone-box/" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline">https://lockabox.com/lockable-storage-box/lockable-phone-box/</a>"</em></p>

<p class="mb-4">This message builds on the previous one's emphasis on how the environment, parenting, norms, and modeling can influence a child's behavior.</p>

<p class="mb-4">However, by acknowledging shared struggles and by providing concrete, practical methods, it also serves to maintain the parents' sense of self-efficacy for change, which is a core construct in SCT.</p>

<p class="mb-4">The three specific tools essentially restructure the physical environment. They also incorporate SCT concepts of self-regulation and self-monitoring. Additionally, they address and replace some needs that might be lost by taking away a digital device, thus managing the parents' (and children's) outcome expectations.</p>

<p class="mb-4 mt-8"><strong><em class="text-ink">Stage 2: "Sleep Mode" 3-Day Challenge & 21-Day Challenge</em></strong></p>

<p class="mb-4">If we consider that Stage 1 is more focused on the initial phases of behavior change by triggering attention, awareness, and consideration, then Stage 2 is mainly designed to guide people through the subsequent stages toward early action and habit formation.</p>

<p class="mb-4">This stage itself utilizes a progressive structure, from a 3-day challenge to a 21-day challenge, to reflect the real progression of behavior change as described by the TTM.</p>

<p class="mb-4 pl-6">• The initial 3-day challenge provides a low-threshold opportunity, particularly for adolescents in the Contemplation or Preparation stages. It allows them to try three nights of keeping screens out of bed, compare how they feel in the morning, and build initial confidence without committing to a persistent, demanding change.</p>

<p class="mb-4 pl-6">• The subsequent 21-day challenge then supports progression from earlier stages into Action and even Maintenance. Notably, the completion criteria (logging all 21 nights and adhering to the rule for at least 15) match TTM's idea that action requires consistency but that setbacks are expected as a normal part of the behavior change process (Prochaska et al., 2015).</p>

<p class="mb-4">To participate, students can voluntarily sign up for the challenges. After signing up, they will receive special activity materials, record their progress and feelings as required, and finally win a prize upon successful completion of the challenge. The following table details the mechanisms of the two challenges:</p>

<div class="overflow-x-auto mt-6 mb-6">
<table class="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
<thead>
<tr class="bg-softLavender">
<th class="border border-gray-200 px-4 py-3 text-left font-semibold text-ink"></th>
<th class="border border-gray-200 px-4 py-3 text-left font-semibold text-ink">3-Day Challenge</th>
<th class="border border-gray-200 px-4 py-3 text-left font-semibold text-ink">21-Day Challenge</th>
</tr>
</thead>
<tbody class="text-sm">
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Timing</td>
<td class="border border-gray-200 px-4 py-3">Held in week 2 of the campaign, on three consecutive nights.</td>
<td class="border border-gray-200 px-4 py-3">Starts after the 3-day challenge and runs for 21 consecutive nights.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Materials & Content</td>
<td class="border border-gray-200 px-4 py-3">Each student who signs up receives a set of Sleep Mode 3-Day Challenge Cards. Each morning after a challenge night, they tick or fill in the card with:<br/><br/>
• Did I bring a screen into my bed before falling asleep tonight?<br/>
• What did I do instead?<br/>
• About what time did I try to sleep?<br/>
• This morning I feel…<br/>
• One thing that made it easier or harder tonight was…</td>
<td class="border border-gray-200 px-4 py-3">Students who sign up receive a Sleep Mode 21-Day Sleep Log booklet. The first three pages are a 21-night calendar (one line per night), and each line repeats the same five Rest Mode daily items as the 3-day card. The remaining pages are blank for students who want to keep using the log after the formal 21-day challenge ends.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Participation</td>
<td class="border border-gray-200 px-4 py-3">Open to all students who want to sign up. Short sharing sessions are held on each challenge day.</td>
<td class="border border-gray-200 px-4 py-3">Open to all students who want to sign up. Short sharing sessions are held at the end of each 7-day block.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Completion & Incentives</td>
<td class="border border-gray-200 px-4 py-3">Any student who hands in a fully completed 3-day card receives stickers and a notebook as a reward. Total success every night is not required. The focus is on trying and honestly tracking their own behavior.</td>
<td class="border border-gray-200 px-4 py-3">A student is considered to have completed the challenge if:<br/><br/>
• Their booklet shows entries for all 21 nights, and<br/>
• On at least 15 out of 21 nights, they mark that they did not use screens in bed (or only checked very briefly and then stopped).<br/><br/>
Students who meet this standard receive a large canvas goodie bag with attractive school- or activity-branded items such as a badge, hat, pen, notebook, mascot toy, and some snacks.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Bonus</td>
<td class="border border-gray-200 px-4 py-3">Not applicable.</td>
<td class="border border-gray-200 px-4 py-3">Students who complete the 21-day challenge can choose to go one step further and create a small media piece about their experience, such as:<br/><br/>
• a 1–2 minute short video<br/>
• a simple comic strip or storyboard<br/>
• a short narrative<br/><br/>
Every student who submits a creative piece, and meets the 21-day completion criteria, is entered into a prize draw for a few larger prizes, including AirPods 4 and Apple Watch 11.</td>
</tr>
</tbody>
</table>
</div>

<p class="mb-5 mt-6"><strong><em class="text-ink">Sample Messages for Both Challenges</em></strong></p>

<p class="mb-4"><em class="text-indigo-600">"You can try the 3-day screen-free-in-bed test drive. Log your nights, then share your best trick to cheer on your friends."</em></p>

<p class="mb-4"><em class="text-indigo-600">"Let's take this mini in-bed screen-free-in-bed challenge! Earn cool stuff just for giving it a try – and the real win? Waking up the next morning feeling like a nap wrapped in a smoothie."</em></p>

<p class="mb-4"><em class="text-indigo-600">"Same rule, longer run. Tell your story and enter the big prize draw!"</em></p>

<p class="mb-4"><em class="text-indigo-600">"You think you're missing out on a late-night chat or a post? Wrong! You're actually missing out on the chance to win the Apple Watch 11! All your friends are tackling the 21-day screen-free-in-bed challenge to get entered into the draw. Don't let them win without you! Join the long run and go for the gold!"</em></p>

<p class="mb-4"><em class="text-indigo-600">"Check your progress! The 21-day challenge has sharing sessions at the end of each 7-day block. Come celebrate your success, get tips from friends, and stay motivated for that grand prize bag!"</em></p>

<p class="mb-4">The design of the challenges and messaging is grounded in SCT, specifically targeting key constructs such as self-efficacy, goal setting, self-monitoring, self-regulation, reinforcement, peer norms, and modeling (Bandura, 2002a, 2002b; Conner & Norman, 2015).</p>

<p class="mb-4">First, the 3-day and 21-day challenges provide teens with a clear, time-limited goal, making the target behavior concrete and manageable. Crucially, the initial 3-day challenge is designed as a short, achievable win to boost participants' self-efficacy before they commit to the longer task. The campaign messaging reinforces this low-threshold entry and immediate gain, through expressions such as: "Try the 3-day screen-free-in-bed test drive," and "Earn cool stuff just for giving it a try – and the real win? Waking up the next morning feeling like a nap wrapped in a smoothie."</p>

<p class="mb-4">In addition, the challenge cards and log can facilitate self-monitoring and help participants observe the direct connection between their behaviors and immediate outcomes (e.g., sleep quality), which supports the development of self-regulation. The 21-day challenge offers an extended opportunity for sustained action, and the inclusion of blank pages beyond the 21 nights allows participants who find the tool helpful to continue self-monitoring voluntarily. The messaging supports this monitoring by framing the task as a continuous, autonomous process, such as: "Log your nights," and "Check your progress!"</p>

<p class="mb-4">Furthermore, the campaign is inherently amplified by the social, peer environment in the school setting, where teenagers learn from and influence each other. The recap sharing sessions are designed to maximize peer modeling and norms by allowing participants to share their feelings, progress, and strategies. The messaging leverages this social aspect for motivation and accountability, encouraging interaction and using social comparison to drive engagement: "share your best trick to cheer on your friends," and "All your friends are tackling the 21-day screen-free-in-bed challenge to get entered into the draw. Don't let them win without you!" Additionally, the creative media products generated by students who finish the 21-day challenge can further serve as authentic peer modeling for future cohorts.</p>

<p class="mb-4">Finally, the incentive structure serves as a direct mechanism for reinforcement, rewarding effort and engagement demonstrated throughout the process to facilitate long-term behavior change. The sample campaign messaging emphasizes those rewards, especially the biggest ones, to capture attention: "Tell your story and enter the big prize draw!" and "...Win the Apple Watch 11."</p>
`

const communicationChannelsContent = `
<p class="mb-4">For this campaign, communication is organized with school as the core setting, extending into homes, and supported by online channels.</p>

<p class="mb-4">The school serves as the main touchpoint, covering interpersonal, group, and light mass communication. It is where all target students are physically present every day. Whether through class-based workshops, brief campaign announcements, short class-break sharing sessions, or printed posters in common areas, school-based channels ensure very high reach and avoid relying on social media or students' personal phones to promote a campaign that is, in fact, about reducing in-bed screen use.</p>

<p class="mb-4">The school setting also allows teachers to act as credible facilitators to guide the process, allows external experts to cooperate with relevant staff and organize activities, and gives students opportunities to talk with each other about the campaign and the target behavior, observing and learning from peers' experiences. This school-based approach has been shown to be effective in multiple adolescent screen-use and sleep-related health and behavior interventions.</p>

<p class="mb-4">Online channels are used mainly to communicate with parents and caregivers and to host the parent webinar. This format is more flexible in time and location, and it helps keep the issue framed as a practical, manageable topic rather than an extreme "crisis," which reduces the risk of overwhelming parents or children and triggering resistance or guilt.</p>

<p class="mb-4">Finally, within the 21-day challenge, students are invited to create a short product that documents their journey and feelings during the challenge. With permission, these creative works can later be shared through appropriate school or online channels and may also serve as peer-modelling material for future campaigns.</p>
`

const sampleArtifactsContent = `
<p class="mb-4">This is a poster that can be taped in the campus. It shows a girl sleeping comfortably in bed while her devices are lying on a desk away from the bed.</p>

<p class="mb-4">Along the bottom of the poster, there is a row of tear-off tabs. Each tab has a short, teenager-friendly benefit of getting rid of screen use in bed. Students can tear off a tab or to keep it or give it to a friend.</p>

<p class="mb-4">The content printed on each tab focuses on vivid, concrete, positive outcomes of the target behavior, which supports outcome expectations in SCT.</p>

<p class="mb-4">The tear-off format is designed to spark curiosity and attention. Also in this visible school setting, when seeing peers stop, read, and pull off tabs, more and more students will join organically. It is a great way to build perceived peer norms and trigger communications on the target behavior and the campaign.</p>

<p class="mb-4 mt-6">This small "device parking lot" sticker is available for all students to take freely. We encourage students to place it in a fixed location at home. The goal is for them to leave their electronic devices there every night instead of taking them to bed.</p>

<p class="mb-4">From a SCT perspective, the sticker works in two ways. First, it changes the home environment by clearly designating a device parking area and makes placing devices there an easier, default option. Second, it supports students' self-regulation by helping them set a clear goal ("no screens in bed"), perform daily self-monitoring (checking if devices are parked), and experience self-reinforcement when they successfully follow the rule.</p>

<p class="mb-4 mt-6">These are sample card and log for the No Screens in Bed challenges.</p>

<p class="mb-4">As explained above, the structure and questions in these challenges are guided by SCT and by principles of interpersonal communication.</p>

<p class="mb-4">They help students engage in self-monitoring and self-regulation, while also capturing emotions and reflections that are valuable for sharing and discussion. Eventually, students can learn from one another, feel supported, and strengthen their motivation and confidence in their efforts to change.</p>
`

const resourcesContent = `
<p class="mb-4">The campaign is designed to run primarily within Hardy's existing school structures, but it still requires a clear set of human and material resources.</p>

<p class="mb-4">In terms of personnel, a school-based campaign lead, such as a counselor or health educator, is required to coordinate planning, scheduling, and communication with teachers and administrators. A key resource is an external expert in adolescent sleep and screen-use interventions. This expert will design the student workshop, lead a parent webinar, and train teachers on core messages, using TTM and SCT in activities, and supporting students through the 3-day and 21-day challenges. Additionally, a designer is needed to create all visual materials and custom prizes.</p>

<p class="mb-4">Classroom teachers will host the workshop, distribute materials, lead brief check-ins, and encourage participation. Administrative staff support is also necessary for arranging the schedule, sending school-home communications, distributing prizes, and tabulating the pre- and post-surveys that assess stages of change and in-bed screen use.</p>

<p class="mb-4 mt-6">The material resources for the campaign include both educational and motivational items. The school will need printed workshop handouts, "Sleep Mode 3-Day Challenge Cards," "Sleep Mode 21-Day Challenge Log" booklets, posters for hallways and classrooms, and "device parking lot" stickers for students to take home. Furthermore, sufficient quantities of incentives must be designed and purchased in advance for all potential participants: small 3-day rewards, more substantial 21-day completion rewards, and a limited number of high-value final prizes.</p>

<p class="mb-4">Logistically, the campaign requires several key approvals from school leadership such as the use of class time, the approach and communication with parents, the running of the survey, and the offering of incentives. A clear operational plan is also necessary for key processes, specifically how materials are stored and distributed. Finally, a protocol must be established for handling consent and privacy, particularly if student creative products or survey data are later used for reporting or future campaigns.</p>
`

const budgetContent = `
<div class="overflow-x-auto mt-4">
<table class="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
<thead>
<tr class="bg-softLavender">
<th class="border border-gray-200 px-4 py-3 text-left font-semibold text-ink">Budget Category</th>
<th class="border border-gray-200 px-4 py-3 text-left font-semibold text-ink">Estimated Cost</th>
<th class="border border-gray-200 px-4 py-3 text-left font-semibold text-ink">Notes</th>
</tr>
</thead>
<tbody class="text-sm">
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Personnel Costs</td>
<td class="border border-gray-200 px-4 py-3">$5,000</td>
<td class="border border-gray-200 px-4 py-3">Part-time campaign coordinator at Hardy, teacher stipends for extra preparation and check-ins, administrative support for communication and survey handling, and a designer to create posters, stickers, cards, log booklets, and customized prize items.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Materials Production</td>
<td class="border border-gray-200 px-4 py-3">$6,000</td>
<td class="border border-gray-200 px-4 py-3">Printing of student workshop handouts, 3-day challenge cards, 21-day log booklets (with extra pages), posters, stickers, parent flyers, and pre-/post paper surveys for all students.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Incentives & Prizes</td>
<td class="border border-gray-200 px-4 py-3">$23,000</td>
<td class="border border-gray-200 px-4 py-3">Small rewards for the 3-day challenge (stickers and mini notebooks), fuller prize packs for 21-day completers (a canvas tote with school/campaign swag such as badges, pens, notebooks and snacks), and a set of high-value grand prizes (three pairs of AirPods and three Apple Watches)</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Expert Speaker / Consultant Fee</td>
<td class="border border-gray-200 px-4 py-3">$1,000</td>
<td class="border border-gray-200 px-4 py-3">Honorarium for an external expert in adolescent sleep/screen/health interventions to design the student workshop and parent webinar, conduct advance teacher training, and provide limited follow-up consultation.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Contingency</td>
<td class="border border-gray-200 px-4 py-3">$1,000</td>
<td class="border border-gray-200 px-4 py-3">Buffer for unexpected costs such as additional printing, replacement materials, shipping for customized prizes, or small extras needed during implementation.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50 font-bold">Total</td>
<td class="border border-gray-200 px-4 py-3 font-bold">$36,000</td>
<td class="border border-gray-200 px-4 py-3"></td>
</tr>
</tbody>
</table>
</div>
`

const surveyContent = `
<p class="mb-4">The campaign will also use the TTM to evaluate behavioral change. A brief, anonymous survey will be given before the campaign begins and again at the end.</p>

<p class="mb-4"><strong>Survey Focus:</strong> The survey includes questions that classify students' stage of change related to the target behavior: eliminating in-bed screen use (DiClemente et al., 1991).</p>

<p class="mb-4"><strong>Evaluation Metric:</strong> The campaign's effectiveness will be measured by changes in the distribution of stages of change across the whole student group.</p>

<p class="mb-4"><strong>Rationale:</strong> This approach is consistent with established sleep and screen-time interventions based on TTM, which use stages of change as a key indicator of progress (e.g., Bistricky et al., 2025; Hui et al., 2015).</p>

<p class="mb-4"><strong>Anonymity:</strong> An anonymous survey reduces the chance of socially desirable responses and helps avoid singling out or "labelling" any individual participant.</p>
`

const conclusionContent = `
<p class="mb-4">Overall, the "Let's Go into Sleep Mode" campaign aims to help U.S. early adolescents, specifically those at Hardy Middle School in Washington D.C., eliminate screen use while in bed.</p>

<p class="mb-4">The strategy effectively combines two key theoretical frameworks, the Transtheoretical Model and Social Cognitive Theory, with practical elements such as school structures, family engagement, and peer support.</p>

<p class="mb-4">By making the process of change concrete, achievable, progressive, and rewarding, the campaign offers its target students a realistic and supported path toward healthier screen habits, improved sleep, and ultimately a better life.</p>
`

const targetAudienceContent = `
<p class="mb-5"><strong><em class="text-ink">Demographic and Geographic</em></strong></p>

<p class="mb-4">The primary audience for this campaign is all students enrolled in Hardy Middle School, a public middle school in Washington, D.C. serving grades 6–8 only (early adolescents, aged approximately 11-14) (MY SCHOOL DC, 2025).</p>

<p class="mb-4">According to a relevant source, Hardy has 631 students enrolled for the latest school year, which makes it a mid-sized, manageable whole-school setting for a universal intervention (MY SCHOOL DC, 2025). Meanwhile, students at this school are co-educational and racially diverse, consistent with D.C. Public Schools' overall profile, so a rigorous stance of equity and respect is essential (District of Columbia Public Schools, 2023; MY SCHOOL DC, 2025).</p>

<p class="mb-4">The school is located in Ward 2 of Washington, D.C., an urban area with a median household income of about $131,400 based on 2019–2023 estimates, well above the U.S. median of around $78,500 (Census Reporter, n.d.).</p>

<p class="mb-4">Plus since national data showing that smartphone access is already the norm in this age group, most students in Hardy are very likely to have personal devices, making bedtime screen use a realistic and highly relevant behavior to address (Common Sense Media, 2022; Pew Research Center & MarketingCharts, 2024).</p>

<p class="mb-4">Parents form an important secondary audience, particularly for components that focus on household rules and the home media environment.</p>

<p class="mb-4 mt-8"><strong><em class="text-ink">Psychographic and Behavioral Patterns</em></strong></p>

<p class="mb-4">Early adolescence is a developmental stage marked by rapid social, emotional, and cognitive change (Anastasiades et al., 2022; Mitchell & Nugiel, 2024).</p>

<p class="mb-4">Firstly, peer relationships, identity, and a sense of social belonging are especially important (Tija Ragelienė, 2016). Fitting in with classmates, being noticed by others, and avoiding embarrassment or exclusion are central concerns, so peers exert a strong influence on young adolescents' attitudes and everyday behavior.</p>

<p class="mb-4">At the same time, early adolescents place great value on autonomy and fairness (Cooley et al., 2012). They want more say in their own plans and in how they use digital devices, and they pay close attention to whether rules feel fair and respectful to them (Cumsille et al., 2009; Mintel, 2024). This means that campaigns perceived as preachy, punitive, or controlling can easily backfire, whereas approaches that acknowledge their need for choice and respect are more likely to be accepted.</p>

<p class="mb-4">Mintel's Activities of Teens and Tweens – US – 2024 report (2024) further suggests that this group is strongly driven by self-relevant emotions such as pride, excitement, and personal satisfaction, as well as by experiences that feel cool, fun, and shareable. This suggests that they are more engaged when a behavior-change activity lets them feel energized, better, and able to show something off to others, rather than when it focuses only on risks or prohibition.</p>

<p class="mb-4">In terms of behavioral patterns, U.S. early adolescents are true digital natives (Mintel, 2024). Roughly nine in ten teens report using YouTube, and majorities also use platforms such as TikTok, Snapchat, and Instagram (Pew Research Center, 2024). For them, digital media are not just tools for entertainment but are closely tied to identity and everyday interpersonal and emotional regulation (Granic et al., 2020).</p>
`

const challengesTableHtml = `
<div class="overflow-x-auto mt-6">
<table class="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
<thead>
<tr class="bg-softLavender">
<th class="border border-gray-200 px-4 py-3 text-left font-semibold text-ink"></th>
<th class="border border-gray-200 px-4 py-3 text-left font-semibold text-ink">3-Day Challenge</th>
<th class="border border-gray-200 px-4 py-3 text-left font-semibold text-ink">21-Day Challenge</th>
</tr>
</thead>
<tbody class="text-sm">
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Timing</td>
<td class="border border-gray-200 px-4 py-3">Held in week 2 of the campaign, on three consecutive nights.</td>
<td class="border border-gray-200 px-4 py-3">Starts after the 3-day challenge and runs for 21 consecutive nights.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Materials & Content</td>
<td class="border border-gray-200 px-4 py-3">Each student who signs up receives a set of Sleep Mode 3-Day Challenge Cards. Each morning after a challenge night, they tick or fill in the card with:<br/><br/>
• Did I bring a screen into my bed before falling asleep tonight?<br/>
• What did I do instead?<br/>
• About what time did I try to sleep?<br/>
• This morning I feel…<br/>
• One thing that made it easier or harder tonight was…</td>
<td class="border border-gray-200 px-4 py-3">Students who sign up receive a Sleep Mode 21-Day Sleep Log booklet. The first three pages are a 21-night calendar (one line per night), and each line repeats the same five Rest Mode daily items as the 3-day card. The remaining pages are blank for students who want to keep using the log after the formal 21-day challenge ends.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Participation</td>
<td class="border border-gray-200 px-4 py-3">Open to all students who want to sign up. Short sharing sessions are held on each challenge day.</td>
<td class="border border-gray-200 px-4 py-3">Open to all students who want to sign up. Short sharing sessions are held at the end of each 7-day block.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Completion & Incentives</td>
<td class="border border-gray-200 px-4 py-3">Any student who hands in a fully completed 3-day card receives stickers and a notebook as a reward. Total success every night is not required. The focus is on trying and honestly tracking their own behavior.</td>
<td class="border border-gray-200 px-4 py-3">A student is considered to have completed the challenge if:<br/><br/>
• Their booklet shows entries for all 21 nights, and<br/>
• On at least 15 out of 21 nights, they mark that they did not use screens in bed (or only checked very briefly and then stopped).<br/><br/>
Students who meet this standard receive a large canvas goodie bag with attractive school- or activity-branded items such as a badge, hat, pen, notebook, mascot toy, and some snacks.</td>
</tr>
<tr>
<td class="border border-gray-200 px-4 py-3 font-medium text-ink bg-gray-50">Bonus</td>
<td class="border border-gray-200 px-4 py-3">Not applicable.</td>
<td class="border border-gray-200 px-4 py-3">Students who complete the 21-day challenge can choose to go one step further and create a small media piece about their experience, such as:<br/><br/>
• a 1–2 minute short video<br/>
• a simple comic strip or storyboard<br/>
• a short narrative<br/><br/>
Every student who submits a creative piece, and meets the 21-day completion criteria, is entered into a prize draw for a few larger prizes, including AirPods 4 and Apple Watch 11.</td>
</tr>
</tbody>
</table>
</div>
`

export default async function Page() {
	const doc = await loadDocx()
	let msSections: Section[] = []
	let grouped: Section[] = []
	const desired = [
		{ id: 'problem', label: 'Problem Definition' },
		{ id: 'audience', label: 'Target Audience' },
		{ id: 'context', label: 'Key Considerations of the Context' },
		{ id: 'strategy', label: 'Campaign Strategy and Message' },
		{ id: 'channels', label: 'Communication Channels' },
		{ id: 'artifacts', label: 'Sample Artifacts' },
		{ id: 'resources', label: 'Resources' },
		{ id: 'budget', label: 'Budget' },
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'conclusion', label: 'Conclusion' },
		{ id: 'references', label: 'References' }
	]
	if ((doc as any).ok) {
		msSections = splitHtmlIntoSections((doc as any).html)
		// attempt heading-based grouping first
		const titlesLower = desired.map(d => d.label.toLowerCase())
		const startIdx = desired.map(d => findIndexByKeys(msSections, [d.label]))
		const byHeading: Section[] = []
		let usable = true
		for (let i = 0; i < desired.length; i++) {
			const start = startIdx[i]
			if (start < 0) { usable = false; break }
			let end = msSections.length
			for (let j = i + 1; j < desired.length; j++) {
				if (startIdx[j] >= 0) end = Math.min(end, startIdx[j])
			}
			byHeading.push({ id: desired[i].id, title: desired[i].label, html: msSections.slice(start, end).map(s => s.html).join('\n') })
		}
		grouped = usable ? byHeading : segmentRawByTitles((doc as any).raw, desired)
	} else {
		grouped = segmentRawByTitles('', desired)
	}

	// Inject problem definition detailed content after existing content
	const problemIdx = grouped.findIndex(g => g.id === 'problem')
	if (problemIdx >= 0) {
		const existingHtml = grouped[problemIdx].html.trim()
		// If only placeholder, replace; otherwise append
		if (existingHtml === '<p>—</p>') {
			grouped[problemIdx].html = problemDefinitionContent
		} else {
			grouped[problemIdx].html = existingHtml + problemDefinitionContent
		}
	}

	// Inject target audience detailed content (replace existing content)
	const audienceIdx = grouped.findIndex(g => g.id === 'audience')
	if (audienceIdx >= 0) {
		grouped[audienceIdx].html = targetAudienceContent
	}

	// Inject content for other sections
	const contextIdx = grouped.findIndex(g => g.id === 'context')
	if (contextIdx >= 0) {
		const existingHtml = grouped[contextIdx].html.trim()
		if (existingHtml === '<p>—</p>') {
			grouped[contextIdx].html = keyConsiderationsContent
		} else {
			grouped[contextIdx].html = existingHtml + keyConsiderationsContent
		}
	}

	const strategyIdx = grouped.findIndex(g => g.id === 'strategy')
	if (strategyIdx >= 0) {
		const existingHtml = grouped[strategyIdx].html.trim()
		if (existingHtml === '<p>—</p>') {
			grouped[strategyIdx].html = campaignStrategyContent
		} else {
			grouped[strategyIdx].html = existingHtml + campaignStrategyContent
		}
	}

	const channelsIdx = grouped.findIndex(g => g.id === 'channels')
	if (channelsIdx >= 0) {
		const existingHtml = grouped[channelsIdx].html.trim()
		if (existingHtml === '<p>—</p>') {
			grouped[channelsIdx].html = communicationChannelsContent
		} else {
			grouped[channelsIdx].html = existingHtml + communicationChannelsContent
		}
	}

	const artifactsIdx = grouped.findIndex(g => g.id === 'artifacts')
	if (artifactsIdx >= 0) {
		// Clear existing content - only show flip cards
		grouped[artifactsIdx].html = ''
	}

	const resourcesIdx = grouped.findIndex(g => g.id === 'resources')
	if (resourcesIdx >= 0) {
		const existingHtml = grouped[resourcesIdx].html.trim()
		if (existingHtml === '<p>—</p>') {
			grouped[resourcesIdx].html = resourcesContent
		} else {
			grouped[resourcesIdx].html = existingHtml + resourcesContent
		}
	}

	const budgetIdx = grouped.findIndex(g => g.id === 'budget')
	if (budgetIdx >= 0) {
		const existingHtml = grouped[budgetIdx].html.trim()
		if (existingHtml === '<p>—</p>') {
			grouped[budgetIdx].html = budgetContent
		} else {
			grouped[budgetIdx].html = existingHtml + budgetContent
		}
	}

	const surveyIdx = grouped.findIndex(g => g.id === 'survey')
	if (surveyIdx >= 0) {
		const existingHtml = grouped[surveyIdx].html.trim()
		if (existingHtml === '<p>—</p>') {
			grouped[surveyIdx].html = surveyContent
		} else {
			grouped[surveyIdx].html = existingHtml + surveyContent
		}
	}

	const conclusionIdx = grouped.findIndex(g => g.id === 'conclusion')
	if (conclusionIdx >= 0) {
		const existingHtml = grouped[conclusionIdx].html.trim()
		if (existingHtml === '<p>—</p>') {
			grouped[conclusionIdx].html = conclusionContent
		} else {
			grouped[conclusionIdx].html = existingHtml + conclusionContent
		}
	}

	const navSections = grouped.map(g => ({ id: g.id, label: g.title }))

	// Load timeline image - use public path instead of base64
	const timelineImg = await (async () => {
		const possibleNames = ['timeline.png', 'timeline.jpg', 'Timeline.png', 'Timeline.jpg']
		for (const name of possibleNames) {
			try {
				// Check if file exists in public/images
				const publicPath = path.join(process.cwd(), 'public', 'images', name)
				await fs.access(publicPath, fs.constants.F_OK)
				return `/images/${name}`
			} catch {
				// Try sources folder as fallback
				try {
					const p = path.join(process.cwd(), 'sources', name)
					await fs.access(p, fs.constants.F_OK)
					return `/images/${name}`
				} catch {}
			}
		}
		return null
	})()

	// Load cover image - use public path instead of base64
	const coverImg = await (async () => {
		const possibleNames = ['cover.png', 'cover.jpg', 'Cover.png', 'Cover.jpg']
		for (const name of possibleNames) {
			try {
				// Check if file exists in public/images
				const publicPath = path.join(process.cwd(), 'public', 'images', name)
				await fs.access(publicPath, fs.constants.F_OK)
				return `/images/${name}`
			} catch {
				// Try sources folder as fallback
				try {
					const p = path.join(process.cwd(), 'sources', name)
					await fs.access(p, fs.constants.F_OK)
					return `/images/${name}`
				} catch {}
			}
		}
		return null
	})()

	// Inject timeline image
	const timelineIdx = grouped.findIndex(g => g.id === 'timeline')
	if (timelineIdx >= 0) {
		if (timelineImg) {
			grouped[timelineIdx].html = `<div class="mt-3"><img src="${timelineImg}" alt="Campaign Timeline" class="w-full h-auto rounded-xl" /></div>`
		} else {
			grouped[timelineIdx].html = '<p class="text-gray-500">Timeline image not found. Please add timeline.png or timeline.jpg to the public/images folder.</p>'
		}
	}

	// Inject references content
	const referencesIdx = grouped.findIndex(g => g.id === 'references')
	if (referencesIdx >= 0) {
		const referencesContent = generateReferencesHTML()
		grouped[referencesIdx].html = referencesContent
	}

	const artifactsImgs = await (async () => {
		const names = ['artifact 1.png', 'artifact 2.png', 'artifact 3.png', 'artifact 4.png']
		const results: { name: string; src: string }[] = []
		for (const n of names) {
			try {
				// Check if file exists in public/images
				const publicPath = path.join(process.cwd(), 'public', 'images', n)
				await fs.access(publicPath, fs.constants.F_OK)
				results.push({ name: n, src: `/images/${n}` })
			} catch {
				// Try sources folder as fallback
				try {
					const p = path.join(process.cwd(), 'sources', n)
					await fs.access(p, fs.constants.F_OK)
					results.push({ name: n, src: `/images/${n}` })
				} catch {}
			}
		}
		return results
	})()

	const artifactTexts: Record<string, string> = {
		'artifact 1.png': 'This is a poster that can be put up around campus. It shows a girl sleeping comfortably in bed, with colorful, dream-like waves flowing from her bed, while her devices lie on a desk away from the bed.\n\nAlong the bottom of the poster, there is a row of tear-off tabs. Each tab has a short, teenager-friendly benefit of getting rid of screen use in bed. Students can tear off a tab to keep it or give it to a friend.\n\nThe content printed on each tab focuses on vivid, concrete, positive outcomes of the target behavior, which supports outcome expectations in SCT.\n\nThe tear-off format is designed to spark curiosity and attention. Also in this visible school setting, when seeing peers stop, read, and pull off tabs, more and more students will join organically. It is a great way to build perceived peer norms and trigger communications on the target behavior and the campaign.',
		'artifact 2.png': 'This small "device parking lot" sticker is available for all students to take freely. We encourage students to place it in a fixed location at home. The goal is for them to leave their electronic devices there every night instead of taking them to bed.\n\nFrom a SCT perspective, the sticker works in two ways. First, it changes the home environment by clearly designating a device parking area and makes placing devices there an easier, default option. Second, it supports students\' self-regulation by helping them set a clear goal ("no screens in bed"), perform daily self-monitoring (checking if devices are parked), and experience self-reinforcement when they successfully follow the rule.',
		'artifact 3.png': 'These are sample card and log for the No Screens in Bed challenges.\n\nAs explained above, the structure and questions in these challenges are guided by SCT and by principles of interpersonal communication.\n\nThey help students engage in self-monitoring and self-regulation, while also capturing emotions and reflections that are valuable for sharing and discussion. Eventually, students can learn from one another, feel supported, and strengthen their motivation and confidence in their efforts to change.'
	}

	return (
		<main className="container-p max-w-[1200px] mx-auto py-8 md:py-12">
			<header className="relative overflow-hidden soft-card p-6 md:p-10">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
					<div>
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-softMint text-ink text-xs font-medium">
							<span>Hardy Middle School · Washington, D.C.</span>
						</div>
						<h1 className="mt-4 text-3xl md:text-5xl font-display font-extrabold leading-tight text-gray-800">
							Let<span className="apos-fix">'</span>s Go into Sleep Mode
						</h1>
						<p className="mt-4 text-gray-700 md:text-lg">
							A school-based campaign to eliminate in-bed screen use among early adolescents.
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<a href="#problem" className="px-4 py-2 rounded-xl bg-ink text-white hover:opacity-90">Explore the plan</a>
						</div>
					</div>
					<div className="relative h-56 md:h-64">
						{coverImg ? (
							<div className="relative w-full h-full rounded-2xl overflow-hidden">
								<Image 
									src={coverImg} 
									alt="Sleep Mode Campaign Cover" 
									fill
									className="object-contain object-center rounded-2xl"
									priority
								/>
							</div>
						) : (
							<div className="relative w-full h-full">
								<Image src="/illustrations/sleep-hero.svg" alt="Sleep Mode Illustration" fill priority />
							</div>
						)}
					</div>
				</div>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6 mt-8">
				<Nav sections={navSections} />
				<div className="space-y-8">
					{grouped.map(sec => (
						<section key={sec.id} id={sec.id} className="soft-card p-6">
							<h2 className="text-3xl md:text-4xl font-display font-extrabold text-purple-400 mb-6">{sec.title}</h2>
							<div className="mt-3 prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: sec.html }} />
							{sec.id === 'artifacts' && artifactsImgs.length > 0 && (
								<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
									{artifactsImgs.map((a, index) => {
										// Skip artifact 4 as it will be merged with artifact 3
										if (a.name === 'artifact 4.png') return null
										
										// For artifact 3, combine with artifact 4
										const isArtifact3 = a.name === 'artifact 3.png'
										const isArtifact1 = a.name === 'artifact 1.png'
										const artifact4 = artifactsImgs.find(img => img.name === 'artifact 4.png')
										
										const frontContent = (
											<figure className="rounded-xl border border-gray-100 h-full flex flex-col bg-white">
												<div className="flex-1 flex items-center justify-center bg-gray-50 p-4" style={{ minHeight: '550px' }}>
													<img src={a.src} alt={a.name} className="max-w-full max-h-full object-contain" style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }} />
												</div>
												<figcaption className="text-xs text-gray-500 px-3 py-2 flex-shrink-0">{a.name}</figcaption>
											</figure>
										)
										
										let backText = artifactTexts[a.name] || ''
										// If artifact 3, add artifact 4 image to the front and combine texts
										if (isArtifact3 && artifact4) {
											const combinedFront = (
												<div className="rounded-xl border border-gray-100 h-full flex flex-row bg-white">
													<div className="flex-1 flex items-center justify-center bg-gray-50 p-4" style={{ height: '100%' }}>
														<img src={a.src} alt={a.name} className="max-w-full max-h-full object-contain" style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }} />
													</div>
													<div className="flex-1 flex items-center justify-center bg-gray-50 p-4" style={{ height: '100%' }}>
														<img src={artifact4.src} alt={artifact4.name} className="max-w-full max-h-full object-contain" style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }} />
													</div>
												</div>
											)
											backText = artifactTexts['artifact 3.png'] || ''
											return (
												<div key={a.name} className="sm:col-span-2">
													<FlipCard
														front={combinedFront}
														back={backText}
														showRipple={false}
														className="flip-card-horizontal"
													/>
												</div>
											)
										}
										
										return (
											<FlipCard
												key={a.name}
												front={frontContent}
												back={backText}
												showRipple={isArtifact1}
											/>
										)
									})}
								</div>
							)}
						</section>
					))}
				</div>
			</div>
		</main>
	)
}

