// Three.js Game Engine Rewrite
const BOARD_SIZE = 800;
const GAP_SIZE = 4;
const CELL_SIZE = (BOARD_SIZE - (14 * GAP_SIZE)) / 15;

// Elements (UI)
const diceContainer = document.getElementById('dice-container');
const diceEl = document.getElementById('dice');
const indicators = {
    red: document.getElementById('indicator-red'),
    green: document.getElementById('indicator-green'),
    yellow: document.getElementById('indicator-yellow'),
    blue: document.getElementById('indicator-blue')
};

// State Machine
const STATE = {
    IDLE: 'IDLE',
    ROLLING: 'ROLLING',
    AWAITING_INPUT: 'AWAITING_INPUT',
    ANIMATING: 'ANIMATING'
};

let gameState = STATE.IDLE;
let currentTurn = 'red'; 
const turns = ['red', 'green', 'yellow', 'blue'];
let currentDiceValue = 0;
let bonusTurn = false;

// Three.js Core
let scene, camera, renderer, raycaster, mouse;
const tokenMeshes = {}; // Map token id to Three.js Object3D
let activeTokenMeshes = []; // Highlighted for input

function initThreeJS() {
    const container = document.getElementById('webgl-container');
    
    scene = new THREE.Scene();
    
    // Camera looking down at an angle
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, 1000, 700);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffee, 0.8);
    dirLight.position.set(200, 1000, 500);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -500;
    dirLight.shadow.camera.right = 500;
    dirLight.shadow.camera.top = 500;
    dirLight.shadow.camera.bottom = -500;
    scene.add(dirLight);

    buildBoard3D();
    spawnTokens3D();

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('pointerdown', onPointerDown, false);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Materials
const matWoodLight = new THREE.MeshLambertMaterial({ color: 0xf5dfba });
const matWoodDark = new THREE.MeshLambertMaterial({ color: 0xc29b62 });
const matBoardBase = new THREE.MeshLambertMaterial({ color: 0xdcb37b });

const colors = {
    red: 0xd32f2f,
    green: 0x388e3c,
    blue: 0x1976d2,
    yellow: 0xfbc02d
};

const mats = {
    red: new THREE.MeshLambertMaterial({ color: colors.red }),
    green: new THREE.MeshLambertMaterial({ color: colors.green }),
    blue: new THREE.MeshLambertMaterial({ color: colors.blue }),
    yellow: new THREE.MeshLambertMaterial({ color: colors.yellow })
};

function get3DCoordinate(r, c) {
    // Convert 0-14 grid to 3D world coordinates centered at 0,0,0
    const offsetX = (c * (CELL_SIZE + GAP_SIZE)) - (BOARD_SIZE / 2) + (CELL_SIZE / 2);
    const offsetZ = (r * (CELL_SIZE + GAP_SIZE)) - (BOARD_SIZE / 2) + (CELL_SIZE / 2);
    return new THREE.Vector3(offsetX, 0, offsetZ);
}

