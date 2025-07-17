# Development Guidelines for AI Agents (Prototype)

## Overview

This document provides development guidelines for AI agents working on the BladeOfGrass **local prototype**. These guidelines focus on KISS principles and rapid algorithm validation rather than production system development.

## Prototype-Specific Principles

### 1. KISS Architecture
**CRITICAL**: Keep everything simple for the prototype.

- **Frontend**: Single HTML file with vanilla JavaScript (no frameworks)
- **Backend**: Simple Node.js server (minimal dependencies)
- **Algorithms**: Standard C code (no ESP32 dependencies)
- **Communication**: JSON files (no database, no complex protocols)

**Example of CORRECT simplicity:**
```c
// ✓ CORRECT - Simple file I/O for prototype
void write_path_to_file(waypoint_t* path, size_t count) {
    FILE* file = fopen("output.json", "w");
    fprintf(file, "{\"path\":[");
    for (size_t i = 0; i < count; i++) {
        fprintf(file, "{\"x\":%.2f,\"y\":%.2f}", path[i].x, path[i].y);
        if (i < count - 1) fprintf(file, ",");
    }
    fprintf(file, "]}");
    fclose(file);
}
```

**Example of WRONG complexity:**
```c
// ✗ WRONG - Too complex for prototype
typedef struct {
    message_type_t type;
    uint32_t sequence_id;
    uint32_t timestamp_ms;
    uint16_t payload_length;
    uint8_t payload[];
} protocol_message_t; // This is overkill for prototype!
```

### 2. Coordinate System (Simplified)
**Use pixel coordinates, not GPS coordinates for the prototype.**

```c
// ✓ CORRECT - Simple pixel coordinates
typedef struct {
    float x;    // Canvas X coordinate (pixels)
    float y;    // Canvas Y coordinate (pixels)
} point_t;

typedef struct {
    float x;
    float y;
    float heading; // Direction in degrees (0-360)
} waypoint_t;
```

### 3. Algorithm Implementation (Core Remains Same)

#### Boustrophedon Pattern (Simplified)
```c
// ✓ CORRECT - Focus on algorithm, simple I/O
typedef struct {
    point_t* boundary_points;
    size_t boundary_count;
    point_t* obstacle_points;
    size_t obstacle_count;
    float cutting_width;   // in pixels
    float overlap;         // in pixels
} planning_input_t;

typedef struct {
    waypoint_t* waypoints;
    size_t waypoint_count;
    float total_length;
    float coverage_area;
} planning_result_t;

planning_result_t* plan_coverage(planning_input_t* input) {
    // 1. Read from input.json
    // 2. Generate stripes using Boustrophedon
    // 3. Avoid obstacles
    // 4. Write to output.json
    // 5. Return result
}
```

#### RRT* Implementation (Simplified)
```c
// ✓ CORRECT - Simple node structure for prototype
typedef struct rrt_node {
    point_t position;
    struct rrt_node* parent;
    float cost;
    int id;
} rrt_node_t;

// Simple obstacle checking for prototype
bool is_collision_free(point_t start, point_t end, point_t* obstacles, size_t count) {
    // Simple line-polygon intersection check
    // No complex safety margins needed for prototype
}
```

### 4. File Communication Protocol

#### Input JSON Format
```json
{
  "command": "plan",
  "boundary": [
    {"x": 100, "y": 100},
    {"x": 300, "y": 100},
    {"x": 300, "y": 200},
    {"x": 100, "y": 200}
  ],
  "static_obstacles": [
    [
      {"x": 150, "y": 120},
      {"x": 170, "y": 120},
      {"x": 170, "y": 140},
      {"x": 150, "y": 140}
    ]
  ],
  "dynamic_obstacles": [
    [
      {"x": 200, "y": 150},
      {"x": 220, "y": 150},
      {"x": 220, "y": 170},
      {"x": 200, "y": 170}
    ]
  ],
  "parameters": {
    "cutting_width": 20,
    "overlap": 5,
    "robot_radius": 10
  }
}
```

#### Output JSON Format
```json
{
  "success": true,
  "path": [
    {"x": 100, "y": 110, "heading": 0},
    {"x": 290, "y": 110, "heading": 0},
    {"x": 290, "y": 125, "heading": 90}
  ],
  "stats": {
    "total_distance": 205.5,
    "coverage_area": 19800,
    "waypoint_count": 45,
    "computation_time_ms": 123
  },
  "error": null
}
```

