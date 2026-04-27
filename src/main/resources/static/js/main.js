var board = undefined;
var players = [];
var playersById = {};
var playerId = -1;
var currentPlayerTurn = -2;
var openedPlayerTab = 0;
var gameSettings = {};
var tradeRates = {};
var gameStats = {};

// Actions to take when window initially loads
$(window).load(function() {
	// Enable tooltips and popovers
	$(function () {
  		$('[data-toggle="tooltip"]').tooltip();
  		$('[data-toggle="popover"]').popover();
	})

    $("#end-turn-btn").click(sendEndTurnAction);
    
    var href = window.location.pathname;
    if(href != "/home" && !document.cookie){
    	window.location = "/home"; // redirect to home
    }
});

// Mouse movement variables
var dragging = false;
var lastX;
var lastY;

// When mouse is pressed, start dragging mode and save current position
$(document).on("mousedown", "#board-viewport", function(event) {
	lastX = event.pageX;
	lastY = event.pageY;
	dragging = true;
	$(document).on("mousemove", "#board-viewport", onMouseMove);
});

// When mouse is moved, translate the board from last position
function onMouseMove(event) {
	if (dragging && board) {
		board.translate(event.pageX - lastX, event.pageY - lastY);
		lastX = event.pageX;
		lastY = event.pageY
	}
}

// When mouse is released, do final translate and leave dragging mode
$(document).on("mouseup mouseleave", "#board-viewport", function(event) {
	if (dragging) {
		dragging = false;
		board.translate(lastX - event.pageX, lastY - event.pageY);
		$(document).off("mousemove", "#board-viewport", onMouseMove);
	}
});

// When mouse is scrolled, scale board
$(document).on("wheel", "#board-viewport", function(event) {
	if (!board) return;
	if (Math.abs(event.originalEvent.deltaY) > 0.01) {
		var deltaScale = event.originalEvent.deltaY > 0 ? 10 : -10;
		board.scale(deltaScale);
	}
});

/*
 * Adds a message to the message section.
 * @param message - displays a message in the current message section
 */
function addMessage(message) {
	var container = $("#message-container");
	container.empty();
	container.append("<div class='message-popup-animation'><h5>" + message + "</h5></div>");
	addToMessageHistory(message);
}

/*
 * Formats a number based on the current decimal/integer setting.
 * @param num - the number to format
 * @return the formatted number (as a string)
 */
function formatNumber(num) {
	if (gameSettings.isDecimal) {
		return num.toFixed(2);
	} else {
		return num.toFixed(0);
	}
}

/*
 * Finds the exchange rate from one resource to another.
 * @param toGive - the player's trade rates
 * @param toGet - the resource to get
 * @return the trade rate from toGive to toGet
 */
function getExchangeRate(toGive, toGet) {
	return tradeRates[toGive];
}

// Set up flashing tab message when it is your turn
var yourTurnDisplayed = false;
setInterval(function() {
	// Change tab title when it is your turn
	if (playerId === currentPlayerTurn) {
		if (!yourTurnDisplayed) {
			$("title").text("Catan : Your Turn");
			yourTurnDisplayed = true;
		} else {
			$("title").text("Catan : Play Game");
			yourTurnDisplayed = false;
		}
	} else {
		$("title").text("Catan : Play Game");
	}
}, 1000);

//////////////////////////////////////////
// Build Tab
//////////////////////////////////////////

var BUILD_MODE = {
	NONE: 0,
	SETTLEMENT: 1,
	CITY: 2,
	ROAD: 3
}
var currentMode = BUILD_MODE.NONE;

// Enter build settlement mode.
function enterSettlementMode() {
	exitBuildMode();
	currentMode = BUILD_MODE.SETTLEMENT;

	var btnElement = $("#settlement-build-btn");
	btnElement.off("click", enterSettlementMode);
	btnElement.click(exitSettlementMode);

	btnElement.removeClass("btn-default");
	btnElement.addClass("btn-danger");
	btnElement.val("Cancel Build");

	highlightSettlements();
}

// Exit build settlement mode
function exitSettlementMode() {
	currentMode = BUILD_MODE.NONE;

	var btnElement = $("#settlement-build-btn");
	btnElement.off("click", exitSettlementMode);
	btnElement.click(enterSettlementMode);

	btnElement.removeClass("btn-danger");
	btnElement.addClass("btn-default");
	btnElement.val("Build Settlement");

	unHighlightSettlements();
}

