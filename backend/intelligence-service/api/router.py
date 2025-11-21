from fastapi import APIRouter, HTTPException
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
import json
import re
import random

# Додаємо Groq імпорт
try:
    from groq import Groq
    from core.config import settings
    GROQ_AVAILABLE = True
    groq_client = Groq(api_key=settings.groq_api_key)
except ImportError:
    GROQ_AVAILABLE = False
    groq_client = None

# Utility функції
def safe_int(value, default):
    try:
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def safe_float(value, default):
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def process_unit(unit, actions, tactical_situation, terrain_effect):
    """Обробка підрозділу з урахуванням дій та умов"""
    processed_unit = unit.copy()
    
    # Застосування дій до підрозділу
    unit_actions = [a for a in actions if a.get("unitId") == unit.get("id")]
    
    # Базові зміни від дій
    if unit_actions:
        for action in unit_actions:
            if action.get("priority") == "HIGH":
                processed_unit["morale"] = min(100, processed_unit.get("morale", 65) + 10)
            elif action.get("priority") == "LOW":
                processed_unit["morale"] = max(30, processed_unit.get("morale", 65) - 5)
    
    # Вплив тактичної ситуації
    if tactical_situation == "BLUE_ADVANTAGE" and unit.get("faction") == "BLUE_FORCE":
        processed_unit["morale"] = min(100, processed_unit.get("morale", 65) + 15)
    elif tactical_situation == "RED_ADVANTAGE" and unit.get("faction") == "RED_FORCE":
        processed_unit["morale"] = min(100, processed_unit.get("morale", 65) + 15)
    
    # Вплив місцевості на firepower
    if "firepower" in processed_unit:
        processed_unit["firepower"] = int(processed_unit["firepower"] * terrain_effect["defense_bonus"])
    
    return processed_unit

# Тактичний системний промпт з урахуванням типів підрозділів
TACTICAL_SYSTEM_PROMPT = """
You are a military tactical AI. Analyze battle with different unit types and their unique capabilities.

UNIT TYPES & CAPABILITIES:
- INFANTRY/MECHANIZED/TANKS: Standard combat units
- RECONNAISSANCE: High mobility, reveals enemy positions
- UAV: Long range surveillance, artillery spotting
- ANTI_TANK: Effective vs armored units
- HOWITZER/MORTAR: Artillery with different ranges
- AIR_DEFENSE: Counters air threats
- COMMUNICATIONS: Coordinates other units
- ENGINEER: Builds/destroys obstacles
- MEDICAL/REPAIR/SUPPLY/LOGISTICS: Support units

ANALYZE UNIT INTERACTIONS:
- Artillery effectiveness based on range and spotting
- Anti-tank vs armored unit matchups
- Support units affecting combat efficiency
- Reconnaissance revealing enemy positions
- Communication coordination bonuses

CONSIDER UNIT CHARACTERISTICS:
- Mobility: affects positioning and retreat
- Firepower: base combat effectiveness
- Defense: survivability in combat
- Range: engagement distance

RETURN EXACTLY THIS FORMAT:
{"battle_outcome":"BLUE_VICTORY","units":[{"id":"unit_id","faction":"BLUE_FORCE","unitType":"TANKS","status":"ATTACKING","morale":70,"personnel":35,"vehicles":10,"firepower":85}],"communications":[{"priority":"HIGH","recipient":"Командир","message":"Тактична рекомендація","reasoning":"Обґрунтування"}]}

CRITICAL RULES:
- ONLY JSON, no text before/after
- Consider unit types in battle calculations
- Account for unit synergies and counters
- Realistic casualties based on unit matchups
- Use Ukrainian for text fields
- Max 80 chars per Ukrainian text field
"""

class ActionRequest(BaseModel):
    unitId: str
    description: str
    priority: str = Field(default="MEDIUM", description="HIGH/MEDIUM/LOW")
    timeframe: str = Field(default="SHORT", description="IMMEDIATE/SHORT/LONG")

class BattleAnalyzeRequest(BaseModel):
    battle_data: Dict[str, Any]
    actions: list[ActionRequest] = Field(default=[])
    terrain: str = Field(default="urban")
    weather: str = Field(default="clear")
    max_tokens: int = Field(default=1200)
    temperature: float = Field(default=0.7)

class CommunicationRecommendation(BaseModel):
    priority: str
    recipient: str
    message: str
    reasoning: str

class TimelineEvent(BaseModel):
    time: str
    event: str

