// dashboard.js

$(document).ready(function() {

    // Função para carregar o gráfico de registros mensais
    function loadRegistrationChart() {
        $.ajax({
            url: '/api/users',
            method: 'GET',
            success: function(data) {
                let monthlyCounts = Array(12).fill(0);

                data.forEach(user => {
                    let date = new Date(user.timeStamp);
                    let month = date.getMonth(); // 0-11
                    monthlyCounts[month]++;
                });

                let ctx = document.getElementById('registrationChart').getContext('2d');

                let registrationChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                        datasets: [{
                            label: 'Registros por Mês',
                            data: monthlyCounts,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    precision:0
                                }
                            }]
                        }
                    }
                });
            },
            error: function(err) {
                console.error('Erro ao carregar os dados do gráfico:', err);
            }
        });
    }

    // Carregar o gráfico ao iniciar
    loadRegistrationChart();

    // Função para obter a data de início da semana atual (domingo)
    function getStartOfWeek() {
        let now = new Date();
        let dayOfWeek = now.getDay(); // 0 (Domingo) - 6 (Sábado)
        let start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        return start.toISOString().split('T')[0];
    }

    // Função para obter a data de fim da semana atual (sábado)
    function getEndOfWeek() {
        let now = new Date();
        let dayOfWeek = now.getDay();
        let end = new Date(now);
        end.setDate(now.getDate() + (6 - dayOfWeek));
        end.setHours(23, 59, 59, 999);
        return end.toISOString().split('T')[0];
    }

    // Filtrar usuários por data
    $('#dateFilterForm').submit(function(e) {
        e.preventDefault();

        let startDate = $('#startDate').val();
        let endDate = $('#endDate').val();

        // Se nenhuma data for fornecida, usar as datas da semana atual
        if (!startDate || !endDate) {
            startDate = getStartOfWeek();
            endDate = getEndOfWeek();
        }

        $.ajax({
            url: `/api/users?startDate=${startDate}&endDate=${endDate}`,
            method: 'GET',
            success: function(data) {
                let tbody = $('#userTable tbody');
                tbody.empty();

                data.forEach(user => {
                    let row = `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.score}</td>
                            <td>${new Date(user.timeStamp).toLocaleDateString()}</td>
                        </tr>
                    `;
                    tbody.append(row);
                });
            },
            error: function(err) {
                console.error('Erro ao filtrar usuários:', err);
            }
        });
    });

    // Buscar usuário por nome ou email
    $('#searchInput').on('input', function() {
        let query = $(this).val().toLowerCase();

        if (!query) {
            $('#searchResultsTable tbody').empty();
            return;
        }

        $.ajax({
            url: '/api/users/all',
            method: 'GET',
            success: function(data) {
                let tbody = $('#searchResultsTable tbody');
                tbody.empty();

                data.forEach(user => {
                    if (user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)) {
                        let row = `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>${user.score}</td>
                                <td>${new Date(user.timeStamp).toLocaleDateString()}</td>
                            </tr>
                        `;
                        tbody.append(row);
                    }
                });
            },
            error: function(err) {
                console.error('Erro ao buscar usuários:', err);
            }
        });
    });

    // Função para carregar o ranking de pontuação
    function loadScoreRanking(startDate, endDate) {
        let url = '/api/users/all';

        if (startDate && endDate) {
            url = `/api/users?startDate=${startDate}&endDate=${endDate}`;
        }

        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                // Ordena por score decrescente
                data.sort((a, b) => b.score - a.score);

                let tbody = $('#scoreRankingTable tbody');
                tbody.empty();

                data.forEach((user, index) => {
                    let row = `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${user.name}</td>
                            <td class="email-column">${user.email}</td>
                            <td>${user.score}</td>
                        </tr>
                    `;
                    tbody.append(row);
                });
            },
            error: function(err) {
                console.error('Erro ao carregar o ranking de pontuação:', err);
            }
        });
    }

    // Carregar ranking ao iniciar
    loadScoreRanking();

    // Filtrar ranking por data
    $('#scoreFilterForm').submit(function(e) {
        e.preventDefault();

        let startDate = $('#scoreStartDate').val();
        let endDate = $('#scoreEndDate').val();

        // Se nenhuma data for fornecida, carregar todos os usuários
        loadScoreRanking(startDate, endDate);
    });

    // Mostrar/Ocultar coluna de e-mail no ranking
    $('#toggleEmailBtn').click(function() {
        $('.email-column').toggle();
    });

    // Ao carregar a página, ocultar a coluna de e-mail se necessário
    let emailVisible = true;
    $('#toggleEmailBtn').click(function() {
        emailVisible = !emailVisible;
        if (emailVisible) {
            $(this).text('Ocultar E-mail');
        } else {
            $(this).text('Mostrar E-mail');
        }
    });

});
