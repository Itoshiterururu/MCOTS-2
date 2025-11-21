# MCOTS Instant Battle Scenario Demo

## 🎯 What This Demo Does

This script creates a **complete tactical battle scenario** with:
- ✅ 12 military units (Blue Force defending, Red Force attacking)
- ✅ Defensive obstacles (minefields, tank traps, trenches)
- ✅ Fields of fire (3 defensive sectors)
- ✅ Fire missions (artillery strikes)
- ✅ Automated enemy script (3-step assault)
- ✅ **LIVE BATTLE SIMULATION** with casualties and damage
- ✅ AI intelligence analysis
- ✅ Complete battle statistics
- ✅ Interactive tactical map

**Time to complete: ~45 seconds**

---

## 🚀 Quick Start

### Step 1: Start Services

```bash
docker compose up -d --build
```

Wait 60 seconds for services to start.

### Step 2: Run Demo

```bash
./demo-instant-battle.sh
```

### Step 3: Open Browser

Go to: **http://localhost:5173**

Login:
- **Username:** `tactical_demo`
- **Password:** `TacticalDemo123`

---

## 📊 What You'll See

### During Script Execution

```
═══════════════════════════════════════════════════════
  Deploying Blue Force (Defensive)
═══════════════════════════════════════════════════════

✓ Command Post deployed
✓ Tank Company positioned (40 tanks)
✓ Mechanized Infantry positioned (120 troops)
✓ Artillery Battery ready (9 howitzers)
✓ Recon Platoon scouting forward
✓ Air Defense deployed
✓ Supply Unit secured
  Total: 7 units | 415 personnel | 121 vehicles

═══════════════════════════════════════════════════════
  Detecting Red Force (Offensive)
═══════════════════════════════════════════════════════

✓ Enemy Command Post identified
✓ Enemy Tank Company advancing (35 tanks)
✓ Enemy Mechanized Infantry detected (115 troops)
✓ Enemy Artillery providing support
✓ Enemy Infantry holding position
  Total: 5 units | 398 personnel | 105 vehicles

═══════════════════════════════════════════════════════
  Enemy Automated Script Detected
═══════════════════════════════════════════════════════

✓ Enemy script identified: 'Coordinated Assault'
✓ Script sequence: 3 coordinated actions
★ ENEMY SCRIPT ACTIVATED - Assault in progress!

═══════════════════════════════════════════════════════
  Battle Simulation In Progress
═══════════════════════════════════════════════════════

→ Waiting for initial contact...
★ CONTACT! Enemy armor engaged at 2.8km
→ Blue Force artillery firing suppression mission...
→ Enemy taking casualties from defensive fire...
→ Red Force continuing advance under fire...
★ Heavy fighting in the minefield sector!
→ Red Tank Company: 10 tanks destroyed, morale falling
→ Red Mechanized Infantry: 25 casualties, 10 vehicles lost
→ Blue Tank Company: 3 tanks damaged, position holding
→ Blue Mechanized Infantry: 10 casualties, line intact
★ Engagement concludes - Defensive success!
```

### Battle Statistics Display

```
╔═══════════════════════════════════════════════════╗
║              FORCE COMPARISON                     ║
╠═══════════════════════════════════════════════════╣
║  BLUE FORCE (Defender)                            ║
║  ✓ Units:      7 (all operational)                ║
║  ✓ Personnel:  400 (casualties: 15)               ║
║  ✓ Vehicles:   118 (losses: 3)                    ║
║  ✓ Morale:     77% (holding firm)                 ║
║  ✓ Position:   Intact                             ║
╠═══════════════════════════════════════════════════╣
║  RED FORCE (Attacker)                             ║
║  ✗ Units:      5 (3 heavily damaged)              ║
║  ✗ Personnel:  175 (casualties: 223)              ║
║  ✗ Vehicles:   53 (losses: 52)                    ║
║  ✗ Morale:     42% (severely degraded)            ║
║  ✗ Position:   Assault failed                     ║
╚═══════════════════════════════════════════════════╝

KEY ENGAGEMENTS:
  • Tank duel at 2.8km - Blue Force victory (10:3 kill ratio)
  • Minefield sector - Red Force lost 20 vehicles
  • Artillery suppression - 30% reduction in enemy firepower
  • Defensive fire sectors - 100% coverage maintained

TACTICAL ASSESSMENT:
  • Blue Force prepared positions proved decisive
  • Obstacles channeled enemy into kill zones
  • Artillery effectively suppressed enemy advance
  • Communications network maintained coordination
  • Defensive victory - position secure
```

---

## 🎮 Interactive Features in UI

### 1. Map Layers (Toggle These!)

- **☑ Units** - See all 12 military units
- **☑ Communications** - Command network (green lines)
- **☑ Fields of Fire** - Defensive sectors (colored arcs)
- **☑ Fire Missions** - Artillery zones (circles)
- **☑ Obstacles** - Defensive barriers (red/gray lines)

### 2. Click on Units

Each unit shows:
- Personnel count and casualties
- Vehicle count and losses
- Firepower rating
- Supply level
- Morale status
- Communications status
- Current orders

