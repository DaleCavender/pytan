from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.models import GameState, Player, GameSettings
import json
import os
import uuid
import random
import traceback
import time
import copy
from .board_gen import generate_board
from .engine import process_action, touches_player_road, touches_player_building_or_road, is_distance_rule_met, find_intersection, find_path, run_post_action_checks, get_player
from dataclasses import asdict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()
ACTIVE_GAMES: dict[str, GameState] = {}
GAME_ROOMS: dict[str, dict[WebSocket, int]] = {}
DEV_MODE = False

app.mount("/js", StaticFiles(directory=os.path.join(BASE_DIR, "static/js")), name="js")
app.mount("/css", StaticFiles(directory=os.path.join(BASE_DIR, "static/css")), name="css")
app.mount("/images", StaticFiles(directory=os.path.join(BASE_DIR, "static/images")), name="images")
app.mount("/fonts", StaticFiles(directory=os.path.join(BASE_DIR, "static/fonts")), name="fonts")
app.mount("/audio", StaticFiles(directory=os.path.join(BASE_DIR, "static/audio")), name="audio")

templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))


def create_dynamic_game(game_id: str, creator_cookies: dict):
    num_players = int(creator_cookies.get("numPlayersDesired", 4))
    group_id = creator_cookies.get("groupName", "catan-game")
    vp = int(creator_cookies.get("victoryPoints", 10))
    deck = (["Knight"] * 14 + ["Victory Point"] * 5 + 
            ["Road Building"] * 2 + ["Year of Plenty"] * 2 + ["Monopoly"] * 2)
    random.shuffle(deck)

    settings = GameSettings(
        numPlayers=num_players,
        victoryPoints=vp,
    )
    
    return GameState(
        game_id=group_id,
        players=[],      
        turnOrder=[],    
        board=generate_board(num_players),
        status="WAITING",
        settings=settings,
        dev_card_deck=deck
    )

def exclude_nones(data_tuples):
    """Filters out any keys that have a value of None."""
    return {k: v for k, v in data_tuples if v is not None}

