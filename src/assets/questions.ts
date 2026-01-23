import "katex/dist/katex.min.css";

const quizQuestions = [
    {
        id: "q1",
        question: "Given Taskset τ, with tasks τ₁, τ₂, τ₃, τ₄ having periods T₁, T₂, T₃, T₄ respectively. Which one is harmonic?",
        answers: [
            { id: "a1", text: "T₁ = 2, T₂ = 4, T₃ = 6, T₄ = 8", isCorrect: false}, 
            { id: "a2", text: "T₁ = 3, T₂ = 5, T₃ = 15, T₄ = 30", isCorrect: false}, 
            { id: "a3", text: "T₁ = 4, T₂ = 8, T₃ = 12, T₄ = 16", isCorrect: false}, 
            { id: "a4", text: "T₁ = 2, T₂ = 4, T₃ = 8, T₄ = 16", isCorrect: true},
        ],
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
    }
];

export default quizQuestions;