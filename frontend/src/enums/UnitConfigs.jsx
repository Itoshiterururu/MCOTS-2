import UnitType from './UnitType';
import Faction from './Faction';

/**
 * Configuration data for all units in the application
 * Including unit type, faction, icon path, and display label
 */
const sizeBlue = [44, 32];
const sizeRed = [68, 46 ];
const anchor = [16, 16];

const UnitConfigs = [
  // Старі типи (тільки візуальні налаштування)
  { 
    type: UnitType.INFANTRY, 
    faction: Faction.BLUE_FORCE, 
    icon: "/icons/Blue_Infantry.png", 
    label: "Піхота",
    size: sizeBlue,
    anchor: anchor
  },
  { 
    type: UnitType.MECHANIZED, 
    faction: Faction.BLUE_FORCE, 
    icon: "/icons/Blue_Mechanized.png", 
    label: "Механізовані",
    size: sizeBlue,
    anchor: anchor
  },
  { 
    type: UnitType.TANKS, 
    faction: Faction.BLUE_FORCE, 
    icon: "/icons/Blue_Tanks.png", 
    label: "Танки",
    size: sizeBlue,
    anchor: anchor
  },
  { 
    type: UnitType.INFANTRY, 
    faction: Faction.RED_FORCE, 
    icon: "/icons/Red_Infantry.png", 
    label: "Піхота",
    size: sizeRed,
    anchor: anchor
  },
  { 
    type: UnitType.MECHANIZED, 
    faction: Faction.RED_FORCE, 
    icon: "/icons/Red_Mechanized.png", 
    label: "Механізовані",
    size: sizeRed,
    anchor: anchor
  },
  { 
    type: UnitType.TANKS, 
    faction: Faction.RED_FORCE, 
    icon: "/icons/Red_Tanks.png", 
    label: "Танки",
    size: sizeRed,
    anchor: anchor
  },
  
  // Нові типи - Сині сили
  { type: UnitType.COMMUNICATIONS, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001110000000.png", label: "Зв'язківці", size: sizeBlue, anchor: anchor },
  { type: UnitType.ANTI_TANK, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001204000000.png", label: "Протитанкові", size: sizeBlue, anchor: anchor },
  { type: UnitType.RECONNAISSANCE, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001213000000.png", label: "Розвідка", size: sizeBlue, anchor: anchor },
  { type: UnitType.UAV, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001219000000.png", label: "БПЛА", size: sizeBlue, anchor: anchor },
  { type: UnitType.AIR_DEFENSE, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001301020000.png", label: "Зенітні", size: sizeBlue, anchor: anchor },
  { type: UnitType.HOWITZER, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001303010000.png", label: "Гаубиця", size: sizeBlue, anchor: anchor },
  { type: UnitType.MORTAR, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001308000000.png", label: "Міномети", size: sizeBlue, anchor: anchor },
  { type: UnitType.ENGINEER, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001407000000.png", label: "Інженерні", size: sizeBlue, anchor: anchor },
  { type: UnitType.REPAIR, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001611000000.png", label: "Ремонт", size: sizeBlue, anchor: anchor },
  { type: UnitType.SUPPLY, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001612000000.png", label: "Постачання", size: sizeBlue, anchor: anchor },
  { type: UnitType.MEDICAL, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001613000000.png", label: "Медичні", size: sizeBlue, anchor: anchor },
  { type: UnitType.LOGISTICS, faction: Faction.BLUE_FORCE, icon: "/icons/10031000001634000000.png", label: "Господарські", size: sizeBlue, anchor: anchor },
  
  // Нові типи - Червоні сили
  { type: UnitType.COMMUNICATIONS, faction: Faction.RED_FORCE, icon: "/icons/10061000001110000000.png", label: "Зв'язківці", size: sizeRed, anchor: anchor },
  { type: UnitType.ANTI_TANK, faction: Faction.RED_FORCE, icon: "/icons/10061000001204000000.png", label: "Протитанкові", size: sizeRed, anchor: anchor },
  { type: UnitType.RECONNAISSANCE, faction: Faction.RED_FORCE, icon: "/icons/10061000001213000000.png", label: "Розвідка", size: sizeRed, anchor: anchor },
  { type: UnitType.UAV, faction: Faction.RED_FORCE, icon: "/icons/10061000001219000000.png", label: "БПЛА", size: sizeRed, anchor: anchor },
  { type: UnitType.AIR_DEFENSE, faction: Faction.RED_FORCE, icon: "/icons/10061000001301020000.png", label: "Зенітні", size: sizeRed, anchor: anchor },
  { type: UnitType.HOWITZER, faction: Faction.RED_FORCE, icon: "/icons/10061000001303010000.png", label: "Гаубиця", size: sizeRed, anchor: anchor },
  { type: UnitType.MORTAR, faction: Faction.RED_FORCE, icon: "/icons/10061000001308000000.png", label: "Міномети", size: sizeRed, anchor: anchor },
  { type: UnitType.ENGINEER, faction: Faction.RED_FORCE, icon: "/icons/10061000001407000000.png", label: "Інженерні", size: sizeRed, anchor: anchor },
  { type: UnitType.REPAIR, faction: Faction.RED_FORCE, icon: "/icons/10061000001611000000.png", label: "Ремонт", size: sizeRed, anchor: anchor },
  { type: UnitType.SUPPLY, faction: Faction.RED_FORCE, icon: "/icons/10061000001612000000.png", label: "Постачання", size: sizeRed, anchor: anchor },
  { type: UnitType.MEDICAL, faction: Faction.RED_FORCE, icon: "/icons/10061000001613000000.png", label: "Медичні", size: sizeRed, anchor: anchor },
  { type: UnitType.LOGISTICS, faction: Faction.RED_FORCE, icon: "/icons/10061000001634000000.png", label: "Господарські", size: sizeRed, anchor: anchor }

];

export default UnitConfigs;