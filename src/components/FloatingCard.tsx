import React from 'react';
import { Card3DWrapper } from './Card3DWrapper';

interface FloatingCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  seed?: number;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  onClick,
  className = "",
  seed
}) => {
  return (
    <Card3DWrapper seed={seed} onClick={onClick} className={className}>
      {children}
    </Card3DWrapper>
  );
};
export default FloatingCard;
