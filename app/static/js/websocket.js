// ---------- Setup ---------- //

//Establish the WebSocket connection and set up event handlers
// This forces the WebSocket to match whatever the browser sees (HTTPS -> WSS)
// This forces the WebSocket to match whatever the browser sees (HTTPS -> WSS)
var wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
var wsUrl = wsProtocol + window.location.host + "/action/"; // Use /groups/ for home.js
var webSocket = new WebSocket(wsUrl);

// Send a heartbeat on the websocket
function heartbeat() {
	var beat = "HEARTBEAT";
	webSocket.send(JSON.stringify(beat));
}

// Requests to be send when websocket first opens
webSocket.onopen = function() {
	if (document.cookie.indexOf("USER_ID") > -1) {
		sendGetGameStateAction();
	}
	window.setInterval(heartbeat, 10 * 1000);
    sendReloadChatRequest();
};

// Delete all cookies and return to home screen
function deleteAllCookiesAndGoHome() {
	deleteCookie("USER_ID");
	deleteCookie("desiredGroupId");
	deleteCookie("groupName");
	deleteCookie("numPlayersDesired");
	window.location = "/home";
}

// Actions to be taken when websocket is closed
webSocket.onclose = function() {
	if (document.cookie.indexOf("USER_ID") > -1) {
		window.location.reload(true);
	} else {
		deleteAllCookiesAndGoHome();
	}

}

// When a leave game button is pressed, return to home screen
$(".leave-game-btn").click(function(event) {
	var exit = {
		requestType : "action",
		reason : "forfeitGame",
		player: playerId
	};
	webSocket.send(JSON.stringify(exit));
	setTimeout(function() {	
		deleteAllCookiesAndGoHome();
	}, 1000);
});

// ////////////////////////////////////////
// Action Senders
// ////////////////////////////////////////

function sendGetGameStateAction() {
	var playersReq = {
		requestType : "getGameState"
	};
	webSocket.send(JSON.stringify(playersReq));
}

function sendReloadChatRequest() {
    var chatReq = {
        requestType: "chat",
        logs: true
    }
    webSocket.send(JSON.stringify(chatReq));
}

function sendGetInitialStateAction() {
	var stateReq = {
		requestType : "action",
		action : "getInitialState"
	};
	webSocket.send(JSON.stringify(stateReq));
}

function sendRollDiceAction() {
	var rollDiceReq = {
		requestType : "action",
		action : "rollDice",
		player : playerId
	};
	webSocket.send(JSON.stringify(rollDiceReq));
}

function sendBuildSettlementAction(intersectCoordinates) {
	var buildReq = {
		requestType : "action",
		action : "buildSettlement",
		coordinate : intersectCoordinates
	};
	webSocket.send(JSON.stringify(buildReq));
}

function sendPlaceSettlementAction(intersectCoordinates) {
	var placeReq = {
		requestType : "action",
		action : "placeSettlement",
		coordinate : intersectCoordinates
	};
	webSocket.send(JSON.stringify(placeReq));
}

function sendBuildCityAction(intersectCoordinates) {
	var buildReq = {
		requestType : "action",
		action : "buildCity",
		coordinate : intersectCoordinates
	};
	webSocket.send(JSON.stringify(buildReq));
}

function sendBuildRoadAction(start, end) {
	var buildReq = {
		requestType : "action",
		action : "buildRoad",
		start : start,
		end : end
	};
	webSocket.send(JSON.stringify(buildReq));
}

function sendPlaceRoadAction(start, end) {
	var placeReq = {
		requestType : "action",
		action : "placeRoad",
		start : start,
		end : end
	};
	webSocket.send(JSON.stringify(placeReq));
}

function sendBuyDevCardAction() {
	var buyReq = {
		requestType : "action",
		action : "buyDevCard"
	};
	webSocket.send(JSON.stringify(buyReq));
}

function sendPlayKnightAction() {
	var playReq = {
		requestType : "action",
		action : "playKnight"
	};
	webSocket.send(JSON.stringify(playReq));
}

function sendPlayMonopolyAction(resource) {
	var playReq = {
		requestType : "action",
		action : "playMonopoly",
		resource : resource
	};
	webSocket.send(JSON.stringify(playReq));
}

