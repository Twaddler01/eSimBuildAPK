import { listenToEvent } from '../../utils/stageHelpers.js';
import * as df from '../../data/dataFunctions.js';
import ScrollBox from '../../utils/ScrollBox.js';
import ObjectiveCard from './cards/ObjectiveCard.js';

export default class StageObjectives {

    constructor(scene, options = {}) {

        this.scene = scene;

        this.objectivesManager =
            options.objectivesManager;

        this.objectiveFlow =
            options.objectiveFlow;

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? 300;
        this.height = options.height ?? 200;

        this.depth =
            this.scene.depths?.objectives ?? 10;

        this.container =
            this.scene.add.container(0, 0);
        
        this.container.setDepth(this.depth);

        this.elements = [];

        this.sections = {

            tracking: {
                title: 'TRACKING',
                expanded: true,
                cards: []
            },

            active: {
                title: 'ACTIVE',
                expanded: true,
                cards: []
            },

            completed: {
                title: 'COMPLETED',
                expanded: false,
                cards: []
            },

            locked: {
                title: 'LOCKED',
                expanded: false,
                cards: []
            }

        };

        this.create();

        this.removeObjectiveListener =
            listenToEvent(
                this.objectivesManager,
                'updated',
                () => {
                    this.refresh();
                }
            );

        this.refresh();
    }

    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

    create() {

        this.scrollBox =
            new ScrollBox(
                this.scene,
                {
                    x: this.x,
                    y: this.y,
                    width: this.width,
                    height: this.height,
                    depth: this.depth,
                    maskPadding: 3
                }
            );

        // ScrollBox content must remain
        // the scrolling parent.
        this.addElement(
            this.scrollBox.content
        );
    }

    createSectionHeader(section, y) {
        const headerHeight = 42;
    
        const background =
            this.scene.add.rectangle(
                this.x,
                y,
                this.width,
                headerHeight,
                0x222222
            )
            .setOrigin(0);
    
        const arrow =
            addText(
                this.scene,
                this.x + 12,
                y + headerHeight / 2,
                section.expanded ? '▼' : '▶',
                {
                    fontSize: '18px',
                    color: '#33FFE4'
                }
            )
            .setOrigin(0.5);
    
        const title =
            addText(
                this.scene,
                this.x + 32,
                y + headerHeight / 2,
                section.title,
                {
                    fontSize: '20px',
                    color: '#33FFE4'
                }
            )
            .setOrigin(0, 0.5);
    
        const count =
            addText(
                this.scene,
                this.x + this.width - 12,
                y + headerHeight / 2,
                '(0)',
                {
                    fontSize: '18px',
                    color: '#aaaaaa'
                }
            )
            .setOrigin(1, 0.5);
    
        background.setInteractive();
        
        background.on(
            'pointerup',
            pointer => {
        
                if (!this.isPointerVisible(pointer)) {
                    return;
                }
        
                if (
                    this.scrollBox.wasDragged()
                ) {
                    return;
                }
        
                section.expanded =
                    !section.expanded;
        
                this.refresh();
            }
        );
    
        return {
            background,
            arrow,
            title,
            count,
            height: headerHeight
        };
    }

    setVisible(visible) {
        this.container.setVisible(visible);

        if (this.scrollBox?.scrollZone) {
            this.scrollBox.scrollZone.input.enabled =
                visible;
        }
    }

    refresh() {
    const sections =
            df.getObjectiveSections(this.objectivesManager);

        // Destroy existing cards
        Object.values(this.sections)
            .forEach(section => {
                section.cards.forEach(card => {
                    card.destroy?.();
                });
    
                section.cards = [];
            });
    
        this.scrollBox.content.removeAll(true);
    
        let y = 8;
    
        Object.entries(this.sections)
            .forEach(([id, section]) => {
    
                const objectives =
                    sections[id];
    
                const header =
                    this.createSectionHeader(
                        section,
                        y
                    );
    
                this.scrollBox.content.add(
                    header.background
                );
    
                this.scrollBox.content.add(
                    header.arrow
                );
    
                this.scrollBox.content.add(
                    header.title
                );
    
                this.scrollBox.content.add(
                    header.count
                );
    
                header.count.setText(
                    `(${objectives.length})`
                );
    
                y += header.height;
    
                // Section is collapsed.
                if (!section.expanded) {
                    y += 6;
                    return;
                }
    
                // --------------------------------
                // Cards will go here
                // --------------------------------
    
                if (objectives.length === 0) {
    
                    const emptyText =
                        addText(
                            this.scene,
                            this.x + 16,
                            y + 12,
                            'None',
                            {
                                fontSize: '16px',
                                color: '#666666'
                            }
                        );
    
                    this.scrollBox.content.add(
                        emptyText
                    );
    
                    y += 40;
    
                } else {
                
                    objectives.forEach(objective => {
                        const mode =
                            df.getObjectiveCardMode(objective);
                    
                        const card =
                            new ObjectiveCard(
                                this.scene,
                                {
                                    x: this.x,
                                    y,
                                    width: this.width,
                    
                                    objective,
                    
                                    mode,
                                    
                                    unlocks:
                                        objective.unlocks,
                    
                                    objectivesManager:
                                        this.objectivesManager,
                    
                                    objectiveFlow:
                                        this.objectiveFlow,
                    
                                    scrollBox:
                                        this.scrollBox
                                }
                            );
                    
                        section.cards.push(card);
                    
                        this.scrollBox.content.add(
                            card.container
                        );
                    
                        y += card.height + 8;
                    });
                }
    
                y += 8;
            });
    
        this.scrollBox.setContentHeight(y);
    }

    // For scrollBox
    isPointerVisible(pointer) {
        if (!this.scrollBox) {
            return true;
        }
        return this.scrollBox.isPointerInside(pointer);
    }

    destroy() {
        this.removeObjectiveListener?.();

        Object.values(this.sections)
            .forEach(section => {

                section.cards.forEach(card => {
                    card.destroy?.();
                });

                section.cards = [];
            });

        if (this.scrollBox?.content) {
            this.container.remove(
                this.scrollBox.content
            );
        }

        this.scrollBox?.destroy();

        this.container?.destroy();

        this.elements = [];
        this.sections = null;
        this.scrollBox = null;
        this.container = null;
    }
}