## Implementation Standards (Simplified)

### 1. C Code Standards
```c
// ✓ CORRECT - Simple, readable C code
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>

// Simple error handling
typedef enum {
    SUCCESS = 0,
    ERROR_FILE_NOT_FOUND = -1,
    ERROR_INVALID_INPUT = -2,
    ERROR_NO_SOLUTION = -3
} result_code_t;

// Simple memory management
void* safe_malloc(size_t size) {
    void* ptr = malloc(size);
    if (!ptr) {
        printf("ERROR: Memory allocation failed\n");
        exit(1);
    }
    return ptr;
}

// Simple file operations
planning_input_t* read_input_file(const char* filename) {
    FILE* file = fopen(filename, "r");
    if (!file) return NULL;
    
    // Parse JSON manually (keep it simple)
    // or use a lightweight JSON parser
    
    fclose(file);
    return input;
}
```

### 2. JavaScript Standards (Frontend)
```javascript
// ✓ CORRECT - Simple vanilla JavaScript
class PathPlannerUI {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.mode = 'none'; // 'boundary', 'obstacle', 'dynamic_obstacle'
        this.boundary = [];
        this.obstacles = [];
        this.dynamicObstacles = [];
        this.currentPath = [];
        this.robot = { x: 0, y: 0, heading: 0 };
    }
    
    // Simple button handlers
    reset() {
        this.boundary = [];
        this.obstacles = [];
        this.dynamicObstacles = [];
        this.currentPath = [];
        this.clearCanvas();
    }
    
    startBoundary() {
        this.mode = 'boundary';
        this.boundary = [];
    }
    
    // Simple drawing functions
    drawBoundary() {
        if (this.boundary.length < 2) return;
        
        this.ctx.strokeStyle = 'green';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.boundary[0].x, this.boundary[0].y);
        
        for (let i = 1; i < this.boundary.length; i++) {
            this.ctx.lineTo(this.boundary[i].x, this.boundary[i].y);
        }
        
        if (this.boundary.length > 2) {
            this.ctx.closePath(); // Close the polygon
        }
        this.ctx.stroke();
    }
}
```

### 3. Node.js Server (Minimal)
```javascript
// ✓ CORRECT - Simple Express server
const express = require('express');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve HTML/CSS/JS files

// Simple endpoint for path planning
app.post('/api/plan', async (req, res) => {
    try {
        // Write input to file
        fs.writeFileSync('input.json', JSON.stringify(req.body, null, 2));
        
        // Run C executable
        const child = spawn('./path_planner');
        
        child.on('close', (code) => {
            if (code === 0) {
                // Read result
                const result = JSON.parse(fs.readFileSync('output.json', 'utf8'));
                res.json(result);
            } else {
                res.status(500).json({ error: 'Planning failed' });
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

## Testing (Simplified)

### Unit Testing for C Code
```c
// Simple test framework - no complex testing libraries
void test_boustrophedon_simple_rectangle() {
    printf("Testing Boustrophedon with simple rectangle...\n");
    
    // Setup
    point_t boundary[] = {{0,0}, {100,0}, {100,50}, {0,50}};
    planning_input_t input = {
        .boundary_points = boundary,
        .boundary_count = 4,
        .cutting_width = 10,
        .overlap = 2
    };
    
    // Execute
    planning_result_t* result = plan_coverage(&input);
    
    // Verify
    if (result && result->waypoint_count > 0) {
        printf("✓ PASS: Generated %zu waypoints\n", result->waypoint_count);
    } else {
        printf("✗ FAIL: No waypoints generated\n");
    }
    
    free(result);
}

int main() {
    printf("Running simple tests...\n");
    test_boustrophedon_simple_rectangle();
    printf("Tests complete.\n");
    return 0;
}
```

## Common Pitfalls (Prototype-Specific)

### 1. Over-Engineering
```c
// ✗ WRONG - Too complex for prototype
typedef struct {
    double latitude;   // GPS not needed for prototype
    double longitude;
    uint32_t timestamp_ms;
    bool valid;
} gps_coordinate_t;

// ✓ CORRECT - Simple for prototype
typedef struct {
    float x, y;  // Canvas pixels are sufficient
} point_t;
```

### 2. Complex Communication
```javascript
// ✗ WRONG - WebSocket complexity not needed
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = function(event) { /* complex protocol */ };

