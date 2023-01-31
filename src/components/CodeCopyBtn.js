import React from "react";
import { FaCopy, FaCheckCircle } from 'react-icons/fa';

export default function CodeCopyBtn({ children }) {
    const [copyOk, setCopyOk] = React.useState(false);

    const handleClick = (e) => {
        navigator.clipboard.writeText(children[0].props.children[0]);
        console.log(children)

        setCopyOk(true);
        setTimeout(() => {
            setCopyOk(false);
        }, 2000);
    }

    const iconColor = '#ddd';
    const icon = copyOk ? <FaCheckCircle onClick={handleClick} color={iconColor} /> : <FaCopy onClick={handleClick} color={iconColor} />;

    return (
        <div className="code-copy-btn">
            {icon}
        </div>
    )
}
  