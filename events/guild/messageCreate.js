const Discord = require("discord.js");
const { MessageActionRow, MessageButton } = require('discord.js');
const fs = require("fs");
const fetch = require('node-fetch');

module.exports = async (message, bot) => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  const file = message.attachments.first();
  if (!file) return console.log('No attached file found');
  if (!(file.name.includes(".txt")||file.name.includes(".log"))) return console.log('Not txt or log file file.');
  try {
    //message.channel.send('Reading the file! Fetching data...');
    const response = await fetch(file.url);
    if (!response.ok)
      return message.channel.send(
        'There was an error with fetching the file:',
        response.statusText,
      );
    
    const text = await response.text();
    if (text) {
      if(text.includes("---- Minecraft Crash Report ----")){
        require(`../.././logtypes/crash.js`)(bot, text, message);
      }else if(text.includes("[main/INFO]")){
        require(`../.././logtypes/notcrash.js`)(bot, text, message);
      }else{
        return;
      }
    }
  } catch (error) {
    console.log(error);
  }
}