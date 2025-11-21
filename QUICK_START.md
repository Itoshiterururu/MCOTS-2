# MCOTS Quick Start Guide

## Run the Demo in 3 Steps

### Step 1: Start the Application

```bash
cd /home/purr-noir/MCOTS
docker compose up -d --build
```

Wait 30-60 seconds for all services to start.

### Step 2: Run the Demo Script

```bash
./test-demo.sh
```

This will automatically create:
- ✓ Demo user account (username: `demo_user`, password: `Demo123456`)
- ✓ 12 military units (7 Blue Force, 5 Red Force)
- ✓ 1 Battalion formation with hierarchical structure
- ✓ 3 Obstacles (minefield, tank traps, trenches)
- ✓ 3 Fields of fire (defensive sectors)
- ✓ 2 Fire missions (artillery strikes)
- ✓ 3 Actions (patrol, attack, move)
- ✓ 1 Automated script (coordinated assault)
- ✓ Battle recording (active)

### Step 3: Open the Application

Open your browser and go to:
```
http://localhost:5173
```

Login with:
- **Username:** `demo_user`
- **Password:** `Demo123456`

## What You'll See

### Map View
- **Blue Force** (friendly) units in the southwest
- **Red Force** (enemy) units in the northeast
- **Communication lines** between units (toggle layer)
- **Defensive obstacles** (minefield, traps, trenches)

### Unit Types Created

**Blue Force (7 units):**
1. Communications Hub (Command Post)
2. Tank Company (40 tanks)
3. Mechanized Infantry Company
4. Artillery Battery (Howitzers)
5. Reconnaissance Platoon
6. Air Defense Platoon
7. Supply Unit

**Red Force (5 units):**
1. Communications Hub
2. Tank Company (attacking)
3. Mechanized Infantry Company
4. Artillery Battery (Mortars)
5. Infantry Company (defending)

**Formation:**
- Tank Battalion with 3 subordinate companies
- Organized in WEDGE formation
- 500-meter spacing

## Features to Explore

### 1. Map Layers (Top of sidebar)
Toggle these checkboxes to see different information:
- ☑ **Units** - Show/hide all military units
- ☑ **Communications** - Communication network links
- ☑ **Fields of Fire** - Defensive fire sectors (colored arcs)
- ☑ **Fire Missions** - Artillery target zones (circles)
- ☑ **Obstacles** - Terrain obstacles (lines)

### 2. Click on Units
- Click any unit icon to see detailed information
- View statistics: personnel, vehicles, firepower, morale
- Check communications status
- See parent/subordinate relationships

### 3. Formations Panel
Navigate to Formations tab:
- View the Tank Battalion formation
- See hierarchical structure (Battalion → Companies)
- Click "View Subordinates" to see all units
- Try moving the HQ - subordinates follow!

### 4. Actions Panel
Check pending actions:
- Blue Recon: Patrol mission
- Red Tank: Attack action
- Red Mech: Movement action
- Watch their status change over time

### 5. Scripts Panel
- Find "Red Force Coordinated Assault" script
- Review the 3-step assault sequence
- Click "Activate" to start the automated attack
- Watch Red Force units execute the plan

### 6. Fire Control Panel
View fire missions and fields of fire:
- **Fire Missions:** 2 planned artillery strikes
  - Suppression mission on Red positions
  - Interdiction mission on supply route
- **Fields of Fire:** Defensive sectors for 3 units
  - Tank Company covering 0°-90° sector
  - Mechanized Infantry covering 45°-135°
  - Red Infantry covering 135°-225°

### 7. Battle Replay
- Recording is already active
- Let the battle run for a few minutes
- Go to Replay panel
- Click "Stop Recording" when ready
- Play back the battle with timeline controls
- Use speed controls (0.25× to 4×)
- Enable "Show Trails" to see unit movement paths
- Enable "Show Heatmap" to see combat zones