// ✓ CORRECT - Simple HTTP requests
fetch('/api/plan', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
}).then(response => response.json());
```

### 3. Complex Data Structures
```c
// ✗ WRONG - Over-engineered for prototype
typedef struct memory_manager {
    void* memory_pool;
    size_t pool_size;
    memory_block_t* free_blocks;
} memory_manager_t;

// ✓ CORRECT - Simple malloc/free for prototype
waypoint_t* path = malloc(count * sizeof(waypoint_t));
// ... use path ...
free(path);
```

## Development Checklist for AI Agents

### ✅ Before Starting
- [ ] Read this simplified guidelines document
- [ ] Understand this is a PROTOTYPE, not production code
- [ ] Focus on algorithm validation, not optimization
- [ ] Use pixel coordinates, not GPS coordinates

### ✅ C Algorithm Implementation
- [ ] Use standard C99 (no ESP32 dependencies)
- [ ] Read from input.json, write to output.json
- [ ] Simple error handling (printf + exit)
- [ ] Focus on algorithm correctness over optimization

### ✅ JavaScript Frontend
- [ ] Single HTML file with embedded CSS/JS
- [ ] Vanilla JavaScript (no frameworks)
- [ ] Canvas 2D for drawing
- [ ] Simple event handlers for buttons

### ✅ Node.js Backend
- [ ] Minimal Express server
- [ ] File-based communication with C executable
- [ ] Simple error handling
- [ ] Static file serving for HTML

### ✅ Testing
- [ ] Simple printf-based tests for C code
- [ ] Manual testing through web interface
- [ ] Focus on functional testing, not performance

By following these simplified guidelines, AI agents can quickly create a working prototype that validates the core path planning algorithms without getting bogged down in production complexities.

### 2. C Implementation Standards for Model Layer

#### Memory Management
```c
// ✓ CORRECT - Always check allocations
waypoint_t* path = malloc(count * sizeof(waypoint_t));
if (!path) {
    log_error("Failed to allocate memory for path");
    return NULL;
}

// ✓ CORRECT - Clean up resources
void cleanup_path_planner(path_planner_t* planner) {
    if (planner) {
        free(planner->waypoints);
        free(planner->obstacles);
        free(planner);
    }
}

// ✗ WRONG - No null check
waypoint_t* path = malloc(count * sizeof(waypoint_t));
path[0] = start_point; // Could crash if malloc failed
```

#### Error Handling
```c
// ✓ CORRECT - Proper error codes
typedef enum {
    PLAN_SUCCESS = 0,
    PLAN_ERROR_INVALID_BOUNDARY = -1,
    PLAN_ERROR_NO_MEMORY = -2,
    PLAN_ERROR_NO_PATH_FOUND = -3
} plan_result_t;

plan_result_t generate_coverage_path(boundary_t* boundary, 
                                   waypoint_t** out_path, 
                                   size_t* out_count) {
    if (!boundary || !out_path || !out_count) {
        return PLAN_ERROR_INVALID_BOUNDARY;
    }
    
    // Implementation...
    return PLAN_SUCCESS;
}
```

#### GPS Coordinate Handling
```c
// ✓ CORRECT - Consistent coordinate structure
typedef struct {
    double latitude;   // Use double for precision
    double longitude;  // Use double for precision
    float altitude;    // Float sufficient for altitude
    uint32_t timestamp_ms;
    bool valid;
} gps_coordinate_t;

// ✓ CORRECT - GPS validation
bool is_valid_gps_coordinate(const gps_coordinate_t* coord) {
    return coord && coord->valid &&
           coord->latitude >= -90.0 && coord->latitude <= 90.0 &&
           coord->longitude >= -180.0 && coord->longitude <= 180.0;
}
```

### 3. Real-time Performance Requirements

#### Timing Constraints
```c
// ✓ CORRECT - Respect timing constraints
#define MAX_PLANNING_TIME_MS    2000    // 2 seconds max for path planning
#define MAX_OBSTACLE_RESPONSE_MS 500    // 500ms max for obstacle response

uint32_t start_time = get_time_ms();
plan_result_t result = calculate_path(boundary, obstacles);
uint32_t elapsed = get_time_ms() - start_time;

if (elapsed > MAX_PLANNING_TIME_MS) {
    log_warning("Planning exceeded time limit: %dms", elapsed);
}
```

#### Memory Constraints
```c
// ✓ CORRECT - Monitor memory usage
#define MAX_PSRAM_USAGE_BYTES  (16 * 1024 * 1024 * 0.8)  // 80% of 16MB

