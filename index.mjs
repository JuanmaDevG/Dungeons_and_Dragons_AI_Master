import { readFileSync, createReadStream } from "fs";
import OpenAI from "openai";

// Function to read API key from file
function readApiKeyFromFile() {
	try {
		const apiKey = readFileSync("key.key", "utf8").trim();
		return apiKey;
	} catch (error) {
		console.error("Error reading API key from file:", error.message);
		process.exit(1);
	}
}

// Replace 'your-api-key' with the readApiKeyFromFile() function
const apiKey = readApiKeyFromFile();

const openai = new OpenAI({ apiKey });

const file = await openai.files.create({
	file: createReadStream("./dataset.txt"),
	purpose: "assistants",
});

/*async function main2() {
	const completion = await openai.chat.completions.create({
		messages: [{ role: "system", content: "You are a helpful assistant." }],
		model: "gpt-3.5-turbo",
	});

	console.log(completion.choices[0]);
}*/

async function main() {
	const assistant = await openai.beta.assistants.create({
		name: "Your automatic DM",
		instructions:
			"You are a Dungeons and Dragons Dungeon Master and you are going to create scenarios for the players to play a short game. You have all the info about the game you need in the file provided",
		tools: [{ type: "retrieval" }],
		model: "gpt-3.5-turbo-1106",
		//model: "gpt-4-1106-preview",
		file_ids: [file.id],
	});

	const thread = await openai.beta.threads.create();

	const initialMessage = await openai.beta.threads.messages.create(thread.id, {
		role: "user",
		content: "We are two players. Dreina, a lvl 3 elf druid and Jose, a lvl 2 human paladin",
	});

	const createRun = await openai.beta.threads.runs.create(thread.id, {
		assistant_id: assistant.id,
		instructions:
			"Based on the players characters, create a background history for each character",
	});

	let run = await openai.beta.threads.runs.retrieve(thread.id, createRun.id);

	//console.log(messages);

	await setTimeout(async function () {
		//run = await openai.beta.threads.runs.retrieve(thread.id, createRun.id);

		console.log(run);
		const messages = await openai.beta.threads.messages.list(thread.id);

		let datas = messages.data;
		for (let dataid in datas) {
			console.log(datas[dataid].content);
		}
		/*
	let data = messages.body.data;
	for (let dataId in data) {
		let messages = data[dataId].content;
		for (let messageid in messages) {
			console.log(messages[messageid].text);
		}
	}
	//for (let messageid in messages) console.log(messages[messageid]);*/
	}, 60000);
}

main();