### 8. Intelligence Analysis
Request AI tactical analysis:
- Click "Intelligence" tab
- Select terrain type (e.g., "MIXED")
- Select weather (e.g., "CLEAR")
- Click "Analyze Situation"
- Review AI recommendations

### 9. Communications Network
- Toggle "Communications" layer
- See green lines connecting units to command posts
- Check which units are connected
- View isolated units (if any)

### 10. Obstacles
- Toggle "Obstacles" layer
- See defensive positions:
  - Red: Minefield (northeast of Blue positions)
  - Gray: Tank traps
  - Brown: Trenches

## Interactive Demonstrations

### Demo 1: Formation Movement
1. Go to Formations panel
2. Select the Tank Battalion
3. Click "View on Map" (HQ unit)
4. Note positions of subordinate companies
5. Click HQ unit on map
6. Drag it to a new location
7. **Watch:** All 3 companies move automatically!

### Demo 2: Activate Enemy Script
1. Go to Scripts panel
2. Find "Red Force Coordinated Assault"
3. Review the sequence (3 actions)
4. Click "Activate"
5. Go to Actions panel
6. **Watch:** Actions execute in order
7. Return to map to see Red units advancing

### Demo 3: Artillery Fire Mission
1. Go to Fire Control panel
2. View the 2 planned fire missions
3. Select "Suppression mission"
4. Check status (PLANNED)
5. Click "Execute" (if button available)
6. Toggle "Fire Missions" layer on map
7. See the target area highlighted

### Demo 4: Battle Playback
1. Let battle run for 5-10 minutes
2. Go to Replay panel
3. Click "Stop Recording"
4. Click on the saved replay
5. Use timeline to scrub through time
6. Try different speeds (0.5×, 2×, 4×)
7. Enable "Show Trails"
8. **Watch:** The entire battle replayed!

## Typical Tactical Scenario

The demo creates this scenario:

**Situation:**
- Blue Force (friendly) defending in the southwest
- Red Force (enemy) attacking from the northeast
- Blue Force has prepared defensive positions
- Red Force is advancing with armor and mechanized infantry

**Blue Force Defenses:**
- Tank and mechanized units in defensive positions
- Fields of fire covering approach routes
- Obstacles (minefields, traps) protecting flanks
- Artillery ready to fire on enemy positions
- Supply and medical support in rear

**Red Force Attack:**
- Coordinated assault script prepared
- Tanks will advance first
- Mechanized infantry follows
- Final assault on Blue positions
- Artillery provides fire support

**Your Role:**
You can control either side, or observe the AI script execution!

## Resetting the Demo

To start fresh:

```bash
# Stop and remove all data
docker compose down
docker volume rm mongodb_data

# Restart
docker compose up -d --build

# Wait 30-60 seconds, then run script again
./test-demo.sh
```

## Troubleshooting Demo Script

### Script fails with connection errors
Services may not be ready yet. Wait 30 more seconds and run again:
```bash
./test-demo.sh
```

### "Failed to login" error
Auth service may not be ready. Check status:
```bash
docker logs auth-service --tail 20
```

### No units appearing on map
1. Hard refresh browser (Ctrl+Shift+R)
2. Check "Units" layer is enabled
3. Try zooming in/out
4. Check browser console for errors (F12)

### Some features not working
Make sure all services are running:
```bash
docker ps
```
You should see 5 containers running.

## Next Steps

After exploring the demo:

1. **Read the full User Guide:** `USER_GUIDE.md`
2. **Create your own units:** Try different unit types and configurations
3. **Design formations:** Experiment with different formation patterns
4. **Plan operations:** Create custom actions and scripts
5. **Analyze tactics:** Use battle replay to review and improve

## API Endpoints (for developers)

The script uses these APIs:
- **Auth:** `http://localhost:8081/api/v1/auth`
- **Map:** `http://localhost:8080/api/v1/map`
- **Intelligence:** `http://localhost:8084/api/v1`

You can make direct API calls using `curl` or Postman.

---

**Enjoy exploring MCOTS!**

For detailed instructions on each feature, see `USER_GUIDE.md`.
