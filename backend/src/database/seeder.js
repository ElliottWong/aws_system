// for dev only
// this file is quite messy
// things just get added on to the bottom

const { addDays, differenceInCalendarDays } = require('date-fns');

const bcrypt = require('bcryptjs');

const faker = require('@faker-js/faker');
faker.locale = 'en_GB';

const {
    Addresses, Companies, Employees, Files,
    User, Role,
    Documents: {
        Scopes, NormativeReferences, TermsAndDefinitions,
        SWOT, InterestedParties, QmsScope,
        Policies, OrganisationCharts,
        RO, OAP,
        EMP, PLC, HR
    }
} = require('../schemas/Schemas');

const c = require('../services/cloudinary');

const { enumValues, MODULE } = require('../config/enums');
const moduleKeys = enumValues(MODULE);

const mapRights = (edit, approve) => moduleKeys.map((key) => ({ module: key, edit, approve }));

const companyRoles = [
    {
        name: 'CEO',
        responsibility: 'Chief Executive Officer',
        rights: mapRights(true, true)
    },
    {
        name: 'CTO',
        responsibility: 'Chief Technology Officer',
        rights: mapRights(true, false)
    },
    {
        name: 'CFO',
        responsibility: 'Chief Financial Officer',
        rights: mapRights(false, true)
    }
];

const interestedPartiesList = ['Employees', 'Customers', 'Service Provider', 'Government', 'Stakeholders'];

const policiesList = ['Integrity', 'Client Focus', 'Innovation', 'Teamwork', 'Excellence'];

const swotList = {
    strengths: [
        'Swift and excellent customer service',
        'Good value for customer'
    ],
    weaknesses: [
        'Lacking in R&D',
        'Lacking local talent'
    ],
    opportunities: [
        'Growing market',
        'Government investments'
    ],
    threats: [
        'May not keep up with speed of technological advancements',
        'Competition from other companies'
    ]
};

const units = ['week', 'month', 'year'];

const parseUnits = (value) => {
    switch (value) {
        case 'week':
            return 7;
        case 'month':
            return 30;
        case 'year':
            return 365;
    }
};

const getRealisticFrequency = () => {
    const unit = units.at(Math.random() * units.length);

    const multiplier = unit === 'year'
        ? 3
        : unit === 'month'
            ? 5
            : 10;

    const occurrences = Math.floor(Math.random() * multiplier) + 1;

    // occurrences per unit amount of time
    return [occurrences, parseUnits(unit)];
};

const clampNegative = (value) => value < 0 ? 0 : value;

const arr = ['cert', 'licence', 'permit'];
const getLicenceName = () => {
    const append = arr.at(Math.random() * arr.length);
    const name = faker.commerce.productName();
    switch (append) {
        case arr[0]:
            return `Certificate of ${name}`;
        case arr[1]:
            return `${name} Licence`;
        case arr[2]:
            return `Permit for ${name}`;
    }
};