// Highlight all intersections that a settlement can be built on.
function highlightSettlements() {
	for (var i = 0; i < board.intersections.length; i++) {
		if (board.intersections[i].canBuildSettlement) {
			board.intersections[i].highlight();
		}
	}
}

// Unhighlight all highlighted intersections.
function unHighlightSettlements() {
	for (var i = 0; i < board.intersections.length; i++) {
		if (board.intersections[i].highlighted) {
			board.intersections[i].unHighlight();
		}
	}
}

// Enter build city mode.
function enterCityMode() {
	exitBuildMode();
	currentMode = BUILD_MODE.CITY;

	var btnElement = $("#city-build-btn");
	btnElement.off("click", enterCityMode);
	btnElement.click(exitCityMode);

	btnElement.removeClass("btn-default");
	btnElement.addClass("btn-danger");
	btnElement.val("Cancel Build");

	for (var i = 0; i < board.intersections.length; i++) {
		var intersect = board.intersections[i];
		if (intersect.building === BUILDING.SETTLEMENT && intersect.player.id === playerId) {
			board.intersections[i].highlight();
		}
	}
}

// Exit build city mode.
function exitCityMode() {
	currentMode = BUILD_MODE.NONE;

	var btnElement = $("#city-build-btn");
	btnElement.off("click", exitCityMode);
	btnElement.click(enterCityMode);

	btnElement.removeClass("btn-danger");
	btnElement.addClass("btn-default");
	btnElement.val("Build City");

	for (var i = 0; i < board.intersections.length; i++) {
		var intersect = board.intersections[i];
		if (intersect.building === BUILDING.SETTLEMENT 
				&& intersect.player.id === playerId && intersect.highlighted) {
			board.intersections[i].unHighlight();
		}
	}
}

// Highlight all paths that roads can be built on.
function highlightRoads() {
	for (var i = 0; i < board.paths.length; i++) {
		if (board.paths[i].canBuildRoad) {
			board.paths[i].highlight();
		}
	}
}

// Unhighlight all highlighted paths.
function unHighlightRoads() {
	for (var i = 0; i < board.paths.length; i++) {
		if (board.paths[i].highlighted) {
			board.paths[i].unHighlight();
		}
	}
}

// Enter build road mode.
function enterRoadMode() {
	exitBuildMode();
	currentMode = BUILD_MODE.ROAD;

	var btnElement = $("#road-build-btn");
	btnElement.off("click", enterRoadMode);
	btnElement.click(exitRoadMode);

	btnElement.removeClass("btn-default");
	btnElement.addClass("btn-danger");
	btnElement.val("Cancel Build");

	highlightRoads();
}

// Exit build road mode.
function exitRoadMode() {
	currentMode = BUILD_MODE.NONE;

	var btnElement = $("#road-build-btn");
	btnElement.off("click", exitRoadMode);
	btnElement.click(enterRoadMode);

	btnElement.removeClass("btn-danger");
	btnElement.addClass("btn-default");
	btnElement.val("Build Road");

	unHighlightRoads();
}

// Exit the current build mode.
function exitBuildMode() {
	switch (currentMode) {
		case BUILD_MODE.SETTLEMENT:
			exitSettlementMode();
			break;
		case BUILD_MODE.CITY:
			exitCityMode();
			break;
		case BUILD_MODE.ROAD:
			exitRoadMode();
			break;
		default:
			break;
	}
}

// Set enter build mode handlers.
$("#settlement-build-btn").click(enterSettlementMode);
$("#city-build-btn").click(enterCityMode);
$("#road-build-btn").click(enterRoadMode);

// Exit build mode on the following actions
$("#end-turn-btn").click(exitBuildMode);
$("#buy-dev-card-modal-open").click(exitBuildMode);
$("#knight-btn").click(exitBuildMode);
$("#year-of-plenty-btn").click(exitBuildMode);
$("#monopoly-btn").click(exitBuildMode);
$("#road-building-btn").click(exitBuildMode);

$("#dev-card-buy-btn").click(sendBuyDevCardAction);

//////////////////////////////////////////
// Monopoly Modal 
//////////////////////////////////////////

