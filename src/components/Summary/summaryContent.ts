// File to store summary content data

export type SummaryComponent = {
  id: string;
  title: string;
  description?: string;
  content: string[];
};

export const Summary : SummaryComponent[] = [
    {
        id: "chapter1",
        title: "Chapter 1 Summary",
        description: "In this Chapter you learned the fundamentals of Scheduling Strategies. These included: ",
        content: [
            "Dynamic Priority Scheduling using the Earliest Deadline First (EDF) algorithm.",
            "Static Priority Scheduling using the Rate Monotonic Scheduling (RM) and Deadline Monotonic Scheduling (DM) algorithms.",
            "Where the different scheduling strategies differ when applied to various real-time system tasksets.",
            "How to visualize them using Gantt Charts.",  
        ],
    },
    {
        id: "tda",
        title: "Time Demand Analysis Break-Down",
        description: "Here are the main components of the Time Demand Analysis (TDA) formula explained: ",
        content: [
            "Lets assume we want to analyze the response time of Multimedia (the task to inspect). Brake and Sensor are higher priority tasks.",
            "$\\Delta$: The time interval being analyzed (e.g. interval [0-12] in the question).",
            "$C_k$: The execution time of the task being analyzed (e.g. Multimedia task with C=1).",
            "$\\sum_{\\tau_i \\in hp(\\tau_k)}$: Sum over all tasks with higher priority than the task being analyzed (here: Brakes and Sensor).",
            "$\\left\\lceil \\frac{\\Delta}{T_i} \\right\\rceil C_i$: For each higher priority task, calculate how many times it interferes in the interval $\\Delta$ (using its period $T_i$), multiply that by its execution time $C_i$.",
            "Example: $\\Delta = 12, \\tau_1 = \\text{Brakes}, C_1 = 2, T_1 = 8$, ",
            "$\\left\\lceil \\frac{12}{8} \\right\\rceil \\cdot 2 = \\left\\lceil 1.5 \\right\\rceil \\cdot 2 = 2 \\cdot 2 = 4$.",
            "Brakes task interferes 2 times in [0-12], thus contributing 4 units of execution time.",
        ],
    },
]
