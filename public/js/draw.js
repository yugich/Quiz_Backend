// draw.js

$(document).ready(function() {

    let scene, camera, renderer, animationId;
    let cards = [];
    let shuffling = true;

    function initThreeJS() {
        const canvas = document.getElementById('animationCanvas');

        // Configuração básica da cena
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / 400, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        renderer.setSize(canvas.clientWidth, 400);

        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        // Criar baralho de cartas
        const cardWidth = 2;
        const cardHeight = 3;
        const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);

        const numberOfCards = 20; // Número de cartas a serem exibidas

        for (let i = 0; i < numberOfCards; i++) {
            // Gerar uma cor aleatória
            const randomColor = Math.random() * 0xffffff;
            const backMaterial = new THREE.MeshBasicMaterial({ color: randomColor }); // Cor aleatória para cada carta

            const card = new THREE.Mesh(cardGeometry, backMaterial);

            // Empilha as cartas com leve deslocamento
            card.position.set(0, 0, -i * 0.01);
            scene.add(card);
            cards.push(card);
        }

        camera.position.z = 7;

        animate();
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        if (shuffling) {
            // Animação de embaralhamento
            cards.forEach((card, index) => {
                // Rotação aleatória
                card.rotation.y += 0.1 * Math.random();
                card.rotation.z += 0.1 * Math.random();

                // Movimentação aleatória
                card.position.x += 0.1 * (Math.random() - 0.5);
                card.position.y += 0.1 * (Math.random() - 0.5);
                card.position.z += 0.1 * (Math.random() - 0.5);

                // Limites para manter as cartas na cena
                if (card.position.x > 5) card.position.x = 5;
                if (card.position.x < -5) card.position.x = -5;
                if (card.position.y > 5) card.position.y = 5;
                if (card.position.y < -5) card.position.y = -5;
            });
        }

        renderer.render(scene, camera);
    }

    function stopAnimation() {
        cancelAnimationFrame(animationId);
        shuffling = false;
        // Limpa a cena
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
        renderer.dispose();
    }

    $('#drawForm').submit(function(e) {
        e.preventDefault();

        let drawDate = $('#drawDate').val();

        if (!drawDate) {
            alert('Por favor, selecione uma data para o sorteio.');
            return;
        }

        // Esconde o formulário e mostra a animação
        $('#drawForm').hide();
        $('#drawResult').hide();
        $('#animationContainer').show();

        // Inicia a animação
        initThreeJS();

        // Após 3 segundos, realiza o sorteio
        setTimeout(function() {
            // Para a animação
            stopAnimation();
            $('#animationContainer').hide();

            // Faz a requisição AJAX para obter o resultado do sorteio
            $.ajax({
                url: `/api/users/draw?date=${drawDate}`,
                method: 'GET',
                success: function(data) {
                    $('#luckyNumber').text(data.luckyNumber);
                    $('#winnerName').text(data.name);
                    $('#winnerEmail').text(data.email);

                    // Esconde o email e configura o botão
                    $('#winnerEmail').hide();
                    $('#toggleEmailBtn').text('Mostrar E-mail');

                    $('#drawResult').show();
                },
                error: function(err) {
                    console.error('Erro ao realizar o sorteio:', err);
                    if (err.status === 404) {
                        alert('Nenhum usuário encontrado para a data selecionada.');
                    } else {
                        alert('Ocorreu um erro ao realizar o sorteio.');
                    }
                    // Mostra novamente o formulário
                    $('#drawForm').show();
                }
            });
        }, 3000); // Tempo da animação em milissegundos (3 segundos)
    });

    // Evento para mostrar/ocultar o email
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
