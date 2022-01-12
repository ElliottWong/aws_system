import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { manageInductionFormSectionColumns } from '../config/tableColumns';

const InductionFormSection = ({
    sectionData,
}) => {
    console.log(sectionData);
    return (
        <div className="c-Induction-form-section">
            {/* Header section */}
            <div className='c-Induction-form-section__Header'>
                <p className = "c-Induction-form-section__Text">{sectionData?.section ? sectionData.section : "Could not retrieve section name"}</p>
            </div>

            {/* Tasks section */}
            <div className="c-Induction-form-section__Tasks">
                {
                    sectionData?.tasks?.length !== 0 ?
                        sectionData.tasks.map((taskData, index) => 
                            <InductionFormTask 
                                key={index}
                                taskData={taskData} 
                            />
                        )
                        :
                        "No records found!"
                }
            </div>

        </div>
    )
};

const InductionFormTask = ({
    taskData
}) => {
    return (
        <div className="c-Induction-form-task">
            {/* Header section */}
            <div className='c-Induction-form-task__Header'>
                <p className = "c-Induction-form-task__Text">Task: {taskData?.task ? taskData.task : "Could not retrieve section name"}</p>
            </div>
            {/* Table section */}
            <div className="c-Induction-form-task__Table">
                {
                    taskData?.length !== 0 ?
                        <BootstrapTable keyField="order" bordered={false} data={taskData.descriptions} columns={manageInductionFormSectionColumns} />
                        :
                        "No records found!"
                }
            </div>
        </div>
    );
};

export default InductionFormSection;