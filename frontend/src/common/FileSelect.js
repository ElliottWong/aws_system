import React, { useRef } from 'react'

const FileSelect = ({text}) => {
    const inputFile = useRef(null);

    const handleFileSelectArea = () => {
        inputFile.current.click();
    };

    return (
        <div className = "c-File-select">
            <span 
                className = "c-File-select__Area"
                onClick={() => handleFileSelectArea()}
            >
                <p>{text ? text : "Please click to select file"}</p>
            </span>
            <input className = "c-File-select__Raw" type = "file" ref={inputFile} />
        </div>
    )
}

export default FileSelect;