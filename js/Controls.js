var Controls = function(game) {
}

Controls.prototype = {
  preload: function(game) {
    this.game.load.image('controlsBackground', 'assets/controls/controlsBackground.jpg');
    this.game.load.image('arrowKeys', 'assets/controls/arrowKeys.png');
    this.game.load.image('spacebarKey', 'assets/controls/spacebarKey.png');
    this.game.load.image('shiftKey', 'assets/controls/shiftKey.png');
    this.game.load.image('backArrow', 'assets/controls/backArrow.png');
  },

  create: function(game) {
    var controlsBackground = this.game.add.tileSprite(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, "controlsBackground");
    controlsBackground.scale = {x: this.game.width / 2549, y: this.game.height/ 1462};
    Phaser.Canvas.setSmoothingEnabled(this.game.context, false);
    var arrowKeys = game.add.sprite(this.game.width * 0.2, this.game.height * 0.3, 'arrowKeys');
    arrowKeys.anchor.setTo(0.5, 0.5);
    var spacebarKey = game.add.sprite(this.game.width * 0.2, arrowKeys.y + arrowKeys.height, 'spacebarKey');
    spacebarKey.anchor.setTo(0.5, 0.5);
    var shiftKey = game.add.sprite(this.game.width * 0.2, spacebarKey.y + arrowKeys.height, 'shiftKey');
    shiftKey.anchor.setTo(0.5, 0.5);

    var fontSize = game.width * 0.015;

    var controlsTitle = this.game.add.text(this.game.world.centerX, this.game.height * 0.1, 'CONTROLS', { font: fontSize * 2 + 'px Arial', fill: '#000000' });
    controlsTitle.anchor.setTo(0.5, 0.5);

    var arrowKeysDescription = this.game.add.text(arrowKeys.x * 2.2, arrowKeys.y, 'Use the arrow keys to move your ship.', { font: fontSize + 'px Arial', fill: '#ffffff' });
    arrowKeysDescription.anchor.setTo(0.5, 0.5);

    var spacebarKeyDescription = this.game.add.text(spacebarKey.x * 2.2, spacebarKey.y, 'Hold spacebar to fire the ship\'s weapon.', { font: fontSize + 'px Arial', fill: '#ffffff' });
    spacebarKeyDescription.anchor.setTo(0.5, 0.5);

    var shiftKeyDescription = this.game.add.text(shiftKey.x * 2.5, shiftKey.y, 'Press shift to toggle between laser mode and shot mode.', { font: fontSize + 'px Arial', fill: '#ffffff' });
    shiftKeyDescription.anchor.setTo(0.5, 0.5);

    var backArrow = this.game.add.button(this.game.width * 0.95, this.game.height * 0.9, 'backArrow', this.backToMainMenu, this, 2, 1, 0);
    backArrow.anchor.setTo(0.5, 0.5);
  },

  update: function(game) {
  },

  backToMainMenu: function() {
    this.state.start('MainMenu');
  }
}
