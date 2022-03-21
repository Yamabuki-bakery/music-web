#!/bin/python3

import json, logging, aiohttp_jinja2, jinja2, os, aiohttp, datetime
from aiohttp import web

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S'
                    )
routes = web.RouteTableDef()
PATH_HERE = os.path.dirname(os.path.realpath(__file__))


def main():
    app = web.Application()
    app.add_routes(routes)
    aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader(PATH_HERE))
    web.run_app(app, host='127.0.0.1', port=8087)


@routes.get('/netease')
@routes.get('/netease/')
async def withoutID(request):
        resp = render(request)
        return resp



@routes.get('/netease/{id}/')
@routes.get('/netease/{id}')
async def withID(request):
    songID = request.match_info['id']
    if 'User-Agent' in request.headers:
        ua = request.headers.get('User-Agent')
        if ('bot' not in ua) and ('Bot' not in ua) and ('curl' not in ua):
            logging.info(f'{ua} is a browser.')
            resp = render(request)
            return resp
        else:
            logging.info(f'{ua} is not a browser.')
    else:
        logging.info(f'NO UA found.')
    # DO detailed
    try:
        int(songID)
        apiUrl = f'http://music.163.com/api/song/detail/?id={songID}&ids=%5B{songID}%5D'
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(5)) as session:
            async with session.get(apiUrl) as resp:
                result = await resp.text()
        result = json.loads(result)
        songTitle = result['songs'][0]['name']
        artist = ''
        for one_artist in result['songs'][0]['artists']:
            artist += one_artist['name']
            artist += ', '
        artist = artist[:len(artist)-2]
        coverUrl = result['songs'][0]['album']['picUrl']
        year = result['songs'][0]['album']['publishTime']
        year = datetime.datetime.fromtimestamp(int(year/1000)).year
        resp = render(request, True, songID, songTitle, artist, str(year), coverUrl)
    except Exception as e:
        logging.error(f'Get detail failed. {e}')
        resp = render(request)
    finally:
        return resp


def render(request, detailed=False, songid=None, songTitle=None, artist=None, year=None, coverUrl=None):
    if not detailed:
        context = {
            'detailed': False
        }
    else:
        context = {
                'detailed': True,
                'songid': songid,
                'songTitle': songTitle,
                'artist': artist,
                'year': year,
                'coverUrl': coverUrl
            }
    response = aiohttp_jinja2.render_template('base.html', request, context)
    return response


if __name__ == '__main__':
    main()
