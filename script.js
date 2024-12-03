const form = document.getElementById('dynamic-form');
const questionField = document.getElementById('question');
const optionsContainer = document.getElementById('options-container');

let currentQuestionIndex = 0;
const responses = {};

const questions = [
    { question: "Qual o seu gênero?", options: ["Masculino", "Feminino"], jsonKey: "genero" },
    { question: "Qual é a sua idade?", options: [], jsonKey: "idade", type: "numeric" },
    { question: "Possui hipertensão?", options: ["Sim", "Não"], jsonKey: "hipertensao" },
    { question: "Possui doença cardíaca?", options: ["Sim", "Não"], jsonKey: "doenca_cardiaca" },
    { question: "É casado?", options: ["Sim", "Não"], jsonKey: "casado" },
    { question: "Tipo de trabalho?", options: ["Privado", "Conta própria", "Governamental", "Desempregado"], jsonKey: "tipo_trabalho" },
    { question: "Tipo de residência?", options: ["Rural", "Urbano"], jsonKey: "tipo_residencia" },
    { question: "Nível de glicose?", options: ["Não sei informar"], jsonKey: "nivel_glicose", type: "numeric" },
    { question: "Qual o seu IMC?", options: [], jsonKey: "imc", type: "imc" },
    { question: "Qual caso se encaixa quanto ao cigarro?", options: ["Fuma", "Fumou anteriormente", "Nunca fumou"], jsonKey: "condicao_fumante" }
];

function calculateIMC(weight, height) {
    return (weight / (height * height)).toFixed(2);
}

function convertYesNoToNumeric(answer) {
    return answer === 'Sim' ? 1 : 0;
}

function loadQuestion(index) {
    const currentQuestion = questions[index];
    questionField.value = currentQuestion.question;
    optionsContainer.innerHTML = '';

    if (currentQuestion.type === 'imc') {
        // Campo de input para IMC com botão de cálculo
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group custom-input-group w-50';

        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'input-value';
        input.className = 'form-control w-50';
        input.placeholder = 'Insira seu IMC ou calcule';
        input.style.fontSize = '0.9rem';

        const imcButton = document.createElement('button');
        imcButton.className = 'btn btn-outline-secondary btn-sm';
        imcButton.type = 'button';
        imcButton.textContent = 'Calcular IMC';
        imcButton.addEventListener('click', () => {
            openIMCCalculator(input);
        });

        inputGroup.appendChild(input);
        inputGroup.appendChild(imcButton);
        optionsContainer.appendChild(inputGroup);

        const submitButton = document.createElement('button');
        submitButton.className = 'btn btn-primary btn-sm btn-submit w-50';
        submitButton.type = 'button';
        submitButton.textContent = 'Enviar';
        submitButton.addEventListener('click', () => {
            const inputValue = input.value.trim();
            if (inputValue) {
                responses[currentQuestion.jsonKey] = parseFloat(inputValue);
                nextQuestion();
            } else {
                alert('Por favor, insira um valor');
            }
        });

        optionsContainer.appendChild(submitButton);
    } else if (currentQuestion.type === 'numeric') {
        // Campo de input para respostas numéricas com botão padrão
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group custom-input-group w-50';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control w-50';
        input.placeholder = `Insira ${currentQuestion.question.split(' ')[2].toLowerCase()}`;
        input.style.fontSize = '0.9rem';

        inputGroup.appendChild(input);
        optionsContainer.appendChild(inputGroup);

        const submitButton = document.createElement('button');
        submitButton.className = 'btn btn-primary btn-sm btn-submit w-50';
        submitButton.type = 'button';
        submitButton.textContent = 'Enviar';
        submitButton.addEventListener('click', () => {
            const inputValue = input.value.trim();
            const numericValue = parseFloat(inputValue);
            responses[currentQuestion.jsonKey] = isNaN(numericValue) ? inputValue : numericValue;
            nextQuestion();
        });

        optionsContainer.appendChild(submitButton);

        // Botão para "Não sei informar" para a pergunta de glicose
        if (currentQuestion.jsonKey === 'nivel_glicose') {
            const defaultButton = document.createElement('button');
            defaultButton.className = 'btn btn-secondary btn-sm w-50';
            defaultButton.type = 'button';
            defaultButton.textContent = 'Não sei informar';
            defaultButton.addEventListener('click', () => {
                responses[currentQuestion.jsonKey] = 75; // Valor padrão
                nextQuestion();
            });
            optionsContainer.appendChild(defaultButton);
        }
    } else {
        // Opções de resposta
        currentQuestion.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'btn btn-outline-primary btn-sm mt-2 option-btn';
            button.type = 'button';
            button.textContent = option;
            button.setAttribute('data-value', option);
            button.addEventListener('click', () => {
                let responseValue = option;
                if (currentQuestion.jsonKey === 'hipertensao' || currentQuestion.jsonKey === 'doenca_cardiaca') {
                    responseValue = convertYesNoToNumeric(option);
                }else if(currentQuestion.jsonKey === 'condicao_fumante'){
                     // Converte a primeira letra para minúscula para envio ao JSON
                    responseValue = option.charAt(0).toLowerCase() + option.slice(1);
                }else if(currentQuestion.jsonKey === 'tipo_trabalho'){
                    if(responseValue === 'Conta própria'){
                        responseValue = 'Conta propria';
                    }else if(responseValue === 'Desempregado'){
                        responseValue = 'Governamental';
                    }

                    
                }
                 // Remove o acento de "Não" se existir
                if (responseValue === "Não") {
                    responseValue = "Nao";
                }
                responses[currentQuestion.jsonKey] = responseValue;
                nextQuestion();
            });

            optionsContainer.appendChild(button);
        });
    }

    // Botão de voltar
    if (index > 0) {
        const backButton = document.createElement('button');
        backButton.className = 'btn btn-sm mt-2 btn-voltar';
        backButton.type = 'button';
        backButton.textContent = 'Voltar';
        backButton.addEventListener('click', previousQuestion);
        optionsContainer.appendChild(backButton);
    }
}

function openIMCCalculator(input) {
    const weight = prompt("Insira seu peso em kg (use ponto para decimais, ex: 70.5):");
    if (weight.includes(',')) {
        alert('Por favor, use ponto (.) ao invés de vírgula (,) para separar as casas decimais.');
        return;
    }

    const height = prompt("Insira sua altura em metros (use ponto para decimais, ex: 1.75):");
    if (height.includes(',')) {
        alert('Por favor, use ponto (.) ao invés de vírgula (,) para separar as casas decimais.');
        return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || isNaN(heightNum) || weightNum <= 0 || heightNum <= 0) {
        alert('Entrada inválida. Por favor, insira números válidos.');
        return;
    }

    const imc = calculateIMC(weightNum, heightNum);
    input.value = imc;
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion(currentQuestionIndex);
    } else {
        sendResponses();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
}

function sendResponses() {
    fetch('https://tcc-api-y3ov.onrender.com/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(responses)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Resposta da API:', data);
        if (data[0] === 0) {
            window.location.href = 'tela_negativa.html';
        } else if (data[0] === 1) {
            window.location.href = 'tela_positiva.html';
        } else {
            alert('Resposta desconhecida da API.');
        }
    })
    .catch(error => {
        console.error('Erro ao enviar as respostas:', error);
        window.location.href = 'erros.html';
    });
}

// Carrega a primeira pergunta
loadQuestion(currentQuestionIndex);
