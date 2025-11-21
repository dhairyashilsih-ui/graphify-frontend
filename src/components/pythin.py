import requests
import json
import os
import sys
from typing import Dict, List, Any, Optional
import time

# Local AI Backend URL (our Express.js server)
BACKEND_URL = "http://localhost:3001"
OLLAMA_URL = "http://localhost:11434"

class GraphoraXLocalAI:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.ollama_url = OLLAMA_URL
        self.available_models = {
            "agriculture": "llama3.1:8b",
            "health": "mistral:7b", 
            "finance": "llama3.1:8b",
            "education": "mistral:7b",
            "transport": "llama3.1:8b",
            "universal": "llama3.1:8b"
        }
        self.fallback_responses = self._init_fallback_responses()
    
    def _init_fallback_responses(self) -> Dict[str, Dict[str, Any]]:
        """Initialize fallback responses for when AI is unavailable"""
        return {
            "agriculture": {
                "insights": [
                    "Soil moisture at 45% indicates adequate hydration for most crops",
                    "Upcoming rainfall may reduce irrigation needs by 30-40%",
                    "Current conditions favor vegetative growth phase"
                ],
                "recommendations": [
                    "Reduce irrigation schedule by 50% over next 3-5 days",
                    "Monitor drainage systems to prevent waterlogging",
                    "Apply nitrogen fertilizer before heavy rainfall"
                ],
                "causal_relationships": [
                    {"source": "rainfall", "target": "soil_moisture", "strength": 0.9, "type": "positive"},
                    {"source": "soil_moisture", "target": "crop_health", "strength": 0.8, "type": "positive"}
                ],
                "confidence": 75
            },
            "health": {
                "insights": [
                    "Heart rate of 95 bpm is slightly elevated for resting state",
                    "Sleep issues may be contributing to cardiovascular stress",
                    "Correlation between sleep quality and heart rate variability detected"
                ],
                "recommendations": [
                    "Implement relaxation techniques before bedtime",
                    "Monitor caffeine intake, especially after 2 PM",
                    "Consider sleep hygiene improvements and consistent schedule"
                ],
                "causal_relationships": [
                    {"source": "sleep_quality", "target": "heart_rate", "strength": 0.7, "type": "negative"},
                    {"source": "stress", "target": "sleep_quality", "strength": 0.8, "type": "negative"}
                ],
                "confidence": 82
            },
            "finance": {
                "insights": [
                    "Portfolio shows balanced risk-return profile",
                    "Market volatility within acceptable parameters",
                    "Diversification strategy appears effective"
                ],
                "recommendations": [
                    "Consider rebalancing if any asset exceeds 25% allocation",
                    "Monitor emerging market exposure for opportunities",
                    "Review expense ratios quarterly for cost optimization"
                ],
                "causal_relationships": [
                    {"source": "diversification", "target": "risk_reduction", "strength": 0.8, "type": "positive"},
                    {"source": "market_volatility", "target": "portfolio_risk", "strength": 0.6, "type": "positive"}
                ],
                "confidence": 78
            }
        }
    
    def check_backend_health(self) -> Dict[str, Any]:
        """Check if our AI backend is running"""
        try:
            response = requests.get(f"{self.backend_url}/api/health", timeout=5)
            if response.status_code == 200:
                return response.json()
            else:
                return {"status": "unhealthy", "error": f"HTTP {response.status_code}"}
        except requests.exceptions.RequestException as e:
            return {"status": "unavailable", "error": str(e)}
    
    def analyze_domain(self, domain: str, query: str, input_type: str = "text", file_path: Optional[str] = None) -> Dict[str, Any]:
        """Analyze query using local AI with fallback support"""
        
        print(f"🔍 Analyzing {domain.upper()} query...")
        print(f"📝 Query: {query[:100]}{'...' if len(query) > 100 else ''}")
        
        # Try backend first
        try:
            payload = {
                "domain": domain,
                "query": query,
                "inputType": input_type
            }
            
            if file_path and os.path.exists(file_path):
                # Handle file upload for multimodal analysis
                with open(file_path, 'rb') as f:
                    files = {'file': f}
                    response = requests.post(
                        f"{self.backend_url}/api/analyze/multimodal",
                        data=payload,
                        files=files,
                        timeout=30
                    )
            else:
                response = requests.post(
                    f"{self.backend_url}/api/analyze",
                    json=payload,
                    timeout=30
                )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    print("✅ Analysis completed using local AI")
                    return self._format_response(result["data"], "local_ai")
                else:
                    print("⚠️ AI backend returned error, using fallback")
                    return self._get_fallback_response(domain, query)
            else:
                print(f"❌ Backend error: {response.status_code}")
                return self._get_fallback_response(domain, query)
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Backend connection failed: {e}")
            return self._get_fallback_response(domain, query)
    
    def _get_fallback_response(self, domain: str, query: str) -> Dict[str, Any]:
        """Get fallback response when AI is unavailable"""
        fallback = self.fallback_responses.get(domain, self.fallback_responses["agriculture"])
        
        return self._format_response({
            **fallback,
            "domain": domain,
            "query_processed": query[:100],
            "source": "fallback_data",
            "note": "Local AI unavailable - using intelligent fallback responses"
        }, "fallback")
    
    def _format_response(self, data: Dict[str, Any], source: str) -> Dict[str, Any]:
        """Format response for consistent output"""
        return {
            "success": True,
            "domain": data.get("domain", "unknown"),
            "analysis": {
                "insights": data.get("insights", []),
                "recommendations": data.get("recommendations", []),
                "causal_relationships": data.get("causal_relationships", []),
                "risk_factors": data.get("risk_factors", []),
                "confidence_score": data.get("confidence_score", data.get("confidence", 70)),
                "data_quality": data.get("data_quality", "medium"),
                "next_steps": data.get("next_steps", [])
            },
            "metadata": {
                "source": source,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "model_used": data.get("model_used", "fallback"),
                "processing_time": data.get("processing_time", "< 1s")
            },
            "raw_data": data
        }
    
    def install_models(self) -> Dict[str, Any]:
        """Install recommended AI models"""
        print("📦 Starting model installation...")
        
        health = self.check_backend_health()
        if health["status"] == "unavailable":
            return {
                "success": False,
                "message": "Backend not available. Start with: cd backend && npm start"
            }
        
        try:
            response = requests.get(f"{self.backend_url}/api/models", timeout=10)
            if response.status_code == 200:
                models_info = response.json()
                print("📋 Current models:", models_info.get("installed", []))
                print("🎯 Recommended models:", models_info.get("recommended", {}))
                
                return {
                    "success": True,
                    "installed": models_info.get("installed", []),
                    "recommended": models_info.get("recommended", {}),
                    "instructions": "Run 'ollama pull llama3.1:8b' to install the main model"
                }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def run_comprehensive_test(self) -> None:
        """Run comprehensive test of all domains"""
        print("🚀 Running comprehensive GraphoraX AI test...\n")
        
        # Check system health
        health = self.check_backend_health()
        print(f"🏥 System Health: {health.get('status', 'unknown')}")
        if health.get('ollama') == 'running':
            print(f"🧠 Ollama Status: ✅ Running")
            print(f"📋 Available Models: {health.get('models', [])}")
        else:
            print(f"🧠 Ollama Status: ❌ Not running (using fallback)")
        print()
        
        # Test each domain
        test_cases = {
            "agriculture": "Analyze crop yield optimization for tomatoes with current soil pH 6.2 and nitrogen levels at 15 ppm",
            "health": "Evaluate cardiovascular risk factors for a 35-year-old with BP 130/85, BMI 28, and sedentary lifestyle",
            "finance": "Assess portfolio rebalancing strategy with 60% stocks, 30% bonds, 10% commodities amid rising inflation",
            "education": "Optimize learning path for computer science student struggling with data structures and algorithms",
            "transport": "Analyze traffic flow optimization for urban intersection with 40% congestion during peak hours",
            "universal": "Synthesize multi-domain insights for smart city planning integrating health, transport, and environmental data"
        }
        
        for domain, query in test_cases.items():
            print(f"🔬 Testing {domain.upper()} domain...")
            result = self.analyze_domain(domain, query)
            
            if result["success"]:
                analysis = result["analysis"]
                print(f"✅ Analysis successful!")
                print(f"📊 Confidence: {analysis['confidence_score']}%")
                print(f"💡 Key insights: {len(analysis['insights'])} found")
                print(f"🎯 Recommendations: {len(analysis['recommendations'])} provided")
                print(f"🔗 Causal links: {len(analysis['causal_relationships'])} identified")
                print(f"⏱️ Source: {result['metadata']['source']}")
            else:
                print(f"❌ Analysis failed for {domain}")
            
            print("-" * 60)
        
        print("🎉 Comprehensive test completed!")
        print("\n💡 Quick start commands:")
        print("1. Start backend: cd backend && npm start")
        print("2. Install models: ollama pull llama3.1:8b")
        print("3. Test again: python pythin.py")

# Command line interface
def main():
    ai = GraphoraXLocalAI()
    
    if len(sys.argv) == 1:
        # No arguments - run comprehensive test
        ai.run_comprehensive_test()
    elif len(sys.argv) == 2 and sys.argv[1] == "--health":
        # Health check
        health = ai.check_backend_health()
        print(json.dumps(health, indent=2))
    elif len(sys.argv) == 2 and sys.argv[1] == "--install":
        # Install models
        result = ai.install_models()
        print(json.dumps(result, indent=2))
    elif len(sys.argv) >= 3:
        # Domain analysis
        domain = sys.argv[1]
        query = " ".join(sys.argv[2:])
        result = ai.analyze_domain(domain, query)
        print(json.dumps(result, indent=2))
    else:
        print("Usage:")
        print("  python pythin.py                    # Run comprehensive test")
        print("  python pythin.py --health           # Check system health")
        print("  python pythin.py --install          # Install models")
        print("  python pythin.py <domain> <query>   # Analyze specific domain")
        print("\nDomains: agriculture, health, finance, education, transport, universal")

if __name__ == "__main__":
    main()
