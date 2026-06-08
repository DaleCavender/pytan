from .models import GameState
import random

ACTION_REGISTRY = {}
ALLOWED_COLORS = ["#BF2720", "#115EC9", "#DFA629", "#EDEAD9", "#8B4513", "#228B22"]

def register_action(action_name: str):
    """Decorator to easily register action handlers."""
    def decorator(func):
        ACTION_REGISTRY[action_name] = func
        return func
    return decorator

def get_player(game: GameState, player_id: int):
    return next((p for p in game.players if p.id == player_id), None)

def coords_match(c1, c2) -> bool:
    list1 = sorted([(c1.coord1.x, c1.coord1.y, c1.coord1.z),
                    (c1.coord2.x, c1.coord2.y, c1.coord2.z),
                    (c1.coord3.x, c1.coord3.y, c1.coord3.z)])
    list2 = sorted([(c2['coord1']['x'], c2['coord1']['y'], c2['coord1']['z']),
                    (c2['coord2']['x'], c2['coord2']['y'], c2['coord2']['z']),
                    (c2['coord3']['x'], c2['coord3']['y'], c2['coord3']['z'])])
    return list1 == list2

def coords_equal(c1, c2) -> bool:
    list1 = sorted([(c1.coord1.x, c1.coord1.y, c1.coord1.z),
                    (c1.coord2.x, c1.coord2.y, c1.coord2.z),
                    (c1.coord3.x, c1.coord3.y, c1.coord3.z)])
    list2 = sorted([(c2.coord1.x, c2.coord1.y, c2.coord1.z),
                    (c2.coord2.x, c2.coord2.y, c2.coord2.z),
                    (c2.coord3.x, c2.coord3.y, c2.coord3.z)])
    return list1 == list2

def is_distance_rule_met(game: GameState, target_intersect) -> bool:
    for path in game.board.paths:
        if coords_equal(path.start, target_intersect.coordinate) or coords_equal(path.end, target_intersect.coordinate):
            neighbor = path.end if coords_equal(path.start, target_intersect.coordinate) else path.start
            for i in game.board.intersections:
                if coords_equal(i.coordinate, neighbor) and i.building is not None:
                    return False
    return True

def touches_player_road(game: GameState, player_id: int, target_intersect) -> bool:
    for path in game.board.paths:
        if path.road and path.road["player"] == player_id:
            if coords_equal(path.start, target_intersect.coordinate) or coords_equal(path.end, target_intersect.coordinate):
                return True
    return False

def touches_player_building_or_road(game: GameState, player_id: int, target_path) -> bool:
    for i in game.board.intersections:
        if (coords_equal(i.coordinate, target_path.start) or coords_equal(i.coordinate, target_path.end)) and i.building and i.building["player"] == player_id:
            return True
    for p in game.board.paths:
        if p.road and p.road["player"] == player_id:
            if coords_equal(p.start, target_path.start) or coords_equal(p.start, target_path.end) or \
            coords_equal(p.end, target_path.start) or coords_equal(p.end, target_path.end):
                return True
    return False

def find_intersection(game: GameState, payload_coord: dict):
    for i in game.board.intersections:
        if coords_match(i.coordinate, payload_coord):
            return i
    return None

def find_path(game: GameState, payload: dict):
    for p in game.board.paths:
        if (coords_match(p.start, payload["start"]) and coords_match(p.end, payload["end"])) or \
           (coords_match(p.start, payload["end"]) and coords_match(p.end, payload["start"])):
            return p
    return None

def update_player_rates(game: GameState, player_id: int):
    player = get_player(game, player_id)
    if not player: return

    new_rates = {res: 4 for res in ["brick", "wood", "ore", "wheat", "sheep"]}

    for intersect in game.board.intersections:
        if intersect.building and intersect.building["player"] == player_id:
            
            for tile in game.board.tiles:
                if tile.portType and intersect.coordinate in tile.portLocations:
                    
                    p_type = tile.portType.lower() 
                    
                    if p_type == "wildcard":
                        for res in new_rates:
                            if new_rates[res] > 3:
                                new_rates[res] = 3
                    else:
                        new_rates[p_type] = 2

    player.rates = new_rates

