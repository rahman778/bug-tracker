import React from "react";

export default function BackDrop({ show, clicked, overlay }) {
    let styles = {
       width: "100%",
       height: "100%",
       position: "fixed",
       zIndex: 2100,
       left: 0,
       top: 0,
    };
    return show ? <div style={styles} className={`Backdrop ${overlay && "backdrop-overlay"}`} onClick={clicked}></div> : null;
 }