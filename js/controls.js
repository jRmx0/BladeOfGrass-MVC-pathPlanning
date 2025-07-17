/**
 * Controls Manager for BladeOfGrass Path Planning Prototype
 * Handles all UI controls and interactions
 */

class ControlsManager {
    constructor(canvasManager) {
        this.canvas = canvasManager;
        this.isRunning = false;
        this.isPaused = false;
        this.currentSpeed = 5;
        this.obstacleCounter = 1;
        
        // Simulation state tracking for pause/resume
        this.currentIndex = 0;
        this.progress = 0;
        
        this.setupEventListeners();
        this.updateButtonStates();
    }
    
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Main control buttons
        const resetBtn = document.getElementById('resetBtn');
        const boundaryBtn = document.getElementById('boundaryBtn');
        const planBtn = document.getElementById('planBtn');
        
        console.log('Button elements:', {
            resetBtn: !!resetBtn,
            boundaryBtn: !!boundaryBtn,
            planBtn: !!planBtn
        });
        
        if (!boundaryBtn) {
            console.error('❌ Boundary button not found!');
            return;
        }
        
        resetBtn?.addEventListener('click', () => {
            console.log('🔄 Reset clicked');
            this.reset();
        });
        
        boundaryBtn.addEventListener('click', () => {
            console.log('📐 Boundary clicked');
            this.startBoundary();
        });
        
        planBtn?.addEventListener('click', () => {
            console.log('🧮 Plan clicked');
            this.generatePlan();
        });
        
        // Obstacle buttons
        document.getElementById('addObstacleBtn')?.addEventListener('click', () => this.addObstacle());
        document.getElementById('addDynamicObstacleBtn')?.addEventListener('click', () => this.addDynamicObstacle());
        
