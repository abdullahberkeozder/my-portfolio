// src/components/macos9/apps/MacChess.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type PieceColor = 'w' | 'b';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

type Board = (Piece | null)[][];

interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  captured?: Piece | null;
  notation: string;
}

const PIECE_VALUES: Record<PieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100,
};

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  },
};

const INITIAL_BOARD: Board = [
  [
    { type: 'r', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'q', color: 'b' },
    { type: 'k', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'r', color: 'b' },
  ],
  [
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
    { type: 'p', color: 'b' },
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
    { type: 'p', color: 'w' },
  ],
  [
    { type: 'r', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'q', color: 'w' },
    { type: 'k', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'r', color: 'w' },
  ],
];

export const MacChess: React.FC = () => {
  const [board, setBoard] = useState<Board>(() => JSON.parse(JSON.stringify(INITIAL_BOARD)));
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null);
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<Piece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([]);
  const [gameMode, setGameMode] = useState<'ai' | 'pvp'>('ai');
  const [difficulty, setDifficulty] = useState<'casual' | 'master'>('casual');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('White to move.');

  // Calculate material balance
  const whiteScore = capturedBlack.reduce((acc, p) => acc + PIECE_VALUES[p.type], 0);
  const blackScore = capturedWhite.reduce((acc, p) => acc + PIECE_VALUES[p.type], 0);

  // Generate legal moves for a given square
  const getMovesForPiece = (b: Board, r: number, c: number): { row: number; col: number }[] => {
    const piece = b[r][c];
    if (!piece) return [];
    const color = piece.color;
    const moves: { row: number; col: number }[] = [];

    const addMove = (toR: number, toC: number): boolean => {
      if (toR < 0 || toR > 7 || toC < 0 || toC > 7) return false;
      const target = b[toR][toC];
      if (!target) {
        moves.push({ row: toR, col: toC });
        return true; // continue ray
      }
      if (target.color !== color) {
        moves.push({ row: toR, col: toC }); // capture
      }
      return false; // hit a piece, stop ray
    };

    if (piece.type === 'p') {
      const dir = color === 'w' ? -1 : 1;
      const startRank = color === 'w' ? 6 : 1;

      // Single step forward
      if (r + dir >= 0 && r + dir <= 7 && !b[r + dir][c]) {
        moves.push({ row: r + dir, col: c });
        // Double step forward from start
        if (r === startRank && !b[r + 2 * dir][c]) {
          moves.push({ row: r + 2 * dir, col: c });
        }
      }
      // Diagonal captures
      [-1, 1].forEach((dc) => {
        const toR = r + dir;
        const toC = c + dc;
        if (toR >= 0 && toR <= 7 && toC >= 0 && toC <= 7) {
          const target = b[toR][toC];
          if (target && target.color !== color) {
            moves.push({ row: toR, col: toC });
          }
        }
      });
    } else if (piece.type === 'n') {
      const jumps = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      jumps.forEach(([dr, dc]) => addMove(r + dr, c + dc));
    } else if (piece.type === 'b') {
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      dirs.forEach(([dr, dc]) => {
        let step = 1;
        while (addMove(r + dr * step, c + dc * step)) step++;
      });
    } else if (piece.type === 'r') {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      dirs.forEach(([dr, dc]) => {
        let step = 1;
        while (addMove(r + dr * step, c + dc * step)) step++;
      });
    } else if (piece.type === 'q') {
      const dirs = [
        [-1, -1], [-1, 1], [1, -1], [1, 1],
        [-1, 0], [1, 0], [0, -1], [0, 1],
      ];
      dirs.forEach(([dr, dc]) => {
        let step = 1;
        while (addMove(r + dr * step, c + dc * step)) step++;
      });
    } else if (piece.type === 'k') {
      const dirs = [
        [-1, -1], [-1, 1], [1, -1], [1, 1],
        [-1, 0], [1, 0], [0, -1], [0, 1],
      ];
      dirs.forEach(([dr, dc]) => addMove(r + dr, c + dc));
    }

    return moves;
  };

  // Convert row, col to algebraic notation (e.g. e4)
  const toAlgebraic = (r: number, c: number) => {
    const file = String.fromCharCode(97 + c);
    const rank = 8 - r;
    return `${file}${rank}`;
  };

  // Execute a move on the board
  const executeMove = (
    fromR: number,
    fromC: number,
    toR: number,
    toC: number,
    isAi: boolean = false
  ) => {
    const newBoard = JSON.parse(JSON.stringify(board)) as Board;
    const movingPiece = newBoard[fromR][fromC];
    if (!movingPiece) return;

    const targetPiece = newBoard[toR][toC];

    // Auto promote pawn to Queen
    if (movingPiece.type === 'p' && (toR === 0 || toR === 7)) {
      movingPiece.type = 'q';
    }

    newBoard[toR][toC] = movingPiece;
    newBoard[fromR][fromC] = null;

    if (targetPiece) {
      if (targetPiece.color === 'w') {
        setCapturedWhite((prev) => [...prev, targetPiece]);
      } else {
        setCapturedBlack((prev) => [...prev, targetPiece]);
      }
      macSound.playTrashCrinkle();
    } else {
      macSound.playMacClickUp();
    }

    const notation = `${movingPiece.type.toUpperCase() !== 'P' ? movingPiece.type.toUpperCase() : ''}${toAlgebraic(
      fromR,
      fromC
    )}${targetPiece ? 'x' : '-'}${toAlgebraic(toR, toC)}`;

    const newMoveRecord: Move = {
      fromRow: fromR,
      fromCol: fromC,
      toRow: toR,
      toCol: toC,
      captured: targetPiece,
      notation,
    };

    setMoveHistory((prev) => [...prev, newMoveRecord]);
    setBoard(newBoard);
    setSelectedSquare(null);
    setValidMoves([]);

    const nextTurn = movingPiece.color === 'w' ? 'b' : 'w';
    setTurn(nextTurn);

    if (targetPiece?.type === 'k') {
      setStatusMessage(`${movingPiece.color === 'w' ? 'White' : 'Black'} wins by King capture!`);
      macSound.playMacStartupChime();
      return;
    }

    if (nextTurn === 'b' && gameMode === 'ai' && !isAi) {
      setStatusMessage('Deep Platinum AI is thinking...');
      setIsAiThinking(true);
    } else {
      setStatusMessage(`${nextTurn === 'w' ? 'White' : 'Black'} to move.`);
    }
  };

  // AI Move Engine (Deep Platinum)
  useEffect(() => {
    if (turn === 'b' && gameMode === 'ai' && isAiThinking) {
      const timer = setTimeout(() => {
        // Collect all legal black moves
        const allMoves: { fromR: number; fromCol: number; toR: number; toCol: number; score: number }[] = [];

        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color === 'b') {
              const legal = getMovesForPiece(board, r, c);
              legal.forEach((dest) => {
                const target = board[dest.row][dest.col];
                let score = 0;
                if (target) {
                  score += PIECE_VALUES[target.type] * 10;
                }
                // Center control bonus
                if ((dest.row === 3 || dest.row === 4) && (dest.col === 3 || dest.col === 4)) {
                  score += 4;
                }
                if (difficulty === 'casual') {
                  score += Math.random() * 3;
                }
                allMoves.push({
                  fromR: r,
                  fromCol: c,
                  toR: dest.row,
                  toCol: dest.col,
                  score,
                });
              });
            }
          }
        }

        if (allMoves.length > 0) {
          allMoves.sort((a, b) => b.score - a.score);
          const chosen = allMoves[0];
          executeMove(chosen.fromR, chosen.fromCol, chosen.toR, chosen.toCol, true);
        } else {
          setStatusMessage('Checkmate / Stalemate! Game Over.');
        }

        setIsAiThinking(false);
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, isAiThinking, board, difficulty]);

  // Handle Square Selection
  const handleSquareClick = (r: number, c: number) => {
    if (isAiThinking) return;

    const clickedPiece = board[r][c];

    // If already selected, check if clicked on valid move target
    if (selectedSquare) {
      const isTarget = validMoves.some((m) => m.row === r && m.col === c);
      if (isTarget) {
        executeMove(selectedSquare.row, selectedSquare.col, r, c);
        return;
      }
    }

    // Otherwise select piece if it's player's turn
    if (clickedPiece && clickedPiece.color === turn) {
      macSound.playMacClickDown();
      setSelectedSquare({ row: r, col: c });
      const moves = getMovesForPiece(board, r, c);
      setValidMoves(moves);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // Reset Game
  const handleNewGame = () => {
    macSound.playWindowOpen();
    setBoard(JSON.parse(JSON.stringify(INITIAL_BOARD)));
    setTurn('w');
    setSelectedSquare(null);
    setValidMoves([]);
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setStatusMessage('New Game started. White to move.');
  };

  // Undo Last Move
  const handleUndo = () => {
    if (moveHistory.length === 0) return;
    macSound.playMacClickDown();
    // In AI mode, undo 2 moves (AI + User)
    const steps = gameMode === 'ai' && moveHistory.length >= 2 ? 2 : 1;
    const newHistory = moveHistory.slice(0, -steps);

    // Replay from initial
    const freshBoard: Board = JSON.parse(JSON.stringify(INITIAL_BOARD));
    const whiteCaps: Piece[] = [];
    const blackCaps: Piece[] = [];

    newHistory.forEach((m) => {
      const p = freshBoard[m.fromRow][m.fromCol];
      if (p) {
        const target = freshBoard[m.toRow][m.toCol];
        if (target) {
          if (target.color === 'w') whiteCaps.push(target);
          else blackCaps.push(target);
        }
        if (p.type === 'p' && (m.toRow === 0 || m.toRow === 7)) {
          p.type = 'q';
        }
        freshBoard[m.toRow][m.toCol] = p;
        freshBoard[m.fromRow][m.fromCol] = null;
      }
    });

    setBoard(freshBoard);
    setMoveHistory(newHistory);
    setCapturedWhite(whiteCaps);
    setCapturedBlack(blackCaps);
    setTurn(newHistory.length % 2 === 0 ? 'w' : 'b');
    setSelectedSquare(null);
    setValidMoves([]);
    setStatusMessage('Move undone.');
  };

  return (
    <div className="flex flex-col h-full bg-[#CCCCCC] font-['Charcoal',sans-serif] text-[12px] text-[#262626] select-none">
      {/* ================= 1. PLATINUM TOOLBAR ================= */}
      <div className="px-3 py-1.5 bg-[#DDDDDD] border-b border-[#888888] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[13px] flex items-center gap-1">
            <span>♞</span>
            <span>Apple Chess 3D</span>
          </span>
          <span className="text-[10px] text-[#666] font-mono">Mac OS 9.2.2 Edition</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleNewGame}
            className="mac9-btn px-2.5 py-0.5 text-[11px] font-bold"
          >
            New Game
          </button>
          <button
            onClick={handleUndo}
            disabled={moveHistory.length === 0}
            className={`mac9-btn px-2.5 py-0.5 text-[11px] ${
              moveHistory.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Undo
          </button>
        </div>
      </div>

      {/* ================= 2. MAIN WORKSPACE (BOARD + SIDEBAR) ================= */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Chessboard Container */}
        <div className="flex flex-col items-center justify-center flex-1">
          {/* Black Captured Bar */}
          <div className="w-[360px] flex items-center justify-between text-[11px] font-mono px-1 py-0.5 text-[#444]">
            <div className="flex items-center gap-1">
              <span className="font-bold">Black (AI):</span>
              <span className="text-base leading-none">
                {capturedWhite.map((p, idx) => (
                  <span key={idx} className="mr-0.5 text-[#333] drop-shadow-sm">
                    {PIECE_SYMBOLS.w[p.type]}
                  </span>
                ))}
              </span>
            </div>
            {blackScore > whiteScore && (
              <span className="text-emerald-700 font-bold">+{blackScore - whiteScore}</span>
            )}
          </div>

          {/* 8x8 Wooden Board with Platinum Bevel */}
          <div className="p-2 bg-[#BA8E57] border-2 border-[#5C3A21] rounded-[3px] shadow-[inset_0_1px_2px_#FFF,0_3px_8px_rgba(0,0,0,0.35)] relative">
            {/* Coordinates top/left */}
            <div className="grid grid-cols-8 w-[352px] h-[352px] border border-[#5C3A21] bg-[#DFBA87]">
              {board.map((row, r) =>
                row.map((piece, c) => {
                  const isLight = (r + c) % 2 === 0;
                  const isSelected = selectedSquare?.row === r && selectedSquare?.col === c;
                  const isValidTarget = validMoves.some((m) => m.row === r && m.col === c);

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleSquareClick(r, c)}
                      className={`relative flex items-center justify-center cursor-pointer transition-none ${
                        isLight ? 'bg-[#EBD2B0]' : 'bg-[#9C6638]'
                      } ${isSelected ? 'ring-2 ring-yellow-400 z-10' : ''}`}
                    >
                      {/* Piece Rendering */}
                      {piece && (
                        <span
                          className={`text-3xl leading-none select-none transition-transform active:scale-90 ${
                            piece.color === 'w'
                              ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] filter'
                              : 'text-[#1A1A1A] drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'
                          }`}
                        >
                          {PIECE_SYMBOLS[piece.color][piece.type]}
                        </span>
                      )}

                      {/* Valid Move Indicator (Green Dot / Capture Ring) */}
                      {isValidTarget && (
                        <div
                          className={`absolute w-3 h-3 rounded-full pointer-events-none ${
                            piece
                              ? 'ring-2 ring-red-500 bg-red-400/40 w-7 h-7 animate-pulse'
                              : 'bg-emerald-600/70 shadow-sm'
                          }`}
                        />
                      )}

                      {/* Rank & File Mini Notation Labels */}
                      {c === 0 && (
                        <span className="absolute top-0.5 left-0.5 text-[8px] font-mono opacity-50 select-none">
                          {8 - r}
                        </span>
                      )}
                      {r === 7 && (
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono opacity-50 select-none">
                          {String.fromCharCode(97 + c)}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* White Captured Bar */}
          <div className="w-[360px] flex items-center justify-between text-[11px] font-mono px-1 py-0.5 text-[#444] mt-0.5">
            <div className="flex items-center gap-1">
              <span className="font-bold">White (You):</span>
              <span className="text-base leading-none">
                {capturedBlack.map((p, idx) => (
                  <span key={idx} className="mr-0.5 text-[#333] drop-shadow-sm">
                    {PIECE_SYMBOLS.b[p.type]}
                  </span>
                ))}
              </span>
            </div>
            {whiteScore > blackScore && (
              <span className="text-emerald-700 font-bold">+{whiteScore - blackScore}</span>
            )}
          </div>
        </div>

        {/* Game Stats & Moves Sidebar */}
        <div className="w-52 bg-[#DDDDDD] border border-[#888888] rounded-[2px] p-2 flex flex-col justify-between shadow-inner">
          <div className="space-y-2">
            {/* Turn Status Box */}
            <div className="p-2 bg-white border border-[#999999] rounded-[2px] shadow-inner text-center font-mono">
              <div className="text-[10px] text-[#666] uppercase font-bold">Match Status</div>
              <div
                className={`text-[12px] font-bold mt-0.5 ${
                  isAiThinking ? 'text-amber-600 animate-pulse' : 'text-[#262626]'
                }`}
              >
                {statusMessage}
              </div>
            </div>

            {/* Game Mode Picker */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#555] font-bold uppercase font-mono">Opponent</span>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setGameMode('ai')}
                  className={`py-1 text-[10px] border border-[#262626] rounded-[2px] font-mono ${
                    gameMode === 'ai' ? 'bg-[#333399] text-white font-bold' : 'bg-[#EAEAEA] text-[#333]'
                  }`}
                >
                  Deep Platinum
                </button>
                <button
                  onClick={() => setGameMode('pvp')}
                  className={`py-1 text-[10px] border border-[#262626] rounded-[2px] font-mono ${
                    gameMode === 'pvp' ? 'bg-[#333399] text-white font-bold' : 'bg-[#EAEAEA] text-[#333]'
                  }`}
                >
                  Pass & Play
                </button>
              </div>
            </div>

            {/* Difficulty Picker */}
            {gameMode === 'ai' && (
              <div className="space-y-1">
                <span className="text-[10px] text-[#555] font-bold uppercase font-mono">Skill Level</span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setDifficulty('casual')}
                    className={`py-1 text-[10px] border border-[#262626] rounded-[2px] font-mono ${
                      difficulty === 'casual' ? 'bg-[#333399] text-white font-bold' : 'bg-[#EAEAEA] text-[#333]'
                    }`}
                  >
                    Casual
                  </button>
                  <button
                    onClick={() => setDifficulty('master')}
                    className={`py-1 text-[10px] border border-[#262626] rounded-[2px] font-mono ${
                      difficulty === 'master' ? 'bg-[#333399] text-white font-bold' : 'bg-[#EAEAEA] text-[#333]'
                    }`}
                  >
                    Grandmaster
                  </button>
                </div>
              </div>
            )}

            {/* Move History Log */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#555] font-bold uppercase font-mono">
                Move Log ({moveHistory.length})
              </span>
              <div className="h-28 overflow-y-auto bg-white border border-[#999999] rounded-[2px] p-1 font-mono text-[10px] space-y-0.5">
                {moveHistory.length === 0 ? (
                  <div className="text-gray-400 italic text-center py-4">No moves yet</div>
                ) : (
                  Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                    <div key={i} className="flex justify-between px-1 py-0.5 hover:bg-[#F0F0F0]">
                      <span className="text-[#888]">{i + 1}.</span>
                      <span className="font-bold text-[#222]">{moveHistory[i * 2]?.notation}</span>
                      <span className="text-[#444]">{moveHistory[i * 2 + 1]?.notation || '...'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Engine Note */}
          <div className="text-[9px] text-[#666] font-mono border-t border-[#BBB] pt-1">
            Engine: Deep Platinum G4 Chess v1.2
          </div>
        </div>
      </div>

      {/* ================= 3. BOTTOM STATUS BAR ================= */}
      <div className="px-3 py-1 bg-[#DDDDDD] border-t border-[#888888] text-[10px] font-mono text-[#555] flex justify-between">
        <span>Turn: {turn === 'w' ? 'White' : 'Black'}</span>
        <span>Deep Platinum Chess AI Online</span>
      </div>
    </div>
  );
};
