// App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import "./.env";

const FenceCalculator = () => {
  const [purchaseSuggestions, setPurchaseSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ownershipYears, setOwnershipYears] = useState(50);
  const [fenceType, setFenceType] = useState("wood");
  const [footage, setFootage] = useState(100);
  const [costs, setCosts] = useState({
    wood: {
      material: 10,
      maintenance: 1,
    },
    vinyl: {
      material: 20,
      maintenance: 0,
    },
  });

  const ownershipOptions = [
    { value: 50, label: "50 years or more" },
    { value: 45, label: "40-50 years" },
    { value: 40, label: "30-40 years" },
    { value: 30, label: "20-30 years" },
    { value: 15, label: "10-20 years" },
    { value: 10, label: "0-10 years" },
  ];

  const handleCostChange = (type, costType, value) => {
    setCosts((prevCosts) => ({
      ...prevCosts,
      [type]: {
        ...prevCosts[type],
        [costType]: Number(value) || 0,
      },
    }));
  };

  const calculateWoodReplacements = (years) => {
    const replacements = Math.floor(years / 15);
    return replacements * (costs.wood.material + 10); // Material + Installation
  };

  const calculateVinylReplacements = (years) => {
    const replacements = Math.floor(years / 20);
    return replacements * (costs.vinyl.material + 7.5); // Material + Installation
  };

  const calculateCosts = (type) => {
    if (type === "buckley") {
      return {
        material: 30,
        maintenance: 0,
        replacement: 0,
        total: 30,
      };
    } else if (type === "wood") {
      const maintenance = ownershipYears * costs.wood.maintenance;
      const replacement = calculateWoodReplacements(ownershipYears);
      return {
        material: costs.wood.material,
        maintenance,
        replacement,
        total: costs.wood.material + maintenance + replacement,
      };
    } else {
      // vinyl
      const replacement = calculateVinylReplacements(ownershipYears);
      return {
        material: costs.vinyl.material,
        maintenance: 0,
        replacement,
        total: costs.vinyl.material + replacement,
      };
    }
  };

  const buckleyCosts = calculateCosts("buckley");
  const alternateCosts = calculateCosts(fenceType);
  const savingsPerFoot = alternateCosts.total - buckleyCosts.total;
  const totalSavings = savingsPerFoot * footage;

  const fetchPurchases = async (amount) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You generate a list of ridiculous things people can buy based on a given amount of money. Include item names and quantities. Keep it fun and absurd! Return exactly 3 items, one per line, with bullet points.",
            },
            {
              role: "user",
              content: `I have ${amount}. What are some ridiculous things I can buy?`,
            },
          ],
        },
        {
          headers: {
            Authorization: `PROCESS.ENV.KEY`,
            "Content-Type": "application/json",
          },
        }
      );
      setPurchaseSuggestions(
        response.data.choices[0].message.content.split("\n")
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setPurchaseSuggestions([
        "• Error loading suggestions",
        "• Please try again later",
        "• Check console for details",
      ]);
    }
    setLoading(false);
  };

  // Fetch new suggestions when savings amount changes
  useEffect(() => {
    if (totalSavings > 0) {
      fetchPurchases(totalSavings.toFixed(2));
    }
  }, [totalSavings]);

  return (
    <div className="calculator">
      <div className="calculator-header">
        <h2
          className="gold-text"
          style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}
        >
          Fence Cost Calculator
        </h2>
        <p className="subtitle" style={{ margin: "4px 0 0 0" }}>
          (Cost per foot)
        </p>
      </div>

      <div className="content-section">
        <div className="input-group">
          <label className="label">Total Fence Length (feet):</label>
          <input
            type="number"
            className="select-field"
            value={footage}
            onChange={(e) => setFootage(Number(e.target.value) || 0)}
            min="0"
            step="1"
          />
        </div>

        <div className="input-group">
          <label className="label">
            How Long Do You Plan to Own your Property:
          </label>
          <select
            className="select-field"
            value={ownershipYears}
            onChange={(e) => setOwnershipYears(Number(e.target.value))}
          >
            {ownershipOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="label">Alternative Fence Type:</label>
          <select
            className="select-field"
            value={fenceType}
            onChange={(e) => setFenceType(e.target.value)}
          >
            <option value="wood">Wood</option>
            <option value="vinyl">Vinyl</option>
          </select>
        </div>

        <div className="comparison-grid">
          <div className="card">
            <h3 className="card-title">Buckley Fence</h3>
            <div>
              <p className="cost-row">
                Material Cost: ${buckleyCosts.material}/ft
              </p>
              <p className="cost-row">
                Maintenance Cost: ${buckleyCosts.maintenance}/ft
              </p>
              <p className="cost-row">
                Replacement Costs: ${buckleyCosts.replacement}/ft
              </p>
              <p className="total-cost">Total Cost: ${buckleyCosts.total}/ft</p>
              <p className="total-cost">
                Total Project Cost: ${(buckleyCosts.total * footage).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title capitalize">{fenceType} Fence</h3>
            <div>
              <div className="input-group">
                <label className="label" style={{ fontSize: "0.875rem" }}>
                  Material Cost ($/ft):
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={costs[fenceType].material}
                  onChange={(e) =>
                    handleCostChange(fenceType, "material", e.target.value)
                  }
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="input-group">
                <label className="label" style={{ fontSize: "0.875rem" }}>
                  Maintenance Cost ($/ft/year):
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={costs[fenceType].maintenance}
                  onChange={(e) =>
                    handleCostChange(fenceType, "maintenance", e.target.value)
                  }
                  min="0"
                  step="0.1"
                />
              </div>
              <p className="cost-row">
                Replacement Costs: ${alternateCosts.replacement}/ft
              </p>
              <p className="total-cost">
                Total Cost: ${alternateCosts.total}/ft
              </p>
              <p className="total-cost">
                Total Project Cost: $
                {(alternateCosts.total * footage).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="savings-section">
          <h3 className="savings-title">Your Savings with Buckley Fence</h3>
          <p className="savings-amount" style={{ fontSize: "2rem" }}>
            Total Savings: ${totalSavings.toFixed(2)} over {ownershipYears}{" "}
            years
          </p>
          <p className="savings-amount" style={{ fontSize: "1.25rem" }}>
            ${savingsPerFoot.toFixed(2)} saved per foot
          </p>
          <p className="savings-note">
            Based on current material, maintenance, and replacement cost
            estimates
          </p>
        </div>

        <div className="savings-alternatives">
          <h3 className="savings-title">Or you could buy...</h3>
          <div className="suggestions-list">
            {loading ? (
              <p>Loading suggestions...</p>
            ) : (
              purchaseSuggestions.map((suggestion, index) => (
                <p key={index} className="suggestion-item">
                  {suggestion}
                </p>
              ))
            )}
          </div>
        </div>

        <div className="notes-section">
          <p style={{ margin: 0 }}>
            Note: Calculations assume:
            <br />- Wood fences need replacement every 15 years (including ${10}
            /ft installation)
            <br />- Vinyl fences need replacement every 20 years (including $
            {7.5}/ft installation)
            <br />- Standard wood maintenance is $2.50/ft every 2-3 years
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div>
      <FenceCalculator />
    </div>
  );
}

export default App;
