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
 * Renders the compact player card at the top of the UI
 */
Player.prototype.addPlayerTab = function() {
    var tabTitle = (this.id === playerId) ? "You" : "P" + this.id;

    // Injecting directly as a card
    $("#player-tabs-content").append("<div class='player-tab-pane' id='p" + this.id + "-tab'></div>");
    var tab = $("#p" + this.id + "-tab");

    var victoryPointsToDisplay = this.victoryPoints;
    if (this.hand.hasOwnProperty("victoryPoint")) {
        victoryPointsToDisplay = victoryPointsToDisplay + this.hand.victoryPoint;
    }

    // Color styling
    var rgb = this.rgbColor.r + "," + this.rgbColor.g + "," + this.rgbColor.b;
    var hdrColor = "rgba(" + rgb + ", 0.9)";
    
    var html = "";
    
    // Header: Name and Victory Points
    html += "<div class='pc-header' style='background-color:" + hdrColor + ";'>";
    html += "  <span class='pc-name'><strong>" + this.name + "</strong> <small>(" + tabTitle + ")</small></span>";
    html += "  <span class='pc-vp'><strong>" + victoryPointsToDisplay + "</strong> <img src='images/icon-victory-point.svg' class='pc-icon' style='width:18px; margin-top:-4px;'></span>";
    html += "</div>";

    // Body: Two compact rows of stats using icons
    html += "<div class='pc-body'>";
    
    // Row 1: Current Hand Items (Resource Cards, Dev Cards, Played Knights)
    html += "  <div class='pc-row' title='Hand Info'>";
    html += "    <span title='Resource Cards'><span class='glyphicon glyphicon-file text-muted'></span> " + formatNumber(this.resourceCards) + "</span>";
    html += "    <span title='Development Cards'><span class='glyphicon glyphicon-credit-card text-muted'></span> " + this.developmentCards + "</span>";
    html += "    <span title='Played Knights'><img src='images/icon-knight.svg' class='pc-icon'> " + this.playedKnights + "</span>";
    html += "  </div>";
    
    // Row 2: Remaining Buildings (Roads, Settlements, Cities)
    html += "  <div class='pc-row' title='Buildings Remaining'>";
    html += "    <span title='Roads Remaining'><span class='glyphicon glyphicon-road text-muted'></span> " + this.roads + "</span>";
    html += "    <span title='Settlements Remaining'><span class='glyphicon glyphicon-home text-muted'></span> " + this.settlements + "</span>";
    html += "    <span title='Cities Remaining'><span class='glyphicon glyphicon-tower text-muted'></span> " + this.cities + "</span>";
    html += "  </div>";
    
    html += "</div>";

    // Footer: Special Achievement Badges
    if (this.longestRoad || this.largestArmy) {
        html += "<div class='pc-badges'>";
        if (this.longestRoad) {
            var roadText = this.longestRoadLength ? " (" + this.longestRoadLength + ")" : "";
            html += "<span class='label label-danger' title='Longest Road'><span class='glyphicon glyphicon-road'></span> Longest Road" + roadText + "</span> ";
        }
        if (this.largestArmy) {
            html += "<span class='label label-primary' title='Largest Army'><img src='images/icon-knight.svg' style='width:12px;'> Largest Army</span>";
        }
        html += "</div>";
    }

    tab.append(html);
    
    // Apply border matching player color
    tab.css({
        "background-color": "white",
        "border": "2px solid " + hdrColor,
        "padding": "0"
    });
}

/**
 * Highlights the active player's tab instead of using the old turn squares.
 */
Player.prototype.fillTurnDisplay = function() {
    var tab = $("#p" + this.id + "-tab");
    
    if (currentPlayerTurn === this.id) {
        tab.addClass("active-turn-highlight");
    } else {
        tab.removeClass("active-turn-highlight");
    }
}


/*
 * Creates a new player from the given player data.
 */
function parsePlayers(playersData) {
    var players = [];
    for (var i = 0; i < playersData.length; i++) {
        var playerData = playersData[i];
        var player = new Player(playerData.id, playerData.name, playerData.color);
        
        player.victoryPoints = playerData.victoryPoints;
        player.playedKnights = playerData.numPlayedKnights;
        player.roads = playerData.numRoads;
        player.settlements = playerData.numSettlements;
        player.cities = playerData.numCities;
        player.largestArmy = playerData.largestArmy;
        player.longestRoad = playerData.longestRoad;
        // If the server ever sends the length, we capture it here:
        player.longestRoadLength = playerData.longestRoadLength || ""; 
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

