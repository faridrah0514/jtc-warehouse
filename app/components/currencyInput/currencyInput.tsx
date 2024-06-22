import { _renderCurrency } from "@/app/utils/renderCurrency";
import { Input } from "antd";
import { useRef, ChangeEvent } from "react";

interface CurrencyInputProps {
    value: number;
    onChange: (value: number) => void;
    className?: string;
    allowNegative?: boolean;
    [key: string]: any; // for other props
  }


export const CurrencyInput: React.FC<CurrencyInputProps> = ({
    value = 0,
    onChange,
    className = '',
    allowNegative = true,
    ...props
  }) => {
    const inputRef = useRef<HTMLInputElement>(null)
  
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      let rawText = e.target.value
      let numberText = rawText.replace(/\D/g, '')
      let result = numberText
      onChange(Number(result))
    }
  
    return (
      <Input
        className={`${className}`}
        value={`${_renderCurrency(value)}`}
        onChange={handleChange}
        onClick={() => inputRef?.current?.click}
        onFocus={() => inputRef?.current?.focus}
        {...props}
      />
    )
  }