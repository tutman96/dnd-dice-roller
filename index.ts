import { randomBytes } from 'crypto';
import * as Chartscii from 'chartscii';

function roleNDie(n: number, sides: number) {
	const buf = randomBytes(n);
	return Array.from(buf.map((v) => Math.floor((v / 256) * sides) + 1));
}

function rollStat() {
	// roll 4d6 drop the lowest
	return roleNDie(4, 6)
		.sort((a, b) => b - a)
		.slice(0, 3)
		.reduce((sum, roll) => sum + roll, 0);
}

function drawHistogram(numbers: Array<number>) {
	const counts = new Map<number, number>();
	for (const number of numbers) {
		if (!counts.has(number)) counts.set(number, 1)
		else counts.set(number, counts.get(number) + 1);
	}

	const data = new Array();
	for (const [score, count] of Array.from(counts.entries())) {
		let atLeastPercentage = 0;
		for (let i = score; i <= 20; i++) {
			atLeastPercentage += (counts.get(i) || 0) / numbers.length;
		}
		let atMostPercentage = 0;
		for (let i = 0; i <= score; i++) {
			atMostPercentage += (counts.get(i) || 0) / numbers.length;
		}
		data.push({
			score,
			modifier: `${score >= 10 ? `+${Math.floor((score - 10) / 2)}` : `${Math.ceil((score - 10) / 2)}`}`,
			exactly_this: `${((count / numbers.length) * 100).toFixed(4)}%`,
			this_or_greater: `${(atLeastPercentage * 100).toFixed(4)}%`,
			this_or_less: `${(atMostPercentage * 100).toFixed(4)}%`,
		});
	}

	// const data = Array.from(counts.entries())
	// 	.sort((a, b) => a[0] - b[0])
	// 	.map(([number, count]) => ({ label: `${number}`, value: count }))

	// const chart = new Chartscii(data.sort((a, b) => +a.label - +b.label), {
	// 	width: 500,
	// 	reverse: true
	// });

	// console.log(chart.create());
	console.table(data.sort((a, b) => b.score - a.score))
}

const ITERATIONS = 10000;
const STAT_COUNT = 6;

const counts = new Array<Array<number>>();
for (let iteration = 0; iteration < ITERATIONS; iteration++) {
	const scores = new Array(STAT_COUNT);
	for (let stat = 0; stat < STAT_COUNT; stat++) {
		scores[stat] = rollStat();
	}
	const scoresInOrder = scores.sort((a, b) => b - a);
	for (let stat = 0; stat < STAT_COUNT; stat++) {
		const score = scoresInOrder[stat];
		if (!counts[stat]) counts[stat] = [];
		counts[stat].push(score)
	}
}

const skillsMap = ['INT', 'CON', 'DEX', 'WIS', 'STR', 'CHA']
const ratialBonus = [2, 1, 0, 0, 0, 0]

for (let stat = 0; stat < STAT_COUNT; stat++) {
	const skill = skillsMap[stat];
	const scores = counts[stat].map((score) => score += ratialBonus[stat]);
	console.log(skill, `(+${ratialBonus[stat]})`)
	drawHistogram(scores);
}