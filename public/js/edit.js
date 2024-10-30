$(document).ready(function() {
    let questionCount = 0;
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');

    if (!quizId) {
        alert('Quiz ID not provided.');
        window.close();
    } else {
        $('#quizId').val(quizId);
        loadQuizData(quizId);
    }

    // Função para carregar os dados do quiz
    function loadQuizData(id) {
        $.ajax({
            url: `/api/quiz/search?id=${id}`,
            method: 'GET',
            success: function(quiz) {
                $('#editQuizName').val(quiz.quizName);
                quiz.questions.forEach(function(question, index) {
                    questionCount++;
                    const questionHtml = `
                        <div class="card mb-3" id="question-${questionCount}">
                            <div class="card-body">
                                <h5 class="card-title">Question ${questionCount}</h5>
                                <div class="form-group">
                                    <label for="questionText-${questionCount}">Question Text</label>
                                    <input type="text" class="form-control" id="questionText-${questionCount}" value="${question.question}" required>
                                </div>
                                <div id="answersContainer-${questionCount}">
                                    <!-- Respostas serão adicionadas aqui -->
                                </div>
                                <button type="button" class="btn btn-secondary addAnswerBtn" data-question-id="${questionCount}">Add Answer</button>
                                <button type="button" class="btn btn-danger removeQuestionBtn" data-question-id="${questionCount}">Remove Question</button>
                            </div>
                        </div>
                    `;
                    $('#editQuestionsContainer').append(questionHtml);

                    question.answers.forEach(function(answer, ansIndex) {
                        const answerCount = ansIndex + 1;
                        const isChecked = answer.isTrue ? 'checked' : '';
                        const answerHtml = `
                            <div class="form-group answer">
                                <label for="answerText-${questionCount}-${answerCount}">Answer ${answerCount}</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="answerText-${questionCount}-${answerCount}" value="${answer.answer}" required>
                                    <div class="input-group-append">
                                        <div class="input-group-text">
                                            <input type="checkbox" id="isTrue-${questionCount}-${answerCount}" ${isChecked}>
                                            <label for="isTrue-${questionCount}-${answerCount}" class="mb-0 ml-1">Is True</label>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-danger btn-sm mt-1 removeAnswerBtn" data-question-id="${questionCount}" data-answer-id="${answerCount}">Remove Answer</button>
                            </div>
                        `;
                        $(`#answersContainer-${questionCount}`).append(answerHtml);
                    });
                });
            },
            error: function() {
                alert('Error to load the Quiz.');
                window.close();
            }
        });
    }

    // Adicionar nova pergunta
    $('#addEditQuestionBtn').click(function() {
        questionCount++;
        const questionHtml = `
            <div class="card mb-3" id="question-${questionCount}">
                <div class="card-body">
                    <h5 class="card-title">Question ${questionCount}</h5>
                    <div class="form-group">
                        <label for="questionText-${questionCount}">Question Text</label>
                        <input type="text" class="form-control" id="questionText-${questionCount}" required>
                    </div>
                    <div id="answersContainer-${questionCount}">
                        <!-- Respostas serão adicionadas aqui -->
                    </div>
                    <button type="button" class="btn btn-secondary addAnswerBtn" data-question-id="${questionCount}">Add Answer</button>
                    <button type="button" class="btn btn-danger removeQuestionBtn" data-question-id="${questionCount}">Remove Question</button>
                </div>
            </div>
        `;
        $('#editQuestionsContainer').append(questionHtml);
    });

    // Delegar evento para adicionar resposta
    $('#editQuestionsContainer').on('click', '.addAnswerBtn', function() {
        const questionId = $(this).data('question-id');
        const answerCount = $(`#question-${questionId} .answer`).length + 1;
        const answerHtml = `
            <div class="form-group answer">
                <label for="answerText-${questionId}-${answerCount}">Answer ${answerCount}</label>
                <div class="input-group">
                    <input type="text" class="form-control" id="answerText-${questionId}-${answerCount}" required>
                    <div class="input-group-append">
                        <div class="input-group-text">
                            <input type="checkbox" id="isTrue-${questionId}-${answerCount}">
                            <label for="isTrue-${questionId}-${answerCount}" class="mb-0 ml-1">Is True</label>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-danger btn-sm mt-1 removeAnswerBtn" data-question-id="${questionId}" data-answer-id="${answerCount}">Remove Answer</button>
            </div>
        `;
        $(`#answersContainer-${questionId}`).append(answerHtml);
    });

    // Delegar evento para remover pergunta
    $('#editQuestionsContainer').on('click', '.removeQuestionBtn', function() {
        const questionId = $(this).data('question-id');
        $(`#question-${questionId}`).remove();
    });

    // Delegar evento para remover resposta
    $('#editQuestionsContainer').on('click', '.removeAnswerBtn', function() {
        $(this).closest('.answer').remove();
    });

    // Submeter o formulário para editar quiz
    $('#editQuizForm').submit(function(event) {
        event.preventDefault();

        const quizId = $('#quizId').val();
        const quizName = $('#editQuizName').val();
        const questions = [];

        $('#editQuestionsContainer .card').each(function() {
            const questionId = $(this).attr('id').split('-')[1];
            const questionText = $(`#questionText-${questionId}`).val();
            const answers = [];

            $(`#question-${questionId} .answer`).each(function() {
                const answerId = $(this).find('input[type="text"]').attr('id').split('-')[2];
                const answerText = $(this).find('input[type="text"]').val();
                const isTrue = $(this).find('input[type="checkbox"]').is(':checked');

                answers.push({
                    answer: answerText,
                    isTrue: isTrue
                });
            });

            questions.push({
                question: questionText,
                answers: answers
            });
        });

        const quizData = {
            quizName: quizName,
            questions: questions
        };
        console.log('Data sent for editing:', quizData); 
        // Enviar o quiz atualizado para o backend
        $.ajax({
            url: `/api/quiz/edit/${quizId}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(quizData),
            success: function(response) {
                alert(response.message);
                window.close();
            },
            error: function(xhr) {
                alert('Erro ao editar o quiz: ' + xhr.responseJSON.error);
            }
        });
    });
    $('#deleteQuizBtn').click(function() {
        const quizId = $('#quizId').val();
        if (confirm('Are you sure you want to delete this quiz?')) {
            $.ajax({
                url: `/api/quiz/delete/${quizId}`,
                method: 'DELETE',
                success: function(response) {
                    alert(response.message);
                    window.close();
                },
                error: function(xhr) {
                    alert('Error to delete the quiz: ' + xhr.responseJSON.error);
                }
            });
        }
    });
    // Cancelar edição
    $('#cancelEditBtn').click(function() {
        window.close();
    });
});
