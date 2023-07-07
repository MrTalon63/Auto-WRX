import cfg from "config";

interface Config {
	satellites: Satellite[];
	baseStation: BaseStation;
}

interface Satellite {
	norad: number;
	freq: number;
	transmissionType: string;
}

interface BaseStation {
	latitude: number;
	longitude: number;
	altitude: number;
}

const config: Config = {
	satellites: cfg.get("satellites"),
	baseStation: cfg.get("baseStation"),
};

export default config;
