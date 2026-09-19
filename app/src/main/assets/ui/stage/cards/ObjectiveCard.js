import { listenToEvent } from '../../../utils/stageHelpers.js';

export default class ObjectiveCard {

    constructor(scene, options = {}) {
        this.scene = scene;

        this.mode = options.mode ?? 'active';

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.container = this.scene.add.container(this.x, this.y);
        this.width = options.width ?? 300;

        this.objective = options.objective ?? null;
        this.objectiveId = this.objective?.id ?? null;

        this.objectivesManager = options.objectivesManager ?? null;
        this.unlocks = options.unlocks ?? null;
        this.objectiveFlow = options.objectiveFlow ?? null;
        
        // To disable interactions outside of scroll area
        this.scrollBox = options.scrollBox ?? null;

        this.height = 0;

        this.requirements = [];
        this.childEntries = [];

        // ALL elements (tab container)
        this.elements = [];
        
        this.completeButton = null;
        this.completeButtonText = null;

        this.removeObjectiveListener =
            listenToEvent(
                this.objectivesManager,
                'updated',
                event => {
                    if (event.id !== this.objectiveId) {
                        return;
                    }
                        // unlockObjective()
                    if (event.type === 'objective-complete'
                    ) {
                        this.update();
                    }
                }
            );

        this.create();
        this.update();

    }

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

    // For scrollBox
    isPointerVisible(pointer) {
        if (!this.scrollBox) {
            return true;
        }
        return this.scrollBox.isPointerInside(pointer);
    }

    create() {

        this.createDefaults();

        switch (this.mode) {
            case 'active':
                this.createActiveCard();
                break;
            case 'completed':
                //this.createCompletedCard();
                break;
            case 'locked':
                this.createLockedCard();
                break;
            default:
                //this.createLockedCard();
                break;
        }
    }

//////////////////////////////////////////
// CREATE CARD DEFAULTS
//////////////////////////////////////////

    createDefaults() {
        this.createBackground();
        this.createTitle();
    }

    createBackground() {
        this.background =
            this.addElement(
                this.scene.add.rectangle(
                    0,
                    5,
                    this.width,
                    20,
                    0x000033
                )
                .setOrigin(0)
                .setStrokeStyle(1, 0x777777)
            );
    }

