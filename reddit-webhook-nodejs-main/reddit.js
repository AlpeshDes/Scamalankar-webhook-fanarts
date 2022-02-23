const fs = require('fs');
const axios = require('axios');
const { Webhook, MessageBuilder } = require('discord-webhook-node');

const Yuki = new Webhook("https://discord.com/api/webhooks/945904249051680768/rWIMorhmK0LHB7XgKXmfVKKTxnlfZcvvKrLDYKpH4ySrVugiBlXPMCzD9CWtGPWNGx-D");

const reporter = "816516388473929758"

const subreddits = "Animewallpaper+pantsu+awwnime+WaifusOnCouch+AnimeWallpaperNSFW+AnimeWallpapersSFW+silverhair+Moescape+animehotbeverages+MoeStash"

const url = `https://www.reddit.com/r/${subreddits}/new/.json`

const headers = {
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "User-Agent": "discord-feed-bot"
}

async function getPosts(url) {
    const db = JSON.parse(fs.readFileSync("./posts.json", "utf-8"))
    //console.log(db["posts"]) 
    const response = await axios.get(url, { "headers": { headers } })
    .then((response => {
        const posts = JSON.parse(JSON.stringify(response.data["data"]["children"]))
        // console.log(posts)
        for (let post of posts) {
            // console.log(post)
            let id = post["data"]["name"]
            if (!db.includes(id)) {
                if (post["data"]["post_hint"] = "image") {
                    let title = post.data.title
                    let url = post.data.permalink
                    let sub = post.data.subreddit_name_prefixed
                    let image = post.data.url_overridden_by_dest
                    let footer = `By u/${post.data.author}`
                    const embed = new MessageBuilder()
                    .setTitle(title)
                    .setURL(`https://www.reddit.com${url}`)
                    .addField("Subreddit", `\`${sub}\``, false)
                    .setColor("#FFC0CB")
                    .setImage(image)
                    .setFooter(footer)
                    .setTimestamp();
                    (async () => {
                        try {
                            await Yuki.send(embed);
                            console.log("Embed sent");
                        }
                        catch(e){
                            console.log(e.message);
                        };
                    })();
                    let postId = post.data.name
                    db.unshift(postId);
                    let append = JSON.stringify(db.slice(0, 50), null, 2)
                    // let push = db["posts"].concat(append);
                    fs.writeFile('./posts.json', append, function (err, data) {
                        if (err) throw err;
                        console.log("Success")
                    })
                }
            }
        }
    })).catch(async(e) => {
        const embed = new MessageBuilder()
        .setColor("#FFC0CB")
        .setDescription(`Dead-chwan! A request to Reddit failed with the following error: \`${e}\`\n\nWould you have Neel-chwan take a look when he's free to see if it's a regular error or something else? p-pwease? >.<`)
        await Yuki.send(`<@${reporter}>`);
        await Yuki.send(embed);
        const embed1 = new MessageBuilder()
        .setColor("#FFC0CB")
        .setDescription("Skipped the last request and continued the process with no errors...")
        await Yuki.send(embed1);
    });
};

setInterval(() => {
    getPosts(url)
  }, 30000);
  
