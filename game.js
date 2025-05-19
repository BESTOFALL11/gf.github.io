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
        // Create flower petals
        const createFlower = (x, y, z) => {
            const flowerGroup = new THREE.Group();
            
            // Create petals
            const petalGeometry = new THREE.CircleGeometry(0.15, 32);
            const petalMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff69b4,
                side: THREE.DoubleSide
            });

            // Create 5 petals in a circle
            for (let i = 0; i < 5; i++) {
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                const angle = (i / 5) * Math.PI * 2;
                petal.position.set(
                    Math.cos(angle) * 0.1,
                    Math.sin(angle) * 0.1,
                    0
                );
                petal.rotation.z = angle;
                flowerGroup.add(petal);
            }

            // Add center of flower
            const centerGeometry = new THREE.CircleGeometry(0.08, 32);
            const centerMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xffff00,
                side: THREE.DoubleSide
            });
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            flowerGroup.add(center);

            // Position the entire flower
            flowerGroup.position.set(x, y, z);
            return flowerGroup;
        };

        // Add flowers along the walls
        for (let i = 0; i < 6; i++) {
            // Left wall flowers
            const leftFlower = createFlower(-4.9, 2, -i * 10 - 5);
            leftFlower.rotation.y = Math.PI / 2;
            this.scene.add(leftFlower);

            // Right wall flowers
            const rightFlower = createFlower(4.9, 2, -i * 10 - 5);
            rightFlower.rotation.y = -Math.PI / 2;
            this.scene.add(rightFlower);
        }

        // Add floating hearts with better shape
        for (let i = 0; i < 20; i++) {
            const heartShape = new THREE.Shape();
            const x = 0, y = 0;
            heartShape.moveTo(x, y);
            heartShape.bezierCurveTo(x + 0.1, y + 0.1, x + 0.2, y + 0.2, x + 0.2, y + 0.3);
            heartShape.bezierCurveTo(x + 0.2, y + 0.4, x + 0.1, y + 0.5, x, y + 0.5);
            heartShape.bezierCurveTo(x - 0.1, y + 0.5, x - 0.2, y + 0.4, x - 0.2, y + 0.3);
            heartShape.bezierCurveTo(x - 0.2, y + 0.2, x - 0.1, y + 0.1, x, y);

            const heartGeometry = new THREE.ShapeGeometry(heartShape);
            const heartMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff69b4,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const heart = new THREE.Mesh(heartGeometry, heartMaterial);
            heart.scale.set(0.2, 0.2, 0.2);
            heart.position.set(
                (Math.random() - 0.5) * 8,
                Math.random() * 4,
                -Math.random() * 50
            );
            heart.userData = {
                speed: 0.02 + Math.random() * 0.02,
                offset: Math.random() * Math.PI * 2
            };
            this.scene.add(heart);
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
                isVisible: true
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
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
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
            this.showModal(door.userData.image);
            // Start timer to close modal
            setTimeout(() => {
                this.closeModal();
                // Hide the current door
                door.visible = false;
                door.userData.isVisible = false;
            }, 3000);
        }
    }

    showModal(imageSrc) {
        const modal = document.getElementById('modal');
        const modalImage = document.getElementById('modalImage');
        modalImage.src = imageSrc;
        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
    }

    showWinEffect(imageSrc) {
        const winEffect = document.getElementById('winEffect');
        const finalImage = document.getElementById('finalImage');
        finalImage.src = imageSrc;
        winEffect.style.display = 'block';
        this.createConfetti();
    }

    createConfetti() {
        const confettiContainer = document.querySelector('.confetti-container');
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confettiContainer.appendChild(confetti);
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
        
        // Update player position and check collisions
        this.updatePlayer();
        
        // Animate floating hearts
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.speed) {
                child.position.y += Math.sin(Date.now() * child.userData.speed + child.userData.offset) * 0.01;
                child.rotation.y += 0.01;
            }
        });

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Wait for DOM to be fully loaded before starting the game
document.addEventListener('DOMContentLoaded', () => {
    // Start the game
    const game = new Game();
}); 