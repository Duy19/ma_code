# Guide to the repository

## Template
The `ModularTutorialTemplate` is the shared page template for the scheduling tutorials, puzzles, and custom games. It combines a story-driven state machine with reusable renderers for the overlay, canvas, sidebar, buttons, definitions box, quiz, and puzzle layouts.

The key idea is: each story step is a patch. A step only changes the fields it sets, and every other value keeps its previous value until another step overrides it. The template is used for both normal chapter pages and the puzzle pages that generate tasksets at runtime.

## Where To Look
- [src/pages/ModularTutorialTemplate.tsx](src/pages/ModularTutorialTemplate.tsx): the main file which connects everything.
- [src/pages/ModularTutorial/types.ts](src/pages/ModularTutorial/types.ts) defines the story and other prop types.
- [src/pages/ModularTutorial/useTutorialState.ts](src/pages/ModularTutorial/useTutorialState.ts) applies cumulative story patches.
- [src/pages/ModularTutorial/LayoutManager.tsx](src/pages/ModularTutorial/LayoutManager.tsx) contains a prebuild layout for the page.
- [src/pages/ModularTutorial/CanvasRenderer.tsx](src/pages/ModularTutorial/CanvasRenderer.tsx) and [src/pages/ModularTutorial/SidebarRenderer.tsx](src/pages/ModularTutorial/SidebarRenderer.tsx) wire the default canvas and sidebar.
- Examples for how to use the Story prop are in: [src/pages/Chapter1/Chapter1_A.tsx](src/pages/Chapter1/Chapter1_A.tsx), [src/pages/DrawGame.tsx](src/pages/DrawGame.tsx), [src/pages/DetectiveGame.tsx](src/pages/DetectiveGame.tsx), and [src/pages/Tutorial/Tutorial3.tsx](src/pages/Tutorial/Tutorial3.tsx).
- The standalone FreeScheduler page is in [src/pages/FreeScheduler.tsx](src/pages/FreeScheduler.tsx).
- The GA task-generation is documented in [GA_TASKGENERATION_GUIDE.md](GA_TASKGENERATION_GUIDE.md).

## Story Model And Important Types
The story is an array of `StoryStep` objects. Each step describes the current narrative text and the state patch that should be applied on top of all previous steps.

### Core types
- `StoryStep` in [src/pages/ModularTutorial/types.ts](src/pages/ModularTutorial/types.ts) is the per-step patch object. It stores the narrative text plus the fields a single story step wants to override.
- `StoryState` in [src/pages/ModularTutorial/types.ts](src/pages/ModularTutorial/types.ts) is the cumulative state after all patches are applied. It is the live page state that the layout manager and renderers read.
- `ModularTutorialTemplateProps` in [src/pages/ModularTutorial/types.ts](src/pages/ModularTutorial/types.ts) is the page-level configuration surface. It provides the starting tasks, algorithms, initial visibility, custom renderers, and layout options.
- `Task` in [src/core/task.ts](src/core/task.ts) is the task model used by the simulator, canvas, and sidebar.
- `SuspensionInterval` and `SuspensionPattern` in [src/core/task.ts](src/core/task.ts) describe the two suspension representations that the canvas and simulator currently use.
- `ScheduleEntry` and `ScheduleResult` in [src/logic/simulator.ts](src/logic/simulator.ts) are simulator outputs, where `scheduleEntry` is mostly used by the canvas to drawf the schedule and `ScheduleResult` offers parameters used for taskgeneration.

### Task fields
`Task` is the most important data type in the template. The fields mean the following:

- `id`: stable identifier used by the simulator, canvas, highlights, and sidebar editing.
- `name`: visible task label.
- `C`: execution time. In the sidebar this is shown as execution time.
- `T`: period. The tutorial pages use it to compute hyperperiods and release times.
- `D`: relative deadline.
- `O`: offset, used when tasks do not start at time 0.
- `S`: suspension time limit used by suspension-aware variants.
- `suspension`: either a list of explicit suspension intervals or a repeating suspension pattern.
- `color`: visual color used by the canvas.
- `jobs`: optional job history that the simulator can attach to a task.

### Story fields and accepted values
The fields below are the active patch surface used by the current template flow. Each one is cumulative: if a step omits it, the current value stays in place.

