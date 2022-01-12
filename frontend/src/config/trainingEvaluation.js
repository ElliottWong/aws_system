import { QUESTION_TYPE } from './enums';

export const defaultTemplate = {
    meta: {
        template: {
            name: 'Post training evaluation 20XX',
            version: '20XX',
            created_by: null,
            created_at: null,
            effective_at: null
        },
        form: {
            trainee_id: 2,
            supervisor_id: 5,
            created_at: '',
            updated_at: '' // maybe
        }
    },
    evaluation: {
        // we can include qns no and use array.sort(callback)
        // prob more applicable in the frontend than in the backend
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
        trainee: [
            { order: 2, type: QUESTION_TYPE.RATING, question: 'rate the trainer', answer: 4 },
            { order: 1, type: QUESTION_TYPE.OPEN, question: 'what did you learn', answer: 'blah blah' },
            { order: 3, type: QUESTION_TYPE.BOOLEAN, question: 'do you enjoy the training', answer: true },
            { order: 4, type: QUESTION_TYPE.OPEN, question: 'remarks', answer: 'i want to die' },
        ],
        supervisor: [
            { order: 2, type: QUESTION_TYPE.RATING, question: 'rate the trainer', answer: 4 },
            { order: 1, type: QUESTION_TYPE.OPEN, question: 'what did you learn', answer: 'blah blah' },
            { order: 3, type: QUESTION_TYPE.BOOLEAN, question: 'do you enjoy the training', answer: true },
            { order: 4, type: QUESTION_TYPE.OPEN, question: 'remarks', answer: 'i want to die' }
        ]
    }
};