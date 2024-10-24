import "./App.css";
import { useState, useEffect } from "react";

const ScoreBoard = ({ currentScore, bestScore }) => {
  return (
    <div className="ScoreBoard">
      <p>Score: {currentScore}</p>
      <p>Best score: {bestScore}</p>
    </div>
  );
};

const Card = ({ name, onClick, imageUrl }) => {
  return (
    <button className="Card" onClick={onClick}>
      <img src={imageUrl} />
      <p>{name}</p>
    </button>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [cards, setCards] = useState([]);
  // const [selectedCards, setSelectedCards] = useState(
  //   new Array(cards.length).fill(false)
  // );
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  function shuffleArray(array) {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  const getTextBeforeDash = (text) => text.split("-")[0];

  // API documentation: https://pokeapi.co/

  useEffect(() => {
    setIsLoading(true);

    // this gets a single pokemon. try "ditto" as the pokemonName
    // const url = `https://pokeapi.co/api/v2/pokemon/ditto`;

    // this gets a list of 20 pokemon.
    // Change the value of limit to change how many pokemon.
    // Change the value of the offset to change the subset of pokemon.

    const fetchData = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    };

    const fetchPokemonImageUrl = async (pokemon) => {
      const individualPokemonData = await fetchData(pokemon.url);
      return individualPokemonData;
    };

    const fetchCardData = async () => {
      // get list of Pokemon from the PokeAPI
      // returns an object with a results key, which contains an array of objects: {name: "name of Pokemon", url: "pokemon's data url"}

      const offset = Math.random() * 1290;
      const pokemonListUrl = `https://pokeapi.co/api/v2/pokemon/?limit=12&offset=${offset}`;

      const pokemonList = await fetchData(pokemonListUrl);
      const pokemonData = await Promise.all(
        pokemonList.results.map((pokemon) => {
          return fetchPokemonImageUrl(pokemon);
        })
      );
      const pokemonCards = await pokemonData.map((pokemon) => {
        return {
          name: getTextBeforeDash(pokemon.name),
          selected: false,
          imageUrl: pokemon.sprites.other["official-artwork"].front_default,
        };
      });

      console.log(pokemonCards);
      const shuffledPokemonCards = shuffleArray(pokemonCards);
      setCards(pokemonCards);
      // setSelectedCards(new Array(pokemonCards.length).fill(false));
      setIsLoading(false);
    };

    fetchCardData();
  }, []);

  const resetCards = () => {
    setCards(cards.map((card) => ({ ...card, selected: false })));
  };

  const selectCard = (index) => {
    setCards([
      ...cards.slice(0, index),
      {
        ...cards[index],
        selected: true,
      },
      ...cards.slice(index + 1),
    ]);
  };

  const handleCardClick = (index) => {
    if (cards[index].selected) {
      setCurrentScore(0);
      resetCards();
    } else {
      selectCard(index);
      const newScore = currentScore + 1;
      setCurrentScore(newScore);
      if (newScore > bestScore) setBestScore(newScore);
    }
  };

  return (
    <>
      <header>
        <h1>Pokemon Memory Game</h1>
        <p>
          Get points by clicking on a Pokemon, but don't click on any more than
          once!
        </p>
      </header>

      <main>
        {isLoading ? (
          <p>Loading Pokemon cards...</p>
        ) : (
          <>
            <ScoreBoard currentScore={currentScore} bestScore={bestScore} />
            <div className="cards">
              {cards.map((card, index) => (
                <Card
                  name={card.name}
                  key={card.name}
                  imageUrl={card.imageUrl}
                  onClick={() => handleCardClick(index)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default App;