| Field | Accepted values / shape | Where it is used |
|---|---|---|
| `tasks` | `Task[]` | Replaces the task list for the story or puzzle page. |
| `selectedAlgorithm` | `string` | Should match a key in the page's `algorithms` map, such as `EDF`, `RM`, or `DM`. |
| `hiddenTasks` | `string[]` | Task ids hidden from the canvas only. |
| `hyperperiod` | `number` | Overwrites the schedule length used by the template. |
| `interval` | `[number, number]` | Visible time interval for the canvas and puzzle layouts. |
| `showOverlay` | `boolean` | Shows or hides the story overlay. |
| `showHintCheckboxes` | `boolean` | Shows or hides the hint toggles. |
| `showSidebar` | `boolean` | Shows or hides the normal sidebar. |
| `showButtons` | `boolean` | Shows or hides the buttons. |
| `showDefinitions` | `boolean` | Shows or hides the definitions panel. |
| `showCanvas` | `boolean` | Shows or hides the canvas area. |
| `showQuiz` | `boolean` | Enables quiz mode for the story step. |
| `quizQuestionIds` | `string[]` | Quiz question ids that should be active for the step. |
| `showSummary` | `boolean` | Shows or hides the summary section. |
| `summaryIds` | `string[]` | Summary entry ids that should be visible. |
| `showDropGame` | `boolean` | Shows or hides the drag-and-drop game section. |
| `dropGameVaultIds` | `string[]` | Vault ids used by the drop game layout. |
| `showSidebarPuzzle` | `boolean` | Switches the layout into sidebar puzzle mode. |
| `wcrtTaskId` | `string` | Task id used by the WCRT checkfunction. |
| `showSuspensionPuzzle` | `boolean` | Switches the layout into suspension puzzle mode. |
| `canvasMode` | `"interactive" \| "default"` | Selects the interactive canvas or the read-only canvas. |
| `layoutStyle` | `"standard" \| "interactive"` | Chooses the overall page layout branch, multiple can be added later on. |
| `sidebarVisibleFields` | `("executionTime" \| "periods" \| "deadlines" \| "offsets" \| "suspension" \| "suspensionToggle" \| "taskControls" \| "algorithmSelection")[]` | Fields shown in the normal sidebar. |
| `sidebarEditableFields` | same as above | Fields the user may edit in the normal sidebar. |
| `puzzleVisibleFields` | same as above | Fields shown in the puzzle sidebar. |
| `puzzleEditableFields` | same as above | Fields the user may edit in the puzzle sidebar. |
| `editableTasks` | `string[]` | Restricts editing to specific task ids when non-empty. |
| `maxFieldValues` | `{ executionTime?: number; periods?: number; deadlines?: number; offsets?: number; suspension?: number }` | Per-field upper bounds for the sidebar and puzzle renderers. |
| `highlight` | `string \| null` | Highlights a single task id, or clears highlighting with `null`. |
| `highlightExecutions` | `{ taskId: string; steps: number[] }[]` | Highlights specific execution steps for one or more tasks. |
| `renderCompanion` | `(props: OverlayRenderProps) => ReactNode` | Custom component that can be rendered next to Mr.Tau (e.g. images, formulas). |
| `checkFunction` | `(state: CheckFunctionState) => boolean` | Custom check for the current story step. |
| `sidebarPuzzleConfig` | `{ puzzleTasks: Task[]; interval?: [number, number]; algorithm: (tasks: Task[], hyperperiod: number) => ScheduleEntry[]; algorithmName: string }` | Required when `showSidebarPuzzle` is enabled. |
| `suspensionPuzzleConfig` | `SuspensionPuzzleConfig` | Required when `showSuspensionPuzzle` is enabled. |
| `navigateTo` | `string` | Route path used by the story flow when advancing. |
| `waitFor` | `(state: WaitForState) => boolean` | Condition that must pass before the story continues e.g. solve the game or any custom check. |

`SidebarRenderer` maps the field labels to the actual task properties. `executionTime` maps to `C`, `periods` maps to `T`, `deadlines` maps to `D`, `offsets` maps to `O`, `suspension` maps to `S`, `suspensionToggle` controls the suspension toggle, `taskControls` controls the add/remove buttons, and `algorithmSelection` controls the algorithm selection.

The template also keeps a few page-level props outside the story patch path. These are not step patches themselves, but they define the starting state for the story: `baseTasks`, `defaultAlgorithm`, `showOverlay`, `showHintCheckboxes`, `showSidebar`, `showButtons`, `canvasMode`, `layoutStyle`, `sidebarVisibleFields`, `sidebarEditableFields`, `puzzleVisibleFields`, `puzzleEditableFields`, `showDefinitions`, `definitions`, `showSummary`, `showDropGame`, `dropGameVaultIds`, and `hintConfig`.

## How State Management Works
The state managed is in: [src/pages/ModularTutorial/useTutorialState.ts](src/pages/ModularTutorial/useTutorialState.ts).

