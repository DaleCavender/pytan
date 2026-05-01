<#assign content>

<!-- The Game Board (Full Screen Background) -->
<div id="board-viewport" class="sea-color unselectable"></div>

<!-- ==========================================
     1. TOP OVERLAY: Player Cards
     ========================================== -->
<div id="top-players-container" class="ui-overlay">
    <div id="player-tabs-content" class="player-cards-wrapper">
        <!-- player.js dynamically injects Player Cards here -->
    </div>
</div>

<!-- ==========================================
     2. SIDE OVERLAY: Left & Right Panels
     ========================================== -->
<div id="side-controls-container" class="ui-overlay">
    
    <!-- LEFT PANEL: Chat & End Turn -->
    <div id="left-ui-panel">
        <input type="button" class="btn btn-primary btn-block" id="end-turn-btn" value="End Turn" style="margin: 10px 0;">
        
        <div id="chat-container">
            <div id="chat"></div>
            <div id="chatControls">
                <input id="message" class="form-control" placeholder="Type a message...">
            </div>
        </div>
    </div>

    <!-- RIGHT PANEL: Trade & Extras Tabs -->
    <div id="right-ui-panel">
        <div id="right-menu-container" class="panel panel-default">
            
            <!-- Tab Headers (Icons) -->
            <ul class="nav nav-pills nav-stacked" id="right-tab-tabs" role="tablist">
                <li role="presentation" class="active">
                    <a href="#trade-tab" data-toggle="tab" title="Trade"><span class="glyphicon glyphicon-transfer"></span></a>
                </li>
                <li role="presentation">
                    <a href="#extras-tab" data-toggle="tab" title="Settings"><span class="glyphicon glyphicon-cog"></span></a>
                </li>
            </ul>
            
            <!-- Tab Content -->
            <div class="tab-content right-tab-content">
                
                <!-- Trade Tab -->
                <div role="tabpanel" class="tab-pane active" id="trade-tab">
                    <ul class="nav nav-tabs right-inner-tabs" role="tablist">
                        <li role="presentation" class="active" id="interplayer-trade-tab-toggle">
                            <a href="#player-trade-tab" role="tab" data-toggle="tab">Players</a>
                        </li>
                        <li role="presentation" id="bank-trade-tab-toggle">
                            <a href="#bank-trade-tab" role="tab" data-toggle="tab">Bank</a>
                        </li>
                    </ul>
                    
                    <div class="tab-content">
                        <!-- Interplayer Trade -->
                        <div role="tabpanel" class="tab-pane active" id="player-trade-tab">
                            <div class="trade-grid">
                                <#list ["brick", "wood", "ore", "wheat", "sheep"] as res>
                                <div class="trade-resource-row">
                                    <div class="circle trade-circle ${res}-color">
                                        <img src="/images/icon-${res}.svg" alt="${res}">
                                    </div>
                                    <div class="trade-stepper">
                                        <button class="btn btn-xs btn-default trade-btn-step" data-res="${res}" data-type="give" data-action="plus"><span class="glyphicon glyphicon-plus"></span></button>
                                        <span class="trade-val text-danger" id="give-val-${res}">0</span>
                                        <button class="btn btn-xs btn-default trade-btn-step" data-res="${res}" data-type="give" data-action="minus"><span class="glyphicon glyphicon-minus"></span></button>
                                        <small class="text-muted">Give</small>
                                    </div>
                                    <div class="trade-stepper">
                                        <button class="btn btn-xs btn-default trade-btn-step" data-res="${res}" data-type="want" data-action="plus"><span class="glyphicon glyphicon-plus"></span></button>
                                        <span class="trade-val text-success" id="want-val-${res}">0</span>
                                        <button class="btn btn-xs btn-default trade-btn-step" data-res="${res}" data-type="want" data-action="minus"><span class="glyphicon glyphicon-minus"></span></button>
                                        <small class="text-muted">Want</small>
                                    </div>
                                </div>
                                </#list>
                            </div>
                            <div class="text-center" style="padding: 10px;">
                                <input type="button" id="propose-interplayer-trade-btn" class="btn btn-primary btn-sm" value="Propose Trade" disabled="disabled">
                            </div>
                        </div>

                        <!-- Bank Trade -->
                        <div role="tabpanel" class="tab-pane text-center" id="bank-trade-tab">
                            <div id="bank-trade-container" style="padding: 10px;">
                                <label>Give:</label>
                                <div class="bank-resources-grid">
                                    <div class="bank-resources-grid">
                                        <div class="to-give-circle-container circle" res="brick" style="position:relative;">
                                            <div class="circle trade-circle brick-color pointer"><img src="/images/icon-brick.svg"></div>
                                            <span class="badge" id="brick-trade-rate" style="position:absolute; bottom:-5px; right:-5px; background-color:#d9534f; font-size:11px; border:1px solid white;">4:1</span>
                                        </div>
                                        <div class="to-give-circle-container circle" res="wood" style="position:relative;">
                                            <div class="circle trade-circle wood-color pointer"><img src="/images/icon-wood.svg"></div>
                                            <span class="badge" id="wood-trade-rate" style="position:absolute; bottom:-5px; right:-5px; background-color:#d9534f; font-size:11px; border:1px solid white;">4:1</span>
                                        </div>
                                        <div class="to-give-circle-container circle" res="ore" style="position:relative;">
                                            <div class="circle trade-circle ore-color pointer"><img src="/images/icon-ore.svg"></div>
                                            <span class="badge" id="ore-trade-rate" style="position:absolute; bottom:-5px; right:-5px; background-color:#d9534f; font-size:11px; border:1px solid white;">4:1</span>
                                        </div>
                                        <div class="to-give-circle-container circle" res="wheat" style="position:relative;">
                                            <div class="circle trade-circle wheat-color pointer"><img src="/images/icon-wheat.svg"></div>
                                            <span class="badge" id="wheat-trade-rate" style="position:absolute; bottom:-5px; right:-5px; background-color:#d9534f; font-size:11px; border:1px solid white;">4:1</span>
                                        </div>
                                        <div class="to-give-circle-container circle" res="sheep" style="position:relative;">
                                            <div class="circle trade-circle sheep-color pointer"><img src="/images/icon-sheep.svg"></div>
                                            <span class="badge" id="sheep-trade-rate" style="position:absolute; bottom:-5px; right:-5px; background-color:#d9534f; font-size:11px; border:1px solid white;">4:1</span>
                                        </div>
                                    </div>

                                </div>
                                <hr style="margin: 10px 0;">
                                <label>Receive:</label>
                                <div class="bank-resources-grid">
                                    <#list ["brick", "wood", "ore", "wheat", "sheep"] as res>
                                        <div class="to-get-circle-container circle" res="${res}">
                                            <div class="circle trade-circle ${res}-color pointer"><img src="/images/icon-${res}.svg"></div>
                                        </div>
                                    </#list>
                                </div>
                                <div style="margin-top: 15px;">
                                    <input id="bank-trade-amount-input" class="form-control input-sm" type="number" value="1" style="width: 60px; display: inline-block;">
                                    <input type="button" class="btn btn-primary btn-sm" value="Trade With Bank" id="bank-trade-btn">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Extras Tab -->
                <div role="tabpanel" class="tab-pane" id="extras-tab" style="padding: 10px;">
                    <div class="list-group" style="margin-bottom: 0;">
                        <div class="list-group-item active">Settings & Info</div>
                        <div class="list-group-item" id="game-settings-container"></div>
                        <button id="mute-btn" type="button" class="list-group-item" data-toggle="button"><span class="glyphicon glyphicon-volume-off"></span> Mute Audio</button>
                        <button id="show-stats-btn" class="list-group-item" data-toggle="modal" data-target="#stats-modal"><span class="glyphicon glyphicon-stats"></span> Roll Distribution</button>
                        <button id="message-history-btn" class="list-group-item" data-toggle="modal" data-target="#message-history-modal"><span class="glyphicon glyphicon-list-alt"></span> Message History</button>
                        <a href="http://www.catan.com/service/game-rules" target="_blank" class="list-group-item"><span class="glyphicon glyphicon-book"></span> Official Rules</a>
                        <button class="list-group-item btn-danger text-white" data-toggle="modal" data-target="#exit-game-modal"><span class="glyphicon glyphicon-log-out"></span> Leave Game</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ==========================================
     3. BOTTOM RIGHT OVERLAY: Build Menu
     ========================================== -->