size_t get_memory_usage(void) {
    return heap_caps_get_total_size(MALLOC_CAP_SPIRAM) - 
           heap_caps_get_free_size(MALLOC_CAP_SPIRAM);
}

bool check_memory_available(size_t required_bytes) {
    size_t current_usage = get_memory_usage();
    return (current_usage + required_bytes) < MAX_PSRAM_USAGE_BYTES;
}
```

## Algorithm Implementation Guidelines

### 1. Boustrophedon Pattern Implementation

#### DO:
```c
// ✓ Validate inputs thoroughly
static bool validate_boundary(const polygon_t* boundary) {
    if (!boundary || boundary->vertex_count < 3) {
        return false;
    }
    
    // Check for self-intersections
    if (polygon_has_self_intersections(boundary)) {
        return false;
    }
    
    return true;
}

// ✓ Use consistent naming conventions
typedef struct {
    float cutting_width_m;      // Always specify units
    float overlap_width_m;      // in variable names
    float min_stripe_length_m;
} cutting_parameters_t;

// ✓ Implement proper error recovery
stripe_result_t generate_stripes(const polygon_t* boundary, 
                               const cutting_parameters_t* params) {
    stripe_result_t result = {0};
    
    if (!validate_boundary(boundary) || !params) {
        result.error_code = STRIPE_ERROR_INVALID_INPUT;
        return result;
    }
    
    // Try primary direction first
    result = try_generate_stripes(boundary, params, params->primary_direction);
    
    // If failed, try alternative directions
    if (result.error_code != STRIPE_SUCCESS) {
        for (int angle = 0; angle < 180; angle += 45) {
            result = try_generate_stripes(boundary, params, angle);
            if (result.error_code == STRIPE_SUCCESS) {
                break;
            }
        }
    }
    
    return result;
}
```

#### DON'T:
```c
// ✗ Don't ignore edge cases
float calculate_stripe_count(float area_width, float stripe_spacing) {
    return area_width / stripe_spacing; // What if stripe_spacing is 0?
}

// ✗ Don't use magic numbers
if (turn_angle > 1.57) { // What is 1.57? Use #define PI_2 1.57079632679
    // handle sharp turn
}

// ✗ Don't mix coordinate systems
void add_waypoint(float lat, float lon, int x, int y) { // Confusing!
    // Which coordinate system are we using?
}
```

### 2. RRT* Implementation

#### DO:
```c
// ✓ Use proper data structures
typedef struct rrt_node {
    gps_coordinate_t position;
    struct rrt_node* parent;
    float cost_from_start;
    float cost_to_goal_heuristic;
    node_id_t id;
} rrt_node_t;

// ✓ Implement incremental planning
rrt_result_t plan_incremental(rrt_context_t* context, 
                             int max_iterations_this_cycle) {
    rrt_result_t result = {0};
    
    for (int i = 0; i < max_iterations_this_cycle && !result.path_found; i++) {
        // Single iteration of RRT*
        rrt_iteration_result_t iter_result = rrt_single_iteration(context);
        
        // Check if we should yield to higher priority tasks
        if (should_yield_cpu()) {
            result.iterations_completed = i + 1;
            result.should_continue = true;
            break;
        }
        
        if (iter_result.reached_goal) {
            result.path_found = true;
            result.path = extract_path(context);
        }
    }
    
    return result;
}

// ✓ Optimize collision detection
bool is_collision_free_optimized(const gps_coordinate_t* start,
                                const gps_coordinate_t* end,
                                const obstacle_map_t* obstacles) {
    // Quick bounding box check first
    if (!bounding_boxes_intersect(start, end, obstacles->bounding_box)) {
        return true;
    }
    
    // Detailed collision check only if necessary
    return detailed_collision_check(start, end, obstacles);
}
```

### 3. Path Smoothing Guidelines

```c
// ✓ CORRECT - Configurable smoothing parameters
typedef struct {
    float max_turn_angle_rad;
    float min_turn_radius_m;
    int max_iterations;
    float position_tolerance_m;
    bool preserve_endpoints;
} smoothing_config_t;

