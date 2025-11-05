import { useState, useEffect } from 'react';
import { TimeBlock } from '@/types';

const STORAGE_KEY = 'chronofocus_timeblocks';

export const useTimeBlocks = () => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const blocks = JSON.parse(stored);
      // Migrate old blocks to include new status field
      const migratedBlocks = blocks.map((block: TimeBlock) => ({
        ...block,
        status: block.status || (block.completed ? 'completed' : 'planned'),
        actualStartTime: block.actualStartTime,
        actualEndTime: block.actualEndTime,
        pausedDuration: block.pausedDuration || 0,
        externalEvent: block.externalEvent || false,
      }));
      setTimeBlocks(migratedBlocks);
    }
  }, []);

  const saveTimeBlocks = (blocks: TimeBlock[]) => {
    setTimeBlocks(blocks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  };

  const addTimeBlock = (block: TimeBlock) => {
    const newBlocks = [...timeBlocks, block];
    saveTimeBlocks(newBlocks);
  };

  const updateTimeBlock = (id: string, updates: Partial<TimeBlock>) => {
    const newBlocks = timeBlocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    );
    saveTimeBlocks(newBlocks);
  };

  const deleteTimeBlock = (id: string) => {
    const newBlocks = timeBlocks.filter(block => block.id !== id);
    saveTimeBlocks(newBlocks);
  };

  const getBlocksForDate = (date: string) => {
    return timeBlocks.filter(block => block.date === date);
  };

  return {
    timeBlocks,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    getBlocksForDate,
  };
};
