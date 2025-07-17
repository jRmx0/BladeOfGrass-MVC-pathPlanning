# Documentation Index

This documentation provides information for the BladeOfGrass local prototype - a simplified experimental tool for testing path planning algorithms on a laptop.

## Current Documents

### 🧮 [Algorithm Specification](./algorithms.md)
**Purpose**: Mathematical foundations and implementation details for path planning algorithms  
**Audience**: Algorithm developers  
**Contents**:
- **Trapezoidal decomposition** (proven cellular-based coverage)
- **Sweep line algorithm** with event-based processing
- **RRT* dynamic replanning** for obstacle avoidance  
- **Cell traversal optimization** and TSP-based planning
- **Path smoothing techniques** and performance optimization
- **Implementation phases** and testing methodology

### 🤖 [AI Agent Guidelines](./guidelines.md)
**Purpose**: Development guidelines for AI agents working on the prototype  
**Audience**: AI coding agents, automated development tools  
**Contents**:
- Simplified MVC architecture rules
- C implementation standards for algorithms
- Code quality and testing requirements
- Communication protocols and best practices

### 📋 [Prototype Requirements](./requirements.md)
**Purpose**: Requirements for the local prototype  
**Audience**: Developers, testers  
**Contents**:
- Web interface controls specification
- Canvas visualization requirements
- Simplified data structures
- Performance and usability criteria

## Quick Start

### For Developers
1. **Start with**: Main [README.md](../README.md) for project overview
2. **Requirements**: [Prototype Requirements](./requirements.md)
3. **Algorithms**: [Algorithm Specification](./algorithms.md)
4. **Guidelines**: [AI Agent Guidelines](./guidelines.md)

### For AI Agents
1. **MUST READ**: [AI Agent Guidelines](./guidelines.md) first
2. **Requirements**: [Prototype Requirements](./requirements.md)
3. **Algorithms**: [Algorithm Specification](./algorithms.md)

## Project Summary

### Prototype Specifications
- **Platform**: Laptop (Windows/Linux/Mac)
- **Interface**: Web browser (HTML5 Canvas + JavaScript)
- **Backend**: Node.js + C executable
- **Data**: JSON files (no database)
- **Principle**: KISS (Keep It Stupid Simple)

### Core Features
- **Web Interface**: Left controls, center canvas, right obstacle panel
- **Boundary Definition**: Click to add waypoints
- **Path Planning**: Trapezoidal decomposition + RRT* algorithms
- **Obstacle Management**: Static and dynamic obstacles
- **Robot Simulation**: Animated movement with speed control
- **Dynamic Re-routing**: Real-time path adjustment

---

*This is documentation for a simplified prototype. Focus on algorithm validation and experimentation.*

## Document Maintenance

### Version Control
All documentation is version-controlled alongside the codebase. Updates should:
- Maintain consistency across all documents
- Update the traceability matrix when requirements change
- Follow the established documentation standards
- Include changelog entries for significant updates

### Review Process
Documentation changes should be reviewed by:
- **Project Overview & Requirements**: Product owner + technical lead
- **Architecture & Algorithms**: Senior developers + system architect
- **AI Guidelines & Dev Stack**: Development team + AI agent maintainers

### Contributing
When contributing to documentation:
1. Follow the established structure and formatting
2. Ensure examples are accurate and tested
3. Update cross-references when adding new sections
4. Maintain consistency in terminology and conventions

## Related Resources

### External Documentation
- [ESP-IDF Programming Guide](https://docs.espressif.com/projects/esp-idf/en/latest/)
- [FreeRTOS Documentation](https://www.freertos.org/Documentation/RTOS_book.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

### Academic References
- Choset, H. "Coverage for robotics–a survey of recent results" (Path planning foundations)
- LaValle, S.M. "Rapidly-exploring random trees" (RRT algorithm theory)
- Galceran, E. "A survey on coverage path planning for robotics" (Coverage algorithms)

### Standards and Protocols
- WGS84 Coordinate System (GPS positioning)
- GeoJSON Format (Geographic data exchange)
- RESTful API Design Principles
- IEEE Standards for Autonomous Systems

---

*This documentation is maintained as part of the BladeOfGrass-MVC-pathPlanning project. For questions or contributions, please refer to the project repository guidelines.*
