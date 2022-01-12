import React from 'react';
import * as IoIcons from 'react-icons/io5';
import { IconContext } from 'react-icons';


const RoleTags = ({ tagListing, deletable }) => {
    return (
        <div className="l-Role-tags">
            <div className="c-Role-tags">
                <h1>{tagListing}</h1>
                {
                    deletable ?
                        <button type="button">
                            <IconContext.Provider value={{ color: "white", size: "16px" }}>
                                <IoIcons.IoCloseOutline />
                            </IconContext.Provider>
                        </button>
                        :
                        null
                }
            </div>
        </div>
    )
}

export default RoleTags;