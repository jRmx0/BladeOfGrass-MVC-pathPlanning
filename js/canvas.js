/**
 * Canvas Manager for BladeOfGrass Path Planning Prototype
 * Handles all drawing operations and canvas interactions
 */

class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.boundary = [];
        this.obstacles = [];
        this.dynamicObstacles = [];
        this.plannedPath = [];
        this.currentPath = [];
        this.robotPosition = null;
        this.mode = 'ready'; // ready, boundary, obstacle, obstacle-dynamic
        this.currentObstacle = [];
        this.highlightedObstacle = null; // For hover highlighting
        
        // Zoom and pan properties
        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.minScale = 0.2;
        this.maxScale = 5.0;
        this.isPanning = false;
        this.lastPanPoint = { x: 0, y: 0 };
        
        // Colors - Initialize BEFORE setup to avoid render errors
        this.colors = {
            boundary: '#27ae60',      // Green
            obstacle: '#e74c3c',      // Red
            dynamicObstacle: '#f39c12', // Orange
            plannedPath: '#3498db',   // Blue
            currentPath: '#9b59b6',   // Purple
            robot: '#2c3e50',         // Dark gray
            background: '#f8f9fa',    // Light gray
            grid: '#ecf0f1'           // Very light gray
        };
        
        this.setupCanvas();
        this.setupEventListeners();
        this.render();
    }
    
    setupCanvas() {
        // Make canvas responsive to container
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.render();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });
        
        // Zoom functionality
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleWheel(e);
        });
        
        // Pan functionality
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
    }
    
    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Transform canvas coordinates to world coordinates (accounting for zoom and pan)
        return {
            x: (canvasX - this.panX) / this.scale,
            y: (canvasY - this.panY) / this.scale
        };
    }
    
    handleClick(e) {
        const pos = this.getMousePosition(e);
        
        switch (this.mode) {
            case 'boundary':
                this.addBoundaryPoint(pos);
                break;
            case 'obstacle':
                this.addObstaclePoint(pos);
                break;
            case 'obstacle-dynamic':
                this.addDynamicObstaclePoint(pos);
                break;
        }
    }
    
    handleRightClick(e) {
        // Right click finishes current polygon
        if (this.mode === 'boundary' && this.boundary.length >= 3) {
            this.finishBoundary();
        } else if (this.mode === 'obstacle' && this.currentObstacle.length >= 3) {
            this.finishObstacle();
        } else if (this.mode === 'obstacle-dynamic' && this.currentObstacle.length >= 3) {
            this.finishDynamicObstacle();
        }
    }
    
    handleMouseMove(e) {
        // Always update cursor position for display
        const currentMousePos = this.getMousePosition(e);
        this.updateCursorPosition(currentMousePos);
        
        // Handle panning
        if (this.isPanning) {
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            this.panX += currentX - this.lastPanPoint.x;
            this.panY += currentY - this.lastPanPoint.y;
            
            this.lastPanPoint.x = currentX;
            this.lastPanPoint.y = currentY;
            
            this.render();
            return;
        }
        
        // Show preview line when drawing polygons
        if ((this.mode === 'boundary' && this.boundary.length > 0) ||
            ((this.mode === 'obstacle' || this.mode === 'obstacle-dynamic') && this.currentObstacle.length > 0)) {
            this.mousePosition = currentMousePos;
            this.render();
        }
    }
    
    handleMouseDown(e) {
        // Only start panning with middle mouse button or Ctrl+left click
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
            e.preventDefault();
            this.isPanning = true;
            const rect = this.canvas.getBoundingClientRect();
            this.lastPanPoint.x = e.clientX - rect.left;
            this.lastPanPoint.y = e.clientY - rect.top;
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    handleMouseUp(e) {
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = this.mode === 'ready' ? 'default' : 'crosshair';
        }
    }
    
    handleMouseLeave(e) {
        // Clear cursor position when mouse leaves canvas
        const cursorInfo = document.getElementById('cursorPosition');
        if (cursorInfo) {
            cursorInfo.textContent = '(-, -) m';
        }
        
        // Stop panning if active
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = this.mode === 'ready' ? 'default' : 'crosshair';
        }
    }
    
    handleWheel(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate zoom
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * zoomFactor));
        
        if (newScale !== this.scale) {
            // Zoom towards mouse position
            const worldX = (mouseX - this.panX) / this.scale;
            const worldY = (mouseY - this.panY) / this.scale;
            
            this.scale = newScale;
            
            this.panX = mouseX - worldX * this.scale;
            this.panY = mouseY - worldY * this.scale;
            
            this.render();
            this.updateZoomInfo();
        }
    }
    
    addBoundaryPoint(pos) {
        this.boundary.push(pos);
        this.updateCanvasOverlay(`Boundary: ${this.boundary.length} points (right-click to finish)`);
        this.render();
        
        // Update stats instantly as boundary changes
        app.updateStats();
        
        // Enable plan button once boundary is complete
        if (this.boundary.length >= 3) {
            app.updateButtonStates();
        }
    }
    
    finishBoundary() {
        if (this.boundary.length >= 3) {
            this.setMode('ready');
            this.render();  // Force re-render to clear helper lines
            this.updateCanvasOverlay('Boundary complete! Click PLAN to generate path.');
            app.updateButtonStates();
            app.updateStats();  // Update stats when boundary is complete
        } else {
            // Clean up incomplete boundary (1-2 points)
            if (this.boundary.length > 0) {
                this.boundary = [];
                this.setMode('ready');
                this.render();
                this.updateCanvasOverlay('Incomplete boundary removed. Click BOUNDARY to start again.');
                app.updateButtonStates();
                app.updateStats();  // Update stats when boundary is removed
            }
        }
    }
    
    addObstaclePoint(pos) {
        this.currentObstacle.push(pos);
        this.updateCanvasOverlay(`Obstacle: ${this.currentObstacle.length} points (right-click to finish)`);
        this.render();
    }
    
    finishObstacle() {
        if (this.currentObstacle.length >= 3) {
            const obstacleId = `obstacle_${Date.now()}`;
            this.obstacles.push({
                id: obstacleId,
                points: [...this.currentObstacle],
                type: 'static'
            });
            this.currentObstacle = [];
            this.setMode('ready');
            this.render();  // Force re-render to clear helper lines
            this.updateCanvasOverlay('Obstacle added! Add more or click PLAN.');
            app.updateObstacleList();
            app.updateButtonStates();
            app.updateStats();  // Update stats when obstacle is added
        } else {
            // Clean up incomplete obstacle (1-2 points)
            if (this.currentObstacle.length > 0) {
                this.currentObstacle = [];
                this.setMode('ready');
                this.render();
                this.updateCanvasOverlay('Incomplete obstacle removed. Add obstacles or click PLAN.');
                app.updateButtonStates();
            }
        }
    }
    
    addDynamicObstaclePoint(pos) {
        this.currentObstacle.push(pos);
        this.updateCanvasOverlay(`Dynamic Obstacle: ${this.currentObstacle.length} points (right-click to finish)`);
        this.render();
    }
    
    finishDynamicObstacle() {
        if (this.currentObstacle.length >= 3) {
            const obstacleId = `dynamic_${Date.now()}`;
            this.dynamicObstacles.push({
                id: obstacleId,
                points: [...this.currentObstacle],
                type: 'dynamic'
            });
            this.currentObstacle = [];
            this.setMode('ready');
            this.render();  // Force re-render to clear helper lines
            this.updateCanvasOverlay('Dynamic obstacle added! Add more or click PLAN.');
            app.updateObstacleList();
            app.updateButtonStates();
            app.updateStats();  // Update stats when dynamic obstacle is added
        } else {
            // Clean up incomplete dynamic obstacle
            this.currentObstacle = [];
            this.setMode('ready');
            this.render();  // Clear any partial drawing
            this.updateCanvasOverlay('Incomplete dynamic obstacle removed. Click DYNAMIC OBSTACLE to start again.');
            app.updateButtonStates();
        }
    }
    
    setMode(newMode) {
        console.log(`🔄 Setting mode from "${this.mode}" to "${newMode}"`);
        
        // Clean up incomplete drawings when switching to ready mode
        if (newMode === 'ready') {
            // Clear incomplete boundary (less than 3 points)
            if (this.boundary.length > 0 && this.boundary.length < 3) {
                console.log(`🧹 Clearing incomplete boundary with ${this.boundary.length} points`);
                this.boundary = [];
            }
            
            // Clear any current obstacle
            this.currentObstacle = [];
        }
        
        this.mode = newMode;
        this.currentObstacle = [];
        this.mousePosition = null;  // Clear mouse position to remove helper lines
        
        // Update cursor
        this.canvas.style.cursor = newMode === 'ready' ? 'default' : 'crosshair';
        
        // Update mode indicator
        const indicator = document.getElementById('modeIndicator');
        if (!indicator) {
            console.error('❌ Mode indicator element not found');
            return;
        }
        
        indicator.className = 'mode-indicator';
        
        switch (newMode) {
            case 'boundary':
                indicator.textContent = 'Mode: Drawing Boundary';
                indicator.classList.add('active', 'boundary');
                console.log('✅ Mode indicator updated for boundary');
                break;
            case 'obstacle':
                indicator.textContent = 'Mode: Adding Obstacle';
                indicator.classList.add('active', 'obstacle');
                console.log('✅ Mode indicator updated for obstacle');
                break;
            case 'obstacle-dynamic':
                indicator.textContent = 'Mode: Adding Dynamic Obstacle';
                indicator.classList.add('active', 'obstacle-dynamic');
                console.log('✅ Mode indicator updated for dynamic obstacle');
                break;
            default:
                indicator.classList.remove('active');
                console.log('✅ Mode indicator cleared');
                break;
        }
    }
    
    updateCanvasOverlay(text) {
        document.getElementById('canvasOverlay').textContent = text;
    }
    
    removeObstacle(obstacleId) {
        this.obstacles = this.obstacles.filter(obs => obs.id !== obstacleId);
        this.dynamicObstacles = this.dynamicObstacles.filter(obs => obs.id !== obstacleId);
        this.render();
    }
    
    setHighlightedObstacle(obstacleId) {
        this.highlightedObstacle = obstacleId;
        this.render();
    }
    
    clearHighlightedObstacle() {
        this.highlightedObstacle = null;
        this.render();
    }
    
    reset() {
        this.boundary = [];
        this.obstacles = [];
        this.dynamicObstacles = [];
        this.plannedPath = [];
        this.currentPath = [];
        this.robotPosition = null;
        this.currentObstacle = [];
        
        // Reset pan position to origin but keep zoom level
        this.panX = 0;
        this.panY = 0;
        
        this.setMode('ready');
        this.updateCanvasOverlay('Click BOUNDARY to start defining the mowing area');
        this.render();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save current transform
        this.ctx.save();
        
        // Apply zoom and pan transforms
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.scale, this.scale);
        
        // Draw grid
        this.drawGrid();
        
        // Draw boundary
        if (this.boundary.length > 0) {
            this.drawPolygon(this.boundary, this.colors.boundary, 3, true);
        }
        
        // Draw static obstacles
        this.obstacles.forEach(obstacle => {
            const isHighlighted = this.highlightedObstacle === obstacle.id;
            this.drawPolygon(obstacle.points, this.colors.obstacle, 2, true);
            
            // Draw highlight effect
            if (isHighlighted) {
                this.drawObstacleHighlight(obstacle.points, this.colors.obstacle);
            }
        });
        
        // Draw dynamic obstacles
        this.dynamicObstacles.forEach(obstacle => {
            const isHighlighted = this.highlightedObstacle === obstacle.id;
            this.drawPolygon(obstacle.points, this.colors.dynamicObstacle, 2, true);
            
            // Draw highlight effect
            if (isHighlighted) {
                this.drawObstacleHighlight(obstacle.points, this.colors.dynamicObstacle);
            }
        });
        
        // Draw current obstacle being created
        if (this.currentObstacle.length > 0) {
            const color = this.mode === 'obstacle-dynamic' ? this.colors.dynamicObstacle : this.colors.obstacle;
            this.drawPolygon(this.currentObstacle, color, 2, false);
            
            // Draw preview line to mouse
            if (this.mousePosition && this.currentObstacle.length > 0) {
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                const last = this.currentObstacle[this.currentObstacle.length - 1];
                this.ctx.moveTo(last.x, last.y);
                this.ctx.lineTo(this.mousePosition.x, this.mousePosition.y);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }
        
        // Draw planned path
        if (this.plannedPath.length > 0) {
            this.drawPath(this.plannedPath, this.colors.plannedPath, 2);
        }
        
        // Draw current path (re-routed)
        if (this.currentPath.length > 0) {
            this.drawPath(this.currentPath, this.colors.currentPath, 3);
        }
        
        // Draw robot
        if (this.robotPosition) {
            this.drawRobot(this.robotPosition);
        }
        
        // Restore transform
        this.ctx.restore();
    }
    
    drawGrid() {
        const gridSize = 50; // 50px grid (1 meter)
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1 / this.scale; // Adjust line width for zoom
        this.ctx.setLineDash([]);
        
        // Calculate visible area in world coordinates
        const visibleLeft = -this.panX / this.scale;
        const visibleTop = -this.panY / this.scale;
        const visibleRight = (this.canvas.width - this.panX) / this.scale;
        const visibleBottom = (this.canvas.height - this.panY) / this.scale;
        
        // Calculate grid boundaries
        const startX = Math.floor(visibleLeft / gridSize) * gridSize;
        const endX = Math.ceil(visibleRight / gridSize) * gridSize;
        const startY = Math.floor(visibleTop / gridSize) * gridSize;
        const endY = Math.ceil(visibleBottom / gridSize) * gridSize;
        
        // Vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, visibleTop - gridSize);
            this.ctx.lineTo(x, visibleBottom + gridSize);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(visibleLeft - gridSize, y);
            this.ctx.lineTo(visibleRight + gridSize, y);
            this.ctx.stroke();
        }
    }
    
    drawPolygon(points, color, lineWidth, filled) {
        if (points.length === 0) return;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.setLineDash([]);
        
        if (filled) {
            this.ctx.fillStyle = color + '20'; // Add transparency
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        if (points.length > 2) {
            this.ctx.closePath();
        }
        
        if (filled) {
            this.ctx.fill();
        }
        this.ctx.stroke();
        
        // Draw points
        points.forEach((point, index) => {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw point numbers
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText((index + 1).toString(), point.x, point.y + 4);
        });
    }
    
    drawObstacleHighlight(points, baseColor) {
        if (points.length < 3) return;
        
        // Draw outer glow effect
        this.ctx.save();
        this.ctx.shadowColor = baseColor;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Draw thicker border for highlight
        this.ctx.strokeStyle = baseColor;
        this.ctx.lineWidth = 6;
        this.ctx.setLineDash([]);
        this.ctx.globalAlpha = 0.8;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawPath(path, color, lineWidth) {
        if (path.length < 2) return;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.setLineDash([]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y);
        }
        
        this.ctx.stroke();
        
        // Draw direction arrows
        for (let i = 0; i < path.length - 1; i++) {
            if (i % 10 === 0) { // Every 10th segment
                this.drawArrow(path[i], path[i + 1], color);
            }
        }
    }
    
    drawArrow(from, to, color) {
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        // Arrow shaft
        this.ctx.moveTo(midX, midY);
        
        // Arrow head
        this.ctx.lineTo(
            midX - arrowLength * Math.cos(angle - arrowAngle),
            midY - arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.moveTo(midX, midY);
        this.ctx.lineTo(
            midX - arrowLength * Math.cos(angle + arrowAngle),
            midY - arrowLength * Math.sin(angle + arrowAngle)
        );
        
        this.ctx.stroke();
    }
    
    drawRobot(position) {
        const radius = 8;
        
        // Robot body (circle)
        this.ctx.fillStyle = this.colors.robot;
        this.ctx.beginPath();
        this.ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Robot direction indicator
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        const dirX = position.x + (radius - 2) * Math.cos(position.heading || 0);
        const dirY = position.y + (radius - 2) * Math.sin(position.heading || 0);
        this.ctx.moveTo(position.x, position.y);
        this.ctx.lineTo(dirX, dirY);
        this.ctx.stroke();
        
        // Robot trail
        this.ctx.strokeStyle = this.colors.robot + '40';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(position.x, position.y, radius + 3, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    
    // Convert canvas coordinates to meters (for display)
    canvasToMeters(pixels) {
        return (pixels / 50).toFixed(1); // 50 pixels = 1 meter
    }
    
    // Calculate polygon area in square meters
    calculatePolygonArea(points) {
        if (points.length < 3) return 0;
        
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        area = Math.abs(area) / 2;
        
        // Convert from square pixels to square meters (50px = 1m)
        return (area / (50 * 50)).toFixed(1);
    }
    
    // Get boundary data for algorithm
    getBoundaryData() {
        return {
            boundary: this.boundary,
            obstacles: this.obstacles,
            dynamicObstacles: this.dynamicObstacles
        };
    }
    
    // Set planned path from algorithm
    setPlannedPath(path) {
        this.plannedPath = path;
        this.render();
    }
    
    // Update robot position during simulation
    updateRobotPosition(position) {
        this.robotPosition = position;
        this.render();
    }
    
    // Zoom control methods
    zoomIn() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const worldX = (centerX - this.panX) / this.scale;
        const worldY = (centerY - this.panY) / this.scale;
        
        this.scale = Math.min(this.maxScale, this.scale * 1.2);
        
        this.panX = centerX - worldX * this.scale;
        this.panY = centerY - worldY * this.scale;
        
        this.render();
        this.updateZoomInfo();
    }
    
    zoomOut() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const worldX = (centerX - this.panX) / this.scale;
        const worldY = (centerY - this.panY) / this.scale;
        
        this.scale = Math.max(this.minScale, this.scale / 1.2);
        
        this.panX = centerX - worldX * this.scale;
        this.panY = centerY - worldY * this.scale;
        
        this.render();
        this.updateZoomInfo();
    }
    
    resetZoom() {
        this.scale = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.render();
        this.updateZoomInfo();
    }
    
    updateZoomInfo() {
        // Update zoom percentage in the UI if element exists
        const zoomInfo = document.getElementById('zoomInfo');
        if (zoomInfo) {
            zoomInfo.textContent = `${Math.round(this.scale * 100)}%`;
        }
    }
    
    updateCursorPosition(position) {
        // Update cursor position in the UI if element exists
        const cursorInfo = document.getElementById('cursorPosition');
        if (cursorInfo && position) {
            const x = this.canvasToMeters(position.x);
            const y = this.canvasToMeters(position.y);
            cursorInfo.textContent = `(${x}, ${y}) m`;
        }
    }
}
