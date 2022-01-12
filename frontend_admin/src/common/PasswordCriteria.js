import React from "react";

const PasswordCriteria = ({
    validity: { minChar, number, specialChar, match }
}) => {
    return (
        <div className="c-Card__Password-criteria">
            <div className="c-Password-criteria__Header">
                <b>Password Criteria</b>
            </div>
            <ul>
                <PasswordStrengthIndicatorItem
                    isValid={minChar}
                    text="Have at least 8 characters"
                />
                <PasswordStrengthIndicatorItem
                    isValid={number}
                    text="Have at least 1 number"
                />
                <PasswordStrengthIndicatorItem
                    isValid={specialChar}
                    text="Have at least 1 special character"
                />
                <PasswordStrengthIndicatorItem
                    isValid={match}
                    text="Passwords must match"
                />
            </ul>
        </div>
    );
};

const PasswordStrengthIndicatorItem = ({ isValid, text }) => {
    const highlightClass = isValid
        ? "text-success"
        : "text-danger";
    return <li className={highlightClass}>{text}</li>;
};

export default PasswordCriteria;
