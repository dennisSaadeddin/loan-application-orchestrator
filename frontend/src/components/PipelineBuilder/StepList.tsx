import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Typography, Paper } from '@mui/material';
import { StepConfig } from '@/types';
import StepCard from './StepCard';

interface SortableStepProps {
  step: StepConfig;
  onRemove: () => void;
  onUpdateParams: (params: Record<string, any>) => void;
}

const SortableStep: React.FC<SortableStepProps> = ({ step, onRemove, onUpdateParams }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: step.order });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <StepCard
        step={step}
        onRemove={onRemove}
        onUpdateParams={onUpdateParams}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

interface StepListProps {
  steps: StepConfig[];
  onRemoveStep: (order: number) => void;
  onUpdateStepParams: (order: number, params: Record<string, any>) => void;
  onReorderSteps: (fromOrder: number, toOrder: number) => void;
}

const StepList: React.FC<StepListProps> = ({
  steps,
  onRemoveStep,
  onUpdateStepParams,
  onReorderSteps,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((s) => s.order === active.id);
      const newIndex = steps.findIndex((s) => s.order === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderSteps(steps[oldIndex].order, steps[newIndex].order);
      }
    }
  };

  if (steps.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No steps added yet. Add steps from the menu above to build your pipeline.
        </Typography>
      </Paper>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={steps.map((s) => s.order)}
        strategy={verticalListSortingStrategy}
      >
        <Box>
          {steps.map((step) => (
            <SortableStep
              key={step.order}
              step={step}
              onRemove={() => onRemoveStep(step.order)}
              onUpdateParams={(params) => onUpdateStepParams(step.order, params)}
            />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
};

export default StepList;
