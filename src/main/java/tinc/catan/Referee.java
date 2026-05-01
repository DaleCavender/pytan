package tinc;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import tinc.FollowUpAction;
import tinc.board.Board;
import tinc.gamestats.GameStats;

public interface Referee {

  void startNextTurn();

  Turn getTurn();

  Player currentPlayer();

  void playDevCard();

  int addPlayer(String name);

  int addPlayer(String name, String color);

  void setPlayerInactive(int id);dd

  boolean isPlayerSkipped(int id);

  DevelopmentCard getDevCard();

  boolean devCardDeckIsEmpty();

  GameSettings getGameSettings();

  Referee getReadOnlyReferee();

  Map<Resource, Double> getBankRates(int playerID);

  Board getBoard();

  Player getPlayerByID(int id);

  Collection<Player> getPlayers();

  boolean hasLongestRoad(int playerID);

  boolean hasLargestArmy(int playerID);

  int getNumPublicPoints(int playerID);

  int getNumTotalPoints(int playerID);

  Bank getBank();

  GameStatus getGameStatus();

  void setGameStatus(GameStatus state);

  FollowUpAction getNextFollowUp(int playerID);

  void addFollowUp(Collection<FollowUpAction> actions);

  public void removeFollowUp(FollowUpAction action);

  List<Integer> getTurnOrder();

  Setup getSetup();

  Player getWinner();

  GameStats getGameStats();

  boolean removePlayer(int id);

  public enum GameStatus {
    WAITING, // Waiting for players (pre-game)
    SETUP, // Placement of settlements
    PROGRESS; // Regular game in progress
  }

}
