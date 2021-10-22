import React from "react";

export default function Comment({ onAddComment, helper, deleteElement, onSubmitComment, commentError, selectedTester }) {
   return (
      <div data-html2canvas-ignore className="comment-wrapper" style={{ width: 235, height: "auto" }}>
         <div className="top-actions">
            <div className="d-flex align-items-center">
               <img src="/assets/comment.svg" alt="" />
               <span className="top-text">Report a Bug</span>
            </div>
            <img style={{ cursor: "pointer" }} onClick={() => deleteElement(helper.index)} src="/assets/delete.svg" alt="" />
         </div>
         <div className="reporter-body">
            {selectedTester !== "" && (
               <div className="mb-2">
                  <label htmlFor="">reporter</label>
                  <div className="reporter-wrapper">
                     <div className="avatar">{selectedTester.charAt(0).toUpperCase()}</div>
                     <div className="reporter-name">{selectedTester}</div>
                  </div>
               </div>
            )}

            <div>
               <label htmlFor="">comment</label>
               <textarea
                  style={{ width: "100%" }}
                  className={`form-control text-area-cls ${helper.commentIndex === commentError ? "error-highlight" : ""}`}
                  type="text"
                  name=""
                  id=""
                  value={helper.comment}
                  onChange={(e) => onAddComment(e, helper.commentIndex)}
                  name=""
                  id=""
                  rows="3"
               ></textarea>
            </div>
            <div className="text-center w-100">
               <button onClick={onSubmitComment} className="btn submit-btn btn-primary w-100 mt-3">
                  Submit
               </button>
            </div>
         </div>
      </div>
   );
}
