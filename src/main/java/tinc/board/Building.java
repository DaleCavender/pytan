package tinc.board;

import java.util.Map;

import tinc.Player;
import tinc.Resource;

/**
 * Interface for the Buildings on the board.
 *
 * @author anselvahle
 *
 */
public interface Building {

  /**
   * Tells the building to tell the player who is associated with it to collect
   * a resource of the input type.
   *
   * @param resource
   *          Type of resource to collect.
   * @return A map of the player id to a map of resources that they collected
   *         and how many of them.
   */
  Map<Integer, Map<Resource, Integer>> collectResource(Resource resource);

  /**
   * Gets the player asscoiated with this building.
   *
   * @return the Player.
   */
  Player getPlayer();

}
