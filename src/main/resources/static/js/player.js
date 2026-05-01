/**
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
    this.longestRoadLength = 0;
    this.largestArmy = false;
    this.longestRoad = false;
    this.hand = {};
}

/**
 * Renders the prominent player card at the top of the UI
 */
Player.prototype.addPlayerTab = function() {
    var tabTitle = (this.id === playerId) ? "You" : "P" + this.id;
    $("#player-tabs-content").append("<div class='player-tab-pane' id='p" + this.id + "-tab'></div>");
    var tab = $("#p" + this.id + "-tab");
    
    var victoryPointsToDisplay = this.victoryPoints;
    if (this.hand.hasOwnProperty("victoryPoint")) {
        victoryPointsToDisplay += this.hand.victoryPoint;
    }
    
    var rgb = this.rgbColor.r + "," + this.rgbColor.g + "," + this.rgbColor.b;
    var hdrColor = "rgba(" + rgb + ", 0.9)";
    
    var html = "";
    
    // Header: Prominent Name and massive VP Badge
    html += "<div class='pc-header' style='background-color:" + hdrColor + "; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;'>";
    html += "  <div style='font-size: 18px; font-weight: 900;'>" + this.name + " <span style='font-size:12px; font-weight:normal;'>(" + tabTitle + ")</span></div>";
    
    // The VP Badge
    html += "  <div style='background: #EAC932; color: #333; padding: 4px 10px; border-radius: 12px; font-size: 18px; font-weight: bold; border: 1px solid #333; display: flex; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);'>";
    html += "    <img src='/images/icon-victory-point.svg' style='width:20px; margin-right:6px;'> " + victoryPointsToDisplay;
    html += "  </div>";
    html += "</div>";
    
    // Body: Larger icons, better flex spacing
    html += "<div class='pc-body' style='padding: 10px; display: flex; flex-direction: column; gap: 8px; font-size: 14px;'>";
    
    // Row 1: Cards & Knights
    html += "  <div style='display: flex; justify-content: space-around;'>";
    html += "    <span title='Resource Cards' style='display:flex; align-items:center;'><span class='glyphicon glyphicon-file text-muted' style='font-size:18px; margin-right:4px;'></span> <strong>" + formatNumber(this.resourceCards) + "</strong></span>";
    html += "    <span title='Development Cards' style='display:flex; align-items:center;'><span class='glyphicon glyphicon-credit-card text-muted' style='font-size:18px; margin-right:4px;'></span> <strong>" + this.developmentCards + "</strong></span>";
    html += "    <span title='Longest Path' style='display:flex; align-items:center;'><span class='glyphicon glyphicon-road text' style='font-size:18px; margin-right:4px;'></span> " + this.longestRoadLength + "</span>";
    html += "    <span title='Played Knights' style='display:flex; align-items:center;'><img src='/images/icon-knight.svg' style='width:25px; margin-right:4px;'> <strong>" + this.playedKnights + "</strong></span>";
    html += "  </div>";
    
    // Row 2: Buildings
    html += "  <div style='display: flex; justify-content: space-around; border-top: 1px solid #ddd; padding-top: 8px;'>";
    html += "    <span title='Roads Remaining' style='display:flex; align-items:center;'><span class='glyphicon glyphicon-road text-muted' style='font-size:18px; margin-right:4px;'></span> " + this.roads + "</span>";
    html += "    <span title='Settlements Remaining' style='display:flex; align-items:center;'><span class='glyphicon glyphicon-home text-muted' style='font-size:18px; margin-right:4px;'></span> " + this.settlements + "</span>";
    html += "    <span title='Cities Remaining' style='display:flex; align-items:center;'><span class='glyphicon glyphicon-tower text-muted' style='font-size:18px; margin-right:4px;'></span> " + this.cities + "</span>";
    html += "  </div>";
    
    html += "</div>";
    
    // Footer: Special Achievement Badges
    if (this.longestRoad || this.largestArmy) {
        html += "<div class='pc-badges' style='padding: 6px; background: #eee; display: flex; justify-content: center; gap: 5px;'>";
        if (this.longestRoad) {
            var roadText = this.longestRoadLength ? " (" + this.longestRoadLength + ")" : "";
            html += "<span class='label label-danger' style='font-size:12px;'><span class='glyphicon glyphicon-road'></span> Road" + roadText + "</span>";
        }
        if (this.largestArmy) {
            html += "<span class='label label-primary' style='font-size:12px;'><img src='/images/icon-knight.svg' style='width:14px; margin-right:3px;'> Army</span>";
        }
        html += "</div>";
    }
    
    tab.append(html);
    
    // Apply styling to the overall card container
    tab.css({
        "width": "230px", // Increased width for better breathing room
        "background-color": "white",
        "border": "2px solid " + hdrColor,
        "border-radius": "8px", // Round the corners nicely
        "box-shadow": "0 4px 8px rgba(0,0,0,0.2)",
        "overflow": "hidden",
        "margin": "0 5px"
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

/**
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
        player.longestRoadLength = playerData.longestRoadLength; 
        player.resourceCards = playerData.numResourceCards;
        player.developmentCards = playerData.numDevelopmentCards;
        
        players.push(player);
    }
    return players;
}

/**
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

    $("#hand-roads-count").text(player.roads);
    $("#hand-settlements-count").text(player.settlements);
    $("#hand-cities-count").text(player.cities);
    
    // Set the building icons to the player's actual color
    $(".player-building-swatch").css("background-color", player.color);
}

/**
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

/**
 * Fills the player's bank trade rates in the gui.
 * @param rates - the player's trade rates
 */
function fillPlayerTradeRates(rates) {
    $("#brick-trade-rate").text(rates.brick + ":1");
    $("#wood-trade-rate").text(rates.wood + ":1");
    $("#ore-trade-rate").text(rates.ore + ":1");
    $("#wheat-trade-rate").text(rates.wheat + ":1");
    $("#sheep-trade-rate").text(rates.sheep + ":1");
}

/**
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