// ✓ CORRECT - Iterative improvement with validation
waypoint_t* smooth_path_iterative(const waypoint_t* original_path,
                                 size_t path_length,
                                 const smoothing_config_t* config,
                                 const obstacle_map_t* obstacles) {
    waypoint_t* current_path = duplicate_path(original_path, path_length);
    bool improved = true;
    
    for (int iter = 0; iter < config->max_iterations && improved; iter++) {
        improved = false;
        
        for (size_t i = 1; i < path_length - 1; i++) {
            waypoint_t candidate = calculate_smoothed_waypoint(
                current_path[i-1], current_path[i], current_path[i+1], config);
            
            if (is_improvement(current_path[i], candidate, config) &&
                is_collision_free_point(&candidate.position, obstacles)) {
                current_path[i] = candidate;
                improved = true;
            }
        }
    }
    
    return current_path;
}
```

## Testing and Validation Guidelines

### 1. Unit Testing Requirements

Every function must have corresponding unit tests:

```c
// ✓ CORRECT - Comprehensive test coverage
void test_generate_stripes_valid_boundary(void) {
    // Setup
    polygon_t boundary = create_test_rectangle(10.0, 5.0);
    cutting_parameters_t params = {
        .cutting_width_m = 0.2,
        .overlap_width_m = 0.05,
        .min_stripe_length_m = 1.0
    };
    
    // Execute
    stripe_result_t result = generate_stripes(&boundary, &params);
    
    // Verify
    assert(result.error_code == STRIPE_SUCCESS);
    assert(result.stripe_count > 0);
    assert(result.total_length > 0);
    
    // Verify coverage
    float expected_coverage = boundary.area * 0.95; // 95% minimum
    float actual_coverage = calculate_coverage_area(result.stripes, result.stripe_count);
    assert(actual_coverage >= expected_coverage);
    
    // Cleanup
    cleanup_stripe_result(&result);
    cleanup_polygon(&boundary);
}

void test_generate_stripes_invalid_input(void) {
    cutting_parameters_t params = {0.2, 0.05, 1.0};
    
    // Test null boundary
    stripe_result_t result = generate_stripes(NULL, &params);
    assert(result.error_code == STRIPE_ERROR_INVALID_INPUT);
    
    // Test null parameters
    polygon_t boundary = create_test_rectangle(10.0, 5.0);
    result = generate_stripes(&boundary, NULL);
    assert(result.error_code == STRIPE_ERROR_INVALID_INPUT);
    
    cleanup_polygon(&boundary);
}
```

### 2. Integration Testing

```c
// ✓ CORRECT - End-to-end test scenarios
void test_complete_planning_cycle(void) {
    // Setup realistic scenario
    boundary_t boundary = load_test_boundary("test_area_1000sqm.json");
    obstacle_t obstacles[5];
    load_test_obstacles(obstacles, 5, "test_obstacles.json");
    
    // Execute complete planning cycle
    planning_context_t* context = init_planning_context(&boundary, obstacles, 5);
    
    // Test global planning
    global_plan_result_t global_result = generate_global_plan(context);
    assert(global_result.success);
    assert(global_result.coverage_percentage >= 95.0);
    
    // Test local planning with simulated obstacle
    add_dynamic_obstacle(context, create_test_obstacle(5.0, 5.0, 1.0));
    local_plan_result_t local_result = replan_local_path(context);
    assert(local_result.success);
    assert(local_result.path_valid);
    
    // Cleanup
    cleanup_planning_context(context);
}
```

### 3. Performance Testing

```c
// ✓ CORRECT - Performance benchmarks
void benchmark_planning_algorithms(void) {
    const test_case_t test_cases[] = {
        {100,  "Small area (100m²)",   1000},  // area_sqm, description, max_time_ms
        {500,  "Medium area (500m²)",  2000},
        {1000, "Large area (1000m²)",  3000},
        {3000, "Max area (3000m²)",    5000}
    };
    
    for (size_t i = 0; i < ARRAY_SIZE(test_cases); i++) {
        boundary_t boundary = generate_test_area(test_cases[i].area_sqm);
        
        uint32_t start_time = get_time_ms();
        planning_result_t result = plan_complete_coverage(&boundary);
        uint32_t elapsed_time = get_time_ms() - start_time;
        
        printf("Test case: %s\n", test_cases[i].description);
        printf("  Planning time: %d ms (max: %d ms)\n", 
               elapsed_time, test_cases[i].max_time_ms);
        printf("  Memory usage: %zu bytes\n", get_memory_usage());
        printf("  Coverage: %.1f%%\n", result.coverage_percentage);
        
        assert(elapsed_time <= test_cases[i].max_time_ms);
        assert(result.coverage_percentage >= 95.0);
        
        cleanup_boundary(&boundary);
        cleanup_planning_result(&result);
    }
}
```

## Code Quality Standards

### 1. Documentation Requirements

```c
/**
 * @brief Generates coverage path using Adaptive Boustrophedon pattern
 * 
 * This function creates a complete coverage path for the given boundary area,
 * avoiding static obstacles and optimizing for cutting efficiency.
 * 
 * @param boundary      Polygon defining the area to be covered (must be valid)
 * @param obstacles     Array of obstacle polygons (can be NULL if count is 0)
 * @param obstacle_count Number of obstacles in the array
 * @param params        Cutting parameters (width, overlap, etc.)
 * @param out_path      [OUT] Generated path waypoints (caller must free)
 * @param out_count     [OUT] Number of waypoints in the path
 * 
 * @return PLAN_SUCCESS on success, error code on failure
 * 
 * @pre boundary must be a valid, non-self-intersecting polygon
 * @pre params must contain valid positive values
 * @post If successful, out_path contains valid GPS coordinates
 * @post Memory allocated for out_path must be freed by caller
 * 
 * @note Time complexity: O(n log n) where n is number of boundary vertices
 * @note Memory usage: O(m) where m is number of generated waypoints
 * 
 * Example usage:
 * @code
 * boundary_t area = load_boundary_from_gps();
 * obstacle_t obstacles[2] = {...};
 * cutting_parameters_t params = {0.2, 0.05, 1.0};
 * 
 * waypoint_t* path = NULL;
 * size_t count = 0;
 * 
 * plan_result_t result = generate_coverage_path(&area, obstacles, 2, 
 *                                              &params, &path, &count);
 * if (result == PLAN_SUCCESS) {
 *     execute_path(path, count);
 *     free(path);
 * }
 * @endcode
 */
