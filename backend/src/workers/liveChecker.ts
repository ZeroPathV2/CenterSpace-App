import { AppDataSource } from "../ormconfig";
import { Creator } from "../entities/Creator";

async function checkTwitch(creator: any){

  const res = await fetch(
   `https://api.twitch.tv/helix/streams?user_login=${creator.playlistItemID}`,
   {
     headers:{
       "Client-ID": process.env.TWITCH_CLIENT_ID!,
       Authorization:`Bearer ${process.env.TWITCH_APP_TOKEN!}`
     }
   }
  )

  const data = await res.json();

  if(data.data.length){
    // add to playlist
    console.log(`${creator.name} is live`)
  }

}

async function checkYoutube(creator: any){

 const res = await fetch(
 `https://youtube.googleapis.com/youtube/v3/search
 ?part=snippet
 &channelId=${creator.playlistItemID}
 &eventType=live
 &type=video
 &key=${process.env.YOUTUBE_API_KEY!}`
 )

 const data = await res.json()

 if(data.items.length){
   // add to playlist
   console.log(`${creator.name} is live`)
 }

}

export async function startLiveChecker(){

  const creatorRepo = AppDataSource.getRepository(Creator);

  setInterval(async () => {

    const creators = await creatorRepo.find();

    for (const creator of creators) {

      if (creator.platform === "twitch") {
        await checkTwitch(creator);
      }

      if (creator.platform === "youtube") {
        await checkYoutube(creator);
      }

    }

  }, 30000);

}

// setInterval(async ()=>{

//   const creators = await creatorRepo.find();

//   for (const creator of creators) {

//     if (creator.platform === "twitch") {
//       await checkTwitchLive(creator);
//     }

//     if (creator.platform === "youtube") {
//       await checkYoutubeLive(creator);
//     }

//   }

// },30000);

