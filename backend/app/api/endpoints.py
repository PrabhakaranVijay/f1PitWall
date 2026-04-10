from fastapi import APIRouter, HTTPException
import httpx
from app.application.race_snapshot import race_snapshot_service
from app.config import settings
import requests
import time
from datetime import datetime, timezone

router = APIRouter()

YOUTUBE_API_KEY = settings.YOUTUBE_API_KEY
CHANNEL_ID = settings.CHANNEL_ID or "UC3kxJQ9RfaS5CKeYbbFMi4Q"

cache = {"data": None, "timestamp": 0}
CACHE_TTL = 30  # seconds


# @router.get("/f1/highlights")
# def get_f1_highlights():

#     url = "https://www.googleapis.com/youtube/v3/search"

#     params = {
#         "key": YOUTUBE_API_KEY,
#         "channelId": CHANNEL_ID,
#         "part": "snippet",
#         "order": "date",
#         "maxResults": 10,
#         "type": "video"
#     }

#     response = requests.get(url, params=params)
#     data = response.json()

#     videos = []

#     # find the first video with "highlight" in title
#     for item in data.get("items", []):
#         title = item["snippet"]["title"].lower()

#         if "highlight" in title:
#             return {
#                 "videoId": item["id"]["videoId"],
#                 "title": item["snippet"]["title"],
#                 "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]
#             }


#     return videos

# # it working 
# @router.get("/f1/highlights")
# def get_f1_highlights():

#     search_url = "https://www.googleapis.com/youtube/v3/search"

#     params = {
#         "key": YOUTUBE_API_KEY,
#         "channelId": CHANNEL_ID,
#         "part": "snippet",
#         "order": "date",
#         "maxResults": 10,
#         "type": "video"
#     }

#     response = requests.get(search_url, params=params)
#     data = response.json()

#     for item in data.get("items", []):
#         video_id = item["id"]["videoId"]

#         # Check if embeddable
#         video_url = "https://www.googleapis.com/youtube/v3/videos"
#         video_params = {
#             "key": YOUTUBE_API_KEY,
#             "id": video_id,
#             "part": "status"
#         }

#         v = requests.get(video_url, params=video_params).json()

#         if v["items"] and v["items"][0]["status"]["embeddable"]:
#             return {
#                 "videoId": video_id,
#                 "title": item["snippet"]["title"],
#                 "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]
#             }

#     return {}

# @router.get("/f1/highlights")
# def get_f1_highlights():

#     url = "https://www.googleapis.com/youtube/v3/search"

#     params = {
#         "key": YOUTUBE_API_KEY,
#         "q": "F1 race highlights",
#         "part": "snippet",
#         "maxResults": 8,
#         "type": "video"
#     }

#     response = requests.get(url, params=params)
#     data = response.json()

#     videos = []

#     for item in data.get("items", []):
#         videos.append({
#             "videoId": item["id"]["videoId"],
#             "title": item["snippet"]["title"],
#             "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]
#         })

#     return videos

@router.get("/f1/highlights")
def get_f1_highlights():

    search_url = "https://www.googleapis.com/youtube/v3/search"

    params = {
        "key": YOUTUBE_API_KEY,
        "q": "F1 race highlights",
        "type": "video",
        "part": "snippet",
        "maxResults": 15
    }

    search = requests.get(search_url, params=params).json()

    videos = []

    for item in search.get("items", []):

        video_id = item["id"]["videoId"]

        check_url = "https://www.googleapis.com/youtube/v3/videos"

        check_params = {
            "key": YOUTUBE_API_KEY,
            "id": video_id,
            "part": "status,contentDetails"
        }

        check = requests.get(check_url, params=check_params).json()

        if not check.get("items"):
            continue

        status = check["items"][0]["status"]

        if status.get("embeddable") and status.get("privacyStatus") == "public":

            videos.append({
                "videoId": video_id,
                "title": item["snippet"]["title"],
                "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]
            })

        if len(videos) >= 6:
            break

    return videos


@router.get("/race/snapshot")
async def get_race_snapshot(session: str = "latest"):
    return await race_snapshot_service.build_snapshot(session)

# @router.get("/championship")
# async def get_championship():

#     now = time.time()

#     if cache["data"] and now - cache["timestamp"] < CACHE_TTL:
#         return cache["data"]

#     async with httpx.AsyncClient() as client:
#         response = await client.get("https://api.openf1.org/v1/drivers")
#         data = response.json()

#     drivers = []

#     for i, d in enumerate(data[:5]):
#         drivers.append({
#             "pos": i + 1,
#             "first": d.get("first_name"),
#             "last": d.get("last_name"),
#             "team": d.get("team_name"),
#             "number": d.get("driver_number"),
#             "points": d.get("points", 0),
#             "img": f"/drivers/{d.get('driver_number')}.png",
#             "color": d.get("team_colour", "#444")
#         })

#     cache["data"] = drivers
#     cache["timestamp"] = now

#     return drivers

@router.get("/championship")
async def get_championship(limit: int = 5):

    year = datetime.now().year
    url = f"https://api.jolpi.ca/ergast/f1/{year}/driverstandings/"

    now = time.time()

    if cache["data"] and now - cache["timestamp"] < CACHE_TTL:
        return cache["data"][:limit]

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()

    standings = data["MRData"]["StandingsTable"]["StandingsLists"][0]["DriverStandings"]

    drivers = []

    for d in standings:

        if "position" not in d:
            continue

        driver = d["Driver"]
        constructor = d["Constructors"][0]

        drivers.append({
            "pos": int(d["position"]),
            "first": driver["givenName"],
            "last": driver["familyName"],
            "team": constructor["name"],
            "number": driver.get("permanentNumber"),
            "points": int(d["points"]),
            "code": driver["code"]
        })

    cache["data"] = drivers
    cache["timestamp"] = now

    return drivers[:limit]

@router.get("/timeline")
async def get_race_timeline(limit: int = 5):

    year = datetime.now().year
    url = f"https://api.jolpi.ca/ergast/f1/{year}/races/"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()

    races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])

    today = datetime.now(timezone.utc).date()

    timeline = []

    for race in races:
        race_date_str = race.get("date")

        if not race_date_str:
            continue

        race_date = datetime.fromisoformat(race_date_str).date()

        timeline.append({
            "round": race.get("round"),
            "race": race.get("raceName"),
            "circuit": race.get("Circuit", {}).get("circuitName"),
            "country": race.get("Circuit", {}).get("Location", {}).get("country"),
            "date": race_date_str,
            "time": race.get("time"),
            "status": "NEXT" if race_date >= today else "DONE"
        })

    return timeline[:limit]

@router.get("/drivers")
async def get_drivers(session_key: int = None):
    # For now, proxy to OpenF1 directly to serve frontend quickly if not in DB
    url = f"{settings.OPENF1_API_URL}/drivers"
    if session_key:
        url += f"?session_key={session_key}"
        
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url)
            return res.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/latest")
async def get_latest_session():
    # Helper to get the most recent session from OpenF1
    url = f"{settings.OPENF1_API_URL}/sessions"
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url)
            data = res.json()
            if data:
                return sorted(data, key=lambda x: x.get('date_start', ''), reverse=True)[0]
            return {}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
