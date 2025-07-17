# Algorithm Specification

## Overview

The BladeOfGrass path planning system implements a hybrid approach combining global coverage planning with local dynamic replanning. This specification details the mathematical foundations, implementation strategies, and optimization techniques for the core algorithms.

## Primary Algorithm: Trapezoidal Decomposition

### Mathematical Foundation

Trapezoidal decomposition is a proven cellular-based coverage planning method that divides complex areas into simple trapezoidal cells. Each cell can be covered efficiently with a lawnmower pattern, and cells are connected via optimized graph traversal.

This approach is based on established academic research and provides optimal coverage for complex boundaries and obstacle configurations.

### Three-Phase Process

The trapezoidal decomposition algorithm follows a proven three-step approach:

**Phase 1: Cellular Decomposition**
- Use vertical sweep line to create trapezoidal cells
- Process events (vertices) from left to right
- Maintain open/closed cell lists during sweep

**Phase 2: Cell Traversal Planning**
- Build neighbor graph from cell adjacency
- Apply graph algorithms (DFS, greedy, or TSP-based)
- Optimize cell visit order to minimize travel

**Phase 3: Coverage Path Synthesis**
- Generate lawnmower pattern within each cell
- Connect cells with transition paths
- Combine into complete coverage plan

### Event-Based Decomposition

#### Event Types and Processing

```c
typedef enum {
    EVENT_OPEN,      // Start new cell
    EVENT_CLOSE,     // End cell
    EVENT_IN,        // Merge from one to two cells
    EVENT_OUT,       // Merge from two to one cell
    EVENT_FLOOR,     // Horizontal edge (bottom)
    EVENT_CEILING    // Horizontal edge (top)
} event_type_t;

typedef struct {
    point_t current_vertex;
    point_t previous_vertex;
    point_t next_vertex;
    event_type_t type;
    float x_coordinate;
} sweep_event_t;

typedef struct {
    edge_t* floor_edge;
    edge_t* ceiling_edge;
    float left_x, right_x;
    polygon_t* neighbors;
    size_t neighbor_count;
    bool is_open;
} trapezoid_cell_t;
```

### Sweep Line Algorithm Implementation

#### Core Decomposition Function

```c
trapezoid_cell_t* perform_trapezoidal_decomposition(polygon_t boundary, 
                                                   polygon_t* obstacles, 
                                                   size_t obstacle_count) {
    // Step 1: Create and sort events
    sweep_event_t* events = create_events_from_polygons(boundary, obstacles, obstacle_count);
    qsort(events, event_count, sizeof(sweep_event_t), compare_events_by_x);
    
    // Step 2: Initialize sweep state
    edge_t* current_edges = NULL;
    trapezoid_cell_t* open_cells = NULL;
    trapezoid_cell_t* closed_cells = NULL;
    
    // Step 3: Process each event
    for (size_t i = 0; i < event_count; i++) {
        process_sweep_event(&events[i], &current_edges, &open_cells, &closed_cells);
    }
    
    // Step 4: Remove degenerate cells and fix connectivity
    remove_degenerate_trapezoids(&closed_cells);
    
    return closed_cells;
}
```

#### Event Processing Logic

```c
void process_sweep_event(sweep_event_t* event, 
                        edge_t** current_edges,
                        trapezoid_cell_t** open_cells,
                        trapezoid_cell_t** closed_cells) {
    // Find floor and ceiling edges
    edge_t* floor = find_floor_edge(*current_edges, event->current_vertex);
    edge_t* ceiling = find_ceiling_edge(*current_edges, event->current_vertex);
    
    // Process based on event type
    switch (event->type) {
        case EVENT_OPEN:
            create_new_trapezoid(open_cells, floor, ceiling, event->x_coordinate);
            break;
        case EVENT_CLOSE:
            close_trapezoid_at_x(open_cells, closed_cells, event->x_coordinate);
            break;
        case EVENT_IN:
            close_one_open_two_trapezoids(open_cells, closed_cells, floor, ceiling, event);
            break;
        case EVENT_OUT:
            close_two_open_one_trapezoids(open_cells, closed_cells, floor, ceiling, event);
            break;
        case EVENT_FLOOR:
        case EVENT_CEILING:
            close_one_open_one_trapezoid(open_cells, closed_cells, floor, ceiling, event);
            break;
    }
    
    // Update current edges
    update_current_edges(current_edges, event);
}
```

