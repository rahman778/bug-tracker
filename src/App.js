import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import "./App.scss";
import BackDrop from "./components/BackDrop.jsx";
import Comment from "./components/Comment.jsx";
import Canvas from "./components/Canvas.jsx";

export default function App({ window }) {
   let development = process.env.NODE_ENV
   //get api key
   let globalObject = window[window["JS-Widget"]];
   let queue = globalObject?.q[0];

   let vh = Math.max(window.innerHeight);

   const canvasRef = useRef(null);
   const contextRef = useRef(null);

   const [clientWidth, setClientWidth] = useState(
      Math.max(
         document.documentElement.clientWidth || 0,
         window.innerWidth || 0
      )
   );

   const [testers, setTesters] = useState([]);
   const [initializeWidget, setInitializeWidget] = useState(false);
   const [issueSubmitting, setIssueSubmitting] = useState(false);
   const [isExpanded, setIsExpanded] = useState(false);
   const [selectedTester, setSelectedTester] = useState("");

   const [isOpen, setIsOpen] = useState(false);

   const [helpers, setHelpers] = useState([]);
   const [helperIdx, setHelperIdx] = useState(0);

   const [highlight, setHighlight] = useState(true);
   const [comment, setComments] = useState(true);

   const [currComment, setCurrComment] = useState(null);
   const [commentError, setCommentError] = useState(null);

   useEffect(() => {
      getWidgetData();
   }, [window]);

   const getWidgetData = async () => {
      const response = await fetch(
         `${process.env.REACT_APP_API_BASE}/api/widget/`,
         {
            headers: {
               "X-API-KEY": queue[0]?.apiKey,
               "Content-Type": "application/json",
            },
         }
      );

      const data = await response.json();

      if (data.status === "OK") {
         setTesters(data.data.end_users);
         validateDomain(data.data.domains);
      }
   };

   const validateDomain = (domains) => {
      const host = window.location.href;
      domains.map((dm) => {
         if (host.startsWith(dm.domain) || development) {
            setInitializeWidget(true);
         }
      });
   };

   useEffect(() => {
      window.addEventListener("resize", updateWidthAndHeight);
      return () =>
         window.removeEventListener("resize", updateWidthAndHeight);
   });

   const updateWidthAndHeight = () => {
      if (isOpen) {
         canvasRef.current.width = window.outerWidth;
         setClientWidth(
            Math.max(
               document.documentElement.clientWidth || 0,
               window.innerWidth || 0
            )
         );
      }
   };

   const prepareCanvas = () => {
      setIsOpen(true);
      const canvas = canvasRef.current;
      canvas.width = window.outerWidth;
      canvas.height = window.innerHeight;
      canvas.style.zIndex = 2099;
      canvas.style.cursor = "crosshair";

      const context = canvas.getContext("2d");
      contextRef.current = context;
      document.body.style.overflow = "hidden";
      _resetCanvas();
   };

   const printableCanvas = () => {
      const canvas = canvasRef.current;
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      contextRef.current.fillStyle = "rgba(128, 144, 160,0)";

      helpers
         .filter((helper) => !helper.highlight && helper.type === "rect")
         .forEach((helper) => {
            contextRef.current.fillStyle = "rgba(0,0,0,1)";
            contextRef.current.fillRect(
               helper.startX,
               helper.startY,
               helper.width,
               helper.height
            );
         });
   };

   const _resetCanvas = () => {
      const canvas = canvasRef.current;
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      contextRef.current.fillStyle = "rgba(128, 144, 160,.3)";
      contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
   };

   const _drawHighlightLines = (helpers) => {
      helpers
         .filter((helper) => helper.highlight)
         .forEach((helper) => {
            _drawLines(
               helper.startX,
               helper.startY,
               helper.width,
               helper.height
            );
         });
   };

   const _drawLines = (x, y, width, height) => {
      contextRef.current.strokeStyle = "#FF3969";
      contextRef.current.lineJoin = "bevel";
      contextRef.current.lineWidth = 4;
      contextRef.current.strokeRect(x, y, width, height);
      contextRef.current.lineWidth = 1;
   };

   const _paintArea = (helpers, highlight = true) => {
      if (highlight) {
         helpers
            .filter((helper) => helper.highlight && helper.type === "rect")
            .forEach((helper) => {
               contextRef.current.clearRect(
                  helper.startX,
                  helper.startY,
                  helper.width,
                  helper.height
               );
            });
      } else {
         helpers
            .filter(
               (helper) => !helper.highlight && helper.type === "rect"
            )
            .forEach((helper) => {
               contextRef.current.fillStyle = "rgba(70,80,90,1)";
               contextRef.current.fillRect(
                  helper.startX,
                  helper.startY,
                  helper.width,
                  helper.height
               );
            });
      }
   };

   const _redraw = (helper) => {
      _resetCanvas();
      _drawHighlightLines(helper);

      _paintArea(helper);
      _paintArea(helper, false);
   };

   const getInputStyles = (hlpr) => {
      let style = {};

      let commentHeight = selectedTester === "" ? 240 : 325;

      if (hlpr.type === "rect") {
         style = {
            position: "absolute",
            top:
               hlpr.startY > vh / 2
                  ? hlpr.startY - commentHeight
                  : hlpr.height + hlpr.startY + 3,
            left:
               hlpr.startX > clientWidth / 2
                  ? hlpr.startX + hlpr.width - 235
                  : hlpr.startX,
            zIndex: 2251,
         };
         if (
            hlpr.startY + hlpr.height + commentHeight > vh &&
            hlpr.startY < commentHeight
         ) {
            style = {
               ...style,
               top: 12,
            };
         }
      } else {
         style = {
            position: "absolute",
            top:
               hlpr.startY > vh / 2
                  ? hlpr.startY - commentHeight
                  : hlpr.startY,
            left:
               hlpr.startX > clientWidth / 2
                  ? hlpr.startX - 245
                  : hlpr.startX,
            zIndex: 2251,
         };
      }

      return style;
   };

   const openDrawer = () => {
      setIsExpanded(false);
      prepareCanvas();
   };

   const imageToBlob = async (syncImg) => {
      var canvas = document.createElement("canvas");
         canvas.width = canvasRef.current.width * 2;
         canvas.height = canvasRef.current.height * 2;

         if (!syncImg) {
            printableCanvas();
         }

         let image = await html2canvas(document.body, {
            scale: 2,
            canvas: canvas,
            allowTaint: true,
            windowWidth: window.innerWidth,
            x: window.scrollX,
            y: window.scrollY,
            ignoreElements: function (element) {
               /* Remove element with id="canvas-shapes" */
               if ("canvas-shapes" == element.id && !syncImg) {
                   return true;
               }
           },
         });

         const blob = await new Promise((resolve) =>
            image.toBlob(resolve)
         );

         const formData = new FormData();
         formData.append("file", blob, `${Math.floor(new Date().getTime() / 1000)}.png`);

         const uploadedFile = await fetch(
            `${process.env.REACT_APP_API_BASE}/api/files/`,
            {
               method: "POST",
               body: formData,
            }
         );

         const fileData = await uploadedFile.json();

         return fileData?.data

}

   const onSubmit = async () => {
      try {
         setIssueSubmitting(true);
         
         const uploadedSyncFile = await imageToBlob(true);
         const uploadedFile = await imageToBlob(false);

         const comments = helpers.map((item) => {
            const obj = Object.assign({});
            obj["description"] = item.comment;
            obj["extra"] = item;

            return obj;
         });

         const issueData = {
            title: null,
            description: null,
            image: uploadedFile?.id,
            sync_image: uploadedSyncFile?.id,
            reported_by: selectedTester,
            comments,
         };

         if (selectedTester === "") delete issueData.reported_by;

         const addIssue = await fetch(
            `${process.env.REACT_APP_API_BASE}/api/widget/issues/`,
            {
               method: "POST",
               headers: {
                  "X-API-KEY": queue[0]?.apiKey,
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(issueData),
            }
         );
      } catch (error) {
         console.log(error);
      } finally {
         setIssueSubmitting(false);
         closeDrawer();
      }
   };

   const onAddComment = (e, commentIndex) => {
      setCommentError(null);
      const newHelper = helpers.slice();
      const index = newHelper.findIndex(
         (helpr) => helpr.commentIndex === commentIndex
      );
      newHelper[index].comment = e.target.value;
      setHelpers(newHelper);
   };

   const closeDrawer = () => {
      setIsOpen(false);
      setHelpers([]);
      setHelperIdx(0);
      setSelectedTester("");
      document.body.style.removeProperty("overflow");
   };

   const deleteElement = (helperIndex) => {
      const helper = helpers.filter(
         (helpr) => helpr.index !== helperIndex
      );
      setHelpers(helper);
      _redraw(helper);
      setCurrComment(null);
   };

   const onEyeToolClick = () => {
      setHighlight(false);
      setComments(false);
   };

   const onCommentClick = () => {
      setComments(true);
      setHighlight(true);
   };

   const onShapeClick = (hlpr) => {
      if (hlpr.highlight || hlpr.type === "comment") {
         setCurrComment(hlpr.commentIndex);
      }
   };

   const onSubmitComment = () => {
      const visibleComment = helpers.filter(
         (hlpr) => hlpr.commentIndex === currComment
      )[0];
      if (visibleComment.comment === "") {
         setCommentError(visibleComment.commentIndex);
      } else {
         setCurrComment(null);
      }
   };

   if (!initializeWidget) return null;

   return (
      <div className="widget-wrapper">
         <div
            className={`canvas-modal ${isOpen ? "d-block" : "d-none"}`}
            style={{
               position: "fixed",
               left: 0,
               top: 0,
               width: "100%",
               height: "100%",
               zIndex: 2200,
            }}
         >
            <Canvas
               canvasRef={canvasRef}
               setCurrComment={setCurrComment}
               helpers={helpers}
               setHelpers={setHelpers}
               highlight={highlight}
               helperIdx={helperIdx}
               setHelperIdx={setHelperIdx}
               contextRef={contextRef}
               comment={comment}
               clientWidth={clientWidth}
            />
            <div
               className="helper-container"
               style={{
                  position: "absolute",
                  top: 0,
                  width: `${document.documentElement.scrollWidth}px`,
                  height: "0",
                  zIndex: 2199,
               }}
            >
               <BackDrop
                  show={currComment !== null}
                  clicked={onSubmitComment}
               />
               {helpers
                  .filter((shape) => shape.type === "rect")
                  .map((hlpr, indx) => {
                     return (
                        <div
                           key={indx}
                           data-html2canvas-ignore
                           style={{
                              position: "absolute",
                              top: hlpr.startY,
                              left: hlpr.startX,
                           }}
                        >
                           <div
                              onClick={() => onShapeClick(hlpr)}
                              style={{
                                 position: "absolute",
                                 top: 0,
                                 left: 0,
                                 width: hlpr.width,
                                 height: hlpr.height,
                                 background: hlpr.highlight
                                    ? "transparent"
                                    : "black",
                              }}
                           ></div>
                        </div>
                     );
                  })}

               {helpers
                  .filter((shape) => shape.type === "comment")
                  .map((hlpr, indx) => {
                     return (
                        <div
                           key={indx}
                           data-html2canvas-ignore
                           style={{
                              position: "absolute",
                              top: hlpr.startY,
                              left: hlpr.startX,
                           }}
                        >
                           <img
                              onClick={() => onShapeClick(hlpr)}
                              style={{
                                 position: "absolute",
                                 transform: "translate(-50%, -100%)",
                                 top: 0,
                                 left: 0,
                              }}
                              src="/assets/marker.svg"
                              alt=""
                           />
                        </div>
                     );
                  })}

               {helpers
                  .filter((item) => item.commentIndex !== null)
                  .map(
                     (hlpr, index) =>
                        currComment === hlpr.commentIndex && (
                           <div key={index} style={getInputStyles(hlpr)}>
                              <Comment
                                 onAddComment={onAddComment}
                                 helper={hlpr}
                                 deleteElement={deleteElement}
                                 onSubmitComment={onSubmitComment}
                                 commentError={commentError}
                                 selectedTester={selectedTester}
                              />
                           </div>
                        )
                  )}
            </div>
         </div>
         <div
            data-html2canvas-ignore
            className={`${isOpen ? "d-block" : "d-none"}`}
            style={{
               width: "100%",
               height: "100%",
               zIndex: 2098,
               position: "fixed",
               left: 0,
               top: 0,
               border: "6px solid #FF3969",
            }}
         ></div>
         {issueSubmitting && (
            <div className="loader-layout" data-html2canvas-ignore>
               <div className="loader"></div>
            </div>
         )}
         {isOpen && (
            <>
               <div
                  className="canvas-closer"
                  onClick={closeDrawer}
                  data-html2canvas-ignore
               >
                  <img src="/assets/close.svg" alt="" />
               </div>
               <div
                  className="tools-wrapper"
                  style={{ position: "fixed", zIndex: 2250 }}
                  data-html2canvas-ignore
               >
                  <div
                     className={`submit-tool tool-circle mb-3`}
                     onClick={onSubmit}
                  >
                     <img src="/assets/true.svg" alt="comment" />
                  </div>
                  <div
                     onClick={onCommentClick}
                     className={`${
                        comment ? "active" : "inactive"
                     } tool-circle mb-3`}
                  >
                     <img src="/assets/comment-shape.svg" alt="comment" />
                  </div>

                  <div
                     onClick={onEyeToolClick}
                     className={`${
                        !highlight ? "active" : "inactive"
                     } tool-circle`}
                  >
                     <img src="/assets/eyes-off.svg" alt="eye" />
                  </div>
               </div>
            </>
         )}

         {!isOpen && (
            <div className="issue-starter">
               <div
                  className="start-inner"
                  onClick={() => setIsExpanded(!isExpanded)}
               >
                  <img src="/assets/comment.svg" alt="" />
                  <span>Report a Bug</span>
               </div>

               <div
                  className={`collapsible-item ${
                     isExpanded ? "open" : ""
                  }`}
               >
                  <div className="item-body">
                     <div className="mb-4">
                        <label htmlFor="">reporter</label>
                        <div className="">
                           <select
                              name=""
                              className="form-control"
                              id=""
                              value={selectedTester}
                              onChange={(e) => {
                                 setSelectedTester(e.target.value);
                              }}
                           >
                              <option value=""></option>
                              {testers?.map((tester) => (
                                 <option value={tester.username}>
                                    {tester.username}
                                 </option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <div className="text-center">
                        <button
                           className="btn submit-btn w-100"
                           onClick={openDrawer}
                        >
                           Start Reporting
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