function sendPlayYearOfPlentyAction(resources) {
	var playReq = {
		requestType : "action",
		action : "playYearOfPlenty",
		resources : resources
	};
	webSocket.send(JSON.stringify(playReq));
}

function sendPlayRoadBuildingAction() {
	var playReq = {
		requestType : "action",
		action : "playRoadBuilding"
	};
	webSocket.send(JSON.stringify(playReq));
}

function sendDropCardsAction(toDrop) {
	var dropReq = {
		requestType : "action",
		action : "dropCards",
		toDrop : toDrop
	};
	webSocket.send(JSON.stringify(dropReq));
}

function sendMoveRobberAction(coord) {
	var dropReq = {
		requestType : "action",
		action : "moveRobber",
		newLocation : coord
	};
	webSocket.send(JSON.stringify(dropReq));
}

function sendTakeCardAction(playerId) {
	var takeReq = {
		requestType : "action",
		action : "takeCard",
		takeFrom : playerId
	};
	webSocket.send(JSON.stringify(takeReq));
}

function sendTradeWithBankAction(toGive, toGet, amount) {
	var tradeReq = {
		requestType : "action",
		action : "tradeWithBank",
		toGive : toGive,
		toGet : toGet,
		amount : amount
	};
	webSocket.send(JSON.stringify(tradeReq));
}

function startSetupAction() {
	var startReq = {
		requestType : "action",
		action : "startSetup"
	};
	webSocket.send(JSON.stringify(startReq));
}

function sendEndTurnAction() {
	var endReq = {
		requestType : "action",
		action : "endTurn"
	};
	webSocket.send(JSON.stringify(endReq));
}

function sendKnightOrDiceAction(choseKnight) {
	var playReq = {
		requestType : "action",
		action : "knightOrDice",
		choseKnight : choseKnight
	};
	webSocket.send(JSON.stringify(playReq));
}

function sendProposeTradeAction(trade) {
	var tradeReq = {
		requestType : "action",
		action : "proposeTrade",
		trade : trade
	};
	webSocket.send(JSON.stringify(tradeReq));
}

function sendReviewTradeAction(tradeAccepted) {
	var tradeReq = {
		requestType : "action",
		action : "reviewTrade",
		tradeAccepted : tradeAccepted
	};
	webSocket.send(JSON.stringify(tradeReq));
}

function sendTradeResponseAction(accepted, trader, tradee) {
	var tradeReq = {
		requestType : "action",
		action : "tradeResponse",
		tradeAccepted : accepted,
		trader : trader,
		tradee : tradee
	};
	webSocket.send(JSON.stringify(tradeReq));
}

function sendUpdateResourceAction() {
	var updateReq = {
		requestType : "action",
		action : "updateResource"
	};
	webSocket.send(JSON.stringify(updateReq));
}

// ---------- RESPONSES ---------- //

webSocket.onmessage = function(msg) {
	console.log(msg);
	var data = JSON.parse(msg.data);
	console.log(data);

	if (data.hasOwnProperty("requestType")) {
		switch (data.requestType) {
		case "chat":
            handleChatResponse(data);
			break;
		case "getGameState":
			handleGetGameState(data);
			break;
		case "action":
			handleActionResponse(data);
			break;
		case "setCookie":
			handleSetCookie(data);
			break;
		case "ERROR":
			handleErrorFromSocket(data);
			break;
		case "disconnectedUsers":
			handleDisconnectedUsers(data);
			break;
		case "gameOver":
			handleGameOver(data);
			break;
		case "heartbeat":
			// console.log("heartbeat acknowledged");
			break;
		default:
			console.log("unsupported request type");
			break;
		}
	} else {
		console.log("No request type indicated for response");
	}
};

// ////////////////////////////////////////
// Chat Responses
// ////////////////////////////////////////

var chatReceivedSound = new Audio("/audio/message-received.mp3");

// Send a message if it's not empty, then clear the input field
function sendMessage(message) {
	if (message !== "") {
		var pack = {
			"requestType" : "chat",
			"message" : message
		};
		webSocket.send(JSON.stringify(pack));
		id("message").value = "";
	}
}

/*
 * Create and insert a message into chat.
 * @param msg - the message to insert
 */