#### Cell Traversal Planning

```c
int* plan_cell_traversal(trapezoid_cell_t* cells, size_t cell_count) {
    // Build adjacency graph
    graph_t* cell_graph = build_cell_adjacency_graph(cells, cell_count);
    
    // Apply traversal algorithm (options: DFS, greedy, TSP)
    int* traversal_order = NULL;
    
    #ifdef USE_TSP_TRAVERSAL
        traversal_order = solve_tsp_for_cells(cell_graph);
    #elif defined(USE_GREEDY_TRAVERSAL)
        traversal_order = greedy_nearest_cell_traversal(cell_graph);
    #else
        traversal_order = depth_first_traversal(cell_graph);
    #endif
    
    free_graph(cell_graph);
    return traversal_order;
}
```

#### Coverage Path Synthesis

```c
typedef struct {
    point_t* waypoints;
    size_t waypoint_count;
    float total_length;
    float estimated_time;
} coverage_path_t;

coverage_path_t* synthesize_coverage_path(trapezoid_cell_t* cells, 
                                         int* traversal_order, 
                                         size_t cell_count) {
    coverage_path_t* path = malloc(sizeof(coverage_path_t));
    path->waypoints = malloc(MAX_WAYPOINTS * sizeof(point_t));
    path->waypoint_count = 0;
    
    for (size_t i = 0; i < cell_count; i++) {
        int cell_index = traversal_order[i];
        
        // Generate lawnmower pattern for this cell
        point_t* cell_waypoints = generate_cell_lawnmower_pattern(&cells[cell_index]);
        
        // Add transition path if not first cell
        if (i > 0) {
            add_transition_path(path, &cells[traversal_order[i-1]], &cells[cell_index]);
        }
        
        // Add cell coverage waypoints
        append_waypoints_to_path(path, cell_waypoints);
        
        free(cell_waypoints);
    }
    
    path->total_length = calculate_path_length(path);
    path->estimated_time = estimate_coverage_time(path);
    
    return path;
}

point_t* generate_cell_lawnmower_pattern(trapezoid_cell_t* cell) {
    // Generate back-and-forth pattern within trapezoid
    float cell_width = cell->right_x - cell->left_x;
    float coverage_width = 0.20; // 20cm cutting width
    int pass_count = (int)ceil(cell_width / coverage_width);
    
    point_t* waypoints = malloc(pass_count * 2 * sizeof(point_t));
    
    for (int i = 0; i < pass_count; i++) {
        float x_position = cell->left_x + i * coverage_width;
        
        // Calculate floor and ceiling intersection points
        point_t floor_point = intersect_vertical_line(cell->floor_edge, x_position);
        point_t ceiling_point = intersect_vertical_line(cell->ceiling_edge, x_position);
        
        if (i % 2 == 0) {
            // Bottom to top pass
            waypoints[i*2] = floor_point;
            waypoints[i*2 + 1] = ceiling_point;
        } else {
            // Top to bottom pass
            waypoints[i*2] = ceiling_point;
            waypoints[i*2 + 1] = floor_point;
        }
    }
    
    return waypoints;
            add_waypoint(&path[waypoint_count++], stripes[i].end);
            add_waypoint(&path[waypoint_count++], stripes[i].start);
        }
        
        // Add smooth turn waypoints if not last stripe
        if (i < count - 1 && stripes[i + 1].valid) {
            add_turn_waypoints(&path[waypoint_count], stripes[i], stripes[i + 1], 
                             turn_radius, &waypoint_count);
        }
    }
    
    return path;
}
```

### Direction Optimization Algorithm