<div id="build-menu-container" class="ui-overlay">
    <div class="panel panel-default build-panel-custom">
        <div class="panel-heading text-center"><h5 class="panel-title-small">Build</h5></div>
            <div class="panel-body" style="padding: 10px;">
            <!-- Settlement -->
            <div class="build-item-container" style="margin-bottom: 10px;">
                <div style="font-weight: bold; font-size: 12px; text-transform: uppercase;">Settlement</div>
                <div class="build-item-row" style="display: flex; align-items: center;">
                    <button class="btn btn-default build-btn" id="settlement-build-btn" title="Build Settlement" disabled><span class="glyphicon glyphicon-home"></span></button>
                    <div class="build-cost-group" style="display: flex; margin-left: 10px; align-items: center;">
                        1<div class="circle build-circle brick-color"><img src="/images/icon-brick.svg"></div>
                        1<div class="circle build-circle wood-color"><img src="/images/icon-wood.svg"></div>
                        1<div class="circle build-circle wheat-color"><img src="/images/icon-wheat.svg"></div>
                        1<div class="circle build-circle sheep-color"><img src="/images/icon-sheep.svg"></div>
                    </div>
                </div>
            </div>
            
            <!-- City -->
            <div class="build-item-container" style="margin-bottom: 10px;">
                <div style="font-weight: bold; font-size: 12px; text-transform: uppercase;">City</div>
                <div class="build-item-row" style="display: flex; align-items: center;">
                    <button class="btn btn-default build-btn" id="city-build-btn" title="Build City" disabled><span class="glyphicon glyphicon-tower"></span></button>
                    <div class="build-cost-group" style="display: flex; margin-left: 10px; align-items: center;">
                        3<div class="circle build-circle ore-color"><img src="/images/icon-ore.svg"></div>
                        2<div class="circle build-circle wheat-color"><img src="/images/icon-wheat.svg"></div>
                    </div>
                </div>
            </div>
            
            <!-- Road -->
            <div class="build-item-container" style="margin-bottom: 10px;">
                <div style="font-weight: bold; font-size: 12px; text-transform: uppercase;">Road</div>
                <div class="build-item-row" style="display: flex; align-items: center;">
                    <button class="btn btn-default build-btn" id="road-build-btn" title="Build Road" disabled><span class="glyphicon glyphicon-road"></span></button>
                    <div class="build-cost-group" style="display: flex; margin-left: 10px; align-items: center;">
                        1<div class="circle build-circle brick-color"><img src="/images/icon-brick.svg"></div>
                        1<div class="circle build-circle wood-color"><img src="/images/icon-wood.svg"></div>
                    </div>
                </div>
            </div>
            
            <!-- Dev Card -->
            <div class="build-item-container">
                <div style="font-weight: bold; font-size: 12px; text-transform: uppercase;">Development Card</div>
                <div class="build-item-row" style="display: flex; align-items: center;">
                    <button class="btn btn-default build-btn" id="buy-dev-card-modal-open" data-toggle="modal" data-target="#buy-dev-card-modal" title="Buy Development Card" disabled><span class="glyphicon glyphicon-credit-card"></span></button>
                    <div class="build-cost-group" style="display: flex; margin-left: 10px; align-items: center;">
                        1<div class="circle build-circle ore-color"><img src="/images/icon-ore.svg"></div>
                        1<div class="circle build-circle wheat-color"><img src="/images/icon-wheat.svg"></div>
                        1<div class="circle build-circle sheep-color"><img src="/images/icon-sheep.svg"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ==========================================
     4. HIDDEN LEGACY UI (For JS compatibility)
     ========================================== -->
