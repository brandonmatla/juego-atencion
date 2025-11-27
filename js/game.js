let score = 0;
let timeLeft = 60;
let gameStarted = false;
let topo, scoreText, timerText, music;

// 📱 Detecta móvil
function esMovil() {
  return /Android|iPhone|iPad|iPod|Phone/i.test(navigator.userAgent);
}

// 📱 Detecta orientación
function esHorizontal() {
  return window.innerWidth > window.innerHeight;
}

// 📏 ESCALA AUTOMÁTICA DEL TOPO
function calcularEscalaTopo() {
  if (!esMovil()) return 0.3;     // 🖥 PC
  return esHorizontal() ? 0.5 : 0.2; // 📱 móvil → 10 veces más pequeño en horizontal
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
    transparent: true, 
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

// ----------------------------------

function preload() {
  this.load.image('topo', 'assets/topo.png');
  this.load.audio('bgMusic', 'assets/music.mp3');
}

function create() {
  scoreText = this.add.text(10, 10, 'Puntos: 0', {
    font: esMovil() ? '32px Arial' : '24px Arial',
    fill: '#ff0000ff'
  });

  timerText = this.add.text(config.width - 100, 10, '60', {
    font: esMovil() ? '32px Arial' : '24px Arial',
    fill: '#ff0000ff'
  });

  topo = this.add.image(config.width / 2, config.height / 2, 'topo')
    .setInteractive()
    .setScale(calcularEscalaTopo());

  music = this.sound.add('bgMusic', { loop: true });

  // ⏸ Pausar la escena hasta que se inicie
  this.scene.pause();

  document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
    this.scene.resume();
    music.play();
    gameStarted = true;
    startGame.call(this);
  });

  // 📱 Detectar cambio de orientación o tamaño
  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
    ajustarPantalla();
  });

  window.screen.orientation?.addEventListener('change', () => {
    setTimeout(() => ajustarPantalla(), 300);
  });
}

function update() {}

// 🕹️ INICIO DEL JUEGO
function startGame() {
  this.time.addEvent({
    delay: 1000,
    callback: () => {
      timeLeft--;
      timerText.setText(timeLeft);
      if (timeLeft <= 0) finishGame.call(this);
      else randomizePosition.call(this);
    },
    loop: true
  });

  topo.on('pointerdown', () => {
    if (!gameStarted) return;
    score++;
    scoreText.setText('Puntos: ' + score);
    randomizePosition.call(this);
  });
}

// 🔄 ADAPTAR AL GIRO
function ajustarPantalla() {
  topo.x = game.scale.width / 2;
  topo.y = game.scale.height / 2;

  topo.setScale(calcularEscalaTopo()); // 🔥 AQUÍ SE CAMBIA EL TAMAÑO

  scoreText.setPosition(10, 10);
  timerText.setPosition(game.scale.width - 100, 10);
}

function randomizePosition() {
  topo.x = Phaser.Math.Between(50, game.scale.width - 50);
  topo.y = Phaser.Math.Between(50, game.scale.height - 50);
}

function finishGame() {
  topo.destroy();
  this.add.text(game.scale.width / 2 - 100, game.scale.height / 2,
    `¡Tiempo! Puntaje: ${score}`,
    { font: '32px Arial' }
  );
  this.scene.pause();
  music.stop();
}