function insertChatMessage(msg, skipScroll) {
    var formattedDate = moment(msg.timeStamp).format("h:mm A");
    var fromPlayer = playersById[msg.userId];
    var playerColor = fromPlayer ? fromPlayer.color : "#999";
    
    var msgDiv = $("<div class='chat-message'></div>");
    msgDiv.css("border-left-color", playerColor);

    // Sanitize Sender
    var safeSender = $("<span>").text(msg.sender).html(); 
    
    // Sanitize Content, THEN run the Image Regex
    var safeContent = $("<span>").text(msg.content).html();
    
    // Convert direct image links to actual images!
    var imageRegex = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|svg)(?:\?[^\s]*)?)/gi;
    safeContent = safeContent.replace(imageRegex, "<br><img src='$1' style='max-width: 100%; border-radius: 6px; margin-top: 4px; border: 1px solid #ccc;' />");

    var header = "<span class='chat-timestamp'>" + formattedDate + "</span>" +
                 "<span class='chat-sender'>" + safeSender + ":</span> ";
                 
    // Note: We use .html() instead of .text() here so our <img> tag renders properly
    var text = $("<span class='chat-text'></span>").html(safeContent);
    
    msgDiv.append(header).append(text);
    $("#chat").append(msgDiv);

    if (!skipScroll) {
        // Wait longer if there's an image so it has time to load and affect height
        var delay = imageRegex.test(msg.content) ? 150 : 30;
        setTimeout(function() {
            scrollChatToBottom(false);
        }, delay);
    }
}




/*
 * Update the chat with the given message.
 * @param msg - the msg that was received
 */
function updateChat(msg) {
	if (msg.hasOwnProperty('ERROR')) {
		alert(msg.ERROR);
	} else {
        insertChatMessage(msg);
		if (!muted) {
			chatReceivedSound.play();
		}
	}
}

/*
 * Load chat logs, displaying them in chat window.
 * @param logs - an array of chat messages to display
 */
function loadChatLogs(logs) {
    for (var i = 0; i < logs.length; i++) {
        insertChatMessage(logs[i]);
    }
}

// ////////////////////////////////////////
// Action Handlers
// ////////////////////////////////////////

/*
 * Handles a chat response.
 * @param data - the chat data
 */
function handleChatResponse(data) {
    if (data.hasOwnProperty("logs")) {
        loadChatLogs(data.logs);
    } else {
        updateChat(data);
    }
}

/*
 * Handles an action that was send back to the gui.
 * @param data - the action data
 */
function handleActionResponse(data) {
	if (data.content.hasOwnProperty("message")) {
		addMessage(data.content.message);
	}

	switch (data.action) {
	case "startGame":
		showStartGameDialogue(data.content);
		break
	case "tradeResponse":
		exitReviewTradeModal();
        break;
    case "reviewTrade":
        handleReviewTradeAction(data.content.data.allDeclined);
        break;
	default:
		break;
	}
}

/*
 * Handle a game over send from the websocket.
 * @param data - the game over data
 */
function handleGameOver(data) {
	switch(data.reason) {
	case "disconnectedUser":
		deleteAllCookiesAndGoHome();
		break;
	case "explicitExit":
        $("#user-exited-name").text(data.departedUser.userName);
        $("#user-exited-modal").modal("show");
		break;
	default:
		console.log("UNSUPPORTED REASON FOR GAME OVER");
	}

}

$("#user-exited-go-home-btn").click(deleteAllCookiesAndGoHome);

/*
 * Handle a followup action.
 * @param action - the followup action.
 */
function handleFollowUp(action) {
	if (action.hasOwnProperty("actionData")
			&& action.actionData.hasOwnProperty("message")) {
		addMessage(action.actionData.message);
	}

	switch (action.actionName) {
	case "moveRobber":
		highlightRobbableTiles();
		break
	case "dropCards":
		enterDiscardModal(action.actionData.numToDrop);
		break;
	case "takeCard":
		enterTakeCardModal(action.actionData.toTake);
		break;
	case "placeRoad":
		enterPlaceRoadMode();
		break;
	case "placeSettlement":
		enterPlaceSettlementMode();
		break;
	case "rollDice":
		showRollDiceModal();
		break;
	case "knightOrDice":
		showKnightOrDiceModal();
		break;
	case "reviewTrade":
		showReviewTradeModal(action.actionData.trade);
		break;
	case "tradeResponse":
		showTradeResponseModal(action.actionData.trade);
		break;
	default:
		break;
	}
}

