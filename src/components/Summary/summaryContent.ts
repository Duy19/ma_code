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
        id: "model",
        title: "Real-Time System Model Summary",
        description: "Here you have a quick overview of the Real-Time System Model: ",
        content: [
            "This model is very important and is the basis for many more topics. This was proposed in the seminal paper by **Liu & Layland in 1973** and is still widely used today.",
            "Imagine our autonomous car and its three tasks **brakes**, **sensor** and **multimedia** as a Real-Time System example.",
            "For now our car has one processor, which tries to plan/schedule all our tasks (**uniprocessor system**).",
            "Tasks can **preempt** each other, meaning a higher-priority task can **interrupt** a lower-priority one while it is executing and run instead (e.g. brakes interrupting multimedia).",
            "Each task has parameters like **execution time (C)**, **period (T)**, **deadline (D)** and **offset (O)**.",
            "In our examples these are all **periodic** tasks. This means each task releases its job every T time steps (highlighted by the green upward arrows). For example, the sensor task releases every 3 time steps.",
            "There are also other types like **sporadic** tasks, where **T** is the minimum inter-arrival time between two releases. This is an extension of Liu & Layland's model by **Mok in 1983**.",
            "Because missing a **deadline (D)** of a task (red downward arrows) can lead to catastrophic consequences (e.g. a car crash), we call these **hard real-time systems**.",  
            "There are also different types of deadlines for task sets: **implicit** (D=T), **constrained** (D<=T), and **arbitrary** (D any value). If not stated otherwise, implicit deadlines are used for scheduling algorithms.",
        ],
    },

    {
        id: "chapter1",
        title: "Chapter 1 Summary",
        description: "In this chapter you learned the fundamentals of scheduling strategies. These included: ",
        content: [
            "Dynamic Priority Scheduling using the Earliest Deadline First (EDF) algorithm.",
            "Static Priority Scheduling using the Rate Monotonic Scheduling (RM) and Deadline Monotonic Scheduling (DM) algorithms.",
            "Where the scheduling strategies differ when applied to various real-time system task sets.",
            "Optimality of EDF for uniprocessor systems with preemption.",  
        ],
    },

    {
        id: "chapter2",
        title: "Chapter 2 Summary",
        description: "In this chapter you learned various methods to analyze the schedulability of real-time task sets. These included: ",
        content: [
            "Critical Instant Theorem to determine when the Worst-Case Response Time (WCRT) of tasks under Fixed-Priority Scheduling occurs.",
            "Time Demand Analysis (TDA) to calculate the WCRT of tasks.",
            "Sufficient schedulability tests like the Liu & Layland Utilization Bound and the Hyperbolic Bound.",
            "Harmonic task sets and their special properties regarding schedulability under RM scheduling.",
            "EDF schedulability test based on total utilization. $U \\leq 1$. This is also an exact test, for all deadline types regarding sporadic tasks. However, for periodic tasks, it is only exact for tasks with the same offset or if not only for implicit deadlines.",
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
            "Do this for all higher priority tasks and add $C_k$ to get the total time demand in the interval $\\Delta$. If this is less than or equal to $\\Delta$, the task is schedulable in that interval.",
            "And there you have it! Thats how TDA works. This was proposed by **Lehoczky et al. in 1989**.",
        ],
    },
    {
        id: "llboundExample",
        title: "Example Liu & Layland Bound Calculation",
        description: "Here is a small example of how to calculate the Liu & Layland Utilization Bound [Liu & Layland, 1973] for a task set with 3 tasks: ",
        content: [
            "We have the 3 tasks Brakes, Sensor and Multimedia with parameters: ",
            "Brakes: C=2, T=8, Sensor: C=1, T=4, Multimedia: C=1, T=10.",
            " Their utilizations each are: $U_{brakes} = \\frac{2}{8} = 0.25$, $U_{sensor} = \\frac{1}{4} = 0.25$, $U_{multimedia} = \\frac{1}{10} = 0.1$.",
            "Therefore the total utilization of the task set is: $U_{total} = 0.25 + 0.25 + 0.1 = 0.6$.",
            "Using the Liu & Layland bound for 3 tasks: $3 \\cdot (2^{1/3} - 1) \\approx 0.78$.",
            "Since $U_{total} = 0.6 \\leq 0.78$, the task set is guaranteed to be schedulable under RM.",
        ],
    },

    {
        id: "hyperboundExample",
        title: "Example Hyperbolic Bound Calculation",
        description: "Here is a small example of how to calculate the Hyperbolic Bound [Bini and Butazzo, 2001] for a task set with 3 tasks: ",
        content: [
            "We have the 3 tasks Brakes, Sensor and Multimedia with parameters: ",
            "Brakes: C=2, T=8, Sensor: C=1, T=4, Multimedia: C=1, T=10.",
            " Their utilizations each are: $U_{brakes} = \\frac{2}{8} = 0.25$, $U_{sensor} = \\frac{1}{4} = 0.25$, $U_{multimedia} = \\frac{1}{10} = 0.1$.",
            "Therefore the total utilization of the task set is: $U_{total} = 0.25 + 0.25 + 0.1 = 0.6$.",
            "Using the Hyperbolic bound for 3 tasks: $(1 + 0.25) \\cdot (1 + 0.25) \\cdot (1 + 0.1) \\approx 1.72$.",
            "Since $1.72 \\leq 2$, the task set is guaranteed to be schedulable under RM.",
        ],
    },

    // Cgapter 3 Summaries
    {
        id: "suspension",
        title: "Reasons for Task Suspension",
        description: "Here are some common reasons for task suspension in real-time systems: ",
        content: [
            "Computation offloading to a more powerful processor or cloud service. Those are timing-unreliable, so the task has to wait until the result is back.",
            "Waiting for a shared resource to become available e.g. a lock or semaphore.",
            "Multiple processors which are trying to access the same resource like a memory bus.",
            "Parallel task execution on other processors, where one task has to wait for the other to finish for results.",  
        ],
    }
]
