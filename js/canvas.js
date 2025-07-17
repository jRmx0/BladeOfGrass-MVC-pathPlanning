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
        
        this.setupCanvas();
        this.setupEventListeners();
        
        // Colors
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
    }
    
    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
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
        // Show preview line when drawing polygons
        if ((this.mode === 'boundary' && this.boundary.length > 0) ||
            ((this.mode === 'obstacle' || this.mode === 'obstacle-dynamic') && this.currentObstacle.length > 0)) {
            this.mousePosition = this.getMousePosition(e);
            this.render();
        }
    }
    
    addBoundaryPoint(pos) {
        this.boundary.push(pos);
        this.updateCanvasOverlay(`Boundary: ${this.boundary.length} points (right-click to finish)`);
        this.render();
        
        // Enable plan button once boundary is complete
        if (this.boundary.length >= 3) {
            app.updateButtonStates();
        }
    }
    
    finishBoundary() {
        if (this.boundary.length >= 3) {
            this.setMode('ready');
            this.updateCanvasOverlay('Boundary complete! Click PLAN to generate path.');
            app.updateButtonStates();
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
            this.updateCanvasOverlay('Obstacle added! Add more or click PLAN.');
            app.updateObstacleList();
            app.updateButtonStates();
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
            this.updateCanvasOverlay('Dynamic obstacle added! Add more or click PLAN.');
            app.updateObstacleList();
            app.updateButtonStates();
        }
    }
    
    setMode(newMode) {
        this.mode = newMode;
        this.currentObstacle = [];
        
        // Update cursor
        this.canvas.style.cursor = newMode === 'ready' ? 'default' : 'crosshair';
        
        // Update mode indicator
        const indicator = document.getElementById('modeIndicator');
        indicator.className = 'mode-indicator';
        
        switch (newMode) {
            case 'boundary':
                indicator.textContent = 'Mode: Drawing Boundary';
                indicator.classList.add('active', 'boundary');
                break;
            case 'obstacle':
                indicator.textContent = 'Mode: Adding Obstacle';
                indicator.classList.add('active', 'obstacle');
                break;
            case 'obstacle-dynamic':
                indicator.textContent = 'Mode: Adding Dynamic Obstacle';
                indicator.classList.add('active', 'obstacle-dynamic');
                break;
            default:
                indicator.classList.remove('active');
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
    
    reset() {
        this.boundary = [];
        this.obstacles = [];
        this.dynamicObstacles = [];
        this.plannedPath = [];
        this.currentPath = [];
        this.robotPosition = null;
        this.currentObstacle = [];
        this.setMode('ready');
        this.updateCanvasOverlay('Click BOUNDARY to start defining the mowing area');
        this.render();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw boundary
        if (this.boundary.length > 0) {
            this.drawPolygon(this.boundary, this.colors.boundary, 3, true);
        }
        
        // Draw static obstacles
        this.obstacles.forEach(obstacle => {
            this.drawPolygon(obstacle.points, this.colors.obstacle, 2, true);
        });
        
        // Draw dynamic obstacles
        this.dynamicObstacles.forEach(obstacle => {
            this.drawPolygon(obstacle.points, this.colors.dynamicObstacle, 2, true);
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
    }
    
    drawGrid() {
        const gridSize = 50; // 50px grid
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([]);
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
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
}
