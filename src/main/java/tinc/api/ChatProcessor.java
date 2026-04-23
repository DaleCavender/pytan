package tinc.api;

import com.google.gson.JsonObject;

import tinc.networking.API;
import tinc.networking.Group;
import tinc.networking.Message;
import tinc.networking.Networking;
import tinc.networking.RequestProcessor;
import tinc.networking.User;


public class ChatProcessor implements RequestProcessor {

  private static final String IDENTIFIER  = "chat";
  private static final String REQUEST_KEY = "requestType";


  public ChatProcessor() {}


  @Override
  public boolean run(User user, Group g, JsonObject json,
      API api) {

    if (json.has("logs")) {
      JsonObject toSend = new JsonObject();
      toSend.addProperty(Networking.REQUEST_IDENTIFIER, "chat");
      toSend.add("logs", Networking.GSON.toJsonTree(g.getMessageLog()));
      user.message(toSend);
      return true;
    }

    Message m = new Message(user, json.get("message").getAsString(),
        System.currentTimeMillis());
    g.logMessage(m);

    boolean success = true;
    for (User other : g.connectedUsers()) {
      success &= other.message(m.asJson());
    }
    return success;
  }


  @Override
  public boolean match(JsonObject j) {
    if (j.has(REQUEST_KEY) && !j.get(REQUEST_KEY).isJsonNull()) {
      return j.get(REQUEST_KEY).getAsString().equals(IDENTIFIER);
    }
    return false;
  }


}
