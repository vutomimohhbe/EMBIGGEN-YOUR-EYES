console.log('Loading Interactive Sky Map...');

let scene, camera, renderer, earth, celestialSphere;
let satellitePoints = [], constellationLines = [], starPoints = [], planetPoints = [];
let currentLat, currentLng, currentLocation;
let lastUpdate = 0;
const UPDATE_INTERVAL = 10000;

// Toggle states
let showStars = true;
let showConstellations = true;
let showSatellites = true;
let showPlanets = true;
let isRotating = true;

// Store objects for click handling
let spaceObjects = new Map();

// Initialize everything
window.addEventListener('DOMContentLoaded', async function() {
    if (typeof THREE === 'undefined') {
        showError('Three.js library failed to load.');
        return;
    }

    try {
        const locationData = await fetch('/get_location').then(r => r.json());
        currentLat = locationData.lat;
        currentLng = locationData.lng;
        currentLocation = locationData.name;
        
        console.log(`Detected location: ${currentLocation} (${currentLat}, ${currentLng})`);
        
        initializeScene();
        initializeControls();
        updateLocationInfo();
        
        await updateAllData();
        setInterval(updateAllData, UPDATE_INTERVAL);
        animate();
        
        hideLoading();
        
    } catch (error) {
        console.error('Initialization failed:', error);
        showError('Failed to initialize: ' + error.message);
    }
});

function initializeScene() {
    const container = document.getElementById('globeViz');
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 0, 400);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000011);
    container.appendChild(renderer.domElement);

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(50, 32, 32);
    const earthTexture = new THREE.TextureLoader().load(
        'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg'
    );
    const earthMaterial = new THREE.MeshPhongMaterial({ 
        map: earthTexture,
        specular: 0x222222,
        shininess: 25
    });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.userData = { name: 'Earth', type: 'planet' };
    scene.add(earth);
    spaceObjects.set(earth, { name: 'Earth', type: 'planet' });

    // Create celestial sphere
    const sphereGeometry = new THREE.SphereGeometry(500, 64, 64);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x000022,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.8
    });
    celestialSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(celestialSphere);

    addStarfield();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(200, 100, 150);
    scene.add(sunLight);

    focusOnLocation(currentLat, currentLng);
}

function addStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    
    for (let i = 0; i < 2000; i++) {
        const radius = 480 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.0,
        sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    celestialSphere.add(stars);
}

function initializeControls() {
    const container = document.getElementById('globeViz');
    
    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        container.style.cursor = 'grabbing';
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };
        
        // Rotate camera
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position);
        
        spherical.theta -= deltaMove.x * 0.01;
        spherical.phi -= deltaMove.y * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    container.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.001;
        camera.position.multiplyScalar(1 + e.deltaY * zoomSpeed);
        camera.lookAt(0, 0, 0);
    });
    
    // Click handler for all objects
    container.addEventListener('click', (e) => {
        if (isDragging) return;
        
        const rect = container.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
            -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        // Check all objects
        let clickedObject = null;
        let minDistance = Infinity;
        
        spaceObjects.forEach((objData, objMesh) => {
            const intersects = objMesh.geometry ? raycaster.intersectObject(objMesh) : [];
            if (intersects.length > 0) {
                const distance = intersects[0].distance;
                if (distance < minDistance) {
                    minDistance = distance;
                    clickedObject = objData;
                }
            }
        });
        
        if (clickedObject) {
            showObjectInfo(clickedObject.name, clickedObject.type);
        }
    });
    
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    const container = document.getElementById('globeViz');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function focusOnLocation(lat, lng) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = 250 * Math.sin(phi) * Math.cos(theta);
    const y = 250 * Math.cos(phi);
    const z = 250 * Math.sin(phi) * Math.sin(theta);
    
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
}

function updateLocationInfo() {
    document.getElementById('locationInfo').textContent = currentLocation;
    document.getElementById('coordinatesInfo').textContent = `${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`;
}

async function updateAllData() {
    const now = Date.now();
    if (now - lastUpdate < UPDATE_INTERVAL - 1000) return;
    
    lastUpdate = now;
    
    try {
        if (showSatellites) await updateSatellites();
        if (showStars || showConstellations) await updateConstellations();
        if (showPlanets) await updatePlanets();
    } catch (error) {
        console.error('Update error:', error);
    }
}

