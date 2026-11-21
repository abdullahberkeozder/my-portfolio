'use client';

import React, { useState } from 'react';
import { macSound } from '@/lib/retroAudioMac9';

export const MacCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [clearOnNext, setClearOnNext] = useState(false);

  const handleDigit = (digit: string) => {
    macSound.playMacClickDown();
    if (display === '0' || clearOnNext) {
      setDisplay(digit);
      setClearOnNext(false);
    } else {
      if (display.length < 12) {
        setDisplay(display + digit);
      }
    }
  };

  const handleDecimal = () => {
    macSound.playMacClickDown();
    if (clearOnNext) {
      setDisplay('0.');
      setClearOnNext(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    macSound.playMacClickDown();
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setClearOnNext(false);
  };

  const handleOperator = (op: string) => {
    macSound.playMacClickDown();
    const current = parseFloat(display);

    if (prevValue !== null && operation && !clearOnNext) {
      const result = calculate(prevValue, current, operation);
      setDisplay(result.toString().slice(0, 12));
      setPrevValue(result);
    } else {
      setPrevValue(current);
    }

    setOperation(op);
    setClearOnNext(true);
  };

  const handleEqual = () => {
    macSound.playMacClickDown();
    if (prevValue !== null && operation) {
      const current = parseFloat(display);
      const result = calculate(prevValue, current, operation);
      setDisplay(result.toString().slice(0, 12));
      setPrevValue(null);
      setOperation(null);
      setClearOnNext(true);
    }
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#CCCCCC] p-3 font-['Charcoal',sans-serif] select-none text-[12px] text-[#262626]">
      {/* Vintage Digital LCD Display */}
      <div className="mac9-inset-box bg-[#E8EAE6] p-2 mb-3 rounded-[2px] flex items-center justify-end shadow-inner">
        <span className="font-mono text-xl tracking-wider text-[#1C201A] font-bold overflow-hidden text-ellipsis whitespace-nowrap">
          {display}
        </span>
      </div>

      {/* Button Grid (Classic Platinum Beveled Keys) */}
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        <button onClick={handleClear} className="mac9-btn bg-[#FFCCCC] hover:bg-[#FFB3B3] font-bold text-[13px] py-2">
          C
        </button>
        <button
          onClick={() => {
            macSound.playMacClickDown();
            setDisplay((parseFloat(display) * -1).toString());
          }}
          className="mac9-btn font-bold py-2"
        >
          ±
        </button>
        <button
          onClick={() => {
            macSound.playMacClickDown();
            setDisplay((parseFloat(display) / 100).toString());
          }}
          className="mac9-btn font-bold py-2"
        >
          %
        </button>
        <button onClick={() => handleOperator('÷')} className="mac9-btn font-bold text-[14px] bg-[#DDDDDD] py-2">
          ÷
        </button>

        <button onClick={() => handleDigit('7')} className="mac9-btn font-bold text-[14px] py-2">
          7
        </button>
        <button onClick={() => handleDigit('8')} className="mac9-btn font-bold text-[14px] py-2">
          8
        </button>
        <button onClick={() => handleDigit('9')} className="mac9-btn font-bold text-[14px] py-2">
          9
        </button>
        <button onClick={() => handleOperator('×')} className="mac9-btn font-bold text-[14px] bg-[#DDDDDD] py-2">
          ×
        </button>

        <button onClick={() => handleDigit('4')} className="mac9-btn font-bold text-[14px] py-2">
          4
        </button>
        <button onClick={() => handleDigit('5')} className="mac9-btn font-bold text-[14px] py-2">
          5
        </button>
        <button onClick={() => handleDigit('6')} className="mac9-btn font-bold text-[14px] py-2">
          6
        </button>
        <button onClick={() => handleOperator('-')} className="mac9-btn font-bold text-[14px] bg-[#DDDDDD] py-2">
          -
        </button>

        <button onClick={() => handleDigit('1')} className="mac9-btn font-bold text-[14px] py-2">
          1
        </button>
        <button onClick={() => handleDigit('2')} className="mac9-btn font-bold text-[14px] py-2">
          2
        </button>
        <button onClick={() => handleDigit('3')} className="mac9-btn font-bold text-[14px] py-2">
          3
        </button>
        <button onClick={() => handleOperator('+')} className="mac9-btn font-bold text-[14px] bg-[#DDDDDD] py-2">
          +
        </button>

        <button onClick={() => handleDigit('0')} className="col-span-2 mac9-btn font-bold text-[14px] py-2">
          0
        </button>
        <button onClick={handleDecimal} className="mac9-btn font-bold text-[14px] py-2">
          .
        </button>
        <button onClick={handleEqual} className="mac9-btn mac9-btn-default bg-[#CCE5FF] font-bold text-[14px] py-2">
          =
        </button>
      </div>

      <div className="mt-2 text-center text-[10px] text-[#666] font-mono">
        Mac OS 9 Calculator Desk Accessory
      </div>
    </div>
  );
};
