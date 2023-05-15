import '../Player.css';
import React, { useRef, useEffect, useState } from 'react';
import { SocketConnection } from '../../lib/socketConnection';

let game;

export const Player = () => {

  // used variables
  const [connected, setConnected] = useState(false);
  const [totalPlayersCount, setTotalPlayersCount] = useState('');

  const canvasRef = useRef(undefined);
  const tableRef = useRef(undefined);
  const gameRef = useRef(undefined);

  //connection handling
  const socket = SocketConnection.getInstance();

  useEffect(() => {
    function updateScoreTable() {
      const scoreTable = tableRef.current;
      if (!scoreTable) return;

      const maxResults = 10;

      let scoreTableInnerHTML = `
                <tr class="header">
                    <td>Top 10 Jogadores</td>
                    <td>Pontos</td>
                </tr>
                `
      const scoreArray = [];

      for (let socketId in game.players) {
        const player = game.players[socketId]
        scoreArray.push({
          socketId: socketId,
          score: player.score
        });
      };

      const scoreArraySorted = scoreArray.sort((first, second) => {
        if (first.score < second.score) {
          return 1;
        }

        if (first.score > second.score) {
          return -1;
        }

        return 0;
      });

      const scoreSliced = scoreArraySorted.slice(0, maxResults);

      scoreSliced.forEach((score) => {

        scoreTableInnerHTML += `
                            <tr class="${socket.socket.id === score.socketId ? 'current-player' : ''}">
                                <td class="socket-id">${score.socketId}</td>
                                <td class="score-value">${score.score}</td>
                            </tr>
                        `
      });

      let playerNotInTop10 = true;

      for (const score of scoreSliced) {
        if (socket.socket.id === score.socketId) {
          playerNotInTop10 = false;
          break;
        };

        playerNotInTop10 = true;
      };

      if (playerNotInTop10) {
        scoreTableInnerHTML += `
                            <tr class="current-player bottom">
                                <td class="socket-id">${socket.socket.id}</td>
                                <td class="score-value">${game.players[socket.socket.id].score}</td>
                            </tr>
                        `
      };

      scoreTableInnerHTML += `
                <tr class="footer">
                    <td>Total de jogadores</td>
                    <td align="right">${totalPlayersCount}</td>
                </tr>
                `

      scoreTable.innerHTML = scoreTableInnerHTML;
    };

    socket.connect();

    socket.addEventListener("connect_error", (err) => {
      setConnected(false);
      console.log(`connect_error due to ${err.message}`);
    });

    socket.addEventListener('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    socket.addEventListener('disconnect', () => {
      setConnected(false);
      console.log('Disconnected');
    });

    // message handling
    socket.addEventListener('bootstrap', (gameInitialState) => {
      const gameCanvas = canvasRef.current;
      if (!gameCanvas) return;

      game = gameInitialState;
      console.log('Received initial state')

      gameCanvas.style.width = `${game.canvasWidth * 18}px`
      gameCanvas.style.height = `${game.canvasHeight * 18}px`
      gameCanvas.width = game.canvasWidth
      gameCanvas.height = game.canvasHeight

      const context = gameCanvas.getContext('2d')

      requestAnimationFrame(renderGame)

      function renderGame() {
        if (!context) return

        context.globalAlpha = 1
        context.fillStyle = 'white'
        context.fillRect(0, 0, game.canvasWidth, game.canvasHeight)

        for (const socketId in game.players) {
          const player = game.players[socketId]
          context.fillStyle = '#000000'
          context.globalAlpha = 0.1
          context.fillRect(player.x, player.y, 1, 1)
        }

        for (const fruitId in game.fruits) {
          const fruit = game.fruits[fruitId]
          context.fillStyle = '#08a331'
          context.globalAlpha = 1
          context.fillRect(fruit.x, fruit.y, 1, 1)
        }

        const currentPlayer = game.players[socket.socket.id]
        context.fillStyle = '#F0DB4F'
        context.globalAlpha = 1
        context.fillRect(currentPlayer.x, currentPlayer.y, 1, 1)


        requestAnimationFrame(renderGame)
      }

      updateScoreTable()
    });

    socket.addEventListener('player-update', (player) => {
      console.log('Received state update')
      game.players[player.socketId] = player.newState
      updateScoreTable()
    });

    socket.addEventListener('update-player-score', (score) => {
      game.players[socket.socket.id].score = score
      updateScoreTable()
    });

    socket.addEventListener('player-remove', (socketId) => {
      delete game.players[socketId]
      updateScoreTable()
    });

    socket.addEventListener('fruit-add', (fruit) => {
      game.fruits[fruit.fruitId] = {
        x: fruit.x,
        y: fruit.y
      }
    });

    socket.addEventListener('fruit-remove', (args) => {
      delete game.fruits[args.fruitId]
      updateScoreTable()
    });

    socket.addEventListener('concurrent-connections', (concurrentConnections) => {
      setTotalPlayersCount(concurrentConnections);
      updateScoreTable()
    });

    let crazyModeInterval;
    socket.addEventListener('start-crazy-mode', () => {
      crazyModeInterval = setInterval(() => {
        const randomKey = 37 + Math.floor(Math.random() * 4)
        console.log(randomKey)
        const event = new KeyboardEvent('keydown', {
          keyCode: randomKey,
          which: randomKey
        });

        document.dispatchEvent(event)
      }, 150);
    });

    socket.addEventListener('stop-crazy-mode', () => {
      clearInterval(crazyModeInterval);
    });

  }, []);

  function handleKeydown(event) {
    if (connected) {
      const player = game.players[socket.socket.id];

      if (event.which === 37 && player.x - 1 >= 0) {
        player.x = player.x - 1
        socket.push('player-move', 'left')
        return
      };

      if (event.which === 38 && player.y - 1 >= 0) {
        player.y = player.y - 1
        socket.push('player-move', 'up')
        return
      };

      if (event.which === 39 && player.x + 1 < game.canvasWidth) {
        player.x = player.x + 1
        socket.push('player-move', 'right')
        return
      };

      if (event.which === 40 && player.y + 1 < game.canvasHeight) {
        player.y = player.y + 1
        socket.push('player-move', 'down')
        return
      };
    };
  };

  // Essa lógica deveria estar no server.
  function throttle(callback, delay) {
    let isThrottled = false, args, context;

    function wrapper() {
      if (isThrottled) {
        args = arguments;
        context = this;
        return;
      }

      isThrottled = true;
      callback.apply(this, arguments);

      setTimeout(() => {
        isThrottled = false;
        if (args) {
          wrapper.apply(context, args);
          args = context = null;
        }
      }, delay);
    }

    return wrapper;
  };

  const throttledKeydown = throttle(handleKeydown, 80)

  document.addEventListener('keydown', throttledKeydown)

  return (
    <>
      <div id="game-container" ref={gameRef}>
        <canvas id="game-canvas" ref={canvasRef}></canvas>
        <table id="score-table" ref={tableRef}></table>
      </div>
    </>

  );
}