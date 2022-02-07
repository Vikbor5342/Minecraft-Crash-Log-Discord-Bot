module.exports = (client) => {
  client.user.setActivity(' files.', { type: 'WATCHING' });
	console.log("Bot ready");
}