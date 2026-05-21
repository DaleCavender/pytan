$(window).load(function() {
	var href = window.location.pathname;
	if (href == "/home") {
		deleteCookie("desiredGroupId");
	}
});

// ---------- Setup ---------- //
// Dynamically determine secure or unsecure WebSocket based on the page protocol
// This forces the WebSocket to match whatever the browser sees (HTTPS -> WSS)
var wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
var wsUrl = wsProtocol + window.location.host + "/groups/"; // Use /groups/ for home.js
var webSocket = new WebSocket(wsUrl);

// Available colors
var ALLOWED_COLORS = ["#BF2720", "#115EC9", "#DFA629", "#EDEAD9", "#8B4513", "#228B22"];
var selectedProfileColor = null;



// NOTE: Use "/action/" for websocket.js and "/groups/" for home.js


// Send a heartbeat on the websocket
function heartbeat() {
	var beat = "HEARTBEAT";
	webSocket.send(JSON.stringify(beat));
}

// Start heartbeats when the websocket opens
webSocket.onopen = function() {
	window.setInterval(heartbeat, 10 * 1000);
};

// Handle message from the websocket
webSocket.onmessage = function(msg) {
	var data = JSON.parse(msg.data);
	console.log(data);
	if (data == "HEARTBEAT") {
		return;
	}

	$("#startGameButton").prop("disabled", data.atLimit);
	if (data.atLimit) {
		$("#startGameButton").text("Sorry, Game Limit Reached");
	} else {
		$("#startGameButton").text("Start Game!");
	}

	if (data.hasOwnProperty("groups")) {
		createJoinableGameList(data.groups);
	}
}

/*
 * Displays all available groups to join.
 * @param groups - the current groups to join
 */
function createJoinableGameList(groups) {
	$("#games-list").empty();

	// Add message if no groups exist yet
	if (groups.length === 0) {
		$("#games-list")
				.append(
						"<li class='list-group-item'>No available games. Create your own!</li>");
		return;
	}

	// Add to list of joinable games
	for (var i = 0; i < groups.length; i++) {
		var group = groups[i].group;
		$("#games-list")
				.append(
						"<li class='list-group-item'><div class='row'>"
								+ "<div class='col-xs-4 text-left vertical-center'><span>"
								+ group.groupName
								+ ":</span></div>"
								+ "<div class='col-xs-4 text-center vertical-center'>"
								+ "<span><strong>"
								+ group.currentSize
								+ "/"
								+ group.maxSize
								+ "</strong> Players</span></div>"
								+ "<div class='col-xs-4 text-right'><input class='btn btn-default join-game-btn col-xs-4' "
								+ "type='submit' onClick='return existingGameSelected(this)' value='Join Game' gameid='"
								+ group.id + "' maxSize='" + group.maxSize
								+ "'></div></div>");

	}
}

// Move from username entry screen to game creation/join screen
$("#enter-name-begin-btn").click(openCreateJoinGame);
$("#nameEntry").keypress(function(event) {
	var keyPressed = (event.keyCode ? event.keyCode : event.which);
	if (keyPressed === 13) {
		openCreateJoinGame();
	}
});

// Only allow alphanumeric and whitespace characters as user input
$("#nameEntry, #game-name-entry").on("input", function(event) {
	var input = $(this);
	var currText = input.val();

	var cleanedText = currText.replace(/[^A-Za-z0-9\s]+/g, "");
	input.val(cleanedText);
});

/*
 * Opens the create/join game screen.
 */
function openCreateJoinGame() {
	var name = $("#nameEntry").val();
	if (name !== undefined && name !== "") {
		$("#pre-name-container").addClass("hidden");
		$("#post-name-container").removeClass("hidden");

		// Vertically center text
		var btnHeight = $("#games-list .join-game-btn").outerHeight();
		$("#games-list .vertical-center").css("height", btnHeight);
		$("#games-list .vertical-center *")
				.css("line-height", btnHeight + "px");
	}
}

/*
 * Handle a request to join an existing game.
 * @param caller - the object that called this function
 */
function existingGameSelected(caller) {
	console.log(caller);
	var userName = id("nameEntry").value;
	var groupId = $(caller).attr("gameid");
	var groupSize = $(caller).attr("maxSize");
	var victoryPoints = id("victory-points-input").value;

	if (userName == undefined || userName == "") {
		alert("Please select a username");
		return false;
	}

	setCookie("desiredGroupId", groupId);
	setCookie("userName", userName);
	setCookie("numPlayersDesired", groupSize);
	setCookie("victoryPoints", victoryPoints);
	deleteCookie("USER_ID");
	return true;
}

// Display all cookies
function displayCookies() {
	alert(document.cookie);
}

/*
 * Returns a cookie of the given name.
 * @param name - the name of the cookie
 */
function getCookie(name) {
	var nameEQ = name + "=";
	// alert(document.cookie);
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
 
function stopReturnKey(evt) {
	var evt = (evt) ? evt : ((event) ? event : null);
	var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement
			: null);
	if ((evt.keyCode == 13) && (evt.target.id != "startGameButton")) {
		return false;
	}
}

/*
 * Handle a request to start a new game.
 */
function startGamePressed() {
	var userName = id("nameEntry").value;
	var numPlayers = id("numPlayersDesired").value;
	var groupName = id("game-name-entry").value;
	var victoryPoints = id("victory-points-input").value;

	if (userName == undefined || userName == "") {
		alert("Please select a username");
		return false; // will not allow the get reqeust to process.
	}

	if (groupName === undefined || groupName === "") {
		alert("Please select a name for your game");
		return false;
	}

	setCookie("userName", userName);
	setCookie("numPlayersDesired", numPlayers);
	setCookie("victoryPoints", victoryPoints);
	setCookie("groupName", groupName);

	deleteCookie("USER_ID");
	return true; // will allow the get request to process.
}

function deleteCookie(name) {
	document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// Helper function for inserting HTML as the first child of an element
function insert(targetId, message) {
	id(targetId).insertAdjacentHTML("afterbegin", message);
}

// Helper function for selecting element by id
function id(id) {
	return document.getElementById(id);
}

document.onkeypress = stopReturnKey;

// Initialize the color picker
ALLOWED_COLORS.forEach(function(color) {
    var colorBox = $("<div class='circle pointer'></div>").css({
        "background-color": color,
        "width": "25px",
        "height": "25px",
        "border": "2px solid transparent"
    });
    
    colorBox.click(function() {
        $("#color-picker-container .circle").css("border", "2px solid transparent");
        $(this).css("border", "2px solid #333");
        selectedProfileColor = color;
    });
    
    $("#color-picker-container").append(colorBox);
});

// Handle Save Button
$("#update-profile-btn").click(function() {
    var newName = $("#profile-name-input").val().trim();
    if (!newName && !selectedProfileColor) return;
    
    sendUpdateProfileAction(newName, selectedProfileColor);
    $("#profile-name-input").val(""); // Clear after saving
});
