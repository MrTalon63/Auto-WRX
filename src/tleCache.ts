import fs from "fs/promises";
import cron from "cron";

let tle: Map<string, Tle>;

interface Tle {
	fetchTime: number;
	tle: string;
}

export async function initTleCache() {
	try {
		const cache = (await fs.readFile("./cache/tle.cache")).toString();
		const serialized = JSON.parse(cache);
		tle = new Map(Object.entries(serialized));
	} catch {
		console.info("Could not load TLE cache file");
		tle = new Map();
	}
}

export async function getTle(norad: number): Promise<string> {
	const satTle = tle.get(norad.toString()) as Tle | undefined;
	if (satTle === undefined || satTle.fetchTime < new Date().getTime() / 1000 + 43200) return await fetchTle(norad);
	return satTle.tle;
}

async function fetchTle(norad: number): Promise<string> {
	console.info(`Tle cache empty for Norad ID ${norad}`);
	const req = await fetch(`https://celestrak.org/NORAD/elements/gp.php?CATNR=${norad}`);
	const text = (await req.text()).trim();
	if (text === "No GP data found") {
		throw new Error(`No GP data found for ${norad}. Please check the NORAD ID.`);
	}

	tle.set(norad.toString(), {
		fetchTime: new Date().getTime(),
		tle: text,
	});
	saveTleCache();

	return text;
}

async function saveTleCache() {
	const serialized = Object.fromEntries(tle);
	const cache = JSON.stringify(serialized);
	await fs.writeFile("./cache/tle.cache", cache);
}