// Open the play monopoly modal.
function openMonopolyModal() {
	var selectedMonopolyResource = null;
	var selectedElement;

	$("#play-monopoly-btn").prop("disabled", true);

	$(".monopoly-circle").click(function(event) {
		var element = $(event.target);

		// Unhighlight previously selected resource, if one was previously selected
		if (selectedElement) {
			selectedElement.removeClass("highlighted-monopoly-circle");
		}

		// Highlight this resource
		selectedElement = element.parents(".monopoly-circle-container");
		selectedElement.addClass("highlighted-monopoly-circle");

		selectedMonopolyResource = selectedElement.attr("res");
		$("#play-monopoly-btn").prop("disabled", false);
	});

	$("#play-monopoly-btn").click(function(event) {
		if (selectedMonopolyResource) {
			sendPlayMonopolyAction(selectedMonopolyResource);
			$("#monopoly-modal").modal("hide");
		}
	});

	$("#monopoly-modal").on("hide.bs.modal", function(event) {
		// Clean up event handlers
		$(".monopoly-circle").off("click");
		$("#play-monopoly-btn").off("click");
		$("#monopoly-modal").off("hide.bs.modal");

	 	// Unhighlight previously selected resource, if one was previously selected
		if (selectedElement) {
			selectedElement.removeClass("highlighted-monopoly-circle");
		}
	});

	$("#monopoly-modal").modal("show");
}

// When the monopoly card button is clicked, display modal only if player has a monopoly card/
$("#monopoly-btn").click(function(event) {
	// Check that player had a monopoly card to play
	if (playersById[playerId].hand.monopoly <= 0) {
		addMessage("You don't have Monopoly");
		return;
	}

	openMonopolyModal();
});

//////////////////////////////////////////
// Year of Plenty Modal (Updated for +/-)
//////////////////////////////////////////
var currentYOP = {brick: 0, wood: 0, ore: 0, wheat: 0, sheep: 0};

function calcYearOfPlentyResources() {
    return currentYOP.brick + currentYOP.wood + currentYOP.ore + currentYOP.wheat + currentYOP.sheep;
}

$(".yop-btn-step").click(function() {
    var res = $(this).data("res");
    var action = $(this).data("action");
    var totalSelected = calcYearOfPlentyResources();
    
    if (action === "plus" && totalSelected < 2) {
        currentYOP[res]++;
    } else if (action === "minus" && currentYOP[res] > 0) {
        currentYOP[res]--;
    }
    
    $("#yop-val-" + res).text(currentYOP[res]);
    $("#play-yop-btn").prop("disabled", calcYearOfPlentyResources() !== 2);
});

$("#play-yop-btn").click(function() {
    if (calcYearOfPlentyResources() === 2) {
        sendPlayYearOfPlentyAction(currentYOP);
        $("#year-of-plenty-modal").modal("hide");
    }
});

$("#year-of-plenty-btn").click(function() {
    if (playersById[playerId].hand.yearOfPlenty <= 0) {
        addMessage("You don't have a Year of Plenty card.");
        return;
    }
    $("#year-of-plenty-modal").modal("show");
});

$("#year-of-plenty-modal").on("hide.bs.modal", function() {
    currentYOP = {brick: 0, wood: 0, ore: 0, wheat: 0, sheep: 0};
    $("[id^='yop-val-']").text("0");
    $("#play-yop-btn").prop("disabled", true);
});


//////////////////////////////////////////
// Discard Modal (Updated for +/-)
//////////////////////////////////////////
var currentDiscard = {brick: 0, wood: 0, ore: 0, wheat: 0, sheep: 0};

function calcNumDiscards() {
    return currentDiscard.brick + currentDiscard.wood + currentDiscard.ore + currentDiscard.wheat + currentDiscard.sheep;
}

function enterDiscardModal(numToDiscard) {
    $("#discard-modal").modal("show");
    $("#num-resources-to-discard").text(numToDiscard);
    $("#discard-btn").prop("disabled", true);
    
    var ph = playersById[playerId].hand;
    var currHand = {brick: ph.brick, wood: ph.wood, ore: ph.ore, wheat: ph.wheat, sheep: ph.sheep};

    // Initialize counts
    for(var res in currHand) {
        $("#discard-hand-number-" + res).text(currHand[res]);
        $("#discard-val-" + res).text("0");
    }
    currentDiscard = {brick: 0, wood: 0, ore: 0, wheat: 0, sheep: 0};

    $(".discard-btn-step").off("click").click(function() {
        var res = $(this).data("res");
        var action = $(this).data("action");
        var totalDiscarded = calcNumDiscards();
        
        if (action === "plus" && totalDiscarded < numToDiscard && currentDiscard[res] < currHand[res]) {
            currentDiscard[res]++;
        } else if (action === "minus" && currentDiscard[res] > 0) {
            currentDiscard[res]--;
        }
        
        $("#discard-val-" + res).text(currentDiscard[res]);
        $("#num-resources-to-discard").text(numToDiscard - calcNumDiscards());
        $("#discard-btn").prop("disabled", calcNumDiscards() !== numToDiscard);
    });

    $("#discard-btn").off("click").click(function() {
        if (calcNumDiscards() === numToDiscard) {
            sendDropCardsAction(currentDiscard);
            $("#discard-modal").modal("hide");
        }
    });
}