1. `createInitialState()` builds the baseline from the page props. It seeds `tasks`, `selectedAlgorithm`, the visibility booleans, the layout mode, the sidebar field lists, and the default puzzle settings.
2. `applyStepPatch()` merges each `StoryStep` into the current state. It only writes fields that are explicitly defined in the step, so missing fields stay unchanged. The one special case is `tasks`, which also updates `currentTasks` because the sidebar puzzle uses that array.
3. `useTutorialState()` replays all story steps from the beginning up to the current step with `for (let i = 0; i <= props.step && i < props.story.length; i++)`. That is why step patches are cumulative instead of replacing the whole page.
4. After the story patches are applied, user edits can override the story. `userInputTasks` replaces `state.tasks`, and `userManuallyChangedAlgorithm` plus `userSelectedAlgorithm` replace `state.selectedAlgorithm`. That is the persistence rule that lets user changes persist in later steps.

Two practical rules matter most:

- Empty arrays are explicit resets. For example, `sidebarEditableFields: []` blocks all sidebar editing until another step enables a field again.
- Story changes are persistent. If a step enables `algorithmSelection`, the next step keeps it enabled unless it changes that field again.

## Creating An Example Page
Most tutorial pages follow the same pattern: define a base task set, define a story, and hand both to `ModularTutorialTemplate`.

### DetectiveGame example
`DetectiveGame.tsx` starts by asking the GA puzzle hook for a generated taskset. If no taskset exists yet, the story only shows the overlay and hides the canvas:

```tsx
{
  text: "Generate a puzzle-viable taskset and solve it in the sidebar.",
  showHintCheckboxes: false,
  showOverlay: true,
  showCanvas: false,
  selectedAlgorithm,
}
```

Once a taskset exists, the story switches into puzzle mode and turns on the sidebar puzzle renderer:

```tsx
{
  text: "Generated puzzle loaded. Solve it by editing parameters in the sidebar.",
  showHintCheckboxes: false,
  showOverlay: true,
  showCanvas: true,
  showSidebarPuzzle: true,
  selectedAlgorithm,
  puzzleVisibleFields: ["executionTime", "periods", "deadlines", "offsets", "algorithmSelection"],
  puzzleEditableFields: ["executionTime", "periods", "deadlines", "offsets", "algorithmSelection"],
  maxFieldValues: { executionTime: 100, periods: 100, deadlines: 100, offsets: 100 },
  sidebarPuzzleConfig: {
    puzzleTasks: generatedTasks,
    interval: [0, hyperperiod],
    algorithm: getAlgorithmByName(selectedAlgorithm) as any,
    algorithmName: selectedAlgorithm,
  },
}
```

This is a good example of a generated puzzle page because the story, the sidebar puzzle config, and the overlay all depend on the same generated taskset.

### Chapter 1_B example
`Chapter1` uses many different functionalites to explain different scheduling policies.

```tsx
const BASE_TASKS2: Task[] = [
  { id: "brake", name: "Brakes", C: 1, T: 6, D: 5, color: "#f87171" },
  { id: "sensor", name: "Sensor", C: 2, T: 12, D: 6, color: "#60a5fa" },
  { id: "media", name: "Multimedia", C: 3, T: 12, D: 4, color: "#34d399" },
];

const STORY: StoryStep[] = [
    { 
    text: "Now lets look at a new example, but this time with a **Fixed-Priority Scheduling**. ", 
    showSidebar: true,
    },

    { 
    text: "With Fixed-Priority Scheduling, tasks are scheduled with given fixed priorities. These remain unchanged over the entire period.", 
    },
    { 
    text: "I will introduce both **Rate-Monotonic (RM)** and **Deadline-Monotonic (DM)** to you as strategies.", 
    },
    { 
    text: "With Rate-Monotonic, tasks with shorter periods are given higher priority. Feel free to take a look at the schedule below.", 
    },
    { 
    text: "With Deadline-Monotonic, on the other hand, tasks with shorter deadlines are given higher priority. Let’s now look at the schedule using DM. **(Click)**.", 
    showDefinitions: true,  
    },
    { 
    text: "Did you notice the difference?", 
    selectedAlgorithm: "DM",
    },
    { 
    text: "In the last example with RM, the multimedia task even missed its deadline at time step 4!", 
    highlightExecutions: [{ taskId: "media", steps: [3, 4, 5] }],
    },
    {
    text: "The priorities were also quite different this time. In **this case**, DM is better suited to avoid missing deadlines.", 
    },
    {
    text: "In the next step, let’s take another look at an example using all the algorithms we have learned so far.", 
    navigateTo: "/Chapter1_C"
    },        
];



const DEFINITIONS = [
  {
    term: "RM",
    definition: "Rate Monotonic - fixed priority based on task period. Shorter periods get higher priority [Liu & Layland in 1973].",
  },
  {
    term: "DM",
    definition: "Deadline Monotonic - fixed priority based on task deadline. Shorter deadlines get higher priority [Leung and Whitehead in 1982].",
  },
];

export default function Chapter1_B() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ModularTutorialTemplate
        story={STORY}
        baseTasks={BASE_TASKS2}
        hyperperiod={24}
        algorithms={{
          RM: simulateRM,
          EDF: simulateEDF,
          DM: simulateDM,
        }}
        defaultAlgorithm="RM"
        canvasMode="default"
        layoutStyle="standard"
        showOverlay={true}
        showHintCheckboxes={true}
        showSidebar={false}
        showButtons={false}
        showDefinitions={false}
        definitions={DEFINITIONS}
        hintConfig={[]}
      />
    </div>
  );
}

```

