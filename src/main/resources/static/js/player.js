/*
 * Constructs a new Player object.
 * @param id - the id of this player
 * @param name - the name of this player
 * @param color - the color of this player
 */
function Player(id, name, color) {
	this.id = id;
	this.name = name;
	this.color = color;
	this.rgbColor = hexToRgb(color);

	this.victoryPoints = 0;
	this.resourceCards = 0;
	this.developmentCards = 0;
	this.playedKnights = 0;
	this.roads = 0;
	this.settlements = 0;
	this.cities = 0;
	this.largestArmy = false;
	this.longestRoad = false;

	this.hand = {};
}

/*
 * Adds a tab to the players tabs with all of this player's information.
 */
Player.prototype.addPlayerTab = function() {
    var tabTitle = (this.id === playerId) ? "You" : "P" + this.id;
    
    // Injecting directly as a card instead of a hidden tab panel
    $("#player-tabs-content").append("<div class='player-tab-pane' id='p" + this.id + "-tab'></div>");
    var tab = $("#p" + this.id + "-tab");
    
    var victoryPointsToDisplay = this.victoryPoints;
    if (this.hand.hasOwnProperty("victoryPoint")) {
        victoryPointsToDisplay = victoryPointsToDisplay + this.hand.victoryPoint;
    }
    
    tab.append("<div class='player-name text-center'><h4>" + this.name + " (" + tabTitle + ")</h4></div>");
    tab.append("<h4 class='text-center player-victory-points'>" + victoryPointsToDisplay 
            + "<img class='player-tab-vp-icon' src='images/icon-victory-point.svg' alt='Victory Point'></h4>"
            + "<h5 class='text-center playing-to'>Playing to " + gameSettings.winningPointCount + "</h5>");
    
    tab.append("<div class='panel panel-default player-tab-panel'><div class='panel-heading'>"
            + "<h5 class='panel-title-small'>Hand & Resources</h5></div><div class='panel-body'>"
            + "<p><strong>Cards:</strong> " + formatNumber(this.resourceCards) + " | <strong>Dev:</strong> " + this.developmentCards + "</p>"
            + "<p><strong>Knights:</strong> " + this.playedKnights + "</p></div></div>");
            
    tab.append("<div class='panel panel-default player-tab-panel'><div class='panel-heading'>"
            + "<h5 class='panel-title-small'>Buildings Remaining</h5></div><div class='panel-body'>"
            + "<p><strong>R:</strong> " + this.roads + " | <strong>S:</strong> " + this.settlements + " | <strong>C:</strong> " + this.cities + "</p></div></div>");

    if (this.longestRoad) {
        tab.append("<div class='longest-road-banner text-center'><h4>Longest Road<img src='images/icon-road-building.svg' alt='Road Building'></h4></div>");
    }
    if (this.largestArmy) {
        tab.append("<div class='largest-army-banner text-center'><h4>Largest Army<img src='images/icon-knight.svg' alt='Knight'></h4></div>");
    }

    // Modify color scheme to fit this player's color
    var rgb = this.rgbColor.r + "," + this.rgbColor.g + "," + this.rgbColor.b;
    tab.css("background-color", "rgba(" + rgb + ",0.85)"); // increased opacity so they pop over the board
    
    var panels = $("#p" + this.id + "-tab .panel");
    panels.css("border-color", "rgba(" + rgb + ",0.6)");
    
    var panelHeadings = panels.children(".panel-heading");
    panelHeadings.css("background-color", "rgba(" + rgb + ",0.4)");
    panelHeadings.css("border-color", "rgba(" + rgb + ",0.6)");
}


/*
 * Fills the appropriate sections of the turn display for this player.
 */
Player.prototype.fillTurnDisplay = function() {
	var displayContainer = $("#turn-display-container");
	displayContainer.append("<div id='" + this.id + "-turn-square' class='turn-square'></div>");

	var width = $("#end-turn-btn").outerWidth() / players.length;
	var height = $("#end-turn-btn").outerWidth() / 4;

	var turnSquare = $("#" + this.id + "-turn-square");
	turnSquare.css("width", width);
	turnSquare.css("height", height);
	turnSquare.css("background-color", this.color);

	if (currentPlayerTurn === this.id) {
		turnSquare.addClass("selected-turn-square");
	}
}

