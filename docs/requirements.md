# Simplified Requirements for Local Prototype

## Overview
This document outlines the simplified requirements for the local experimental prototype, following KISS principles and focusing on algorithm validation rather than production deployment.

## Functional Requirements (Simplified)

### FR-S01: Web Interface Controls (Left Panel)
**Priority**: Critical  
**Description**: Provide intuitive controls for boundary definition, path planning, and robot simulation.

**Controls Required**:
- **RESET**: Clear all data, return to clean state
- **BOUNDARY**: Enter boundary definition mode (click to add waypoints)
- **FINISH BOUNDARY**: Complete boundary polygon and exit boundary mode
- **PLAN**: Calculate coverage path using current boundary and static obstacles
- **ADD OBSTACLE**: Enter static obstacle definition mode
- **ADD OBSTACLE DYNAMIC**: Enter dynamic obstacle definition mode
- **RUN**: Start robot simulation along planned path
- **RUN SPEED**: Slider to control simulation speed (0.1x to 5x)
- **PAUSE**: Pause robot simulation (resume with RUN)
- **STOP**: Stop simulation and reset robot to starting position

**Acceptance Criteria**:
- All buttons clearly labeled and functional
- Visual feedback for current mode (boundary, obstacle, etc.)
- Speed control affects simulation in real-time
- Reset completely clears canvas and data

### FR-S02: Canvas Visualization (Center Panel)
**Priority**: Critical  
**Description**: Display boundary, obstacles, planned path, and robot simulation on blank canvas.

**Visual Elements**:
- **Boundary**: Green polygon outline
- **Static Obstacles**: Red filled polygons
- **Dynamic Obstacles**: Orange/yellow filled polygons
- **Planned Path**: Blue dashed line
- **Active Path**: Solid blue line (current robot path)
- **Re-routed Path**: Purple line (when dynamic obstacle detected)
- **Robot**: Moving circle/icon with direction indicator
- **Waypoints**: Small circles during boundary/obstacle definition

**Acceptance Criteria**:
- Clear visual distinction between all elements
- Smooth robot animation during simulation
- Path re-routing visually apparent when dynamic obstacles encountered
- Canvas responsive to mouse clicks for waypoint placement

### FR-S03: Obstacle Management (Right Panel)
**Priority**: High  
**Description**: List and manage all defined obstacles with easy removal capability.

**Features**:
- **Obstacle List**: Show all obstacles with type (static/dynamic)
- **Delete Buttons**: Individual delete button for each obstacle
- **Status Info**: Display current robot position, speed, and status
- **Statistics**: Show path length, coverage area, estimated time

**Acceptance Criteria**:
- All obstacles listed with clear identification
- Delete functionality immediately removes obstacle from canvas
- Status updates in real-time during simulation
- Statistics calculated and displayed after planning

### FR-S04: Boundary Definition
**Priority**: Critical  
**Description**: Allow interactive definition of mowing area boundary.

**Workflow**:
1. Click BOUNDARY button to enter boundary mode
2. Click on canvas to place waypoints
3. Visual feedback shows current polygon
4. Click FINISH BOUNDARY to complete and validate polygon
5. Boundary must be closed polygon with minimum 3 points

**Acceptance Criteria**:
- Minimum 3 waypoints required
- Visual preview of boundary as waypoints added
- Automatic polygon closure on finish
- Validation prevents self-intersecting polygons

### FR-S05: Path Planning Algorithm
**Priority**: Critical  
**Description**: Implement Adaptive Boustrophedon pattern for coverage planning.

**Algorithm Requirements**:
- Generate parallel stripes covering entire boundary area
- Avoid static obstacles with safety margin
- Optimize stripe direction for minimum path length
- Connect stripes with smooth turns where possible

**Acceptance Criteria**:
- Complete coverage of accessible area (>95%)
- Proper obstacle avoidance with safety margin
- Reasonable path optimization
- Results delivered within 5 seconds for areas up to 1000m²

### FR-S06: Dynamic Obstacle Handling
**Priority**: High  
**Description**: Detect dynamic obstacles during simulation and re-route path.

**Behavior**:
- Dynamic obstacles invisible during initial planning
- Robot detects obstacle when within detection range
- Automatic re-routing using RRT* algorithm
- Continue to goal after obstacle clearance

**Acceptance Criteria**:
- Dynamic obstacles not considered in initial planning
- Robot stops when obstacle detected
- Re-routing successful in >90% of cases
- Visual indication of new path vs original path

