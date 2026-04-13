'use client';

import { useState, useTransition } from 'react';
import styles from './onboarding-review.module.css';

interface Props {
  noteId: string;
  initialReviewed: boolean;
}

export default function MarkReviewedButton({ noteId, initialReviewed }: Props) {
  const [reviewed, setReviewed] = useState(initialReviewed);
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    if (reviewed) return; // already done — no un-review
    startTransition(async () => {
      try {
        const res = await fetch('/api/teacher/onboarding-review', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteId }),
        });
        if (res.ok) setReviewed(true);
      } catch {
        // silently fail — teacher can retry
      }
    });
  }

  if (reviewed) {
    return (
      <span className={styles.reviewedChip}>
        ✓ Reviewed
      </span>
    );
  }

  return (
    <button
      className={styles.markReviewedBtn}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? 'Saving…' : 'Mark Reviewed'}
    </button>
  );
}
