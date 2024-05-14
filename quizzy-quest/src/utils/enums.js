/**
 * Quiz Type enum
 */
export const QuizType = Object.freeze({
    MultipleChoice: "Multiple Choice",
    Identification: "Identification",
    TrueOrFalse: "True or False"
});

/**
 * Process State enum
 */
export const ProcessState = Object.freeze({
    Loading: 0, Error: 1, Success: 2
});

/**
 * Who create the quiz enum
 */
export const Creator = Object.freeze({
    All: "-", Self: "-created-"
});