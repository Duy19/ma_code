import "katex/dist/katex.min.css";

const quizQuestions = [
    {
        id: "q1",
        question: "Given Taskset τ, with tasks τ₁, τ₂, τ₃, τ₄ having periods T₁, T₂, T₃, T₄ respectively. Which one is a harmonic taskset?",
        answers: [
            { id: "a1", text: "T₁ = 2, T₂ = 4, T₃ = 6, T₄ = 8", isCorrect: false}, 
            { id: "a2", text: "T₁ = 3, T₂ = 5, T₃ = 15, T₄ = 30", isCorrect: false}, 
            { id: "a3", text: "T₁ = 4, T₂ = 8, T₃ = 12, T₄ = 16", isCorrect: false}, 
            { id: "a4", text: "T₁ = 2, T₂ = 4, T₃ = 8, T₄ = 16", isCorrect: true},
        ],
        visualContent: {
            type: "canvas",
            tasks: [  
                { id: "brake", name: "Brakes", C: 2, T: 8, D: 8, color: "#f87171" },
                { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
                { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
            ],
            algorithm: "RM",
            canvasMode: "default",
            hyperperiod: 12
        },
        explanation: "A taskset is harmonic if for every pair of tasks (\\tau_i, \\tau_j) with T_i < T_j, T_j is an integer multiple of T_i. Only option A4 satisfies this condition."
    },

    {
        id: "q2",
        question: "Are RM and DM optimal for periodic fixed-priority scheduling?",
        answers: [
            { id: "a1", text: "Yes, they are optimal.", isCorrect: false },
            { id: "a2", text: "No, they are not optimal.", isCorrect: false},
            { id: "a3", text: "They are only optimal under certain conditions.", isCorrect: true },
            { id: "a4", text: "They are always suboptimal.", isCorrect: false }
        ],
        explanation: "RM (Rate-Monotonic) and DM (Deadline-Monotonic) are not always optimal for periodic fixed-priority scheduling."
    },

    {
        id: "q3",
        question: "Given Taskset τ with Task Utilizations U₁, U₂ and U₃ which of the following options is definitely feasible under the Hyperbolic Bound?",
        answers: [
            { id: "a1", text: "U₁ = 0.33, U₂ = 0.33 and U₃ = 0.33.", isCorrect: false },
            { id: "a2", text: "U₁ = 0.50, U₂ = 0.30 and U₃ = 0.05.", isCorrect: false},
            { id: "a3", text: "U₁ = 0.10, U₂ = 0.45 and U₃ = 0.10.", isCorrect: true },
            { id: "a4", text: "U₁ = 1.00, U₂ = 0.10 and U₃ = 0.90", isCorrect: false }
        ],
        explanation: "The Hyperbolic Bound states that a taskset is definitely feasible if the product of (U_i + 1) for all tasks is less than or equal to 2. Only option A3 satisfies this condition."
    },

    {
        id: "q4",
        question: "Which statement about the Liu & Layland utilization bound is correct? (in the problem 1|spor, prmp, impl, fp| <= D))",
        answers: [
            { id: "a1", text: "The Liu & Layland utilization bound provides a sufficient but not necessary condition for schedulability.", isCorrect: true },
            { id: "a2", text: "Everything that does not satisfy the bound is definitely not schedulable.", isCorrect: false},
            { id: "a3", text: "If the a Taskset is feasible under the Hyperbolic Bound, it is also always feasible under the Liu & Layland bound.", isCorrect: false },
            { id: "a4", text: "It only works on harmonic tasksets.", isCorrect: false }
        ],
        explanation: "The Liu & Layland utilization bound provides a sufficient condition for schedulability, meaning that if a taskset's total utilization is below the bound, it is guaranteed to be schedulable. However, tasksets exceeding the bound may still be schedulable."
    },

    {
        id: "c2b_q1",
        question: "You are given a Taskset with the following tasks: Brakes, Sensor, and Multimedia (see visual). How much execution time is demanded by all tasks for the interval [0-12]?",
        answers: [
            { id: "a1", text: "Demand = 12", isCorrect: false}, 
            { id: "a2", text: "Demand = 8", isCorrect: false}, 
            { id: "a3", text: "Demand = 3", isCorrect: false}, 
            { id: "a4", text: "Demand = 9", isCorrect: true},
        ],
        visualContent: {
            type: "canvas",
            tasks: [  
                { id: "brake", name: "Brakes", C: 2, T: 8, D: 8, color: "#f87171" },
                { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
                { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
            ],
            algorithm: "RM",
            canvasMode: "default",
            hyperperiod: 12
        },
        explanation: "The Demand in the interval [0-12] is 9, which includes the execution time of all tasks within that interval."
    },

    {
        id: "c2b_q2",
        question: "You are given a Taskset with the following tasks: Brakes, Sensor, and Multimedia (see visual). For Multimedia, which tasks are interfering with its execution?",
        answers: [
            { id: "a1", text: "Only Brakes", isCorrect: true}, 
            { id: "a2", text: "Only Sensor", isCorrect: false}, 
            { id: "a3", text: "Both Brakes and Sensor", isCorrect: false}, 
            { id: "a4", text: "Neither Brakes nor Sensor", isCorrect: false},
        ],
        visualContent: {
            type: "canvas",
            tasks: [  
                { id: "brake", name: "Brakes", C: 2, T: 8, D: 8, color: "#f87171" },
                { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
                { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
            ],
            algorithm: "RM",
            canvasMode: "default",
            hyperperiod: 12
        },
        explanation: "Brakes and Sensor interfere with Multimedia's execution due to their higher priority under RM scheduling."
    },

    {
        id: "c2b_q3",
        question: "You are given a Taskset with the following tasks: Brakes, Sensor, and Multimedia (see visual). For Multimedia, what is the amount of interference time of higher priority tasks in the interval [0-10]?",
        answers: [
            { id: "a1", text: "8", isCorrect: false}, 
            { id: "a2", text: "7", isCorrect: true}, 
            { id: "a3", text: "6", isCorrect: false}, 
            { id: "a4", text: "9", isCorrect: false},
        ],
        visualContent: {
            type: "canvas",
            tasks: [  
                { id: "brake", name: "Brakes", C: 2, T: 8, D: 8, color: "#f87171" },
                { id: "sensor", name: "Sensor", C: 1, T: 3, D: 3, color: "#60a5fa" },
                { id: "media", name: "Multimedia", C: 1, T: 12, D: 12, color: "#34d399" },
            ],
            algorithm: "RM",
            canvasMode: "default",
            hyperperiod: 12
        },
        explanation: "For Multimedia, the interference time from higher priority tasks (Brakes and Sensor) in the interval [0-10] is 7."
    },
];

export default quizQuestions;