function buildBoard3D() {
    // Main Wooden Base
    const baseGeo = new THREE.BoxGeometry(BOARD_SIZE + 60, 20, BOARD_SIZE + 60);
    const baseMesh = new THREE.Mesh(baseGeo, matBoardBase);
    baseMesh.position.y = -10;
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Inner Dark Wood (Gaps)
    const innerGeo = new THREE.BoxGeometry(BOARD_SIZE, 22, BOARD_SIZE);
    const innerMesh = new THREE.Mesh(innerGeo, new THREE.MeshLambertMaterial({color: 0x6d4c41}));
    innerMesh.position.y = -10;
    scene.add(innerMesh);

    // Create Path Tiles
    const tileGeo = new THREE.BoxGeometry(CELL_SIZE, 10, CELL_SIZE);
    
    // We only create meshes where there is a path or safe zone
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const pathIdx = outerPath.findIndex(p => p.r === r && p.c === c);
            const isRedHome = homePaths.red.some(p => p.r === r && p.c === c);
            const isGreenHome = homePaths.green.some(p => p.r === r && p.c === c);
            const isYellowHome = homePaths.yellow.some(p => p.r === r && p.c === c);
            const isBlueHome = homePaths.blue.some(p => p.r === r && p.c === c);
            
            let mat = matWoodLight;
            if (pathIdx !== -1 && safeZones.includes(pathIdx)) mat = matWoodDark;
            if (isRedHome || pathIdx === 0) mat = mats.red;
            if (isGreenHome || pathIdx === 13) mat = mats.green;
            if (isYellowHome || pathIdx === 26) mat = mats.yellow;
            if (isBlueHome || pathIdx === 39) mat = mats.blue;

            if (pathIdx !== -1 || isRedHome || isGreenHome || isYellowHome || isBlueHome) {
                const mesh = new THREE.Mesh(tileGeo, mat);
                const pos = get3DCoordinate(r, c);
                mesh.position.set(pos.x, 5, pos.z);
                mesh.receiveShadow = true;
                mesh.castShadow = true;
                scene.add(mesh);
            }
        }
    }

    // Build the 4 Large Colored Bases
    createBase3D('red', 3, 3, mats.red);
    createBase3D('green', 3, 12, mats.green);
    createBase3D('blue', 12, 3, mats.blue);
    createBase3D('yellow', 12, 12, mats.yellow);
}

function createBase3D(color, centerR, centerC, material) {
    const baseSize = (6 * CELL_SIZE) + (5 * GAP_SIZE);
    const geo = new THREE.BoxGeometry(baseSize, 12, baseSize);
    const mesh = new THREE.Mesh(geo, material);
    
    const pos = get3DCoordinate(centerR, centerC);
    // Adjust because center is actually slightly off due to even grid size (6x6)
    mesh.position.set(pos.x - (CELL_SIZE/2) - (GAP_SIZE/2), 6, pos.z - (CELL_SIZE/2) - (GAP_SIZE/2));
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
}

function spawnTokens3D() {
    const pawnGeoBase = new THREE.CylinderGeometry(15, 18, 10, 32);
    const pawnGeoNeck = new THREE.CylinderGeometry(8, 12, 15, 32);
    const pawnGeoHead = new THREE.SphereGeometry(12, 32, 16);

    turns.forEach(color => {
        tokens[color].forEach((tok, idx) => {
            const mat = mats[color];
            
            const group = new THREE.Group();
            
            const base = new THREE.Mesh(pawnGeoBase, mat);
            base.position.y = 5;
            base.castShadow = true;
            group.add(base);

            const neck = new THREE.Mesh(pawnGeoNeck, mat);
            neck.position.y = 17.5;
            neck.castShadow = true;
            group.add(neck);

            const head = new THREE.Mesh(pawnGeoHead, mat);
            head.position.y = 30;
            head.castShadow = true;
            group.add(head);

            group.userData = { id: tok.id, color: color, index: idx };
            scene.add(group);
            tokenMeshes[tok.id] = group;

            positionTokenInBase3D(color, idx);
        });
    });
}

function positionTokenInBase3D(color, idx) {
    const mesh = tokenMeshes[tokens[color][idx].id];
    const center = baseCenters[color];
    const basePos = get3DCoordinate(center.r, center.c);
    
    // Offset for the 4 spawn points in a 2x2 grid inside the base
    const offset = (1.5 * CELL_SIZE);
    const xOff = (idx % 2 === 0) ? -offset : offset;
    const zOff = (idx < 2) ? -offset : offset;

    mesh.position.set(basePos.x - (CELL_SIZE/2) + xOff, 12, basePos.z - (CELL_SIZE/2) + zOff);
    mesh.scale.set(1,1,1);
}

