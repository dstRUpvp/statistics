// Конфігурація для JSONbin.io
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b/678cef8bacd3cb34a8ced98';
const API_KEY = '$2a$10$35zUjtJtU2AI1u3NXiNR6uIh7VRwVoickMOQE8af0OBpPVg73al/W';
const UPDATE_INTERVAL = 3000; // 3 години в мілісекундах

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
        const savedData = localStorage.getItem('playerStats');
        if (savedData) {
            return JSON.parse(savedData).data;
        }
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
                timerElement.textContent = `Следущее обновление статистики через: ${hours} : ${minutes}`;
            }
        }
    }
}

function calculateKD(kills, deaths) {
    return (kills / Math.max(deaths, 1)).toFixed(2);
}

function updateLeaderboard(players) {
    const leaderboardBody = document.getElementById('leaderboardBody');
    leaderboardBody.innerHTML = '';

    // Перетворюємо об'єкт гравців в масив для сортування
    const playerArray = Object.entries(players)
        .map(([name, stats]) => ({
            name,
            ...stats,
            kd: calculateKD(stats.kills, stats.deaths)
        }))
        .sort((a, b) => b.kd - a.kd);

    // Відображаємо топ 5 гравців
    playerArray.slice(0, 5).forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.name}</td>
            <td>${player.kd}</td>
            <td>${player.kills}</td>
            <td>${player.deaths}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

function createPlayerCards(players) {
    const playerCards = document.getElementById('playerCards');
    playerCards.innerHTML = '';

    Object.entries(players).forEach(([name, stats]) => {
        const kd = calculateKD(stats.kills, stats.deaths);
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <div class="player-name">${name}</div>
            <div class="player-stats">
                <div class="stat">
                    <div class="stat-label">Убийств</div>
                    <div class="stat-value">${stats.kills}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Смертей</div>
                    <div class="stat-value">${stats.deaths}</div>
                </div>
                <div class="kd-ratio">
                    <div class="stat-label">K/D </div>
                    <div class="kd-value">${kd}</div>
                </div>
            </div>
        `;
        playerCards.appendChild(card);
    });
}

function filterPlayers(players, searchTerm) {
    const filtered = {};
    Object.entries(players).forEach(([name, stats]) => {
        if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
            filtered[name] = stats;
        }
    });
    return filtered;
}

// Основна функція для оновлення даних
async function updateStats() {
    const players = await getPlayerStats();
    updateLeaderboard(players);
    createPlayerCards(players);

    // Додаємо обробник події для пошуку
    const searchInput = document.getElementById('searchInput');
    if (!searchInput.hasListener) {
        searchInput.hasListener = true;
        searchInput.addEventListener('input', (e) => {
            const filtered = filterPlayers(players, e.target.value);
            createPlayerCards(filtered);
        });
    }
}

// Оновлюємо таймер кожну хвилину
setInterval(updateTimer, 60000);

// Початкове завантаження даних
updateStats();
updateTimer();
