////////////////// 獲🉐️️頁面元素引用 /////////////////////
const searchBox = document.getElementById('searchBox');
const aoButton = document.getElementById('aoButton');
const lyricArea = document.getElementById('lyricArea');
const albumPicArea = document.getElementById('albumPicArea');
const songName = document.getElementById('song-name');
const songArtist = document.getElementById('song-artist');
const songAlbum = document.getElementById('song-album');
const songVip = document.getElementById('song-vip');
const songFlac = document.getElementById('song-flac');
const flacSwitch = document.getElementById('flacSwitch');
const player = document.getElementById('player');
const downButton = document.getElementById('downButton');
const openAppBtn = document.getElementById('openAppBtn');
//const downButtonWarp = document.getElementById('downButtonWarp');

const curlDownButton = document.getElementById('curlDownButton');
const wgetDownButton = document.getElementById('wgetDownButton');
const lyricButton = document.getElementById('lyricButton');

let mStorage = window.localStorage;

////////////////// 函數和類型聲明 ///////////////////////


function clickAoButton() {
  let searchStr = searchBox.value;
  //console.log(searchStr);
  let songID = getIDwithRe(searchStr);
  if (!songID) {
    // 輸入的過於惡俗
    alert('輸入的 連結 或 ID 過於 惡俗！')
    return;
  }else if(songID === song.id){
    return;
  }
  song = Song(songID);

  addState(songID);
  loadSongData(song)
}

function nowLoading(working){
  if(working){
    aoButton.innerText = "LOADING";
    aoButton.disabled = true;
    downButton.innerText = 'LOADING';
    downButton.setAttribute('disabled', '');
  }else{
    aoButton.innerText = "ao";
    aoButton.disabled = false;
    downButton.innerText = 'Download';
    downButton.removeAttribute('disabled', '');
  }
}

async function loadSongData(song) {
  mStorage.setItem('id', song.id);
  nowLoading(true);
  searchBox.value = song.id;
  // todo song.exist = true;
  detailOk = await neteaseDetails(song);
  if (detailOk === null) {
    aoButton.innerText = "ao"
    // 404 或者失敗了
    nowLoading(false);
    return;
  }
  if(!song.available)alert('這首歌似乎沒有版權，，，');
  updatePage(song);
  await getAudio(song);
  updatePage(song);
  nowLoading(false);
}

// 通過 song 類型更新頁面
function updatePage(songObj) {
  if (!songObj.exist) {
    // 這首歌 ID 不存在，不更新
    // TODO: 錯誤 toast
    alert('查詢失敗，這下繃不住了，，，');
    return;
  }

  albumPicArea.src = songObj.albumPicUrl;
  songName.textContent = '🎶 ' + songObj.name;
  songArtist.textContent = '🧑‍🎤 ' + songObj.artist;
  songAlbum.textContent = '📀 ' + songObj.album;
  songVip.textContent = '🔐 ' + (songObj.vip ? 'VIP ✅ yes' : 'VIP ❌ no');
  songFlac.textContent = '🎧 ' + (songObj.flacUrl ? 'FLAC ✅' : 'FLAC 🈚️️');

  // flac 開關
  downButton.disabled = false;
  if (!songObj.flacUrl) {
    flacSwitch.disabled = true;
    flacSwitch.checked = false;
    player.src = songObj.mp3Url;

  } else {
    flacSwitch.disabled = false;
    flacSwitch.checked = true;
    player.src = songObj.flacUrl;
  }

  if(!songObj.mp3Url) downButton.disabled = true;

  // 歌詞是另外的函數所以先判斷一下
  if (songObj.lyrics) {
    lyricArea.innerText = songObj.lyrics;
    lyricButton.disabled = false;
  } else {
    lyricButton.disabled = true;
  }
  document.title = songObj.name;
}

