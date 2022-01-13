import { QUESTION_TYPE } from './enums';

export const defaultTemplate = {
    meta: {
        template: {
            name: 'Post training evaluation 20XX',
            version: '20XX.X',
            created_by: null,
            created_at: null,
            effective_at: null
        },
        form: {
            trainee_id: null,
            supervisor_id: null,
            created_at: '',
            updated_at: '' // maybe
        }
    },
    evaluation: {
        // we can include qns no and use array.sort(callback)
        // prob more applicable in the frontend than in the backend
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
        trainee: [
            { order: 2, type: QUESTION_TYPE.RATING, question: 'Rating question' },
            { order: 1, type: QUESTION_TYPE.OPEN, question: 'Open Ended question'},
            { order: 3, type: QUESTION_TYPE.BOOLEAN, question: 'Yes or No Question' },
        ],
        supervisor: [
            { order: 2, type: QUESTION_TYPE.RATING, question: 'Rating question' },
            { order: 1, type: QUESTION_TYPE.OPEN, question: 'Open Ended question'},
            { order: 3, type: QUESTION_TYPE.BOOLEAN, question: 'Yes or No Question' },
        ]
    }
};