def update_largest_army(game: GameState):
    current_leader = next((p for p in game.players if p.largestArmy), None)
    max_knights = current_leader.numPlayedKnights if current_leader else 2
    
    new_leader = None
    for p in game.players:
        if p.numPlayedKnights > max_knights:
            max_knights = p.numPlayedKnights
            new_leader = p
            
    if new_leader and new_leader != current_leader:
        if current_leader:
            current_leader.largestArmy = False
            current_leader.victoryPoints -= 2
        new_leader.largestArmy = True
        new_leader.victoryPoints += 2
        return f"{new_leader.name} now has the Largest Army!"
    return None

def get_player_road_length(game: GameState, player_id: int) -> int:
    player_roads = [p for p in game.board.paths if p.road and p.road["player"] == player_id]
    if not player_roads: return 0

    def find_longest_from(current_node, visited_edges):
        max_len = 0
        for path in player_roads:
            edge_id = frozenset([path.start, path.end])
            if edge_id not in visited_edges:
                if path.start == current_node or path.end == current_node:
                    blocking_building = False
                    for i in game.board.intersections:
                        if i.coordinate == current_node and i.building:
                            if i.building["player"] != player_id:
                                blocking_building = True
                    
                    if not blocking_building:
                        next_node = path.end if path.start == current_node else path.start
                        visited_edges.add(edge_id)
                        length = 1 + find_longest_from(next_node, visited_edges)
                        max_len = max(max_len, length)
                        visited_edges.remove(edge_id) 
        return max_len

    overall_max = 0
    nodes = set()
    for p in player_roads:
        nodes.add(p.start)
        nodes.add(p.end)
    
    for start_node in nodes:
        overall_max = max(overall_max, find_longest_from(start_node, set()))
    
    return overall_max

def update_longest_road(game: GameState):
    current_leader = next((p for p in game.players if p.longestRoad), None)
    max_len = current_leader.longestRoadLength if current_leader else 4
    
    new_leader = None
    for p in game.players:
        p.longestRoadLength = get_player_road_length(game, p.id)
        if p.longestRoadLength > max_len:
            max_len = p.longestRoadLength
            new_leader = p
            
    if new_leader and new_leader != current_leader:
        if current_leader:
            current_leader.longestRoad = False
            current_leader.victoryPoints -= 2
        new_leader.longestRoad = True
        new_leader.victoryPoints += 2
        return f"{new_leader.name} now has the Longest Road ({max_len})!"
    return None

def handle_leave_game(game: GameState, player_id: int, messages_out: list) -> bool:
    player = get_player(game, player_id)
    if not player:
        return False

    if game.status == "WAITING":
        game.players = [p for p in game.players if p.id != player_id]
        if player_id in game.turnOrder:
            game.turnOrder.remove(player_id)
        
        if player_id in game.setup_queue:
            game.setup_queue.remove(player_id)
            
        messages_out.append(("all", f"🚪 {player.name} left the lobby."))
        return True

    player.is_active = False
    messages_out.append(("all", f"🏳️ {player.name} has left the game!"))

    if player_id in game.discard_pending:
        del game.discard_pending[player_id]
        
    if game.active_trade:
        if player_id in game.active_trade.get("_acceptedTrade", []):
            game.active_trade["_acceptedTrade"].remove(player_id)
        if player_id not in game.active_trade.get("_declinedTrade", []):
            game.active_trade["_declinedTrade"].append(player_id)

    if game.currentTurn == player_id:
        if getattr(game, 'is_special_build_phase', False):
            if game.special_build_queue:
                game.currentTurn = game.special_build_queue.pop(0)
                messages_out.append(("all", f"Special Building Phase: {get_player(game, game.currentTurn).name} can build."))
            else:
                game.is_special_build_phase = False
                for p in game.players: 
                    p.wants_special_build = False
                
                if getattr(game, 'original_turn', None) is not None:
                    game.currentTurn = game.original_turn
                    game.original_turn = None
                pass_to_next_active_player(game, messages_out)
        else:
            pass_to_next_active_player(game, messages_out)
    return True


