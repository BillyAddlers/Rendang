const { RichEmbed } = require('discord.js');
const { get } = require('superagent');

async function gameBuilder (client, msg, args){
	try{
		if(!args.length){
			const embed = new RichEmbed()
			.setColor('YELLOW')
			.addField('❓ GuessThatNumber [gtn]', 'The bot will give randomly hide number and you must guess it.', true)
			.addField('🗨 Trivia [tv]', 'Test your knowledge with randomly quiz', true)
			.setFooter('💡 To play game use r!game <gamename>')
			return msg.channel.send(embed);
		}
		const gamename = args[0].toLowerCase();
		if(gamename === 'guessthatnumber' || gamename === 'gtn'){
			const numberToGuess = Math.floor(Math.random()*100);
			let passes = 10;
			let isWin = false;
			let ans = 'Guess that number!';
			while(passes > 0 && !isWin){
				await msg.channel.send(`${ans}\nyou have \`${passes}\` chance!`);
				const filter = msgs => !isNaN(msgs.content) && msgs.author.id === msg.author.id;
				const response = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 15000
				});
				if(!response.size){
					await msg.channel.send('Sorry time to guess is up');
					break;
				}
				const choice = parseInt(response.first().content, 10);
				if(choice > numberToGuess){
					ans = '🔻 That number is lower than !'
				}else if(choice < numberToGuess){
					ans = '🔺 That number is higher than !'
				}else{
					isWin = true;
				}
				passes--;
			}
			if(isWin) return msg.channel.send(`You won! it was \`${numberToGuess}\``);
			return msg.channel.send(`Too bad... it was \`${numberToGuess}\``);
		} else if(gamename === 'trivia' || gamename === 'tv'){
			const choices = ['🇦', '🇧', '🇨', '🇩'];
			const fetchMess = await msg.channel.send('Fetching question...');
			const { body } = await get('https://opentdb.com/api.php')
			.query({
				amount: 1,
				encode: 'url3986'
			});
			let answer = body.results[0].incorrect_answers;
			answer.push(body.results[0].correct_answer);
			answer = shuffle(answer);
			for(let i = 0; i < answer.length; i++){
				await fetchMess.react(choices[i]);
			}
			const embed = new RichEmbed()
			.setColor('RANDOM')
			.setDescription(`**${decodeURIComponent(body.results[0].question)}**\n\n` + answer.map((x,i) => `**${choices[i]}** - __**${decodeURIComponent(x)}**__`).join('\n'));
			fetchMess.edit('🗨 You have 15 Seconds to answer this question', {embed: embed});
			const filter = (rect, usr) => choices.includes(rect.emoji.name) && usr.id === msg.author.id;
			const response = await fetchMess.awaitReactions(filter, { max: 1, time: 15000 });
			if(!response.size) return msg.channel.send(`⏱️ Sorry time is up it was **${decodeURIComponent(body.results[0].correct_answer)}**`);
			await fetchMess.delete()
			if(answer[choices.indexOf(response.first().emoji.name)] === body.results[0].correct_answer) return msg.reply(`Absolutely right! it' was **${decodeURIComponent(body.results[0].correct_answer)}**`);
			return msg.reply(`Too bad it's was **${decodeURIComponent(body.results[0].correct_answer)}**`);
		}
	} catch (err) {
		return msg.channel.send(err.stack, { code: 'ini' });
	}
}

function shuffle(array) {
	const arr = array.slice(0);
	for (let i = arr.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
	return arr;
}

this.conf = {
	aliases: [],
	cooldown: 10
}

this.help = {
	name: 'game',
	description: 'play game',
	usage: 'game'
}

this.run = gameBuilder;
