import StageNavigation from './StageNavigation.js';
import StageViewport from './StageViewport.js';
import MessageStatus from './MessageStatus.js';
import StageInventory from './StageInventory.js';
import { getItemMax, listenToEvent } from '../../utils/stageHelpers.js';
import StageDiscoveryTracker from './StageDiscoveryTracker.js';
import StageSubNavigation from './StageSubNavigation.js';
import * as df from '../../data/dataFunctions.js';

export default class StageUI {

    constructor(scene, options = {}) {

        this.scene = scene;
        this.autoGather = this.scene.autoGather;
        this.stageProgress = this.scene.stageProgress;
        this.conversationManager = this.scene.conversationManager;
        this.objectivesManager = this.scene.objectivesManager;
        this.objectiveFlow = this.scene.objectiveFlow;

        this.width =
            options.width ??
            scene.scale.width;

        this.height =
            options.height ??
            scene.scale.height;

        // Where card content starts
        // Lines up with this.tabHeader_H
        this.contentMiddleY = this.height / 3;

        // Game header
        this.margin = 10;
        this.gameHeader_X = 10;
        this.gameHeader_Y = 0;
        this.gameHeader_W = this.width - this.margin * 2; // margin = 10
        this.gameHeader_H = 150;

//// WIP ////
        // Top tab area
        this.tabHeader_X = 
            this.margin;
        this.tabHeader_Y = 
            this.gameHeader_H;
        this.tabHeader_W = this.width - this.margin * 2;
        this.tabHeader_H = this.contentMiddleY - this.gameHeader_H - 5; // 230 - 5 (spacing)

        // Under headers starting Y
        this.belowHeaderY = this.gameHeader_H + this.tabHeader_H + 10;

        this.createUI();
    }

    // Create UI
    createUI() {
        // Set current stage
        this.stageTitle = this.stageProgress.setStage('creation');

        // Header
        this.createHeader();

        // Listen for changes
        this.removeProgressListener =
            listenToEvent(
                this.stageProgress,
                'updated',
                update => {
                    this.updateAffectedCards(update);
                }
            );

        this.removeObjectiveListener =
            listenToEvent(
                this.objectivesManager,
                'updated',
                update => {
                    this.updateAffectedCards(update);
                }
            );

        // For UI tab chsnges
        this.removeTabListener =
            listenToEvent(
                this.scene.events,
                'stage-tab-changed',
                id => {
                    this.changeTab(id);
                }
            );
            
        this.removeSubTabListener =
            listenToEvent(
                this.scene.events,
                'stage-sub-tab-changed',
                id => {
                    this.changeSubTab(id);
                }
            );

        // Inventory
        /*this.inventory =
            new StageInventory(
                this.scene,
                this.stageProgress,
                {
                    x: this.tabHeader_X + this.tabHeader_W + 1,
                    y: this.tabHeader_Y,
                    width: this.tabHeader_W,
                    height: this.tabHeader_H + this.tabHeader_H + 1,
                    titleHeight: this.tabHeader_H
                }
            );*/

        // Messages
        /*this.messageStatus =
            new MessageStatus(
                this.scene,
                this.scene.gameTimer,
                this.scene.gameData,
                {
                    x: this.tabHeader_X,
                    y: this.belowHeaderY,
                    width: this.tabHeader_W,
                    height: this.tabHeader_H - this.tabHeader_H + 1,
                    fontSize: '18px',
                    fontColor: '#33FFE4'
                }
            );*/

        this.messageStatus?.addMessageDelayed(
            'Welcome to eSim: Creation Stage!',
            2000
        );

        // Insert messages from conversations
        this.removeConversationListener =
            listenToEvent(
                this.conversationManager.events,
                'message',
                message => {
                    this.messageStatus.addMessage(
                        `${message.speaker}: ${message.text}`
                    );
                }
            );

        // Viewport
        const margin = 10;
        const navigationHeight = 60;
        const navigationY =
            this.height -
            navigationHeight -
            margin;

        const viewportBottom =
            navigationY - 10;
        const viewportHeight =
            viewportBottom - this.contentMiddleY;
        
        // Header for cards
        //this.createCardHeader(margin, this.contentMiddleY);

        // Initial tab
        this.currentTab = 'gather'; // gather
        // Initial sub Tab
        this.currentSubTab = this.getDefaultSubTab();

        this.viewport =
            new StageViewport(
                this.scene,
                {
                    x: margin,
                    y: this.contentMiddleY,
                    width:
                        this.width -
                        margin * 2 - 5,
                    height:
                        viewportHeight,
                    tab: this.currentTab,
                    objectivesManager: this.objectivesManager
                }
            );

        // Sub tabs class
        const subNavigationY = navigationY - navigationHeight;
        this.subNavigation =
            new StageSubNavigation(
                this.scene,
                {
                    x: margin,
                    y: subNavigationY,
                    width: this.width - margin * 2,
                    height: 50,
                    tabs: this.getSubTabs() ?? []
                }
            );
        // Initial sub tab
        this.subNavigation.setActiveTab(this.currentSubTab);

        // Navigation
        this.navigation =
            new StageNavigation(
                this.scene,
                {
                    x: margin,
                    y: navigationY,
                    width:
                        this.width -
                        margin * 2,
                    height:
                        navigationHeight,
                    tabs: this.getTabData()
                }
            );
        // Initial tab
        this.navigation.setActiveTab(this.currentTab);

        // DISCOVERY TRACKER
        this.discoveryTracker =
            new StageDiscoveryTracker(this.scene, {
                    x: this.tabHeader_W + 1 + this.width / 3 - 8,
                    y: this.tabHeader_Y, // 10 + this.tabHeader_H + 1,
                    width: this.width / 3,
                    height: this.tabHeader_H - this.belowHeaderY - 11,
                    titleHeight: this.tabHeader_H,
                    stageProgress: this.stageProgress,
                    objectivesManager: this.objectivesManager,
                    objectiveFlow: this.objectiveFlow
                }
            );

        this.refreshCurrentTab();

    }

