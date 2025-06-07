import { getRandomModelForLevel } from './Modelpicker.js';
import { ballTextures } from './textures.js';
const { Engine, Render, Runner, World, Bodies, Events, Body } = Matter;
const width = 400;
const height = 600;

const engine = Engine.create();
const world = engine.world;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width,
    height,
    wireframes: false,
    background: '#222'
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Стены коробки
const walls = [
  Bodies.rectangle(width / 2, height, width, 20, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 20, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 20, height, { isStatic: true })
];
World.add(world, walls);

// Цвета по уровням
const colors = ['#00f', '#0f0', '#f00', '#ff0', '#f0f', '#0ff', '#fff'];

// Создание шарика
// function createBall(x = width / 2, level = 1) {
//     const radius = 15 + level * 5;
//     const textureUrl = ballTextures[level];
  
//     const renderOptions = textureUrl
//       ? { sprite: { texture: textureUrl, xScale: (radius * 2) / 1024, yScale: (radius * 2) / 1024 } }
//       : { fillStyle: colors[level - 1] || '#aaa' };
  
//     const ball = Bodies.circle(x, 0, radius, {
//       restitution: 0.3,
//       friction: 0.05,
//       render: renderOptions
//     });
  
//     ball.level = level;
//     return ball;
//   }
function createBall(x = width / 2, level = 1) {
    const size = 15 + level * 5;
    const { image, name } = getRandomModelForLevel(level);
  
    const ball = Bodies.circle(x, 0, size, {
      restitution: 0.2,
      render: {
        sprite: {
          texture: image,
          xScale: (size * 2) / 1024,
          yScale: (size * 2) / 1024
        }
      }
    });
    ball.level = level;
    return ball;
  }
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'a') {
      autoPlay = !autoPlay;
  
      if (autoPlay) {
        console.log('🎮 Автоигра включена');
        startAutoPlay();
      } else {
        console.log('⏹ Автоигра остановлена');
        stopAutoPlay();
      }
    }
  });
  
// Добавление шарика при клике
window.addEventListener('click', (event) => {
    const rect = render.canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
  
    // Ограничим координату по ширине канваса
    const margin = 30; // Чтобы шар не выходил за границу
    x = Math.max(margin, Math.min(width - margin, x));
  
    const ball = createBall(x, Math.floor(Math.random() * 4) + 1);
    World.add(world, ball);
  });
  
  let autoPlay = false;
  let autoPlayId = null;
  
  function startAutoPlay() {
    if (!autoPlay) return;
  
    const x = Math.random() * (width - 60) + 30;
    const ball = createBall(x, Math.floor(Math.random() * 4) + 1);
    World.add(world, ball);
  
    // const delay = Math.random() * 600 + 300; // 300–900 мс
    const delay = 300; // 300–900 мс
    autoPlayId = setTimeout(startAutoPlay, delay);
  }
  
  function stopAutoPlay() {
    clearTimeout(autoPlayId);
  }
  
// Обработка слияния
Events.on(engine, 'collisionStart', function(event) {
  const pairs = event.pairs;
  for (let pair of pairs) {
    const { bodyA, bodyB } = pair;
    if (bodyA.level && bodyB.level && bodyA.level === bodyB.level) {
      const newLevel = bodyA.level + 1;
      const x = (bodyA.position.x + bodyB.position.x) / 2;
      const y = (bodyA.position.y + bodyB.position.y) / 2;

      World.remove(world, bodyA);
      World.remove(world, bodyB);

      const newBall = createBall(x, newLevel);
      Body.setPosition(newBall, { x, y });
      World.add(world, newBall);
    }
  }
});

// 🌀 Функция встряски
function shakeBox() {
    const tiltForce = 0.3;   // сила "наклона"
    const tiltDuration = 500; // сколько длится каждый наклон (мс)
  
    const bodies = world.bodies.filter(b => b.label === 'Circle Body');
  
    // Первый наклон — влево
    bodies.forEach(body => {
      Body.applyForce(body, body.position, {
        x: -tiltForce,
        y: 0
      });
    });
  
    // Через время — наклон вправо
    setTimeout(() => {
      bodies.forEach(body => {
        Body.applyForce(body, body.position, {
          x: tiltForce,
          y: 0
        });
      });
    }, tiltDuration);
  }
  
  
  


// Кнопка встряхивания
document.getElementById('shakeButton').addEventListener('click', shakeBox);
