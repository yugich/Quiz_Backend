$(document).ready(function() {
    let questionCount = 0;

    // Carregar os quizzes existentes ao carregar a página
    loadQuizzes();

    // Abrir o modal ao clicar no botão "Create Quiz"
    $('#createQuizBtn').click(function() {
        $('#createQuizModal').modal('show');
    });

    // Adicionar nova pergunta
    $('#addQuestionBtn').click(function() {
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
        $('#questionsContainer').append(questionHtml);
    });

    // Delegar evento para adicionar resposta
    $('#questionsContainer').on('click', '.addAnswerBtn', function() {
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
    $('#questionsContainer').on('click', '.removeQuestionBtn', function() {
        const questionId = $(this).data('question-id');
        $(`#question-${questionId}`).remove();
    });

    // Delegar evento para remover resposta
    $('#questionsContainer').on('click', '.removeAnswerBtn', function() {
        $(this).closest('.answer').remove();
    });

    // Submeter o formulário para criar quiz
    $('#quizForm').submit(function(event) {
        event.preventDefault();

        const quizName = $('#quizName').val();
        const questions = [];

        $('#questionsContainer .card').each(function() {
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
        console.log('Data sent for creation:', quizData);
        // Enviar o quiz para o backend
        $.ajax({
            url: '/api/quiz/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(quizData),
            success: function(response) {
                alert(response.message);
                $('#createQuizModal').modal('hide');
                $('#quizForm')[0].reset();
                $('#questionsContainer').empty();
                questionCount = 0;
                loadQuizzes();
            },
            error: function(xhr) {
                alert('Error creating quiz: ' + xhr.responseJSON.error);
            }
        });
    });

    // Função para carregar os quizzes existentes
    function loadQuizzes() {
        $.ajax({
            url: '/api/quiz/all',
            method: 'GET',
            success: function(quizzes) {
                $('#quizTableBody').empty();
                quizzes.forEach(function(quiz) {
                    const rowHtml = `
                        <tr>
                            <td>${quiz.id}</td>
                            <td>${quiz.quizName}</td>
                            <td>
                                <button class="btn btn-primary editQuizBtn" data-id="${quiz.id}">Edit</button>
                            </td>
                        </tr>
                    `;
                    $('#quizTableBody').append(rowHtml);
                });
            },
            error: function() {
                alert('Error loading quizzes.');
            }
        });
    }

    // Delegar evento para o botão Edit
    $('#quizTableBody').on('click', '.editQuizBtn', function() {
        const quizId = $(this).data('id');
        window.open(`edit.html?id=${quizId}`, '_blank');
    });

    $('#quizTableBody').on('click', '.deleteQuizBtn', function() {
        const quizId = $(this).data('id');
        if (confirm('Are you sure you want to delete this quiz?')) {
            $.ajax({
                url: `/api/quiz/delete/${quizId}`,
                method: 'DELETE',
                success: function(response) {
                    alert(response.message);
                    loadQuizzes();
                },
                error: function(xhr) {
                    alert('Error deleting quiz: ' + xhr.responseJSON.error);
                }
            });
        }
    });
});