//////////////////////////////////////////
// Moving the Robber
//////////////////////////////////////////

// Highlight all tiles on board that robber could be moved to.
function highlightRobbableTiles() {
	for (var i = 0; i < board.tiles.length; i++) {
		if (board.tiles[i].isRobbable) {
			board.tiles[i].highlight();
		}
	}
}

// Exit place robber mode, unhighlighting all highlighted tiles.
function exitPlaceRobberMode() {
	for (var i = 0; i < board.tiles.length; i++) {
		if (board.tiles[i].highlighted) {
			board.tiles[i].unHighlight();
		}
	}
}

//////////////////////////////////////////
// Play Knight Action
//////////////////////////////////////////

$("#knight-btn").click(sendPlayKnightAction);

//////////////////////////////////////////
// Road Building
//////////////////////////////////////////

var inPlaceRoadMode = false;
var buttonState = {};

/*
 * Disables a button and saves its old state.
 * @param id - the id of the button to disable and save state
 * @param stateMap - the current state of the buttons
 */
function saveAndDisable(id, stateMap) {
	stateMap[id] = $(id).prop("disabled");
	$(id).prop("disabled", true);
}

// When entering place road mode, save state of all build buttons.
function enterPlaceRoadMode() {
	inPlaceRoadMode = true;
	highlightRoads();

	buttonState = {};

	saveAndDisable("#settlement-build-btn", buttonState);
	saveAndDisable("#city-build-btn", buttonState);
	saveAndDisable("#road-build-btn", buttonState);
	saveAndDisable("#buy-dev-card-modal-open", buttonState);

	saveAndDisable("#end-turn-btn", buttonState);
	saveAndDisable("#knight-btn", buttonState);
	saveAndDisable("#year-of-plenty-btn", buttonState);
	saveAndDisable("#monopoly-btn", buttonState);
	saveAndDisable("#road-building-btn", buttonState);
}

/*
 * Restores the state of a button.
 * @param id - the id of the button whose state to restore
 * @param stateMap - the old state of the buttons
 */
function restoreState(id, stateMap) {
	var oldState = stateMap[id];
	$(id).prop("disabled", oldState);
}

// When exiting place road mode, restore state of all build buttons.
function exitPlaceRoadMode() {
	restoreState("#settlement-build-btn", buttonState);
	restoreState("#city-build-btn", buttonState);
	restoreState("#road-build-btn", buttonState);
	restoreState("#buy-dev-card-modal-open", buttonState);

	restoreState("#end-turn-btn", buttonState);
	restoreState("#knight-btn", buttonState);
	restoreState("#year-of-plenty-btn", buttonState);
	restoreState("#monopoly-btn", buttonState);
	restoreState("#road-building-btn", buttonState);

	inPlaceRoadMode = false;

	unHighlightRoads();
}

$("#road-building-btn").click(sendPlayRoadBuildingAction);

//////////////////////////////////////////
// Place settlement (not building one)
//////////////////////////////////////////

var inPlaceSettlementMode = false;

// When place settlement mode is entered, highlight all available intersections.
function enterPlaceSettlementMode() {
	inPlaceSettlementMode = true;
	highlightSettlements();
}

// When place settlement mode is exited, unhighlight all intersections.
function exitPlaceSettlementMode() {
	inPlaceSettlementMode = false;
	unHighlightSettlements();
}

//////////////////////////////////////////
// Take Card Modal
//////////////////////////////////////////

/*
 * Create and enter the take card modal.
 * @param playerIds - the ids of all players who you can take a card from
 */
function enterTakeCardModal(playerIds) {
	var toStealFrom = null;

	$("#take-card-btn").prop("disabled", true);
	$("#take-card-players-list").empty();

	for (var i = 0; i < playerIds.length; i++) {
		var player = playersById[playerIds[i]];
		var color = "rgba(" + player.rgbColor.r + "," + player.rgbColor.g + "," + player.rgbColor.b + ",0.4)";
		$("#take-card-players-list").append("<label class='btn btn-default' style='background-color: " + color + "'>"
				+ "<input type='radio' name='" + player.id + "' autocomplete='off'>" + player.name + "</label>");
	}

	$("#take-card-players-list").find("label").click(function(event) {
		toStealFrom = $(event.target);
		$("#take-card-btn").prop("disabled", false);
	});

	$("#take-card-btn").click(function(event) {
		sendTakeCardAction(parseInt(toStealFrom.find("input").prop("name")));
		$("#take-card-players-list").find("label").off("click");
		$("#take-card-btn").off("click");
		$("#take-card-modal").modal("hide");
	});

	$("#take-card-modal").modal("show");
}

