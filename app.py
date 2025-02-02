from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

def get_pokemon_data(pokemon_name):
    """Fetch basic Pokémon data from PokéAPI."""
    response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{pokemon_name.lower()}")
    if response.status_code != 200:
        return None
    return response.json()

def get_evolution_data(pokemon_species_url):
    """Fetch evolution data from Pokémon species."""
    species_response = requests.get(pokemon_species_url)
    if species_response.status_code != 200:
        return None
    species_data = species_response.json()

    evolution_chain_url = species_data["evolution_chain"]["url"]
    evolution_response = requests.get(evolution_chain_url)
    if evolution_response.status_code != 200:
        return None
    return evolution_response.json()

def find_evolution_stage(pokemon_name, evolution_data):
    """Determine the evolution stage and minimum level required for the Pokémon."""
    current_stage = 1
    min_level = 1

    def search_evolution_chain(chain, stage=1):
        nonlocal current_stage, min_level
        if chain["species"]["name"] == pokemon_name.lower():
            current_stage = stage
            if chain.get("evolution_details"):
                details = chain["evolution_details"][0]
                min_level = details.get("min_level", 1)
            return True
        for evolves_to in chain.get("evolves_to", []):
            if search_evolution_chain(evolves_to, stage + 1):
                return True
        return False

    search_evolution_chain(evolution_data["chain"])
    return current_stage, min_level

@app.route('/trade', methods=['GET'])
def trade():
    pokemon1 = request.args.get("pokemon1")
    pokemon2 = request.args.get("pokemon2")
    level1 = int(request.args.get("level1", 1))
    level2 = int(request.args.get("level2", 1))

    if not pokemon1 or not pokemon2:
        return jsonify({"error": "Please provide two Pokémon names"}), 400

    # Fetch Pokémon data
    poke1_data = get_pokemon_data(pokemon1)
    poke2_data = get_pokemon_data(pokemon2)
    if not poke1_data or not poke2_data:
        return jsonify({"error": "One or both Pokémon not found"}), 404

    # Fetch evolution data
    poke1_species_url = poke1_data["species"]["url"]
    poke2_species_url = poke2_data["species"]["url"]
    poke1_evolution_data = get_evolution_data(poke1_species_url)
    poke2_evolution_data = get_evolution_data(poke2_species_url)

    # Determine evolution stage and required evolution level
    poke1_stage, poke1_min_evo_level = find_evolution_stage(pokemon1, poke1_evolution_data)
    poke2_stage, poke2_min_evo_level = find_evolution_stage(pokemon2, poke2_evolution_data)

    # Extract base stats
    poke1_stats = {stat["stat"]["name"]: stat["base_stat"] for stat in poke1_data["stats"]}
    poke2_stats = {stat["stat"]["name"]: stat["base_stat"] for stat in poke2_data["stats"]}

    # Scale stats by level and evolution stage (e.g., higher stage Pokémon have a slight advantage)
    poke1_scaled_stats = sum(poke1_stats.values()) * (level1 / 50) * (1 + (poke1_stage - 1) * 0.1)
    poke2_scaled_stats = sum(poke2_stats.values()) * (level2 / 50) * (1 + (poke2_stage - 1) * 0.1)

    # Fairness calculation
    fairness_ratio = min(poke1_scaled_stats, poke2_scaled_stats) / max(poke1_scaled_stats, poke2_scaled_stats)
    status = "Fair Trade" if fairness_ratio >= 0.8 else "Unfair Trade"

    return jsonify({
        "pokemon1": pokemon1.capitalize(),
        "pokemon2": pokemon2.capitalize(),
        "pokemon1_image": poke1_data["sprites"]["front_default"],
        "pokemon2_image": poke2_data["sprites"]["front_default"],
        "pokemon1_stats": poke1_stats,
        "pokemon2_stats": poke2_stats,
        "pokemon1_level": level1,
        "pokemon2_level": level2,
        "pokemon1_stage": poke1_stage,
        "pokemon2_stage": poke2_stage,
        "pokemon1_min_evo_level": poke1_min_evo_level,
        "pokemon2_min_evo_level": poke2_min_evo_level,
        "fairness_score": round(fairness_ratio, 2),
        "trade_status": status
    })

if __name__ == "__main__":
    app.run(debug=True)
