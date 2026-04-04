# # # from fastapi import APIRouter

# # # router = APIRouter()

# # # @router.get("/championship")
# # # def get_championship():
# # #     return [
# # #         {
# # #             "pos": 1,
# # #             "first": "Max",
# # #             "last": "Verstappen",
# # #             "team": "Red Bull",
# # #             "number": 1,
# # #             "points": 575,
# # #             "img": "/drivers/max.png",
# # #             "color": "#3671C6"
# # #         },
# # #         {
# # #             "pos": 2,
# # #             "first": "Lando",
# # #             "last": "Norris",
# # #             "team": "McLaren",
# # #             "number": 4,
# # #             "points": 392,
# # #             "img": "/drivers/norris.png",
# # #             "color": "#FF8000"
# # #         },
# # #         {
# # #             "pos": 3,
# # #             "first": "Charles",
# # #             "last": "Leclerc",
# # #             "team": "Ferrari",
# # #             "number": 16,
# # #             "points": 356,
# # #             "img": "/drivers/leclerc.png",
# # #             "color": "#E10600"
# # #         }
# # #     ]


# # from fastapi import APIRouter
# # import httpx

# # router = APIRouter()

# # OPENF1_DRIVERS = "https://api.openf1.org/v1/drivers"


# # @router.get("/championship")
# # async def get_championship():

# #     async with httpx.AsyncClient() as client:
# #         response = await client.get(OPENF1_DRIVERS)
# #         data = response.json()

# #     drivers = []

# #     for i, d in enumerate(data[:10]):  # top 10 drivers
# #         drivers.append({
# #             "pos": i + 1,
# #             "first": d.get("first_name"),
# #             "last": d.get("last_name"),
# #             "team": d.get("team_name"),
# #             "number": d.get("driver_number"),
# #             "points": d.get("points", 0),
# #             "img": f"/drivers/{d.get('driver_number')}.png",
# #             "color": d.get("team_colour", "#444")
# #         })

# #     return drivers

# from fastapi import APIRouter
# import httpx

# router = APIRouter()

# API_URL = "https://api.jolpi.ca/ergast/f1/2026/driverStandings.json"


# @router.get("/championship")
# async def get_championship(limit: int = 5):

#     async with httpx.AsyncClient() as client:
#         res = await client.get(API_URL)
#         data = res.json()

#     standings = data["MRData"]["StandingsTable"]["StandingsLists"][0]["DriverStandings"]

#     drivers = []

#     for d in standings[:limit]:
#         driver = d["Driver"]
#         constructor = d["Constructors"][0]

#         drivers.append({
#             "pos": int(d["position"]),
#             "first": driver["givenName"],
#             "last": driver["familyName"],
#             "team": constructor["name"],
#             "number": driver.get("permanentNumber", ""),
#             "points": int(d["points"])
#         })

#     return drivers


from fastapi import APIRouter
import httpx

router = APIRouter()

API_URL = "https://api.jolpi.ca/ergast/f1/2026/driverstandings/"


@router.get("/championship")
async def get_championship(limit: int = 5):

    async with httpx.AsyncClient() as client:
        res = await client.get(API_URL)
        data = res.json()

    standings = data["MRData"]["StandingsTable"]["StandingsLists"][0]["DriverStandings"]

    drivers = []

    for d in standings[:limit]:

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

    return drivers