// TODO：回報錯誤
function reportError(err) {

}
// 切換到下一個頁面狀態（指變更地址欄）
function addState(songID) {
  let stateObj = { id: songID };
  window.history.pushState(stateObj, "Song:" + songID, "/netease/?id=" + songID);
}
// 前進和後退
window.onpopstate = function (e) {
  if (e.state) {
    song.id = e.state.id;
    //document.title = e.state.pageTitle;
    loadSongData(song);
  }
};

// curl 下載命令
function curlDown() {
  let format = ".mp3";
  if (flacSwitch.checked) { format = ".flac"; }
  else { format = ".mp3"; }

  if (song.name) {
    let curlCmd = "curl -o \"" + song.artist + " - " + song.name + format + "\" " + player.src;
    copyTextToClipboard(curlCmd);
  }

}
function wgetDown() {
  let format = ".mp3";
  if (flacSwitch.checked) { format = ".flac"; }
  else { format = ".mp3"; }

  if (song.name) {
    let wgetCmd = "wget -O \"" + song.artist + " - " + song.name + format + "\" " + player.src;
    copyTextToClipboard(wgetCmd);
  }

}
// 複製文字到剪貼板
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    alert("您地瀏覽器過於惡俗。");
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    alert('已複製\n' + text);
  }, function (err) {
    console.error('Could not copy text: ', err);
    alert("您地瀏覽器過於惡俗。");
  });
}
// 下載按鈕
async function downBtnHandler() {
  let filename = song.artist + " - " + song.name;
  let href;
  if (flacSwitch.checked) {
    href = song.flacUrl;
    filename= filename + ".flac";
  } else {
    href = song.mp3Url;
    filename = filename + ".mp3";
  }
  downButton.innerText = 'LOADING';
  downButton.setAttribute('disabled', '');
  let blob = await fetch(href).then(resp => resp.blob())
  .then(blob => blob)
  .catch(e => alert('下載失敗 ' + e))
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  }else{
    //alert("您地瀏覽器過於惡俗。");
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
  downButton.innerText = 'Download';
  downButton.removeAttribute('disabled');
}
// 保存歌詞檔案
function lyricDown() {
  let filename = song.artist + " - " + song.name + ".lrc";
  save(filename, song.lyrics);
}
function save(filename, data) {
  const blob = new Blob([data], { type: 'text/plain' });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  }
  else {
    //alert("您地瀏覽器過於惡俗。");
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}
/////////////////////////////////////////////////
//////////////// 腳本執行從這裏開始 //////////////
/////////////////////////////////////////////////

// 建立新的 songObj
let song = Song(null);

// 設定按鍵事件
aoButton.addEventListener("click", function () {
  clickAoButton();

});
searchBox.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    clickAoButton();
  }
});
// 這幾個下載按鈕
downButton.addEventListener("click", downBtnHandler);
curlDownButton.addEventListener("click", curlDown);
wgetDownButton.addEventListener("click", wgetDown);
lyricButton.addEventListener("click", lyricDown);
// 打開 app 按鈕
openAppBtn.addEventListener("click", function () {
  if (song.name) {
    let intent = "orpheus://song/" + song.id;
    window.location = intent;
  }
});
// 切換音質的開關
flacSwitch.addEventListener("change", function (event) {
  let playingNow = !player.paused;
  let progress = player.currentTime;
  if (flacSwitch.checked) { player.src = song.flacUrl; }
  else { player.src = song.mp3Url; }

  player.currentTime = progress;
  if (playingNow) player.play();

});

// 設置音量不要那麼帶
player.volume = 0.4;

// 檢查 URL 有木有參數
let search = window.location.search;
let params = new URLSearchParams(search);
let songID = params.get("id") ? getIDwithRe(params.get("id")) : null;
if (songID !== null) {
  //console.log("the url has id " + songID);
  song.id = songID;
  addState(songID);
  loadSongData(song);
} else {
  let oldID = mStorage.getItem('id');
  if (oldID !== null) {
    searchBox.value = oldID;
    clickAoButton()
  }
}