plan_result_t generate_coverage_path(const boundary_t* boundary,
                                   const obstacle_t* obstacles,
                                   size_t obstacle_count,
                                   const cutting_parameters_t* params,
                                   waypoint_t** out_path,
                                   size_t* out_count);
```

### 2. Error Handling Standards

```c
// ✓ CORRECT - Comprehensive error handling
typedef enum {
    // Success codes
    RESULT_SUCCESS = 0,
    
    // Input validation errors
    ERROR_NULL_POINTER = -1,
    ERROR_INVALID_BOUNDARY = -2,
    ERROR_INVALID_PARAMETERS = -3,
    ERROR_EMPTY_AREA = -4,
    
    // Resource errors  
    ERROR_OUT_OF_MEMORY = -10,
    ERROR_INSUFFICIENT_PSRAM = -11,
    ERROR_TIMEOUT = -12,
    
    // Algorithm errors
    ERROR_NO_SOLUTION_FOUND = -20,
    ERROR_ALGORITHM_FAILED = -21,
    ERROR_CONVERGENCE_FAILED = -22,
    
    // Hardware errors
    ERROR_GPS_UNAVAILABLE = -30,
    ERROR_SENSOR_FAILURE = -31,
    ERROR_COMMUNICATION_FAILURE = -32
} result_code_t;

// ✓ CORRECT - Detailed error information
typedef struct {
    result_code_t code;
    char message[128];
    const char* function;
    int line;
    uint32_t timestamp;
} error_info_t;

#define RETURN_ERROR(code, msg) \
    do { \
        log_error_detailed(code, msg, __FUNCTION__, __LINE__); \
        return code; \
    } while(0)

// Usage example:
plan_result_t validate_cutting_parameters(const cutting_parameters_t* params) {
    if (!params) {
        RETURN_ERROR(ERROR_NULL_POINTER, "Cutting parameters cannot be NULL");
    }
    
    if (params->cutting_width_m <= 0.0 || params->cutting_width_m > 1.0) {
        RETURN_ERROR(ERROR_INVALID_PARAMETERS, 
                    "Cutting width must be between 0 and 1 meter");
    }
    
    if (params->overlap_width_m < 0.0 || 
        params->overlap_width_m >= params->cutting_width_m) {
        RETURN_ERROR(ERROR_INVALID_PARAMETERS, 
                    "Overlap must be less than cutting width");
    }
    
    return RESULT_SUCCESS;
}
```

## Communication Protocols

### 1. Model-Controller Interface

```c
// ✓ CORRECT - Structured communication protocol
typedef enum {
    MSG_TYPE_CONFIG_UPDATE = 1,
    MSG_TYPE_START_PLANNING = 2,
    MSG_TYPE_STOP_PLANNING = 3,
    MSG_TYPE_STATUS_REQUEST = 4,
    MSG_TYPE_STATUS_RESPONSE = 5,
    MSG_TYPE_ERROR_REPORT = 6
} message_type_t;

