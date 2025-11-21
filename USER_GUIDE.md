# MCOTS User Guide
## Military Command & Tactical Operations System

## Table of Contents
1. [Getting Started](#getting-started)
2. [User Authentication](#user-authentication)
3. [Map Interface](#map-interface)
4. [Unit Management](#unit-management)
5. [Actions & Scripting](#actions--scripting)
6. [Communications System](#communications-system)
7. [Obstacles & Terrain](#obstacles--terrain)
8. [Fire Control System](#fire-control-system)
9. [Formation Management](#formation-management)
10. [Battle Replay & Analysis](#battle-replay--analysis)
11. [Intelligence Analysis](#intelligence-analysis)
12. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements
- **Docker** and **Docker Compose** installed
- **8GB RAM** minimum (16GB recommended)
- **Modern web browser** (Chrome, Firefox, Edge, Safari)
- **Internet connection** for initial setup

### Starting the Application

1. **Navigate to project directory:**
   ```bash
   cd /path/to/MCOTS
   ```

2. **Ensure environment variables are set:**
   - Check that `.env` file exists in the root directory
   - Required variables: `JWT_SECRET`, `MONGODB_DB_NAME`, `GROQ_API_KEY`

3. **Start all services:**
   ```bash
   docker compose up -d --build
   ```

4. **Wait for services to initialize** (30-60 seconds)

5. **Access the application:**
   - Open browser and navigate to `http://localhost:5173`

6. **Verify services are running:**
   ```bash
   docker ps
   ```
   You should see 5 containers: frontend, map-service, auth-service, intelligence-service, mongodb

---

## User Authentication

### Registration

1. **Navigate to registration page:**
   - Click "Register" or "Sign Up" on the login screen

2. **Fill in registration form:**
   - **Username**: Choose unique username (3-50 characters)
   - **Email**: Valid email address
   - **Password**: Strong password (minimum 8 characters)
   - **Confirm Password**: Re-enter password

3. **Submit registration:**
   - Click "Register" button
   - Wait for confirmation message

4. **Automatic login:**
   - You'll be automatically logged in after successful registration

### Login

1. **Enter credentials:**
   - **Username** or **Email**
   - **Password**

2. **Click "Login"**

3. **Session management:**
   - Sessions last 24 hours
   - Token is automatically refreshed
   - Logout via the account menu in the header

---

## Map Interface

### Overview

The main interface consists of:
- **Map View**: Interactive map centered on Ukraine
- **Header**: Navigation and account controls
- **Sidebar**: Unit management and controls
- **Action Panel**: Task and script management

### Map Controls

**Zoom:**
- Mouse wheel to zoom in/out
- `+` / `-` buttons in bottom-right corner
- Double-click to zoom in

**Pan:**
- Click and drag to move around the map
- Arrow keys for precise movement

**Map Layers:**
Toggle visibility of different elements:
- ✓ **Units**: Show/hide all military units
- ✓ **Communications**: Display comms links between units
- ✓ **Fields of Fire**: Show defensive fire sectors
- ✓ **Fire Missions**: Display artillery target zones
- ✓ **Obstacles**: Show terrain obstacles

### Map Interactions

**Click on Map:**
- Single click: Select location for unit placement
- Right-click: Context menu (if available)

**Click on Unit:**
- Single click: Select unit and show details
- Double-click: Open unit configuration

---

## Unit Management

### Creating Units

1. **Open Unit Creation Panel:**
   - Click "Add Unit" button in sidebar
   - Or use keyboard shortcut (if configured)

2. **Configure Unit Parameters:**

   **Basic Information:**
   - **Unit Type**: Select from dropdown
     - `TANKS`: Armored tank units
     - `MECHANIZED`: Mechanized infantry
     - `INFANTRY`: Standard infantry
     - `HOWITZER`: Artillery - long range
     - `MORTAR`: Artillery - medium range
     - `RECONNAISSANCE`: Scout units
     - `ANTI_TANK`: Anti-armor specialists
     - `UAV`: Unmanned aerial vehicles
     - `AIR_DEFENSE`: Anti-aircraft units
     - `COMMUNICATIONS`: Command & control
     - `ENGINEER`: Combat engineers
     - `REPAIR`: Maintenance units
     - `SUPPLY`: Logistics units
     - `MEDICAL`: Medical support

   - **Faction**: Choose side
     - `BLUE_FORCE`: Friendly forces (Ukraine)
     - `RED_FORCE`: Opposing forces
     - `NEUTRAL`: Non-combatant

   - **Unit Rank**: Select organizational level
     - `SQUAD`: ~10 personnel
     - `PLATOON`: ~30 personnel (3 squads)
     - `COMPANY`: ~120 personnel (3 platoons)
     - `BATTALION`: ~500 personnel (3 companies)

3. **Set Position:**
   - **Option A**: Click on map to set location
   - **Option B**: Enter coordinates manually
     - Latitude: 48.0-52.0 (Ukraine region)
     - Longitude: 22.0-40.0 (Ukraine region)

4. **Configure Resources:**
   - **Personnel**: Number of soldiers (10-500)
   - **Vehicles**: Number of vehicles (0-120)
   - **Supply Level**: 0-100% (affects combat effectiveness)
   - **Morale**: 0-100% (affects unit performance)

5. **Set Direction:**
   - Use compass/slider to set unit facing (0-359°)
   - 0° = North, 90° = East, 180° = South, 270° = West

6. **Click "Create Unit"**

### Unit Characteristics (Automatic)

When you create a unit, the system automatically calculates:
- **Mobility**: Movement speed (0-100)
- **Firepower**: Combat strength (calculated from vehicles, personnel, supply)
- **Defense**: Defensive capability (0-100)
- **Range**: Engagement range in meters

**Firepower Calculation Formula:**
```
Base Firepower = Unit Type Base × (Vehicles / Default Vehicles)
Rank Multiplier = Squad: 1.0, Platoon: 1.5, Company: 2.0, Battalion: 3.0
Supply Modifier = Supply Level / 100
Personnel Modifier = Current Personnel / Default Personnel

Final Firepower = Base × Rank × Supply × Personnel
```

### Viewing Unit Details

1. **Click on unit icon** on the map

2. **Details Panel shows:**
   - Unit ID and type
   - Current position (lat/lng)
   - Status (DEFENDING, ATTACKING, MOVING, etc.)
   - Personnel count
   - Vehicle count
   - Firepower rating
   - Supply level
   - Morale level
   - Communications status
   - Parent unit (if part of formation)

### Editing Units

1. **Select unit** on map

2. **Click "Edit" button** in details panel

3. **Modify parameters:**
   - Position: Drag unit or enter new coordinates
   - Status: Change tactical status
   - Resources: Adjust personnel, vehicles, supplies
   - Morale: Update morale level
   - Direction: Change facing

4. **Click "Save Changes"**

### Moving Units

**Option A: Drag and Drop**
1. Click and hold on unit icon
2. Drag to new location
3. Release to place

**Option B: Coordinate Entry**
1. Select unit
2. Click "Edit"
3. Enter new latitude/longitude
4. Save

**Option C: Action-Based Movement** (see Actions section)

### Deleting Units

1. **Select unit** on map
2. **Click "Delete Unit"** button
3. **Confirm deletion** in dialog
4. Unit is permanently removed

---

## Actions & Scripting

### Creating Single Actions

Actions are tasks assigned to individual units.

1. **Open Actions Panel:**
   - Click "Actions" tab in sidebar
   - Or click "Create Action" button

2. **Select Unit:**
   - Choose unit from dropdown
   - Or select unit on map first

3. **Configure Action:**

   **Action Type:**
   - `MOVE`: Relocate unit to new position
   - `ATTACK`: Engage enemy unit
   - `DEFEND`: Hold position defensively
   - `RETREAT`: Fall back to safer location
   - `PATROL`: Move along defined route
   - `RESUPPLY`: Replenish supplies
   - `RECON`: Reconnaissance mission
   - `REPAIR`: Fix damaged equipment
   - `FORTIFY`: Improve defensive positions

   **Priority:**
   - `LOW`: Execute when convenient
   - `MEDIUM`: Standard priority
   - `HIGH`: Execute soon
   - `URGENT`: Execute immediately

   **Additional Parameters:**
   - **Description**: Free text explaining the action
   - **Target Position**: For MOVE, PATROL, ATTACK
   - **Target Unit ID**: For ATTACK actions
   - **Duration**: Estimated time (seconds)
   - **Scheduled Time**: When to execute (optional)

4. **Click "Create Action"**

### Monitoring Actions

**Action Status:**
- `PENDING`: Waiting to execute
- `EXECUTING`: Currently in progress
- `COMPLETED`: Successfully finished
- `FAILED`: Could not complete
- `CANCELLED`: Manually cancelled

**View Action Progress:**
1. Open "Actions" panel
2. See list of all actions with status
3. Filter by unit or status
4. Click action for details

### Creating Scripts (Automated Sequences)

Scripts are pre-programmed sequences of actions for enemy units.

1. **Open Scripts Panel:**
   - Click "Scripts" tab

2. **Create New Script:**
   - Click "New Script" button

3. **Configure Script:**
   - **Name**: Descriptive name (e.g., "Red Force Assault")
   - **Description**: Purpose and behavior
   - **Activation**: Manual or automatic
   - **Priority**: Overall script priority

4. **Add Script Actions:**

   For each action in sequence:
   - Click "Add Action"
   - Select unit (must exist)
   - Choose action type
   - Set execution order (1, 2, 3...)
   - Define trigger conditions (optional):
     - Time-based: After X seconds
     - Event-based: When unit reaches position
     - Condition-based: If enemy detected

5. **Save Script**

### Activating Scripts

**Manual Activation:**
1. Go to Scripts panel
2. Find script in list
3. Click "Activate"
4. Actions begin executing in order

**Automatic Activation:**
- Scripts can be set to auto-activate based on:
  - Game time
  - Enemy proximity
  - Resource thresholds
  - Custom conditions

### Script Management

**Pause/Resume:**
- Click "Pause" to temporarily stop
- Click "Resume" to continue

**Deactivate:**
- Stops script and cancels pending actions
- Executing actions will complete

**Delete:**
- Permanently removes script
- Does not affect already-created actions

---

## Communications System

### Overview

The communications system simulates command and control networks. Units must maintain communications links to function effectively.

### Communications Units

**Special Unit Type: COMMUNICATIONS**
- Acts as relay/hub for network
- Has extended communications range (50km base)
- Each faction needs communications units

**Unit Communications Range:**
- Base range varies by unit type
- Reduced by terrain, distance, jamming
- Shown as connections on map (when enabled)

### Checking Communications Status

1. **Enable Communications Layer:**
   - Toggle "Communications" checkbox on map

2. **Visual Indicators:**
   - Green lines: Active communications links
   - Unit color coding:
     - Green: Connected to network
     - Yellow: Weak connection
     - Red: Isolated (no comms)

3. **Unit Details:**
   - Select any unit
   - Check "Communications Status" field:
     - ✓ Connected
     - ✗ Isolated
   - View "Comms Strength": Signal quality %

### Communications Coverage

**View Coverage Stats:**
1. Open sidebar menu
2. Click "Communications"
3. See faction-wide statistics:
   - Total units
   - Connected units
   - Isolated units
   - Coverage percentage

**Find Isolated Units:**
1. Communications panel
2. Click "Show Isolated Units"
3. Map highlights disconnected units

### Improving Communications

**Add Communications Units:**
1. Create COMMUNICATIONS type unit
2. Place strategically to extend coverage
3. Position to cover isolated units

**Optimal Placement:**
- Central locations between clusters
- High ground (better range)
- Near front-line units
- Every 30-40km spacing

**Refresh Communications:**
- System auto-refreshes every 30 seconds
- Manual refresh: Click "Refresh Comms" button

---

## Obstacles & Terrain

### Creating Obstacles

Obstacles represent terrain features that affect movement and combat.

1. **Select Obstacle Tool:**
   - Click "Add Obstacle" in sidebar

2. **Choose Obstacle Type:**
   - `MINEFIELD`: Anti-personnel/vehicle mines
   - `WIRE`: Barbed wire barriers
   - `TRENCH`: Defensive trenches
   - `TANK_TRAP`: Anti-armor obstacles
   - `FORTIFICATION`: Concrete barriers
   - `NATURAL`: Rivers, forests, cliffs

3. **Draw Obstacle:**
   - **Click start point** on map
   - **Click end point** on map
   - Line appears showing obstacle location

4. **Obstacle is Created**

### Viewing Obstacles

1. **Enable Obstacles Layer:**
   - Toggle "Obstacles" checkbox

2. **Obstacle Display:**
   - Lines on map showing location
   - Color-coded by type:
     - Red: Minefields
     - Gray: Wire/barriers
     - Brown: Trenches/fortifications
     - Green: Natural obstacles

### Obstacle Effects

**Movement:**
- Units move slower through obstacles
- Some obstacles completely block movement
- Engineers can clear certain obstacles

**Combat:**
- Trenches/fortifications provide defense bonus
- Minefields damage passing units
- Natural obstacles provide cover

### Managing Obstacles

**Delete Obstacle:**
1. Click on obstacle line
2. Click "Delete" in popup
3. Confirm deletion

**Edit Obstacle:**
1. Select obstacle
2. Modify type or position
3. Save changes

---

## Fire Control System

### Field of Fire (Defensive Units)

Field of Fire defines the sector where a unit can engage enemies.

#### Setting Field of Fire

1. **Select Defensive Unit:**
   - Click unit on map
   - Must be in DEFENDING status

2. **Open Fire Control:**
   - Click "Set Field of Fire" button

3. **Configure Fire Sector:**

   **Azimuth Settings:**
   - **Center Azimuth**: Primary engagement direction (0-359°)
   - **Left Boundary**: Left limit of fire sector
   - **Right Boundary**: Right limit of fire sector
   - Tip: 90° sector is typical (e.g., 0° center, 315° left, 45° right)

   **Range Settings:**
   - **Maximum Range**: Farthest engagement distance (meters)
   - **Minimum Range**: Dead zone distance (meters)
   - Tip: Set min range 50-100m to avoid dead space

   **Priority:**
   - `PRIMARY`: Main defensive sector
   - `SECONDARY`: Alternate sector
   - `FINAL_PROTECTIVE_FIRE`: Last-ditch defense line

4. **Activate Field of Fire:**
   - Toggle "Active" checkbox
   - Click "Save"

#### Viewing Fields of Fire

1. **Enable Fire Control Layer:**
   - Toggle "Fields of Fire" checkbox on map

2. **Visual Display:**
   - Colored arc showing fire sector
   - Red = Primary, Yellow = Secondary, Orange = FPF
   - Range circles showing max/min range

3. **Fire Sector Diagram:**
   - Circular diagram in config panel
   - Shows azimuth boundaries visually

### Fire Missions (Artillery)

Fire missions are pre-planned artillery strikes.

#### Creating Fire Mission

1. **Ensure Artillery Unit Exists:**
   - Must have HOWITZER or MORTAR type unit
   - Check unit has sufficient ammunition

2. **Open Fire Missions Panel:**
   - Click "Fire Control" tab
   - Select "Create Fire Mission"

3. **Configure Mission:**

   **Target Information:**
   - **Target Center**: Click on map to set coordinates
   - **Target Radius**: Area of effect (50-500 meters)
   - **Target Description**: Free text (e.g., "Enemy assembly area")

   **Mission Type:**
   - `SUPPRESSION`: Pin down enemy, reduce effectiveness
   - `DESTRUCTION`: Maximum damage to target
   - `INTERDICTION`: Block routes, prevent movement
   - `HARASSMENT`: Periodic fire, disrupt operations
   - `COUNTER_BATTERY`: Fire on enemy artillery
   - `SMOKE`: Obscuration mission
   - `ILLUMINATION`: Night lighting

   **Ammunition:**
   - **Rounds Allocated**: Number of shells to fire
   - **Effects Radius**: Danger zone around target
   - Tip: HE = 50-100m, Smoke = 200m radius

   **Priority:**
   - `ROUTINE`: Execute when able
   - `PRIORITY`: Expedite
   - `IMMEDIATE`: Urgent support
   - `FLASH`: Troops in contact, fire now

   **Timing:**
   - **Scheduled Time**: When to fire (optional)
   - Leave blank for on-call missions

4. **Select Artillery Unit:**
   - Choose which artillery unit executes
   - Must be in range of target

5. **Click "Create Mission"**

#### Mission Status Workflow

```
PLANNED → READY → FIRING → COMPLETE
                    ↓
                CANCELLED
```

- **PLANNED**: Mission created, not yet ready
- **READY**: Artillery positioned, ready to fire
- **FIRING**: Rounds being delivered
- **COMPLETE**: Mission finished
- **CANCELLED**: Mission aborted

#### Managing Fire Missions

**View All Missions:**
1. Fire Control panel
2. See list with status
3. Filter by artillery unit or status

**Update Mission:**
1. Click mission in list
2. Modify parameters
3. Save changes

**Execute Mission:**
1. Find mission with READY status
2. Click "Execute"
3. Mission status changes to FIRING

**Cancel Mission:**
1. Select mission
2. Click "Cancel"
3. Confirm cancellation

#### Viewing Fire Missions on Map

1. **Enable Fire Missions Layer:**
   - Toggle "Fire Missions" checkbox

2. **Map Display:**
   - Circles showing target areas
   - Color-coded by status:
     - Blue: Planned
     - Green: Ready
     - Red: Firing
     - Gray: Complete
   - Dashed circle: Effects radius (danger zone)

---

## Formation Management

### Overview

Formations allow you to create hierarchical military organizations (Battalion → Companies → Platoons → Squads) with automatic positioning and cascading movement.

### Creating a Formation

1. **Open Formations Panel:**
   - Click "Formations" tab in sidebar

2. **Click "Create Formation"**

3. **Configure Formation:**

   **Headquarters Unit:**
   - **Unit Type**: Type of unit (TANKS, MECHANIZED, etc.)
   - **Rank**: Organizational level
     - BATTALION: Creates 3 companies
     - COMPANY: Creates 3 platoons
     - PLATOON: Creates 3 squads
   - **Faction**: BLUE_FORCE or RED_FORCE
   - **HQ Position**: Click map to set location

   **Formation Type:**
   Select tactical formation pattern:
   - `LINE`: Units in straight line (good for defense)
   - `COLUMN`: Units in column (good for road march)
   - `WEDGE`: V-shape pointing forward (offensive)
   - `VEE`: Inverted V-shape (defensive)
   - `ECHELON_LEFT`: Diagonal left (flank protection)
   - `ECHELON_RIGHT`: Diagonal right (flank protection)
   - `BOX`: Square formation (all-around security)
   - `DISPERSED`: Random spacing (air attack protection)

   **Spacing:**
   - Distance between units in meters
   - Typical: 100-300m for company, 500-1000m for battalion

   **Orientation:**
   - Direction formation faces (0-359°)
   - 0° = North, 90° = East, etc.

4. **Click "Create Formation"**

5. **System Automatically:**
   - Creates HQ unit
   - Creates 3 subordinate units
   - Positions them per formation type
   - Links units in hierarchy

### Formation Structure Example

**Battalion Formation:**
```
Battalion HQ
├── Company 1 HQ
│   ├── Platoon 1-1 HQ
│   │   ├── Squad 1-1-1
│   │   ├── Squad 1-1-2
│   │   └── Squad 1-1-3
│   ├── Platoon 1-2 HQ
│   └── Platoon 1-3 HQ
├── Company 2 HQ
└── Company 3 HQ
```

### Viewing Formations

**Formation List:**
1. Formations panel
2. See all your formations
3. Shows:
   - Formation name
   - HQ unit ID
   - Number of subordinates
   - Formation type

**Map View:**
1. Enable "Formations" layer (if available)
2. See connecting lines between HQ and subordinates
3. Formation pattern visible in unit placement

**Hierarchy View:**
1. Click formation in list
2. Click "View Hierarchy"
3. See tree diagram of command structure

### Moving Formations

**Entire Formation Movement:**
1. Select formation HQ unit on map
2. Click "Move Formation"
3. Click new HQ position on map
4. **All subordinate units move automatically:**
   - Maintain relative positions
   - Keep same spacing
   - Preserve formation pattern

**Individual Unit Movement:**
- You can also move subordinate units individually
- This breaks formation pattern
- HQ unit aware of position changes

### Managing Formations

**View Subordinate Units:**
1. Click formation in list
2. Click "View Subordinates"
3. See list of all units in formation

**Delete Formation:**
1. Select formation
2. Click "Delete Formation"
3. Confirm deletion
4. **All units in formation are deleted:**
   - HQ unit removed
   - All subordinate units removed
   - Formation record deleted

---

## Battle Replay & Analysis

### Recording Battles

The system automatically records all battle activity.

#### Starting Recording

1. **Open Battle Replay Panel:**
   - Click "Replay" tab in sidebar

2. **Create New Recording:**
   - Click "Start Recording"

3. **Configure Recording:**
   - **Battle Name**: Descriptive name
   - **Description**: Optional notes
   - Click "Start"

4. **Recording Begins:**
   - System captures snapshots every 10 seconds
   - All events are logged (unit movements, attacks, etc.)
   - Continue operating normally

#### Stopping Recording

1. **When battle is complete:**
   - Return to Replay panel
   - Click "Stop Recording"

2. **Recording is Saved:**
   - Timestamped with start/end times
   - All snapshots and events preserved
   - Ready for playback

### Playing Back Battles

1. **Open Saved Replays:**
   - Replay panel
   - Click "My Replays"
   - See list of saved battles

2. **Select Replay:**
   - Click replay name
   - Replay viewer opens

3. **Playback Controls:**

   **Timeline:**
   - Horizontal bar showing battle duration
   - Drag scrubber to jump to any point
   - Click timeline to jump

   **Play/Pause:**
   - ▶ Play: Start playback
   - ⏸ Pause: Stop playback
   - ⏮ Reset: Jump to beginning

   **Speed Control:**
   - 0.25× = Quarter speed (detailed analysis)
   - 0.5× = Half speed
   - 1× = Real time
   - 2× = Double speed
   - 4× = Quadruple speed (quick review)

4. **Replay Display:**
   - Map shows unit positions at selected time
   - Units move as playback advances
   - Events appear with timestamps

### Replay Features

**Unit Trails:**
- Toggle "Show Trails" to see movement paths
- Color-coded by faction
- Shows where units have been

**Event Timeline:**
- Right sidebar shows events
- Chronological list:
  - Unit created
  - Unit moved
  - Action started
  - Combat engaged
  - Unit destroyed
- Click event to jump to that time

**Activity Heatmap:**
- Toggle "Show Heatmap"
- Color overlay showing combat intensity:
  - Yellow: Light activity
  - Orange: Moderate activity
  - Red: Heavy combat
- Based on event density

**Statistics Panel:**
- Shows battle statistics:
  - Duration
  - Units involved
  - Units destroyed by faction
  - Actions completed
  - Victory assessment

### Analyzing Battles

**After-Action Review:**
1. Play through entire battle
2. Note critical moments
3. Use slow motion for detailed analysis
4. Review statistics

**Tactical Lessons:**
- Where did attacks succeed/fail?
- Were units properly positioned?
- Did formations hold up?
- Was timing correct?

**Iterate and Improve:**
- Learn from mistakes
- Test different tactics
- Refine strategies

---

## Intelligence Analysis

### Overview

The Intelligence Service uses AI (Groq LLM) to analyze battle situations and provide tactical recommendations.

### Requesting Intelligence Analysis

1. **Open Intelligence Panel:**
   - Click "Intelligence" tab

2. **Select Units for Analysis:**
   - Choose which units to include
   - Can select all or specific units

3. **Configure Analysis:**

   **Context Parameters:**
   - **Terrain Type:**
     - `URBAN`: Cities, built-up areas
     - `OPEN`: Plains, fields
     - `FOREST`: Wooded areas
     - `MOUNTAIN`: Hills, mountains
     - `MIXED`: Combination terrain

   - **Weather Conditions:**
     - `CLEAR`: Good visibility
     - `CLOUDY`: Overcast
     - `RAIN`: Wet, reduced visibility
     - `SNOW`: Cold, reduced mobility
     - `FOG`: Very limited visibility

4. **Include Actions (Optional):**
   - Select pending actions for review
   - AI will consider planned operations

5. **Click "Analyze Situation"**

### Reading Analysis Results

The AI provides:

**Situation Assessment:**
- Current tactical situation
- Force comparison (friendly vs enemy)
- Terrain advantages/disadvantages

**Threat Analysis:**
- Identified enemy threats
- Vulnerability assessment
- Estimated enemy capabilities

**Recommendations:**
- Suggested unit movements
- Tactical options
- Priority actions
- Risk mitigation

**Resource Evaluation:**
- Supply status
- Personnel readiness
- Equipment condition

### Using Intelligence Recommendations

**Review Suggestions:**
1. Read analysis carefully
2. Consider context and goals
3. Evaluate feasibility

**Implement Recommendations:**
1. Create actions based on suggestions
2. Adjust unit positions
3. Modify existing plans

**Request Follow-up Analysis:**
- After implementing changes
- If situation changes dramatically
- Periodically during battle

### Intelligence Best Practices

**When to Request Analysis:**
- Before major operations
- When situation is unclear
- After enemy contact
- When losses are high
- Before committing reserves

**Provide Good Context:**
- Accurate terrain selection
- Current weather conditions
- Include all relevant units
- Add pending actions

**Limitations:**
- AI suggestions are advisory only
- You make final decisions
- AI doesn't know your overall strategy
- Consider multiple factors

---

## Troubleshooting

### Application Won't Start

**Check Docker:**
```bash
docker ps
```
- Should show 5 running containers

**Restart Services:**
```bash
docker compose down
docker compose up -d --build
```

**Check Logs:**
```bash
docker logs frontend
docker logs map-service
docker logs auth-service
```

### Empty/Blank Page

**Hard Refresh Browser:**
- Chrome/Firefox: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Clear Browser Cache:**
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

**Check Console Errors:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages

### Units Not Appearing

**Check Unit Creation:**
- Verify unit was created successfully
- Look for success message

**Check Map Layer:**
- Ensure "Units" layer is enabled
- Toggle off and on

**Check Faction Filter:**
- Verify faction filter isn't hiding units

**Check Zoom Level:**
- Zoom in if zoomed too far out

### Actions Not Executing

**Verify Action Status:**
- Check action panel for status
- Look for FAILED status

**Check Unit Status:**
- Unit must be available
- Can't be destroyed or inactive

**Check Communications:**
- Isolated units may not execute actions
- Verify comms link

**Check Script Status:**
- If part of script, script must be active

### Communications Issues

**No Communications Links:**
1. Create COMMUNICATIONS units
2. Position them strategically
3. Click "Refresh Comms"

**Units Remain Isolated:**
- Check distance to comms units
- Add more comms units
- Move comms units closer

### Performance Issues

**Slow Map:**
- Reduce number of visible units
- Disable unnecessary layers
- Close other browser tabs

**Services Not Responding:**
```bash
# Check resource usage
docker stats

# Restart specific service
docker restart map-service
```

### Database Issues

**Reset Database:**
```bash
docker compose down
docker volume rm mongodb_data
docker compose up -d
```
**Warning:** This deletes all data!

### Authentication Problems

**Can't Login:**
- Verify username/password correct
- Check auth-service is running:
  ```bash
  docker logs auth-service
  ```

**Session Expired:**
- Login again
- Sessions last 24 hours

**Registration Fails:**
- Username may already exist
- Check password meets requirements
- Verify email format

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close open panels |
| `Space` | Pause/Resume playback (in replay) |
| `+` / `-` | Zoom in/out |
| Arrow Keys | Pan map |
| `Delete` | Delete selected unit |
| `Ctrl + Z` | Undo last action |
| `Ctrl + S` | Save current state |

---

## Tips & Best Practices

### Unit Management
- Group units by faction for easier management
- Use consistent naming conventions
- Maintain reasonable unit counts (50-100 max)
- Update supply levels regularly

### Tactical Operations
- Always maintain communications
- Position units in depth, not single line
- Keep reserves
- Use terrain to your advantage
- Coordinate combined arms (infantry + armor + artillery)

### Formation Use
- Use LINE for defensive positions
- Use COLUMN for movement
- Use WEDGE for attacks
- Adjust spacing based on terrain and threat
- Keep formations out of artillery range

### Fire Control
- Set overlapping fields of fire
- Cover likely enemy avenues of approach
- Establish final protective fires
- Pre-plan fire missions on key terrain
- Coordinate fire with maneuver

### Battle Recording
- Start recording before first contact
- Use descriptive names
- Record complete battles for best analysis
- Review replays to improve tactics

---

## Support & Updates

### Getting Help
- Check this user guide first
- Review troubleshooting section
- Check project GitHub for issues
- Consult system logs

### Reporting Issues
Include:
- Browser and version
- Operating system
- Docker version
- Steps to reproduce
- Error messages
- Screenshots if relevant

### System Logs Location
```bash
# View all logs
docker compose logs

# Specific service
docker logs <service-name>

# Follow logs in real-time
docker logs -f <service-name>
```

---

**Version:** 1.0
**Last Updated:** 2025-11-18
**Project:** MCOTS - Military Command & Tactical Operations System
