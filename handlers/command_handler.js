const fs = require("fs");

module.exports = (bot) => {
	const command_files = fs.readdirSync(`./commands/`).filter(file => file.endsWith(".js"));
	for (const file of command_files) {
		const command = require(`../commands/${file}`);
		if (command.name) {
			bot.commands.set(command.name, command);
		} else {
			console.log("Command Name error!");
		}
	}
}