// Logic Data
const safeZones = [0, 8, 13, 21, 26, 34, 39, 47];
const tokens = {
    red: [ { id: 'r1', pos: -1, startIdx: 0, homePos: -1 }, { id: 'r2', pos: -1, startIdx: 0, homePos: -1 }, { id: 'r3', pos: -1, startIdx: 0, homePos: -1 }, { id: 'r4', pos: -1, startIdx: 0, homePos: -1 } ],
    green: [ { id: 'g1', pos: -1, startIdx: 13, homePos: -1 }, { id: 'g2', pos: -1, startIdx: 13, homePos: -1 }, { id: 'g3', pos: -1, startIdx: 13, homePos: -1 }, { id: 'g4', pos: -1, startIdx: 13, homePos: -1 } ],
    yellow: [ { id: 'y1', pos: -1, startIdx: 26, homePos: -1 }, { id: 'y2', pos: -1, startIdx: 26, homePos: -1 }, { id: 'y3', pos: -1, startIdx: 26, homePos: -1 }, { id: 'y4', pos: -1, startIdx: 26, homePos: -1 } ],
    blue: [ { id: 'b1', pos: -1, startIdx: 39, homePos: -1 }, { id: 'b2', pos: -1, startIdx: 39, homePos: -1 }, { id: 'b3', pos: -1, startIdx: 39, homePos: -1 }, { id: 'b4', pos: -1, startIdx: 39, homePos: -1 } ]
};
const outerPath = [
    {r:6,c:1}, {r:6,c:2}, {r:6,c:3}, {r:6,c:4}, {r:6,c:5}, {r:5,c:6}, {r:4,c:6}, {r:3,c:6}, {r:2,c:6}, {r:1,c:6}, {r:0,c:6}, {r:0,c:7}, {r:0,c:8}, {r:1,c:8}, {r:2,c:8}, {r:3,c:8}, {r:4,c:8}, {r:5,c:8}, {r:6,c:9}, {r:6,c:10}, {r:6,c:11}, {r:6,c:12}, {r:6,c:13}, {r:6,c:14}, {r:7,c:14}, {r:8,c:14}, {r:8,c:13}, {r:8,c:12}, {r:8,c:11}, {r:8,c:10}, {r:8,c:9}, {r:9,c:8}, {r:10,c:8}, {r:11,c:8}, {r:12,c:8}, {r:13,c:8}, {r:14,c:8}, {r:14,c:7}, {r:14,c:6}, {r:13,c:6}, {r:12,c:6}, {r:11,c:6}, {r:10,c:6}, {r:9,c:6}, {r:8,c:5}, {r:8,c:4}, {r:8,c:3}, {r:8,c:2}, {r:8,c:1}, {r:8,c:0}, {r:7,c:0}
];
const homePaths = {
    red: [ {r:7,c:1}, {r:7,c:2}, {r:7,c:3}, {r:7,c:4}, {r:7,c:5}, {r:7,c:6} ],
    green: [ {r:1,c:7}, {r:2,c:7}, {r:3,c:7}, {r:4,c:7}, {r:5,c:7}, {r:6,c:7} ],
    yellow: [ {r:7,c:13}, {r:7,c:12}, {r:7,c:11}, {r:7,c:10}, {r:7,c:9}, {r:7,c:8} ],
    blue: [ {r:13,c:7}, {r:12,c:7}, {r:11,c:7}, {r:10,c:7}, {r:9,c:7}, {r:8,c:7} ]
};
const baseCenters = { red: {r: 3, c: 3}, green: {r: 3, c: 12}, yellow: {r: 12, c: 12}, blue: {r: 12, c: 3} };

// Interaction
function onPointerDown(event) {
    if (gameState !== STATE.AWAITING_INPUT) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Check intersection with active tokens
    const activeObjects = activeTokenMeshes.map(m => m.children[0]); // Raycast against the base cylinder
    const intersects = raycaster.intersectObjects(activeObjects, false);

    if (intersects.length > 0) {
        const parentGroup = intersects[0].object.parent;
        handleTokenClick(parentGroup.userData.color, parentGroup.userData.index);
    }
}