//////////////////////////////////////////
// Trade With Bank
//////////////////////////////////////////

// Bank trade button is initially disabled
$("#bank-trade-btn").prop("disabled", true);

var selectedToGiveElement = null;
var selectedToGiveResource  = null;
var selectedToGetElement = null;
var selectedToGetResource  = null;

// Handle a to give circle being clicked
$(".to-give-circle-container").click(function(event) {
    var element = $(this);
    // Unhighlight previously selected resource
    if (selectedToGiveElement) {
        selectedToGiveElement.removeClass("highlighted-to-give-get-circle");
    }
    // Highlight this resource
    selectedToGiveElement = element;
    selectedToGiveElement.addClass("highlighted-to-give-get-circle");
    
    selectedToGiveResource = selectedToGiveElement.attr("res");
    
    // --- NEW: Update Exchange Rate UI ---
    var rate = tradeRates[selectedToGiveResource]; 
    if (rate) {
        $("#bank-exchange-rate-text").text(rate + " to 1");
        $("#bank-trade-amount-input").val(1); // Auto-fill the input box
    }
    
    var amount = parseFloat($("#bank-trade-amount-input").val());
    if (selectedToGiveResource !== null && selectedToGetResource !== null && amount > 0) {
        $("#bank-trade-btn").prop("disabled", false);
        var calculatedRate = getExchangeRate(selectedToGiveResource, selectedToGetResource);
        $("#bank-give-amount").text(formatNumber(calculatedRate * amount));
    }
});


// Handle a to get circle being clicked
$(".to-get-circle-container").click(function(event) {
	var element = $(this);

	// Unhighlight previously selected resource, if one was previously selected
	if (selectedToGetElement) {
		selectedToGetElement.removeClass("highlighted-to-give-get-circle");
	}

	// Highlight this resource
	selectedToGetElement = element;
	selectedToGetElement.addClass("highlighted-to-give-get-circle");
	var amount = parseFloat($("#bank-trade-amount-input").val());

	selectedToGetResource = selectedToGetElement.attr("res");
	if (selectedToGiveResource !== null && selectedToGetResource !== null && amount > 0) {
		$("#bank-trade-btn").prop("disabled", false);
		var rate = getExchangeRate(selectedToGiveResource, selectedToGetResource);
		$("#bank-give-amount").text(formatNumber(rate * amount));
	}
});

// When the bank trade amount is changed, update the displayed amount to give
$("#bank-trade-amount-input").change(function(event) {
	var amount = parseFloat(formatNumber(parseFloat($("#bank-trade-amount-input").val())));
	$("#bank-trade-amount-input").val(amount);
	if (selectedToGiveResource !== null && selectedToGetResource !== null && amount > 0) {
		var rate = getExchangeRate(selectedToGiveResource, selectedToGetResource);
		$("#bank-give-amount").text(formatNumber(rate * amount));
	}
});

// When the bank trade button is clicked, initiate a trade if all fields have been set
$("#bank-trade-btn").click(function(event) {
	var amount = parseFloat($("#bank-trade-amount-input").val());

	sendTradeWithBankAction(selectedToGiveResource, selectedToGetResource, amount);

	// Reset selected resources
	selectedToGiveElement.removeClass("highlighted-to-give-get-circle");
	selectedToGetElement.removeClass("highlighted-to-give-get-circle");

	selectedToGiveElement = null;
	selectedToGiveResource  = null;
	selectedToGetElement = null;
	selectedToGetResource  = null;

	$("#bank-trade-btn").prop("disabled", true);
	$("#bank-trade-amount-input").val(1);
	$("#bank-give-amount").text(" ");
});

//////////////////////////////////////////
// Start Game Dialog
//////////////////////////////////////////

/**
 * Creates and displays the game start modal and sorts player tabs.
 */
