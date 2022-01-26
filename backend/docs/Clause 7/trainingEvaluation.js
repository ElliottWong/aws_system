// enum
const QUESTION_TYPE = {
    RATING: 'rating', // rate 1 to 5
    OPEN: 'open', // open ended question
    LIST: 'list', // many open ended answers
    BOOLEAN: 'bool', // yes or no
    MCQ: 'mcq'
};

// combined
const obj0 = {
    // meta is automatically added by the backend
    meta: {
        template: {
            name: 'post training evaluation 2021',
            version: '2021',
            created_by: 1,
            created_at: '',
            effective_at: ''
        },
        form: {
            trainee_id: 2,
            supervisor_id: 5,
            created_at: '',
            updated_at: '' // maybe
        }
    },
    // SEE HERE
    evaluation: {
        // we can include qns no and use array.sort(callback)
        // prob more applicable in the frontend than in the backend
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
        trainee: [
            { order: 2, type: QUESTION_TYPE.RATING, question: 'rate the trainer', answer: 4 },
            { order: 1, type: QUESTION_TYPE.OPEN, question: 'what did you learn', answer: 'blah blah' },
            { order: 3, type: QUESTION_TYPE.BOOLEAN, question: 'do you enjoy the training', answer: true },
            { order: 5, type: QUESTION_TYPE.LIST, question: 'food', answer: ['pizza', 'roti canai'] },
            { order: 4, type: QUESTION_TYPE.OPEN, question: 'remarks', answer: 'i want to die' },
            { order: 6, type: QUESTION_TYPE.MCQ, question: 'pick one', answer: 'option A', choices: [{ order: 2, value: 'option B' }, { order: 1, value: 'option A' }] }
        ],
        supervisor: [
            { order: 2, type: QUESTION_TYPE.RATING, question: 'rate the trainer', answer: 4 },
            { order: 1, type: QUESTION_TYPE.OPEN, question: 'what did you learn', answer: 'blah blah' },
            { order: 3, type: QUESTION_TYPE.BOOLEAN, question: 'do you enjoy the training', answer: true },
            { order: 5, type: QUESTION_TYPE.LIST, question: 'food', answer: ['pizza', 'roti canai'] },
            { order: 4, type: QUESTION_TYPE.OPEN, question: 'remarks', answer: 'i want to die' }
        ]
    }
};

// trainee only
const obj1 = {
    meta: {
        template: {
            name: 'post training evaluation 2021',
            version: '2021',
            created_by: 1,
            created_at: '',
            effective_at: ''
        },
        form: {
            trainee_id: 2,
            supervisor_id: 5,
            created_at: '',
            updated_at: '' // maybe
        }
    },
    // go directly to questions since we split the 2 person evaluation
    evaluation: [
        { order: 2, type: QUESTION_TYPE.RATING, question: 'rate the trainer', answer: 4 },
        { order: 1, type: QUESTION_TYPE.OPEN, question: 'what did you learn', answer: 'blah blah' },
        { order: 3, type: QUESTION_TYPE.BOOLEAN, question: 'do you enjoy the training', answer: true },
        { order: 5, type: QUESTION_TYPE.LIST, question: 'food', answer: ['pizza', 'roti canai'] },
        { order: 4, type: QUESTION_TYPE.OPEN, question: 'remarks', answer: 'i want to die' }
    ]
};

// supervisor only
const obj2 = {
    meta: {
        template: {
            name: 'post training evaluation 2021',
            version: '2021',
            created_by: 1,
            created_at: '',
            effective_at: ''
        },
        form: {
            trainee_id: 2,
            supervisor_id: 5,
            created_at: '',
            updated_at: '' // maybe
        }
    },
    // go directly to questions since we split the 2 person evaluation
    evaluation: [
        { order: 2, type: QUESTION_TYPE.RATING, question: 'rate the trainer', answer: 4 },
        { order: 1, type: QUESTION_TYPE.OPEN, question: 'what did you learn', answer: 'blah blah' },
        { order: 3, type: QUESTION_TYPE.BOOLEAN, question: 'do you enjoy the training', answer: true },
        { order: 5, type: QUESTION_TYPE.LIST, question: 'food', answer: ['pizza', 'roti canai'] },
        { order: 4, type: QUESTION_TYPE.OPEN, question: 'remarks', answer: 'i want to die' }
    ]
};

const compare = (a, b) => {
    if (a.order > b.oredr) return 1;
    if (a.order < b.order) return -1;
    return 0;
};

obj0.evaluation.trainee.sort(compare);
obj2.evaluation.sort(compare);

// run this file to see for yourself
console.log(obj0.evaluation);

// for the mcq
console.log('MCQ', obj0.evaluation.trainee.at(-1).choices.sort(compare));

console.log('JSON string', JSON.stringify(obj0));

/* class TrainingEvaluation {
    static QUESTION_TYPE = {
        RATING: 'rating', // 1 to 5
        OPEN: 'open', // open ended question
        LIST: 'list', // many open ended answers
        BOOLEAN: 'bool' // yes or no
    };

    static #comparator(a, b) {
        if (a.order > b.oredr) return 1;
        if (a.order < b.order) return -1;
        return 0;
    }

    static parse(stringJSON) {
        const obj = JSON.parse(stringJSON);
        obj.evaluation.trainee.sort(this.#comparator);
        obj.evaluation.supervisor.sort(this.#comparator);
        return new TrainingEvaluation(obj);
    }

    meta = { version: '', created_by: 0, created_at: '', effective_at: '' };
    evaluation = { trainee: [], supervisor: [] };
    trainee_id = 0;
    supervisor_id = 0;
    created_at = '';
    updated_at = '';

    constructor({ meta, evaluation, trainee_id, supervisor_id, created_at, updated_at }) {
        this.meta = meta;
        this.evaluation = evaluation;
        this.trainee_id = trainee_id;
        this.supervisor_id = supervisor_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
} */