<div class="hidden">
    <div id="to-give-container">
        <#list ["brick", "wood", "ore", "wheat", "sheep"] as res><p class="to-give-list-item" res="${res}"><span class="trade-number"></span></p></#list>
    </div>
    <div id="to-get-container">
        <#list ["brick", "wood", "ore", "wheat", "sheep"] as res><p class="to-get-list-item" res="${res}"><span class="trade-number"></span></p></#list>
    </div>
</div>

<!-- ==========================================
     5. BOTTOM NAVBAR (Hand, Inventory, Dev Cards)
     ========================================== -->
<div class="navbar navbar-fixed-bottom above-board">
    <div class="col-xs-12 text-center">
        <div id="message-container-wrapper" class="text-center"><div id="message-container"></div></div>
        
        <div class="panel panel-default" style="display: inline-flex; justify-content: center; align-items: center; padding: 5px 20px; margin-bottom: 5px;">
            
            <!-- LEFT: Resource Hand -->
            <div class="hand-section">
                <ul class="nav navbar-nav" id="hand-resources">
                    <li class="navbar-btn"><div class="circle card-circle brick-color" title="Brick"><img src="/images/icon-brick.svg"></div><div class="card-number" id="brick-number">0</div></li>
                    <li class="navbar-btn"><div class="circle card-circle wood-color" title="Wood"><img src="/images/icon-wood.svg"></div><div class="card-number" id="wood-number">0</div></li>
                    <li class="navbar-btn"><div class="circle card-circle ore-color" title="Ore"><img src="/images/icon-ore.svg"></div><div class="card-number" id="ore-number">0</div></li>
                    <li class="navbar-btn"><div class="circle card-circle wheat-color" title="Wheat"><img src="/images/icon-wheat.svg"></div><div class="card-number" id="wheat-number">0</div></li>
                    <li class="navbar-btn"><div class="circle card-circle sheep-color" title="Sheep"><img src="/images/icon-sheep.svg"></div><div class="card-number" id="sheep-number">0</div></li>
                </ul>
            </div>

            <!-- CENTER: Building Inventory (Player Color Swatches) -->
            <div class="hand-section inventory-divider">
                <ul class="nav navbar-nav" id="hand-inventory">
                    <li class="navbar-btn" title="Roads Remaining">
                        <div class="circle card-circle player-building-swatch" style="border: 2px solid #333;"><span class="glyphicon glyphicon-road" style="color:white; line-height:32px; font-size:16px;"></span></div>
                        <div class="card-number" id="hand-roads-count">0</div>
                    </li>
                    <li class="navbar-btn" title="Settlements Remaining">
                        <div class="circle card-circle player-building-swatch" style="border: 2px solid #333;"><span class="glyphicon glyphicon-home" style="color:white; line-height:32px; font-size:16px;"></span></div>
                        <div class="card-number" id="hand-settlements-count">0</div>
                    </li>
                    <li class="navbar-btn" title="Cities Remaining">
                        <div class="circle card-circle player-building-swatch" style="border: 2px solid #333;"><span class="glyphicon glyphicon-tower" style="color:white; line-height:32px; font-size:16px;"></span></div>
                        <div class="card-number" id="hand-cities-count">0</div>
                    </li>
                </ul>
            </div>

            <!-- RIGHT: Dev Card Hand -->
            <div class="hand-section">
                <ul class="nav navbar-nav" id="hand-dev-cards">
                    <li class="navbar-btn"><div class="circle card-circle pointer" id="knight-btn" title="Knight"><img src="/images/icon-knight.svg"></div><div class="card-number" id="knight-number">0</div></li>
                    <li class="navbar-btn"><div class="circle card-circle pointer" id="year-of-plenty-btn" title="Year of Plenty"><img src="/images/icon-year-of-plenty.svg"></div><div class="card-number" id="year-of-plenty-number">0</div></li>
                    <li class="navbar-btn"><div class="circle card-circle pointer" id="monopoly-btn" title="Monopoly"><img src="/images/icon-monopoly.svg"></div><div class="card-number" id="monopoly-number">0</div></li>
                    <li class="navbar-btn"><div class="circle card-circle pointer" id="road-building-btn" title="Road Building"><img src="/images/icon-road-building.svg"></div><div class="card-number" id="road-building-number">0</div></li>
                    <li class="navbar-btn"><div class="circle card-circle" title="Victory Point"><img src="/images/icon-victory-point.svg"></div><div class="card-number" id="victory-point-number">0</div></li>
                </ul>
            </div>

        </div>
    </div>
    <div class="col-xs-1"></div>