```c
float find_optimal_direction(polygon_t* boundary, polygon_t* obstacles, size_t count) {
    float best_direction = 0.0;
    float min_cost = INFINITY;
    
    // Test directions from 0° to 180° in 5° increments
    for (float angle = 0.0; angle < 180.0; angle += 5.0) {
        float cost = calculate_direction_cost(boundary, obstacles, count, angle);
        
        if (cost < min_cost) {
            min_cost = cost;
            best_direction = angle;
        }
    }
    
    // Refine best direction with 1° precision
    float refined_direction = refine_direction(boundary, obstacles, count, 
                                             best_direction, 1.0);
    
    return refined_direction;
}

float calculate_direction_cost(polygon_t* boundary, polygon_t* obstacles, 
                              size_t count, float direction) {
    // Generate stripes for this direction
    stripe_segment_t* test_stripes = generate_stripes_for_direction(boundary, direction);
    
    float total_length = 0.0;
    float turn_penalty = 0.0;
    int segment_count = 0;
    
    for (int i = 0; test_stripes[i].valid; i++) {
        total_length += test_stripes[i].length;
        segment_count++;
        
        // Add penalty for sharp turns
        if (i > 0) {
            float turn_angle = calculate_turn_angle(test_stripes[i-1], test_stripes[i]);
            turn_penalty += fabs(turn_angle) * TURN_PENALTY_WEIGHT;
        }
    }
    
    // Cost function: minimize total path length and turn penalties
    float efficiency = total_length / (segment_count * calculate_optimal_stripe_length(boundary));
    
    free(test_stripes);
    return total_length + turn_penalty + (1.0 - efficiency) * EFFICIENCY_PENALTY;
}
```

## Secondary Algorithm: RRT* for Dynamic Replanning

### Mathematical Foundation

RRT* builds a tree of random samples in the configuration space, optimizing paths as new nodes are added. For obstacle avoidance, it provides asymptotically optimal solutions.

#### Core Equations

**Node Selection Probability:**
```
P(node) = 1/n for uniform sampling
P(node) = bias_factor for goal-biased sampling
```

**Cost Function:**
```
cost(path) = Σ(distance(waypoint_i, waypoint_i+1)) + obstacle_penalty
```

**Steering Function:**
```
steer(x_nearest, x_random, step_size) = {
    x_nearest + step_size * (x_random - x_nearest) / ||x_random - x_nearest||
}
```

### RRT* Implementation

#### Core Data Structures
```c
typedef struct rrt_node {
    gps_coordinate_t position;
    struct rrt_node* parent;
    struct rrt_node** children;
    size_t child_count;
    float cost_from_start;
    float cost_to_goal_estimate;
} rrt_node_t;

typedef struct {
    rrt_node_t* nodes;
    size_t node_count;
    size_t max_nodes;
    gps_coordinate_t start;
    gps_coordinate_t goal;
    float step_size;
    float goal_bias;
    float rewire_radius;
} rrt_tree_t;
```

#### Algorithm Implementation
```c
waypoint_t* rrt_star_plan(gps_coordinate_t start, gps_coordinate_t goal, 
                         polygon_t* obstacles, size_t obstacle_count) {
    rrt_tree_t* tree = init_rrt_tree(start, goal);
    
    for (int i = 0; i < MAX_ITERATIONS && !path_found(tree); i++) {
        // Sample random point
        gps_coordinate_t x_random = sample_random_point(tree->goal, tree->goal_bias);
        
        // Find nearest node
        rrt_node_t* x_nearest = find_nearest_node(tree, x_random);
        
        // Steer towards random point
        gps_coordinate_t x_new = steer(x_nearest->position, x_random, tree->step_size);
        
        // Check collision
        if (is_collision_free(x_nearest->position, x_new, obstacles, obstacle_count)) {
            // Find near nodes for rewiring
            rrt_node_t** near_nodes = find_near_nodes(tree, x_new, tree->rewire_radius);
            
            // Choose parent with minimum cost
            rrt_node_t* x_min = choose_parent(x_nearest, near_nodes, x_new);
            
            // Add new node
            rrt_node_t* new_node = add_node(tree, x_new, x_min);
            
            // Rewire tree
            rewire_tree(tree, new_node, near_nodes);
            
            free(near_nodes);
        }
    }
    
    // Extract path
    waypoint_t* path = extract_path(tree);
    cleanup_rrt_tree(tree);
    
    return path;
}
```