That page is a precise example of using the template for explaining things directly on a schedule and allowing the user to be interactive with the page.

If you want to replace parts of the page, pass custom renderers through `renderOverlay`, `renderCanvas`, `renderSidebar`, `renderButtons`, `renderDefinitions`, or `renderCompanion`. The template will use your renderer instead of the default one in the matching branch.


## How The FreeScheduler Sidebar, Canvas, And Simulator Work
[`src/pages/FreeScheduler.tsx`](src/pages/FreeScheduler.tsx) is the standalone scheduler page.

### Sidebar
`FreeSchedulerSidebar` is the editable control surface for the task list. It lets the user:

- add and remove tasks,
- edit task fields like execution time, period, deadline, offset, and suspension,
- switch the algorithm,
- toggle suspension support,
- change the visible interval.

The page keeps the task array, selected algorithm, interval, hyperperiod, schedule, and suspension flag in local React state. Whenever those values change, the page recomputes the schedule.

### Canvas
`SchedulerCanvas` renders the schedule. From the FreeScheduler page it receives:

- the task list,
- the current hyperperiod,
- the computed schedule,
- the selected interval,
- display settings like `pxPerStep`, `rightPaddingSteps`, and `timeStepLabelEvery`.

The canvas can also export itself as PNG through the `downloadAsPNG()` method. The page binds that to the “Save Schedule as PNG” button.

### Simulator
`src/logic/simulator.ts` contains the scheduling logic. The page currently uses:

- `simulateEDF`, `simulateRM`, and `simulateDM`,
- plus the suspension-aware variants `simulateEDFWithSuspension`, `simulateRMWithSuspension`, and `simulateDMWithSuspension`.

The page recomputes the schedule in two places:

- when tasks, algorithm, or suspension mode change,
- when the displayed interval changes and the visible window needs a new simulation length.

`MAX_SIMULATION_HYPERPERIOD` is used as a safety cap so the page does not try to simulate a very large task set forever.

## Extending The Template With A New Algorithm Or Feature
There are two common extension paths.

### 1. Add a new scheduling algorithm
1. Implement the algorithm in [src/logic/simulator.ts](src/logic/simulator.ts) or a new module in `src/logic/`.
2. Export it from the module.
3. Add it to the `algorithms` map when you instantiate `ModularTutorialTemplate` or to the algorithm selection path in `FreeScheduler.tsx`.
4. Use `selectedAlgorithm` in the story if a step should switch the active algorithm.

The existing pages already do this for EDF, RM, and DM, so adding a new algorithm is mostly a matter of wiring a new function into the same map.

### 2. Add a new game, canvas, or puzzle
If the feature is still a tutorial page, keep the template and add a new renderer branch or a custom renderer prop.

- Use `renderOverlay` for custom story visuals.
- Use `renderCanvas` for a new canvas or game board.
- Use `renderSidebar` for a custom control panel.
- Use `renderButtons` if the page needs custom actions.
- Use `renderDefinitions` if the page needs its own definition content.

If the feature is more specialized, create a standalone page like `FreeScheduler.tsx` or `Tutorial3.tsx` and compose the components directly. That is the right approach when the page owns its own state machine, its own simulator loop, or a custom interaction model that does not fit the story patch flow.

For new taskset generation flows, keep the template and add a dedicated generator hook or a generator page. The GA-specific flow is described in [GA_TASKGENERATION_GUIDE.md](GA_TASKGENERATION_GUIDE.md).

### 3. Add a new story state field
If a new feature needs to be controlled by the story itself, add the field in three places:

1. Extend `StoryState` and `StoryStep` in [src/pages/ModularTutorial/types.ts](src/pages/ModularTutorial/types.ts).
2. Merge the field in `applyStepPatch()` inside [src/pages/ModularTutorial/useTutorialState.ts](src/pages/ModularTutorial/useTutorialState.ts).
3. Thread the field through `ModularTutorialTemplate`, `LayoutManager`, and any renderer that consumes it.

That keeps the patch system consistent and avoids hidden states that the story cannot control.