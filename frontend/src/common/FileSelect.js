import React, { useRef, useEffect, useState } from 'react';
import { IconContext } from 'react-icons';
import * as RiIcons from 'react-icons/ri';


/**
 * 
 * File select component.
 * @prop {ref} fileRef - Declare a ref in the parent component
 * 
 */
const FileSelect = ({ fileRef }) => {

    const [rerender, setRerender] = useState(false);

    useEffect(() => {
        console.log("file select effectiminda");
        console.log(fileRef);
        console.log(fileRef.current.files[0]);
    }, [rerender]);

    const handleFileSelectArea = () => {
        fileRef.current.click();
    };

    const handleFileInputChange = (event) => {
        setRerender((prevState) => !prevState);
    };

    return (
        <div className="c-File-select">
            <span
                className="c-File-select__Area"
                onClick={() => handleFileSelectArea()}
            >
                {
                    fileRef?.current?.files[0] !== undefined ?
                        <p>{fileRef.current?.files[0]?.name}</p>
                        : <p>Click here to select a file!</p>
                }
            </span>
            <input className="c-File-select__Raw" onChange={handleFileInputChange} type="file" ref={fileRef} />
        </div>
    )
}

export default FileSelect;