async def broadcast_game_state(game_id: str):
    game = ACTIVE_GAMES.get(game_id)
    if not game: return

    game_dict = asdict(game, dict_factory=exclude_nones)

    for i, p_obj in enumerate(game.players):
        p_dict = game_dict["players"][i]
        p_dict["numResourceCards"] = p_obj.numResourceCards
        p_dict["numDevelopmentCards"] = p_obj.numDevelopmentCards

    current_room = dict(GAME_ROOMS.get(game_id, {}))

    for ws, pid in current_room.items():
        player_obj = next((p for p in game.players if p.id == pid), None)
        
        if player_obj is None:
            continue

        follow_up = None
        if pid in game.discard_pending:
            follow_up = {
                "actionName": "dropCards", 
                "actionData": {"numToDrop": game.discard_pending[pid]}
            }
        elif getattr(game, 'expected_action', None) == "reviewTrade" and game.active_trade:
            if pid == game.currentTurn:
                follow_up = {
                    "actionName": "tradeResponse",
                    "actionData": {"trade": game.active_trade}
                }
            elif pid not in game.active_trade.get("_acceptedTrade", []) and pid not in game.active_trade.get("_declinedTrade", []):
                follow_up = {
                    "actionName": "reviewTrade",
                    "actionData": {"trade": game.active_trade}
                }
        elif pid == game.currentTurn and getattr(game, 'expected_action', None):
            action_req = game.expected_action
            if action_req in ["placeSettlement", "placeRoad", "roadBuilding1", "roadBuilding2"]:
                frontend_act = "placeSettlement" if action_req == "placeSettlement" else "placeRoad"
                msg = "Place a free road!" if "roadBuilding" in action_req else ("Place a Settlement" if action_req == "placeSettlement" else "Place a Road")
                follow_up = {"actionName": frontend_act, "actionData": {"message": msg}}
            elif action_req == "rollDice":
                follow_up = {"actionName": "rollDice", "actionData": {"message": "Please roll the dice"}}
            elif action_req == "knightOrDice":
                follow_up = {"actionName": "knightOrDice", "actionData": {"message": "Play a Knight before rolling?"}}
            elif action_req == "moveRobber":
                follow_up = {"actionName": "moveRobber", "actionData": {"message": "Move the Robber!"}}
            elif action_req == "takeCard":
                follow_up = {"actionName": "takeCard", "actionData": {"toTake": game.valid_rob_targets}}

        current_board = copy.deepcopy(game_dict["board"])

        for intersect_dict in current_board["intersections"]:
            intersect_obj = find_intersection(game, intersect_dict["coordinate"])
            
            is_valid = not intersect_dict.get("building") and is_distance_rule_met(game, intersect_obj)
            
            if game.status == "PROGRESS":
                is_valid = is_valid and touches_player_road(game, pid, intersect_obj)
            
            intersect_dict["canBuildSettlement"] = is_valid

        for path_dict in current_board["paths"]:
            path_obj = find_path(game, path_dict)
            
            is_valid = not path_dict.get("road")
            if game.status == "SETUP":
                is_valid = is_valid and (path_obj.start == game.last_settlement_coord or path_obj.end == game.last_settlement_coord)
            else:
                is_valid = is_valid and touches_player_building_or_road(game, pid, path_obj)
            
            path_dict["canBuildRoad"] = is_valid

        res = player_obj.resources
        can_road = res['brick'] >= 1 and res['wood'] >= 1 and player_obj.numRoads >= 1
        can_settle = res['brick'] >= 1 and res['wood'] >= 1 and res['sheep'] >= 1 and res['wheat'] >= 1 and player_obj.numSettlements >= 1
        can_city = res['wheat'] >= 2 and res['ore'] >= 3 and player_obj.numCities >= 1
        can_develop = res['sheep'] >= 1 and res['wheat'] >= 1 and res['ore'] >= 1 and len(game.dev_card_deck) > 0

        player_statuses = {}
        if game.discard_pending:
            for p_id in game.discard_pending:
                player_statuses[p_id] = "Discarding ⚠️"
            if game.currentTurn not in game.discard_pending:
                player_statuses[game.currentTurn] = "Waiting on others ⏳"
        elif getattr(game, 'expected_action', None):
            act = game.expected_action
            status_map = {
                "rollDice": "Rolling Dice 🎲",
                "knightOrDice": "Rolling Dice 🎲",
                "placeSettlement": "Building Settlement 🏠",
                "placeRoad": "Building Road 🛤️",
                "moveRobber": "Moving Robber 🦹",
                "takeCard": "Stealing Card 🕵️",
                "reviewTrade": "Trading 🤝"
            }
            player_statuses[game.currentTurn] = status_map.get(act, "Thinking 🤔")
        else:
            if getattr(game, 'is_special_build_phase', False):
                player_statuses[game.currentTurn] = "Special Building 🔨"
            else:
                player_statuses[game.currentTurn] = "Taking Turn ⏳"

        response = {
            "requestType": "getGameState",
            "playerID": pid,
            "currentTurn": game.currentTurn,
            "turnOrder": game.turnOrder,
            "settings": game_dict["settings"],
            "players": game_dict["players"],
            "board": current_board,
            "hand": {
                "resources": player_obj.resources,
                "devCards": {k: player_obj.dev_cards.get(k, 0) + player_obj.new_dev_cards.get(k, 0) for k in player_obj.dev_cards},
                "canBuildSettlement": can_settle,
                "canBuildRoad": can_road,
                "canBuildCity": can_city,
                "canBuyDevCard": can_develop 
            },
            "stats": game.stats,
            "playerStatuses": player_statuses
        }
        if follow_up:
            response["followUp"] = follow_up
        try:
            await ws.send_text(json.dumps(response))
        except Exception:
            pass

# --- HTTP Routes ---

@app.get("/")
async def root():
    return RedirectResponse(url="/home")

@app.get("/home")
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request, "title": "Catan : Home"})

@app.get("/board")
async def board(request: Request):
    return templates.TemplateResponse("board.html", {"request": request, "title": "Play Catan"})

# --- WebSocket Endpoints ---

@app.websocket("/groups/")
async def websocket_groups(websocket: WebSocket):
    """Replaces GroupViewWebsocket.java to show active games on the home screen."""
    await websocket.accept()
    cookies = websocket.cookies
    try:
        while True:
            groups_list = []
            for gid, game in ACTIVE_GAMES.items():
                if len(game.players) < game.settings.numPlayers:
                    groups_list.append({
                        "group": {
                            "id": gid,
                            "groupName": game.game_id,
                            "currentSize": len(game.players),
                            "maxSize": game.settings.numPlayers
                        }
                    })

            lobby_data = {
                "atLimit": len(ACTIVE_GAMES) >= 20,
                "groups": groups_list
            }
            
            await websocket.send_text(json.dumps(lobby_data))
            
            data = await websocket.receive_text()
            if "HEARTBEAT" in data:
                await websocket.send_text(json.dumps("HEARTBEAT"))
                
    except WebSocketDisconnect:
        pass