def pass_to_next_active_player(game: GameState, messages_out: list):
    """Recursively passes the turn until it hits an active player."""

    active_count = sum(1 for p in game.players if p.is_active)
    if active_count == 0:
        game.expected_action = None
        return  
    
    if game.expected_action in ["moveRobber", "takeCard"]:
        desert = next((t for t in game.board.tiles if t.type == "DESERT"), game.board.tiles[0])
        for t in game.board.tiles: t.hasRobber = False
        desert.hasRobber = True
        game.expected_action = None
        game.valid_rob_targets = []
    
    game.last_roll = None
    game.active_trade = None
    game.has_rolled = False

    curr_idx = game.turnOrder.index(game.currentTurn)
    next_idx = (curr_idx + 1) % len(game.turnOrder)
    game.currentTurn = game.turnOrder[next_idx]
    
    if next_idx == 0:
        game.stats["turn"] += 1

    next_player = get_player(game, game.currentTurn)
    
    if not next_player.is_active:
        messages_out.append(("all", f"Skipping {next_player.name} (Offline)."))
        pass_to_next_active_player(game, messages_out)
    else:
        if next_player.dev_cards.get("Knight", 0) > 0:
            game.expected_action = "knightOrDice"
        else:
            game.expected_action = "rollDice"

def run_post_action_checks(game: GameState, messages_out: list):
    """Handles logic that must run after any state change (Roads, Army, Winners)."""
    
    road_msg = update_longest_road(game)
    if road_msg: messages_out.append(("all", road_msg))
    
    army_msg = update_largest_army(game)
    if army_msg: messages_out.append(("all", army_msg))
    
    if game.status != "FINISHED":
        for p in game.players:
            total_vp = p.victoryPoints + p.dev_cards.get("Victory Point", 0)
            if total_vp >= game.settings.victoryPoints:
                game.winner = p.id
                game.status = "FINISHED"
                messages_out.append(("all", f"🏆 GAME OVER! {p.name} has won the game with {total_vp} points!"))
                break

def process_action(game: GameState, player_id: int, payload: dict, messages_out: list) -> bool:
    # 1. State Cleanup
    if game.expected_action is None and getattr(game, 'active_trade', None) is not None:
        game.active_trade = None

    action_name = payload.get("action")
    player = get_player(game, player_id)
    if not player: 
        return False
        
    if action_name == "leaveGame" or payload.get("reason") == "forfeitGame":
        return handle_leave_game(game, player_id, messages_out)

    mandatory_actions = ["rollDice", "knightOrDice", "takeCard", "dropCards", "placeSettlement", "placeRoad", "reviewTrade"]
    free_play_actions = ["buildSettlement", "buildCity", "buildRoad", "buyDevCard", "playKnight", "playYearOfPlenty", "playMonopoly", "playRoadBuilding", "proposeTrade", "tradeWithBank"]
    
    if game.expected_action in mandatory_actions and action_name in free_play_actions:
        messages_out.append((player_id, "You must complete your current action first!"))
        return False
        
    if game.status == "SETUP":
        if player_id != game.currentTurn:
            return False
        if game.expected_action and action_name != game.expected_action:
            return False

    handler = ACTION_REGISTRY.get(action_name)
    if not handler:
        print(f"Invalid or unregistered action {action_name} by player {player_id}")
        return False
        
    success = handler(game, player_id, payload, messages_out)

    if success:
        run_post_action_checks(game, messages_out)
    
    return success

