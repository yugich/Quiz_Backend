$(document).ready(function() {
    let animationInterval;
    let fireworks;

    function startSlotMachine() {
        const slotMachine = $('#slotMachine');
        animationInterval = setInterval(() => {
            const randomNum = Math.floor(10000 + Math.random() * 90000); // Número aleatório de 100 a 999
            slotMachine.text(randomNum);
        }, 100); // Atualiza o número a cada 100 ms
    }

    function stopSlotMachine(winningNumber) {
        clearInterval(animationInterval);
        $('#slotMachine').text(winningNumber);
    }

    function showFireworks() {
        const container = document.querySelector('.fireworks');
        fireworks = new Fireworks.default(container, {
            speed: 2,
            acceleration: 1.05,
            friction: 0.97,
            gravity: 1.5,
            particles: 150,
            trace: 3,
            explosion: 5
        });
        fireworks.start();

        setTimeout(() => {
            fireworks.stop();
            $('#drawResult').show();
        }, 3000); // Mostra o resultado após 3 segundos de fogos de artifício
    }

    $('#drawForm').submit(function(e) {
        e.preventDefault();
        let drawDate = $('#drawDate').val();

        if (!drawDate) {
            alert('Por favor, selecione uma data para o sorteio.');
            return;
        }

        $('#interfaceContainer').hide();
        $('#animationContainer').show();
        $('#drawResult').hide();

        // Inicia a animação da slot machine
        startSlotMachine();

        // Aguarda 5 segundos, então exibe o resultado
        setTimeout(function() {
            $.ajax({
                url: `/api/users/draw?date=${drawDate}`,
                method: 'GET',
                success: function(data) {
                    stopSlotMachine(data.luckyNumber);
                    $('#luckyNumber').text(data.luckyNumber);
                    $('#winnerName').text(data.name);
                    $('#winnerEmail').text(data.email).hide();

                    showFireworks();
                },
                error: function(err) {
                    console.error('Erro ao realizar o sorteio:', err);
                    $('#interfaceContainer').show();
                }
            });
        }, 5000); // Duração da animação em milissegundos
    });

    // Botão para mostrar/ocultar o email
    $('#toggleEmailBtn').click(function() {
        let emailSpan = $('#winnerEmail');
        if (emailSpan.is(':visible')) {
            emailSpan.hide();
            $(this).text('Mostrar E-mail');
        } else {
            emailSpan.show();
            $(this).text('Ocultar E-mail');
        }
    });
});