async function updateSatellites() {
    try {
        const response = await fetch(`/get_satellites?lat=${currentLat}&lng=${currentLng}`);
        const satellites = await response.json();
        
        satellitePoints.forEach(sat => scene.remove(sat));
        satellitePoints = [];
        
        if (satellites.length === 0) {
            document.getElementById('satelliteCount').textContent = '0';
            return;
        }
        
        satellites.forEach(satellite => {
            const lat = parseFloat(satellite.satlat) || 0;
            const lng = parseFloat(satellite.satlng) || 0;
            const alt = (parseFloat(satellite.satalt) || 400) / 6371 * 50;
            
            const radius = 50 + alt;
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lng + 180) * (Math.PI / 180);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            
            const satGeometry = new THREE.SphereGeometry(1, 6, 6);
            const satMaterial = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color(0x00FF00),
                transparent: true,
                opacity: 0.8
            });
            
            const satMesh = new THREE.Mesh(satGeometry, satMaterial);
            satMesh.position.set(x, y, z);
            scene.add(satMesh);
            satellitePoints.push(satMesh);
            
            spaceObjects.set(satMesh, {
                name: satellite.satname || 'Satellite',
                type: 'satellite'
            });
        });
        
        document.getElementById('satelliteCount').textContent = satellites.length;
        
    } catch (error) {
        console.error('Satellite update error:', error);
    }
}

async function updatePlanets() {
    try {
        const response = await fetch(`/get_planets?lat=${currentLat}&lng=${currentLng}`);
        const planets = await response.json();
        
        planetPoints.forEach(planet => scene.remove(planet));
        planetPoints = [];
        
        planets.forEach(planet => {
            const position = altAzToPosition(planet.alt, planet.az, 480);
            
            // Different sizes for different objects
            let size = 2;
            if (planet.name === 'Sun') size = 8;
            else if (planet.name === 'Moon') size = 1.5;
            else if (planet.type === 'planet') size = 3;
            
            const planetGeometry = new THREE.SphereGeometry(size, 16, 16);
            const planetMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(planet.color || '#FFFFFF'),
                transparent: true,
                opacity: 0.9
            });
            
            const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
            planetMesh.position.copy(position);
            scene.add(planetMesh);
            planetPoints.push(planetMesh);
            
            spaceObjects.set(planetMesh, {
                name: planet.name,
                type: planet.type,
                info: planet.info
            });
            
            // Add label for planets
            addObjectLabel(planet.name, position);
        });
        
        document.getElementById('planetCount').textContent = planets.length;
        
    } catch (error) {
        console.error('Planet update error:', error);
    }
}

async function updateConstellations() {
    try {
        const response = await fetch(`/get_constellations?lat=${currentLat}&lng=${currentLng}`);
        const constellations = await response.json();
        
        // Clear old objects
        constellationLines.forEach(line => scene.remove(line));
        constellationLines = [];
        
        if (starPoints) {
            starPoints.forEach(star => scene.remove(star));
            starPoints = [];
        }
        
        const allStars = [];
        Object.values(constellations).forEach(constellation => {
            allStars.push(...constellation.stars);
        });
        
        if (allStars.length === 0) {
            document.getElementById('starCount').textContent = '0';
            document.getElementById('constellationCount').textContent = '0';
            return;
        }
        
        // Create stars
        if (showStars) {
            allStars.forEach(star => {
                const position = altAzToPosition(star.alt, star.az, 480);
                
                const starGeometry = new THREE.SphereGeometry(1, 8, 8);
                const brightness = Math.max(0.3, 1.0 - (star.mag * 0.2));
                const starMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(brightness, brightness, 1.0),
                    transparent: true,
                    opacity: 0.8
                });
                
                const starMesh = new THREE.Mesh(starGeometry, starMaterial);
                starMesh.position.copy(position);
                celestialSphere.add(starMesh);
                starPoints.push(starMesh);
                
                spaceObjects.set(starMesh, {
                    name: star.name,
                    type: 'star',
                    constellation: star.constellation
                });
                
                // Add label for bright stars
                if (star.mag < 1.5) {
                    addObjectLabel(star.name, position);
                }
            });
        }
        
        // Create constellation lines
        if (showConstellations) {
            Object.entries(constellations).forEach(([constName, constData]) => {
                if (constData.lines && constData.lines.length > 0) {
                    const starMap = {};
                    constData.stars.forEach(star => {
                        starMap[star.name] = star;
                    });
                    
                    constData.lines.forEach(line => {
                        const fromStar = starMap[line.from];
                        const toStar = starMap[line.to];
                        
                        if (fromStar && toStar) {
                            const fromPos = altAzToPosition(fromStar.alt, fromStar.az, 480);
                            const toPos = altAzToPosition(toStar.alt, toStar.az, 480);
                            
                            const lineGeometry = new THREE.BufferGeometry().setFromPoints([fromPos, toPos]);
                            const lineMaterial = new THREE.LineBasicMaterial({ 
                                color: 0x44ff44, 
                                linewidth: 1,
                                transparent: true,
                                opacity: 0.7
                            });
                            const constellationLine = new THREE.Line(lineGeometry, lineMaterial);
                            
                            celestialSphere.add(constellationLine);
                            constellationLines.push(constellationLine);
                            
                            spaceObjects.set(constellationLine, {
                                name: constName,
                                type: 'constellation'
                            });
                        }
                    });
                }
            });
        }
        
        document.getElementById('starCount').textContent = allStars.length;
        document.getElementById('constellationCount').textContent = Object.keys(constellations).length;
        
    } catch (error) {
        console.error('Constellation update error:', error);
    }
}

