document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("questionContainer");
  const resultContainer = document.getElementById("resultContainer");

  function fetchQuestions() {
    return fetch('dane.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
  }

  // Funkcja do losowania pytań
  function getRandomQuestions(questions) {
    const maxQuestions = Math.min(30, questions.length);
    const randomIndices = [];

    while (randomIndices.length < maxQuestions) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      if (!randomIndices.includes(randomIndex)) {
        randomIndices.push(randomIndex);
      }
    }

    return randomIndices;
  }

  let currentQuestionIndex = 0;
  let score = 0;
  let questions = [];
  let randomIndices = [];

  // Rozpocznij quiz
  function startQuiz() {
    fetchQuestions()
      .then(loadedQuestions => {
        questions = loadedQuestions;
        randomIndices = getRandomQuestions(questions);
        currentQuestionIndex = 0;
        score = 0;
        resultContainer.innerHTML = ""; // Wyczyść wyniki
        displayQuestion(currentQuestionIndex); // Rozpocznij quiz od nowa
      })
      .catch(error => {
        console.error("Error loading questions:", error);
        questionContainer.innerHTML = "<p>Error loading questions. Please try again later.</p>";
      });
  }

  // Wyświetl pytanie
  function displayQuestion(index) {
    const question = questions[randomIndices[index]];
    questionContainer.innerHTML = `
      <h4>Question ${index + 1} of ${randomIndices.length}</h4>
      <h3>${question.question}</h3>
    `;

    question.options.forEach(option => {
      const button = document.createElement("button");
      button.innerText = option;
      button.classList.add("option");
      button.addEventListener("click", () => checkAnswer(button, option, question.correctAnswer));
      questionContainer.appendChild(button);
    });
  }

  // Sprawdź odpowiedź
  function checkAnswer(selectedButton, selectedOption, correctAnswer) {
    const buttons = document.querySelectorAll(".option");
    buttons.forEach(button => button.disabled = true);

    if (selectedOption === correctAnswer) {
      score++;
      selectedButton.style.backgroundColor = "green";
    } else {
      selectedButton.style.backgroundColor = "red";
      buttons.forEach(button => {
        if (button.innerText === correctAnswer) {
          button.style.backgroundColor = "green";
        }
      });
    }

    currentQuestionIndex++;
    setTimeout(() => {
      resultContainer.innerHTML = "";
      if (currentQuestionIndex < randomIndices.length) {
        displayQuestion(currentQuestionIndex);
      } else {
        showFinalScore();
      }
    }, 1000);
  }

  // Pokaż końcowy wynik
  function showFinalScore() {
    const percentage = Math.round((score / randomIndices.length) * 100);
    const passed = percentage >= 80;
    questionContainer.innerHTML = `
      <h2>Egzamin zakończony</h2>
      <p>Twój wynik: ${score} / ${randomIndices.length}</p>
      <p>Procent: ${percentage}%</p>
      <p class="${passed ? 'pass' : 'fail'}">${passed ? "Zdałeś egzamin 🎉" : "Nie zdałeś egzaminu 😢"}</p>
      <button id="restartButton">Zacznij od nowa</button>
    `;
    document.getElementById("restartButton").addEventListener("click", startQuiz);
  }

  // Rozpocznij quiz od pierwszego pytania
  startQuiz();
});