    createTitle() {
        this.titleText =
            this.addElement(
                addText(this.scene,
                    this.width / 2,
                    30,
                    this.objective.title,
                    {
                        fontSize: '44px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0.5, 0)
        );

        // Set initial height for all cards
        this.height = this.titleText.y + this.titleText.height + 10;
        
        // Resize background
        this.background.setSize(this.width, this.height);
    }

//////////////////////////////////////////
// CREATE SPECIFIC CARDS
//////////////////////////////////////////

    createActiveCard() {

        // DESCRIPTION
        this.descriptionText =
            this.addElement(
                addText(this.scene,
                    this.width / 2,
                    this.height,
                    this.objective.description ?? '...',
                    {
                        fontSize: '22px',
                        color: '#cccccc',
                        wordWrap: {
                            width: this.width - 20
                        }
                    }
                )
                .setOrigin(0.5, 0)
            );
        
        this.height += this.descriptionText.height + 10;

        // Objectives title
        this.objectivesTitle =
            this.addElement(
                addText(this.scene,
                    10,
                    this.height,
                    'Objectives:',
                    {
                        fontSize: '30px',
                        color: '#ffffff'
                    }
                )
            );

        this.height += this.objectivesTitle.height + 5;

        // PARENT OBJECTIVE
        if (this.objective.type === 'parent') {
            this.height = this.createParentDisplay();
        }
        // NORMAL OBJECTIVE
        else {
            this.height = this.createRequirementDisplay();
        }
        this.height += 10;

        // Progress bar
        const progressY = this.height;
        this.progressBar =
            this.addElement(
                this.scene.add.rectangle(
                    10,
                    progressY,
                    this.width - 20,
                    12,
                    0x222222
                )
                .setOrigin(0)
            );
        
        this.progressFill =
            this.addElement(
                this.scene.add.rectangle(
                    10,
                    progressY,
                    0,
                    12,
                    0x66aa66
                )
                .setOrigin(0)
            );
        
        this.progressText =
            this.addElement(
                addText(
                    this.scene,
                    10,
                    progressY + 16,
                    'Progress:\n0 / 0',
                    {
                        fontSize: '25px',
                        color: '#ffffff'
                    }
                )
            );
        
        this.height = progressY + this.progressText.height + 40;
        
        const completeButtonHeight = this.createCompleteButton();
        this.height += completeButtonHeight;

        // Final
        this.background.setSize(this.width, this.height);

    }

    // helper ^ createActiveCard()
    // Complete button
    createCompleteButton() {

        const buttonH = 40;
        this.completeButton =
            this.addElement(
                this.scene.add.rectangle(
                    this.width / 2,
                    this.height,
                    200,
                    buttonH,
                    0x335533
                )
                .setOrigin(0.5, 0)
                .setStrokeStyle(1, 0x66aa66)
                .setInteractive({
                    useHandCursor: true
                })
            );
        
        this.completeButtonText =
            this.addElement(
                addText(this.scene,
                    this.completeButton.x,
                    this.completeButton.y + this.completeButton.height / 2,
                    'COMPLETE',
                    {
                        fontSize: '22px',
                        color: '#ffffff'
                    }
                )
                .setOrigin(0.5, 0.5)
            );
        
        this.completeButton.on(
            'pointerdown',
            pointer => {
                if (!this.isPointerVisible(pointer)) {
                    return;
                }
        
                this.objectiveFlow.completeObjective(
                    this.objective.id
                );
            }
        );
        
        return buttonH + 20;
    }

    // helper ^ createActiveCard()
    // PARENT DISPLAY
    createParentDisplay() {
        let currentY = this.height + 10;

        // Parent item requirements
        const itemRequirements = this.objective.requirements ?? [];
        itemRequirements.forEach(req => {
            const text = 
                this.addElement(
                    addText(this.scene,
                        30,
                        currentY,
                        '...',
                        {
                            fontSize: '30px',
                            color: '#ffffff'
                        }
                    )
                );

            this.requirements.push({
                id: req.id,
                required: req.required,
                text
            });
            
            currentY += text.height + 5;
        });

        // Individual children
        const children = this.objective.children ?? [];
        children.forEach(
            childId => {
                const child = this.objectivesManager.getObjective(childId);

                if (!child) {
                    return;
                }

                const text =
                    this.addElement(
                        addText(this.scene,
                            30,
                            currentY,
                            '...',
                            {
                                fontSize: '30px',
                                color: '#ffffff'
                            }
                        )
                    );

                this.childEntries.push({
                    id: childId,
                    objective: child,
                    text
                });

                currentY += text.height +.5;
            }
        );

        return currentY;
    }

    // helper ^ createActiveCard()
    // NORMAL REQUIREMENTS
    createRequirementDisplay() {
        let thisY = this.height;

        // Special objective text
        if (this.objective.objectiveText) {
            this.objectiveTextDisplay =
                this.addElement(
                    addText(this.scene,
                        30,
                        thisY,
                        this.objective.objectiveText,
                        {
                            fontSize: '30px',
                            color: '#ffffff',
                            wordWrap: {
                                width: this.width - 20
                            }
                        }
                    )
                    .setOrigin(0)
                );

            thisY += this.objectiveTextDisplay.height + 5;
        }

        // Item requirements
        const itemRequirements = this.objective.requirements ?? [];
        itemRequirements.forEach(req => {
            const text = 
                this.addElement(
                    addText(this.scene,
                        30,
                        thisY,
                        '...',
                        {
                            fontSize: '30px',
                            color: '#ffffff'
                        }
                    )
                );

            this.requirements.push({
                id: req.id,
                required: req.required,
                text
            });
            
            thisY += text.height + 5;
        });

        return thisY;
    }

    createCompletedCard() {
        
    }

    createLockedCard() {
        this.background.setFillStyle(0x111111);

        this.lockOverlay =
            this.addElement(
                this.scene.add.rectangle(
                    0,
                    5,
                    this.width,
                    100,
                    0x000000,
                    0.75
                )
            .setOrigin(0)
            .setStrokeStyle(1, 0x555555)
        );

        this.height = this.lockOverlay.height;

        this.availabilityText =
            this.addElement(
                addText(this.scene,
                    this.width / 2,
                    this.height / 2,
                    'LOCKED',
                    {
                        fontSize: '18px',
                        color: '#ffffff'
                    }
                )
            .setOrigin(0.5)
        );
    
        // Final
        this.background.setSize(this.width, this.height);
    }

    update() {
        if (this.mode == 'locked') return;
        
        // Upon immediate objection completion
        const status = this.objectivesManager.getObjectiveStatus(this.objective.id);
    
        if (status === 'completed') {
            this.completeButton?.disableInteractive()
            .setVisible(false);
            this.completeButtonText?.setColor('#66ff66')
                .setText('>> COMPLETED! <<');
            return;
        }
    
        // Normal active state
        this.completeButtonText?.setText('COMPLETE');

        const progress = this.objectivesManager.getObjectiveProgressData(this.objective.id);

        // Complete button
        if (progress.ready) {
            this.completeButton
                .setFillStyle(0x335533)
                .setStrokeStyle(1, 0x66aa66)
                .setInteractive({
                    useHandCursor: true
                });
            this.completeButtonText
                .setColor('#ffffff')
                .setText('COMPLETE');
        } else {
            this.completeButton
                .setFillStyle(0x222222)
                .setStrokeStyle(1, 0x000000)
                .disableInteractive();
            this.completeButtonText
                .setColor('#555555')
                .setText('INCOMPLETE');
        }
    
        // Progress bar
        this.progressFill.width =
            (this.width - 20) *
            progress.percent;

        if (progress.total > 0) {
            this.progressText?.setText(
                `Progress:\n    ${progress.completed} / ${progress.total}`
            );
        } else {
            this.progressText?.setText('Ready to complete');
        }
    
        this.updateRequirements();
        if (this.objective.type !== 'parent') return;
        this.updateParent();
    }

    // UPDATE NORMAL REQUIREMENTS
    updateRequirements() {
        this.requirements.forEach(requirement => {
            const amount = this.objectivesManager.get(requirement.id);
            const ready = amount >= requirement.required;
            const item = this.objectivesManager.getItem(requirement.id);
            const title = item?.title ?? requirement.id;

            requirement.text.setText(
                `${title}: ` +
                `${Math.floor(amount)} / ` +
                `${requirement.required} ` +
                `${ready ? '✓' : '✕'}`
            );

            requirement.text.setColor(ready ? '#66ff66' : '#ff6666');
        });
    }

    // UPDATE PARENT
    updateParent() {
        const progress = this.objectivesManager.getObjectiveProgressData(this.objective.id);
        if (!progress) {
            return;
        }

        // Children
        this.childEntries.forEach(entry => {
            const completed = this.objectivesManager.isObjectiveComplete(entry.id);

            entry.text.setText(
                `${completed ? '✓' : '✕'} ` +
                `${entry.objective.title}`
            );

            entry.text.setColor(
                completed
                    ? '#66ff66'
                    : '#ff6666'
            );
        });
    }

    // DESTROY
    destroy() {
        this.removeObjectiveListener?.()

        this.container?.destroy();
    
        this.requirements = [];
        this.childEntries = [];
        this.elements = [];
    
        this.objectiveTextDisplay = null;
    
        this.completeButton = null;
        this.completeButtonText = null;
    
        this.container = null;
    }
}