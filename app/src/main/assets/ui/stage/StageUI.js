import StageNavigation from './StageNavigation.js';
import StageViewport from './StageViewport.js';
import MessageStatus from './MessageStatus.js';
import StageInventory from './StageInventory.js';
import { getItemMax, listenToEvent } from '../../utils/stageHelpers.js';
import StageDiscoveryTracker from './StageDiscoveryTracker.js';
import StageSubNavigation from './StageSubNavigation.js';
import * as df from '../../data/dataFunctions.js';

import StageObjectives from './StageObjectives.js';

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
        this.gameHeader_H = 100;

//// WIP ////
        // Top tab area
        this.tabHeader_X = 
            this.margin;
        this.tabHeader_Y = 
            this.gameHeader_H;
        this.tabHeader_W = this.width - this.margin * 2;
        this.tabHeader_H = this.contentMiddleY - this.gameHeader_H - 5; // 230 - 5 (spacing)

        this.topTabs_H = 60; // Top tabs navigation
        
        // Tab content area this.topTabsContent
        this.topTabsContent_X = 0;
        this.topTabsContent_Y = this.tabHeader_Y + this.topTabs_H + 1;
        this.topTabsContent_W = this.width;
        this.topTabsContent_H = this.tabHeader_H - this.topTabs_H;

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
        // Top tabs effect
        this.createTopTabsContentBackground();

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

        this.createTopTabs();

        // Inventory
        this.inventory =
            new StageInventory(
                this.scene,
                this.stageProgress,
                {
                    x: this.topTabsContent_X,
                    y: this.topTabsContent_Y,
                    width: this.topTabsContent_W,
                    height: this.topTabsContent_H
                }
            );

        // Messages
        /*this.messageStatus =
            new MessageStatus(
                this.scene,
                this.scene.gameTimer,
                this.scene.gameData,
                {
                    x: this.topTabsContent_X,
                    y: this.topTabsContent_Y,
                    width: this.topTabsContent_W,
                    height: this.topTabsContent_H,
                    fontSize: '18px',
                    fontColor: '#33FFE4'
                }
            );*/

        /*this.messageStatus?.addMessageDelayed(
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
            );*/

            this.removeTopTabListener =
                listenToEvent(
                    this.scene.events,
                    'stage-top-tab-changed',
                    id => {
                        this.changeTopTab(id);
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
        /*this.discoveryTracker =
            new StageDiscoveryTracker(this.scene, {
                x: this.topTabsContent_X,
                y: this.topTabsContent_Y,
                width: this.topTabsContent_W,
                height: this.topTabsContent_H,
                stageProgress: this.stageProgress,
                objectivesManager: this.objectivesManager,
                objectiveFlow: this.objectiveFlow
            });*/
//// WIP
        // TOP TABS ONLY
        this.stageObjectives = 
            new StageObjectives(this.scene, {
                x: this.topTabsContent_X,
                y: this.topTabsContent_Y,
                width: this.topTabsContent_W,
                height: this.topTabsContent_H,
                objectivesManager: this.objectivesManager,
                objectiveFlow: this.objectiveFlow,
                isPointerVisible: pointer => this.isPointerVisible(pointer),
            });

        this.updateTopTabContent();
        this.refreshCurrentTab();

    }

    // Header
    createHeader() {
        // Game header (PLACEHOLDER)
        this.gameHeaderBG = this.scene.add.rectangle(
            this.gameHeader_X,
            this.gameHeader_Y,
            this.gameHeader_W,
            this.gameHeader_H,
            0xffffff
        )
        .setVisible(false)
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

        // Tab header (PLACEHOLDER)
        this.tabHeaderBG = this.scene.add.rectangle(
            this.tabHeader_X,
            this.tabHeader_Y,
            this.tabHeader_W,
            this.tabHeader_H,
            0xffffff
        )
        .setVisible(false)
        .setOrigin(0);
        //this.scene.children.sendToBack(tabHeaderBG);
        //this.scene.children.bringToTop(tabHeaderBG);

        // Tab content area (PLACEHOLDER)
        this.topTabsContent = this.scene.add.rectangle(
            this.topTabsContent_X,
            this.topTabsContent_Y,
            this.topTabsContent_W,
            this.topTabsContent_H,
            0xffffff
        )
        .setVisible(false)
        .setOrigin(0);
    }

    createTopTabsContentBackground() {
        const screenY = this.topTabsContent_Y;
        const screenH = this.topTabsContent_H;
    
        this.topTabsContentGradient =
            this.scene.add.graphics();
    
        const fadeSize = 28;
        const steps = 12;
    
        // Top fade
        for (let i = 0; i < steps; i++) {
    
            const progress = i / steps;
            const alpha = 0.35 * (1 - progress);
    
            this.topTabsContentGradient.fillStyle(
                0x999999,
                alpha
            );
    
            this.topTabsContentGradient.fillRect(
                this.topTabsContent_X,
                screenY + i * (fadeSize / steps),
                this.topTabsContent_W,
                fadeSize / steps
            );
        }
    
        // Bottom fade
        for (let i = 0; i < steps; i++) {
    
            const progress = i / steps;
            const alpha = 0.35 * progress;
    
            this.topTabsContentGradient.fillStyle(
                0x999999,
                alpha
            );
    
            this.topTabsContentGradient.fillRect(
                this.topTabsContent_X,
                screenY +
                    screenH -
                    fadeSize +
                    i * (fadeSize / steps),
                this.topTabsContent_W,
                fadeSize / steps
            );
        }
    }

    createTopTabs() {
        const topTabs_X = this.margin;
        const topTabs_Y = this.tabHeader_Y;
        const topTabs_W = this.width - this.margin * 2;
    
        const tabs = [
            {
                id: 'objectives',
                title: 'OBJECTIVES'
            },
            {
                id: 'inventory',
                title: 'INVENTORY'
            }
        ];
    
        this.topTabs = [];
    
        const tabWidth = topTabs_W / tabs.length;
    
        tabs.forEach((tab, index) => {
    
            const x = topTabs_X + index * tabWidth;
    
            // Tab background
            const background =
                this.scene.add.rectangle(
                    x,
                    topTabs_Y,
                    tabWidth - 2,
                    this.topTabs_H,
                    0x222222
                )
                .setOrigin(0);
    
            // Selected highlight
            const highlight =
                this.scene.add.rectangle(
                    x,
                    topTabs_Y + this.topTabs_H - 5,
                    tabWidth - 2,
                    5,
                    0x33FFE4
                )
                .setOrigin(0);
    
            // Text
            const text =
                addText(
                    this.scene,
                    x + (tabWidth - 2) / 2,
                    topTabs_Y + this.topTabs_H / 2,
                    tab.title,
                    {
                        fontSize: '22px',
                        color: '#aaaaaa'
                    }
                )
                .setOrigin(0.5);
    
            background.setInteractive();
    
            background.on('pointerdown', () => {
    
                this.scene.events.emit(
                    'stage-top-tab-changed',
                    tab.id
                );
    
            });
    
            this.topTabs.push({
                id: tab.id,
                background,
                highlight,
                text
            });
        });
    
        this.currentTopTab = 'objectives';
    
        this.updateTopTabs();
    }
    
    updateTopTabs() {
        this.topTabs.forEach(tab => {
    
            const selected =
                tab.id === this.currentTopTab;
    
            tab.background.setFillStyle(
                selected
                    ? 0x333333
                    : 0x222222
            );
    
            tab.highlight.setVisible(selected);
    
            tab.text.setColor(
                selected
                    ? '#33FFE4'
                    : '#aaaaaa'
            );
        });
    }
    
    changeTopTab(id) {
        if (this.currentTopTab === id) {
            return;
        }
    
        this.currentTopTab = id;
    
        this.updateTopTabs();
        this.updateTopTabContent();
    }

    updateTopTabContent() {
        this.stageObjectives?.setVisible(
            this.currentTopTab === 'objectives'
        );
    
        this.inventory?.setVisible(
            this.currentTopTab === 'inventory'
        );
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

    isPointerVisible(pointer) {
        return this.viewport?.scrollBox
            ?.isPointerInside(pointer) ?? true;
    }

    // Destroy
    destroy() {
        this.removeProgressListener?.();
        this.removeObjectiveListener?.();
        this.removeTabListener?.();
        this.removeSubTabListener?.();
        this.removeConversationListener?.();
        this.removeTopTabListener?.();

        this.inventory?.destroy();
        this.viewport?.destroy();
        this.navigation?.destroy();
        this.messageStatus?.destroy();

        this.stageProgress = null;
        this.autoGather = null;
        this.conversationManager = null;
    }
}