#### Collision Detection
```c
bool is_collision_free(gps_coordinate_t start, gps_coordinate_t end, 
                      polygon_t* obstacles, size_t count) {
    // Check line segment against each obstacle
    for (size_t i = 0; i < count; i++) {
        if (line_intersects_polygon(start, end, &obstacles[i])) {
            return false;
        }
    }
    
    // Add safety margin
    float safety_margin = 0.5; // 50cm clearance
    return minimum_distance_to_obstacles(start, end, obstacles, count) > safety_margin;
}

bool line_intersects_polygon(gps_coordinate_t start, gps_coordinate_t end, 
                           polygon_t* polygon) {
    // Check intersection with each edge of the polygon
    for (size_t i = 0; i < polygon->vertex_count; i++) {
        size_t next = (i + 1) % polygon->vertex_count;
        
        if (line_segments_intersect(start, end, 
                                  polygon->vertices[i], polygon->vertices[next])) {
            return true;
        }
    }
    
    return false;
}
```

## Path Smoothing Algorithm

### Smoothing Objectives
1. Minimize sharp turns for mechanical efficiency
2. Maintain path validity (collision-free)
3. Preserve path optimality within tolerance
4. Ensure smooth velocity profiles

### Implementation
```c
waypoint_t* smooth_path(waypoint_t* original_path, size_t path_length, 
                       float turn_radius, polygon_t* obstacles, size_t obstacle_count) {
    waypoint_t* smoothed_path = malloc(path_length * sizeof(waypoint_t));
    memcpy(smoothed_path, original_path, path_length * sizeof(waypoint_t));
    
    bool improved = true;
    int iterations = 0;
    
    while (improved && iterations < MAX_SMOOTHING_ITERATIONS) {
        improved = false;
        iterations++;
        
        for (size_t i = 1; i < path_length - 1; i++) {
            // Try to create smoother path between i-1 and i+1
            gps_coordinate_t new_waypoint = calculate_smooth_waypoint(
                smoothed_path[i-1].position, 
                smoothed_path[i].position,
                smoothed_path[i+1].position,
                turn_radius
            );
            
            // Check if improvement is valid and collision-free
            if (is_improvement(smoothed_path[i].position, new_waypoint) &&
                is_collision_free_point(new_waypoint, obstacles, obstacle_count)) {
                
                smoothed_path[i].position = new_waypoint;
                improved = true;
            }
        }
    }
    
    return smoothed_path;
}

gps_coordinate_t calculate_smooth_waypoint(gps_coordinate_t prev, 
                                         gps_coordinate_t current, 
                                         gps_coordinate_t next,
                                         float turn_radius) {
    // Calculate vectors
    vector2d_t v1 = vector_from_points(prev, current);
    vector2d_t v2 = vector_from_points(current, next);
    
    // Normalize vectors
    v1 = normalize_vector(v1);
    v2 = normalize_vector(v2);
    
    // Calculate turn angle
    float turn_angle = angle_between_vectors(v1, v2);
    
    // If turn is already smooth enough, return original
    if (fabs(turn_angle) < MAX_ACCEPTABLE_TURN_ANGLE) {
        return current;
    }
    
    // Calculate optimal position for smooth turn
    float offset_distance = turn_radius * tan(fabs(turn_angle) / 2.0);
    
    gps_coordinate_t smooth_point;
    smooth_point.latitude = current.latitude + 
                           offset_distance * (v1.x + v2.x) / 2.0 * GPS_SCALE_LAT;
    smooth_point.longitude = current.longitude + 
                            offset_distance * (v1.y + v2.y) / 2.0 * GPS_SCALE_LON;
    
    return smooth_point;
}
```

## Memory Management Strategy