/*
 * Creates a new player from the given player data.
 * @param playersData - the player data
 * @return the new player object
 */
function parsePlayers(playersData) {
	var players = [];

	for (var i = 0; i < playersData.length; i++) {
		var playerData = playersData[i];

		// Construct player from playerData object
		var player = new Player(playerData.id, playerData.name, playerData.color);
		player.victoryPoints = playerData.victoryPoints;
		player.playedKnights = playerData.numPlayedKnights;
		player.roads = playerData.numRoads;
		player.settlements = playerData.numSettlements;
		player.cities = playerData.numCities;
		player.largestArmy = playerData.largestArmy;
		player.longestRoad = playerData.longestRoad;
		player.resourceCards = playerData.numResourceCards;
		player.developmentCards = playerData.numDevelopmentCards;

		players.push(player);
	}

	return players;
}

/*
 * Fills this player's hand from the given hand data.
 * @param handData - the number of each card that the player possesses
 */
function fillPlayerHand(handData) {
	var player = playersById[playerId];

	// Add resource cards to this player's hand
	$("#brick-number").text(formatNumber(handData.resources.brick));
	player.hand.brick = handData.resources.brick;

	$("#wood-number").text(formatNumber(handData.resources.wood));
	player.hand.wood = handData.resources.wood;

	$("#ore-number").text(formatNumber(handData.resources.ore));
	player.hand.ore = handData.resources.ore;

	$("#wheat-number").text(formatNumber(handData.resources.wheat));
	player.hand.wheat = handData.resources.wheat;

	$("#sheep-number").text(formatNumber(handData.resources.sheep));
	player.hand.sheep = handData.resources.sheep;

	// Add dev cards to this player's hand
	$("#knight-number").text(handData.devCards["Knight"]);
	player.hand.knight = handData.devCards["Knight"];

	$("#year-of-plenty-number").text(handData.devCards["Year of Plenty"]);
	player.hand.yearOfPlenty = handData.devCards["Year of Plenty"];

	$("#monopoly-number").text(handData.devCards["Monopoly"]);
	player.hand.monopoly = handData.devCards["Monopoly"];

	$("#road-building-number").text(handData.devCards["Road Building"]);
	player.hand.roadBuilding = handData.devCards["Road Building"];

	$("#victory-point-number").text(handData.devCards["Victory Point"]);
	player.hand.victoryPoint = handData.devCards["Victory Point"];
}

/*
 * Displays the player's options to buy buildings if they possess the correct resources.
 * @param handData - the player's hand data
 */
function fillPlayerBuyOptions(handData) {
	if (handData.canBuildSettlement) {
		$("#settlement-build-btn").prop("disabled", false);
	} else {
		$("#settlement-build-btn").prop("disabled", true);
	}

	if (handData.canBuildCity) {
		$("#city-build-btn").prop("disabled", false);
	} else {
		$("#city-build-btn").prop("disabled", true);
	}

	if (handData.canBuildRoad) {
		$("#road-build-btn").prop("disabled", false);
	} else {
		$("#road-build-btn").prop("disabled", true);
	}

	if (handData.canBuyDevCard) {
		$("#buy-dev-card-modal-open").prop("disabled", false);
	} else {
		$("#buy-dev-card-modal-open").prop("disabled", true);
	}
}

/*
 * Fills the player's bank trade rates in the gui.
 * @param rates - the player's trade rates
 */
function fillPlayerTradeRates(rates) {
	$("#brick-trade-rate").text(rates.brick);
	$("#wood-trade-rate").text(rates.wood);
	$("#ore-trade-rate").text(rates.ore);
	$("#wheat-trade-rate").text(rates.wheat);
	$("#sheep-trade-rate").text(rates.sheep);
}

/*
 * Converts a color in hex to a rgb object.
 * @param hex - the hexadecimal representation of the color
 * @return the rgb color
 */
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);
    return { r: r, g: g, b: b };
}