</div>


<!-- ==========================================
     6. MODALS
     ========================================== -->
<#macro simpleModal id title body="" buttons="">
<div class="modal fade" id="${id}" tabindex="-1" role="dialog" data-backdrop="static">
    <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
            <div class="modal-header text-center"><h4 class="modal-title">${title}</h4></div>
            <#if body?has_content><div class="modal-body text-center">${body}</div></#if>
            <div class="modal-footer" style="text-align:center;">${buttons}</div>
        </div>
    </div>
</div>
</#macro>

<!-- Complex Modals -->
<div class="modal fade" id="buy-dev-card-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
            <div class="modal-header text-center">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">Buy Development Card</h4>
            </div>
            <div class="modal-body text-center">
                <p>Purchase a Development Card for:</p>
                <div class="build-cost-group" style="justify-content: center; font-size: 16px; margin-top: 15px;">
                    1<div class="circle build-circle ore-color"><img src="/images/icon-ore.svg"></div>
                    1<div class="circle build-circle wheat-color"><img src="/images/icon-wheat.svg"></div>
                    1<div class="circle build-circle sheep-color"><img src="/images/icon-sheep.svg"></div>
                </div>
            </div>
            <div class="modal-footer" style="text-align: center;">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="dev-card-buy-btn" data-dismiss="modal">Buy</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="discard-modal" tabindex="-1" role="dialog" data-backdrop="static">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header"><h4 class="modal-title text-danger"><span class="glyphicon glyphicon-warning-sign"></span> Discard Cards</h4></div>
            <div class="modal-body text-center">
                <p>A 7 was rolled! You must discard <strong><span id="num-resources-to-discard" class="text-danger"></span></strong> cards.</p>
                <div class="bank-resources-grid" style="margin-top: 20px;">
                    <#list ["brick", "wood", "ore", "wheat", "sheep"] as res>
                    <div class="discard-resource-container" style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <div class="circle discard-circle ${res}-color" style="margin:0;"><img src="/images/icon-${res}.svg"></div>
                        <small class="text-muted">Have: <span id="discard-hand-number-${res}"></span></small>
                        <div class="trade-stepper">
                            <button class="btn btn-xs btn-default discard-btn-step" data-res="${res}" data-action="minus"><span class="glyphicon glyphicon-minus"></span></button>
                            <span class="trade-val text-danger" id="discard-val-${res}">0</span>
                            <button class="btn btn-xs btn-default discard-btn-step" data-res="${res}" data-action="plus"><span class="glyphicon glyphicon-plus"></span></button>
                        </div>
                    </div>
                    </#list>
                </div>
            </div>
            <div class="modal-footer"><button type="button" class="btn btn-danger btn-block" id="discard-btn" disabled="disabled">Confirm</button></div>
        </div>
    </div>
