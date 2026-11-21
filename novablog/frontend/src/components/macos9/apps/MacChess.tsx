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

// ============================================================================
// HIGH-DEFINITION VECTOR CHESS PIECES (Crisp Staunton Silicon Vector Suite)
// ============================================================================
export const ChessPieceSvg: React.FC<{ type: PieceType; color: PieceColor; className?: string }> = ({
  type,
  color,
  className = 'w-8 h-8',
}) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#FFFFFF' : '#22252B';
  const stroke = isWhite ? '#1E293B' : '#0B0D11';
  const highlight = isWhite ? '#E2E8F0' : '#475569';

  switch (type) {
    case 'p':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          <path
            d="M22.5 9 C20 9 18 11 18 13.5 C18 15.5 19.5 17 21 17.7 C18.5 19.5 16.5 24 16.5 28 C16.5 32 18 34 18 34 L27 34 C27 34 28.5 32 28.5 28 C28.5 24 26.5 19.5 24 17.7 C25.5 17 27 15.5 27 13.5 C27 11 25 9 22.5 9 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M14 36 L31 36 L30 38 L15 38 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M12 40 L33 40 L32 42 L13 42 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
          {/* Subtle interior highlight */}
          <path d="M21 12 A1.5 1.5 0 0 1 24 12" stroke={highlight} strokeWidth="1" />
        </svg>
      );
    case 'n':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          <path
            d="M22 10 C21 10 18 12 17 15 C16 18 14 20 11 21 C10 22 10 25 12 26 C15 27 16 25 17 25 C16 27 15 31 17 34 L29 34 C30 31 32 28 32 23 C32 17 29 11 22 10 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="15.5" cy="17.5" r="1.5" fill={stroke} />
          <path d="M13 23 C14 23.5 15.5 23.5 16.5 23" stroke={stroke} strokeWidth="1.2" />
          <path d="M13 36 L33 36 L32 39 L14 39 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M11 40 L35 40 L34 42 L12 42 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    case 'b':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          <path
            d="M22.5 8 C21 8 20 9 20 10.5 C20 11.2 20.3 11.8 20.8 12.2 C17 14 15 18 15 23 C15 28 17 31 17 33 L28 33 C28 31 30 28 30 23 C30 18 28 14 24.2 12.2 C24.7 11.8 25 11.2 25 10.5 C25 9 24 8 22.5 8 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Mitre cleft */}
          <line x1="22.5" y1="14" x2="22.5" y2="23" stroke={stroke} strokeWidth="1.4" />
          <line x1="19" y1="18" x2="26" y2="18" stroke={stroke} strokeWidth="1.4" />
          <path d="M14 36 L31 36 L30 38 L15 38 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M12 40 L33 40 L32 42 L13 42 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    case 'r':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          <path
            d="M14 13 L14 19 L16 19 L16 15 L20 15 L20 19 L25 19 L25 15 L29 15 L29 19 L31 19 L31 13 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M16 19 L17 33 L28 33 L29 19 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M13 35 L32 35 L31 38 L14 38 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M11 40 L34 40 L33 42 L12 42 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    case 'q':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          <path
            d="M13 16 L15 28 L30 28 L32 16 L27 22 L22.5 13 L18 22 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12.5" cy="15" r="1.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
          <circle cx="17.5" cy="12" r="1.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
          <circle cx="22.5" cy="10" r="1.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
          <circle cx="27.5" cy="12" r="1.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
          <circle cx="32.5" cy="15" r="1.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
          <path d="M15 28 L14 33 L31 33 L30 28 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M12 36 L33 36 L32 39 L13 39 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M10 40 L35 40 L34 42 L11 42 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    case 'k':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          {/* Royal Cross */}
          <line x1="22.5" y1="6" x2="22.5" y2="12" stroke={stroke} strokeWidth="1.8" />
          <line x1="19.5" y1="8" x2="25.5" y2="8" stroke={stroke} strokeWidth="1.8" />
          {/* King Crown */}
          <path
            d="M14 16 C14 22 17 24 17 27 L28 27 C28 24 31 22 31 16 C27 18 24 14 22.5 13 C21 14 18 18 14 16 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M15 27 L14 33 L31 33 L30 27 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M13 35 L32 35 L31 38 L14 38 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M11 40 L34 40 L33 42 L12 42 Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
  }
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

  const toAlgebraic = (r: number, c: number) => {
    const file = String.fromCharCode(97 + c);
    const rank = 8 - r;
    return `${file}${rank}`;
  };

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
      setStatusMessage('Deep Platinum AI is calculating...');
      setIsAiThinking(true);
    } else {
      setStatusMessage(`${nextTurn === 'w' ? 'White' : 'Black'} to move.`);
    }
  };

  // AI Move Engine (Deep Platinum)
  useEffect(() => {
    if (turn === 'b' && gameMode === 'ai' && isAiThinking) {
      const timer = setTimeout(() => {
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
          setStatusMessage('Stalemate / Checkmate! Game Over.');
        }

        setIsAiThinking(false);
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, isAiThinking, board, difficulty]);

  const handleSquareClick = (r: number, c: number) => {
    if (isAiThinking) return;

    const clickedPiece = board[r][c];

    if (selectedSquare) {
      const isTarget = validMoves.some((m) => m.row === r && m.col === c);
      if (isTarget) {
        executeMove(selectedSquare.row, selectedSquare.col, r, c);
        return;
      }
    }

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

  const handleUndo = () => {
    if (moveHistory.length === 0) return;
    macSound.playMacClickDown();
    const steps = gameMode === 'ai' && moveHistory.length >= 2 ? 2 : 1;
    const newHistory = moveHistory.slice(0, -steps);

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
    <div className="flex flex-col h-full bg-[#E5E5E5] dark:bg-[#111827] font-['Charcoal',sans-serif] text-[12px] text-[#262626] dark:text-[#E2E8F0] select-none">
      {/* ================= 1. PLATINUM / AQUA TOP TOOLBAR ================= */}
      <div className="px-3 py-1.5 bg-[#DDDDDD] dark:bg-[#1E293B] border-b border-[#888888] dark:border-[#334155] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[13px] flex items-center gap-1.5 text-[#1E293B] dark:text-cyan-300">
            <span className="w-5 h-5 flex items-center justify-center">
              <ChessPieceSvg type="n" color="b" className="w-4 h-4" />
            </span>
            <span>Apple Chess 3D</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 font-mono text-[#555] dark:text-gray-400">
            Mac OS 9.2.2 Silicon Edition
          </span>
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
      <div className="flex-1 flex overflow-hidden p-3 gap-3 justify-center items-center">
        {/* Left Column: Board & Player Racks */}
        <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 max-w-[380px]">
          {/* Top Player Card (Black / Deep Platinum AI) */}
          <div className="w-[360px] flex items-center justify-between text-[11px] font-mono px-2 py-1 bg-[#D8D8D8] dark:bg-[#1E293B] border border-[#B0B0B0] dark:border-[#334155] rounded-[3px] shadow-inner">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              <span className="font-bold text-[#1E293B] dark:text-gray-200">Black (Deep Platinum AI)</span>
              <div className="flex items-center gap-0.5 ml-1">
                {capturedWhite.map((p, idx) => (
                  <ChessPieceSvg key={idx} type={p.type} color="w" className="w-3.5 h-3.5" />
                ))}
              </div>
            </div>
            {blackScore > whiteScore && (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                +{blackScore - whiteScore}
              </span>
            )}
          </div>

          {/* 8x8 Mathematical Square Board Container */}
          <div className="p-2 bg-[#8A5229] border-2 border-[#4A2E16] rounded-[4px] shadow-[inset_0_1px_2px_#FFF,0_4px_12px_rgba(0,0,0,0.4)] relative shrink-0">
            {/* The 8x8 Grid: Exact 360px x 360px with each cell strictly 45px x 45px (1:1 Aspect Ratio) */}
            <div
              className="grid w-[360px] h-[360px] max-w-[360px] max-h-[360px] aspect-square border border-[#3E230E] bg-[#ECD2B2] overflow-hidden"
              style={{
                width: '360px',
                height: '360px',
                gridTemplateColumns: 'repeat(8, 45px)',
                gridTemplateRows: 'repeat(8, 45px)',
              }}
            >
              {board.map((row, r) =>
                row.map((piece, c) => {
                  const isLight = (r + c) % 2 === 0;
                  const isSelected = selectedSquare?.row === r && selectedSquare?.col === c;
                  const isValidTarget = validMoves.some((m) => m.row === r && m.col === c);

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleSquareClick(r, c)}
                      style={{ width: '45px', height: '45px' }}
                      className={`w-[45px] h-[45px] aspect-square relative flex items-center justify-center cursor-pointer select-none transition-all ${
                        isLight ? 'bg-[#ECD2B2]' : 'bg-[#9C5D2D]'
                      } ${
                        isSelected
                          ? 'ring-2 ring-blue-500 shadow-[inset_0_0_8px_rgba(59,130,246,0.6)] z-10'
                          : ''
                      }`}
                    >
                      {/* Piece Vector Rendering */}
                      {piece && (
                        <div className="transition-transform active:scale-90 flex items-center justify-center filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                          <ChessPieceSvg type={piece.type} color={piece.color} className="w-[34px] h-[34px]" />
                        </div>
                      )}

                      {/* Valid Move Indicator (Glowing Emerald Dot / Crimson Capture Ring) */}
                      {isValidTarget && (
                        <div
                          className={`absolute pointer-events-none rounded-full ${
                            piece
                              ? 'w-8 h-8 ring-2 ring-red-500 bg-red-500/30 animate-pulse'
                              : 'w-3.5 h-3.5 bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-pulse'
                          }`}
                        />
                      )}

                      {/* Rank Label on 1st column */}
                      {c === 0 && (
                        <span className="absolute top-0.5 left-0.5 text-[8px] font-mono font-bold opacity-60 text-[#4A2E16] dark:text-[#E2E8F0] select-none pointer-events-none leading-none">
                          {8 - r}
                        </span>
                      )}
                      {/* File Label on 8th row */}
                      {r === 7 && (
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-bold opacity-60 text-[#4A2E16] dark:text-[#E2E8F0] select-none pointer-events-none leading-none">
                          {String.fromCharCode(97 + c)}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Player Card (White / Player) */}
          <div className="w-[360px] flex items-center justify-between text-[11px] font-mono px-2 py-1 bg-[#D8D8D8] dark:bg-[#1E293B] border border-[#B0B0B0] dark:border-[#334155] rounded-[3px] shadow-inner mt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="font-bold text-[#1E293B] dark:text-gray-200">White (You)</span>
              <div className="flex items-center gap-0.5 ml-1">
                {capturedBlack.map((p, idx) => (
                  <ChessPieceSvg key={idx} type={p.type} color="b" className="w-3.5 h-3.5" />
                ))}
              </div>
            </div>
            {whiteScore > blackScore && (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                +{whiteScore - blackScore}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Telemetry & Controls Panel */}
        <div className="w-56 bg-[#DDDDDD] dark:bg-[#1E293B] border border-[#888888] dark:border-[#334155] rounded-[3px] p-2.5 flex flex-col justify-between shadow-inner">
          <div className="space-y-2.5">
            {/* Match Status Box (Phosphor Green LCD) */}
            <div className="p-2 bg-[#0F172A] border border-[#334155] rounded-[2px] shadow-inner text-center font-mono">
              <div className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Match Status</div>
              <div
                className={`text-[11px] font-bold mt-1 ${
                  isAiThinking ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {statusMessage}
              </div>
            </div>

            {/* Opponent Selector */}
            <div className="space-y-1">
              <span className="text-[9px] text-[#555] dark:text-gray-400 font-bold uppercase font-mono tracking-wider">
                Opponent
              </span>
              <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                <button
                  onClick={() => setGameMode('ai')}
                  className={`py-1 border border-[#262626] dark:border-[#475569] rounded-[2px] ${
                    gameMode === 'ai'
                      ? 'bg-[#333399] dark:bg-blue-600 text-white font-bold'
                      : 'bg-[#EAEAEA] dark:bg-[#0F172A] text-[#333] dark:text-gray-300'
                  }`}
                >
                  Deep Platinum
                </button>
                <button
                  onClick={() => setGameMode('pvp')}
                  className={`py-1 border border-[#262626] dark:border-[#475569] rounded-[2px] ${
                    gameMode === 'pvp'
                      ? 'bg-[#333399] dark:bg-blue-600 text-white font-bold'
                      : 'bg-[#EAEAEA] dark:bg-[#0F172A] text-[#333] dark:text-gray-300'
                  }`}
                >
                  Pass & Play
                </button>
              </div>
            </div>

            {/* Skill Level */}
            {gameMode === 'ai' && (
              <div className="space-y-1">
                <span className="text-[9px] text-[#555] dark:text-gray-400 font-bold uppercase font-mono tracking-wider">
                  Skill Level
                </span>
                <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                  <button
                    onClick={() => setDifficulty('casual')}
                    className={`py-1 border border-[#262626] dark:border-[#475569] rounded-[2px] ${
                      difficulty === 'casual'
                        ? 'bg-[#333399] dark:bg-blue-600 text-white font-bold'
                        : 'bg-[#EAEAEA] dark:bg-[#0F172A] text-[#333] dark:text-gray-300'
                    }`}
                  >
                    Casual
                  </button>
                  <button
                    onClick={() => setDifficulty('master')}
                    className={`py-1 border border-[#262626] dark:border-[#475569] rounded-[2px] ${
                      difficulty === 'master'
                        ? 'bg-[#333399] dark:bg-blue-600 text-white font-bold'
                        : 'bg-[#EAEAEA] dark:bg-[#0F172A] text-[#333] dark:text-gray-300'
                    }`}
                  >
                    Grandmaster
                  </button>
                </div>
              </div>
            )}

            {/* Move History */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] text-[#555] dark:text-gray-400 font-mono font-bold uppercase tracking-wider">
                <span>Move History</span>
                <span className="text-gray-500">{moveHistory.length} moves</span>
              </div>
              <div className="h-32 overflow-y-auto bg-white dark:bg-[#0B0F17] border border-[#999] dark:border-[#334155] rounded-[2px] p-1 font-mono text-[10px] space-y-0.5 shadow-inner">
                {moveHistory.length === 0 ? (
                  <div className="text-gray-400 italic text-center py-6">No moves recorded yet</div>
                ) : (
                  Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                    <div key={i} className="flex justify-between px-1.5 py-0.5 hover:bg-[#F0F0F0] dark:hover:bg-[#1E293B]">
                      <span className="text-gray-400 w-5">{i + 1}.</span>
                      <span className="font-bold text-[#1E293B] dark:text-cyan-300 w-16">
                        {moveHistory[i * 2]?.notation}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300 w-16">
                        {moveHistory[i * 2 + 1]?.notation || '...'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Engine Footer */}
          <div className="pt-2 border-t border-[#B0B0B0] dark:border-[#334155] text-[9px] text-gray-500 font-mono flex items-center justify-between">
            <span>Engine: Deep Platinum v1.3</span>
            <span className="text-emerald-600 dark:text-emerald-400">● 60 FPS</span>
          </div>
        </div>
      </div>

      {/* ================= 3. BOTTOM STATUS BAR ================= */}
      <div className="px-3 py-1 bg-[#DDDDDD] dark:bg-[#1E293B] border-t border-[#888888] dark:border-[#334155] text-[10px] font-mono text-[#555] dark:text-gray-400 flex justify-between shadow-inner">
        <span>Current Turn: {turn === 'w' ? 'White (Player)' : 'Black (Deep Platinum AI)'}</span>
        <span>Mac OS 9.2.2 Chess Engine Active</span>
      </div>
    </div>
  );
};
