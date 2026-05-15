import random
import math
from .models import HexCoord, IntersectionCoord, Tile, Intersection, Path, Resource, Board

RESOURCES_4 = ["WOOD"]*4 + ["BRICK"]*3 + ["SHEEP"]*4 + ["WHEAT"]*4 + ["ORE"]*3 + ["DESERT"]*1
ROLL_NUMBERS_4 = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11]

CORE_HEXES_4 = [
    # Outer Ring (Depth 2)
    HexCoord(2,0,0), HexCoord(2,1,0), HexCoord(2,2,0), HexCoord(1,2,0), 
    HexCoord(0,2,0), HexCoord(0,2,1), HexCoord(0,2,2), HexCoord(0,1,2), 
    HexCoord(0,0,2), HexCoord(1,0,2), HexCoord(2,0,2), HexCoord(2,0,1),
    # Inner Ring (Depth 1)
    HexCoord(1,0,0), HexCoord(1,1,0), HexCoord(0,1,0), HexCoord(0,1,1), 
    HexCoord(0,0,1), HexCoord(1,0,1),
    # Center (Depth 0)
    HexCoord(0,0,0)
]

# --- 5/6 PLAYER EXTENDED CONFIG ---
RESOURCES_6 = ["WOOD"]*6 + ["BRICK"]*5 + ["SHEEP"]*6 + ["WHEAT"]*6 + ["ORE"]*5 + ["DESERT"]*2
ROLL_NUMBERS_6 = [2, 5, 4, 6, 3, 9, 8, 11, 11, 10, 6, 3, 8, 4, 8, 10, 11, 12, 10, 5, 4, 9, 5, 9, 12, 3, 2, 6]

CORE_HEXES_6 = [
    # --- Outer Ring (16 Tiles) ---
    HexCoord(2,0,0), HexCoord(2,1,0), HexCoord(2,2,0), HexCoord(1,2,0),
    HexCoord(0,2,0), HexCoord(0,3,1), HexCoord(0,3,2), HexCoord(0,3,3),
    HexCoord(0,3,4), HexCoord(0,2,4), HexCoord(0,1,4), HexCoord(0,0,3),
    HexCoord(1,0,3), HexCoord(2,0,3), HexCoord(2,0,2), HexCoord(2,0,1), 
    # --- Middle Ring (10 Tiles) ---
    HexCoord(1,0,0), HexCoord(1,1,0), HexCoord(0,1,0), HexCoord(0,2,1),
    HexCoord(0,2,2), HexCoord(0,2,3), HexCoord(0,1,3), HexCoord(0,0,2),
    HexCoord(1,0,2), HexCoord(1,0,1),
    # --- Center Tiles (4 Tiles) ---
    HexCoord(0,0,0), HexCoord(0,1,1), HexCoord(0,1,2), HexCoord(0,0,1)
]

PORT_ORDER = ["WILDCARD", "SHEEP", "WILDCARD", "WHEAT", "BRICK", "WILDCARD", "ORE", "WILDCARD", "WOOD"]

def normalize_hex(h: HexCoord) -> HexCoord:
    """Normalizes the hex coordinate to its canonical representation."""
    m = min(h.x, h.y, h.z)
    return HexCoord(h.x - m, h.y - m, h.z - m)


def normalize_intersection(h1: HexCoord, h2: HexCoord, h3: HexCoord) -> IntersectionCoord:
    """Sorts the hexes so the intersection coordinate is always consistent."""
    sorted_hexes = sorted([h1, h2, h3])
    return IntersectionCoord(sorted_hexes[0], sorted_hexes[1], sorted_hexes[2])

def dist_to_center(coord: IntersectionCoord) -> float:
    """Replicates the Java IntersectionComparator to find corners closest to center."""
    x = sum([c.x * -0.5 + c.y + c.z * -0.5 for c in [coord.coord1, coord.coord2, coord.coord3]]) / 3.0
    y = sum([c.x * -(math.sqrt(3)/2) + c.z * (math.sqrt(3)/2) for c in [coord.coord1, coord.coord2, coord.coord3]]) / 3.0
    return x**2 + y**2