</div>

<div class="modal fade" id="year-of-plenty-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title text-success"><span class="glyphicon glyphicon-gift"></span> Year of Plenty</h4>
            </div>
            <div class="modal-body text-center">
                <p>Choose any two resources to add to your hand.</p>
                <div class="bank-resources-grid" style="margin-top: 20px;">
                    <#list ["brick", "wood", "ore", "wheat", "sheep"] as res>
                    <div class="yop-resource-container" style="display:flex; flex-direction:column; align-items:center; gap:8px; margin:0;">
                        <div class="circle yop-circle ${res}-color" style="margin:0;"><img src="/images/icon-${res}.svg"></div>
                        <div class="trade-stepper">
                            <button class="btn btn-xs btn-default yop-btn-step" data-res="${res}" data-action="minus"><span class="glyphicon glyphicon-minus"></span></button>
                            <span class="trade-val text-success" id="yop-val-${res}">0</span>
                            <button class="btn btn-xs btn-default yop-btn-step" data-res="${res}" data-action="plus"><span class="glyphicon glyphicon-plus"></span></button>
                        </div>
                    </div>
                    </#list>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-success" id="play-yop-btn" disabled="disabled">Play Card</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="monopoly-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title text-primary"><span class="glyphicon glyphicon-magnet"></span> Monopoly</h4>
            </div>
            <div class="modal-body text-center">
                <p>Choose a resource. All players must give you all their cards of that type.</p>
                <div class="bank-resources-grid" style="margin-top: 15px;">
                    <#list ["brick", "wood", "ore", "wheat", "sheep"] as res>
                    <div class="circle monopoly-circle-container" res="${res}" style="margin:0;">
                        <div class="circle monopoly-circle ${res}-color pointer"><img src="/images/icon-${res}.svg"></div>
                    </div>
                    </#list>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="play-monopoly-btn" disabled>Play</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="take-card-modal" tabindex="-1" role="dialog" data-backdrop="static">
    <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
            <div class="modal-header"><h4 class="modal-title"><span class="glyphicon glyphicon-user"></span> Steal Resource</h4></div>
            <div class="modal-body text-center">
                <p>Choose a player to steal from:</p>
                <div class="btn-group-vertical" id="take-card-players-list" data-toggle="buttons" style="width:100%;"></div>
            </div>
            <div class="modal-footer"><button type="button" class="btn btn-primary btn-block" id="take-card-btn" disabled="disabled">Steal</button></div>
        </div>
    </div>