@app.websocket("/action/")
async def websocket_action(websocket: WebSocket):
    await websocket.accept()
    game_id = None
    
    try:
        cookies = websocket.cookies
        user_name = cookies.get("userName", "Guest")
        client_uuid = cookies.get("USER_ID") 
        game_id = cookies.get("desiredGroupId") or cookies.get("groupName")

        if not game_id:
            await websocket.close(code=1000)
            return

        if not client_uuid:
            client_uuid = str(uuid.uuid4())
            await websocket.send_text(json.dumps({
                "requestType": "setCookie",
                "cookies": [{"name": "USER_ID", "value": client_uuid}]
            }))

        if game_id not in ACTIVE_GAMES:
            ACTIVE_GAMES[game_id] = create_dynamic_game(game_id, cookies)
            GAME_ROOMS[game_id] = {} 
            
        game = ACTIVE_GAMES[game_id]

        player = next((p for p in game.players if getattr(p, 'uuid', None) == client_uuid), None)
        
        if not player and len(game.players) < game.settings.numPlayers:
            new_id = max([p.id for p in game.players] + [-1]) + 1
            colors = ["#BF2720", "#115EC9", "#DFA629", "#EDEAD9", "#8B4513", "#228B22"]
            player = Player(id=new_id, name=user_name, uuid=client_uuid, color=colors[new_id % len(colors)])
            game.players.append(player)
            game.turnOrder.append(new_id)
            
        if not player:
            await websocket.close(code=1008)
            return
        
        GAME_ROOMS[game_id][websocket] = player.id

        ready_to_start = (len(game.players) == 1) if DEV_MODE else (len(game.players) == game.settings.numPlayers)

        if ready_to_start and game.status == "WAITING":
            game.status = "SETUP"
            random.shuffle(game.turnOrder)
            game.setup_queue = list(game.turnOrder) + list(reversed(game.turnOrder))
            game.currentTurn = game.setup_queue[0]
            
            for ws, pid in GAME_ROOMS[game_id].items():
                start_msg = {
                    "requestType": "action",
                    "action": "startGame",
                    "content": {
                        "data": {
                            "turnOrder": game.turnOrder,
                            "isFirst": (pid == game.currentTurn)
                        }
                    }
                }
                await ws.send_text(json.dumps(start_msg))
                
        await broadcast_game_state(game_id)
        
        while True:
            raw_data = await websocket.receive_text()
            
            if "HEARTBEAT" in raw_data:
                await websocket.send_text(json.dumps("HEARTBEAT"))
                continue
                
            payload = json.loads(raw_data)
            req_type = payload.get("requestType")
            
            if req_type == "action":
                messages_out = []
                if process_action(game, player.id, payload, messages_out):
                    run_post_action_checks(game, messages_out)
                    for target, msg in messages_out:
                        for socket, pid in GAME_ROOMS[game_id].items():
                            if target == "all" or target == pid:
                                msg_payload = {
                                    "requestType": "action",
                                    "action": "systemMessage", 
                                    "content": {"message": msg}
                                }
                                await socket.send_text(json.dumps(msg_payload))
                    active_count = len([p for p in game.players if p.is_active])
                    if active_count == 0:
                        print(f"Game {game_id} finished: All players left.")
                        if game_id in ACTIVE_GAMES: del ACTIVE_GAMES[game_id]
                        if game_id in GAME_ROOMS: del GAME_ROOMS[game_id]
                        return 
                    await broadcast_game_state(game_id)
                    
            elif req_type == "getGameState":
                await broadcast_game_state(game_id)
                
            elif req_type == "chat":
                if payload.get("logs"):
                    await websocket.send_text(json.dumps({
                        "requestType": "chat", 
                        "logs": game.chat_log
                    }))
                elif "message" in payload:
                    import time
                    chat_msg = {
                        "requestType": "chat",
                        "userId": player.id,
                        "sender": player.name,
                        "content": payload["message"],
                        "timeStamp": int(time.time() * 1000)  
                    }
                    
                    game.chat_log.append(chat_msg)
                    
                    for ws_conn in list(GAME_ROOMS[game_id].keys()):
                        try:
                            await ws_conn.send_text(json.dumps(chat_msg))
                        except Exception as e:
                            print(f"Failed to send chat to a socket: {e}")

                
    except WebSocketDisconnect:
        print(f"Socket Disconnected: Player {user_name}")
    except Exception as e:
        print(f"SERVER ERROR: {e}")
        traceback.print_exc()
    finally:
        if game_id and game_id in GAME_ROOMS:
            if websocket in GAME_ROOMS[game_id]:
                del GAME_ROOMS[game_id][websocket]

            if game_id in ACTIVE_GAMES:
                await broadcast_game_state(game_id)