function altAzToPosition(alt, az, radius) {
    const altRad = (90 - alt) * (Math.PI / 180);
    const azRad = az * (Math.PI / 180);
    
    return new THREE.Vector3(
        radius * Math.sin(altRad) * Math.cos(azRad),
        radius * Math.sin(altRad) * Math.sin(azRad),
        radius * Math.cos(altRad)
    );
}

function addObjectLabel(name, position) {
    const label = document.createElement('div');
    label.className = 'object-label';
    label.textContent = name;
    label.style.cssText = `
        position: absolute;
        color: white;
        font-size: 11px;
        pointer-events: none;
        z-index: 1000;
        background: rgba(0,0,0,0.7);
        padding: 2px 6px;
        border-radius: 3px;
        white-space: nowrap;
    `;
    
    document.getElementById('globeViz').appendChild(label);
    
    function updateLabelPosition() {
        const vector = position.clone();
        vector.project(camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
        
        if (vector.z < 1) {
            label.style.left = x + 'px';
            label.style.top = y + 'px';
            label.style.display = 'block';
        } else {
            label.style.display = 'none';
        }
    }
    
    label.updatePosition = updateLabelPosition;
}

async function showObjectInfo(objectName, objectType) {
    try {
        const response = await fetch(`/get_info/${objectType}/${encodeURIComponent(objectName)}`);
        const objectInfo = await response.json();
        
        // Also get comments
        const commentsResponse = await fetch(`/get_comments/${encodeURIComponent(objectName)}`);
        const comments = await commentsResponse.json();
        
        showInfoModal(objectName, objectType, objectInfo, comments);
        
    } catch (error) {
        console.error('Error fetching object info:', error);
        showInfoModal(objectName, objectType, {
            title: objectName,
            extract: 'Could not load information.'
        }, []);
    }
}

function showInfoModal(objectName, objectType, objectInfo, comments) {
    const modal = document.getElementById('infoModal');
    const modalContent = document.getElementById('infoModalContent');
    
    let commentsHTML = '';
    if (comments.length > 0) {
        commentsHTML = `
            <div class="comments-section">
                <h4>Community Comments (${comments.length})</h4>
                ${comments.map(comment => `
                    <div class="comment">
                        <div class="comment-header">
                            <strong>${comment.user_name}</strong>
                            <span class="points">${comment.points} points</span>
                        </div>
                        <p>${comment.comment}</p>
                        <div class="comment-actions">
                            <button onclick="voteComment(${comment.id}, 'upvote')">👍</button>
                            <button onclick="voteComment(${comment.id}, 'downvote')">👎</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        commentsHTML = '<p>No comments yet. Be the first to comment!</p>';
    }
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3>${objectInfo.title}</h3>
            <span class="close" onclick="closeModal()">&times;</span>
        </div>
        <div class="modal-body">
            <div class="object-info">
                <p>${objectInfo.extract}</p>
                ${objectInfo.thumbnail ? `<img src="${objectInfo.thumbnail}" alt="${objectInfo.title}" style="max-width: 200px;">` : ''}
            </div>
            
            <div class="add-comment">
                <h4>Add Comment</h4>
                <input type="text" id="commentUserName" placeholder="Your name" style="width: 100%; margin-bottom: 10px; padding: 5px;">
                <textarea id="commentText" placeholder="Your comment..." style="width: 100%; height: 80px; margin-bottom: 10px; padding: 5px;"></textarea>
                <button onclick="addComment('${objectName}', '${objectType}')" style="padding: 8px 15px; background: #4af; color: white; border: none; border-radius: 5px; cursor: pointer;">Post Comment</button>
            </div>
            
            ${commentsHTML}
        </div>
    `;
    
    modal.style.display = 'block';
}

async function addComment(objectName, objectType) {
    const userName = document.getElementById('commentUserName').value;
    const commentText = document.getElementById('commentText').value;
    
    if (!userName || !commentText) {
        alert('Please enter both your name and a comment.');
        return;
    }
    
    try {
        const response = await fetch('/add_comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                object_name: objectName,
                object_type: objectType,
                user_name: userName,
                comment: commentText
            })
        });
        
        const result = await response.json();
        if (result.success) {
            // Refresh the modal to show new comment
            showObjectInfo(objectName, objectType);
            document.getElementById('commentText').value = '';
        }
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}

async function voteComment(commentId, action) {
    try {
        const response = await fetch(`/vote_comment/${commentId}/${action}`);
        const result = await response.json();
        if (result.success) {
            // Refresh comments
            const currentObject = document.querySelector('.modal-header h3').textContent;
            showObjectInfo(currentObject, 'star'); // You might want to track the current object type
        }
    } catch (error) {
        console.error('Error voting:', error);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Real-time movement
    if (isRotating) {
        const rotationSpeed = 0.0001;
        earth.rotation.y += rotationSpeed;
        celestialSphere.rotation.y += rotationSpeed;
        
        satellitePoints.forEach(sat => {
            sat.rotation.y += rotationSpeed;
        });
        
        planetPoints.forEach(planet => {
            planet.rotation.y += rotationSpeed;
        });
    }
    
    // Update labels
    document.querySelectorAll('.object-label').forEach(label => {
        if (label.updatePosition) {
            label.updatePosition();
        }
    });
    
    renderer.render(scene, camera);
}

// Control functions - FIXED
function toggleStars() {
    showStars = !showStars;
    updateConstellations();
    updateButtonState('toggleStarsBtn', showStars, '⭐ Stars', '⭐ Stars');
}

function toggleConstellations() {
    showConstellations = !showConstellations;
    updateConstellations();
    updateButtonState('toggleConstellationsBtn', showConstellations, '🔭 Constellations', '🔭 Constellations');
}

function toggleSatellites() {
    showSatellites = !showSatellites;
    if (showSatellites) {
        updateSatellites();
    } else {
        satellitePoints.forEach(sat => scene.remove(sat));
        satellitePoints = [];
        document.getElementById('satelliteCount').textContent = '0';
    }
    updateButtonState('toggleSatellitesBtn', showSatellites, '🛰️ Satellites', '🛰️ Satellites');
}

function togglePlanets() {
    showPlanets = !showPlanets;
    if (showPlanets) {
        updatePlanets();
    } else {
        planetPoints.forEach(planet => scene.remove(planet));
        planetPoints = [];
        document.getElementById('planetCount').textContent = '0';
    }
    updateButtonState('togglePlanetsBtn', showPlanets, '🪐 Planets', '🪐 Planets');
}

function toggleRotation() {
    isRotating = !isRotating;
    updateButtonState('toggleRotationBtn', isRotating, '⏸️ Pause', '▶️ Play');
}

function updateButtonState(buttonId, isActive, activeText, inactiveText) {
    const button = document.getElementById(buttonId);
    button.textContent = isActive ? activeText : inactiveText;
    button.classList.toggle('active', isActive);
}

function focusOnMyLocation() {
    if (currentLat && currentLng) {
        focusOnLocation(currentLat, currentLng);
    }
}

function resetView() {
    camera.position.set(0, 0, 400);
    camera.lookAt(0, 0, 0);
}

function closeModal() {
    document.getElementById('infoModal').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'none';
}
