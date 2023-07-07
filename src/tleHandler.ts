import cron from "cron";
import { twoline2satrec, propagate, degreesToRadians, gstime, ecfToLookAngles, eciToEcf } from "satellite.js";

import { encounters } from ".";
import cfg from "./config";
import db from "./db";
import { getTle } from "./tleCache";
import { initTleCache } from "./tleCache";

const baseStation = {
	latitude: degreesToRadians(cfg.baseStation.latitude),
	longitude: degreesToRadians(cfg.baseStation.longitude),
	height: cfg.baseStation.altitude,
};

async function initTleCron() {
	await initTleCache();
	const satellites = cfg.satellites;
	satellites.forEach(async (satellite) => {
		console.log(`[TLE]: Initializing TLE cron for ${satellite.norad}.`);

		const tle = await getTle(satellite.norad);
		await db.set(satellite.norad.toString(), tle);
		await calculateNextPasses(satellite.norad);

		cron.job(
			"0 0 */8 * * *",
			function () {
				console.log(`[TLE]: Updating TLE for ${satellite.norad}.`);
				calculateNextPasses(satellite.norad);
			},
			null,
			true,
			process.env.TZ || "Europe/Warsaw",
		);
	});
}

async function calculateNextPasses(norad: number): Promise<void> {
	const tle = ((await db.get(norad.toString())) as string).split("\n");
	tle.shift();
	const satRecord = twoline2satrec(tle[0], tle[1]);
	let time = new Date();
	let gmst = gstime(time);
	let isSpotted = false;
	let encounter = {
		start: 0,
		end: 0,
		elevation: 0,
	};

	for (let step = 0; step < 86400; step++) {
		time.setSeconds(time.getSeconds() + 1);
		gmst = gstime(time);

		let posAndVel = propagate(satRecord, time);
		if (typeof posAndVel.position === "boolean") throw new Error("Position and velocity is a boolean, not a vector");
		let posEcf = eciToEcf(posAndVel.position, gmst);
		let angles = ecfToLookAngles(baseStation, posEcf);

		if (angles.elevation > 0 && !isSpotted) {
			isSpotted = true;
			encounter.start = Math.round(time.getTime() / 1000);
			encounter.elevation = angles.elevation;
		}

		if (isSpotted) {
			if (angles.elevation > encounter.elevation) encounter.elevation = angles.elevation;
		}

		if (angles.elevation < 0 && isSpotted === true) {
			isSpotted = false;
			encounter.end = Math.round(time.getTime() / 1000);
			encounters.push({
				start: encounter.start,
				end: encounter.end,
				satId: norad,
				elevation: encounter.elevation,
			});
		}
	}

	return;
}

export default initTleCron;
