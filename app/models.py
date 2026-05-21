from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum

class Resource(str, Enum):
    WHEAT = "WHEAT"
    SHEEP = "SHEEP"
    ORE = "ORE"
    WOOD = "WOOD"
    BRICK = "BRICK"
    DESERT = "DESERT"
    SEA = "SEA"

@dataclass(frozen=True, order=True)
class HexCoord:
    x: int
    y: int
    z: int

@dataclass(frozen=True)
class IntersectionCoord:
    coord1: HexCoord
    coord2: HexCoord
    coord3: HexCoord

@dataclass
class Tile:
    hexCoordinate: HexCoord
    type: str
    number: int
    hasRobber: bool = False
    portType: Optional[str] = None
    portLocations: List[IntersectionCoord] = field(default_factory=list)

@dataclass
class Intersection:
    coordinate: IntersectionCoord
    canBuildSettlement: bool = True
    building: Optional[Dict] = None

@dataclass
class Path:
    start: IntersectionCoord
    end: IntersectionCoord
    canBuildRoad: bool = True
    road: Optional[Dict] = None

@dataclass
class Player:
    id: int
    name: str
    uuid: str
    color: str
    victoryPoints: int = 0
    numRoads: int = 15
    numSettlements: int = 5
    numCities: int = 4
    numPlayedKnights: int = 0
    longestRoad: bool = False
    longestRoadLength: int = 0
    largestArmy: bool = False
    is_active: bool = True
    wants_special_build: bool = False
    resources: Dict[str, int] = field(default_factory=lambda: {
        "brick": 0, "wood": 0, "ore": 0, "wheat": 0, "sheep": 0
    })
    rates: Dict[str, int] = field(default_factory=lambda: {
        "wheat": 4, "sheep": 4, "ore": 4, "wood": 4, "brick": 4
    })
    dev_cards: Dict[str, int] = field(default_factory=lambda: {
        "Knight": 0, "Year of Plenty": 0, "Monopoly": 0, "Victory Point": 0, "Road Building": 0
    })
    new_dev_cards: Dict[str, int] = field(default_factory=lambda: {
        "Knight": 0, "Year of Plenty": 0, "Monopoly": 0, "Victory Point": 0, "Road Building": 0
    })

    @property
    def numResourceCards(self) -> int:
        return sum(self.resources.values())

    @property
    def numDevelopmentCards(self) -> int:
        return sum(self.dev_cards.values()) + sum(self.new_dev_cards.values())


@dataclass
class Board:
    tiles: List[Tile]
    intersections: List[Intersection]
    paths: List[Path]

@dataclass
class GameSettings:
    numPlayers: int = 4
    victoryPoints: int = 10

@dataclass
class GameState:
    game_id: str
    status: str = "WAITING"
    currentTurn: int = 0
    winner: Optional[int] = None
    players: List[Player] = field(default_factory=list)
    turnOrder: List[int] = field(default_factory=list)
    settings: GameSettings = field(default_factory=GameSettings)
    board: Optional[Board] = None
    setup_queue: List[int] = field(default_factory=list)
    expected_action: Optional[str] = None
    last_settlement_coord: Optional[IntersectionCoord] = None
    stats: Dict = field(default_factory=lambda: {"turn": 1, "rolls": [0]*11})
    discard_pending: Dict[int, int] = field(default_factory=dict)
    valid_rob_targets: List[int] = field(default_factory=list)
    chat_log: List[dict] = field(default_factory=list)
    dev_card_deck: List[str] = field(default_factory=list)
    has_rolled: bool = False
    active_trade: Optional[Dict] = None
    special_build_queue: List[int] = field(default_factory=list)
    is_special_build_phase: bool = False
    original_turn: Optional[int] = None
    dev_mode: bool = False