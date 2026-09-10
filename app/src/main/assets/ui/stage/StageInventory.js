import { getItemMax, listenToEvent } from '../../utils/stageHelpers.js';
import ScrollBox from '../../utils/ScrollBox.js';

export default class StageInventory {

    constructor(scene, stageProgress, options = {}) {

        this.scene = scene;
        this.stageProgress = stageProgress;
        
        const allCardData = stageProgress.allCardData;
        this.inventoryItems = allCardData.filter(i => i.tab !== 'discover' && i.subTab !== 'upgrades');

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;

        this.width =
            options.width ?? 300;

        this.height =
            options.height ?? 200;

        this.scene.depths?.topTabs ?? 10;

        this.container =
            this.scene.add.container(0, 0);
        
        this.container.setDepth(this.depth);
        
        this.elements = [];
        this.items = [];

        this.create();

        this.removeProgressListener =
            listenToEvent(
                this.stageProgress,
                // ALL: gather-auto-upgrade, gather-upgrade, item-amount, item-unlock
                'updated',
                () => {
                    this.refresh();
                }
            );

        // Initial display
        this.refresh();
    }

    create() {
        /*this.background =
            this.scene.add.rectangle(
                this.x,
                this.y,
                this.width,
                this.height,
                0x000055
            )
            .setOrigin(0);*/
    
        this.scrollBox =
            new ScrollBox(
                this.scene,
                {
                    x: this.x,
                    y: this.y + 20,
                    width: this.width,
                    height: this.height - 40,
                    depth: this.depth,
                    maskPadding: 3
                }
            );
    
        this.content =
            this.scrollBox.content;
        
        this.addElement(this.content);
    }

    // Category colors
    getCategoryColor(category) {
        const colors = {
            created: '#66ff99',
            element: '#66ccff',
            molecule: '#66ff99',
            compound: '#ffcc66',
            biological: '#ff66cc',
            research: '#cc99ff'
        };

        return colors[category] ?? '#ffffff';
    }

    // Refresh
    refresh() {
        this.content.removeAll(true);
        this.items = [];
        let y = 8;
        const inventoryItems =
            this.getInventoryItems();

        // Group by category
        const categories = {};

        inventoryItems.forEach(item => {
            
            const unlocked =
                item.startsUnlocked ||
                this.stageProgress.getUnlocked(item.id);

            // Only show unlocked, non-discovery items
            if (!unlocked || item.discovery) return;

            const amount =
                this.stageProgress.get(
                    item.id
                );

            const category =
                item.category ?? 'other';

            if (!categories[category]) {
                categories[category] = [];
            }
            
            categories[category].push({
                item,
                amount
            });

        });

        // Render categories
        Object.entries(categories)
            .forEach(([category, items]) => {
                
                // Category heading
                const categoryText =
                    addText(this.scene,
                        this.x + 10,
                        y,
                        category.toUpperCase(),
                        {
                            fontSize: '14px',
                            color: '#ffffff'
                        }
                    );

                this.content.add(
                    categoryText
                );

                y += 20;

                // Items
                items.forEach(
                    ({ item, amount }) => {
                        const max = getItemMax(item, this.stageProgress);
                        const itemMax = max > 0 ? ' / ' + max : '';

                        const text =
                            addText(this.scene,
                                this.x + 20,
                                y,
                                
                                `${item.title ?? item.id}: ${Math.floor(amount)}${itemMax}`,
                                {
                                    fontSize: '16px',
                                    color:
                                        this.getCategoryColor(
                                            category
                                        )
                                }
                            );


                        this.content.add(text);


                        this.items.push({
                            id: item.id,
                            text
                        });
                        
                        y += 22;

                    }
                );

                // Space between categories
                y += 8;
            });

        // Calculate scroll range
        this.scrollBox.setContentHeight(y);
    }

    // Get inventory items
    getInventoryItems() {
        const items = [];

        this.inventoryItems.forEach(item => {
            // Avoid duplicates
            if (items.some(existing => existing.id === item.id)) {
                return;
            }

            items.push(item);
        });

        return items;
    }
    
    // For tabs (StageUI)
    setVisible(visible) {
        this.container.setVisible(visible);
    
        if (this.scrollBox?.scrollZone) {
            this.scrollBox.scrollZone.input.enabled =
                visible;
        }
    }

    // ELEMENT HELPERS
    addElement(element) {
        this.elements.push(element);
        this.container.add(element);
        return element;
    }

    // Destroy
    destroy() {
        this.removeProgressListener?.();
    
        if (this.scene && this._tabChangedHandler) {
            this.scene.events.off(
                'stage-tab-changed',
                this._tabChangedHandler
            );
        }
    
        if (this.scrollBox?.content) {
            this.container?.remove(
                this.scrollBox.content
            );
        }
    
        this.scrollBox?.destroy();
    
        this.container?.destroy();
    
        this.items = [];
        this.elements = [];
    
        this.scrollBox = null;
        this.content = null;
        this.background = null;
        this.container = null;
    }
}