// UI Setup
diceContainer.addEventListener('click', rollDice);
setTimeout(() => indicators[currentTurn].classList.add('active'), 100);

function rollDice() {
    if (gameState !== STATE.IDLE) return;
    gameState = STATE.ROLLING;
    
    diceEl.classList.add('rolling');
    for(let i=1; i<=6; i++) diceEl.classList.remove(`show-${i}`);

    currentDiceValue = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
        diceEl.classList.remove('rolling');
        diceEl.classList.add(`show-${currentDiceValue}`);
        
        bonusTurn = (currentDiceValue === 6);
        
        if (!hasValidMoves(currentTurn, currentDiceValue)) {
            setTimeout(() => endTurn(false), 800); 
        } else {
            gameState = STATE.AWAITING_INPUT;
            highlightActiveTokens(currentTurn);
        }
    }, 400);
}

function hasValidMoves(color, roll) {
    return tokens[color].some(tok => {
        if (tok.homePos >= 5) return false; 
        if (tok.pos === -1 && roll === 6) return true; 
        if (tok.pos !== -1) {
            const distanceCovered = getDistanceCovered(tok);
            if (distanceCovered + roll <= 56) return true;
        }
        return false;
    });
}

function getDistanceCovered(tok) {
    if (tok.pos === -1) return -1;
    if (tok.homePos !== -1) return 50 + tok.homePos + 1;
    let dist = tok.pos - tok.startIdx;
    if (dist < 0) dist += 52;
    return dist;
}

function highlightActiveTokens(color) {
    activeTokenMeshes = [];
    tokens[color].forEach((tok) => {
        const mesh = tokenMeshes[tok.id];
        let canMove = false;
        
        if (tok.homePos < 5) {
            if (tok.pos === -1 && currentDiceValue === 6) canMove = true;
            else if (tok.pos !== -1) {
                const dist = getDistanceCovered(tok);
                if (dist + currentDiceValue <= 56) canMove = true;
            }
        }
        
        if (canMove) {
            activeTokenMeshes.push(mesh);
            // Bounce animation is handled in the animate loop for active meshes
        }
    });
}

async function handleTokenClick(color, idx) {
    gameState = STATE.ANIMATING;
    activeTokenMeshes = []; // Stop bouncing
    
    const tok = tokens[color][idx];
    
    if (tok.pos === -1) {
        tok.pos = tok.startIdx;
        await moveTokenVisual(tok, 300);
    } else {
        for (let i = 0; i < currentDiceValue; i++) {
            const dist = getDistanceCovered(tok);
            if (dist === 50) {
                tok.pos = -1; 
                tok.homePos = 0;
            } else if (dist > 50) {
                tok.homePos++;
            } else {
                tok.pos = (tok.pos + 1) % 52;
            }
            await moveTokenVisual(tok, 200);
        }
    }
    
    const captured = await checkElimination(tok);
    updateStacking();
    
    if (tok.homePos === 5) {
        bonusTurn = true; 
    }
    
    currentDiceValue = 0;
    endTurn(bonusTurn || captured);
}

function moveTokenVisual(tok, duration = 300) {
    return new Promise(resolve => {
        const mesh = tokenMeshes[tok.id];
        
        let targetX, targetZ;
        if (tok.homePos !== -1) {
            const p = homePaths[tok.id.charAt(0) === 'r' ? 'red' : tok.id.charAt(0) === 'g' ? 'green' : tok.id.charAt(0) === 'y' ? 'yellow' : 'blue'][tok.homePos];
            const coord = get3DCoordinate(p.r, p.c);
            targetX = coord.x; targetZ = coord.z;
        } else {
            const p = outerPath[tok.pos];
            const coord = get3DCoordinate(p.r, p.c);
            targetX = coord.x; targetZ = coord.z;
        }

        // TWEEN animation for physical sliding
        new TWEEN.Tween(mesh.position)
            .to({ x: targetX, z: targetZ }, duration)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(resolve)
            .start();
            
        // Arc jump effect
        const jumpHeight = mesh.position.y + 20;
        new TWEEN.Tween(mesh.position)
            .to({ y: jumpHeight }, duration / 2)
            .easing(TWEEN.Easing.Quadratic.Out)
            .yoyo(true)
            .repeat(1)
            .start();
    });
}

