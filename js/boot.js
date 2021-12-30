window.onload = function() {
  var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '');
  game.state.add('MainMenu', MainMenu);
  game.state.add('MainGame', MainGame);
  game.state.add('Controls', Controls);

  game.state.start('MainMenu');
}