typedef struct {
    message_type_t type;
    uint32_t sequence_id;
    uint32_t timestamp_ms;
    uint16_t payload_length;
    uint8_t payload[];
} protocol_message_t;

// Specific message structures
typedef struct {
    cutting_parameters_t cutting_params;
    float max_speed_ms;
    uint32_t timeout_ms;
} config_update_payload_t;

typedef struct {
    boundary_t boundary;
    obstacle_t obstacles[MAX_OBSTACLES];
    uint8_t obstacle_count;
} start_planning_payload_t;

typedef struct {
    planning_state_t state;
    float progress_percentage;
    gps_coordinate_t current_position;
    uint32_t estimated_completion_ms;
    error_info_t last_error;
} status_response_payload_t;
```

### 2. Data Serialization

```c
// ✓ CORRECT - Efficient binary serialization
size_t serialize_gps_coordinate(const gps_coordinate_t* coord, uint8_t* buffer) {
    size_t offset = 0;
    
    memcpy(buffer + offset, &coord->latitude, sizeof(double));
    offset += sizeof(double);
    
    memcpy(buffer + offset, &coord->longitude, sizeof(double));
    offset += sizeof(double);
    
    memcpy(buffer + offset, &coord->altitude, sizeof(float));
    offset += sizeof(float);
    
    memcpy(buffer + offset, &coord->timestamp_ms, sizeof(uint32_t));
    offset += sizeof(uint32_t);
    
    buffer[offset] = coord->valid ? 1 : 0;
    offset += 1;
    
    return offset;
}

size_t deserialize_gps_coordinate(const uint8_t* buffer, gps_coordinate_t* coord) {
    size_t offset = 0;
    
    memcpy(&coord->latitude, buffer + offset, sizeof(double));
    offset += sizeof(double);
    
    memcpy(&coord->longitude, buffer + offset, sizeof(double));
    offset += sizeof(double);
    
    memcpy(&coord->altitude, buffer + offset, sizeof(float));
    offset += sizeof(float);
    
    memcpy(&coord->timestamp_ms, buffer + offset, sizeof(uint32_t));
    offset += sizeof(uint32_t);
    
    coord->valid = buffer[offset] != 0;
    offset += 1;
    
    return offset;
}
```

## Debugging and Monitoring

### 1. Logging Framework

```c
// ✓ CORRECT - Structured logging system
typedef enum {
    LOG_LEVEL_DEBUG = 0,
    LOG_LEVEL_INFO = 1,
    LOG_LEVEL_WARNING = 2,
    LOG_LEVEL_ERROR = 3,
    LOG_LEVEL_CRITICAL = 4
} log_level_t;

#define LOG_DEBUG(fmt, ...)   log_message(LOG_LEVEL_DEBUG, __FUNCTION__, __LINE__, fmt, ##__VA_ARGS__)
#define LOG_INFO(fmt, ...)    log_message(LOG_LEVEL_INFO, __FUNCTION__, __LINE__, fmt, ##__VA_ARGS__)
#define LOG_WARNING(fmt, ...) log_message(LOG_LEVEL_WARNING, __FUNCTION__, __LINE__, fmt, ##__VA_ARGS__)
#define LOG_ERROR(fmt, ...)   log_message(LOG_LEVEL_ERROR, __FUNCTION__, __LINE__, fmt, ##__VA_ARGS__)

// Usage examples:
void generate_coverage_path_internal(const boundary_t* boundary) {
    LOG_INFO("Starting coverage path generation for area %.1f m²", 
             calculate_polygon_area(boundary));
    
    stripe_result_t result = generate_stripes(boundary, &params);
    if (result.error_code != STRIPE_SUCCESS) {
        LOG_ERROR("Stripe generation failed: %s", 
                  get_error_message(result.error_code));
        return;
    }
    
    LOG_DEBUG("Generated %d stripes with total length %.1f m", 
              result.stripe_count, result.total_length);
}
```

### 2. Performance Monitoring

```c
// ✓ CORRECT - Built-in performance tracking
typedef struct {
    const char* operation_name;
    uint32_t start_time_ms;
    uint32_t end_time_ms;
    size_t memory_before;
    size_t memory_after;
    bool success;
} performance_metric_t;

