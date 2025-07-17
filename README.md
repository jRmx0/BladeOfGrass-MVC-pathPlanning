# BladeOfGrass Path Planning System

🚨 **Current Ph## 🚀 Quick Start

### Prerequisites
- Node.js installed
- C compiler (GCC)
- Modern web browser

### Documentation
- **[📋 Requirements](./docs/requirements.md)** - What the prototype should do
- **[🧮 Algorithm Specification](./docs/algorithms.md)** - Trapezoidal decomposition & RRT*
- **[🤖 AI Agent Guidelines](./docs/guidelines.md)** - Development guidelines
- **[📚 Documentation Index](./docs/README.md)** - All docs overviewrototype Development**

A simplified experimental prototype for testing path planning algorithms on a laptop, designed following KISS principles. This is **not** the full ESP32 implementation - that will be a future project.

## 🎯 Current Project Scope (Simplified)

### What This Is
- **Local laptop prototype** for algorithm validation
- **Web browser interface** with simple controls
- **C algorithms** running natively (not ESP32)
- **File-based communication** (no database)
- **Experimental tool** for testing Boustrophedon + RRT* algorithms

### What This Is NOT
- Production-ready mower system
- ESP32 implementation (future project)
- Mobile app (web browser only)
- Scalable/cloud solution
- Real GPS/hardware integration

## 🖥️ Interface Design

```
┌─────────────┬──────────────────────┬─────────────┐
│   CONTROLS  │       CANVAS         │  OBSTACLES  │
│             │                      │             │
│ • RESET     │   ┌─────────────┐    │ • Tree1  [X]│
│ • BOUNDARY  │   │ Blank canvas│    │ • Rock2  [X]│
│ • PLAN      │   │ with drawing│    │ • House3 [X]│
│ • ADD OBS   │   │ waypoints   │    │             │
│ • RUN       │   │ and paths   │    │ Status:     │
│ • PAUSE     │   └─────────────┘    │ • Position  │
│ • STOP      │                      │ • Speed     │
│ • [Speed]   │                      │ • Progress  │
└─────────────┴──────────────────────┴─────────────┘
```

## 🏗️ Simplified Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WEB BROWSER   │    │  NODE.JS SERVER │    │   C EXECUTABLE  │
│                 │    │                 │    │                 │
│ • HTML/CSS/JS   │◄──►│ • Express       │◄──►│ • Boustrophedon │
│ • Canvas 2D     │    │ • File I/O      │    │ • RRT*          │
│ • Simple UI     │    │ • JSON comm     │    │ • Native C      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       ▲                         ▲                         ▲
       │                         │                         │
    localhost:3000          JSON files              ./path_planner
```

## � Quick Start

### Prerequisites
- Node.js installed
- C compiler (GCC)
- Modern web browser

### Current Development Focus
1. **[📋 Simplified Prototype Scope](./docs/07_simplified_prototype_scope.md)** ⭐ **START HERE**
2. **[📝 Simplified Requirements](./docs/08_simplified_requirements.md)** ⭐ **CURRENT REQUIREMENTS**
3. **[🧮 Algorithm Specification](./docs/04_algorithm_specification.md)** (core algorithms)
4. **[🤖 AI Agent Guidelines](./docs/05_ai_agent_guidelines.md)** (adapted for prototype)

## 📋 Required Features (Prototype)

### Left Panel Controls
- **RESET** - Clear everything
- **BOUNDARY** - Click to define mowing area
- **PLAN** - Calculate coverage path
- **ADD OBSTACLE** - Define static obstacles  
- **ADD OBSTACLE DYNAMIC** - Define obstacles invisible to initial planner
- **RUN** - Simulate robot movement
- **RUN SPEED** - Speed control slider
- **PAUSE/STOP** - Control simulation

### Canvas (Center)
- Blank drawing area (no real maps)
- Green boundary polygon
- Red static obstacles  
- Orange/yellow dynamic obstacles
- Blue planned path
- Purple re-routed path
- Moving robot dot

### Right Panel
- List of all obstacles with delete buttons
- Robot status (position, speed)
- Statistics (path length, coverage area)

## 🧮 Algorithm Approach (Same as Production)

### Primary: Adaptive Boustrophedon Pattern
- Complete area coverage with parallel stripes
- Configurable cutting width (20px default) and overlap (5px)
- Obstacle avoidance with safety margins
- Stripe direction optimization

### Secondary: RRT* Dynamic Replanning  
- Real-time obstacle avoidance
- Asymptotically optimal path finding
- Integration with global plan
- Smooth path connections

## 🛠️ Technology Stack (Simplified)

### Frontend (Browser)
- **HTML5 Canvas** for drawing
- **Vanilla JavaScript** (no frameworks)
- **CSS** for layout
- **File**: Single HTML page with embedded JS/CSS

### Backend (Minimal)
- **Node.js + Express** for simple HTTP server
- **File I/O** for communication with C program
- **JSON** for data exchange
- **No database** - just text files

### Algorithms (C)
- **Standard C99** (no ESP32 dependencies)
- **Math library** for geometric calculations
- **File I/O** for input/output communication
- **Native compilation** for laptop performance

## 📊 Development Phases

### ✅ Phase 0: Documentation (Complete)
- [x] Simplified scope definition
- [x] Requirements specification
- [x] Architecture design

### ✅ Phase 1: Basic Interface (COMPLETE)
- [x] HTML/CSS/JS interface
- [x] Canvas drawing for boundaries
- [x] Control button layout
- [x] Obstacle management UI
- [x] Mock path planning
- [x] Robot simulation

### ⏳ Phase 2: Communication (NEXT)
- [ ] Node.js server setup
- [ ] File-based protocol
- [ ] Mock C program integration

### 🧮 Phase 3: C Algorithms
- [ ] Boustrophedon implementation
- [ ] RRT* algorithm
- [ ] Path optimization

### 🤖 Phase 4: Simulation
- [ ] Robot movement animation
- [ ] Dynamic obstacle detection
- [ ] Path re-routing visualization

### ✨ Phase 5: Polish
- [ ] Obstacle management
- [ ] Statistics display
- [ ] Error handling

## 📚 Documentation

**Current Documentation**:
- [Requirements](./docs/requirements.md) - What the prototype should do
- [Algorithm Specification](./docs/algorithms.md) - Core algorithms  
- [AI Agent Guidelines](./docs/guidelines.md) - Development guidelines
- [Documentation Index](./docs/README.md) - Overview of all docs

## 🎯 Success Criteria (Prototype)

### Immediate Goals
- [ ] Functional web interface with all controls
- [ ] Boundary and obstacle definition working
- [ ] Basic Boustrophedon path generation
- [ ] Robot simulation along planned path

### Extended Goals
- [ ] Dynamic obstacle detection and re-routing
- [ ] Path optimization and statistics
- [ ] Smooth animations and good UX
- [ ] Algorithm validation for ESP32 port

## 🤝 Contributing

1. **Follow KISS Principle**: Keep everything simple
2. **Use Simplified Docs**: Focus on docs 07-08, not original production specs
3. **File-Based Communication**: No databases, just JSON files
4. **Algorithm Focus**: Core path planning is the priority
5. **Prototype Mindset**: Validation tool, not production system

---

*This is a simplified experimental prototype. The original comprehensive documentation for the future ESP32 production system is available in the [docs](./docs/) directory.*