@register_action("updateResource")
def handle_give_resources(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if not game.dev_mode:
        return False
    player = get_player(game, player_id)
    for res in player.resources: player.resources[res] = 99
    return True

@register_action("startSetup")
def handle_start_setup(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if player_id == game.setup_queue[0]:
        game.expected_action = "placeSettlement"
        return True

@register_action("knightOrDice")
@register_action("rollDice")
def handle_start_turn(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    action_name = payload.get("action")
    if game.expected_action != action_name or player_id != game.currentTurn: return False
    player = get_player(game, player_id)
    if action_name == "knightOrDice":
        chose_knight = payload.get("choseKnight")
        if chose_knight and player.dev_cards.get("Knight", 0) > 0:
            player.dev_cards["Knight"] -= 1
            player.numPlayedKnights += 1
            game.expected_action = "moveRobber"
            messages_out.append(("all", f"{player.name} played a Knight before rolling!"))
        else:
            game.expected_action = "rollDice"
        return True

    elif action_name == "rollDice":

        die1 = random.randint(1, 6)
        die2 = random.randint(1, 6)
        roll = die1 + die2

        game.last_roll = {"die1": die1, "die2": die2}
        
        messages_out.append(("all", f"{player.name} rolled a {roll}!"))

        game.stats["rolls"][roll - 2] += 1

        game.has_rolled = True

        if roll == 7:
            game.expected_action = "moveRobber"
            messages_out.append(("all", "The Robber is loose!"))
            for p in game.players:
                if p.is_active and p.numResourceCards > 7:
                    game.discard_pending[p.id] = int(p.numResourceCards // 2)
        else:
            game.expected_action = None
            gains = {p.id: {} for p in game.players}
            
            for tile in game.board.tiles:
                if tile.number == roll and not tile.hasRobber:
                    res_type = tile.type.lower()
                    if res_type in ["desert", "sea"]: continue
                        
                    for intersect in game.board.intersections:
                        if tile.hexCoordinate in [intersect.coordinate.coord1, intersect.coordinate.coord2, intersect.coordinate.coord3]:
                            if intersect.building:
                                owner_id = intersect.building["player"]
                                amount = 1 if intersect.building["type"] == "settlement" else 2
                                gains[owner_id][res_type] = gains[owner_id].get(res_type, 0) + amount

            for p_id, res_dict in gains.items():
                if not res_dict: continue
                owner = get_player(game, p_id)
                if owner and owner.is_active:
                    parts = []
                    for r_type, amt in res_dict.items():
                        owner.resources[r_type] += amt
                        parts.append(f"{amt} {r_type}")
                    
                    gained_str = ", ".join(parts)
                    messages_out.append((owner.id, f"You received {gained_str}."))

        return True

@register_action("dropCards")
def handle_drop_cards(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if player_id not in game.discard_pending:
        return False
        
    to_drop = payload.get("toDrop", {})
    required_drop = game.discard_pending[player_id]
    
    actual_drop = sum(to_drop.values())
    if actual_drop != required_drop:
        return False
        
    player = get_player(game, player_id)

    for res, amount in to_drop.items():
        if amount < 0:
            return False
        if player.resources.get(res, 0) < amount:
            return False
            
    for res, amount in to_drop.items():
        player.resources[res] -= amount
    
    del game.discard_pending[player_id]
    
    messages_out.append(("all", f"{player.name} discarded {actual_drop} cards."))
    return True

@register_action("moveRobber")
def handle_move_robber(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if game.expected_action != "moveRobber" or player_id != game.currentTurn:
        return False
        
    if len(game.discard_pending) > 0:
        messages_out.append((player_id, "Waiting for players to discard..."))
        return False
        
    new_coord = payload.get("newLocation")
    if not new_coord: return False
    
    target_tile = None
    for t in game.board.tiles:
        if t.hexCoordinate.x == new_coord['x'] and t.hexCoordinate.y == new_coord['y'] and t.hexCoordinate.z == new_coord['z']:
            target_tile = t
            break
            
    if not target_tile or target_tile.hasRobber or target_tile.type == "SEA":
        return False
        
    for t in game.board.tiles:
        t.hasRobber = False
    target_tile.hasRobber = True
    player = get_player(game, player_id)
    
    messages_out.append(("all", f"{player.name} moved the Robber!"))
    
    victims = set()
    for intersect in game.board.intersections:
        if target_tile.hexCoordinate in [intersect.coordinate.coord1, intersect.coordinate.coord2, intersect.coordinate.coord3]:
            if intersect.building and intersect.building["player"] != player_id:
                victim = get_player(game, intersect.building["player"])
                if victim.numResourceCards > 0:
                    victims.add(victim.id)
    
    if victims:
        game.expected_action = "takeCard"
        game.valid_rob_targets = list(victims) 
    else:
        game.expected_action = None 
        
    return True

@register_action("takeCard")
def handle_steal_card(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if game.expected_action != "takeCard" or player_id != game.currentTurn:
        return False
    
    victim_id = payload.get("takeFrom")
    if victim_id not in game.valid_rob_targets:
        return False
        
    victim = get_player(game, victim_id)
    if not victim or victim.numResourceCards <= 0:
        return False

    player = get_player(game, player_id)
        
    available_cards = [res for res, amt in victim.resources.items() if amt > 0 for _ in range(int(amt))]
    if available_cards:
        stolen = random.choice(available_cards)
        
        victim.resources[stolen] -= 1
        player.resources[stolen] += 1
        
        messages_out.append((player_id, f"You stole 1 {stolen} from {victim.name}."))
        messages_out.append((victim_id, f"{player.name} stole 1 {stolen} from you!"))
        messages_out.append(("all", f"{player.name} stole a card from {victim.name}."))
        
    game.expected_action = None if game.has_rolled else "rollDice"
    game.valid_rob_targets = []
    return True


@register_action("placeSettlement") 
@register_action("buildSettlement")
def handle_build_settlement(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if player_id != game.currentTurn:
        return False
    player = get_player(game, player_id)
    action_name = payload.get("action")
    intersect = find_intersection(game, payload.get("coordinate"))
    
    if not intersect or intersect.building is not None or not is_distance_rule_met(game, intersect): 
        return False
        
    if game.status == "PROGRESS" and not touches_player_road(game, player_id, intersect):
        return False

    intersect.building = {"player": player_id, "type": "settlement"}
    game.last_settlement_coord = intersect.coordinate
    update_player_rates(game, player_id)
    
    player.numSettlements -= 1
    player.victoryPoints += 1

    messages_out.append(("all", f"{player.name} built a Settlement!"))
    
    if action_name == "buildSettlement":
        for res in ["brick", "wood", "wheat", "sheep"]: player.resources[res] -= 1

    if game.status == "SETUP":
        game.expected_action = "placeRoad"
        if player.numSettlements == 3:
            for tile in game.board.tiles:
                if tile.hexCoordinate in [intersect.coordinate.coord1, intersect.coordinate.coord2, intersect.coordinate.coord3]:
                    res_type = tile.type.lower()
                    if res_type not in ["desert", "sea"]:
                        player.resources[res_type] += 1
                        messages_out.append((player_id, f"You received 1 {res_type}."))
    for p in game.players:
        total_vp = p.victoryPoints + p.dev_cards.get("Victory Point", 0)
        if total_vp >= game.settings.victoryPoints:
            game.winner = p.id
            game.status = "FINISHED"
            messages_out.append(("all", f"🏆 GAME OVER! {p.name} has won the game with {total_vp} points!"))
            break
    return True

@register_action("buildCity")
def handle_build_city(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    player = get_player(game, player_id)
    if player_id != game.currentTurn or game.expected_action is not None:
        return False
        
    if player.resources['wheat'] < 2 or player.resources['ore'] < 3 or player.numCities < 1:
        return False
        
    target_coord = payload.get("coordinate")
    if not target_coord: return False
    
    intersect = find_intersection(game, target_coord)
    
    if not intersect or not intersect.building:
        return False
    if intersect.building["type"] != "settlement" or intersect.building["player"] != player_id:
        return False
        
    intersect.building["type"] = "city"
    
    player.resources['wheat'] -= 2
    player.resources['ore'] -= 3
    
    player.numCities -= 1
    player.numSettlements += 1
    
    player.victoryPoints += 1
    
    messages_out.append(("all", f"{player.name} built a City!"))
    total_vp = player.victoryPoints + player.dev_cards.get("Victory Point", 0)
    if total_vp >= game.settings.victoryPoints:
        game.winner = player.id
        game.status = "FINISHED"
        messages_out.append(("all", f"GAME OVER! {player.name} has won the game with {total_vp} points!"))
        
    return True


@register_action("placeRoad")
@register_action("buildRoad")
def handle_build_road(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if player_id != game.currentTurn:
        return False
    player = get_player(game, player_id)
    action_name = payload.get("action")
    path = find_path(game, payload)
    
    if not path or path.road is not None: return False
    
    if game.status == "SETUP":
        if path.start != game.last_settlement_coord and path.end != game.last_settlement_coord:
            return False 
    else:
        if not touches_player_building_or_road(game, player_id, path): 
            return False

    is_free = False
    if action_name == "placeRoad" and game.expected_action in ["roadBuilding1", "roadBuilding2"]:
        is_free = True

    path.road = {"player": player_id}
    player.numRoads -= 1
    messages_out.append(("all", f"{player.name} built a road."))
    msg = update_longest_road(game)
    if msg: messages_out.append(("all", msg))
    
    if is_free:
        if game.expected_action == "roadBuilding1":
            game.expected_action = "roadBuilding2"
        else:
            game.expected_action = None

    if game.status == "SETUP":
        game.setup_queue.pop(0)
        if not game.setup_queue:
            game.status = "PROGRESS"
            game.has_rolled = False
            game.expected_action = "rollDice"
            game.currentTurn = game.turnOrder[0]
        else:
            game.currentTurn = game.setup_queue[0]
            game.expected_action = "placeSettlement"
    elif action_name == "buildRoad":
        player.resources["brick"] -= 1
        player.resources["wood"] -= 1
    for p in game.players:
        total_vp = p.victoryPoints + p.dev_cards.get("Victory Point", 0)
        if total_vp >= game.settings.victoryPoints:
            game.winner = p.id
            game.status = "FINISHED"
            messages_out.append(("all", f"🏆 GAME OVER! {p.name} has won the game with {total_vp} points!"))
    return True

@register_action("buyDevCard")
def handle_buy_dev_card(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if player_id != game.currentTurn or not game.dev_card_deck:
        return False

    player = get_player(game, player_id)

    if player.resources['ore'] < 1 or player.resources['wheat'] < 1 or player.resources['sheep'] < 1:
        return False

    player.resources['ore'] -= 1
    player.resources['wheat'] -= 1
    player.resources['sheep'] -= 1

    card = game.dev_card_deck.pop()
    player.new_dev_cards[card] += 1

    messages_out.append((player_id, f"You received a {card}!"))
    messages_out.append(("all", f"{player.name} bought a Development Card."))
    for p in game.players:
        total_vp = p.victoryPoints + p.dev_cards.get("Victory Point", 0)
        if total_vp >= game.settings.victoryPoints:
            game.winner = p.id
            game.status = "FINISHED"
            messages_out.append(("all", f"🏆 GAME OVER! {p.name} has won the game with {total_vp} points!"))
    return True

@register_action("playKnight")
def handle_play_knight(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if game.is_special_build_phase: 
        messages_out.append((player_id, "You cannot play Development Cards during Special Build Phase!"))
        return False
    if player_id != game.currentTurn or player.dev_cards['Knight'] < 1:
        return False
    
    player = get_player(game, player_id)

    player.dev_cards['Knight'] -= 1
    player.numPlayedKnights += 1
    
    game.expected_action = "moveRobber"
    messages_out.append(("all", f"{player.name} played a Knight!"))
    msg = update_largest_army(game)
    if msg: messages_out.append(("all", msg))
    for p in game.players:
        total_vp = p.victoryPoints + p.dev_cards.get("Victory Point", 0)
        if total_vp >= game.settings.victoryPoints:
            game.winner = p.id
            game.status = "FINISHED"
            messages_out.append(("all", f"🏆 GAME OVER! {p.name} has won the game with {total_vp} points!"))
    return True

@register_action("playMonopoly")
def handle_play_monopoly(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if game.is_special_build_phase: 
        messages_out.append((player_id, "You cannot play Development Cards during Special Build Phase!"))
        return False

    res_to_steal = payload.get("resource") 
    player = get_player(game, player_id)
    if player_id != game.currentTurn or player.dev_cards['Monopoly'] < 1 or not res_to_steal:
        return False
        
    player.dev_cards['Monopoly'] -= 1
    total_stolen = 0
    for p in game.players:
        if p.id != player_id:
            amount = p.resources.get(res_to_steal, 0)
            p.resources[res_to_steal] = 0
            player.resources[res_to_steal] += amount
            total_stolen += int(amount)
    
    messages_out.append(("all", f"{player.name} played Monopoly on {res_to_steal} and stole {total_stolen} cards!"))
    return True

@register_action("playYearOfPlenty")
def handle_year_of_plenty(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if game.is_special_build_phase: 
        messages_out.append((player_id, "You cannot play Development Cards during Special Build Phase!"))
        return False

    choices = payload.get("resources", {}) 
    player = get_player(game, player_id)
    if player_id != game.currentTurn or player.dev_cards['Year of Plenty'] < 1:
        return False
    
    if sum(choices.values()) != 2:
        return False
        
    player.dev_cards['Year of Plenty'] -= 1
    for res, amt in choices.items():
        player.resources[res] += amt
        
    messages_out.append(("all", f"{player.name} played Year of Plenty."))
    return True

@register_action("playRoadBuilding")
def handle_play_road_building(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if game.is_special_build_phase: 
        messages_out.append((player_id, "You cannot play Development Cards during Special Build Phase!"))
        return False

    player = get_player(game, player_id)
    if player_id != game.currentTurn or player.dev_cards['Road Building'] < 1:
        return False
        
    player.dev_cards['Road Building'] -= 1
    game.expected_action = "roadBuilding1" 
    messages_out.append(("all", f"{player.name} played Road Building!"))
    return True

@register_action("proposeTrade")
def handle_propose_trade(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if game.is_special_build_phase: 
        messages_out.append((player_id, "You cannot play Development Cards during Special Build Phase!"))
        return False

    if player_id != game.currentTurn or game.expected_action is not None:
        return False
    
    player = get_player(game, player_id)
    trade_offer = payload.get("trade", {}) 
    
    for res, amt in trade_offer.items():
        if amt < 0 and player.resources.get(res, 0) < abs(amt):
            messages_out.append((player_id, f"You don't have enough {res} to propose this trade."))
            return False
            
    game.active_trade = {
        "_resources": trade_offer,
        "_acceptedTrade": [],
        "_declinedTrade": [],
        "_trader": player_id
    }
    game.expected_action = "reviewTrade"
    messages_out.append(("all", f"{player.name} proposed a trade."))
    return True

@register_action("reviewTrade")
def handle_review_trade(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if game.expected_action != "reviewTrade" or player_id == game.currentTurn:
        return False
    player = get_player(game, player_id)
    accepted = payload.get("tradeAccepted", False)
    if accepted:
        can_afford = True
        for res, amt in game.active_trade["_resources"].items():
            if amt > 0 and player.resources.get(res, 0) < amt:
                can_afford = False
                break
        
        if can_afford:
            game.active_trade["_acceptedTrade"].append(player_id)
            messages_out.append((game.currentTurn, f"{player.name} accepted your trade."))
        else:
            game.active_trade["_declinedTrade"].append(player_id)
            messages_out.append((player_id, "You don't have the resources to accept this trade."))
    else:
        game.active_trade["_declinedTrade"].append(player_id)
        
    active_opponents = sum(1 for p in game.players if p.is_active and p.id != game.currentTurn)
    if len(game.active_trade["_declinedTrade"]) >= active_opponents:
        messages_out.append((game.currentTurn, "Everyone declined your trade."))
        
    return True

@register_action("tradeResponse")
def handle_trade_response(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if game.expected_action != "reviewTrade" or player_id != game.currentTurn:
        return False
    player = get_player(game, player_id)
    accepted = payload.get("tradeAccepted", False)
    
    if not accepted:
        messages_out.append(("all", f"{player.name} canceled the trade."))
        game.expected_action = None
        game.active_trade = None
        return True
        
    tradee_id = int(payload.get("tradee"))
    tradee = get_player(game, tradee_id)
    
    if tradee_id not in game.active_trade["_acceptedTrade"]:
        return False
        
    for res, amt in game.active_trade["_resources"].items():
        if amt != 0:
            player.resources[res] += amt
            tradee.resources[res] -= amt
            
    messages_out.append(("all", f"{player.name} and {tradee.name} completed a trade."))
    game.expected_action = None
    game.active_trade = None
    return True

@register_action("toggleSpecialBuild")
def handle_toggle_sbp(game: GameState, player_id: int, payload: dict, messages_out: list) -> bool:
    player = get_player(game, player_id)
    player.wants_special_build = payload.get("wants_special_build", False)
    
    status = "opted IN to" if player.wants_special_build else "opted OUT of"
    messages_out.append((player_id, f"You {status} the next Special Building Phase."))
    return True

@register_action("tradeWithBank")
def handle_bank_trade(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if game.is_special_build_phase: 
        messages_out.append((player_id, "You cannot play Development Cards during Special Build Phase!"))
        return False

    if player_id != game.currentTurn or game.expected_action is not None:
        return False
    
    player = get_player(game, player_id)
    res_to_give = payload.get("toGive") 
    res_to_get = payload.get("toGet") 
    amount_to_get = int(payload.get("amount", 1))
    
    if not res_to_give or not res_to_get or amount_to_get <= 0:
        return False

    rate = player.rates.get(res_to_give, 4)
    total_cost = rate * amount_to_get
    
    if player.resources.get(res_to_give, 0) < total_cost:
        messages_out.append((player_id, f"You need {total_cost} {res_to_give} to make that trade."))
        return False
        
    player.resources[res_to_give] -= total_cost
    player.resources[res_to_get] += amount_to_get
    
    messages_out.append(("all", f"{player.name} traded {total_cost} {res_to_give} for {amount_to_get} {res_to_get}."))
    return True


@register_action("updateProfile")
def handle_update_profile(game: GameState, player_id: int, payload: dict, messages_out: list) -> bool:
    player = get_player(game, player_id)
    new_name = payload.get("name", "").strip()[:12] # Limit name length
    new_color = payload.get("color")
    
    updates = []
    old_name = player.name

    # Handle Name Change
    if new_name and new_name != player.name:
        player.name = new_name
        updates.append(f"name to {new_name}")
        
    # Handle Color Change
    if new_color in ALLOWED_COLORS and new_color != player.color:
        # Ensure color is not taken by another active player
        if not any(p.color == new_color for p in game.players if p.is_active and p.id != player_id):
            player.color = new_color
            updates.append("color")
            
    if updates:
        display_name = old_name if "name" in updates[0] else player.name
        messages_out.append(("all", f"👤 {display_name} changed their {' and '.join(updates)}."))
        return True
        
    return False


@register_action("endTurn")
def handle_end_turn(game: GameState, player_id: int, payload: dict, messages_out: list)  -> bool:
    if player_id != game.currentTurn: return False
    
    player = get_player(game, player_id)
    if len(game.discard_pending) > 0:
        messages_out.append((player_id, "You cannot end your turn while players are discarding!"))
        return False
    
    if game.expected_action in ["rollDice", "knightOrDice", "dropCards", "reviewTrade"]:
        messages_out.append((player_id, "You must resolve your current action before ending your turn!"))
        return False
        
    if game.expected_action == "moveRobber":
        desert = next((t for t in game.board.tiles if t.type == "DESERT"), game.board.tiles[0])
        for t in game.board.tiles: t.hasRobber = False
        desert.hasRobber = True
        messages_out.append(("all", f"{player.name} forgot to move the Robber! It returns to the Desert."))
        game.expected_action = None
        game.valid_rob_targets = []
    elif game.expected_action == "takeCard":
        messages_out.append(("all", f"{player.name} forgot to steal a card!"))
        game.expected_action = None

    for c, amt in player.new_dev_cards.items():
        player.dev_cards[c] += amt
        player.new_dev_cards[c] = 0

    if game.settings.numPlayers > 4 and not game.is_special_build_phase:
        game.is_special_build_phase = True
        game.original_turn = game.currentTurn
        curr_idx = game.turnOrder.index(game.currentTurn)
        game.special_build_queue = []
        for i in range(1, len(game.turnOrder)):
            next_p_idx = (curr_idx + i) % len(game.turnOrder)
            next_p = get_player(game, game.turnOrder[next_p_idx])
            if next_p.is_active and next_p.wants_special_build:
                game.special_build_queue.append(next_p.id)
        
        if game.special_build_queue:
            game.currentTurn = game.special_build_queue.pop(0)
            get_player(game, game.currentTurn).wants_special_build = False
            messages_out.append(("all", f"Special Building Phase begins. {get_player(game, game.currentTurn).name} can build."))
            return True

    if game.is_special_build_phase and game.special_build_queue:
        game.currentTurn = game.special_build_queue.pop(0)
        messages_out.append(("all", f"Special Building Phase: {get_player(game, game.currentTurn).name} can build."))
        return True

    game.is_special_build_phase = False
    if getattr(game, 'original_turn', None) is not None:
        game.currentTurn = game.original_turn
        game.original_turn = None
    pass_to_next_active_player(game, messages_out)
    return True