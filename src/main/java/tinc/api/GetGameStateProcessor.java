package tinc.api;

import com.google.gson.JsonObject;

import tinc.networking.API;
import tinc.networking.Group;
import tinc.networking.RequestProcessor;
import tinc.networking.User;


public class GetGameStateProcessor implements RequestProcessor {

  private static final String IDENTIFIER = "getGameState";
  private static final String REQUEST_KEY = "requestType";


  @Override
  public boolean run(User user, Group g, JsonObject json,
      API api) {
    JsonObject resp = api.getGameState(user.userID());
    resp.addProperty("requestType", "getGameState");
    return user.message(resp);
  }


  @Override
  public boolean match(JsonObject j) {
    if(j.has(REQUEST_KEY) && !j.get(REQUEST_KEY).isJsonNull()){
      return j.get(REQUEST_KEY).getAsString().equals(IDENTIFIER);
    }
    return false;
  }

}
