function makeHTML(result){
    if(!result){
        result = {
            "code": 200,
            "name": "網易雲音 Le",
            "artist": "網易雲音 Le 迫真網頁版",
            "album": "",
            "year": "",
            "albumPicUrl": "https://yamabuki-bakery.github.io/dokimoon/moon.png",
            "vip": 0,
            "noCopyrightRcmd": null,
            "lyric": ""
          }
    }
    html = `
    <!doctype html>
    <html lang="en">
      <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        
        <!-- Primary Meta Tags -->
        <title>網易雲音 Le</title>
        <meta name="description" content="網易雲音 Le 迫真網頁版">
        <meta property="og:site_name" content="網易雲音 Le 迫真網頁版"/>
    
        <!-- Open Graph / Facebook / Template -->
        <meta property="og:type" content="music.song"/>
        <meta property="og:title" content="${result.name}"/>
        <meta property="og:description" content="${result.artist} · ${result.year} · ${result.album}"/>
        <meta property="og:image" content="${result.albumPicUrl}"/>
        <meta property="og:image:alt" content="Album Cover">
    
        <meta name="twitter:title" content="${result.name}">
        <meta name="twitter:description" content="${result.artist} · ${result.year} · ${result.album}">
        <meta name="twitter:image" content="${result.albumPicUrl}">
    
        <!-- Twitter -->
        <meta name="twitter:card" content="summary">
        <meta name="twitter:site" content="網易雲音 Le 迫真網頁版"/>
    
        <link rel="apple-touch-icon" sizes="152x152" href="/netease/favicon/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/netease/favicon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/netease/favicon/favicon-16x16.png">
        <link rel="manifest" href="/netease/favicon/site.webmanifest">
        <link rel="mask-icon" href="/netease/favicon/safari-pinned-tab.svg" color="#5bbad5">
        <link rel="shortcut icon" href="/netease/favicon/favicon.ico">
        <meta name="msapplication-TileColor" content="#da532c">
        <meta name="msapplication-config" content="/netease/favicon/browserconfig.xml">
        <meta name="theme-color" content="#ffffff">
    
      </head>
    
      <body>
        <div class="container">
            <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
            <div class="container my-2">
                <!--頂欄元素-->
                <div class="row">
    
                    <a class="col-lg-2 text-dark text-decoration-none ">
                        <span class="fs-4" id="logoText">神必服務</span>
                    </a>
    
                    <form class="col-10 col-lg-8" onsubmit="return false">
                        <input id="searchBox" type="text" class="form-control form-control-dark" placeholder="ID or 網易雲分享 複製連結...">
                    </form>
    
                    <div class="col-2 col-lg-2 ">
                        <button id="aoButton" type="button" class="btn btn-primary">ao</button>
                    </div>
    
                </div>
    
            </div>
            </header>
        </div>
    
        <main class="container">
    
            <div class="container">
                <div class="row">
                  <!--專輯圖片和信息-->
                  <div class="col-lg-4 mb-3">
    
                      <div class="row">
                          <!--專輯圖片-->
                          <div class="col-6 col-lg album-pic" >
                              <img id='albumPicArea' src="/netease/bootstrap-stack.webp" class="img-fluid">
    
                          </div>
                          <!--換 col 行然後歌曲信息-->
                          <div class=""></div>
                          <div class="col mb-3">
                              <ul class="list-group song-info">
                                  <li class="list-group-item" id='song-name'>A disabled item</li>
                                  <li class="list-group-item" id='song-artist'>A second item</li>
                                  <li class="list-group-item" id='song-album'>A third item</li>
                                  <li class="list-group-item" id='song-vip'>A fourth item</li>
                                  <li class="list-group-item" id='song-flac'>And a fifth one</li>
                              </ul>
                          </div>
                          <div class=""></div>
    
                          <div class="col-4 ms-3 form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="flacSwitch" disabled>
                              <label class="form-check-label" for="flacSwitch">FLAC</label>
                          </div>
    
                          <div class="col-7 btn-group">
    
                            <button type="button" class="btn btn-primary" id="downButton">Download</button>
    
                            <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                              <span class="visually-hidden">Toggle Dropdown</span>
                            </button>
    
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" id="curlDownButton" >Download via curl</a></li>
                              <li><a class="dropdown-item" id="wgetDownButton">Download via wget</a></li>
                            </ul>
                          </div><!-- /btn-group -->
                          <div class="mb-3"></div>
    
                          <div class="btn-group">
    
                            <button type="button" class="btn btn-danger" id="openAppBtn">🔗打開真正的網疑雲音勒 App 聽這首歌</button>
    
                          </div>
    
                      </div>
                  </div>
                  <!--歌詞-->
                  <div class="col-lg-8">
    
                    <div class="row">
    
                      <div class="col-9" >
                        <audio controls style="width: 100%" preload="auto"
                        src="viper.mp3" type="audio/mp3" id='player'></audio>
                      </div>
    
                      <div class="col-12">
                        <div class="card">
                          <div class="card-header">
                            歌詞
                          </div>
                          <div class="card-body">
                              <button id="lyricButton" type="button" class="btn btn-primary" disabled >下載歌詞 (.lrc)</button>
                              <p class="card-text" id="lyricArea">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                          </div>
                        </div>
                      </div>
    
                    </div>
    
                  </div>
                </div>
            </div>
    
        </main>
    
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
        <script src="/netease/netease.js"></script>
        <script src="/netease/main.js"></script>
    
      </body>
    </html>    
    `;
    return html;
}

export async function onRequest(context) {
    // Contents of context object
    const {
        request, // same as existing Worker API
        env, // same as existing Worker API
        params, // if filename includes [id] or [[path]]
        waitUntil, // same as ctx.waitUntil in existing Worker API
        next, // used for middleware or to fetch assets
        data, // arbitrary space for passing data between middlewares
    } = context;
    const apiUrl = "https://netease.esutg.workers.dev/api";

    const { searchParams } = new URL(request.url)
    let id = searchParams.get('id')

    id = parseInt(id);
    console.log(`the id param is ${id}`);
    if (id >= 0) {
        // 歌曲清單
        let result = await fetch(apiUrl, {
            method: 'POST',
            body: id
        })
        .then(function (response) {
            return response.json();
        })
        .then(data => data)
        .catch((error) => {
            console.error('Details Error:', error);
            return null;
        });

        return new Response(makeHTML(result), {
            headers: {
                "content-type": "text/html;charset=UTF-8",
                "cache-control": "public; max-age=43200",
                "x-robots-tag": "noindex"
            }
        });
    } else {
        return new Response(makeHTML(null), {
            headers: {
                "content-type": "text/html;charset=UTF-8",
                "cache-control": "public; max-age=43200",
                "x-robots-tag": "noindex"
            }
        });
    }

}
