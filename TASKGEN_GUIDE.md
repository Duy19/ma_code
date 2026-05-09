# GA Task Generation Guide

## How it goes
The GA task-generation creates scheduling tasksets on demand, checks whether they are usable, and feeds them into the puzzle pages. 

## Main Files
- [src/logic/GA_TasksetGeneration.ts](src/logic/GA_TasksetGeneration.ts) contains the genetic algorithm that creates a candidate taskset and evaluates it with simulator-based fitness values. Another apporach should be written in a separate file.
- [src/pages/ModularTutorial/taskGenPuzzle/useTaskGenPuzzle.ts](src/pages/ModularTutorial/taskGenPuzzle/useTaskGenPuzzle.ts) is the UI-facing hook that builds GA config, launches generation, validates the result, and stores the generated taskset in React state.
- [src/pages/ModularTutorial/taskGenPuzzle/TaskGenPuzzleOverlay.tsx](src/pages/ModularTutorial/taskGenPuzzle/TaskGenPuzzleOverlay.tsx) is the overlay that lets the user choose difficulty and trigger generation.
- [src/pages/DetectiveGame.tsx](src/pages/DetectiveGame.tsx) uses the generator for the sidebar-puzzle flow.
- [src/pages/DrawGame.tsx](src/pages/DrawGame.tsx) uses the generator for the interactive schedule-drawing flow.

## The Generation Pipeline
The steps are as follows:

1. The overlay asks for a difficulty level.
2. `useTaskGenPuzzle()` turns that choice into a GA configuration by calling `buildGAConfigFromTemplate()` and applying any page-specific overrides like `maxOffset`, `periodRange`, or `taskCountRange`.
3. The hook calls `GA_TasksetGeneration()` to build a taskset.
4. The hook checks the result with `isTasksetUsable()`, which verifies utilization, offset limits, simulation viability, and basic task constraints.
5. The hook checks whether the generated taskset is close enough to the target difficulty using the same fitness expression that the GA uses.
6. If the result passes, the hook stores the generated tasks, the selected algorithm, the puzzle difficulty.

The key detail is that generation is not just random task creation. The taskset is filtered by simulator-based viability and by a difficulty target derived from simulation metrics.

## What `GA_TasksetGeneration.ts` Does
`GA_TasksetGeneration.ts` is the core generator. It defines `GAConfiguration`, which includes:

- `populationSize`, `generations`, `selectionAmount`, and `mutationRate` for the GA search.
- `usedAlgorithm` to decide whether fitness is evaluated with RM, DM, or EDF.
- `numberOfTasks` and `periodRange` to control the taskset shape.
- `targetDifficulty`, `difficultyTolerance`, and `maxOffset` for puzzle shaping.

Inside the generator, the code builds random tasksets as starting population, then repairs them when utilization is too high.
From here the loop begins, where selection for parents happens and new children are mutated.
Then the fitness of all new candidates is evaluated.
The 20 best chromosomes are the starting population for the next generation and the rest is filled up with random task sets again.
This loop happens until the max. amount of generations is done.
Then the best candidate is returned.
For evaluating the fitness each task set has to be scheduled with the simulator.
That means the generator is tightly coupled to the simulator. If you change the simulator metrics or the difficulty formula, you are changing the generator behavior as well.

## How DetectiveGame Uses It
`DetectiveGame.tsx` uses `useTaskGenPuzzle()` to create a puzzle-viable taskset and then passes the generated tasks into `ModularTutorialTemplate`.

The important pieces are:

- It sets `showSidebarPuzzle: true` in the story once a taskset exists.
- It passes `puzzleVisibleFields` and `puzzleEditableFields` so the user can edit `executionTime`, `periods`, `deadlines`, `offsets`, and the algorithm selector.
- It provides `sidebarPuzzleConfig`, which contains the generated tasks, the interval, the selected algorithm function, and the algorithm name.
- It uses the generator overlay as the custom story overlay by passing `renderOverlay={() => <TaskGenPuzzleOverlay ... />}`.

## Extending The Template With New Task Generation
If you want to add a new generator page, the reusable pieces are already there.

1. Build or reuse a generator hook that returns generated tasks, difficulty state, loading state, errors, and a `generationVersion` counter.
2. Feed the generated tasks into `ModularTutorialTemplate` through `baseTasks`.
3. Put the generation UI in `renderOverlay` or in a custom page section.
4. Use story fields like `showSidebarPuzzle`, `puzzleVisibleFields`, `puzzleEditableFields`, `showButtons`, or `canvasMode` to switch the template into the correct interaction mode.
5. Keep the template keyed by the generation version so regenerating a taskset resets the page state.

## Practical Extension Point
For a new task-generation feature, the safest split is:

- Use a `New_generator_file` for generation logic.
- A hook like `useTaskGenPuzzle.ts` for page state and validation.
- A page like `DetectiveGame.tsx` or `DrawGame.tsx` for template integration.

That keeps generation logic, UI state, and tutorial rendering separate, which makes the system much easier to extend.