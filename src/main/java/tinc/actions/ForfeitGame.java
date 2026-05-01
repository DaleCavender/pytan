package tinc;

import java.util.HashMap;
import java.util.Map;

public class ForfeitGame implements Action {
  private Referee _referee;
  private int _playerID;

  public ForfeitGame(Referee referee, int playerID) {
    _referee = referee;
    _playerID = playerID;
  }

  @Override
  public Map<Integer, ActionResponse> execute() {
    // Mark the player as inactive
    if (_referee instanceof MasterReferee) {
        ((MasterReferee) _referee).setPlayerInactive(_playerID);
    }
    
    // If they quit while it was currently their turn, automatically advance the turn
    if (_referee.currentPlayer() != null && _referee.currentPlayer().getID() == _playerID) {
        _referee.startNextTurn();
    }
    
    // Return an empty/default response (or broadcast a chat message saying they left)
    Map<Integer, ActionResponse> response = new HashMap<>();
    // You can optionally add logic here to notify the remaining players 
    // that this player has been converted to an AI or skipped.
    
    return response;
  }
}
