/**
 * Main Application for BladeOfGrass Path Planning Prototype
 * Initializes and coordinates all components
 */

class App {
    constructor() {
        this.canvas = null;
        this.controls = null;
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        console.log('🌱 BladeOfGrass Path Planning Prototype - Phase 1: Basic Interface');
        console.log('📋 Features implemented:');
        console.log('  ✅ HTML/CSS/JS interface');
        console.log('  ✅ Canvas drawing for boundaries');
        console.log('  ✅ Control button layout');
        console.log('  ✅ Obstacle management');
        console.log('  ✅ Mock path planning');
        console.log('  ✅ Robot simulation');
        
        try {
            // Test if DOM elements exist
            const canvas = document.getElementById('mainCanvas');
            const boundaryBtn = document.getElementById('boundaryBtn');
            
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            if (!boundaryBtn) {
                throw new Error('Boundary button not found');
            }
            
            console.log('✅ DOM elements found');
            
            // Initialize components
            this.canvas = new CanvasManager('mainCanvas');
            console.log('✅ Canvas manager initialized');
            
            this.controls = new ControlsManager(this.canvas);
            console.log('✅ Controls manager initialized');
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Initialize UI
            this.updateButtonStates();
            this.updateStats();
            this.updateObstacleList();
            
            // Show welcome message
            this.showWelcomeMessage();
            
            console.log('🚀 Application ready! Use controls or keyboard shortcuts:');
            console.log('  B - Start boundary drawing');
            console.log('  O - Add obstacle');
            console.log('  D - Add dynamic obstacle');
            console.log('  P - Generate plan');
            console.log('  Space - Play/Pause simulation');
            console.log('  Ctrl+R - Reset everything');
            console.log('  Esc - Cancel current drawing mode');
            console.log('  + / - - Zoom in/out');
            console.log('  Ctrl+0 - Reset zoom');
            console.log('  Mouse wheel - Zoom at cursor');
            console.log('  Ctrl+Click - Pan canvas');
            
        } catch (error) {
            console.error('❌ Setup failed:', error);
            alert('Setup failed: ' + error.message + '. Check browser console for details.');
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
            this.showError('An unexpected error occurred. Check console for details.');
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showError('Operation failed. Check console for details.');
        });
    }
    
    showWelcomeMessage() {
        // Show initial help overlay
        setTimeout(() => {
            if (this.canvas.boundary.length === 0) {
                this.canvas.updateCanvasOverlay(
                    '👋 Welcome! Start by clicking BOUNDARY to define the mowing area'
                );
            }
        }, 1000);
    }
    
    showError(message) {
        // Simple error display (could be enhanced with toast notifications)
        alert('Error: ' + message);
    }
    
    // Delegate methods to controls manager (for global access)
    updateButtonStates() {
        if (this.controls) {
            this.controls.updateButtonStates();
        }
    }
    
    updateObstacleList() {
        if (this.controls) {
            this.controls.updateObstacleList();
        }
    }
    
    updateStats() {
        if (this.controls) {
            this.controls.updateStats();
        }
    }
    
    removeObstacle(obstacleId) {
        if (this.controls) {
            this.controls.removeObstacle(obstacleId);
        }
    }
    
    highlightObstacle(obstacleId) {
        if (this.controls) {
            this.controls.highlightObstacle(obstacleId);
        }
    }
    
    unhighlightObstacle(obstacleId) {
        if (this.controls) {
            this.controls.unhighlightObstacle(obstacleId);
        }
    }
    
    // Export data for future C algorithm integration
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            boundary: this.canvas.boundary,
            obstacles: this.canvas.obstacles,
            dynamicObstacles: this.canvas.dynamicObstacles,
            plannedPath: this.canvas.plannedPath,
            metadata: {
                canvasWidth: this.canvas.canvas.width,
                canvasHeight: this.canvas.canvas.height,
                pixelsPerMeter: 50,
                version: '1.0.0-phase1'
            }
        };
        
        return data;
    }
    
    // Import data (for testing and future file loading)
    importData(data) {
        try {
            this.canvas.boundary = data.boundary || [];
            this.canvas.obstacles = data.obstacles || [];
            this.canvas.dynamicObstacles = data.dynamicObstacles || [];
            this.canvas.plannedPath = data.plannedPath || [];
            
            this.canvas.render();
            this.updateButtonStates();
            this.updateObstacleList();
            this.updateStats();
            
            console.log('Data imported successfully');
        } catch (error) {
            console.error('Failed to import data:', error);
            this.showError('Failed to import data: ' + error.message);
        }
    }
    
    // Development helper methods
    generateTestData() {
        console.log('Generating test data...');
        
        // Create a simple rectangular boundary
        this.canvas.boundary = [
            { x: 100, y: 100 },
            { x: 500, y: 100 },
            { x: 500, y: 400 },
            { x: 100, y: 400 }
        ];
        
        // Add a test obstacle
        this.canvas.obstacles = [{
            id: 'test_obstacle_1',
            points: [
                { x: 200, y: 200 },
                { x: 300, y: 200 },
                { x: 300, y: 300 },
                { x: 200, y: 300 }
            ],
            type: 'static'
        }];
        
        // Add a dynamic obstacle
        this.canvas.dynamicObstacles = [{
            id: 'test_dynamic_1',
            points: [
                { x: 350, y: 150 },
                { x: 400, y: 150 },
                { x: 400, y: 200 },
                { x: 350, y: 200 }
            ],
            type: 'dynamic'
        }];
        
        this.canvas.render();
        this.updateButtonStates();
        this.updateObstacleList();
        this.updateStats();
        
        console.log('Test data generated. You can now click PLAN to generate a path.');
    }
    
    // Phase completion status
    getPhaseStatus() {
        return {
            phase: 1,
            name: 'Basic Interface',
            completed: true,
            features: {
                htmlInterface: true,
                canvasDrawing: true,
                controlButtons: true,
                boundaryDefinition: true,
                obstacleManagement: true,
                mockPathPlanning: true,
                robotSimulation: true,
                statistics: true
            },
            nextPhase: {
                phase: 2,
                name: 'Communication',
                description: 'Node.js server setup and file-based protocol with C program integration'
            }
        };
    }
}

// Global app instance
let app;

// Initialize application when page loads
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});

// Development helpers (available in console)
window.BladeOfGrass = {
    app: () => app,
    exportData: () => app ? app.exportData() : null,
    importData: (data) => app ? app.importData(data) : null,
    generateTestData: () => app ? app.generateTestData() : null,
    getPhaseStatus: () => app ? app.getPhaseStatus() : null,
    version: '1.0.0-phase1'
};

// Console welcome message
console.log(`
🌱 BladeOfGrass Path Planning Prototype
Phase 1: Basic Interface Implementation

Development helpers available:
- BladeOfGrass.generateTestData() - Create test boundary and obstacles
- BladeOfGrass.exportData() - Export current data as JSON
- BladeOfGrass.importData(data) - Import JSON data
- BladeOfGrass.getPhaseStatus() - Check implementation status

Ready for Phase 2: Communication setup!
`);