### 3. View Battle Damage

**Blue Force Units:**
- Tank Company: 120→115 personnel, 40→37 vehicles
- Mechanized Infantry: 120→110 personnel
- All other units intact

**Red Force Units:**
- Tank Company: 110→85 personnel, 35→25 vehicles (29% tank losses!)
- Mechanized Infantry: 115→90 personnel, 38→28 vehicles
- Heavy casualties across assault force

### 4. Scripts Panel

- Find "Red Force Coordinated Assault"
- Status: ACTIVE
- 3-step sequence visible
- Watch automation in action

### 5. Actions Panel

View all tactical orders:
- Recon patrol (Blue Force)
- Enemy attack orders
- Movement commands
- Status of each action

### 6. Fire Control Panel

- Planned artillery missions
- Defensive fire sectors
- Coverage zones visualized

### 7. Intelligence Analysis

- Request AI tactical assessment
- Get force comparison
- Receive recommendations
- Analyze situation

---

## 🎯 Battle Scenario Explained

### Initial Situation

**Blue Force (Friendly):**
- Defending prepared positions
- 7 units in defensive line
- Obstacles protecting flanks
- Artillery in support
- Communications network active

**Red Force (Enemy):**
- Launching coordinated assault
- 5 units attacking
- Armor-heavy force
- Automated assault script
- Artillery support

### Battle Development

1. **Initial Contact** (0-2 min)
   - Red Force detected at 3km
   - Blue Force artillery opens fire
   - Defensive positions engaged

2. **Main Engagement** (2-5 min)
   - Tank duel at 2.8km range
   - Enemy enters minefield zone
   - Heavy casualties inflicted
   - Blue Force holds position

3. **Outcome** (5+ min)
   - Red Force assault repulsed
   - Heavy enemy losses (56% casualties)
   - Blue Force minor damage (3.6% casualties)
   - Defensive victory

### Key Success Factors

1. **Prepared Positions** - Blue Force dug in
2. **Obstacles** - Channeled enemy into kill zones
3. **Fields of Fire** - Overlapping defensive sectors
4. **Artillery** - Suppression reduced enemy effectiveness
5. **Communications** - Coordinated defense
6. **Morale** - Blue Force maintained cohesion

---

## 📈 Metrics & Statistics

### Force Composition

| Category | Blue Force | Red Force |
|----------|-----------|-----------|
| Units | 7 | 5 |
| Personnel | 415 → 400 | 398 → 175 |
| Vehicles | 121 → 118 | 105 → 53 |
| Casualties | 15 (3.6%) | 223 (56%) |
| Vehicle Losses | 3 (2.5%) | 52 (49.5%) |
| Morale | 77% | 42% |

### Engagement Results

**Blue Force Losses:**
- 15 personnel casualties
- 3 vehicles damaged/destroyed
- No units destroyed
- Morale: Holding firm (77%)

**Red Force Losses:**
- 223 personnel casualties (56% casualty rate!)
- 52 vehicles destroyed (49.5% loss rate!)
- 3 units heavily damaged
- Morale: Severely degraded (42%)

**Kill Ratio:**
- Personnel: 15:1 in favor of Blue Force
- Vehicles: 17:1 in favor of Blue Force
- Overall: Decisive defensive victory

---

## 🔄 Running Multiple Demos

### Clean and Restart

```bash
# Stop everything
docker compose down

# Remove old data
docker volume rm mongodb_data

# Start fresh
docker compose up -d --build

# Wait 60 seconds

# Run demo again
./demo-instant-battle.sh
```

### Try Different Scenarios

Modify the script to:
- Change unit positions
- Adjust force sizes
- Vary defensive obstacles
- Test different tactics

---

## 🐛 Troubleshooting

### Script Fails to Login

**Issue:** Services not ready yet

**Fix:** Wait 30 more seconds and run again:
```bash
./demo-instant-battle.sh
```

### No Units on Map

**Issue:** Browser cache

**Fix:**
1. Hard refresh: `Ctrl + Shift + R`
2. Check "Units" layer is enabled
3. Zoom in/out

### Intelligence Analysis Empty

**Issue:** GROQ_API_KEY not configured

**Fix:** This is optional - the demo works without it. To enable:
1. Get API key from https://console.groq.com
2. Add to `.env`: `GROQ_API_KEY=your_key_here`
3. Restart services

---

## ✨ What Makes This Demo Special

1. **Complete Battle Scenario** - Not just units, but a full tactical situation
2. **Automated Combat** - Enemy script executes automatically
3. **Real Battle Results** - Units take damage, show casualties
4. **Statistics & Analysis** - Comprehensive metrics
5. **Visual Impact** - All map layers show different tactical aspects
6. **Fast** - Complete demo in under 1 minute
7. **Repeatable** - Run as many times as you want
8. **Educational** - Shows realistic military tactics

---

## 🎓 Learn More

- **Full User Guide:** See `USER_GUIDE.md`
- **Quick Start:** See `QUICK_START.md`
- **GitHub Issues:** Report problems or suggest features

---

**Enjoy the tactical operations demonstration!** 🎯
