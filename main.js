const startmenu = document.getElementById("start"); // Startowe menu
const infomenu  = document.getElementById("informacje"); // Menu informacji
const quizmenu = document.getElementById("quiz"); // menu quizowe
quizmenu.style.display = "none"

let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let randomIndices = [];

function informacja(){
    startmenu.style.display = "none"
}

function info(){
    startmenu.style.display = "none"
    infomenu.style.display = "block"
}

function ukryjinfo(){
    infomenu.style.display = "none"
    startmenu.style.display = "block"
}

function zacznij(){
    startmenu.style.display = "none"
    infomenu.style.display = "none"
    quizmenu.style.display = "flex"
    startQuiz()
}

function ukryjquiz(){
    quizmenu.style.display = "none"
    startmenu.style.display = "block"
}

document.addEventListener("DOMContentLoaded", () => {
  const quizContainer = document.getElementById("quiz");
  const questionContainer = quizContainer.querySelector(".tresc");
  const answersContainer = quizContainer.querySelector(".odpowiedzi");
  const backToMenuButton = document.getElementById("backquiz");

  // Pobieranie pytań
  function fetchQuestions() {
    return fetch("dane.json")
      .then(response => {
        if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
        return response.json();
      });
  }

  // Losowanie pytań
  function getRandomQuestions(questions) {
    const maxQuestions = Math.min(30, questions.length);
    const randomIndices = [];
    while (randomIndices.length < maxQuestions) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      if (!randomIndices.includes(randomIndex)) randomIndices.push(randomIndex);
    }
    return randomIndices;
  }

  // Start quizu - teraz dostępny globalnie
  window.startQuiz = function() {
    fetchQuestions()
      .then(loadedQuestions => {
        questions = loadedQuestions;
        randomIndices = getRandomQuestions(questions);
        currentQuestionIndex = 0;
        score = 0;
        questionContainer.innerHTML = "";
        answersContainer.innerHTML = "";
        displayQuestion(currentQuestionIndex);
      })
      .catch(error => {
        console.error("Error loading questions:", error);
        questionContainer.innerHTML = "<p>Błąd ładowania pytań. Spróbuj ponownie później.</p>";
      });
  }

  // Wyświetlanie pytania
  function displayQuestion(index) {
    const question = questions[randomIndices[index]];

    // Czyścimy poprzednie pytanie
    questionContainer.innerHTML = "";
    answersContainer.innerHTML = "";

    // Numer pytania
    const nrPytania = document.createElement("h4");
    nrPytania.classList.add("nrpytania");
    nrPytania.textContent = `Pytanie ${index + 1} z ${randomIndices.length}`;

    // Tekst pytania (obsługa HTML w treści)
    const pytanie = document.createElement("h3");
    pytanie.classList.add("pytanie");

    const text = document.createElement("span");
    text.innerHTML = question.question; // <-- tu interpretujemy HTML, np. <img>
    pytanie.appendChild(text);

    questionContainer.appendChild(nrPytania);
    questionContainer.appendChild(pytanie);

    // Tworzymy przyciski odpowiedzi
    question.options.forEach(option => {
      const button = document.createElement("button");
      button.classList.add("option");
      button.textContent = option;
      button.addEventListener("click", () => checkAnswer(button, option, question.correctAnswer));
      answersContainer.appendChild(button);
    });
  }

  // Sprawdzenie odpowiedzi
  function checkAnswer(selectedButton, selectedOption, correctAnswer) {
    const buttons = answersContainer.querySelectorAll(".option");
    buttons.forEach(button => button.disabled = true);

    if (selectedOption === correctAnswer) {
      score++;
      selectedButton.style.backgroundColor = "green";
      selectedButton.style.color = "white";
    } else {
      selectedButton.style.backgroundColor = "red";
      selectedButton.style.color = "white";
      buttons.forEach(button => {
        if (button.textContent === correctAnswer) {
          button.style.backgroundColor = "green";
          button.style.color = "white";
        }
      });
    }

    currentQuestionIndex++;
    setTimeout(() => {
      if (currentQuestionIndex < randomIndices.length) {
        displayQuestion(currentQuestionIndex);
      } else {
        showFinalScore();
      }
    }, 1000);
  }

  // Wynik końcowy
  function showFinalScore() {
    const percentage = Math.round((score / randomIndices.length) * 100);
    const passed = percentage >= 80;
    questionContainer.innerHTML = `
      <h2>Egzamin zakończony</h2>
      <p>Twój wynik: ${score} / ${randomIndices.length}</p>
      <p>Procent: ${percentage}%</p>
      <p class="${passed ? 'pass' : 'fail'}">${passed ? "Zdałeś egzamin 🎉" : "Nie zdałeś egzaminu 😢"}</p>
      <button id="restartButton" class="option">Zacznij od nowa</button>
    `;
    answersContainer.innerHTML = "";
    document.getElementById("restartButton").addEventListener("click", window.startQuiz);
  }

  // Reset quizu po kliknięciu "Powrót do menu"
  backToMenuButton.addEventListener("click", () => {
    currentQuestionIndex = 0;
    score = 0;
    questions = [];
    randomIndices = [];

    questionContainer.innerHTML = "";
    answersContainer.innerHTML = "";

    // Pokaż startowe menu, ukryj quiz
    quizmenu.style.display = "none";
    startmenu.style.display = "block";
  });
});