    // Header
    createHeader() {
        // Game header
        this.scene.add.rectangle(
            this.gameHeader_X,
            this.gameHeader_Y,
            this.gameHeader_W,
            this.gameHeader_H,
            0x000000
        )
        .setOrigin(0);

        // Tab header
        this.scene.add.rectangle(
            this.tabHeader_X,
            this.tabHeader_Y,
            this.tabHeader_W,
            this.tabHeader_H,
            0x555555
        )
        .setOrigin(0);

        this.stageTitleText = addText(this.scene,
            this.width / 2,
            this.gameHeader_H / 2,
            this.stageTitle, // setStage() adds title
            {
                fontSize: '48px',
                color: '#ffffff'
            }
        ).setOrigin(0.5, 0.5);
    }

    createCardHeader(startX, startY) {
        const padding = 10;
        this.scene.add.rectangle(
            startX + 6,
            startY - 80,
            this.width - padding * 2 - 6,
            80 - padding,
            0x444444
        )
        .setOrigin(0);
    }

    // Dynamic viewport
    updateViewportLayout() {
        const viewportY =
            this.contentMiddleY;
    
        const viewportBottom =
            this.hasSubNavigation()
                ? this.subNavigation.y - 10
                : this.navigation.y - 10;
    
        const height =
            viewportBottom - viewportY;
    
        this.viewport.setBounds(
            viewportY,
            height
        );
    }
    
    // Helper ^
    hasSubNavigation() {
        return this.subNavigation?.container.visible === true;
    }

//--------------------------------
// Listener updates
//--------------------------------
    updateAffectedCards(update) {
        const updateTypes = [
            // stageProgress: unlock, lock
            'item-unlock',
            
            // stageProgress: set()
            'item-amount',
            
            // stageProgress: setGatherLevel
            'gather-upgrade',
            
            // stageProgress: setAutoGatherLevel
            'gather-auto-upgrade',

            // objectivesManager: unlockObjective
            'objective-unlock',
            
            // objectivesManager: completeObjective
            'objective-complete',
            
            // objectivesManager: initializeObjectiveTracking(), setObjectiveTracked()
            // StageCard: createTrackingUI
            'objective-track'
 
        ];
    
        if (updateTypes.includes(update.type)) {
            this.updateNavigation();
            this.updateSubNavigation();
            this.updateCurrentTab();
            return;
        }
    
        const refreshTypes = [
            // 'stage-change',
            // 'change-card-definition',
        ];
    
        if (refreshTypes.includes(update.type)) {
            this.refreshCurrentTab();
        }
    }

    // Change tab
    changeTab(id) {

        if (this.currentTab === id) {
            return;
        }

        this.currentTab = id;
        
        // Reset to the first sub-tab for this main tab
        this.currentSubTab =
            this.getDefaultSubTab();
        
        // Clear sub tabs
        this.subNavigation.setTabs(
            this.getSubTabs() ?? []
        );
        
        this.subNavigation.setActiveTab(
            this.currentSubTab
        );
        
        // WIP
        this.updateViewportLayout();

        // Changing tabs DOES rebuild the cards.
        this.refreshCurrentTab();
    }

    // Sub Tabs
    getSubTabs() {
        return df.getSubTabData(
            this.currentTab,
            this.stageProgress,
            this.autoGather,
            this.objectivesManager
        );
    }
    
    getDefaultSubTab() {
        const tabs = this.getSubTabs();
        return tabs?.find(
            tab => tab.availability !== 'locked'
        )?.id ?? null;
    }
    
    changeSubTab(id) {
        if (this.currentSubTab === id) {
            return;
        }
    
        this.currentSubTab = id;

        this.refreshCurrentTab();
    }

//--------------------------------
// CARDS
//--------------------------------

    // Get cards (for tabs)
    refreshCurrentTab() {
        const cardData =
            df.getCurrentTabCardData(
                this.currentTab,
                this.currentSubTab,
                this.stageProgress,
                this.autoGather,
                this.objectivesManager
            );
    
        this.viewport.showCards(cardData);
    }

    updateCurrentTab() {
        const cardData =
            df.getCurrentTabCardData(
                this.currentTab,
                this.currentSubTab,
                this.stageProgress,
                this.autoGather,
                this.objectivesManager
            );
    
        this.viewport.syncCards(cardData);
    }

    getTabData() {
        const tabs = [
            { id: 'gather', title: 'GATHER' },
            { id: 'create', title: 'CREATE' },
            { id: 'discover', title: 'DISCOVER' }
        ];
    
        return tabs.map(tab => ({
            ...tab,
    
            availability:
                df.getTabAvailability(
                    tab.id,
                    this.stageProgress,
                    this.autoGather,
                    this.objectivesManager
                )
        }));
    }

    updateNavigation() {
        this.navigation.setTabs(
            this.getTabData()
        );
    }
    
    updateSubNavigation() {
        this.subNavigation.setTabs(
            this.getSubTabs()
        );
    }

    // Destroy
    destroy() {
        this.removeProgressListener?.();
        this.removeObjectiveListener?.();
        this.removeTabListener?.();
        this.removeSubTabListener?.();
        this.removeConversationListener?.();

        this.inventory?.destroy();
        this.viewport?.destroy();
        this.navigation?.destroy();
        this.messageStatus?.destroy();

        this.stageProgress = null;
        this.autoGather = null;
        this.conversationManager = null;
    }
}