### Memory Pool Architecture
```c
typedef struct {
    void* memory_pool;
    size_t pool_size;
    size_t used_size;
    memory_block_t* free_blocks;
    memory_block_t* used_blocks;
} memory_manager_t;

typedef struct memory_block {
    void* ptr;
    size_t size;
    struct memory_block* next;
    uint32_t timestamp;
} memory_block_t;

memory_manager_t* init_memory_manager(size_t psram_size) {
    memory_manager_t* manager = malloc(sizeof(memory_manager_t));
    
    // Reserve 80% of PSRAM for path planning
    manager->pool_size = (size_t)(psram_size * 0.8);
    manager->memory_pool = heap_caps_malloc(manager->pool_size, MALLOC_CAP_SPIRAM);
    manager->used_size = 0;
    
    // Initialize free list with entire pool
    manager->free_blocks = malloc(sizeof(memory_block_t));
    manager->free_blocks->ptr = manager->memory_pool;
    manager->free_blocks->size = manager->pool_size;
    manager->free_blocks->next = NULL;
    
    manager->used_blocks = NULL;
    
    return manager;
}
```

### Garbage Collection
```c
void garbage_collect(memory_manager_t* manager, uint32_t current_time) {
    memory_block_t* current = manager->used_blocks;
    memory_block_t* prev = NULL;
    
    while (current != NULL) {
        // Free blocks older than threshold
        if (current_time - current->timestamp > MEMORY_TIMEOUT_MS) {
            // Move to free list
            if (prev) {
                prev->next = current->next;
            } else {
                manager->used_blocks = current->next;
            }
            
            add_to_free_list(manager, current);
            current = prev ? prev->next : manager->used_blocks;
        } else {
            prev = current;
            current = current->next;
        }
    }
    
    // Coalesce adjacent free blocks
    coalesce_free_blocks(manager);
}
```

## Performance Optimization

### Computational Complexity
- **Boustrophedon**: O(n log n) where n = boundary vertices
- **RRT***: O(n log n) where n = number of samples
- **Path Smoothing**: O(m) where m = number of waypoints
- **Memory Management**: O(1) for allocation, O(k) for garbage collection

### Real-time Constraints
```c
// Priority-based execution
typedef enum {
    PRIORITY_EMERGENCY = 0,     // Emergency stop, collision avoidance
    PRIORITY_REALTIME = 1,      // Position updates, sensor reading
    PRIORITY_PLANNING = 2,      // Path planning, optimization
    PRIORITY_BACKGROUND = 3     // Memory cleanup, logging
} task_priority_t;

void execute_planning_cycle(planning_context_t* context) {
    uint32_t cycle_start = get_time_ms();
    
    // Emergency tasks (max 50ms)
    if (has_emergency_tasks()) {
        execute_emergency_tasks(context);
    }
    
    // Real-time tasks (max 100ms)
    if (get_time_ms() - cycle_start < 100) {
        execute_realtime_tasks(context);
    }
    
    // Planning tasks (max 500ms)
    if (get_time_ms() - cycle_start < 500) {
        execute_planning_tasks(context);
    }
    
    // Background tasks (remaining time)
    execute_background_tasks(context);
}
```

### Algorithm Parameters

#### Trapezoidal Decomposition Parameters
```c
#define DEFAULT_CUTTING_WIDTH_M     0.20    // 20cm cutting width
#define DEFAULT_OVERLAP_M           0.05    // 5cm overlap
#define MIN_CELL_AREA_M2            1.0     // Minimum useful cell area
#define CELL_TRAVERSAL_METHOD       TSP     // DFS, GREEDY, or TSP
#define DEGENERATE_CELL_THRESHOLD   0.01    // Threshold for removing tiny cells
```

#### RRT* Parameters
```c
#define RRT_MAX_ITERATIONS          5000    // Maximum planning iterations
#define RRT_STEP_SIZE_M             1.0     // Step size for tree expansion
#define RRT_GOAL_BIAS               0.1     // Probability of sampling goal
#define RRT_REWIRE_RADIUS_M         2.0     // Radius for tree rewiring
#define RRT_SAFETY_MARGIN_M         0.5     // Safety clearance from obstacles
```

#### Smoothing Parameters
```c
#define MAX_TURN_ANGLE_DEG          30.0    // Maximum acceptable turn angle
#define MIN_TURN_RADIUS_M           0.5     // Minimum turn radius
#define SMOOTHING_ITERATIONS        10      // Maximum smoothing iterations
#define SMOOTHING_TOLERANCE_M       0.1     // Position tolerance for smoothing
```

