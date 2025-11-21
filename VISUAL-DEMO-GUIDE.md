# Visual Demo Testing Guide

## What Was Fixed

The problem was that the frontend only fetched unit data ONCE when you logged in. The demo script updated units in the backend, but your browser didn't know to reload them.

### Solutions Implemented:

1. **Automatic Polling** - Frontend now refreshes unit data every 2 seconds
2. **Live Update Indicator** - Green badge shows when data is being updated
3. **Movement Trails** - Dashed lines show where units have moved
4. **Destroyed Markers** - Skull icons for destroyed units
5. **Synchronized Stats** - Dashboard matches actual backend data
6. **Interactive Clicks**:
   - Left-click → Show popup with health bar
   - Right-click → Open edit form

## How to Test - Step by Step

### Step 1: Start the Demo Script

```bash
./demo-instant-battle.sh
```

The script will:
- Create 12 military units (7 Blue, 5 Red)
- Set up defensive positions
- Show setup messages
- **PAUSE and wait for you**

### Step 2: Open the Map (While Script is Paused)

1. Open browser: **http://localhost:5173**
2. Login:
   - Username: `tactical_demo`
   - Password: `TacticalDemo123`

### Step 3: Verify Initial State

You should immediately see:

✅ **Bottom-right corner:** Green badge "Live Updates" with pulsing dot
✅ **Top header:** Click "📊 Show Stats" button → Dashboard opens
✅ **Map:** 12 military units visible
   - 7 Blue units (bottom of map, defensive positions)
   - 5 Red units (top of map, offensive positions)
✅ **Dashboard shows:** All initial stats (personnel, vehicles, etc.)

### Step 4: Start the Battle

Go back to terminal and press **ENTER**

### Step 5: Watch Visual Changes (20 seconds)

The demo script has 5 phases with 2-second delays. Watch the map:

**Phase 1 (0-2 sec): Initial Movement**
- Red Tank unit moves forward
- Red Mech unit moves forward
- **You should see:** Blue dashed trails appear behind moving units

**Phase 2 (2-4 sec): First Casualties**
- Red Tank takes damage
- **Dashboard updates:** Red personnel decreases, casualties increase
- **Left-click unit:** Health bar shows damage (yellow/orange)

**Phase 3 (4-6 sec): Heavy Fighting**
- Red Mech takes heavy damage
- Blue Tank takes minor damage
- **Movement trails:** Units continue moving, trails get longer
- **Dashboard:** Both sides show casualties

**Phase 4 (6-7 sec): Unit Destroyed**
- Red Infantry Battalion DESTROYED
- **You should see:**
  - Unit marker changes to grey skull icon 💀
  - Label shows "DESTROYED"
  - Dashboard shows one Red unit destroyed

**Phase 5 (7-9 sec): Final Positions**
- Blue Mech adjusts position
- **Final trails visible**
- **Dashboard shows:** Final casualty counts

### Step 6: Verify All Features

After battle ends, test:

1. **Left-click any unit:**
   - Popup shows with unit details
   - Health bar visible (if not destroyed)
   - Color-coded by damage level

2. **Left-click destroyed unit:**
   - Shows "UNIT DESTROYED" warning
   - Personnel: 0, Vehicles: 0

3. **Right-click any unit:**
   - Edit form opens
   - Can modify unit properties

4. **Dashboard (top-right):**
   - Shows correct final stats
   - Blue casualties: ~25
   - Red casualties: ~418 (one unit completely destroyed)
   - Kill ratio calculated

5. **Movement Trails:**
   - Blue dashed lines show paths units took
   - Trails remain visible after battle

6. **Live Updates Indicator:**
   - Still pulsing green
   - Updates every 2 seconds

## What You Should See - Checklist

### Visual Elements:
- [ ] Green "Live Updates" badge (bottom-right)
- [ ] Battle Statistics Dashboard (top-right, toggle with button)
- [ ] 12 units on map initially
- [ ] Blue dashed movement trails
- [ ] Skull icon on destroyed unit
- [ ] Health bars in popups

### Dynamic Behavior:
- [ ] Units move during battle (positions change)
- [ ] Movement trails grow as units move
- [ ] Health bars decrease as units take damage
- [ ] Dashboard stats update in real-time
- [ ] One unit changes to skull marker
- [ ] Personnel/vehicle counts decrease

### Interactions:
- [ ] Left-click shows popup (not edit form)
- [ ] Right-click opens edit form
- [ ] Stats dashboard toggle works
- [ ] Destroyed unit can't be dragged

## If You Don't See Changes

### Problem: Units not moving/updating

**Solution:**
1. Check bottom-right for "Live Updates" badge - if missing, refresh page
2. Open browser console (F12) - check for errors
3. Verify services running: `docker ps`

### Problem: No movement trails

**Solution:**
- Units must MOVE to create trails
- Trails only appear when position changes by >11 meters
- Check if Red Tank and Red Mech moved from initial positions

### Problem: No destroyed marker

**Solution:**
- Look for Red Infantry Battalion (was at latitude 50.545)
- Should show skull icon after Phase 4
- If not visible, check if unit has `personnel: 0` (left-click to see)

### Problem: Dashboard shows wrong numbers

**Solution:**
- Dashboard auto-updates every 2 seconds
- Wait a few seconds for sync
- Stats calculated from actual backend data

## Debug Commands

```bash
# Check if services are running
docker ps

# Check if units exist in database
./check-units.sh

# Restart services if needed
docker-compose restart

# Check frontend logs
docker logs frontend

# Check map service logs
docker logs map-service
```

## Expected Terminal Output

The terminal should show:
```
✓ Red Infantry Battalion: DESTROYED by artillery strike
```

And final statistics showing:
```
Red Force: 4 units (1 destroyed, others damaged)
Red Personnel: ~157 (casualties: ~418)
```

## Success Criteria

✅ You see units moving on the map during battle
✅ Movement trails (blue dashed lines) appear
✅ At least one unit shows skull icon
✅ Dashboard statistics change during battle
✅ Left-click shows popup, right-click shows edit form
✅ "Live Updates" indicator pulses every 2 seconds

If all ✅ are checked, the visual demo is working perfectly!