function showStartGameDialogue(content) {
    var turnOrder = content.data.turnOrder;
    var isFirst = content.data.isFirst;
    if (isFirst) {
        $("#welcome-start-btn").text("Place First Settlements");
        $("#welcome-start-btn").click(startSetupAction);
    } else {
        $("#welcome-start-btn").text("Ready");
    }

    // Sort the Player Cards at the top of the screen to match the turn order!
    var tabsContent = $("#player-tabs-content");
    for (var i = 0; i < turnOrder.length; i++) {
        tabsContent.append($("#p" + turnOrder[i] + "-tab").css("order", i));
    }

    if (gameSettings.isDynamic) {
        $("#dynamic-rates-welcome-message").text("You are playing a game with Dynamic Exchange rates. "
                + "Bank and port rates will change dynamically based on the supply of resources in "
                + "the game. Acquiring ports still give you the same relative advantage as they do in "
                + "the classic game of Catan.");
    }
    
    $("#welcome-modal").modal("show");
}


//////////////////////////////////////////
// Roll Dice and Knight or Dice Modal
//////////////////////////////////////////

$("#roll-dice-btn").click(sendRollDiceAction);

// Displays the roll dice modal.
function showRollDiceModal() {
	$("#roll-dice-modal").modal("show");
}

// When the knight option is clicked, send a request to play a knight
$("#knight-dice-play-knight-btn").click(function(event) {
	sendKnightOrDiceAction(true);
});

// When the roll dice button is clicked, send a request to roll the dice
$("#knight-dice-roll-dice-btn").click(function(event) {
	sendKnightOrDiceAction(false);
});

// Display the knight or dice modal.
function showKnightOrDiceModal() {
	$("#knight-or-dice-modal").modal("show");
}

//////////////////////////////////////////
// Disconnected Users
//////////////////////////////////////////

var timeoutInterval;

function showDisconnectedUsersModal(disconnectData) {
    // Stop any existing exit timers
    clearInterval(timeoutInterval);
    
    // Find the player who left
    var offlinePlayerId = disconnectData.users[0].id; // Assuming the JSON has the ID
    var offlinePlayerName = disconnectData.users[0].userName;

    // Apply the "Offline" visual style to their player card
    $("#p" + offlinePlayerId + "-tab").addClass("player-disconnected");

    // Show the notice to other players
    $("#disconnected-user-name").text(offlinePlayerName);
    $("#disconnected-user-modal").modal("show");
    
    // Optional: Log it in the chat
    addMessage(offlinePlayerName + " has left the game.");
}

function hideDisconnectedUsersModal(reconnectedId) {
    clearInterval(timeoutInterval);
    $("#disconnected-user-modal").modal("hide");
    
    // Remove the offline look if we know who came back
    if (reconnectedId !== undefined) {
        $("#p" + reconnectedId + "-tab").removeClass("player-disconnected");
    }
}

//////////////////////////////////////////
// Interplayer Trade Panel
//////////////////////////////////////////

var currentTrade = {brick: 0, wood: 0, ore: 0, wheat: 0, sheep: 0};

// Clear the current interplayer trade UI
function clearInterplayerTrades() {
    currentTrade = {brick: 0, wood: 0, ore: 0, wheat: 0, sheep: 0};
    $(".trade-val").text("0");
    $(".to-give-list-item").addClass("hidden");
    $(".to-get-list-item").addClass("hidden");
    $("#propose-interplayer-trade-btn").prop("disabled", true);
}

// Handle updates to the amount of a resource via the +/- buttons
$(".trade-btn-step").off("click").click(function(event) {
    var res = $(this).data("res");
    var type = $(this).data("type"); // 'give' or 'want'
    var action = $(this).data("action"); // 'plus' or 'minus'
    
    var playerHand = playersById[playerId].hand;
    var maxToGive = playerHand[res];
    
    var oldVal = currentTrade[res] || 0;
    var newVal = oldVal;
    
    // Server expects NEGATIVE numbers for giving, POSITIVE for receiving
    if (type === 'give') {
        // Block giving if they already "want" it
        if (oldVal > 0) return; 
        
        if (action === 'plus' && -newVal < maxToGive) {
            newVal--; // Giving more (becomes more negative)
        } else if (action === 'minus' && newVal < 0) {
            newVal++; // Giving less (gets closer to 0)
        }
    } else if (type === 'want') {
        // Block wanting if they are already "giving" it
        if (oldVal < 0) return; 
        
        if (action === 'plus') {
            newVal++; // Wanting more (becomes more positive)
        } else if (action === 'minus' && newVal > 0) {
            newVal--; // Wanting less (gets closer to 0)
        }
    }
    
    if (newVal !== oldVal) {
        currentTrade[res] = newVal;
        
        // Update UI Text values 
        $("#give-val-" + res).text(newVal < 0 ? Math.abs(newVal) : 0);
        $("#want-val-" + res).text(newVal > 0 ? newVal : 0);
        
        // Call the update function for the hidden list
        updateToGiveGetPanels(res, newVal, oldVal);
        
        // Check if trade is valid
        $("#propose-interplayer-trade-btn").prop("disabled", !canTrade());
    }
});


