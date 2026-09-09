import { listenToEvent } from '../../utils/stageHelpers.js';
import ScrollBox from '../../utils/ScrollBox.js';
import TrackerCard from './TrackerCard.js';

export default class StageDiscoveryTracker {

    constructor(scene, options = {}) {

        this.scene = scene;
        this.stageProgress = options.stageProgress ?? null;
        this.objectivesManager = options.objectivesManager ?? null;
        this.objectiveFlow = options.objectiveFlow ?? null;

        this.scrollBox = null;
        this.objectives = [];

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 300;
        this.height = options.height ?? 200;

        this.depth =
            this.scene.depths?.topTabs ?? 10;
        this.container =
            this.scene.add.container(0, 0);
        this.container.setDepth(this.depth);

        this.elements = [];

        this.removeProgressListener =
            listenToEvent(
                this.stageProgress,
                'updated',
                event => {
                        // unlock()
                    if (event.type === 'item-unlock' ||
                        // set()
                        event.type === 'item-amount') {
                        this.handleProgressUpdate(event);
                    }
                }
            );

        this.removeObjectiveListener =
            listenToEvent(
                this.objectivesManager,
                'updated',
                event => {
                        // unlockObjective()
                    if (event.type === 'objective-unlock' ||
                        // initializeObjectiveTracking(), setObjectiveTracked()
                        event.type === 'objective-track'
                    ) {
                        this.handleProgressUpdate(event);
                    }
                }
            );

        this.removeFlowListener =
            listenToEvent(
                this.objectiveFlow,
                'updated',
                event => {
                    // completeObjective() 
                    // FLOW: this.objectivesManager.processObjectiveUnlocks(id);
                    if (event.type === 'flow-complete') {
                        this.refresh();
                    }
                }
            );

        this.create();
        this.refresh();
    }

    create() {

        // Card padding 
        /*this.background =
            this.addElement(
            this.scene.add.rectangle(
                this.x,
                this.y,
                this.width,
                this.height,
                0x000055
            )
            .setOrigin(0)
        );*/

        // Gradient
        const screenY = this.y;
        const screenH = this.height;
        
        this.vignette = this.addElement(
            this.scene.add.graphics()
        );
        
        const fadeSize = 28;
        const steps = 12;
        
        // Top fade
        for (let i = 0; i < steps; i++) {
        
            const progress = i / steps;
            const alpha = 0.35 * (1 - progress);
        
            this.vignette.fillStyle(0x999999, alpha);
        
            this.vignette.fillRect(
                this.x,
                screenY + i * (fadeSize / steps),
                this.width,
                fadeSize / steps
            );
        }
        
        // Bottom fade
        for (let i = 0; i < steps; i++) {
        
            const progress = i / steps;
            const alpha = 0.35 * progress;
        
            this.vignette.fillStyle(0x999999, alpha);
        
            this.vignette.fillRect(
                this.x,
                screenY + screenH - fadeSize + i * (fadeSize / steps),
                this.width,
                fadeSize / steps
            );
        }

        this.scrollBox =
            new ScrollBox(
                this.scene,
                {
                    x: this.x,
                    y: this.y + 28,
                    width: this.width,
                    height: this.height - 28*2,
                    depth: this.depth
                }
            );
            
        this.addElement(
            this.scrollBox.content
        );
    }

