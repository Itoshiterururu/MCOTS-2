import { useState, useEffect, useRef } from 'react';
import './App.css';
import UkraineMap from './components/UkraineMap';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/Sidebar/RightSidebar';
import BattleResultsModal from './components/Communications/BattleResultsModal';
import AuthPage from './components/Auth/AuthPage';
import Header from './components/Header/Header';
import ScriptManager from './components/Scripts/ScriptManager';
import UserAccount from './components/Account/UserAccount';
import ReplayManager from './components/Replay/ReplayManager';
import BattleStatsDashboard from './components/BattleStats/BattleStatsDashboard';
import BattleAnalytics from './components/Analytics/BattleAnalytics';
import LiveUpdateIndicator from './components/UI/LiveUpdateIndicator';
import authService from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [units, setUnits] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [actions, setActions] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedObstacle, setSelectedObstacle] = useState(null);
  const mapRef = useRef();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [battleAnalysisData, setBattleAnalysisData] = useState(null);
  const [showScriptManager, setShowScriptManager] = useState(false);
  const [showAccountPage, setShowAccountPage] = useState(false);
  const [showReplayManager, setShowReplayManager] = useState(false);
  const [showBattleStats, setShowBattleStats] = useState(true);
  const [showBattleAnalytics, setShowBattleAnalytics] = useState(false);



  // Check authentication on mount
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const userInfo = authService.getUserInfo();
      setUser(userInfo);
      setIsAuthenticated(true);
    }
  }, []);
  
  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnits();
      fetchObstacles();
      fetchActions();
    }
  }, [isAuthenticated]);

  // Auto-refresh units every 2 seconds to show live updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnits();
    }, 2000); // Refresh every 2 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);
  
  // Listen for force update events from battle service results
  useEffect(() => {
    const handleForceMapUpdate = (event) => {
      console.log('Received forceMapUpdate event:', event.detail);
      if (event.detail && event.detail.units) {
        // Update units state directly to cause re-render of map with new positions
        setUnits(event.detail.units);
      }
    };
    
    const handleLoadBattleData = (event) => {
      const { units, obstacles } = event.detail;

      // Clear existing data
      setUnits([]);
      setObstacles([]);

      // Load new data
      setTimeout(() => {
        setUnits(units || []);
        setObstacles(obstacles || []);
      }, 100);
    };

    document.addEventListener('forceMapUpdate', handleForceMapUpdate);
    document.addEventListener('loadBattleData', handleLoadBattleData);

    return () => {
      document.removeEventListener('forceMapUpdate', handleForceMapUpdate);
      document.removeEventListener('loadBattleData', handleLoadBattleData);
    };
  }, []);

  const fetchUnits = async () => {
    try {
      const { getAllUnits } = await import('./services/api');
      const result = await getAllUnits();
      
      if (result.success) {
        setUnits(result.data);
      } else {
        console.error('Failed to fetch units:', result.error);
      }
    } catch (error) {
      console.error('Failed to fetch units:', error);
    }
  };

  const fetchObstacles = async () => {
    try {
      const { getAllObstacles } = await import('./services/api');
      const result = await getAllObstacles();
      
      if (result.success) {
        setObstacles(result.data);
      } else {
        console.error('Failed to fetch obstacles:', result.error);
      }
    } catch (error) {
      console.error('Failed to fetch obstacles:', error);
    }
  };

  const fetchActions = async () => {
    try {
      const { getAllActionsWithUnits } = await import('./services/api');
      const result = await getAllActionsWithUnits();
      
      if (result.success) {
        setActions(result.data);
      } else {
        console.error('Failed to fetch actions:', result.error);
      }
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    }
  };

  const handleUnitCreated = (newUnitOrUnits) => {
    if (Array.isArray(newUnitOrUnits)) {
      setUnits(newUnitOrUnits);
    } else if (newUnitOrUnits) {
      setUnits(prevUnits => [...prevUnits, newUnitOrUnits]);
    }
    setSelectedPosition(null);
    setSelectedUnit(null);
  };

  const handleObstacleCreated = (newObstacleOrObstacles) => {
    if (Array.isArray(newObstacleOrObstacles)) {
      setObstacles(newObstacleOrObstacles);
    } else if (newObstacleOrObstacles) {
      setObstacles(prevObstacles => [...prevObstacles, newObstacleOrObstacles]);
    }
    setSelectedPosition(null);
    setSelectedObstacle(null);
  };

  const handleMapClick = (position) => {
    setSelectedPosition(position);
  };

  const handleUnitSelect = (unitData) => {
    setSelectedUnit(unitData);
    if (unitData) {
      setSelectedObstacle(null);
    }
    if (!unitData) {
      setSelectedPosition(null);
    }
  };

  const handleObstacleSelect = (obstacleType) => {
    setSelectedObstacle(obstacleType);
    if (obstacleType) {
      setSelectedUnit(null);
    }
  };

  const handleShowSuccess = (analysisData) => {
    setBattleAnalysisData(analysisData);
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setBattleAnalysisData(null);
  };

  const handleAuthenticated = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setUnits([]);
    setObstacles([]);
    setActions([]);
  };



  if (!isAuthenticated) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="app-container">
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenScriptManager={() => setShowScriptManager(true)}
        onOpenAccount={() => setShowAccountPage(true)}
        onOpenReplayManager={() => setShowReplayManager(true)}
        onToggleBattleStats={() => setShowBattleStats(!showBattleStats)}
        onOpenAnalytics={() => setShowBattleAnalytics(true)}
        showBattleStats={showBattleStats}
      />
      <div className="main-content">
        <Sidebar 
          onUnitSelect={handleUnitSelect}
          onObstacleSelect={handleObstacleSelect}
          selectedUnit={selectedUnit}
          selectedObstacle={selectedObstacle}
          selectedMapPosition={selectedPosition}
        />
        <div className="map-wrapper">
          <UkraineMap 
            ref={mapRef}
            selectedPosition={selectedPosition} 
            onPositionSelect={handleMapClick}
            units={units}
            obstacles={obstacles}
            selectedUnit={selectedUnit}
            selectedObstacle={selectedObstacle}
            onUnitCreated={handleUnitCreated}
            onObstacleCreated={handleObstacleCreated}
            onObstacleSelect={handleObstacleSelect}
          />
        </div>
        <RightSidebar 
          units={units} 
          actions={actions} 
          onShowSuccess={handleShowSuccess}
        />
      </div>
      
      <BattleResultsModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        battleData={battleAnalysisData}
      />

      {showScriptManager && (
        <ScriptManager
          units={units}
          onClose={() => setShowScriptManager(false)}
        />
      )}

      {showAccountPage && (
        <UserAccount
          onClose={() => setShowAccountPage(false)}
        />
      )}

      {showReplayManager && (
        <ReplayManager
          onClose={() => setShowReplayManager(false)}
        />
      )}

      <BattleStatsDashboard
        units={units}
        isVisible={showBattleStats}
        onClose={() => setShowBattleStats(false)}
      />

      <BattleAnalytics
        units={units}
        isVisible={showBattleAnalytics}
        onClose={() => setShowBattleAnalytics(false)}
      />

      <LiveUpdateIndicator isActive={isAuthenticated} />
    </div>
  );
}

export default App;