/**
 * Handles a get games state response. Redraws the board and resets all internal data.
 * @param gameStateData - the game state data
 */
function handleGetGameState(gameStateData) {
    // 1. Set global IDs
    playerId = gameStateData.playerID;
    currentPlayerTurn = gameStateData.currentTurn;
    gameSettings = gameStateData.settings;
    gameStats = gameStateData.stats;

	if (playerId < 0) {
        // Hide building/turn menus
        $("#build-menu-container").addClass("hidden");
        $(".hand-panel").addClass("hidden");
        $(".top-left-flank").addClass("hidden"); // Hides End Turn & SBP buttons
        
        // Keep the right menu, but hide Trade and force Settings open
        $("#right-menu-container").removeClass("hidden");
        $("#right-tab-tabs li:first-child").addClass("hidden"); // Hides the Trade Icon
        $('#right-tab-tabs a[href="#extras-tab"]').tab('show'); // Force Bootstrap to open Extras
        
        // Add a Spectator Badge to the empty Top Left corner
        if (!$("#spectator-badge").length) {
            $("body").append("<div id='spectator-badge' style='position:fixed; top:20px; left:20px; background:rgba(0,0,0,0.75); color:white; padding:8px 15px; font-weight:bold; font-size:16px; border-radius:6px; z-index:1000; pointer-events:none; border: 1px solid #777;'><span class='glyphicon glyphicon-eye-open'></span> SPECTATING</div>");
        }
    } else {
        // Ensure they are visible if someone transitioned from a previous spectator state (edge case)
        $("#build-menu-container").removeClass("hidden");
        $(".hand-panel").removeClass("hidden");
        $("#right-menu-container").removeClass("hidden");
        $(".top-left-flank").removeClass("hidden");
        $("#spectator-badge").remove();
    }

    // 2. THE FIX: Find your player object in the array by ID (not index!)
    var myData = gameStateData.players.find(function(p) {
        return p.id === playerId;
    });

    if (myData) {
        tradeRates = myData.rates;
		fillPlayerTradeRates(tradeRates);
    }
    // 3. Clear and rebuild the lookup maps
    playersById = {};
    players = parsePlayers(gameStateData.players);
    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        p.status = gameStateData.playerStatuses ? gameStateData.playerStatuses[p.id] : null;
        playersById[p.id] = p;
    }
    
    
    // Create player tabs and turn counter
    $("#player-tabs").empty();
    $("#player-tabs-content").empty();
    
    if (gameStateData.hasOwnProperty("turnOrder")) {
        var turnOrder = gameStateData.turnOrder;
        for (var i = 0; i < turnOrder.length; i++) {
            var pId = turnOrder[i];
            playersById[pId].addPlayerTab(); // This appends it to the screen
            playersById[pId].fillTurnDisplay(); // This applies the highlight/pulse
        }
    } else {
        // Fallback if turnOrder isn't sent yet
        for (var i = 0; i < players.length; i++) {
            players[i].addPlayerTab();
        }
    }
    
    if (playerId >= 0 && currentPlayerTurn === playerId) {
        $("#end-turn-btn").prop("disabled", false);
    } else {
        $("#end-turn-btn").prop("disabled", true);
    }
    
    if (playerId >= 0) {
		// Parse and draw hand
		fillPlayerHand(gameStateData.hand);
		// Show what buildings player can currently buy
		fillPlayerBuyOptions(gameStateData.hand);
		// Draw trade rates
		fillPlayerTradeRates(tradeRates);
		// Build current extras tab
		buildExtrasTab();
	}

	if (!board) {
        // Initial load: create DOM elements
        board = new Board();
        board.createBoard(gameStateData.board);
        board.draw();
    } else {
        // Subsequent loads: update DOM elements in-place
        board.updateBoard(gameStateData.board);
    }
    
    // If in place road mode, enter build rode mode
    if (inPlaceRoadMode) {
        enterPlaceRoadMode();
    }
    // If in place settlment mode, enter place settlement mode
    if (inPlaceSettlementMode) {
        enterPlaceSettlementMode();
    }
    // Handle win game
    if (gameStateData.hasOwnProperty("winner")) {
        var winner = gameStateData.winner;
        showWinnerModal(winner);
    }
    // Handle follow up action
    if (gameStateData.hasOwnProperty("followUp")) {
        handleFollowUp(gameStateData.followUp);
    }
        // --- 5/6 PLAYER UI: SPECIAL BUILD TOGGLE ---
    if (gameSettings.numPlayers > 4) {
        var sbpBtn = $("#sbp-opt-in-btn");
        sbpBtn.removeClass("hidden");
        
        // 1. Disable the button if it's your actual normal turn
        if (currentPlayerTurn === playerId && !gameStateData.is_special_build_phase) {
            sbpBtn.prop("disabled", true).removeClass("sbp-active").text("Special Build: OFF");
        } else {
            sbpBtn.prop("disabled", false);
            
            // 2. SYNC: Change color and text based on backend 'wants_special_build'
            var myData = gameStateData.players.find(function(p) { return p.id === playerId; });
            if (myData && myData.wants_special_build) {
                sbpBtn.addClass("sbp-active").text("Special Build: ON");
            } else {
                sbpBtn.removeClass("sbp-active").text("Special Build: OFF");
            }
        }
    } else {
        $("#sbp-opt-in-btn").addClass("hidden");
    }
}