    syncObjectives() {
        const currentObjectives =
            this.objectivesManager
                .getTrackedObjectives({
                    newestFirst: true
                });
    
        // If there are no objectives, use the existing empty-state logic.
        if (currentObjectives.length === 0) {
            this.refresh();
            return;
        }
    
        // Remove empty state if necessary.
        this.emptyText?.destroy();
        this.emptyText = null;
    
        const cardMap = new Map(
            this.objectives.map(
                card => [
                    card.objective.id,
                    card
                ]
            )
        );
    
        const newCards = [];
    
        currentObjectives.forEach(
            objective => {
    
                let card =
                    cardMap.get(objective.id);
    
                // New objective -> create only this card.
                if (!card) {
                    card =
                        new TrackerCard(
                            this.scene,
                            {
                                x: this.x + 25,
                                y: 0,
                                width: this.width - 50,
    
                                objective,
    
                                objectivesManager:
                                    this.objectivesManager,
    
                                unlocksItems:
                                    this.objectivesManager
                                        .objectiveUnlockList(
                                            objective
                                        ),
    
                                objectiveFlow:
                                    this.objectiveFlow,
                                    
                                scrollBox:
                                    this.scrollBox
                            }
                        );
    
                    this.scrollBox.content.add(
                        card.container
                    );
                }
    
                // Update existing card's contents.
                card.objective = objective;
                card.update();
    
                newCards.push(card);
            }
        );
    
        // Cards no longer tracked -> destroy only those cards.
        this.objectives.forEach(
            card => {
    
                const stillTracked =
                    newCards.includes(card);
    
                if (!stillTracked) {
                    card.destroy?.();
                }
            }
        );
    
        this.objectives = newCards;
    
        // Reposition existing containers.
        let y = 10;
    
        this.objectives.forEach(
            card => {
    
                card.container.y = y;
    
                y += card.height + 10;
            }
        );
    
        this.scrollBox.setContentHeight(
            y + 10
        );
    }
    
    handleProgressUpdate(event) {
        const currentObjectives =
            this.objectivesManager
                .getTrackedObjectives({
                    newestFirst: true
                });
    
        const currentIds =
            currentObjectives.map(
                objective => objective.id
            );
    
        const displayedIds =
            this.objectives.map(
                card => card.objective.id
            );
    
        const sameObjectives =
            currentIds.length === displayedIds.length &&
            currentIds.every(
                (id, index) =>
                    id === displayedIds[index]
            );
    
        if (sameObjectives) {
    
            // Nothing structural changed.
            // Just update the existing cards.
            this.objectives.forEach(
                card => card.update()
            );
    
            return;
        }
    
        // Structure/order changed.
        // Synchronize instead of rebuilding everything.
        this.syncObjectives();
    }

    refresh() {
        const objectives =
            this.objectivesManager
                .getTrackedObjectives({
                    newestFirst: true
                });
    
        this.clearObjectives();

        if (objectives.length === 0) {
            this.showEmptyState();
            return;
        }
    
        let y = 10;
    
        objectives.forEach(
            objective => {
    
                const card =
                    new TrackerCard(
                        this.scene,
                        {
                            x: this.x + 25,
                            y,
                            width: this.width - 50,
    
                            objective,
    
                            objectivesManager: this.objectivesManager,
                            
                            unlocksItems: this.objectivesManager.objectiveUnlockList(objective),
                            
                            objectiveFlow: this.objectiveFlow,
                            
                            scrollBox: this.scrollBox
                        }
                    );
    
                this.scrollBox.content.add(
                    card.container
                );
    
                this.objectives.push(card);
    
                y +=
                    card.height +
                    10;
            }
        );
    
        this.scrollBox.setContentHeight(
            y + 10
        );
    }
    
    clearObjectives() {
        this.objectives.forEach(
            card => card.destroy?.()
        );
    
        this.objectives = [];
    
        this.emptyText?.destroy();
        this.emptyText = null;
    
        this.scrollBox.scrollToTop();
    }
    
    showEmptyState() {
        this.emptyText =
            addText(
                this.scene,
                this.x + 10,
                this.y + 10,
                'No objectives are currently being tracked.\n\n' +
                'Visit DISCOVER tab to track objectives.',
                {
                    fontSize: '16px',
                    color: '#ffffff',
                    wordWrap: {
                        width: this.width - 20
                    },
                    align: 'center'
                }
            );
    
        this.scrollBox.content.add(
            this.emptyText
        );
    
        this.scrollBox.setContentHeight(
            this.emptyText.height + 20
        );
    }

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

    // For tabs (StageUI)
    setVisible(visible) {
        this.container.setVisible(visible);
    
        if (this.scrollBox?.scrollZone) {
            this.scrollBox.scrollZone.input.enabled =
                visible;
        }
    }

    destroy() {
        this.removeProgressListener?.();
        this.removeObjectiveListener?.();
        this.removeFlowListener?.();
    
        this.objectives.forEach(
            card => card.destroy?.()
        );
    
        this.objectives = [];
    
        this.scrollBox?.destroy();
    
        this.container?.destroy();
    
        this.elements = [];
    
        this.background = null;
        this.vignette = null;
        this.scrollBox = null;
        this.emptyText = null;
        this.container = null;
    }
}