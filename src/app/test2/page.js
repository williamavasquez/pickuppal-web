"use client";

import { useEffect, useState } from "react";

const testDbComponent = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    (async function () {
      let data = await fetch(
        "https://knowing-pro-termite.ngrok-free.app/api/games"
      );
      data = await data.json();
      setGames(data);
    })();
  }, []);

  if (games.length == 0) {
    return <h1>No games found</h1>;
  }

  return games.map((game) => <h2>{game.id}</h2>);
};

export default testDbComponent;
