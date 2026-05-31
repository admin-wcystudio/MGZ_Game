import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_5 extends BaseGameScene {
    constructor() {
        super('GameScene_5');
    }

    preload() {
        const path = 'assets/images/Game_5/';

        this.load.image('game5_npc_box_mainstreet_fail', `${path}game5_npc_box1.png`);
        this.load.image('game5_npc_box_mainstreet_fail_01', `${path}game5_npc_box2.png`);
        this.load.image('game5_npc_box_mainstreet_fail_02', `${path}game5_npc_box3.png`);

        this.load.image('game5_npc_box_mainstreet', `${path}game5_npc_box4.png`);

        this.load.image('game5_npc_box_win', `${path}game5_npc_box5.png`);
        this.load.image('game5_npc_box_win_01', `${path}game5_npc_box6.png`);
        this.load.image('game5_npc_box_win_02', `${path}game5_npc_box7.png`);
        this.load.image('game5_npc_box_tryagain', `${path}game5_npc_box8.png`);

        // Buttons
        this.load.image('game5_button_blue', `${path}game5_drum_blue.png`);
        this.load.image('game5_button_green', `${path}game5_drum_green.png`);
        this.load.image('game5_button_red', `${path}game5_drum_red.png`);
        this.load.image('game5_button_yellow', `${path}game5_drum_yellow.png`);

        // Arrows
        this.load.image('game5_bar_arrow_blue', `${path}game5_bar_drum_blue.png`);
        this.load.image('game5_bar_arrow_green', `${path}game5_bar_drum_green.png`);
        this.load.image('game5_bar_arrow_red', `${path}game5_bar_drum_red.png`);
        this.load.image('game5_bar_arrow_yellow', `${path}game5_bar_drum_yellow.png`);

        this.load.image('game5_object_description', `${path}game5_object_description.png`);

        // Other UI
        this.load.image('game5_bar_bg', `${path}game5_bar_bg.png`);
        this.load.image('game5_hit_point', `${path}game5_hit_point.png`);

    }

    create() {
        // Initialize dimensions
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.barBG = this.add.image(960, 540, 'game5_bar_bg').setDepth(20);
        this.hitPoint = this.add.image(1000, 520, 'game5_hit_point').setDepth(30)
            .setVisible(false).setScale(0);

        this.initGame('game5_bg', 'game5_description', true, false, {
            targetRounds: 3,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 5
        });

        this.gameUI.descriptionPanel.setCloseCallBack(() => {
            this.startGame();
        });

    }

    setupGameObjects() {
        this.canSpawn = false;
        this.spawnHitPoint = false;
        this.isHitPointValid = false;
        this.isWin = false;
        this.spawnSpeed = 4;
        this.currentIndex = 0;
        this.fallingArrows = [];
        this.hitPointTimer = null;

        if (this.buttonGroup) {
            if (this.buttonGroup.scene) {
                this.buttonGroup.destroy(true);
            }
        }
        if (this.arrowGroup) {
            if (this.arrowGroup.scene) {
                this.arrowGroup.destroy(true);
            }
        }

        this.buttonGroup = this.add.group();
        this.arrowGroup = this.add.group();
        const colors = ['blue', 'green', 'red', 'yellow'];
        for (let i = 0; i < 4; i++) {
            const button = new CustomButton(this, 520 + i * 300, 780, `game5_button_${colors[i]}`, `game5_button_${colors[i]}`,
                () => {
                    this.handleArrowClick(i);
                }).setDepth(25);
            this.buttonGroup.add(button);
        }

        for (let i = 0; i < colors.length; i++) {
            const arrow = this.add.image(960, -100, `game5_bar_arrow_${colors[i]}`).setDepth(23);
            this.arrowGroup.add(arrow);
        }

    }
    update() {
        if (this.canSpawn) {
            if (!this.fallingArrows || this.fallingArrows.length < 2) {
                this.spawnArrow();
            }

            if (!this.fallingArrows) return;


            if (!this.spawnHitPoint && !this.hitPointTimer) {
                this.hitPointTimer = this.time.delayedCall(2000, () => {
                    this.hitPointTimer = null;
                    if (this.canSpawn && !this.spawnHitPoint) {
                        this.showHitPoint();
                        this.spawnHitPoint = true;
                    }
                });
            }


            for (let i = this.fallingArrows.length - 1; i >= 0; i--) {
                const arrow = this.fallingArrows[i];
                arrow.x -= this.spawnSpeed;
                if (!arrow.visible && arrow.x <= 1620) {
                    arrow.setVisible(true);
                }
                if (arrow.x < 200) {
                    arrow.destroy();
                    this.fallingArrows.splice(i, 1);
                }
            }

        }
    }

    enableGameInteraction(enable) {
        this.canSpawn = enable;
        if (enable) {
            this.spawnHitPoint = false;
            this.isHitPointValid = false;
        }

        if (this.buttonGroup) {
            this.buttonGroup.setVisible(enable);
            this.buttonGroup.getChildren().forEach(button => {
                if (enable) {
                    button.setInteractive();
                } else {
                    button.disableInteractive();
                }
            });
        }
        if (this.barBG)
            this.barBG.setVisible(enable);

    }

    showHitPoint() {
        if (this.isWin || this.spawnHitPoint) return;

        this.isHitPointValid = true;
        // Ensure hitPoint is visible and starts from scale 0 so tween is visible
        if (this.hitPoint) {
            this.hitPoint.setVisible(true).setScale(0);
        }
        this.tweens.add({
            targets: this.hitPoint,
            scale: 1,
            duration: 500,
            ease: 'Back.out'
        });

        // Debug: draw hit zone rectangle for testing
        // this.clearDebugHitZone();
        // const debugSize = 160;
        // this.debugHitRect = this.add.graphics();
        // this.debugHitRect.lineStyle(2, 0x00ff00, 0.8);
        // this.debugHitRect.strokeRect(this.hitPoint.x - debugSize / 2, this.hitPoint.y - debugSize / 2, debugSize, debugSize);
        // this.debugHitRect.setDepth(60);


        this.time.delayedCall(2000, () => {
            if (this.hitPoint) {
                this.tweens.add({
                    targets: this.hitPoint,
                    scale: 0,
                    duration: 500,
                    ease: 'Back.in',
                });;
                // remove debug rectangle when hit point hides
                this.clearDebugHitZone();
            }
            this.time.delayedCall(500, () => {
                this.isHitPointValid = false;
            });
        });

        this.time.delayedCall(2000, () => {
            this.spawnHitPoint = false;
        });
    }

    clearDebugHitZone() {
        if (this.debugHitRect) {
            try { this.debugHitRect.destroy(); } catch (e) { }
            this.debugHitRect = null;
        }
    }

    spawnArrow() {
        if (!this.fallingArrows) this.fallingArrows = [];
        //console.log('Spawning Arrow ');
        const colors = ['blue', 'green', 'red', 'yellow'];
        const gap = 200;
        let startX;

        if (this.fallingArrows.length > 0) {
            const rightMostArrow = this.fallingArrows.reduce((
                max, arrow) => arrow.x > max.x ? arrow : max, this.fallingArrows[0]);
            startX = Math.max(rightMostArrow.x, 1620);
        } else {
            startX = 800; // initial spawn starts inside the visible bar
        }



        const BAR_RIGHT_X = 1620;
        for (let i = 1; i <= 15; i++) {
            const randomIndex = Phaser.Math.Between(0, colors.length - 1);
            const color = colors[randomIndex];
            const arrowX = startX + (i * gap);
            const arrow = this.add.image(arrowX, 540, `game5_bar_arrow_${color}`).setDepth(24);
            arrow.colorIndex = randomIndex;
            arrow.setVisible(arrowX <= BAR_RIGHT_X);
            this.fallingArrows.push(arrow);
        }

    }

    handleArrowClick(index) {
        if (!this.fallingArrows || this.fallingArrows.length === 0) return;

        // Collider-based hit detection: check rectangle overlap between hitPoint and arrows
        let winRound = false;
        let hitIndex = -1;
        if (this.isHitPointValid && this.hitPoint && this.fallingArrows && this.fallingArrows.length) {
            const hitRect = this.hitPoint.getBounds();
            for (let i = 0; i < this.fallingArrows.length; i++) {
                const arrow = this.fallingArrows[i];
                if (arrow.colorIndex !== index) continue;
                const arrowRect = arrow.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(hitRect, arrowRect)) {
                    hitIndex = i;
                    break;
                }
            }

            if (hitIndex !== -1) {
                const arrow = this.fallingArrows[hitIndex];
                console.log('Win round');
                winRound = true;
            } else {
                console.log('No overlapping matching arrow. Arrows:', this.fallingArrows.map(a => ({ x: Math.round(a.x), color: a.colorIndex })));
            }
        } else {
            if (!this.isHitPointValid) console.log('Hit attempted but hit point not valid');
        }

        // Common cleanup: destroy arrows, hitPoint, and hide barBG
        for (let i = 0; i < this.fallingArrows.length; i++) {
            this.fallingArrows[i].destroy();
        }
        this.fallingArrows = [];
        this.canSpawn = false;
        this.spawnHitPoint = false;
        this.isHitPointValid = false;

        if (this.hitPointTimer) {
            this.hitPointTimer.remove(false);
            this.hitPointTimer = null;
        }

        this.enableGameInteraction(false);

        if (winRound) {

            this.roundIndex = this.currentIndex;
            this.onRoundWin();
            this.currentIndex++;

            if (this.hitPoint) {

                try { this.tweens.killTweensOf(this.hitPoint); } catch (e) { }
                this.hitPoint.setScale(0).setVisible(false);
            }
            //   this.clearDebugHitZone();
        } else {
            this.roundIndex = this.currentIndex;
            this.handleLose();
        }
    }



    onRoundWin() {
        if (!this.isGameActive || this.gameState === 'gameWin') return;

        console.log(`Round ${this.roundIndex + 1} Win!`);

        let isFinalWin = (this.roundIndex + 1 >= this.targetRounds);
        this.gameState = isFinalWin ? 'gameWin' : 'roundWin';

        this.enableGameInteraction(false);

        if (isFinalWin) {
            this.canSpawn = false;
            this._calculateTiming(true);
            this.gameTimer.stop();
            this.showBubble('win');
            this.showFeedbackLabel(true);
        } else {
            this.canSpawn = true;
            this.enableGameInteraction(true);
        }
        this.updateRoundUI(true);
    }


    onWinBubbleClose() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height * 0.8;

        this.win_01 = this.add.image(centerX, centerY, 'game5_npc_box_win_01')
            .setInteractive({ useHandCursor: true }).setDepth(566).setVisible(true);

        this.win_01.once('pointerdown', () => {
            this.win_01.destroy();
            this.win_02 = this.add.image(centerX, centerY, 'game5_npc_box_win_02')
                .setInteractive({ useHandCursor: true }).setDepth(566).setVisible(true);
            this.win_02.once('pointerdown', () => {
                this.win_02.destroy();
                super.onWinBubbleClose();
                this.showObjectPanel();
            });
        });

    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game5_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }


    resetForNewRound() {
        this.canSpawn = false;
        this.spawnHitPoint = false;
        this.isHitPointValid = false;
        this.isWin = false;
        this.currentIndex = 0;

        if (this.hitPointTimer) {
            this.hitPointTimer.remove(false);
            this.hitPointTimer = null;
        }

        if (this.hitPoint) {
            this.hitPoint.setVisible(false).setScale(0);
        }

        // Ensure debug overlay is removed when resetting rounds
        this.clearDebugHitZone();

        if (this.fallingArrows) {
            for (let i = this.fallingArrows.length - 1; i >= 0; i--) {
                const arrow = this.fallingArrows[i];
                if (arrow) {
                    arrow.destroy();
                }
            }
        }
        this.fallingArrows = [];

        if (this.progressSuccess) {
            this.progressSuccess.destroy();
            this.progressSuccess = null;
        }
        if (this.progressFail) {
            this.progressFail.destroy();
            this.progressFail = null;
        }
        if (this.progressIcon) {
            const barLeftX = this.progressWidth ? 960 - this.progressWidth / 2 : 600;
            this.progressIcon.x = barLeftX;
        }
        this.canSpawn = true;
    }
}

