package tinc.api;

import com.google.gson.JsonObject;

import tinc.networking.API;
import tinc.networking.Group;
import tinc.networking.Networking;
import tinc.networking.RequestProcessor;
import tinc.networking.User;


public class GameOverProcessor implements RequestProcessor {

  @Override
  public boolean run(User user, Group g, JsonObject json,
      API api) {
    json.add("departedUser", Networking.GSON.toJsonTree(user));
    for (User u : g.connectedUsers()) {
      u.message(json);
    }
    System.out.println("GAMEOVERPROCESSED : " + json);
    g.clear();
    return true;
  }


  @Override
  public boolean match(JsonObject json) {
    return json.has("requestType")
        && json.get("requestType").getAsString().equals("gameOver");
  }

}
