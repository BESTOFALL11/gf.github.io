class Game {
    constructor() {
        // Initialize Three.js first
        this.setupThreeJS();
        
        // Then setup the rest of the game
        this.setupLights();
        this.createCorridor();
        this.createDecorations();
        this.createDoors();
        this.setupPlayer();
        this.setupControls();
        this.setupEventListeners();
        this.setupLoadingScreen();
        
        // Start animation loop
        this.animate();

        // Show joystick for all devices
        document.getElementById('joystick').style.display = 'flex';
    }

    setupThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffe6f2); // Light pink background

        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Add renderer to DOM
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.appendChild(this.renderer.domElement);
        } else {
            console.error('Game canvas element not found!');
            return;
        }

        // Add fog for atmosphere
        this.scene.fog = new THREE.FogExp2(0xffe6f2, 0.02);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupLights() {
        // Ambient light with pink tint
        const ambientLight = new THREE.AmbientLight(0xffe6f2, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);

        // Cute colored point lights along the corridor
        const colors = [0xffb6c1, 0xffc0cb, 0xffd1dc, 0xffe4e1, 0xfff0f5, 0xfff5ee];
        for (let i = 0; i < 6; i++) {
            const pointLight = new THREE.PointLight(colors[i], 0.7, 15);
            pointLight.position.set(0, 2, -i * 10);
            pointLight.castShadow = true;
            this.scene.add(pointLight);

            // Add light glow
            const glowGeometry = new THREE.SphereGeometry(0.5, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: colors[i],
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.copy(pointLight.position);
            this.scene.add(glow);
        }
    }

    createCorridor() {
        const corridorWidth = 10;
        const corridorLength = 100;
        const wallHeight = 5;
        const wallThickness = 0.5; // Thinner walls

        // Floor with cute pattern
        const floorGeometry = new THREE.PlaneGeometry(corridorWidth, corridorLength);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xfff0f5,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.z = -corridorLength / 2; // Centered
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Walls with pastel color
        const wallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, corridorLength);
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffd1dc, // Pastel Pink
            roughness: 0.7,
            metalness: 0.3
        });

        // Left wall
        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.position.set(-corridorWidth / 2 - wallThickness / 2, wallHeight / 2, -corridorLength / 2);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
        rightWall.position.set(corridorWidth / 2 + wallThickness / 2, wallHeight / 2, -corridorLength / 2);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);

        // Add end wall
        const endWallGeometry = new THREE.BoxGeometry(corridorWidth + wallThickness * 2, wallHeight, wallThickness); // Adjusted width to cover ends of side walls
        const endWall = new THREE.Mesh(endWallGeometry, wallMaterial);
        endWall.position.set(0, wallHeight / 2, -corridorLength - wallThickness / 2); // Positioned at the far end
        endWall.castShadow = true;
        endWall.receiveShadow = true;
        this.scene.add(endWall);
    }

    createDecorations() {
        // Improved flowers: fewer, larger, and more stylized
        const createFlower = (x, y, z, color = 0xff69b4) => {
            const flowerGroup = new THREE.Group();
            // Petals
            const petalGeometry = new THREE.CircleGeometry(0.18, 32);
            const petalMaterial = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
            for (let i = 0; i < 5; i++) {
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                const angle = (i / 5) * Math.PI * 2;
                petal.position.set(Math.cos(angle) * 0.13, Math.sin(angle) * 0.13, 0);
                petal.rotation.z = angle;
                flowerGroup.add(petal);
            }
            // Center
            const centerGeometry = new THREE.CircleGeometry(0.09, 32);
            const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff99, side: THREE.DoubleSide });
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            flowerGroup.add(center);
            flowerGroup.position.set(x, y, z);
            return flowerGroup;
        };
        // Place flowers at intervals
        for (let i = 0; i < 6; i++) {
            const color = [0xff69b4, 0x87ceeb, 0xffb347, 0x98fb98, 0xffb6c1, 0xd1b3ff][i % 6];
            const leftFlower = createFlower(-4.7, 1.5, -i * 16 - 5, color);
            leftFlower.rotation.y = Math.PI / 2;
            this.scene.add(leftFlower);
            const rightFlower = createFlower(4.7, 1.5, -i * 16 - 5, color);
            rightFlower.rotation.y = -Math.PI / 2;
            this.scene.add(rightFlower);
        }
        // Add realistic, cute sitting cats with paw-licking animation
        this.cats = [];
        this.catMeowTimers = [];
        this.catMeowAudio = new Audio('assets/meow.mp3');
        const catColors = [0xffb6c1, 0x222222, 0xffe066, 0x87ceeb, 0x98fb98, 0xffb347, 0xffffff];
        for (let i = 0; i < 8; i++) {
            const catGroup = new THREE.Group();
            // Body (rounded, sitting)
            const bodyGeometry = new THREE.SphereGeometry(0.13, 24, 24);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: catColors[i % catColors.length] });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.scale.set(1.1, 1.3, 1.1);
            body.position.set(0, 0.13, 0);
            catGroup.add(body);
            // Head (sphere)
            const headGeometry = new THREE.SphereGeometry(0.09, 24, 24);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 0.27, 0.09);
            catGroup.add(head);
            // Ears (cones)
            const earGeometry = new THREE.ConeGeometry(0.03, 0.07, 8);
            const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
            ear1.position.set(-0.04, 0.36, 0.13);
            ear1.rotation.z = Math.PI / 10;
            catGroup.add(ear1);
            const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
            ear2.position.set(0.04, 0.36, 0.13);
            ear2.rotation.z = -Math.PI / 10;
            catGroup.add(ear2);
            // Tail (curled, torus)
            const tailGeometry = new THREE.TorusGeometry(0.07, 0.015, 8, 24, Math.PI);
            const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
            tail.position.set(0.11, 0.05, -0.07);
            tail.rotation.z = Math.PI / 2;
            catGroup.add(tail);
            // Back paws (spheres)
            const pawGeometry = new THREE.SphereGeometry(0.025, 12, 12);
            const paw1 = new THREE.Mesh(pawGeometry, bodyMaterial);
            paw1.position.set(-0.04, 0.01, 0.07);
            catGroup.add(paw1);
            const paw2 = new THREE.Mesh(pawGeometry, bodyMaterial);
            paw2.position.set(0.04, 0.01, 0.07);
            catGroup.add(paw2);
            // Front left paw (licking paw, will animate)
            const frontPawL = new THREE.Mesh(pawGeometry, bodyMaterial);
            frontPawL.position.set(-0.03, 0.06, 0.13);
            catGroup.add(frontPawL);
            // Front right paw (static)
            const frontPawR = new THREE.Mesh(pawGeometry, bodyMaterial);
            frontPawR.position.set(0.03, 0.03, 0.13);
            catGroup.add(frontPawR);
            // Eyes
            const eyeGeometry = new THREE.SphereGeometry(0.012, 8, 8);
            const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(-0.025, 0.29, 0.16);
            catGroup.add(eye1);
            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(0.025, 0.29, 0.16);
            catGroup.add(eye2);
            // Nose
            const noseGeometry = new THREE.ConeGeometry(0.008, 0.018, 8);
            const noseMaterial = new THREE.MeshBasicMaterial({ color: 0xff8888 });
            const nose = new THREE.Mesh(noseGeometry, noseMaterial);
            nose.position.set(0, 0.28, 0.18);
            nose.rotation.x = Math.PI / 2;
            catGroup.add(nose);
            // Whiskers (lines)
            const whiskerMaterial = new THREE.LineBasicMaterial({ color: 0x222222 });
            const whiskerGeom1 = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-0.02, 0.28, 0.18), new THREE.Vector3(-0.05, 0.28, 0.18)
            ]);
            const whiskerGeom2 = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0.02, 0.28, 0.18), new THREE.Vector3(0.05, 0.28, 0.18)
            ]);
            catGroup.add(new THREE.Line(whiskerGeom1, whiskerMaterial));
            catGroup.add(new THREE.Line(whiskerGeom2, whiskerMaterial));
            // Place cat randomly along the corridor
            catGroup.position.set(
                (Math.random() - 0.5) * 7.5,
                0.09,
                -Math.random() * 90 - 5
            );
            // Animation state
            catGroup.userData = {
                animOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(catGroup);
            this.cats.push(catGroup);
            // Set initial meow timer (random 10-20s)
            this.catMeowTimers.push(10 + Math.random() * 10);
        }
    }

    createDoors() {
        this.doors = [];
        const doorGeometry = new THREE.BoxGeometry(2, 3, 0.2);
        const doorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffb6c1,
            roughness: 0.5,
            metalness: 0.5
        });
        const doorTexts = [
            "The twoo pookers",
            "Roundookers",
            "Elevookers",
            "Smookers",
            "Hotookers",
            "LARRY"
        ];
        // Create 6 doors
        for (let i = 0; i < 6; i++) {
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(0, 1.5, -i * 10 - 5);
            door.castShadow = true;
            door.receiveShadow = true;
            door.userData = {
                isLast: i === 5,
                image: `assets/door${i + 1}.jpg`,
                isOpen: false,
                isVisible: true,
                text: doorTexts[i]
            };
            this.scene.add(door);
            this.doors.push(door);
        }
    }

    setupPlayer() {
        this.player = {
            position: new THREE.Vector3(0, 1.6, 0),
            speed: 0.1,
            rotation: 0,
            rotationSpeed: 0.02
        };
        this.camera.position.copy(this.player.position);
    }

    setupControls() {
        this.joystick = {
            element: document.getElementById('joystick'),
            knob: document.querySelector('.joystick-knob'),
            active: false,
            x: 0,
            y: 0
        };
    }

    setupEventListeners() {
        // Joystick controls
        this.joystick.knob.addEventListener('mousedown', (e) => this.handleJoystickStart(e));
        this.joystick.knob.addEventListener('touchstart', (e) => this.handleJoystickStart(e));
        
        window.addEventListener('mousemove', (e) => this.handleJoystickMove(e));
        window.addEventListener('touchmove', (e) => this.handleJoystickMove(e));
        
        window.addEventListener('mouseup', () => this.handleJoystickEnd());
        window.addEventListener('touchend', () => this.handleJoystickEnd());

        // Modal close button
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
            this.disableMovement = false;
        });
    }

    handleJoystickStart(e) {
        e.preventDefault();
        this.joystick.active = true;
    }

    handleJoystickMove(e) {
        if (!this.joystick.active) return;
        e.preventDefault();

        const rect = this.joystick.element.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        if (clientX === undefined || clientY === undefined) return; // Check if clientX/Y are valid

        let x = clientX - rect.left - rect.width / 2;
        let y = clientY - rect.top - rect.height / 2;

        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = rect.width / 2;
        if (distance > maxDistance) {
            x = (x / distance) * maxDistance;
            y = (y / distance) * maxDistance;
        }

        // Joystick X for rotation, Joystick Y for forward/backward (inverted)
        this.joystick.x = x / maxDistance; 
        this.joystick.y = -y / maxDistance; // Inverted: up on joystick is positive y, meaning forward

        this.joystick.knob.style.transform = `translate(${x}px, ${y}px)`;
    }

    handleJoystickEnd() {
        this.joystick.active = false;
        this.joystick.x = 0;
        this.joystick.y = 0;
        this.joystick.knob.style.transform = 'translate(0, 0)';
    }

    updatePlayer() {
        if (this.disableMovement || this.modalOpen) return;
        // Update player position based on joystick input
        const moveSpeed = this.player.speed;
        const rotationSpeed = this.player.rotationSpeed;

        // Player Rotation (turning) from joystick X
        this.player.rotation -= this.joystick.x * rotationSpeed; 

        // Calculate movement direction based on current rotation
        const moveDirection = new THREE.Vector3(
            Math.sin(this.player.rotation),
            0,
            Math.cos(this.player.rotation)
        );

        // Forward/backward movement from joystick Y (inverted: up on joystick is forward)
        const moveAmount = this.joystick.y * moveSpeed;
        this.player.position.addScaledVector(moveDirection, moveAmount);

        // Keep player within bounds
        const corridorWidth = 10; // Should match createCorridor
        const playerRadius = 0.5; // Approximate player size for collision
        this.player.position.x = Math.max(-corridorWidth / 2 + playerRadius, Math.min(corridorWidth / 2 - playerRadius, this.player.position.x));
        // Z bounds: from 0 (start) to -corridorLength (e.g., -100), allowing for door positions. Max depth could be -98 or so.
        this.player.position.z = Math.max(-98, Math.min(0, this.player.position.z));


        // Update camera position and rotation
        this.camera.position.copy(this.player.position);
        this.camera.rotation.y = this.player.rotation;

        // Check for door collisions
        this.checkDoorCollisions();
    }

    checkDoorCollisions() {
        for (const door of this.doors) {
            if (door.userData.isVisible && !door.userData.isOpen && this.isNearDoor(door)) {
                this.openDoor(door);
                break;
            }
        }
    }

    isNearDoor(door) {
        const distance = this.player.position.distanceTo(door.position);
        return distance < 2;
    }

    openDoor(door) {
        if (door.userData.isOpen) return; // Prevent multiple triggers
        door.userData.isOpen = true;
        door.rotation.y = Math.PI / 2;
        if (door.userData.isLast) {
            this.showWinEffect(door.userData.image);
        } else {
            this.showModal(door.userData.image, door.userData.text);
            this.disableMovement = true;
            // No timer: only close on button
        }
    }

    showModal(imageSrc, text) {
        const modal = document.getElementById('modal');
        const modalImage = document.getElementById('modalImage');
        let modalText = document.getElementById('modalText');
        if (!modalText) {
            modalText = document.createElement('div');
            modalText.id = 'modalText';
            modalText.style.marginTop = '10px';
            modalText.style.fontSize = '1.5em';
            modalText.style.color = '#ff69b4';
            modalText.style.fontWeight = 'bold';
            modalText.style.textShadow = '0 2px 8px #fff, 0 0 10px #ffb6c1';
            modalImage.parentNode.insertBefore(modalText, modalImage.nextSibling);
        }
        modalImage.src = imageSrc;
        modalText.textContent = text || '';
        modal.style.display = 'block';
        this.modalOpen = true;
    }

    closeModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
        this.modalOpen = false;
    }

    showWinEffect(imageSrc) {
        const winEffect = document.getElementById('winEffect');
        const finalImage = document.getElementById('finalImage');
        finalImage.src = imageSrc;
        winEffect.style.display = 'block';
        // Animate modal (scale/fade-in)
        finalImage.style.transform = 'scale(0.7)';
        finalImage.style.opacity = '0';
        setTimeout(() => {
            finalImage.style.transition = 'transform 0.7s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.7s';
            finalImage.style.transform = 'scale(1)';
            finalImage.style.opacity = '1';
        }, 10);
        // Change the win text to 'LARRY'
        const winText = winEffect.querySelector('h2');
        if (winText) winText.textContent = 'LARRY';
        // Show heart overlay
        const heartOverlay = document.getElementById('heartOverlay');
        if (heartOverlay) {
            heartOverlay.innerHTML = '';
            heartOverlay.style.display = 'block';
            for (let i = 0; i < 40; i++) {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.style.left = Math.random() * 100 + 'vw';
                heart.style.animationDelay = (Math.random() * 2) + 's';
                heart.innerHTML = `<svg viewBox="0 0 32 29.6"><path fill="#ff69b4" d="M23.6,0c-2.6,0-5,1.3-6.6,3.3C15.4,1.3,13,0,10.4,0C4.7,0,0,4.7,0,10.4c0,6.1,5.1,11.1,12.8,18.2l2.2,2l2.2-2C26.9,21.5,32,16.5,32,10.4C32,4.7,27.3,0,23.6,0z"/></svg>`;
                heartOverlay.appendChild(heart);
            }
            setTimeout(() => {
                heartOverlay.style.display = 'none';
            }, 5000);
        }
    }

    setupLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progress = document.querySelector('.progress');
        
        // Simulate loading progress
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                loadingScreen.style.display = 'none';
            } else {
                width++;
                progress.style.width = width + '%';
            }
        }, 30);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        // Animate cats
        if (this.cats) {
            const t = Date.now() * 0.002;
            for (let i = 0; i < this.cats.length; i++) {
                const cat = this.cats[i];
                // Paw licking animation (front left paw moves up and down, head tilts)
                if (cat.children[7]) {
                    cat.children[7].position.y = 0.06 + Math.abs(Math.sin(t * 2 + cat.userData.animOffset)) * 0.04;
                    cat.children[7].position.x = -0.03 + Math.sin(t * 2 + cat.userData.animOffset) * 0.01;
                }
                if (cat.children[1]) {
                    cat.children[1].rotation.z = Math.sin(t * 2 + cat.userData.animOffset) * 0.18;
                }
                // Meow timer
                this.catMeowTimers[i] -= 0.016;
                if (this.catMeowTimers[i] <= 0) {
                    if (this.catMeowAudio) {
                        this.catMeowAudio.currentTime = 0;
                        this.catMeowAudio.play();
                    }
                    this.catMeowTimers[i] = 10 + Math.random() * 10;
                }
            }
        }
        // Update player position and check collisions
        this.updatePlayer();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Wait for DOM to be fully loaded before starting the game
document.addEventListener('DOMContentLoaded', () => {
    // Start the game
    const game = new Game();
}); 