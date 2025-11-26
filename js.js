const quizContainer = document.getElementById("quizContainer");
const quizResult = document.getElementById("quizResult");

let questions = [];
let randomIndices = [];
let currentQuestion = 0;
let score = 0;

// Pobranie pytań
fetch("dane.json")
    .then(res => res.json())
    .then(data => {
        questions = data;
        initializeApp();
    })
    .catch(err => {
        console.error("Błąd wczytywania pytań:", err);
        quizContainer.innerHTML = "<p>Nie udało się wczytać pytań. Spróbuj odświeżyć stronę.</p>";
    });

// Inicjalizacja aplikacji
function initializeApp() {
    displayMenu();
}

// Menu główne
function displayMenu() {
    quizContainer.innerHTML = `
        <div class="card" style="max-width: 500px; text-align: center;">
            <h2 style="color: #0b3d57; margin-bottom: 30px;">Quiz teoretyczny - Ratownik Wodny</h2>
            <p style="font-size: 16px; color: #666; margin-bottom: 30px;">Wybierz opcję:</p>
            <button onclick="startQuiz()" class="quiz-option" style="width: 100%; background-color: #2563eb; color: white; border: none; margin-bottom: 15px; padding: 14px;">
                🎯 Rozpocznij nowy egzamin
            </button>
            <button onclick="showHistory()" class="quiz-option" style="width: 100%; background-color: #0b3d57; color: white; border: none; margin-bottom: 15px; padding: 14px;">
                📊 Historia egzaminów
            </button>
        </div>
    `;
    quizResult.innerHTML = "";
}

// Start quizu
function startQuiz() {
    score = 0;
    currentQuestion = 0;
    quizResult.innerHTML = "";
    randomIndices = getRandomIndices(questions.length, 30);
    displayQuestion(currentQuestion);
}

// Losowanie pytań
function getRandomIndices(max, count) {
    const indices = [];
    const limit = Math.min(count, max);
    while (indices.length < limit) {
        const rand = Math.floor(Math.random() * max);
        if (!indices.includes(rand)) indices.push(rand);
    }
    return indices;
}

// Wyświetlenie pytania
function displayQuestion(index) {
    const q = questions[randomIndices[index]];
    quizContainer.innerHTML = "";

    const card = document.createElement("div");
    card.classList.add("card");

    const progressBar = document.createElement("div");
    progressBar.style.cssText = "width: 100%; height: 6px; background: #e0e0e0; border-radius: 3px; margin-bottom: 15px;";
    const progress = document.createElement("div");
    progress.style.cssText = `width: ${((index + 1) / randomIndices.length) * 100}%; height: 100%; background: #2563eb; border-radius: 3px; transition: width 0.3s;`;
    progressBar.appendChild(progress);
    card.appendChild(progressBar);

    const top = document.createElement("div");
    top.classList.add("top");

    // Dodanie obrazka, jeśli jest
    const imgMatch = q.question.match(/<img.*?>/);
    if (imgMatch) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = imgMatch[0];
        const img = tempDiv.querySelector("img");
        img.classList.add("znak");
        top.appendChild(img);
    }

    // Tekst pytania
    const p = document.createElement("p");
    p.innerHTML = `Pytanie ${index + 1}/${randomIndices.length}: ` + q.question.replace(/<img.*?>/, '');
    top.appendChild(p);

    card.appendChild(top);

    const bottom = document.createElement("div");
    bottom.classList.add("bottom");

    // Opcje A) B) C)
    const letters = ["A", "B", "C"];
    q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.classList.add("quiz-option");
        btn.textContent = `${letters[i]}) ${opt}`;
        btn.onclick = () => checkAnswer(btn, opt, q.correctAnswer);
        bottom.appendChild(btn);
    });

    card.appendChild(bottom);
    quizContainer.appendChild(card);
}

// Sprawdzenie odpowiedzi
function checkAnswer(btn, selected, correct) {
    const buttons = document.querySelectorAll(".quiz-option");
    buttons.forEach(b => b.disabled = true);

    if (selected === correct) {
        btn.classList.add("correct");
        score++;
    } else {
        btn.classList.add("wrong");
        buttons.forEach(b => {
            if (b.textContent.includes(correct)) b.classList.add("correct");
        });
    }

    // Następne pytanie po 1s
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < randomIndices.length) {
            displayQuestion(currentQuestion);
        } else {
            showResult();
        }
    }, 1000);
}

