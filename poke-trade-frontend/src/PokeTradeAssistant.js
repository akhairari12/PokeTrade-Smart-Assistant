import React, { useState } from "react";

export default function PokeTradeAssistant() {
  const [pokemon1, setPokemon1] = useState("");
  const [pokemon2, setPokemon2] = useState("");
  const [level1, setLevel1] = useState(1);
  const [level2, setLevel2] = useState(1);
  const [tradeResult, setTradeResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTradeCheck = async () => {
    if (!pokemon1 || !pokemon2) {
      alert("Please enter both Pokémon names.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/trade?pokemon1=${pokemon1}&pokemon2=${pokemon2}&level1=${level1}&level2=${level2}`
      );
      const data = await response.json();
      setTradeResult(data);
    } catch (error) {
      console.error("Error fetching trade data:", error);
      alert("Failed to fetch trade data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>PokéTrade Smart Assistant</h1>
      <p style={styles.subtitle}>Check if your Pokémon trade is fair!</p>

      <div style={styles.inputContainer}>
        {/* Input for Pokémon 1 */}
        <input
          type="text"
          placeholder="Enter first Pokémon (e.g., Charizard)"
          value={pokemon1}
          onChange={(e) => setPokemon1(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Level"
          value={level1}
          min="1"
          max="100"
          onChange={(e) => setLevel1(e.target.value)}
          style={styles.input}
        />

        {/* Input for Pokémon 2 */}
        <input
          type="text"
          placeholder="Enter second Pokémon (e.g., Blastoise)"
          value={pokemon2}
          onChange={(e) => setPokemon2(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Level"
          value={level2}
          min="1"
          max="100"
          onChange={(e) => setLevel2(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={handleTradeCheck}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Checking..." : "Check Trade Fairness"}
        </button>
      </div>

      {/* Display Trade Results */}
      {tradeResult && (
        <div style={styles.resultCard}>
          <h2 style={styles.resultTitle}>Trade Results</h2>

          <div style={styles.pokemonContainer}>
            {/* Pokémon 1 Card */}
            <div style={styles.pokemonCard}>
              <img
                src={tradeResult.pokemon1_image}
                alt={tradeResult.pokemon1}
                style={styles.pokemonImage}
              />
              <p style={styles.pokemonName}>{tradeResult.pokemon1}</p>
              <p style={styles.levelText}>Level: {tradeResult.pokemon1_level}</p>
              <p style={styles.evolutionText}>
                Evolution Stage: {tradeResult.pokemon1_stage}{" "}
                {tradeResult.pokemon1_stage > 1
                  ? `(Evolves at Level ${tradeResult.pokemon1_min_evo_level || "N/A"})`
                  : "(Basic Form)"}
              </p>

              {/* Pokémon 1 Stats */}
              <div style={styles.statsContainer}>
                {Object.entries(tradeResult.pokemon1_stats).map(([stat, value]) => (
                  <p key={stat} style={styles.statItem}>
                    <strong>{stat.toUpperCase()}:</strong> {Math.round(value)}
                  </p>
                ))}
              </div>
            </div>

            {/* VS Separator */}
            <div style={styles.vsContainer}>
              <p style={styles.vsText}>VS</p>
            </div>

            {/* Pokémon 2 Card */}
            <div style={styles.pokemonCard}>
              <img
                src={tradeResult.pokemon2_image}
                alt={tradeResult.pokemon2}
                style={styles.pokemonImage}
              />
              <p style={styles.pokemonName}>{tradeResult.pokemon2}</p>
              <p style={styles.levelText}>Level: {tradeResult.pokemon2_level}</p>
              <p style={styles.evolutionText}>
                Evolution Stage: {tradeResult.pokemon2_stage}{" "}
                {tradeResult.pokemon2_stage > 1
                  ? `(Evolves at Level ${tradeResult.pokemon2_min_evo_level || "N/A"})`
                  : "(Basic Form)"}
              </p>

              {/* Pokémon 2 Stats */}
              <div style={styles.statsContainer}>
                {Object.entries(tradeResult.pokemon2_stats).map(([stat, value]) => (
                  <p key={stat} style={styles.statItem}>
                    <strong>{stat.toUpperCase()}:</strong> {Math.round(value)}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Fairness Score and Trade Status */}
          <p style={styles.resultText}>
            Fairness Score: <strong>{tradeResult.fairness_score}</strong>
          </p>
          <p
            style={{
              ...styles.tradeStatus,
              color:
                tradeResult.trade_status === "Fair Trade" ? "#4CAF50" : "#FF5252",
            }}
          >
            {tradeResult.trade_status}
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "10px",
    color: "#FFCB05", // Pokémon Yellow
    textShadow: "2px 2px #3B4CCA", // Pokémon Blue Shadow
  },
  subtitle: {
    fontSize: "1.2rem",
    marginBottom: "20px",
    color: "#333",
  },
  inputContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  input: {
    padding: "12px",
    border: "2px solid #3B4CCA",
    borderRadius: "8px",
    fontSize: "1rem",
    width: "180px",
    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#3B4CCA", // Pokémon Blue
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s",
  },
  resultCard: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "800px",
    margin: "20px auto",
    border: "2px solid #3B4CCA",
  },
  resultTitle: {
    fontSize: "2rem",
    marginBottom: "20px",
    color: "#3B4CCA",
  },
  pokemonContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "flex-start",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  pokemonCard: {
    textAlign: "center",
    width: "220px",
  },
  pokemonImage: {
    width: "120px",
    height: "120px",
  },
  pokemonName: {
    fontSize: "1.2rem",
    marginTop: "10px",
    color: "#333",
  },
  levelText: {
    fontSize: "1rem",
    color: "#555",
    marginTop: "5px",
  },
  evolutionText: {
    fontSize: "1rem",
    color: "#888",
    marginTop: "5px",
  },
  statsContainer: {
    marginTop: "10px",
    textAlign: "left",
  },
  statItem: {
    fontSize: "0.9rem",
    margin: "2px 0",
    color: "#555",
  },
  vsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 20px",
  },
  vsText: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#3B4CCA",
  },
  resultText: {
    fontSize: "1.1rem",
    margin: "10px 0",
    color: "#333",
  },
  tradeStatus: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginTop: "15px",
  },
};