#define PERF_START(name) \
    performance_metric_t perf_##name = { \
        .operation_name = #name, \
        .start_time_ms = get_time_ms(), \
        .memory_before = get_memory_usage(), \
        .success = false \
    }

#define PERF_END(name, success_condition) \
    do { \
        perf_##name.end_time_ms = get_time_ms(); \
        perf_##name.memory_after = get_memory_usage(); \
        perf_##name.success = (success_condition); \
        log_performance_metric(&perf_##name); \
    } while(0)

// Usage:
plan_result_t plan_coverage_path(const boundary_t* boundary) {
    PERF_START(coverage_planning);
    
    plan_result_t result = generate_coverage_path_internal(boundary);
    
    PERF_END(coverage_planning, result == PLAN_SUCCESS);
    
    return result;
}
```

## Common Pitfalls and How to Avoid Them

### 1. GPS Coordinate Precision
```c
// ✗ WRONG - Using float for GPS coordinates
typedef struct {
    float lat, lon;  // Insufficient precision!
} bad_gps_t;

// ✓ CORRECT - Using double for GPS coordinates
typedef struct {
    double latitude, longitude;  // Required precision for centimeter accuracy
} good_gps_t;
```

### 2. Memory Leaks in Path Planning
```c
// ✗ WRONG - Potential memory leak
waypoint_t* generate_path(boundary_t* boundary) {
    waypoint_t* path = malloc(1000 * sizeof(waypoint_t));
    
    if (some_error_condition) {
        return NULL;  // Memory leak!
    }
    
    return path;
}

// ✓ CORRECT - Proper cleanup
plan_result_t generate_path_safe(const boundary_t* boundary, 
                               waypoint_t** out_path, 
                               size_t* out_count) {
    waypoint_t* path = malloc(1000 * sizeof(waypoint_t));
    if (!path) {
        return PLAN_ERROR_NO_MEMORY;
    }
    
    plan_result_t result = generate_path_internal(boundary, path, out_count);
    
    if (result != PLAN_SUCCESS) {
        free(path);  // Clean up on error
        *out_path = NULL;
        *out_count = 0;
        return result;
    }
    
    *out_path = path;
    return PLAN_SUCCESS;
}
```

### 3. Blocking Operations in Real-time Context
```c
// ✗ WRONG - Blocking operation
void update_position(void) {
    while (!gps_fix_available()) {
        delay_ms(100);  // Blocks other operations!
    }
    current_position = read_gps_position();
}

// ✓ CORRECT - Non-blocking with state machine
typedef enum {
    GPS_STATE_WAITING_FIX,
    GPS_STATE_READING,
    GPS_STATE_READY
} gps_state_t;

void update_position_nonblocking(void) {
    static gps_state_t state = GPS_STATE_WAITING_FIX;
    static uint32_t last_check_ms = 0;
    
    uint32_t now = get_time_ms();
    
    switch (state) {
        case GPS_STATE_WAITING_FIX:
            if (now - last_check_ms > 100) {  // Check every 100ms
                if (gps_fix_available()) {
                    state = GPS_STATE_READING;
                }
                last_check_ms = now;
            }
            break;
            
        case GPS_STATE_READING:
            current_position = read_gps_position();
            state = GPS_STATE_READY;
            break;
            
        case GPS_STATE_READY:
            // Position is ready for use
            break;
    }
}
```

## Final Checklist for AI Agents

Before submitting any code changes, verify:

### ✅ Architecture Compliance
- [ ] Code belongs to correct MVC layer
- [ ] No cross-layer dependencies
- [ ] Proper interface definitions

### ✅ Code Quality
- [ ] All functions documented with complete Doxygen comments
- [ ] Error handling for all failure modes
- [ ] Memory allocation/deallocation balanced
- [ ] No magic numbers (use #define constants)

### ✅ Performance
- [ ] Real-time constraints respected
- [ ] Memory usage within limits
- [ ] Algorithms optimized for ESP32

### ✅ Testing
- [ ] Unit tests for all new functions
- [ ] Integration tests for major features
- [ ] Performance benchmarks updated

### ✅ Safety
- [ ] Input validation on all public functions
- [ ] Fail-safe behavior on errors
- [ ] Collision detection thoroughly tested

By following these guidelines, AI agents will produce consistent, high-quality code that meets the project's requirements and maintains system reliability.