// Wyświetlenie wyniku
function showResult() {
    const percentage = Math.round((score / randomIndices.length) * 100);
    const passed = percentage >= 80;
    const status = passed ? "✅ ZDANY" : "❌ NIEZDANY";

    // Zapis do localStorage
    saveExamResult({
        date: new Date().toLocaleString('pl-PL'),
        score: score,
        total: randomIndices.length,
        percentage: percentage,
        status: status,
        passed: passed
    });

    quizContainer.innerHTML = "";

    quizResult.innerHTML = `
        <div class="card" style="padding:30px; text-align:center; max-width: 500px;">
            <h2 style="color: #0b3d57; margin-bottom: 10px;">Egzamin zakończony</h2>
            <div style="font-size: 50px; margin: 20px 0;">${passed ? '🎉' : '😔'}</div>
            <p style="font-size: 24px; font-weight: bold; color: ${passed ? '#10b981' : '#ef4444'}; margin: 20px 0;">
                ${status}
            </p>
            <p style="font-size: 18px; margin: 15px 0;"><strong>Wynik:</strong> ${score} / ${randomIndices.length}</p>
            <p style="font-size: 18px; margin: 15px 0;"><strong>Procent:</strong> ${percentage}%</p>
            <p style="font-size: 14px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                ${passed 
                    ? 'Gratulacje! Zdałeś egzamin teoretyczny. 🏆' 
                    : 'Nie poddawaj się! Spróbuj ponownie i popraw wynik.'}
            </p>
            <button onclick="startQuiz()" class="quiz-option" style="width: 100%; background-color: #2563eb; color: white; border: none; margin-top: 20px; padding: 12px;">
                🔄 Spróbuj ponownie
            </button>
            <button onclick="displayMenu()" class="quiz-option" style="width: 100%; background-color: #0b3d57; color: white; border: none; margin-top: 10px; padding: 12px;">
                📋 Menu główne
            </button>
        </div>
    `;
}

// Zapis wyniku do localStorage
function saveExamResult(result) {
    let history = JSON.parse(localStorage.getItem('examHistory')) || [];
    history.push(result);
    localStorage.setItem('examHistory', JSON.stringify(history));
}

// Wyświetlenie historii egzaminów
function showHistory() {
    let history = JSON.parse(localStorage.getItem('examHistory')) || [];
    
    quizContainer.innerHTML = "";
    quizResult.innerHTML = "";

    if (history.length === 0) {
        quizContainer.innerHTML = `
            <div class="card" style="max-width: 600px; text-align: center;">
                <h2 style="color: #0b3d57; margin-bottom: 20px;">Historia egzaminów</h2>
                <p style="font-size: 16px; color: #666; margin-bottom: 30px;">Brak zapisanych egzaminów.</p>
                <button onclick="displayMenu()" class="quiz-option" style="background-color: #2563eb; color: white; border: none; padding: 12px 30px;">
                    Wróć do menu
                </button>
            </div>
        `;
        return;
    }

    let historyHTML = `
        <div class="card" style="max-width: 700px;">
            <h2 style="color: #0b3d57; margin-bottom: 20px; text-align: center;">📊 Historia egzaminów</h2>
            <div style="max-height: 500px; overflow-y: auto;">
    `;

    // Wyświetl od najnowszych
    [...history].reverse().forEach((exam, index) => {
        const bgColor = exam.passed ? '#f0fdf4' : '#fef2f2';
        const borderColor = exam.passed ? '#10b981' : '#ef4444';
        const statusColor = exam.passed ? '#10b981' : '#ef4444';

        historyHTML += `
            <div style="
                padding: 15px;
                margin-bottom: 12px;
                border-left: 4px solid ${borderColor};
                background-color: ${bgColor};
                border-radius: 6px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div style="flex: 1;">
                    <p style="margin: 0; font-weight: bold; color: #0b3d57;">${exam.date}</p>
                    <p style="margin: 5px 0; color: #666; font-size: 14px;">
                        Wynik: <strong>${exam.score}/${exam.total}</strong> (${exam.percentage}%)
                    </p>
                </div>
                <div style="
                    background-color: ${borderColor};
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-weight: bold;
                    text-align: right;
                    font-size: 14px;
                ">
                    ${exam.status}
                </div>
            </div>
        `;
    });

    // Statystyki
    const passed = history.filter(e => e.passed).length;
    const failed = history.length - passed;
    const avgScore = Math.round(history.reduce((sum, e) => sum + e.percentage, 0) / history.length);

    historyHTML += `
            </div>
            <div style="border-top: 2px solid #e0e0e0; margin-top: 20px; padding-top: 20px; text-align: center;">
                <div style="display: flex; gap: 30px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;">
                    <div>
                        <p style="margin: 0; font-size: 12px; color: #666;">Zdane</p>
                        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #10b981;">${passed}</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 12px; color: #666;">Niezdane</p>
                        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #ef4444;">${failed}</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 12px; color: #666;">Średni wynik</p>
                        <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #2563eb;">${avgScore}%</p>
                    </div>
                </div>
                <button onclick="clearHistory()" class="quiz-option" style="background-color: #ef4444; color: white; border: none; padding: 10px 20px; margin-right: 10px;">
                    🗑️ Wyczyść historię
                </button>
                <button onclick="displayMenu()" class="quiz-option" style="background-color: #2563eb; color: white; border: none; padding: 10px 20px;">
                    ← Wróć do menu
                </button>
            </div>
        </div>
    `;

    quizContainer.innerHTML = historyHTML;
}

// Czyszczenie historii
function clearHistory() {
    if (confirm("Czy na pewno chcesz usunąć całą historię egzaminów?")) {
        localStorage.removeItem('examHistory');
        showHistory();
    }
}