</div>

<div class="modal fade" id="welcome-modal" tabindex="-1" role="dialog" data-backdrop="static">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header text-center"><h4 class="modal-title">Welcome to Catan</h4></div>
            <div class="modal-body">
                <div id="dynamic-rates-welcome-message" class="alert alert-info hidden"></div>
            </div>
            <div class="modal-footer" style="text-align:center;">
                <button type="button" id="welcome-start-btn" class="btn btn-success btn-lg" data-dismiss="modal">Ready</button>
            </div>
        </div>
    </div>
</div>

<!-- Trade Modals -->
<div class="modal fade" id="review-trade-modal" tabindex="-1" role="dialog" data-backdrop="static">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header"><h4 class="modal-title">Review Trade Proposal</h4></div>
            <div class="modal-body">
                <div class="row text-center">
                    <div class="col-xs-6">
                        <h5 class="text-danger">Give</h5>
                        <div id="review-to-give-container" class="bank-resources-grid">
                            <#list ["brick", "wood", "ore", "wheat", "sheep"] as res><p class="review-to-give-list-item hidden" res="${res}"><strong class="review-trade-number"></strong><span class="inline-trade-icon circle ${res}-color"><img src="/images/icon-${res}.svg"></span></p></#list>
                        </div>
                    </div>
                    <div class="col-xs-6" style="border-left: 1px solid #eee;">
                        <h5 class="text-success">Receive</h5>
                        <div id="review-to-get-container" class="bank-resources-grid">
                            <#list ["brick", "wood", "ore", "wheat", "sheep"] as res><p class="review-to-get-list-item hidden" res="${res}"><strong class="review-trade-number"></strong><span class="inline-trade-icon circle ${res}-color"><img src="/images/icon-${res}.svg"></span></p></#list>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" id="review-trade-reject-btn" class="btn btn-danger" data-dismiss="modal">Decline</button>
                <button type="button" id="review-trade-accept-btn" class="btn btn-success" data-dismiss="modal">Accept</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="trade-responses-modal" tabindex="-1" role="dialog" data-backdrop="static">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header"><h4 class="modal-title">Trade Responses</h4></div>
            <div class="modal-body">
                <div class="row text-center" style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                    <div class="col-xs-6">
                        <h5 class="text-danger">Give</h5>
                        <div id="trade-responses-to-give-container" class="bank-resources-grid">
                            <#list ["brick", "wood", "ore", "wheat", "sheep"] as res><p class="trade-responses-to-give-list-item hidden" res="${res}"><strong class="trade-responses-trade-number"></strong><span class="inline-trade-icon circle ${res}-color"><img src="/images/icon-${res}.svg"></span></p></#list>
                        </div>
                    </div>
                    <div class="col-xs-6" style="border-left: 1px solid #eee;">
                        <h5 class="text-success">Receive</h5>
                        <div id="trade-responses-to-get-container" class="bank-resources-grid">
                            <#list ["brick", "wood", "ore", "wheat", "sheep"] as res><p class="trade-responses-to-get-list-item hidden" res="${res}"><strong class="trade-responses-trade-number"></strong><span class="inline-trade-icon circle ${res}-color"><img src="/images/icon-${res}.svg"></span></p></#list>
                        </div>
                    </div>
                </div>
                <h5 class="text-center">Player Responses</h5>
                <div id="trade-responses-players-container" class="list-group"></div>
            </div>
            <div class="modal-footer" style="text-align: center;">
                <button type="button" id="trade-responses-cancel-trade-btn" class="btn btn-danger btn-block">Cancel Trade</button>
            </div>
        </div>
    </div>
