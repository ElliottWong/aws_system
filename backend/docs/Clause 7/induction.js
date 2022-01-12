const FILE_TYPE = {
    UPLOAD: 'upload',
    EXTERNAL: 'external'
};

const obj = {
    meta: {
        template: {
            version: '2021',
            created_by: 1,
            created_at: '',
            effective_at: ''
        },
        form: {
            employee_id: 2,
            created_at: '',
            updated_at: '' // maybe
        }
    },
    sections: [
        {
            order: 1,
            section: 'Section A: Introduction',
            tasks: [
                {
                    order: 1,
                    task: 'Introduction',
                    descriptions: [
                        // when the template is cloned and done
                        { order: 1, description: 'Dress code', file: 'dress code picture', done: false, done_at: '1234' },
                        { order: 3, description: 'Staff indentification', file: 'staff id card', done: true, done_at: '1234' },
                        { order: 2, description: 'Working hours', done: true, done_at: '1234' }
                    ]
                },
                {
                    order: 2,
                    task: 'Rules',
                    descriptions: [
                        // template only
                        { order: 1, description: 'Attendance', file: 'attendance' }, // with a file
                        { order: 2, description: 'Regulations' } // without a file
                    ]
                }
            ]
        },
        {
            order: 2,
            section: 'Section B: IT Systems',
            tasks: [
                {
                    order: 1,
                    task: 'Introduction',
                    descriptions: [
                        {
                            order: 1,
                            description: 'Cloud storage',
                            file: { type: FILE_TYPE.EXTERNAL, name: 'Using Sharepoint', link: 'onedrive.ms' }
                        },
                        {
                            order: 2,
                            description: 'Folder structure',
                            file: { type: FILE_TYPE.EXTERNAL, name: 'Red flag', link: 'sus.mega.nz' } // inline file
                        },
                        {
                            order: 3,
                            description: 'File access',
                            file: { type: FILE_TYPE.UPLOAD, name: 'Securing files', file_id: 3 }
                        }
                    ]
                }
            ]
        }
    ],
    // we can choose to put files outside
    // i think its neater but it might be more troublesome because the keys must match
    files: {
        'dress code picture': {
            type: FILE_TYPE.UPLOAD,
            name: 'Dress code', // maybe? actually yes so it can be like anchor text click to download
            file_id: 1
        },
        'staff id card': {
            type: FILE_TYPE.EXTERNAL,
            name: 'How to read your staff ID',
            link: 'drive.google.com'
        },
        'attendance': {
            type: FILE_TYPE.EXTERNAL,
            name: 'Attendance tracking system',
            link: 'dropbox.com'
        }
    }
};