module.exports = async () => {
    // PLATFORM ADMINS
    // closure for variable scoping so these variables dont pollute the function scope
    {
        const firstname = faker.name.firstName();
        const lastname = faker.name.lastName();
        const username = `${firstname}_${lastname}`.toLowerCase();
        const state = faker.address.state();
        const postal_code = faker.address.zipCode();

        await Employees.create({
            firstname,
            lastname,
            title: null,
            email: `${username}@example.com`,
            fk_company_id: null,
            admin_level: 1,
            address: {
                address_line_one: faker.address.streetAddress(),
                address_line_two: `${state} ${postal_code}`,
                city: faker.address.city(),
                state,
                country: faker.address.country(),
                postal_code
            },
            account: {
                username,
                passwords: [{
                    password: bcrypt.hashSync('12345678!', 10)
                }]
            }
        }, {
            include: ['address', {
                model: User.Accounts,
                as: 'account',
                include: 'passwords'
            }]
        });
    }

    // COMPANIES
    for (let i = 0; i < 3; i++) {
        const state = faker.address.state();
        const postal_code = faker.address.zipCode();

        const company = await Companies.create({
            name: `${faker.company.companyName()} ${faker.company.companySuffix()}`,
            alias: faker.lorem.slug(),
            description: faker.company.catchPhrase(),
            business_registration_number: faker.datatype.uuid(),
            address: {
                address_line_one: faker.address.streetAddress(),
                address_line_two: `${state} ${postal_code}`,
                city: faker.address.city(),
                state,
                country: faker.address.country(),
                postal_code
            },
            status: 'active'
        }, { include: 'address' });

        Promise.all([
            c.createFolder(c.formDocumentsFolderPath(company.company_id, 'm05_03')),
            c.createFolder(c.formDocumentsFolderPath(company.company_id, 'm06_02'))
        ]).catch(console.log);

        const employees = [];

        // EMPLOYEES
        for (let j = 0; j < 10; j++) {
            const firstname = faker.name.firstName();
            const lastname = faker.name.lastName();
            const username = `${firstname}_${lastname}`.toLowerCase();

            // one admin per company
            const admin_level = j < 1 ? 2 : 0;

            const state = faker.address.state();
            const postal_code = faker.address.zipCode();

            // EMPLOYEE
            const employee = await Employees.create(
                {
                    firstname,
                    lastname,
                    title: faker.name.jobTitle(),
                    email: `${username}@example.com`,
                    fk_company_id: company.company_id,
                    admin_level,
                    address: {
                        address_line_one: faker.address.streetAddress(),
                        address_line_two: `${state} ${postal_code}`,
                        city: faker.address.city(),
                        state,
                        country: faker.address.country(),
                        postal_code
                    },
                    account: {
                        username, passwords: [{
                            password: bcrypt.hashSync('12345678!', 10)
                        }]
                    }
                },
                {
                    include: [
                        'address',
                        {
                            model: User.Accounts,
                            as: 'account',
                            include: 'passwords'
                        }
                    ]
                }
            );

            employees.push(employee);
        }

        const roleInsertions = companyRoles.map((role) => {
            return {
                ...role,
                fk_company_id: company.company_id,
                name: role.name + company.company_id.toString()
            };
        });

        // ROLES
        const insertedRoles = await Role.Roles.bulkCreate(roleInsertions, { include: 'rights' });

        // RIGHTS
        // first role
        employees[0].addRole(insertedRoles[0]);
        // second role
        employees[1].addRole(insertedRoles[1]);
        // third role
        employees[2].addRole(insertedRoles[2]);
        // 2 + 3
        employees[3].addRoles([insertedRoles[1], insertedRoles[2]]);
        // all
        employees[4].addRoles(insertedRoles);

        // PER COMPANY'S INTERESTED PARTIES
        const interestedParties = await InterestedParties.Forms.create({
            title: `FY2021 Q2 Interested Parties for Company ${company.company_id}`,
            fk_company_id: company.company_id,
            created_by: employees[0].employee_id,
            approved_by: employees[0].employee_id,
            status: 'active',
            approved_at: new Date()
        });

        const interestedPartiesInsertions = interestedPartiesList.map((party, i) => {
            return {
                fk_party_id: interestedParties.party_id,
                interested_party: party,
                expectations: faker.company.bs(),
                display_order: i + 1
            };
        });

        await InterestedParties.Items.bulkCreate(interestedPartiesInsertions);

        // PER COMPANY'S SWOT

        const swot = await SWOT.Forms.create({
            fk_company_id: company.company_id,
            created_by: employees[0].employee_id,
            approved_by: employees[0].employee_id,
            status: 'active',
            approved_at: new Date(),
            due_at: addDays(new Date(), 330),
        });

        const s = swotList.strengths.map((content, i) => {
            return {
                fk_swot_id: swot.swot_id,
                type: 'strength',
                content: content,
                display_order: i + 1
            };
        });

        const w = swotList.weaknesses.map((content, i) => {
            return {
                fk_swot_id: swot.swot_id,
                type: 'weakness',
                content: content,
                display_order: i + 1
            };
        });

        const o = swotList.opportunities.map((content, i) => {
            return {
                fk_swot_id: swot.swot_id,
                type: 'opportunity',
                content: content,
                display_order: i + 1
            };
        });

        const t = swotList.threats.map((content, i) => {
            return {
                fk_swot_id: swot.swot_id,
                type: 'threat',
                content: content,
                display_order: i + 1
            };
        });

        const swotItems = await SWOT.Items.bulkCreate([...s, ...w, ...o, ...t]);

        // RO
        const ro = await RO.Forms.create({
            fk_company_id: company.company_id,
            created_by: employees[0].employee_id,
            approved_by: employees[0].employee_id,
            title: 'RO for 2021 Q2',
            status: 'active',
            approved_at: new Date()
        });

        const roItemInsertions = swotItems.map((swotItem, i) => {
            const severity = Math.floor(Math.random() * 5) + 1;
            const likelihood = Math.floor(Math.random() * 5) + 1;
            const rpn = severity * likelihood;
            const action = rpn > 12 ? faker.company.bs() : null;

            return RO.Items.create({
                fk_risks_analysis_id: ro.risks_analysis_id,
                fk_swot_item_id: swotItem.swot_item_id,
                type: i % 2 === 0 ? 'risk' : 'opportunity',
                severity,
                likelihood,
                rpn,
                action
            });
        });

        await Promise.all(roItemInsertions);

        // PER COMPANY'S QMS SCOPE
        const qmsScope = await QmsScope.Forms.create({
            title: `FNC Entertainment ${company.company_id}`,
            content: '',
            fk_company_id: company.company_id,
            created_by: employees[0].employee_id,
            approved_by: employees[0].employee_id,
            status: 'active',
            approved_at: new Date()
        });

        const qmsScopeInsertions = [];
        for (let k = 0; k < 3; k++) {
            qmsScopeInsertions.push({
                fk_qms_scope_id: qmsScope.qms_scope_id,
                site_name: faker.address.streetName(),
                site_scope: faker.company.bs(),
                // fk_address_id: company.fk_address_id,
                address: faker.address.streetAddress(),
                display_order: k + 1
            });
        }

        await QmsScope.Items.bulkCreate(qmsScopeInsertions);

        // PER COMPANY'S POLICY
        const policy = await Policies.Forms.create({
            title: `Company Policy at FY2019/2021 ${company.company_id}`,
            fk_company_id: company.company_id,
            created_by: employees[0].employee_id,
            approved_by: employees[0].employee_id,
            status: 'active',
            approved_at: new Date()
        });

        const policyInsertions = policiesList.map((policytitle, i) => {
            return {
                fk_policy_id: policy.policy_id,
                title: policytitle,
                content: faker.company.bs(),
                display_order: i + 1
            };
        });

        await Policies.Items.bulkCreate(policyInsertions);

        // OAP
        const oap = await OAP.Forms.create({
            title: `OAP ${company.company_id}`,
            fk_company_id: company.company_id,
            created_by: employees[0].employee_id,
            approved_by: employees[0].employee_id,
            status: 'active',
            approved_at: new Date()
        });

        const oapItemInsertions = [];
        for (let k = 0; k < 3; k++) {
            oapItemInsertions.push({
                fk_achievement_id: oap.achievement_id,
                function: faker.company.catchPhrase(),
                quality_objective: faker.commerce.productDescription(),
                personel_responsible: insertedRoles[k].role_id,
                data_collection: faker.commerce.productDescription(),
                data_analysis: faker.commerce.productDescription(),
                display_order: k + 1
            });
        }
        await OAP.Items.bulkCreate(oapItemInsertions);

        // Clauses 1 - 3
        await Scopes.create({
            fk_company_id: company.company_id,
            content: faker.commerce.productDescription(),
            edited_by: employees[0].employee_id
        });
        await NormativeReferences.create({
            fk_company_id: company.company_id,
            content: faker.commerce.productDescription(),
            edited_by: employees[0].employee_id
        });
        await TermsAndDefinitions.create({
            fk_company_id: company.company_id,
            content: faker.commerce.productDescription(),
            edited_by: employees[0].employee_id
        });

        // clause 7.1
        const categoryInsertions = [
            { fk_company_id: company.company_id, name: faker.vehicle.type() },
            { fk_company_id: company.company_id, name: faker.vehicle.type() },
            { fk_company_id: company.company_id, name: faker.vehicle.type() }
        ];

        const categories = await EMP.Categories.bulkCreate(categoryInsertions);

        for (let k = 0; k < 3; k++) {
            const equipment = await EMP.Equipment.create({
                fk_company_id: company.company_id,
                created_by: employees[0].employee_id,
                // equipment_type: faker.vehicle.type(),
                reference_number: faker.random.alphaNumeric(8).toUpperCase(),
                register_number: faker.random.alphaNumeric(8).toUpperCase(),
                serial_number: faker.random.alphaNumeric(8).toUpperCase(),
                name: faker.vehicle.model(),
                model: faker.vehicle.manufacturer(),
                location: faker.address.streetAddress()
            });

            await EMP.Equipment2Categories.bulkCreate([
                { fk_category_id: categories.at(k).category_id, fk_equipment_id: equipment.equipment_id },
                { fk_category_id: categories.at(k - 1).category_id, fk_equipment_id: equipment.equipment_id }
            ]);

            const maintenanceInsertions = [];

            for (let l = 0; l < 3; l++) {
                const [multiplier, unitTime] = getRealisticFrequency();

                const lastService = faker.date.recent(7);
                const nextService = addDays(lastService, multiplier * unitTime);

                const now = new Date();
                const daysLeft = differenceInCalendarDays(nextService, now);
                const totalDays = differenceInCalendarDays(nextService, lastService);
                const daysLeftPct = clampNegative((daysLeft / totalDays) * 100);

                const inesrtion = EMP.Maintenance.create({
                    fk_company_id: company.company_id,
                    fk_equipment_id: equipment.equipment_id,
                    type: faker.company.bs(),
                    freq_multiplier: multiplier,
                    freq_unit_time: unitTime,
                    last_service_at: lastService,
                    next_service_at: nextService,
                    days_left: daysLeft,
                    days_left_pct: daysLeftPct
                });

                maintenanceInsertions.push(inesrtion);
            }

            const manyMaintenance = await Promise.all(maintenanceInsertions);

            const seen = new Set();
            // a chaotic mix of functional and imperative programming
            const assigneeInsertions = manyMaintenance.flatMap((maintenance) => {
                const arr = [];
                for (let n = 0; n < 3; n++) {
                    let employee_id;
                    do {
                        employee_id = employees.at(Math.random() * employees.length).employee_id;
                    }
                    while (seen.has(employee_id));
                    seen.add(employee_id);

                    const create = EMP.MaintenanceAssignees.create({
                        fk_equipment_id: equipment.equipment_id,
                        fk_maintenance_id: maintenance.maintenance_id,
                        fk_employee_id: employee_id
                    });
                    arr.push(create);
                }
                return arr;
            });

            await Promise.all(assigneeInsertions);

            // for (let l = 0; l < 3; l++) {
            //     promises.push(EMP.Assignees.create({
            //         fk_equipment_id: equipment.equipment_id,
            //         fk_employee_id: employees[l].employee_id
            //     }));
            // }

            // await Promise.all(promises);
        }

        // clause 7.2
        for (let k = 0; k < 10; k++) {
            const now = new Date();

            const iat = faker.date.recent(7);
            // every other license is perpetual
            const exp = k % 2 === 0 ? faker.date.soon(14) : null;

            let daysLeft = null,
                daysLeftPct = null;

            if (exp !== null) {
                daysLeft = differenceInCalendarDays(exp, now);
                const totalDays = differenceInCalendarDays(exp, iat);
                daysLeftPct = clampNegative((daysLeft / totalDays) * 100);
            }

            const licence = await PLC.Licences.create({
                fk_company_id: company.company_id,
                created_by: employees[0].employee_id,
                licence_name: getLicenceName(),
                licence_number: faker.random.alphaNumeric(8).toUpperCase(),
                external_organisation: faker.company.companyName(),
                issued_at: iat,
                expires_at: exp,
                days_left: daysLeft,
                days_left_pct: daysLeftPct
            });

            const promises = [];

            const seen = new Set();
            for (let l = 0; l < 3; l++) {
                let employee_id;
                do {
                    employee_id = employees.at(Math.random() * employees.length).employee_id;
                }
                while (seen.has(employee_id));
                seen.add(employee_id);

                promises.push(PLC.Assignees.create({
                    fk_licence_id: licence.licence_id,
                    fk_employee_id: employee_id
                }));
            }

            await Promise.all(promises);
        }

        // clause 7.3A
        // for (let k = 0; k < 4; k++) {
        //     await HR.TrainingRequests.create({

        //     });
        // }
    }
};
