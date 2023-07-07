import readline from "readline";

import { encounters } from ".";

async function initCli() {
	readline.emitKeypressEvents(process.stdin);

	if (process.stdin.isTTY) {
		process.stdin.setRawMode(true);
	}

	process.stdin.on("keypress", (chunk, key) => {
		if (key && key.name === "q") {
			process.exit();
		}
		if (key && key.name === "e") {
			encounters.forEach((encounter) => {
				let satName: string | number = encounter.satId;
				if (encounter.satId === 25338) satName = "NOAA 15";
				if (encounter.satId === 28654) satName = "NOAA 18";
				if (encounter.satId === 33591) satName = "NOAA 19";
				if (encounter.satId === 57166) satName = "Meteor-M N2-3";

				console.info(`Satellite: ${satName}`);
				console.info(`Start: ${new Date(encounter.start * 1000)}`);
				console.info(`End: ${new Date(encounter.end * 1000)}`);
				console.info(`Elevation: ${encounter.elevation * 57.2957795}\n\n`);
			});
		}
	});

	console.info("Available commands:");
	console.info("q - Exit the program");
	console.info("e - Show encounters in next 24h");
}

export default initCli;