        // Simulation buttons
        document.getElementById('runBtn')?.addEventListener('click', () => this.run());
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.pause());
        document.getElementById('resumeBtn')?.addEventListener('click', () => this.resume());
        document.getElementById('stopBtn')?.addEventListener('click', () => this.stop());
        
        // Speed control
        const speedSlider = document.getElementById('speedSlider');
        speedSlider?.addEventListener('input', (e) => this.updateSpeed(e.target.value));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        console.log('✅ Event listeners set up successfully');
    }
    
    handleKeyboard(e) {
        // Only handle if not in input field
        if (e.target.tagName === 'INPUT') return;
        
        switch (e.key.toLowerCase()) {
            case 'r':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.reset();
                }
                break;
            case 'b':
                this.startBoundary();
                break;
            case 'p':
                if (this.canvas.boundary.length >= 3) {
                    this.generatePlan();
                }
                break;
            case 'o':
                this.addObstacle();
                break;
            case 'd':
                this.addDynamicObstacle();
                break;
            case ' ':
                e.preventDefault();
                if (this.isRunning && !this.isPaused) {
                    this.pause();
                } else if (this.isPaused) {
                    this.run();
                }
                break;
            case 'escape':
                // Smart ESC handling: finish valid drawings, cancel invalid ones
                if (this.canvas.mode === 'boundary') {
                    if (this.canvas.boundary.length >= 3) {
                        // Valid boundary - finish it
                        this.canvas.finishBoundary();
                    } else {
                        // Invalid boundary - cancel it
                        this.canvas.setMode('ready');
                        this.canvas.render();
                        this.canvas.updateCanvasOverlay('Incomplete boundary cancelled. Ready for next action.');
                    }
                } else if (this.canvas.mode === 'obstacle') {
                    if (this.canvas.currentObstacle.length >= 3) {
                        // Valid obstacle - finish it
                        this.canvas.finishObstacle();
                    } else {
                        // Invalid obstacle - cancel it
                        this.canvas.setMode('ready');
                        this.canvas.render();
                        this.canvas.updateCanvasOverlay('Incomplete obstacle cancelled. Ready for next action.');
                    }
                } else if (this.canvas.mode === 'obstacle-dynamic') {
                    if (this.canvas.currentObstacle.length >= 3) {
                        // Valid dynamic obstacle - finish it
                        this.canvas.finishDynamicObstacle();
                    } else {
                        // Invalid dynamic obstacle - cancel it
                        this.canvas.setMode('ready');
                        this.canvas.render();
                        this.canvas.updateCanvasOverlay('Incomplete dynamic obstacle cancelled. Ready for next action.');
                    }
                } else {
                    // Not in drawing mode - just clear any state
                    this.canvas.setMode('ready');
                    this.canvas.render();
                    this.canvas.updateCanvasOverlay('Ready for next action.');
                }
                this.updateButtonStates();
                break;
            case '=':
            case '+':
                e.preventDefault();
                this.canvas.zoomIn();
                break;
            case '-':
            case '_':
                e.preventDefault();
                this.canvas.zoomOut();
                break;
            case '0':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.canvas.resetZoom();
                }
                break;
        }
    }
    
    reset() {
        this.stop();
        this.canvas.reset();
        this.obstacleCounter = 1;
        this.updateStats();
        this.updateObstacleList();
        this.updateButtonStates();
        this.updateRobotStatus('Idle', null, 0, 0);
    }
    
    startBoundary() {
        console.log('🎯 startBoundary called, current mode:', this.canvas.mode);
        
        if (this.canvas.mode === 'boundary') {
            console.log('📐 Finishing boundary');
            this.canvas.finishBoundary();
        } else {
            console.log('📐 Entering boundary mode');
            this.canvas.setMode('boundary');
            this.canvas.updateCanvasOverlay('Click to add boundary points, right-click to finish');
        }
        this.updateButtonStates();
    }
    
    addObstacle() {
        if (this.canvas.mode === 'obstacle') {
            this.canvas.finishObstacle();
        } else {
            this.canvas.setMode('obstacle');
            this.canvas.updateCanvasOverlay('Click to add obstacle points, right-click to finish');
        }
        this.updateButtonStates();
    }
    
    addDynamicObstacle() {
        if (this.canvas.mode === 'obstacle-dynamic') {
            this.canvas.finishDynamicObstacle();
        } else {
            this.canvas.setMode('obstacle-dynamic');
            this.canvas.updateCanvasOverlay('Click to add dynamic obstacle points, right-click to finish');
        }
        this.updateButtonStates();
    }
    
    async generatePlan() {
        if (this.canvas.boundary.length < 3) {
            alert('Please define a boundary first');
            return;
        }
        
        // Disable plan button and show loading
        const planBtn = document.getElementById('planBtn');
        const originalText = planBtn.textContent;
        planBtn.textContent = '⏳ Planning...';
        planBtn.disabled = true;
        
        try {
            // Get boundary data
            const boundaryData = this.canvas.getBoundaryData();
            
            // Mock path planning (in Phase 3, this will call the C algorithm)
            const mockPath = this.generateMockPath(boundaryData);
            
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Set the planned path
            this.canvas.setPlannedPath(mockPath);
            
            // Update stats
            this.updateStats();
            
            this.canvas.updateCanvasOverlay('Path generated! Click RUN to start simulation.');
            
        } catch (error) {
            console.error('Path planning failed:', error);
            alert('Path planning failed: ' + error.message);
        } finally {
            planBtn.textContent = originalText;
            this.updateButtonStates();
        }
    }
    
    generateMockPath(boundaryData) {
        // Mock trapezoidal decomposition path
        // This will be replaced with actual C algorithm in Phase 3
        const path = [];
        const boundary = boundaryData.boundary;
        
        if (boundary.length < 3) return path;
        
        // Find bounding box
        let minX = Math.min(...boundary.map(p => p.x));
        let maxX = Math.max(...boundary.map(p => p.x));
        let minY = Math.min(...boundary.map(p => p.y));
        let maxY = Math.max(...boundary.map(p => p.y));
        
        // Add some margin
        minX += 20;
        maxX -= 20;
        minY += 20;
        maxY -= 20;
        
        // Generate simple back-and-forth pattern
        const stripeSpacing = 40; // 40 pixels between stripes
        let currentY = minY;
        let goingRight = true;
        
        while (currentY <= maxY) {
            if (goingRight) {
                path.push({ x: minX, y: currentY });
                path.push({ x: maxX, y: currentY });
            } else {
                path.push({ x: maxX, y: currentY });
                path.push({ x: minX, y: currentY });
            }
            
            currentY += stripeSpacing;
            goingRight = !goingRight;
        }
        
        return path;
    }
    
    run() {
        if (this.canvas.plannedPath.length === 0) {
            alert('Please generate a path first');
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.currentIndex = 0;  // Reset position for fresh start
        this.progress = 0;      // Reset progress for fresh start
        this.startSimulation();
        this.updateButtonStates();
        this.updateRobotStatus('Running', null, 0, this.currentSpeed);
    }
    
    pause() {
        this.isPaused = true;
        this.updateButtonStates();
        this.updateRobotStatus('Paused', null, null, 0);
    }
    
    resume() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.updateButtonStates();
            this.updateRobotStatus('Running', null, null, this.currentSpeed);
            // Restart the animation loop
            this.startSimulation();
        }
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentIndex = 0;  // Reset position
        this.progress = 0;      // Reset progress
        this.canvas.robotPosition = null;
        this.canvas.render();
        this.updateButtonStates();
        this.updateRobotStatus('Stopped', null, 0, 0);
    }
    
    updateSpeed(value) {
        this.currentSpeed = parseInt(value);
        document.getElementById('speedValue').textContent = value + 'x';
        
        if (this.isRunning && !this.isPaused) {
            this.updateRobotStatus(null, null, null, this.currentSpeed);
        }
    }
    
    startSimulation() {
        if (!this.isRunning) return;
        
        const path = this.canvas.plannedPath;
        if (path.length === 0) return;
        
        // Use instance variables to preserve state across pause/resume
        // Only reset if starting fresh (not resuming)
        if (!this.isPaused && this.currentIndex === 0) {
            this.currentIndex = 0;
            this.progress = 0;
        }
        
        const animate = () => {
            if (!this.isRunning || this.isPaused) return;
            
            if (this.currentIndex >= path.length - 1) {
                // Simulation complete
                this.stop();
                this.updateRobotStatus('Complete', path[path.length - 1], 100, 0);
                this.canvas.updateCanvasOverlay('Coverage complete! 🎉');
                return;
            }
            
            // Update robot position
            const current = path[this.currentIndex];
            const next = path[this.currentIndex + 1];
            
            if (next) {
                // Calculate heading
                const heading = Math.atan2(next.y - current.y, next.x - current.x);
                
                this.canvas.updateRobotPosition({
                    x: current.x,
                    y: current.y,
                    heading: heading
                });
                
                // Update progress
                this.progress = ((this.currentIndex + 1) / path.length) * 100;
                this.updateRobotStatus('Running', current, this.progress, this.currentSpeed);
            }
            
            this.currentIndex++;
            
            // Animation speed based on slider
            const delay = Math.max(50, 500 - (this.currentSpeed * 45));
            setTimeout(animate, delay);
        };
        
        animate();
    }
    
    updateButtonStates() {
        const hasBoundary = this.canvas.boundary.length >= 3;
        const hasPath = this.canvas.plannedPath.length > 0;
        const isDrawing = this.canvas.mode !== 'ready';
        const isSimulationActive = this.isRunning; // Robot running or paused
        
        // Setup buttons - disabled during simulation or when drawing in different mode
        document.getElementById('boundaryBtn').textContent = 
            this.canvas.mode === 'boundary' ? '⏹️ FINISH BOUNDARY' : '📐 BOUNDARY';
        document.getElementById('boundaryBtn').disabled = isSimulationActive || (isDrawing && this.canvas.mode !== 'boundary');
        document.getElementById('planBtn').disabled = !hasBoundary || isDrawing || isSimulationActive;
        
        // Obstacle buttons - disabled during simulation or when drawing in different mode
        document.getElementById('addObstacleBtn').textContent = 
            this.canvas.mode === 'obstacle' ? '⏹️ FINISH OBSTACLE' : '🌳 ADD OBSTACLE';
        document.getElementById('addObstacleBtn').disabled = isSimulationActive || (isDrawing && this.canvas.mode !== 'obstacle');
        document.getElementById('addDynamicObstacleBtn').textContent = 
            this.canvas.mode === 'obstacle-dynamic' ? '⏹️ FINISH DYNAMIC' : '⚡ ADD DYNAMIC';
        document.getElementById('addDynamicObstacleBtn').disabled = isSimulationActive || (isDrawing && this.canvas.mode !== 'obstacle-dynamic');
        
        // Simulation buttons
        document.getElementById('runBtn').disabled = !hasPath || this.isRunning || isDrawing;
        document.getElementById('pauseBtn').disabled = !this.isRunning || this.isPaused || isDrawing;
        document.getElementById('resumeBtn').disabled = !this.isRunning || !this.isPaused || isDrawing;
        document.getElementById('stopBtn').disabled = !this.isRunning || isDrawing;
        
        // Update button styles based on mode
        const buttons = ['boundaryBtn', 'addObstacleBtn', 'addDynamicObstacleBtn'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            const isActive = (
                (btnId === 'boundaryBtn' && this.canvas.mode === 'boundary') ||
                (btnId === 'addObstacleBtn' && this.canvas.mode === 'obstacle') ||
                (btnId === 'addDynamicObstacleBtn' && this.canvas.mode === 'obstacle-dynamic')
            );
            
            // Only apply active styling if button is not disabled
            if (isActive && !btn.disabled) {
                btn.style.backgroundColor = '#e67e22';
            } else {
                btn.style.backgroundColor = '';
            }
        });
    }
    
    updateObstacleList() {
        const listContainer = document.getElementById('obstacleList');
        const allObstacles = [
            ...this.canvas.obstacles.map(obs => ({ ...obs, type: 'static' })),
            ...this.canvas.dynamicObstacles.map(obs => ({ ...obs, type: 'dynamic' }))
        ];
        
        if (allObstacles.length === 0) {
            listContainer.innerHTML = `
                <p style="color: #7f8c8d; font-style: italic; text-align: center; padding: 20px;">
                    No obstacles defined
                </p>
            `;
            return;
        }
        
        listContainer.innerHTML = allObstacles.map(obstacle => `
            <div class="obstacle-item ${obstacle.type}" 
                 data-obstacle-id="${obstacle.id}"
                 onmouseenter="app.highlightObstacle('${obstacle.id}')"
                 onmouseleave="app.unhighlightObstacle('${obstacle.id}')">
                <span class="obstacle-name">
                    ${obstacle.type === 'dynamic' ? '⚡' : '🌳'} 
                    ${obstacle.type === 'dynamic' ? 'Dynamic' : 'Obstacle'} ${obstacle.id.split('_')[1].slice(-3)}
                </span>
                <button class="obstacle-delete" onclick="app.removeObstacle('${obstacle.id}')">
                    ✕
                </button>
            </div>
        `).join('');
    }
    
    removeObstacle(obstacleId) {
        this.canvas.removeObstacle(obstacleId);
        this.updateObstacleList();
        this.updateStats();
    }
    
    highlightObstacle(obstacleId) {
        this.canvas.setHighlightedObstacle(obstacleId);
    }
    
    unhighlightObstacle(obstacleId) {
        this.canvas.clearHighlightedObstacle();
    }
    
    updateStats() {
        // Calculate boundary area with 1 decimal place
        const boundaryArea = this.canvas.calculatePolygonArea(this.canvas.boundary);
        
        // Calculate total obstacles area
        const obstaclesArea = this.calculateObstaclesArea();
        
        // Calculate useful area (boundary - obstacles)
        const usefulArea = Math.max(0, parseFloat(boundaryArea) - parseFloat(obstaclesArea)).toFixed(1);
        
        // Calculate other stats
        const pathLength = this.calculatePathLength();
        const estimatedTime = this.calculateEstimatedTime(pathLength);
        
        // Update UI
        document.getElementById('pathLength').textContent = `${pathLength} m`;
        document.getElementById('coverageArea').textContent = `${parseFloat(boundaryArea).toFixed(1)} m²`;
        
        // Update estimated time in robot status section
        const estimatedTimeElement = document.getElementById('estimatedTime');
        if (estimatedTimeElement) {
            estimatedTimeElement.textContent = estimatedTime;
        }
        
        // Update useful area
        const usefulAreaElement = document.getElementById('usefulArea');
        if (usefulAreaElement) {
            usefulAreaElement.textContent = `${usefulArea} m²`;
        }
    }
    
    calculateObstaclesArea() {
        const allObstacles = [
            ...this.canvas.obstacles.map(obs => obs.points),
            ...this.canvas.dynamicObstacles.map(obs => obs.points)
        ];
        
        if (allObstacles.length === 0) return '0.0';
        if (allObstacles.length === 1) {
            return this.canvas.calculatePolygonArea(allObstacles[0]);
        }
        
        // For overlapping obstacles, we need to calculate the union of all obstacle polygons
        // This is computationally complex, so we'll use an approximation method
        const totalObstacleArea = this.calculateUnionArea(allObstacles);
        
        return totalObstacleArea.toFixed(1);
    }
    
    calculateUnionArea(polygons) {
        if (polygons.length === 0) return 0;
        if (polygons.length === 1) {
            return parseFloat(this.canvas.calculatePolygonArea(polygons[0]));
        }
        
        // Use a grid-based approximation for union area calculation
        // This is more accurate than simple addition and handles overlaps
        
        // Find bounding box of all polygons
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        
        polygons.forEach(polygon => {
            polygon.forEach(point => {
                minX = Math.min(minX, point.x);
                maxX = Math.max(maxX, point.x);
                minY = Math.min(minY, point.y);
                maxY = Math.max(maxY, point.y);
            });
        });
        
        // Create a grid with reasonable resolution (2x2 pixel cells)
        const cellSize = 2;
        const gridWidth = Math.ceil((maxX - minX) / cellSize);
        const gridHeight = Math.ceil((maxY - minY) / cellSize);
        
        let coveredCells = 0;
        
        // Check each grid cell
        for (let i = 0; i < gridWidth; i++) {
            for (let j = 0; j < gridHeight; j++) {
                const x = minX + (i + 0.5) * cellSize;
                const y = minY + (j + 0.5) * cellSize;
                
                // Check if this point is inside any obstacle
                const isInsideAnyObstacle = polygons.some(polygon => 
                    this.isPointInPolygon({ x, y }, polygon)
                );
                
                if (isInsideAnyObstacle) {
                    coveredCells++;
                }
            }
        }
        
        // Convert grid cells back to area (pixels squared, then to meters squared)
        const pixelArea = coveredCells * cellSize * cellSize;
        const meterArea = pixelArea / (50 * 50); // 50 pixels = 1 meter
        
        return meterArea;
    }
    
    isPointInPolygon(point, polygon) {
        if (polygon.length < 3) return false;
        
        let inside = false;
        let j = polygon.length - 1;
        
        for (let i = 0; i < polygon.length; i++) {
            const xi = polygon[i].x;
            const yi = polygon[i].y;
            const xj = polygon[j].x;
            const yj = polygon[j].y;
            
            if (((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
            j = i;
        }
        
        return inside;
    }
    
    calculatePathLength() {
        const path = this.canvas.plannedPath;
        if (path.length < 2) return '0.0';
        
        let totalLength = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const dx = path[i + 1].x - path[i].x;
            const dy = path[i + 1].y - path[i].y;
            totalLength += Math.sqrt(dx * dx + dy * dy);
        }
        
        // Convert from pixels to meters (50px = 1m)
        return (totalLength / 50).toFixed(1);
    }
    
    calculateEstimatedTime(pathLengthM) {
        if (pathLengthM === '0.0') return '0:00';
        
        const speedMps = 0.5; // 0.5 m/s average robot speed
        const totalSeconds = Math.round(parseFloat(pathLengthM) / speedMps);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateRobotStatus(state, position, progress, speed) {
        if (state !== null) {
            document.getElementById('robotState').textContent = state;
        }
        
        if (position !== null) {
            const x = this.canvas.canvasToMeters(position.x);
            const y = this.canvas.canvasToMeters(position.y);
            document.getElementById('robotPosition').textContent = `(${x}, ${y})`;
        }
        
        if (progress !== null) {
            document.getElementById('robotProgress').textContent = `${progress.toFixed(1)}%`;
        }
        
        if (speed !== null) {
            document.getElementById('robotSpeed').textContent = `${(speed * 0.1).toFixed(1)} m/s`;
        }
    }
}
