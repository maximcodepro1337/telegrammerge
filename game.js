import { getRandomModelForLevel, getRandomModelForLevel1 } from './ModelPicker.js';
import { ballTextures } from './textures.js';
const { Engine, Render, Runner, World, Bodies, Events, Body } = Matter;
const width = 400;
const height = 600;
let totalPrice = 0;
const engine = Engine.create();
const world = engine.world;
function getGameDimensions() {
    const margin = 20; // отступы от краёв экрана
    const maxWidth = window.innerWidth - margin * 2;
    const maxHeight = window.innerHeight - margin * 2 - 100; // оставим место под кнопки счётчики
  
    // Можно ограничить максимальные размеры, чтобы на десктопе не было слишком большого поля
    // const width = Math.min(400, maxWidth);
    // const height = Math.min(600, maxHeight);
    const width = maxWidth;
    const height = maxHeight;
  
    return { width, height };
  }
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width,
    height,
    wireframes: false,
    background: '#333'
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
function createBall(x = width / 2, level = 1, usage = 'new') {
    const size = 15 + level * 5;
    let model;
    if (usage === 'pairs') {
        model = getRandomModelForLevel(level);
      } else if (usage === 'new') {
        model = getRandomModelForLevel1(level);
      }
    console.log(usage);
    const { image, name, price } = model;
    if (image) {
        const img = new Image();
        img.onerror = function() {
            console.error('Не удалось загрузить изображение для уровня', level, 'URL:', image);
        };
        img.src = image;
    }
    if (price) {
        totalPrice += price;
        updatePriceCounter();
      }
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
let lastTouchTime = 0;

function handleInput(xPosition) {
  const margin = 30;
  const x = Math.max(margin, Math.min(width - margin, xPosition));
  const ball = createBall(x, Math.floor(Math.random() * 4) + 1, 'new');
  World.add(world, ball);
}
function updatePriceCounter() {
    const el = document.getElementById("priceCounter");
    el.textContent = `${totalPrice.toFixed(2)} TON`;
  }
render.canvas.addEventListener('touchstart', (event) => {
  event.preventDefault(); // предотвращает click после touch
  const now = Date.now();

  // блокируем двойной вызов
  if (now - lastTouchTime < 500) return;
  lastTouchTime = now;

  const rect = render.canvas.getBoundingClientRect();
  const touch = event.touches[0];
  const x = touch.clientX - rect.left;
  handleInput(x);
}, { passive: false });

render.canvas.addEventListener('click', (event) => {
  // Не обрабатывать click, если был недавний touch
  if (Date.now() - lastTouchTime < 500) return;

  const rect = render.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  handleInput(x);
});

  
  let autoPlay = false;
  let autoPlayId = null;
  
  function startAutoPlay() {
    if (!autoPlay) return;
  
    const x = Math.random() * (width - 60) + 30;
    const ball = createBall(x, Math.floor(Math.random() * 4) + 1, 'new');
    World.add(world, ball);
  
    // const delay = Math.random() * 600 + 300; // 300–900 мс
    const delay = 25; // 300–900 мс
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

      const newBall = createBall(x, newLevel, 'pairs');
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
