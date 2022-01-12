import React, { useState } from 'react'
import { QUESTION_TYPE, TRAINING_EVALUATION_MODE } from '../config/enums';
import * as RiIcons from 'react-icons/ri';
import { IconContext } from 'react-icons';

const EvaluationQuestions = ({ mode, qns, index, viewType, setQuestions }) => {

    // State declaration
    const [type, setType] = useState(QUESTION_TYPE.DEFAULT);

    // Handlers
    const handleSelectQnsType = (event) => {
        setType(() => event.target.value);
    };

    const handleDeleteQns = () => {
        setQuestions((prevState) => {
            // Refer to companypolicyitem

            // Remove to be deleted qns from data array
            let newData = prevState.filter((data) => {
                return data.serialNo !== index + 1;
            });

            // Update serial no in array
            let formattedData = newData.ma((data, index) => {
                return ({
                    ...data,
                    serialNo: index + 1
                })
            });

            return formattedData;
        });
    };

    const renderEditQnsType = () => {
        // YES OR NO
        if (type === QUESTION_TYPE.BOOLEAN) {
            return (
                <div className="c-Evaluation-qns__Type c-Evaluation-qns__Type--boolean">
                    <div className="c-Evaluation-qns__Option">
                        <input name="boolean" type='radio' value="yes" readOnly/>
                        <label htmlFor="boolean">Yes</label>
                    </div>
                    <div className="c-Evaluation-qns__Option">
                        <input name="boolean" type='radio' value="no" readOnly/>
                        <label htmlFor="boolean">No</label>
                    </div>
                </div>
            );
        }

        // 1 - 5 Rating
        else if (type === QUESTION_TYPE.RATING) {
            return (
                <div className="c-Evaluation-qns__Type c-Evaluation-qns__Type--rating">
                    <div className="c-Evaluation-qns__Option">
                        <input name="rating" type='radio' value="1" readOnly/>
                        <label htmlFor="rating">Strongly Disagree</label>
                    </div>
                    <div className="c-Evaluation-qns__Option">
                        <input name="rating" type='radio' value="2" readOnly/>
                        <label htmlFor="rating">Disagree</label>
                    </div>
                    <div className="c-Evaluation-qns__Option">
                        <input name="rating" type='radio' value="3" readOnly/>
                        <label htmlFor="rating">Neutrel</label>
                    </div>
                    <div className="c-Evaluation-qns__Option">
                        <input name="rating" type='radio' value="4" readOnly/>
                        <label htmlFor="rating">Agree</label>
                    </div>
                    <div className="c-Evaluation-qns__Option">
                        <input name="rating" type='radio' value="5" readOnly/>
                        <label htmlFor="rating">Strongly Agree</label>
                    </div>
                </div>
            );
        }

        // Open ended
        else if (type === QUESTION_TYPE.OPEN) {
            return (
                <div className="c-Evaluation-qns__Type c-Evaluation-qns__Type--open">
                    <textarea name="open" readOnly placeholder="Enter something"></textarea>
                </div>
            );
        }

        else {
            return (
                <div className="c-Evaluation-qns__Type c-Evaluation-qns__Type--default">
                    <p>Please select a question type</p>
                </div>
            );
        }
    };
    
    const renderViewQnsType = () => {
        // YES OR NO
        if (viewType === QUESTION_TYPE.BOOLEAN) {
            return (
                <div className="c-Evaluation-qns__Type c-Evaluation-qns__Type--boolean">
                    <div className="c-Evaluation-qns__Option">
                        <input name="boolean" type='radio' value="yes" />
                        <label htmlFor="boolean">Yes</label>
                    </div>
                    <div className="c-Evaluation-qns__Option">
                        <input name="boolean" type='radio' value="no" />
                        <label htmlFor="boolean">No</label>
                    </div>
                </div>
            );
        }

        // 1 - 5 Rating
        else if (viewType === QUESTION_TYPE.RATING) {
            return (
                <div className="c-Evaluation-qns__Type c-Evaluation-qns__Type--rating">
                    <div className="c-Evaluation-qns__Option">
                        <input name="rating" type='radio' value="1" />
                        <label htmlFor="rating">Strongly Disagree</label>
                    </div>
                    <div className="c-Evaluation-qns__Option">
                        <input name="rating" type='radio' value="2" />
                        <label htmlFor="rating">Disagree</label>
                    </div>
                    <div className="c-Evaluation-qns__Option">
                        <input name="rating" type='radio' value="3" />
                        <label htmlFor="rating">Neutrel</label>
                    </div>
                    <div className="c-Evaluation-qns__Option">
                        <input name="rating" type='radio' value="4" />
                        <label htmlFor="rating">Agree</label>
                    </div>
                    <div className="c-Evaluation-qns__Option">
                        <input name="rating" type='radio' value="5" />
                        <label htmlFor="rating">Strongly Agree</label>
                    </div>
                </div>
            );
        }

        // Open ended
        else if (viewType === QUESTION_TYPE.OPEN) {
            return (
                <div className="c-Evaluation-qns__Type c-Evaluation-qns__Type--open">
                    <textarea name="open" placeholder="Enter something"></textarea>
                </div>
            );
        }

        else {
            return (
                <div className="c-Evaluation-qns__Type c-Evaluation-qns__Type--default">
                    <p>Error! Invalid Question type.</p>
                </div>
            );
        }
    };

    const renderQuestionByMode = () => {
        if (mode === TRAINING_EVALUATION_MODE.EDIT) {
            return (
                <div className = "c-Evaluation-qns__Edit">
                    <div className="c-Evaluation-qns__Top c-Top">
                        <div className="c-Top__Left">
                            <label htmlFor="qns">{index}.</label>
                            <input name="qns" type="text" placeholder="Enter question" />
                        </div>
                        <div className="c-Top__Right">
                            <label htmlFor="qnsType">Qns Type:</label>
                            <select name="qnsType" value={type} onChange={(event) => handleSelectQnsType(event)}>
                                <option value={QUESTION_TYPE.DEFAULT}>Select a qns type</option>
                                <option value={QUESTION_TYPE.OPEN}>Open Ended</option>
                                <option value={QUESTION_TYPE.RATING}>1 - 5 Rating</option>
                                <option value={QUESTION_TYPE.BOOLEAN}>Yes or No</option>
                            </select>
                        </div>
                    </div>
                    <div className="c-Evaluation-qns__Types">
                        {renderEditQnsType()}
                        <div className = "c-Evaluation-qns__Del">
                        <IconContext.Provider value={{ color: "#DC3545", size: "21px" }}>
                            <RiIcons.RiDeleteBin7Line className = "c-Delete" onClick={() => (handleDeleteQns())} />
                        </IconContext.Provider>
                        </div>
                    </div>
                    <hr />
                </div>
            );
        }

        if (mode === TRAINING_EVALUATION_MODE.VIEW) {
            return (
                <div className = "c-Evaluation-qns__View">
                    <div className="c-Evaluation-qns__Top c-Top">
                        <p>{index}.</p>
                        <p>{qns}</p>
                    </div>
                    <div className="c-Evaluation-qns__Types">
                        {renderViewQnsType()}
                    </div>
                    <hr/>
                </div>
            );
        }
    };

    return (
        <div className="c-Evaluation-qns">
            {renderQuestionByMode()}
        </div>
    )
}

export default EvaluationQuestions;