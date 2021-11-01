import React, { useState } from "react";

function Canvas(props) {
   const {
      canvasRef,
      contextRef,
      setCurrComment,
      helpers,
      setHelpers,
      highlight,
      helperIdx,
      setHelperIdx,
      comment,
      clientWidth,
   } = props;

   const [area, setArea] = useState({});
   const [isDrawing, setIsDrawing] = useState(false);
   const [commentIndex, setCommentIndex] = useState(0);
   const [initArea] = useState({
      startX: 0,
      startY: 0,
      width: 0,
      height: 0,
   });

   const startDrawing = ({ nativeEvent }) => {
      setCurrComment(null);
      setIsDrawing(true);

      setArea({
         startX: nativeEvent.clientX + document.documentElement.scrollLeft,
         startY: nativeEvent.clientY,
         width: 0,
         height: 0,
      });
   };

   const draw = ($event) => {
      if (!isDrawing) {
         return;
      }

      $event.preventDefault();
      area.width =
         $event.clientX -
         area.startX +
         document.documentElement.scrollLeft;
      area.height = $event.clientY - area.startY;
      if (
         area.startX + area.width >
         document.documentElement.scrollWidth
      ) {
         area.width =
            document.documentElement.scrollWidth - area.startX - 4;
      }
      if (area.startX + area.width < 0) {
         area.width = -area.startX + 4;
      }
      if (
         area.startY + area.height >
         document.documentElement.scrollHeight
      ) {
         area.height =
            document.documentElement.scrollHeight - area.startY - 4;
      }
      if (area.startY + area.height < 0) {
         area.height = -area.startY + 4;
      }
      _resetCanvas();
      _drawHighlightLines(helpers);
      if (
         highlight &&
         Math.abs(area.width) > 6 &&
         Math.abs(area.height) > 6
      ) {
         _drawLines(area.startX, area.startY, area.width, area.height);
         contextRef.current.clearRect(
            area.startX,
            area.startY,
            area.width,
            area.height
         );
      }
      _paintArea(helpers);
      _paintArea(helpers, false);
      if (
         !highlight &&
         Math.abs(area.width) > 6 &&
         Math.abs(area.height) > 6
      ) {
         contextRef.current.fillStyle = "rgba(0,0,0,.5)";
         contextRef.current.fillRect(
            area.startX,
            area.startY,
            area.width,
            area.height
         );
      }
   };

   const finishDrawing = ($event) => {
      setIsDrawing(false);

      if (comment) {
         if (
            $event.clientX + 2 >= area.startX &&
            area.startX >= $event.clientX
         ) {
            const area = {
               startX: $event.clientX,
               startY: $event.clientY,
            };
            setHelperIdx(helperIdx + 1);
            setCommentIndex(commentIndex + 1);
            const helper = Object.assign({}, area, {
               type: "comment",
               index: helperIdx + 1,
               comment: "",
               commentIndex: commentIndex + 1,
               xPercent: area.startX / (clientWidth * 1.7885),
               yPercent: area.startY / (clientWidth * 1.7825),
            });

            setHelpers([...helpers, helper]);
         } else {
            if (Math.abs(area.width) < 6 || Math.abs(area.height) < 6) {
               return;
            }
            setHelperIdx(helperIdx + 1);
            setCommentIndex(commentIndex + 1);
            let helper = Object.assign({}, area, {
               type: "rect",
               highlight: highlight,
               index: helperIdx + 1,
               comment: "",
               commentIndex: commentIndex + 1,
               xPercent: area.startX / (clientWidth * 1.7875),
               yPercent: area.startY / (clientWidth * 1.7875),
               xWidth: area.width / (clientWidth * 1.7875),
               yHeight: area.height / (clientWidth * 1.7875),
            });

            let newHelpers = [...helpers, helper];

            setHelpers(newHelpers);

            if (helper.width < 0) {
               helper.startX += helper.width;
               helper.width *= -1;
            }

            if (helper.height < 0) {
               helper.startY += helper.height;
               helper.height *= -1;
            }

            let areas = Object.assign({}, initArea);
            setArea(areas);

            _paintArea(newHelpers, highlight);
         }
         setCurrComment(commentIndex + 1);
         return;
      }

      if (Math.abs(area.width) < 6 || Math.abs(area.height) < 6) {
         return;
      }
      setHelperIdx(helperIdx + 1);
      let helper = Object.assign({}, area, {
         type: "rect",
         highlight: false,
         index: helperIdx + 1,
         comment: "test",
         commentIndex: null,
         xPercent: area.startX / (clientWidth * 1.7825),
         yPercent: area.startY / (clientWidth * 1.7825),
         xWidth: area.width / (clientWidth * 1.7825),
         yHeight: area.height / (clientWidth * 1.7825),
      });

      let newHelpers = [...helpers, helper];

      setHelpers(newHelpers);

      if (helper.width < 0) {
         helper.startX += helper.width;
         helper.width *= -1;
      }

      if (helper.height < 0) {
         helper.startY += helper.height;
         helper.height *= -1;
      }

      let areas = Object.assign({}, initArea);
      setArea(areas);

      _paintArea(newHelpers, false);
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

   return (
      <canvas
         id="source"
         onMouseDown={startDrawing}
         onMouseUp={finishDrawing}
         onMouseMove={draw}
         ref={canvasRef}
      />
   );
}

export default Canvas;