## Implementation Strategy

### Single Algorithm Approach

The BladeOfGrass prototype uses trapezoidal decomposition as the proven coverage planning method:

```c
coverage_path_t* plan_coverage_path(polygon_t boundary, 
                                   polygon_t* obstacles, 
                                   size_t obstacle_count) {
    // Step 1: Perform trapezoidal decomposition
    trapezoid_cell_t* cells = perform_trapezoidal_decomposition(boundary, obstacles, obstacle_count);
    
    // Step 2: Plan cell traversal
    int* traversal_order = plan_cell_traversal(cells, cell_count);
    
    // Step 3: Synthesize coverage path
    coverage_path_t* path = synthesize_coverage_path(cells, traversal_order, cell_count);
    
    // Step 4: Apply RRT* for dynamic replanning if needed
    if (has_dynamic_obstacles()) {
        path = apply_rrt_replanning(path, current_robot_position, dynamic_obstacles);
    }
    
    // Step 5: Smooth the path
    smooth_path_segments(path);
    
    return path;
        } else {
            free_coverage_path(boustrophedon_path);
    return path;
}
```

### Implementation Phases for Prototype

#### Phase 1: Basic Trapezoidal Decomposition (Week 1-2)
- Implement sweep line algorithm
- Basic event processing (OPEN, CLOSE, IN, OUT, FLOOR, CEILING)
- Simple cell traversal with depth-first search
- Test with rectangular areas

#### Phase 2: Enhanced Coverage Planning (Week 3-4)
- Add lawnmower pattern generation within cells
- Implement cell connectivity optimization
- Add transition path planning between cells
- Test with irregular shapes and obstacles

#### Phase 3: RRT* Integration (Week 5-6)
- Implement RRT* for dynamic replanning
- Connect to trapezoidal base plan
- Add obstacle avoidance triggers
- Real-time path adjustment

#### Phase 4: Optimization and Testing (Week 7-8)
- Add TSP-based cell traversal optimization
- Implement path smoothing algorithms
- Performance testing and validation
- Real-world scenario testing

### Algorithm Benefits

#### Why Trapezoidal Decomposition:
- **Proven academic method** with strong mathematical foundation
- **Optimal for complex shapes** with irregular boundaries
- **Natural obstacle handling** through cell boundaries
- **Flexible traversal options** (DFS, greedy, TSP)
- **Complete coverage guarantee** for any polygonal area

#### Performance Characteristics:
- **Computational Complexity**: O(n²) for decomposition, O(k³) for TSP traversal
- **Memory Usage**: O(k) where k is number of cells
- **Path Optimality**: Near-optimal for complex boundaries
- **Scalability**: Handles arbitrary polygon complexity

### Testing and Validation

#### Benchmark Test Cases
1. **Simple Rectangle** (20m × 10m, no obstacles)
2. **L-Shaped Lawn** (Complex boundary)
3. **Garden with Trees** (Multiple circular obstacles)
4. **Narrow Passages** (Connecting areas through gaps)
5. **Real-World Scan** (From actual lawn mapping)

#### Performance Metrics
- **Path Length**: Total distance traveled
- **Coverage Efficiency**: Area covered / path length
- **Computation Time**: Algorithm execution duration
- **Memory Usage**: Peak memory consumption
- **Cell Count**: Number of trapezoids generated

## Conclusion

This algorithm specification provides the mathematical foundation and implementation details for the BladeOfGrass trapezoidal decomposition coverage planning system. The approach combines proven academic methods with practical implementation considerations, ensuring both complete coverage and optimal path generation for robotic lawn mowing applications.

The trapezoidal decomposition method offers significant advantages for complex lawn boundaries and obstacle configurations while maintaining computational efficiency suitable for real-time applications.

This comprehensive algorithm specification provides the mathematical foundation and implementation details necessary for developing the BladeOfGrass path planning system. The hybrid approach ensures both complete coverage and dynamic adaptability while maintaining real-time performance constraints.