### FR-S07: Robot Simulation
**Priority**: High  
**Description**: Simulate robot movement along planned path with realistic behavior.

**Features**:
- Smooth movement along waypoints
- Configurable speed control
- Pause/resume capability
- Reset to starting position
- Progress tracking

**Acceptance Criteria**:
- Smooth visual movement between waypoints
- Speed control responsive (0.1x to 5x normal speed)
- Pause/resume works without position loss
- Progress indication available

## Non-Functional Requirements (Simplified)

### NFR-S01: Performance
**Description**: Adequate performance for local development and testing.

**Requirements**:
- Path planning: <5 seconds for areas up to 1000 pixels²
- Re-planning: <2 seconds for dynamic obstacle avoidance
- UI responsiveness: <100ms for button clicks
- Simulation: 60fps smooth animation

### NFR-S02: Usability
**Description**: Simple and intuitive interface for experimentation.

**Requirements**:
- No user manual required for basic operation
- Visual feedback for all actions
- Clear error messages for invalid operations
- Consistent UI behavior across all functions

### NFR-S03: Maintainability
**Description**: Easy to modify and extend for experimentation.

**Requirements**:
- Simple file-based architecture
- Clear separation between UI and algorithms
- Minimal dependencies
- Well-commented code for algorithm understanding

### NFR-S04: Portability
**Description**: Run on standard laptop without special setup.

**Requirements**:
- Standard C compiler for algorithm code
- Common web browser support (Chrome, Firefox, Edge)
- Node.js as only external dependency
- No database or complex infrastructure

## Technical Constraints

### TC-S01: Technology Limitations
- **C Code**: Standard C99, no ESP32 specific libraries
- **Web Interface**: HTML5 Canvas, vanilla JavaScript (no frameworks)
- **Server**: Node.js with minimal dependencies
- **Data Storage**: JSON files only, no database

### TC-S02: Scope Limitations
- **Single User**: No multi-user support
- **Local Only**: No network deployment
- **No Authentication**: Open access on localhost
- **No Persistence**: Data lost on restart (except current session files)

### TC-S03: Algorithm Constraints
- **2D Only**: No elevation or 3D considerations
- **Simplified Physics**: No motor dynamics or realistic constraints
- **Perfect Sensors**: Assume perfect positioning and obstacle detection
- **Static Environment**: Environment doesn't change during planning

## Data Structures (Simplified)

### Canvas Coordinates
```json
{
  "x": 150,
  "y": 200
}
```

### Boundary Definition
```json
{
  "boundary": [
    {"x": 100, "y": 100},
    {"x": 300, "y": 100},
    {"x": 300, "y": 200},
    {"x": 100, "y": 200}
  ],
  "closed": true
}
```

### Obstacle Definition
```json
{
  "obstacles": [
    {
      "id": "obstacle_1",
      "type": "static",
      "points": [
        {"x": 150, "y": 120},
        {"x": 170, "y": 120},
        {"x": 170, "y": 140},
        {"x": 150, "y": 140}
      ]
    }
  ]
}
```

### Path Result
```json
{
  "path": [
    {"x": 100, "y": 110, "heading": 0},
    {"x": 290, "y": 110, "heading": 0},
    {"x": 290, "y": 125, "heading": 90}
  ],
  "stats": {
    "total_length": 205.5,
    "coverage_area": 19800,
    "waypoint_count": 45
  }
}
```

### Robot State
```json
{
  "robot": {
    "position": {"x": 150, "y": 110},
    "heading": 45,
    "speed": 1.0,
    "status": "moving",
    "current_waypoint": 5,
    "total_waypoints": 45
  }
}
```

## Success Criteria (Simplified)

### Immediate Goals
1. **Functional UI**: All controls work as specified
2. **Basic Planning**: Boustrophedon algorithm generates valid paths
3. **Obstacle Avoidance**: Static obstacles properly avoided
4. **Simulation**: Robot moves smoothly along planned path

### Extended Goals
1. **Dynamic Re-routing**: RRT* successfully handles dynamic obstacles
2. **Path Optimization**: Generated paths reasonably efficient
3. **User Experience**: Intuitive and responsive interface
4. **Algorithm Validation**: Results suitable for ESP32 port planning

This simplified specification focuses on rapid prototyping and algorithm validation while maintaining the core path planning functionality needed for future ESP32 implementation.