def generate_board(num_players: int = 4) -> Board:
    if num_players > 4:
        resources = list(RESOURCES_6)
        random.shuffle(resources)
        
        roll_numbers = list(ROLL_NUMBERS_6)
        core_hexes = CORE_HEXES_6
    else:
        resources = list(RESOURCES_4)
        random.shuffle(resources)
        roll_numbers = list(ROLL_NUMBERS_4) # Spiral sequence for 4-player
        core_hexes = CORE_HEXES_4

    final_tiles = []
    intersections_map = {}
    paths_map = {}
    chit_idx = 0
    
    for i, hex_coord in enumerate(core_hexes):
        res_type = resources[i]
        roll_num = 0
        
        if res_type != "DESERT":
            if chit_idx < len(roll_numbers):
                roll_num = roll_numbers[chit_idx]
                chit_idx += 1
            
        final_tiles.append(Tile(
            hexCoordinate=hex_coord, 
            type=res_type, 
            number=roll_num, 
            hasRobber=(res_type == "DESERT")
        ))
        
        x, y, z = hex_coord.x, hex_coord.y, hex_coord.z
        
        adjacent = [
            normalize_hex(HexCoord(x, y, z+1)),     # Up Left
            normalize_hex(HexCoord(x, y+1, z+1)),   # Up Right
            normalize_hex(HexCoord(x, y+1, z)),     # Right
            normalize_hex(HexCoord(x+1, y+1, z)),   # Lower Right
            normalize_hex(HexCoord(x+1, y, z)),     # Lower Left
            normalize_hex(HexCoord(x+1, y, z+1))    # Left
        ]
        
        corners = [
            normalize_intersection(hex_coord, adjacent[5], adjacent[0]), # Top Left Corner
            normalize_intersection(hex_coord, adjacent[0], adjacent[1]), # Top Right Corner
            normalize_intersection(hex_coord, adjacent[1], adjacent[2]), # Right Corner
            normalize_intersection(hex_coord, adjacent[2], adjacent[3]), # Bottom Right Corner
            normalize_intersection(hex_coord, adjacent[3], adjacent[4]), # Bottom Left Corner
            normalize_intersection(hex_coord, adjacent[4], adjacent[5])  # Left Corner
        ]
        
        for corner in corners:
            if corner not in intersections_map:
                intersections_map[corner] = Intersection(coordinate=corner)
                
        for j in range(6):
            start = corners[j]
            end = corners[(j+1) % 6]
            
            path_key = frozenset([start, end])
            if path_key not in paths_map:
                paths_map[path_key] = Path(start=start, end=end)

    sea_tiles_coords = set()
    for hex_c in core_hexes:
        x, y, z = hex_c.x, hex_c.y, hex_c.z
        neighbors = [
            normalize_hex(HexCoord(x, y, z+1)), normalize_hex(HexCoord(x, y+1, z+1)),
            normalize_hex(HexCoord(x, y+1, z)), normalize_hex(HexCoord(x+1, y+1, z)),
            normalize_hex(HexCoord(x+1, y, z)), normalize_hex(HexCoord(x+1, y, z+1))
        ]
        for n in neighbors:
            if n not in core_hexes:
                sea_tiles_coords.add(n)
    
    port_order = list(PORT_ORDER)
    if num_players > 4:
        port_order += ["WILDCARD", "SHEEP"] 
    random.shuffle(port_order)
    
    sea_list = sorted(list(sea_tiles_coords)) # Sort to keep placement consistent
    for i, sea_coord in enumerate(sea_list):
        port_type = None
        port_locs = []
        
        if i % 2 == 0 and port_order:
            port_type = port_order.pop(0)

    
    return Board(
        tiles=final_tiles,
        intersections=list(intersections_map.values()),
        paths=list(paths_map.values())
    )
