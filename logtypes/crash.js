const Discord = require("discord.js");

module.exports = (client, text, message) => {
  var data = parseCrashlog(text);
  var possiblefix = possiblefixes(data, text);
  console.log(parseCrashlog(text))

  const embed = new Discord.MessageEmbed()
  embed.setTitle("Crash report");
  //embed.setURL();
  //embed.setThumbnail();
  embed.addField("Description: ", data.description, true);
  embed.addField("Time: ", data.time, true);
  embed.addField("Minecraft Version: ", data.systemDetails.minecraftVersion, true);
  embed.addField("Operating System: ", data.systemDetails.operatingSystem, true);
  embed.addField("Java Version: ", data.systemDetails.javaVersion, true);
  embed.addField("Memory Used: ", data.systemDetails.memory.used, true);
  embed.addField("Memory Available: ", data.systemDetails.memory.available, true);
  embed.addField("Memory Max: ", data.systemDetails.memory.max, true);
  embed.addField("Possible fix: ", possiblefix, false);
  embed.setTimestamp();
  message.reply({ content: "Here is what i got.", embeds: [embed]})
}


const headers = {
  CRASH_REPORT: "---- Minecraft Crash Report ----",
  SYSTEM_DETAILS: "-- System Details --"
};

const indexes = {
  RANDOM_MESSAGE: 1,
  TIME: 3,
  DESCRIPTION: 4,
  ERROR_STACK_TRACE: 6,
  DETAILS: 3
};

const COMMENT_REGEX = /\/\/ (.*)/;

function possiblefixes(error, orig) {
  if (error.description.match("Mod loading error has occurred")) {
    return "This is a mod loading error. Please read the logs for what is wrong.";
  }else if(error.description.match("Rendering overlay")){
    if(orig.includes("optifine")||orig.includes("Optifine")||orig.includes("OptiFine")){
      return "This is a rendering error and you have optifine installed. Optifine could have caused this so please remove it and try again.";
    }
  }

  return "Unknown";
}

function findPossibleCause(error) {
  if (error.match("OutOfMemoryError")) {
    return "Ran out of RAM, allocate more memory to Minecraft";
  }

  return "Unknown";
}

function parseCrashlog(crashlog) {
  const lines = crashlog.split("\n");

  if (lines.length < 1 || lines[0] !== headers.CRASH_REPORT) {
    throw new Error("Invalid crashlog");
  }

  let index = 0;
  const data = {};

  data.randomMessage = lines[indexes.RANDOM_MESSAGE].match(COMMENT_REGEX)[1];
  data.time = lines[indexes.TIME].match(/Time: (.*)/)[1];
  data.description = lines[indexes.DESCRIPTION].match(/Description: (.*)/)[1];

  index = indexes.ERROR_STACK_TRACE;
  data.error = lines[index];
  data.possibleCause = findPossibleCause(data.error);
  index++;
  data.stackHead = lines[index];
  //data.errorClassPath = data.stackHead.match(/at (.*?)\(/)[1];
  do {
    index++;
  } while (lines[index] !== "");
  //data.fullStackTrace = lines
   // .slice(indexes.ERROR_STACK_TRACE, index)
   // .join("\n");

  while (lines[index] !== headers.SYSTEM_DETAILS) {
    index++;
  }
  index += 2; // Skip "Details"
  const systemDetails = {
    minecraftVersion: lines[index].match(/Minecraft Version: (.*)/)[1],
    operatingSystem: lines[index + 2].match(/Operating System: (.*)/)[1],
    javaVersion: lines[index + 3].match(/Java Version: (.*)/)[1]
  };
  index += 5;

  const memoryInfo = lines[index].match(/Memory: (.*?) \/ (.*?)up to (.*)/);
  systemDetails.memory = {
    used: memoryInfo[1],
    available: memoryInfo[2],
    max: memoryInfo[3]
  };

  data.systemDetails = systemDetails;
  return data;
}