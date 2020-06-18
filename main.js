
const ytpl = require('ytpl');
const fs = require('fs');
const ytdl = require('ytdl-core');
const readline = require('readline-sync');
const cliProgress = require('cli-progress');




var quality=undefined


function getPlaylistId() {

  const playlistUrl = readline.question('Enter the url of the playlist : ');

  const playlistId = playlistUrl.split("list=")[1]
 
  console.log(playlistId)
  return playlistId
}

function inputQuality(){
  if(quality==undefined){
    quality=readline.question("=========================================================================\n itag container quality codecs                 bitrate  audio bitrate\n18   mp4       360p    avc1.42001E, mp4a.40.2 696.66KB 96KB\n137  mp4       1080p   avc1.640028            4.53MB\n248  webm      1080p   vp9                    2.52MB\n136  mp4       720p    avc1.4d4016            2.2MB\n247  webm      720p    vp9                    1.44MB\n135  mp4       480p    avc1.4d4014            1.1MB\n134  mp4       360p    avc1.4d401e            593.26KB\n140  mp4               mp4a.40.2                       128KB\n=========================================================================\n->enter the itag for quality\n->please note that you can enter multiple itags, sperated with comma',\n->also note that itags with no audio bitrate has no video and same otherwise so it is wise to enter multiple itags to include both audio and video\n->the common itag is 18\n:")
    quality=quality.split(",")
  }
}

function downloadFile(url, name, folder) {

  const filters=quality.map((item)=>{
    return parseInt(item)
  })

  // console.log(filters)
  // quality=parseInt(quality)
  return new Promise(function (resolve, reject) {
    var dir = './' + folder + '/';
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    ytdl(url, { quality: filters })
      .pipe(fs.createWriteStream(dir + name + ".flv"))
      .on('error', (err) => {
        //console.log(err, "some error")
        reject()
      })
      .on('finish',() => {
        // console.log("resolved")
        resolve()
      })
  })
}


const type = readline.question('press p for playlist, else paste video link : ');

if(type=="p"){

const playlistId = getPlaylistId()

const a = ytpl(playlistId, function (err, playlist) {
  if (err) {
    console.log(err, "not found");
    return null;
  }
  else {

    const folderName = playlist.title
    const files = playlist.items.map(function (file) {
      return [file.title, file.url_simple]
    });

    const numFiles=files.length

    var indexes=readline.question("your playlist has "+numFiles +" videos. enter the start and stop indexes with comma in between. not 1 indexed.")

    // console.log(indexes)
    indexes=indexes.split(",")
    var index=indexes.map((item)=>{
      return parseInt(item)
    })
    // console.log(index)

    

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    
    (async () => {
      for (let i = index[0]-1; i < index[1]; i++) {
        if(i == index[0]-1) {inputQuality();console.log("\nDownloading...\n",index);bar1.start(index[1]-index[0]+1, 0);}        
        await downloadFile(files[i][1], files[i][0], folderName)
        bar1.increment(1);
      }
      bar1.stop();
    })();

  }
})
}
else{
  const fileName = readline.question('enter filename to save : ');

  downloadFile(type, fileName, "video")
}

