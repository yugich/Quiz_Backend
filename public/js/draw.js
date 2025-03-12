$(document).ready(function() {
    let animationInterval;
    let fireworks;

    // Function to start the slot machine animation
    function startSlotMachine() {
        const slotMachine = $('#slotMachine');
        animationInterval = setInterval(() => {
            const randomNum = Math.floor(10000 + Math.random() * 90000); // Generate random number between 10000 and 99999
            slotMachine.text(randomNum);
        }, 100); // Update every 100ms
    }

    // Function to stop the slot machine animation and display the winning number
    function stopSlotMachine(winningNumber) {
        clearInterval(animationInterval);
        $('#slotMachine').text(winningNumber);
    }

    // Function to show fireworks animation and then execute a callback after results are shown
    function showFireworks(callback) {
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
            if (callback) callback();
        }, 3000); // Show result after 3 seconds of fireworks
    }

    function render3DText(text) {
        // Get the container for 3D rendering and clear previous content
        const container = document.getElementById('threeContainer');
        container.innerHTML = '';
    
        // Create a new Three.js scene
        const scene = new THREE.Scene();
    
        // Create a perspective camera
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
        camera.position.set(0, 0, 100);
    
        // Create a WebGL renderer with transparent background
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
    
        // Load font and create text geometry
        const loader = new THREE.FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
            const geometry = new THREE.TextGeometry(text, {
                font: font,
                size: 20,
                height: 2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.5,
                bevelSize: 0.5,
                bevelOffset: 0,
                bevelSegments: 5
            });
            geometry.center();
    
            // Create a material for the text mesh
            const material = new THREE.MeshPhongMaterial({ color: 0x00ffcc });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
    
            // Add ambient and directional light for 3D effect
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
    
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(0, 1, 1);
            scene.add(directionalLight);
    
            // Create a particle system to add a shining effect around the text
            const particleCount = 500;
            const particleGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const radius = 25;
            for (let i = 0; i < particleCount; i++) {
                // Generate a random position on a sphere
                const theta = Math.random() * 2 * Math.PI;
                const phi = Math.acos(2 * Math.random() - 1);
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.sin(phi) * Math.sin(theta);
                const z = radius * Math.cos(phi);
                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;
            }
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
            const particleMaterial = new THREE.PointsMaterial({
                color: 0xb51ac1,
                size: 5,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            const particles = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(particles);
    
            // Animation loop with oscillatory (bounce) rotation for the text and subtle particle movement
            function animate() {
                requestAnimationFrame(animate);
                // Calculate oscillatory rotation (bounce) using a sine function;
                // The text oscillates between -0.1 and 0.1 radians.
                const t = Date.now() * 0.001;
                mesh.rotation.y = 0.1 * Math.sin(t);
    
                // Animate particles with very subtle movement
                const positions = particleGeometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += 0.05 * Math.sin(t + i);
                    positions[i + 1] += 0.05 * Math.cos(t + i);
                    positions[i + 2] += 0.05 * Math.sin(t + i);
                }
                particleGeometry.attributes.position.needsUpdate = true;
    
                renderer.render(scene, camera);
            }
            animate();
        });
    }
    
    

    $('#drawForm').submit(function(e) {
        e.preventDefault();
        const drawDate = $('#drawDate').val();
        let minScore = $('#minScore').val();

        if (!drawDate) {
            alert('Por favor, selecione uma data para o sorteio.');
            return;
        }

        // Set default value of minScore to 0 if not provided
        if (minScore === '') {
            minScore = 0;
        }

        $('#interfaceContainer').hide();
        $('#animationContainer').show();
        $('#drawResult').hide();

        // Start slot machine animation
        startSlotMachine();

        // Wait 5 seconds, then request the draw result with minScore parameter
        setTimeout(function() {
            $.ajax({
                url: `/api/users/draw?date=${drawDate}&minScore=${minScore}`,
                method: 'GET',
                success: function(data) {
                    stopSlotMachine(data.luckyNumber);
                    $('#luckyNumber').text(data.luckyNumber);
                    
                    // Check email value and show/hide email fields accordingly
                    if (data.email === "email") {
                        $('#winnerEmail').closest('p').hide();
                        $('#toggleEmailBtn').hide();
                    } else {
                        $('#winnerEmail').text(data.email).hide();
                        $('#toggleEmailBtn').show();
                    }

                    // Show fireworks then render 3D text after the container is visible
                    showFireworks(function() {
                        render3DText(data.name);
                    });
                },
                error: function(err) {
                    console.error('Erro ao realizar o sorteio:', err);
                    $('#interfaceContainer').show();
                }
            });
        }, 5000); // Duration of the animation in milliseconds
    });

    // Toggle email visibility on button click
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