/*
 * Determine whether an interplayer trade can be proposed.
 * @return whether an interplayer trade can be proposed
 */
 function canTrade() {
	var toGive = false;
	var toGet = false;

	for (var resource in currentTrade) {
		if (currentTrade[resource] < 0) {
			toGive = true;
		} else if (currentTrade[resource] > 0) {
			toGet = true;
		}
	}

	return (toGive && toGet);
}

/*
 * Updates the to give and to get panels for a certain resource.
 * @param resource - the resource to update
 * @param oldVal - the old value of this resource
 * @param newVal - the new value of this resourcce
 */
function updateToGiveGetPanels(resource, newVal, oldVal) {
	if (oldVal !== undefined && oldVal !== 0) {
		// Find old value container
		var container = $(oldVal > 0 ? "#to-get-container" : "#to-give-container");
		var element = container.children("[res=" + resource + "]");

		// Empty and hide old container
		element.addClass("hidden");
	}

	if (newVal !== undefined && newVal !== 0) {
		// Find old value container
		var container = $(newVal > 0 ? "#to-get-container" : "#to-give-container");
		var element = container.children("[res=" + resource + "]");

		// Show container and set correct text
		element.removeClass("hidden");
		element.children(".trade-number").text(Math.abs(newVal));
	}
}

// When the propose trade button is clicked send a propose trade action.
$("#propose-interplayer-trade-btn").click(function(event) {
	sendProposeTradeAction(currentTrade);
	clearInterplayerTrades();
});

/*
 * Handle a review trade action response.
 * @param closeModal - whether to close the trade responses modal or not
 */
 function handleReviewTradeAction(closeModal) {
	if (closeModal) {
		$("#trade-responses-modal").modal("hide");
	}
}

//////////////////////////////////////////
// Review Trade Modal
//////////////////////////////////////////

/*
 * Open the review trade modal.
 * @param tradeData - data about the current trade
 */
function showReviewTradeModal(tradeData) {
	var resources = tradeData._resources;

	// Clear previously shown resources
	$("#review-to-give-container [res]").addClass("hidden");
	$("#review-to-get-container [res]").addClass("hidden");
	$(".review-trade-number").text("");
	
	// Add resources in trade to review modal
	for (var res in resources) {
		var number = resources[res];
		
		if (number !== 0) {
			var container = $(number > 0 ? "#review-to-give-container" : "#review-to-get-container");
			var element = container.children("[res=" + res + "]");
			
			element.removeClass("hidden");
			element.children(".review-trade-number").text(Math.abs(number));
		}
	}
	
	$("#review-trade-modal").modal("show");
}

// Exit the review trade modal
function exitReviewTradeModal() {
	$("#review-trade-modal").modal("hide");
}

$("#review-trade-accept-btn").click(function(event) {
	sendReviewTradeAction(true);
});

$("#review-trade-reject-btn").click(function(event) {
	sendReviewTradeAction(false);
});

//////////////////////////////////////////
// Trade Response Modal
//////////////////////////////////////////

/*
 * Open the trade responses modal.
 * @param tradeData - data about the current trade and who has accepted or declined
 */
function showTradeResponseModal(tradeData) {
	var resources = tradeData._resources;
	var accepted = tradeData._acceptedTrade;
	var declined = tradeData._declinedTrade;

	// Clear previously shown resources
	$("#trade-responses-to-give-container [res]").addClass("hidden");
	$("#trade-responses-to-get-container [res]").addClass("hidden");
	$(".trade-responses-trade-number").text("");

	// Add resources in trade to trade responses modal
	for (var res in resources) {
		var number = resources[res];
		
		if (number !== 0) {
			var container = $(number > 0 ? "#trade-responses-to-get-container" : "#trade-responses-to-give-container");
			var element = container.children("[res=" + res + "]");
			
			element.removeClass("hidden");
			element.children(".trade-responses-trade-number").text(Math.abs(number));
		}
	}

	// Add player responses
	var playerContainer = $("#trade-responses-players-container");
	playerContainer.empty();

	for (var i = 0; i < players.length; i++) {
		var player = playersById[players[i].id];
		if (player.id !== tradeData._trader) {
			// Add finalize button if player was accepted
			if (accepted.indexOf(player.id) !== -1) {
				playerContainer.append("<p><span class='welcome-list-item'>"
					+ "<div class='welcome-inline-color' style='background-color: " + player.color + "'></div>"
					+ player.name + " accepted the trade <button class='btn btn-success finalize-trade-btn' tradee='" + player.id + "'>Finalize Trade</button></p>");
			// Add message if player declined trade
			} else if (declined.indexOf(player.id) !== -1) {
				playerContainer.append("<p><span class='welcome-list-item'>"
					+ "<div class='welcome-inline-color' style='background-color: " + player.color + "'></div>"
					+ player.name + " declined the trade</p>");
			// Add message if player has not yet responded to trade
			} else {
				playerContainer.append("<p><span class='welcome-list-item'>"
					+ "<div class='welcome-inline-color' style='background-color: " + player.color + "'></div>"
					+ player.name + " has not responded</p>");
			}
		}
	}

	$(".finalize-trade-btn").off("click");
	$(".finalize-trade-btn").click(function(event) {
		var tradee = $(this).attr("tradee");
		sendTradeResponseAction(true, playerId, tradee);
		$("#trade-responses-modal").modal("hide");
	});

	$("#trade-responses-modal").modal("show");
}

