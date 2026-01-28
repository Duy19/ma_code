// File to store summary content data

export type SummaryComponent = {
  id: string;
  title: string;
  description?: string;
  content: string[];
};

export const Summary : SummaryComponent[] = [
    // Chapter Summaries
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
        id: "chapter2",
        title: "Chapter 2 Summary",
        description: "In this Chapter you learned various methods to analyze the Schedulability of real-time tasksets. These included: ",
        content: [
            "Critical Instant Theorem to determine when the Worst-Case Response Time (WCRT) of tasks under Fixed-Priority Scheduling happens.",
            "Time Demand Analysis (TDA) to calculate the WCRT of tasks.",
            " Sufficient schedulability tests like the Liu & Layland Utilization Bound and the Hyperbolic Bound.",
            "Harmonic tasksets and their special properties regarding schedulability under RM scheduling.",
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
    {
        id: "llboundExample",
        title: "Example Liu & Layland Bound Calculation",
        description: "Here a small example of how to calculate the Liu & Layland Utilization Bound for a taskset with 3 tasks: ",
        content: [
            "We have the 3 tasks Brakes, Sensor and Multimedia with parameters: ",
            "Brakes: C=2, T=8, Sensor: C=1, T=4, Multimedia: C=1, T=10.",
            " Their utilizations each are: $U_{brakes} = \\frac{2}{8} = 0.25$, $U_{sensor} = \\frac{1}{4} = 0.25$, $U_{multimedia} = \\frac{1}{10} = 0.1$.",
            "Therefore the total utilization of the taskset is: $U_{total} = 0.25 + 0.25 + 0.1 = 0.6$.",
            "Using the Liu & Layland bound for 3 tasks: $3 \\cdot (2^{1/3} - 1) \\approx 0.78$.",
            "Since $U_{total} = 0.6 \\leq 0.78$, the taskset is guaranteed to be schedulable under RM.",
        ],
    },

    {
        id: "hyperboundExample",
        title: "Example Hyperbolic Bound Calculation",
        description: "Here a small example of how to calculate the Hyperbolic Bound for a taskset with 3 tasks: ",
        content: [
            "We have the 3 tasks Brakes, Sensor and Multimedia with parameters: ",
            "Brakes: C=2, T=8, Sensor: C=1, T=4, Multimedia: C=1, T=10.",
            " Their utilizations each are: $U_{brakes} = \\frac{2}{8} = 0.25$, $U_{sensor} = \\frac{1}{4} = 0.25$, $U_{multimedia} = \\frac{1}{10} = 0.1$.",
            "Therefore the total utilization of the taskset is: $U_{total} = 0.25 + 0.25 + 0.1 = 0.6$.",
            "Using the Hyperbolic bound for 3 tasks: $(1 + 0.25) \\cdot (1 + 0.25) \\cdot (1 + 0.1) \\approx 1.72$.",
            "Since $1.72 \\leq 2$, the taskset is guaranteed to be schedulable under RM.",
        ],
    },
]
