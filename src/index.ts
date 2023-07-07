import tleInit from "./tleHandler";
import cfg from "./config";
import db from "./db";
import cli from "./cli";

interface Encounter {
	start: number;
	end: number;
	satId: number;
	elevation: number;
}

export let encounters: Encounter[] = [];

async function main() {
	tleInit();
	cli();
}

main();
