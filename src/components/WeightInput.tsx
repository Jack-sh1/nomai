import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface WeightInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
}

const WeightInput: React.FC<WeightInputProps> = ({ 
  value, 
  onChange,
  placeholder = "如 70" 
}) => {
  // 核心状态：用于显示的字符串（处理前导零、小数点等）
  const [displayValue, setDisplayValue] = useState(value > 0 ? value.toString() : '');
  const [isFocused, setIsFocused] = useState(false);

  // 同步外部传入的 value（仅在非聚焦态或外部强制更新时）
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? value.toString() : '');
    }
  }, [value, isFocused]);

  // 校验逻辑
  const numericValue = parseFloat(displayValue);
  const isOutOfRange = !isNaN(numericValue) && (numericValue < 30 || numericValue > 200);
  const hasInput = displayValue.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // 1. 过滤：只允许数字和单个小数点
    val = val.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) return; // 禁止多个小数点
    if (parts[1]?.length > 1) return; // 限制最多一位小数

    // 2. 去前导零：除了 "0." 开头的情况
    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
      val = val.replace(/^0+/, '');
    }

    setDisplayValue(val);

    // 3. 只有合法的数字才触发父组件 onChange
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange(num);
    } else if (val === '') {
      onChange(0);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative group">
        {/* 输入框容器 */}
        <div className={`
          relative flex items-center transition-all duration-300 rounded-2xl
          bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm
          border-2
          ${isFocused ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-slate-100 dark:border-slate-700'}
          ${isOutOfRange && hasInput ? 'border-amber-500' : ''}
        `}>
          <input
            type="tel"
            inputMode="decimal"
            pattern="[0-9]*"
            value={isFocused ? displayValue : (hasInput ? `${displayValue} kg` : '')}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              // 失焦时修正末尾的小数点，如 "75." -> "75"
              if (displayValue.endsWith('.')) {
                setDisplayValue(displayValue.slice(0, -1));
              }
            }}
            onChange={handleInputChange}
            className={`
              w-full p-4 pr-16 bg-transparent outline-none
              text-xl font-bold tracking-tight
              ${isFocused ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}
              placeholder:text-slate-300 dark:placeholder:text-slate-600
            `}
          />

          {/* 右侧固定单位 - 永不偏移 */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none">
            <span className={`
              text-sm font-black transition-opacity duration-300
              ${isFocused ? 'opacity-100 text-emerald-500' : 'opacity-0'}
            `}>
              kg
            </span>
          </div>
        </div>

        {/* 错误提示 - 仅在超出范围时显示 */}
        <AnimatePresence>
          {isOutOfRange && hasInput && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute -bottom-6 left-1 flex items-center gap-1 text-rose-500 text-[10px] font-bold"
            >
              <AlertCircle className="w-3 h-3" />
              <span>建议范围 30 - 200 kg</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WeightInput;