async function checkElimination(movedTok) {
    if (movedTok.homePos !== -1) return false; 
    if (safeZones.includes(movedTok.pos)) return false; 
    
    let captured = false;
    for (let color of turns) {
        if (color === currentTurn) continue;
        for (let i = 0; i < tokens[color].length; i++) {
            const tok = tokens[color][i];
            if (tok.pos === movedTok.pos && tok.homePos === -1) {
                captured = true;
                tok.pos = -1;
                await animateSendBack(tok, color, i);
            }
        }
    }
    return captured;
}

function animateSendBack(tok, color, idx) {
    return new Promise(resolve => {
        const mesh = tokenMeshes[tok.id];
        const center = baseCenters[color];
        const basePos = get3DCoordinate(center.r, center.c);
        
        const offset = (1.5 * CELL_SIZE);
        const xOff = (idx % 2 === 0) ? -offset : offset;
        const zOff = (idx < 2) ? -offset : offset;

        const targetX = basePos.x - (CELL_SIZE/2) + xOff;
        const targetZ = basePos.z - (CELL_SIZE/2) + zOff;
        
        new TWEEN.Tween(mesh.position)
            .to({ x: targetX, y: 12, z: targetZ }, 500)
            .easing(TWEEN.Easing.Back.InOut)
            .onComplete(resolve)
            .start();
    });
}

function updateStacking() {
    const cellMap = {};
    turns.forEach(color => {
        tokens[color].forEach(tok => {
            if (tok.pos === -1 || tok.homePos === 5) return;
            const key = tok.homePos !== -1 ? `h_${color}_${tok.homePos}` : `o_${tok.pos}`;
            if (!cellMap[key]) cellMap[key] = [];
            cellMap[key].push(tok.id);
        });
    });
    
    Object.values(cellMap).forEach(arr => {
        if (arr.length > 1) {
            arr.forEach((id, i) => {
                const mesh = tokenMeshes[id];
                const scale = 0.6;
                const xOffset = i % 2 === 0 ? -8 : 8;
                const zOffset = i < 2 ? -8 : 8;
                
                // Get base cell pos to offset from
                // We'll just shift the mesh slightly if they share a tile
                new TWEEN.Tween(mesh.scale).to({ x: scale, y: scale, z: scale }, 200).start();
                new TWEEN.Tween(mesh.position).to({ 
                    x: mesh.position.x + xOffset, 
                    z: mesh.position.z + zOffset 
                }, 200).start();
            });
        } else if (arr.length === 1) {
            const mesh = tokenMeshes[arr[0]];
            new TWEEN.Tween(mesh.scale).to({ x: 1, y: 1, z: 1 }, 200).start();
        }
    });
}

function endTurn(gotBonus) {
    if (!gotBonus) {
        const currIdx = turns.indexOf(currentTurn);
        currentTurn = turns[(currIdx + 1) % turns.length];
        
        Object.values(indicators).forEach(ind => ind.classList.remove('active'));
        indicators[currentTurn].classList.add('active');
    }
    gameState = STATE.IDLE;
}

// Render Loop
function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);

    // Active tokens hover bounce effect
    const timeSec = time * 0.005;
    activeTokenMeshes.forEach(mesh => {
        // Add a gentle hover
        mesh.position.y = 10 + Math.sin(timeSec) * 5; 
    });

    renderer.render(scene, camera);
}

// Boot up
initThreeJS();