class BattleAnalyzeResponse(BaseModel):
    model_config = {"extra": "allow"}
    battle_outcome: Optional[str] = None
    units: list = Field(default=[])
    obstacles: list = Field(default=[])
    details: list = Field(default=[])
    timeline: Optional[list[TimelineEvent]] = None
    communications: Optional[list[CommunicationRecommendation]] = None

router = APIRouter()

@router.get("/test")
async def test_groq():
    if not GROQ_AVAILABLE:
        return {"status": "error", "response": "❌ Groq бібліотека не встановлена"}
    
    try:
        response = groq_client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": "Test connection. Reply with 'OK'"}],
            max_tokens=10
        )
        
        return {
            "status": "success", 
            "response": f"✅ Groq AI підключено: {response.choices[0].message.content}"
        }
    except Exception as e:
        return {
            "status": "error", 
            "response": f"❌ Groq помилка: {str(e)}"
        }

@router.post("/analyze", response_model=BattleAnalyzeResponse)
async def battle_analyze_endpoint(request: BattleAnalyzeRequest):
    """Main Analysis Engine - використовує тільки Groq AI"""
    
    if not GROQ_AVAILABLE:
        raise HTTPException(status_code=500, detail="Groq AI недоступний")
    
    # Формуємо повну бойову ситуацію
    full_battle_data = {
        "units": request.battle_data.get("units", []),
        "obstacles": request.battle_data.get("obstacles", []),
        "actions": [action.dict() for action in request.actions],
        "terrain": request.terrain,
        "weather": request.weather
    }
    
    # Мінімальний промпт
    units_count = len(full_battle_data.get("units", []))
    actions_count = len(full_battle_data.get("actions", []))
    prompt = f"Battle: {units_count} units, {actions_count} actions, terrain: {request.terrain}. Return JSON analysis."
    
    try:
        response = groq_client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": TACTICAL_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=request.max_tokens,
            temperature=0.3
        )
    except Exception as e:
        error_msg = str(e).lower()
        if "authentication" in error_msg or "api key" in error_msg:
            raise HTTPException(status_code=401, detail="Невірний Groq API ключ")
        elif "rate limit" in error_msg or "quota" in error_msg:
            raise HTTPException(status_code=429, detail="Перевищено ліміт запитів Groq API")
        elif "timeout" in error_msg or "connection" in error_msg:
            raise HTTPException(status_code=503, detail="Тимчасова недоступність Groq API")
        else:
            raise HTTPException(status_code=500, detail=f"Помилка Groq API: {str(e)}")
    
    # Парсимо JSON відповідь від Groq
    try:
        full_response = response.choices[0].message.content
        print(f"=== FULL AI RESPONSE ===")
        print(full_response)
        print(f"=== END AI RESPONSE ===")
        print(f"Response length: {len(full_response)}")
        
        content = full_response.strip()
        # Очищуємо від markdown та зайвих символів
        content = content.replace('```json', '').replace('```', '')
        content = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', content)
        content = content.strip()
        print(f"Cleaned content: {content}")
        
        # Витягуємо тільки JSON частину
        json_start = content.find('{')
        if json_start != -1:
            # Знаходимо кінець JSON об'єкта
            brace_count = 0
            json_end = json_start
            for i, char in enumerate(content[json_start:], json_start):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        json_end = i + 1
                        break
            content = content[json_start:json_end]
        
        # Виправляємо неповний JSON
        open_braces = content.count('{')
        close_braces = content.count('}')
        if open_braces > close_braces:
            content += '}' * (open_braces - close_braces)
        
        groq_result = json.loads(content)
        
        # Валідація та структурування відповіді
        for unit in groq_result.get("units", []):
            if unit.get("status") not in ["ATTACKING", "DEFENDING"]:
                unit["status"] = "DEFENDING"
        
        # Забезпечуємо наявність всіх полів
        if "communications" not in groq_result:
            groq_result["communications"] = []
        if "timeline" not in groq_result:
            groq_result["timeline"] = []
        if "battle_outcome" not in groq_result:
            groq_result["battle_outcome"] = "ONGOING"
        if "details" not in groq_result:
            groq_result["details"] = []
        
        groq_result["details"].insert(0, {
            "step": 0,
            "description": "🤖 Groq AI аналіз виконано"
        })
        
        print(f"Successfully parsed JSON with {len(groq_result)} fields")
        return BattleAnalyzeResponse(**groq_result)
        
    except (json.JSONDecodeError, KeyError) as parse_error:
        print(f"Parse error: {parse_error}")
        raise HTTPException(status_code=500, detail=f"AI повернув невалідний JSON: {str(parse_error)}")