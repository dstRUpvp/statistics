// Конфігурація для JSONbin.io
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b/678cef8bacd3cb34a8ced98b';
const API_KEY = '$2a$10$35zUjtJtU2AI1u3NXiNR6uIh7VRwVoickMOQE8af0OBpPVg73al/W';
const UPDATE_INTERVAL = 10800000; // 3 години в мілісекундах

// Функція для отримання даних з JSONbin.io
async function fetchPlayerStats() {
    try {
        const response = await fetch(`${JSONBIN_API_URL}/latest`, {
            headers: {
                'X-Master-Key': API_KEY,
                'X-Access-Key': API_KEY
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        // Зберігаємо дані та час останнього оновлення
        const saveData = {
            timestamp: Date.now(),
            data: data.record
        };
        localStorage.setItem('playerStats', JSON.stringify(saveData));
        return data.record;
    } catch (error) {
        console.error('Error fetching data:', error);
        return {};
    }
}

// Функція для отримання даних з localStorage або API
async function getPlayerStats() {
    const savedData = localStorage.getItem('playerStats');
    if (savedData) {
        const { timestamp, data } = JSON.parse(savedData);
        const timeSinceLastUpdate = Date.now() - timestamp;
        
        // Якщо пройшло менше 3 годин, використовуємо збережені дані
        if (timeSinceLastUpdate < UPDATE_INTERVAL) {
            return data;
        }
    }
    // Якщо даних немає або вони застарілі, отримуємо нові
    return await fetchPlayerStats();
}

// Функція для оновлення таймера
function updateTimer() {
    const savedData = localStorage.getItem('playerStats');
    if (savedData) {
        const { timestamp } = JSON.parse(savedData);
        const timeSinceLastUpdate = Date.now() - timestamp;
        const timeUntilNextUpdate = UPDATE_INTERVAL - timeSinceLastUpdate;
        
        if (timeUntilNextUpdate > 0) {
            const hours = Math.floor(timeUntilNextUpdate / (1000 * 60 * 60));
            const minutes = Math.floor((timeUntilNextUpdate % (1000 * 60 * 60)) / (1000 * 60));
            const timerElement = document.getElementById('updateTimer');
            if (timerElement) {
                timerElement.textContent = `Следующее обновление статистики через: ${hours}год ${minutes}хв`;
            }
        }
    }
}

// ... keep existing code (calculateKD function)

// ... keep existing code (updateLeaderboard function)

// ... keep existing code (createPlayerCards function)

// ... keep existing code (filterPlayers function)

// Основна функція для оновлення даних
async function updateStats() {
    const players = await getPlayerStats();
    updateLeaderboard(players);
    createPlayerCards(players);

    // Додаємо обробник події для пошуку
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const filtered = filterPlayers(players, e.target.value);
        createPlayerCards(filtered);
    });
}

// Оновлюємо таймер кожну хвилину
setInterval(updateTimer, 60000);

// Оновлюємо дані кожні 3 години
setInterval(updateStats, UPDATE_INTERVAL);

// Початкове завантаження даних
updateStats();
updateTimer();
