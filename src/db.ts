import keyv from "keyv";
import keyvCompression from "@keyv/compress-brotli";

const kv = new keyv({
	compression: new keyvCompression(),
});

kv.on("error", (err) => {
	console.error("[DB]: Error occured.");
	throw new Error(err);
});

export default kv;
