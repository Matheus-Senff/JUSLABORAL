import React, { ChangeEvent } from 'react';
import { Input } from '@previd/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@previd/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { Label } from '@previd/components/ui/label';

interface MaskedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mask?: (value: string) => string;
  tooltip?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function MaskedInput({ label, value, onChange, mask, tooltip, placeholder, required, className }: MaskedInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(mask ? mask(raw) : raw);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Label className="text-sm font-medium calculo-text-primary">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 calculo-text-secondary cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[260px] text-xs bg-calculo-card border-calculo-border calculo-text-primary">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-9 text-sm calculo-input"
        required={required}
      />
    </div>
  );
}
