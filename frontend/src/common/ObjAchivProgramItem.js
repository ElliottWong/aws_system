import React, { useState, useRef } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { docObjAchivProgramFilesColumns } from '../config/tableColumns';
import { toast } from 'react-toastify';
import * as RiIcons from 'react-icons/ri';
import { IconContext } from 'react-icons';
import axios from 'axios';
import { getToken } from '../utilities/localStorageUtils';
import FileDownload from 'js-file-download';
import TokenManager from '../utilities/tokenManager';

const ObjAchivProgramItem = ({
    docType,
    itemContent,
    setDocEditTableData,
    itemIndex,
    docEditHeaderData,
    docEditTableData,
    tempFileArr,
    setTempFileArr,
    personelResponsibleList
}) => {

    const fileRef = useRef();
    const token = TokenManager.getToken();
    const [fileUploadInProgress, setFileUploadInProgress] = useState(false);

    const docObjAchivProgramFilesEditableColumns = [
        {
            dataField: 'fk_file_id',
            text: 'fileID',
            hidden: true
        },
        {
            dataField: 'serialNo',
            text: '#'
        },
        {
            dataField: 'file_name',
            text: 'File Name'
        },
        {
            dataField: 'action_delete',
            text: '',
            formatter: (cell, row) => {
                return (
                    <IconContext.Provider value={{ color: "#DC3545", size: "21px" }}>
                        <RiIcons.RiDeleteBin7Line onClick={() => (handleDeleteFile(row.serialNo))} />
                    </IconContext.Provider>
                );
            }
        }
    ];

    const docObjAchivProgramFilesColumns = [
        {
            dataField: 'fk_file_id',
            text: 'fileID',
            hidden: true
        },
        {
            dataField: 'serialNo',
            text: '#'
        },
        {
            dataField: 'file_name',
            text: 'File Name'
        },
        {
            dataField: 'action_download',
            text: '',
            formatter: (cell, row) => {
                return <button key={cell} onClick={() => handleFileDownload(row.fk_file_id, row.file_name)} className="c-Btn c-Btn--link">Download</button>
            }
        }
    ];

    // Handle file download
    const handleFileDownload = (fileID, fileName) => {
        axios.get(`${process.env.REACT_APP_BASEURL}/file/download/${fileID}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            responseType: 'blob'
        })
            .then((res) => {
                FileDownload(res.data, fileName);
                toast.success(<>Success!<br />Message: <b>Document has been downloaded successfully!</b></>);
            })
            .catch((err) => {
                console.log(err);
                let errCode = "Error!";
                let errMsg = "Error!"
                if (err.response !== undefined) {
                    errCode = err.response.status;
                    errMsg = err.response.data.message;
                }

                toast.error(<>Error Code: <b>{errCode}</b><br />Message: <b>{errMsg}</b></>);
            });
    };

    const renderTopEditDetails = () => {
        return (
            <>
                <div className="c-Top c-Top__Left">
                    <div className="c-Left c-Input-group">
                        <label htmlFor="function">Function:</label>
                        <textarea placeholder="Enter input" type="text" onChange={handleInputChange} name="function" value={itemContent.function || ''}></textarea>
                    </div>
                    <div className="c-Left c-Input-group">
                        <label htmlFor="quality_objective">Quality Objectives:</label>
                        <textarea placeholder="Enter input" type="text" onChange={handleInputChange} name="quality_objective" value={itemContent.quality_objective || ''} ></textarea>
                    </div>
                    <div className="c-Left c-Input-group">
                        <label htmlFor="personel_responsible">Personel Responsible:</label>
                        <select type="text" name="personel_responsible" onChange = {handleInputChange} value={itemContent.personel_responsible || ''}>
                            <option>{!personelResponsibleList ? "No roles found" : "Please select a role"}</option>
                            {
                                !personelResponsibleList ? null : personelResponsibleList.map((prData, prIndex) => (
                                    <option key={prIndex} value={prData.role_id}>
                                        {prData.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <div className="c-Top c-Top__Right">
                    <div className="c-Right c-Input-group">
                        <label htmlFor="data_collection">Collecting / Measuring Data:</label>
                        <textarea placeholder="Enter input" type="text" onChange={handleInputChange} name="data_collection" value={itemContent.data_collection || ''}></textarea>
                    </div>
                    <div className="c-Right c-Input-group">
                        <label htmlFor="data_analysis">Analysing Data:</label>
                        <textarea placeholder="Enter input" type="text" onChange={handleInputChange} name="data_analysis" value={itemContent.data_analysis || ''}></textarea>
                    </div>
                </div>
                <div className="c-Top__Delete">
                    <IconContext.Provider value={{ color: "#DC3545", size: "21px" }}>
                        <RiIcons.RiDeleteBin7Line onClick={() => (handleDocDeleteRow(itemIndex + 1))} />
                    </IconContext.Provider>
                </div>

            </>
        );
    };

    const renderTopDetails = () => {
        return (
            <>
                <div className="c-Top c-Top__Left">
                    <div className="c-Left c-Input-group">
                        <h1>Function:</h1>
                        <p>{itemContent.function || 'Nil'} </p>
                    </div>
                    <div className="c-Left c-Input-group">
                        <h1>Quality Objectives:</h1>
                        <p>{itemContent.quality_objective || 'Nil'}</p>
                    </div>
                    <div className="c-Left c-Input-group">
                        <h1>Personel Responsible:</h1>
                        <p>{itemContent.role && itemContent.role.name || 'Nil'}</p>
                    </div>
                </div>
                <div className="c-Top c-Top__Right">
                    <div className="c-Right c-Input-group">
                        <h1>Collecting / Measuring Data:</h1>
                        <p>{itemContent.data_collection || 'Nil'}</p>
                    </div>
                    <div className="c-Right c-Input-group">
                        <h1>Analysing Data:</h1>
                        <p>{itemContent.data_analysis || 'Nil'}</p>
                    </div>

                </div>
            </>
        );
    };

    // Handle input change
    const handleInputChange = (event) => {
        setDocEditTableData((prevState) => {
            return prevState.map((data, index) => {
                if (itemIndex === index) {
                    return {
                        ...data,
                        [event.target.name]: event.target.value
                    }
                }
                return data;
            });
        })
    };

    // Handler for deleting row 
    const handleDocDeleteRow = () => {
        let formattedTempFileArr = [];
        // Reset docEditTableData
        setDocEditTableData((prevState) => {
            // Remove deleted row from data array
            let newDocTableData = prevState.filter((dataElem) => {
                return dataElem.serialNo !== (itemIndex + 1);
            });
            // Update serial no. and files array
            let formattedDocTableData = newDocTableData.map((dataElem, index) => {
                return ({
                    ...dataElem,
                    serialNo: index + 1,
                    files: (() => {
                        return dataElem.files.map((fileData, fileIndex) => {
                            // if there are files
                            if (dataElem.files.length !== 0) {
                                // If files is new
                                if (fileData.new) {
                                    formattedTempFileArr.push({
                                        ...fileData,
                                        serialNo: fileIndex + 1,
                                        key: `files_${itemIndex}_${dataElem.files.length}`
                                    })
                                    return {
                                        ...fileData,
                                        serialNo: fileIndex + 1,
                                        key: `files_${itemIndex}_${dataElem.files.length}`
                                    }
                                } else {
                                    return fileData;
                                }

                            } else {
                                return fileData;
                            }
                        });

                    })()
                });
            });
            return formattedDocTableData;
        });

        // Reset temp file array
        setTempFileArr(() => {
            return formattedTempFileArr;
        });
    };

    // Handle files input change
    const handleFilesInputChange = (event) => {
        const fileObj = event.target.files[0];
        // if else is to prevent users from submitting multiple files everytime they click on choose file
        if (fileUploadInProgress) {
            setTempFileArr((prevState) => {
                return prevState.map((data, index) => {
                    if (data.itemIndex === itemIndex) {
                        return {
                            fileObj: fileObj,
                            itemIndex: itemIndex,
                            name: fileObj.name,
                            key: `files_${itemIndex}_${docEditTableData[itemIndex].files.length + 1}`
                        }
                    } else {
                        return data;
                    }
                });
            })
        } else {
            setFileUploadInProgress(() => true);
            setTempFileArr((prevState) => {
                return [
                    ...prevState,
                    {
                        fileObj: fileObj,
                        itemIndex: itemIndex,
                        name: fileObj.name,
                        key: `files_${itemIndex}_${docEditTableData[itemIndex].files.length + 1}`
                    }
                ]
            });
        }

    };

    // Handle delete file
    const handleDeleteFile = (fileSerialNo) => {
        let formattedTempFileArr = [];
        console.log(fileSerialNo);
        setDocEditTableData((prevState) => {

            return prevState.map((data, index) => {
                return {
                    ...data,
                    files: (() => {
                        // Filter out the remaining files
                        const newFileArr = data.files.filter((innerData, innerIndex) => {
                            if ((itemIndex + 1) === data.serialNo) {
                                return fileSerialNo !== innerData.serialNo;
                            } else {
                                return innerData;
                            }
                        });
                        console.log(newFileArr);
                        // Format the new files
                        const formattedFileArr = newFileArr.map((newData, newIndex) => {
                            // if there are files
                            if (data.files.length !== 0) {
                                // If files is new
                                if (newData.new) {
                                    formattedTempFileArr.push({
                                        ...newData,
                                        serialNo: newIndex + 1,
                                        key: `files_${index}_${newFileArr.length}`
                                    })
                                    return {
                                        ...newData,
                                        serialNo: newIndex + 1,
                                        key: `files_${index}_${newFileArr.length}`
                                    }
                                } else {
                                    return newData;
                                }

                            } else {
                                return newData;
                            }

                        });
                        return formattedFileArr;
                    })()
                }
            });
        });
        setTempFileArr((prevState) => {
            return formattedTempFileArr;
        });
    };


    // Handle upload file
    const handleFileUploadBtn = () => {

        // Check if there are files uploaded
        if (fileRef.current.value !== "") {
            // reset file input value
            fileRef.current.value = "";
            let threeFilesAlready = false;
            // check if there's already 3 files
            docEditTableData.forEach((data, index) => {
                if (itemIndex === index) {
                    if (data.files.length === 3) {
                        threeFilesAlready = true;
                    }
                }
            });
            if (threeFilesAlready) {
                toast.error(<>Error!<br />Message: <b>Maximum of 3 files per item!</b></>);
            } else {
                setDocEditTableData((prevState) => {
                    return prevState.map((data, index) => {
                        if (itemIndex === index) {
                            if (data.files.length === 0) {
                                return {
                                    ...data,
                                    files: [
                                        {
                                            serialNo: 1,
                                            new: true,
                                            fileObj: (() => {
                                                let toBeReturnedFileObj = {};
                                                console.log(data.files.length);
                                                tempFileArr.forEach((innerData, innerIndex) => {
                                                    if (data.key === `files_${itemIndex}_${data.files.length + 1}`) {
                                                        toBeReturnedFileObj = innerData.fileObj;
                                                    }
                                                });
                                                return toBeReturnedFileObj;
                                            })(),
                                            name: tempFileArr[tempFileArr.length - 1].name,
                                            key: `files_${itemIndex}_${data.files.length + 1}`,
                                            file_name: tempFileArr[tempFileArr.length - 1].name
                                        }
                                    ]
                                }
                            } else {
                                return {
                                    ...data,
                                    files: [
                                        ...data.files,
                                        {
                                            serialNo: data.files.length + 1,
                                            new: true,
                                            fileObj: (() => {
                                                let toBeReturnedFileObj = {};
                                                tempFileArr.forEach((innerData, innerIndex) => {
                                                    if (data.key === `files_${itemIndex}_${data.files.length + 1}`) {
                                                        toBeReturnedFileObj = data.fileObj;
                                                    }
                                                });
                                                return toBeReturnedFileObj;
                                            })(),
                                            name: tempFileArr[tempFileArr.length - 1].name,
                                            key: `files_${itemIndex}_${data.files.length + 1}`,
                                            file_name: tempFileArr[tempFileArr.length - 1].name
                                        }
                                    ]
                                }
                            }
                        }
                        return data;
                    })
                });
            }

        } else {
            toast.error(<>Error!<br />Message: <b>Please select a file!</b></>);
        }
        setFileUploadInProgress(() => false);

    };

    return (
        <div className="l-Obj-Achiv-Program-item">
            <div className="c-Obj-Achiv-Program-item">
                <div className="c-Obj-Achiv-Program-item__Top">
                    {docType === "edit" ?
                        renderTopEditDetails()
                        :
                        renderTopDetails()
                    }
                </div>
                <div className="c-Obj-Achiv-Program-item__Table">
                    <h1>Data tracking information</h1>
                    {/* Table section */}
                    {
                        docType === "edit" ?
                            <form className="c-Table__Add-files">
                                <div className="c-Add-files__Left">
                                    <input type="file" name="file" onChange={handleFilesInputChange} ref={fileRef} />
                                </div>
                                <div className="c-Add-files__Right">
                                    <button onClick={handleFileUploadBtn} type="button" className="c-Btn c-Btn--primary">Upload</button>
                                </div>
                            </form>
                            :
                            null
                    }
                    {
                        docType === "edit" ?
                            itemContent.files.length !== 0 ?
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={itemContent.files}
                                    columns={docObjAchivProgramFilesEditableColumns}
                                />
                                :
                                "No records found!"
                            :
                            itemContent.data.length !== 0 ?
                                <BootstrapTable
                                    bordered={false}
                                    keyField='serialNo'
                                    data={itemContent.data}
                                    columns={docObjAchivProgramFilesColumns}
                                />
                                :
                                "No records found!"
                    }

                </div>
            </div>
        </div>
    )
}

export default ObjAchivProgramItem;