// Send message if enter is pressed in the input field
id("message").addEventListener("keypress", function(e) {
	if (e.keyCode === 13) {
		sendMessage(e.target.value);
	}
});

/*
 * Handle a disconnected user message.
 * @param disconnectData - the disconnected user data
 */
function handleDisconnectedUsers(disconnectData) {
	if (disconnectData.users.length === 0) {
		hideDisconnectedUsersModal();
	} else {
		showDisconnectedUsersModal(disconnectData);
	}
}

// ---------- SET COOKIE FROM SERVER ---------- //

function handleSetCookie(data) {
	console.log(data);
	for (i = 0; i < data.cookies.length; i++) {
		if (data.cookies[i].name == "USER_ID") {
			var cook = data.cookies[i];
			setCookie(cook.name, cook.value);
			console.log("Cookies set to :" + document.cookie);
			sendGetGameStateAction();
		}
	}
}

// ---------- ERRORS ---------- //

function handleErrorFromSocket(data) {
	if (data.hasOwnProperty("description")) {
		switch (data.description) {
		case "RESET":
			deleteAllCookiesAndGoHome();
			break;
		case "NOT_REGISTERED":
			alert("Internal error : user not registered");
			break;
		case "FULL_GAME":
			$("#full-game-modal").modal("show");
			break;
		case "DUPLICATE_TAB":
			$("#duplicate-tab-modal").modal("show");
			break;
		default:
			console.log(data.description);
		}
	}
}

$("#accept-full-game-btn").click(function(event) {
	$("#full-game-modal").modal("hide");
	deleteAllCookiesAndGoHome();
});

// ---------- COOKIE MANAGEMENT ---------- //

function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ')
			c = c.substring(1);
		if (c.indexOf(nameEQ) != -1) {
			return c.substring(nameEQ.length, c.length);
		}
	}
	return null;
}

function setCookie(cookie, value) {
	var eqVal = cookie + "=" + value;
	document.cookie = eqVal;
}

function deleteCookie(name) {
	document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// Helper function for inserting HTML as the first child of an element
function insert(targetId, message) {
	id(targetId).insertAdjacentHTML("beforeend", message);
}

// Helper function for selecting element by id
function id(id) {
	return document.getElementById(id);
}

function sendToggleSpecialBuild(wantsSBP) {
    var payload = {
        requestType: "action",
        action: "toggleSpecialBuild",
        wants_special_build: wantsSBP
    };
    webSocket.send(JSON.stringify(payload));
}

function sendUpdateProfileAction(newName, newColor) {
    var payload = {
        requestType: "action",
        action: "updateProfile",
        name: newName,
        color: newColor
    };
    webSocket.send(JSON.stringify(payload));
}
