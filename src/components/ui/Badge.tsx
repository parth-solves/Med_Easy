import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const s = status.toUpperCase();

  let colors = 'bg-slate-100 text-slate-700 border-slate-200';
  let displayText = status.replace(/_/g, ' ');

  if (['APPROVED', 'VERIFIED', 'SOURCE_CHECK_COMPLETED', 'RESOLVED', 'ACTIVE', 'GOOD_TO_USE', 'GOOD TO USE'].includes(s)) {
    colors = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
    if (s === 'SOURCE_CHECK_COMPLETED') displayText = 'Supplier Matched';
    if (s === 'APPROVED' || s === 'ACTIVE') displayText = 'Active';
  } else if (['UNDER_REVIEW', 'IN_REVIEW', 'INFORMATION_EXTRACTED', 'BEING_CHECKED', 'BEING CHECKED'].includes(s)) {
    colors = 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
    if (s === 'IN_REVIEW' || s === 'UNDER_REVIEW') displayText = 'Being Checked';
  } else if (['PENDING', 'DOCUMENTS_PENDING', 'REVIEW_REQUIRED', 'NEEDS_CHECKING', 'NEEDS CHECKING', 'NOT_CHECKED', 'NOT CHECKED'].includes(s)) {
    colors = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
    if (s === 'PENDING' || s === 'REVIEW_REQUIRED' || s === 'DOCUMENTS_PENDING') displayText = 'Needs Checking';
    if (s === 'NOT_CHECKED') displayText = 'Not Checked';
  } else if (['REJECTED', 'INVALID', 'MISMATCH_DETECTED', 'SUSPENDED', 'DISMISSED', 'EXPIRED', 'HIGH', 'CRITICAL'].includes(s)) {
    colors = 'bg-rose-50 text-rose-700 border-rose-200 font-medium';
    if (s === 'MISMATCH_DETECTED') displayText = 'Details Do Not Match';
  } else if (['VERIFICATION_UNAVAILABLE', 'UNSUPPORTED'].includes(s)) {
    colors = 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    displayText = 'Not Recognized';
  } else if (s === 'REPORTED') {
    colors = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
    displayText = 'Reported';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-tight font-medium ${sizeClasses} ${colors}`}
    >
      {displayText}
    </span>
  );
};
