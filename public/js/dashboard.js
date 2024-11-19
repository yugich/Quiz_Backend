// dashboard.js

$(document).ready(function() {

    // Variáveis para o gráfico, o mês e o ano atuais
    let registrationChart;
    let currentMonth = new Date().getMonth(); // Mês atual (0-11)
    let currentYear = new Date().getFullYear(); // Ano atual

    // Função para atualizar o texto do mês e ano no topo
    function updateMonthLabel() {
        const monthName = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        $('#currentMonth').text(monthName.charAt(0).toUpperCase() + monthName.slice(1)); // Capitaliza o mês
    }

    // Função para carregar o gráfico de registros diários
    function loadRegistrationChart(month = currentMonth, year = currentYear) {
        $.ajax({
            url: '/api/users',
            method: 'GET',
            success: function(data) {
                let daysInMonth = new Date(year, month + 1, 0).getDate();
                let dailyCounts = Array(daysInMonth).fill(0);

                data.forEach(user => {
                    let date = new Date(user.timeStamp);
                    if (date.getMonth() === month && date.getFullYear() === year) {
                        let day = date.getDate() - 1; // Dia do mês (1-31), ajustado para índice 0
                        dailyCounts[day]++;
                    }
                });

                let labels = Array.from({length: daysInMonth}, (_, i) => (i + 1).toString());

                let ctx = document.getElementById('registrationChart').getContext('2d');

                if (registrationChart) {
                    registrationChart.destroy();
                }

                registrationChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: `Registros em ${new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`,
                            data: dailyCounts,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: {
                                    autoSkip: false
                                }
                            },
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    precision: 0
                                }
                            }
                        }
                    }
                });
            },
            error: function(err) {
                console.error('Erro ao carregar os dados do gráfico:', err);
            }
        });
    }

    // Inicializar o gráfico e exibir o mês atual ao iniciar
    updateMonthLabel();
    loadRegistrationChart();

    // Funções para navegar entre os meses
    $('#prevMonthBtn').click(function() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        updateMonthLabel();
        loadRegistrationChart(currentMonth, currentYear);
    });

    $('#nextMonthBtn').click(function() {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        updateMonthLabel();
        loadRegistrationChart(currentMonth, currentYear);
    });

    // Função para obter a data de início da semana atual (domingo)
    function getStartOfWeek() {
        let now = new Date();
        let dayOfWeek = now.getDay();
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
        let url = '/api/users/ranking';

        if (startDate && endDate) {
            url = `/api/users?startDate=${startDate}&endDate=${endDate}`;
        }

        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
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

    // Função para exportar dados para um arquivo XLSX
    function exportToXlsx(data, filename = 'usuarios.xlsx') {
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Aplicar estilo de quebra de linha para todas as células
        Object.keys(worksheet).forEach(cell => {
            if (cell[0] === '!') return; // Ignorar metadados do SheetJS
            worksheet[cell].s = {
                alignment: {
                    wrapText: true, // Quebra de linha automática
                    vertical: 'top',
                    horizontal: 'left',
                }
            };
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuários');
        XLSX.writeFile(workbook, filename);
    }

    // Função para processar extrasInformation
    function processExtrasInformation(info) {
        let result = { 'Informações Extras': '' };

        if (typeof info === 'string') {
            try {
                const parsedJson = JSON.parse(info.split('\n').pop()); // Tenta parsear o JSON após o último '\n'
                result['Informações Extras'] = info.split('\n')[0]; // Parte textual antes do JSON

                // Adiciona chaves do JSON, ignorando conflitos
                Object.entries(parsedJson).forEach(([key, value]) => {
                    if (!result[key]) {
                        if (Array.isArray(value)) {
                            // Formata listas como itens numerados
                            result[key] = value.map((item, index) => `(${index + 1}) ${JSON.stringify(item, null, 2)}`).join('\n');
                        } else {
                            result[key] = value;
                        }
                    }
                });
            } catch (e) {
                // Se não for JSON, mantém como texto completo
                result['Informações Extras'] = info;
            }
        } else {
            result['Informações Extras'] = info;
        }

        return result;
    }

    // Evento para exportar dados ao clicar no botão
    $('#exportXlsxBtn').click(function () {
        const startDate = $('#startDate').val();
        const endDate = $('#endDate').val();

        if (!startDate || !endDate) {
            alert('Por favor, selecione um intervalo de datas antes de exportar.');
            return;
        }

        $.ajax({
            url: `/api/users?startDate=${startDate}&endDate=${endDate}`,
            method: 'GET',
            success: function (data) {
                // Preparação dos dados para exportação
                let exportData = [];
                data.forEach(user => {
                    let baseInfo = {
                        Nome: user.name,
                        Email: user.email,
                        Score: user.score,
                        'Número da Sorte': user.luckyNumber || '',
                        'Data de Registro': new Date(user.timeStamp).toLocaleDateString(),
                    };

                    let processedExtras = processExtrasInformation(user.extrasInformation);

                    // Adiciona apenas colunas únicas
                    Object.entries(processedExtras).forEach(([key, value]) => {
                        if (!baseInfo[key]) {
                            baseInfo[key] = value;
                        }
                    });

                    exportData.push(baseInfo);
                });

                exportToXlsx(exportData);
            },
            error: function (err) {
                console.error('Erro ao exportar os dados:', err);
                alert('Erro ao exportar dados. Por favor, tente novamente.');
            }
        });
    });

});