</div>

<!-- Information Modals -->
<div class="modal fade" id="stats-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button><h4 class="modal-title">Roll Distribution</h4></div>
            <div class="modal-body text-center"><div class="ct-chart ct-perfect-fourth"></div></div>
        </div>
    </div>
</div>

<div class="modal fade" id="message-history-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button><h4 class="modal-title">Message History</h4></div>
            <div class="modal-body text-center"><ul id="message-history-list" class="list-group" style="text-align:left;"></ul></div>
        </div>
    </div>
</div>

<div class="modal fade" id="winner-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
            <div class="modal-header text-center">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title"><span id="winnerLabel"></span></h4>
            </div>
            <div class="modal-body text-center">
                <p>The game is over!</p>
            </div>
            <div class="modal-footer" style="text-align:center;">
                <button type="button" class="btn btn-default" data-dismiss="modal">View Board</button>
                <button type="button" id="return-home-btn" class="btn btn-success">Return Home</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="disconnected-user-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
            <div class="modal-header text-center">
                <h4 class="modal-title">Player Offline</h4>
            </div>
            <div class="modal-body text-center">
                <p><strong id="disconnected-user-name"></strong> has disconnected.</p>
                <p class="text-muted">The game will continue. If it is their turn, it will be skipped.</p>
            </div>
            <div class="modal-footer" style="text-align:center;">
                <button type="button" class="btn btn-success btn-block" data-dismiss="modal">Continue Playing</button>
                <button type="button" class="btn btn-link leave-game-btn" style="color: #999;">Leave Game</button>
            </div>
        </div>
    </div>
</div>

<!-- Macro simple modals -->
<@simpleModal id="roll-dice-modal" title="It's your turn!" buttons='<button type="button" id="roll-dice-btn" class="btn btn-success btn-block" data-dismiss="modal">Roll Dice</button>' />
<@simpleModal id="knight-or-dice-modal" title="Start Turn" buttons='<button type="button" id="knight-dice-play-knight-btn" class="btn btn-primary" data-dismiss="modal">Play Knight</button> <button type="button" id="knight-dice-roll-dice-btn" class="btn btn-success" data-dismiss="modal">Roll Dice</button>' />
<@simpleModal id="exit-game-modal" title="Exit Game" body="<p>Are you sure you want to leave?</p>" buttons='<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button> <button type="button" class="leave-game-btn btn btn-danger" data-dismiss="modal">Exit Game</button>' />
<@simpleModal id="full-game-modal" title="Game Full" body="<p>Sorry, this game is full.</p>" buttons='<button type="button" id="accept-full-game-btn" class="btn btn-success btn-block" data-dismiss="modal">Find Another Game</button>' />
<@simpleModal id="duplicate-tab-modal" title="Multiple Tabs Open" body="<p>You already have an active game open in another tab.</p>" buttons='' />
<@simpleModal id="user-exited-modal" title="Game Over" body='<p><strong id="user-exited-name"></strong> left the game.</p>' buttons='<button type="button" class="btn btn-danger btn-block" data-dismiss="modal" id="user-exited-go-home-btn">Return Home</button>' />

<script src="/js/player.js?v=1"></script>
<script src="/js/tile.js?v=1"></script>
<script src="/js/intersection.js?v=1"></script>
<script src="/js/path.js?v=1"></script>
<script src="/js/board.js?v=1"></script>
<script src="/js/websocket.js?v=1"></script>
<script src="/js/chartist.min.js?v=1"></script>
<script src="/js/moment.min.js?v=1"></script>
<script src="/js/main.js?v=1"></script>

</#assign>

<#include "main.ftl">
