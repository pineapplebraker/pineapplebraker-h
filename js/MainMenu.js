var mainMenuBackgroundMusic;

var MainMenu = function(game) {
}

MainMenu.prototype = {
  preload: function(game) {
    this.game.load.image('mainMenuBackground', 'assets/mainMenu/mainMenuBackground.jpg');
    this.game.load.image('gameStart', 'assets/mainMenu/gameStart.png');
    this.game.load.image('gameStartHover', 'assets/mainMenu/gameStartHover.png');
    this.game.load.image('controls', 'assets/mainMenu/controls.png');
    this.game.load.image('controlsHover', 'assets/mainMenu/controlsHover.png');
    this.game.load.audio('mainMenuBackgroundMusic', 'assets/mainMenu/audio/mainMenuBackgroundMusic.mp3');
  },

  create: function(game) {
    $(document).octoberLeaves('start');
    if (mainMenuBackgroundMusic == null) {
      mainMenuBackgroundMusic = game.add.audio('mainMenuBackgroundMusic');
      mainMenuBackgroundMusic.play();
      mainMenuBackgroundMusic.volume -= 0.7;
      mainMenuBackgroundMusic.onStop.add(function() {
        mainMenuBackgroundMusic.play();
      }, this);
    }
    var mainMenuBackground = this.game.add.tileSprite(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, "mainMenuBackground");
    mainMenuBackground.scale = {x:this.game.width / 1280, y: this.game.height / 1014};
    Phaser.Canvas.setSmoothingEnabled(this.game.context, false);

    var gameStartButton = this.game.add.button(this.game.width * 0.25, this.game.world.centerY * 0.2, 'gameStart', this.startGame, this, 2, 1, 0);
    gameStartButton.anchor.setTo(0.5, 0.5);
    gameStartButton.onInputOver.add(this.hoveringOverGameStartButton, this);
    gameStartButton.onInputOut.add(this.finishHoveringOverGameStartButton, this);

    var controlsButton = this.game.add.button(this.game.width * 0.25, this.game.world.centerY * 0.5, 'controls', this.showControls, this, 2, 1, 0);
    controlsButton.anchor.setTo(0.5, 0.5);
    controlsButton.onInputOver.add(this.hoveringOverGameStartButton, this);
    controlsButton.onInputOut.add(this.finishHoveringOverGameStartButton, this);
  },

  update: function(game) {
  },

  startGame: function() {
    $(document).octoberLeaves('stop');
    if (mainMenuBackgroundMusic.isPlaying) {
      mainMenuBackgroundMusic.pause();
      mainMenuBackgroundMusic.destroy();
      mainMenuBackgroundMusic = null;
    }
    this.state.start('MainGame');
  },

  hoveringOverGameStartButton: function(button) {
    if (button.key == "gameStart") {
      button.loadTexture('gameStartHover', 0);
    } else if (button.key == "controls") {
      button.loadTexture('controlsHover', 0);
    }
  },

  finishHoveringOverGameStartButton: function(button) {
    if (button.key == "gameStartHover") {
          button.loadTexture('gameStart', 0);
    } else if (button.key == "controlsHover") {
      button.loadTexture('controls', 0);
    }
  },

  showControls: function() {
    this.state.start('Controls');
  }
}