// When the trade response cancel button is clicked, send trade response action to notify other players
$("#trade-responses-cancel-trade-btn").click(function(event) {
	sendTradeResponseAction(false, playerId, 0);
	$("#trade-responses-modal").modal("hide");
});

//////////////////////////////////////////
// Winner Modal
//////////////////////////////////////////

/*
 * Show the game won modal.
 * @param winnerId - the id of the winning player
 */
function showWinnerModal(winnerId) {
	var winner = playersById[winnerId];

	if (playerId === winnerId) {
		$("#winnerLabel").text("You Won the Game!");
	} else {
		$("#winnerLabel").text(winner.name + " Won the Game");
	}

	$("#winner-modal .modal-body").append("<p>The game is over. You can start a new game of Catan from the home screen.</p>");
	$("#winner-modal").modal("show");
}

$("#return-home-btn").click(deleteAllCookiesAndGoHome);

//////////////////////////////////////////
// Update Resource
//////////////////////////////////////////

var currSeqPlace = 0;
var updateResourceSeq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65, 13];

// When a key is pressed, progress through update resources sequence
$(document).keydown(function(event) {
	var key = (event.keyCode ? event.keyCode : event.which);
	if (key === updateResourceSeq[currSeqPlace]) {
		currSeqPlace = currSeqPlace + 1;
	} else {
		currSeqPlace = 0;
	}

	if (currSeqPlace === updateResourceSeq.length) {
		sendUpdateResourceAction();
	}
});

//////////////////////////////////////////
// Decimal Trade Rates
//////////////////////////////////////////

/*
 * Set input buttons to only allow decimals based on the isDecimal option.
 * @param isDecimal - whether the isDecimal option is set
 */
function setDecimalTradeRates(isDecimal) {
	if (isDecimal) {
		$("input[type=number]").attr("step", 0.01);
	} else {
		$("input[type=number]").attr("step", 1);
	}
}

//////////////////////////////////////////
// Game Stats Page
//////////////////////////////////////////

// Create and show the roll distribution modal.
$("#show-stats-btn").click(function(event) {
	var rolls = gameStats.rolls;
	var data = {
		labels: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
		series: [rolls]
	};

	var options = {
  		width: 400,
  		height: 400
	};

	new Chartist.Bar('.ct-chart', data, options);
});

//////////////////////////////////////////
// Options Tab
//////////////////////////////////////////

var muted = false;

// Create and fill the extras tab
function buildExtrasTab() {
	$("#game-settings-container").empty();
	$("#game-settings-container").append("<p><strong>Victory Points: </strong>" + gameSettings.winningPointCount + "</p>"
			+ "<p><strong>Number of Players: </strong>" + gameSettings.numPlayers + "</p>"
			+ "<p><strong>Decimal Values: </strong>" + (gameSettings.isDecimal ? "ON" : "OFF") + "</p>"
			+ "<p><strong>Dynamic Rates: </strong>" + (gameSettings.isDynamic ? "ON" : "OFF") + "</p>");

	$("#game-stats-container").empty();
	$("#game-stats-container").append("<p><strong>Turn: </strong>" + gameStats.turn + "</p>");
}

/*
 * Adds a message to message history.
 * @param message - the message to add to message history
 */
function addToMessageHistory(message) {
	$("#message-history-list").prepend("<li class='list-group-item'>" + message + "</li>");
}

// Handle the mute button being clicked.
$("#mute-btn").click(function() {
	muted = !($(this).hasClass("active"));
});

