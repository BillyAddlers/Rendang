const { post } = require('superagent');
const { RichEmbed } = require('discord.js');

function cppRunner (client, msg, args){
	args = args.slice(1).join(' ').trim()
	if(!args) return msg.reply('please add some code');
	const { text } = post('http://coliru.stacked-crooked.com/compile')
	.send({
		cmd: 'g++ main.cpp && ./a.out',
		src: args
	});
	const embed = new RichEmbed()
	.setColor('PURPLE')
	.setDescription(`\`\`\`diff\n${text}\`\`\``);
	return msg.reply(embed);
}

this.conf = {
	aliases: ['cpp'],
	cooldown: 10
}

this.help = {
	name: 'c++',
	description: 'Compile your c++ code!',
	usage: 'c++ [code]'
}

this.run = cppRunner;
