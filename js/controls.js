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
        
        this.setupEventListeners();
        this.updateButtonStates();
    }
    
    setupEventListeners() {
        // Main control buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('boundaryBtn').addEventListener('click', () => this.startBoundary());
        document.getElementById('planBtn').addEventListener('click', () => this.generatePlan());
        
        // Obstacle buttons
        document.getElementById('addObstacleBtn').addEventListener('click', () => this.addObstacle());
        document.getElementById('addDynamicObstacleBtn').addEventListener('click', () => this.addDynamicObstacle());
        
        // Simulation buttons
        document.getElementById('runBtn').addEventListener('click', () => this.run());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        
        // Speed control
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => this.updateSpeed(e.target.value));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
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
                this.canvas.setMode('ready');
                this.updateButtonStates();
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
        if (this.canvas.mode === 'boundary') {
            this.canvas.setMode('ready');
        } else {
            this.canvas.setMode('boundary');
            this.canvas.updateCanvasOverlay('Click to add boundary points, right-click to finish');
        }
        this.updateButtonStates();
    }
    
    addObstacle() {
        if (this.canvas.mode === 'obstacle') {
            this.canvas.setMode('ready');
        } else {
            this.canvas.setMode('obstacle');
            this.canvas.updateCanvasOverlay('Click to add obstacle points, right-click to finish');
        }
        this.updateButtonStates();
    }
    
    addDynamicObstacle() {
        if (this.canvas.mode === 'obstacle-dynamic') {
            this.canvas.setMode('ready');
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
        this.startSimulation();
        this.updateButtonStates();
        this.updateRobotStatus('Running', null, 0, this.currentSpeed);
    }
    
    pause() {
        this.isPaused = true;
        this.updateButtonStates();
        this.updateRobotStatus('Paused', null, null, 0);
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
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
        
        let currentIndex = 0;
        let progress = 0;
        
        const animate = () => {
            if (!this.isRunning || this.isPaused) return;
            
            if (currentIndex >= path.length - 1) {
                // Simulation complete
                this.stop();
                this.updateRobotStatus('Complete', path[path.length - 1], 100, 0);
                this.canvas.updateCanvasOverlay('Coverage complete! 🎉');
                return;
            }
            
            // Update robot position
            const current = path[currentIndex];
            const next = path[currentIndex + 1];
            
            if (next) {
                // Calculate heading
                const heading = Math.atan2(next.y - current.y, next.x - current.x);
                
                this.canvas.updateRobotPosition({
                    x: current.x,
                    y: current.y,
                    heading: heading
                });
                
                // Update progress
                progress = ((currentIndex + 1) / path.length) * 100;
                this.updateRobotStatus('Running', current, progress, this.currentSpeed);
            }
            
            currentIndex++;
            
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
        
        // Setup buttons
        document.getElementById('boundaryBtn').textContent = 
            this.canvas.mode === 'boundary' ? '⏹️ FINISH BOUNDARY' : '📐 BOUNDARY';
        document.getElementById('planBtn').disabled = !hasBoundary || isDrawing;
        
        // Obstacle buttons
        document.getElementById('addObstacleBtn').textContent = 
            this.canvas.mode === 'obstacle' ? '⏹️ FINISH OBSTACLE' : '🌳 ADD OBSTACLE';
        document.getElementById('addDynamicObstacleBtn').textContent = 
            this.canvas.mode === 'obstacle-dynamic' ? '⏹️ FINISH DYNAMIC' : '⚡ ADD DYNAMIC';
        
        // Simulation buttons
        document.getElementById('runBtn').disabled = !hasPath || this.isRunning || isDrawing;
        document.getElementById('pauseBtn').disabled = !this.isRunning || this.isPaused || isDrawing;
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
            
            if (isActive) {
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
            <div class="obstacle-item ${obstacle.type}">
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
    
    updateStats() {
        const boundaryArea = this.canvas.calculatePolygonArea(this.canvas.boundary);
        const pathLength = this.calculatePathLength();
        const efficiency = pathLength > 0 ? ((parseFloat(boundaryArea) / (pathLength / 50)) * 100).toFixed(1) : 0;
        const estimatedTime = this.calculateEstimatedTime(pathLength);
        
        document.getElementById('pathLength').textContent = `${pathLength} m`;
        document.getElementById('coverageArea').textContent = `${boundaryArea} m²`;
        document.getElementById('efficiency').textContent = `${efficiency}%`;
        document.getElementById('estimatedTime').textContent = estimatedTime;
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
