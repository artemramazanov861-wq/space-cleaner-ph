// Cosmic Cleaner - Исправленная версия с рабочим управлением

// ... остальной код остается ...

// Исправленный джойстик
let joystick = {
    x: 0,
    y: 0,
    isActive: false,
    touchId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    maxDistance: 50
};

// Исправленная инициализация джойстика
function setupJoystick() {
    const joystickBase = document.getElementById('joystickBase');
    const joystickElement = document.getElementById('joystick');
    
    // Получаем позицию основания джойстика один раз при загрузке
    const updateBasePosition = () => {
        const rect = joystickBase.getBoundingClientRect();
        joystick.startX = rect.left + rect.width / 2;
        joystick.startY = rect.top + rect.height / 2;
    };
    
    // Обновляем позицию при загрузке и изменении размера
    updateBasePosition();
    window.addEventListener('resize', updateBasePosition);
    
    // Обработка касаний
    joystickBase.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gamePaused || !gameRunning) return;
        
        const touch = e.touches[0];
        joystick.isActive = true;
        joystick.touchId = touch.identifier;
        
        // Запоминаем начальную позицию касания
        joystick.startX = touch.clientX;
        joystick.startY = touch.clientY;
        
        // Позиционируем джойстик под палец
        const rect = joystickBase.getBoundingClientRect();
        joystickElement.style.transform = `translate(calc(-50% + ${touch.clientX - rect.left - rect.width/2}px), calc(-50% + ${touch.clientY - rect.top - rect.height/2}px))`;
        
        // Рассчитываем направление сразу
        updateJoystickPosition(touch.clientX, touch.clientY);
    });
    
    joystickBase.addEventListener('touchmove', (e) => {
        if (!joystick.isActive || gamePaused || !gameRunning) return;
        
        e.preventDefault();
        
        // Находим касание по идентификатору
        let touch = null;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === joystick.touchId) {
                touch = e.touches[i];
                break;
            }
        }
        
        if (!touch) return;
        
        updateJoystickPosition(touch.clientX, touch.clientY);
        
        // Обновляем позицию визуального джойстика
        const rect = joystickBase.getBoundingClientRect();
        const deltaX = touch.clientX - rect.left - rect.width/2;
        const deltaY = touch.clientY - rect.top - rect.height/2;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const limitedDistance = Math.min(distance, joystick.maxDistance);
        
        joystickElement.style.transform = `translate(calc(-50% + ${(deltaX / distance) * limitedDistance || 0}px), calc(-50% + ${(deltaY / distance) * limitedDistance || 0}px))`;
    });
    
    joystickBase.addEventListener('touchend', (e) => {
        e.preventDefault();
        joystick.isActive = false;
        joystick.x = 0;
        joystick.y = 0;
        joystick.touchId = null;
        
        // Возвращаем джойстик в центр с анимацией
        joystickElement.style.transition = 'transform 0.2s ease-out';
        joystickElement.style.transform = 'translate(-50%, -50%)';
        setTimeout(() => {
            joystickElement.style.transition = '';
        }, 200);
    });
    
    joystickBase.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        joystick.isActive = false;
        joystick.x = 0;
        joystick.y = 0;
        joystick.touchId = null;
        joystickElement.style.transform = 'translate(-50%, -50%)';
    });
}

// Исправленная функция обновления позиции джойстика
function updateJoystickPosition(clientX, clientY) {
    const deltaX = clientX - joystick.startX;
    const deltaY = clientY - joystick.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Ограничиваем расстояние
    const limitedDistance = Math.min(distance, joystick.maxDistance);
    
    if (distance > 0) {
        // Нормализуем вектор направления
        joystick.x = (deltaX / distance) * (limitedDistance / joystick.maxDistance);
        joystick.y = (deltaY / distance) * (limitedDistance / joystick.maxDistance);
    } else {
        joystick.x = 0;
        joystick.y = 0;
    }
    
    // Для дебага - показываем направление в консоли
    // console.log(`Джойстик: x=${joystick.x.toFixed(2)}, y=${joystick.y.toFixed(2)}`);
}

// Исправленное обновление игрока
function updatePlayer() {
    // Рассчитываем скорость
    let speed = player.speed;
    if (player.isBoosting) {
        speed = GAME_SETTINGS.BOOST_SPEED;
    }
    if (player.speedBoostActive) {
        speed *= 1.5;
    }
    
    // Применяем движение от джойстика (инвертируем Y для интуитивного управления)
    const moveX = joystick.x * speed;
    const moveY = joystick.y * speed;
    
    // Обновляем позицию
    player.x += moveX;
    player.y += moveY;
    
    // Ограничиваем движение в пределах canvas
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));
    
    // Дебаг информация
    if (Math.abs(joystick.x) > 0.1 || Math.abs(joystick.y) > 0.1) {
        // console.log(`Игрок движется: x=${moveX.toFixed(2)}, y=${moveY.toFixed(2)}`);
    }
}