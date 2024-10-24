import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer, Circle, Line } from 'react-konva';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2';
const SeatChart = () => {
  // id: 座位編號 type: 型態 componentsId: 型態專用編號 x: x座標 y: y座標 SeatId: 座號 studentName: 學生姓名 studentId: 學生學號 MacAddress: Mac地址
  const [components, setComponents] = useState([]);
  const [typeId, setTypeId] = useState(0);
  const [Width, setWidth] = useState(1200); //設定教室寬度
  const [Height, setheight] = useState(1000); //設定教室高度
  const [seatNum, setSeatNum] = useState(0); //該座位表座位的總數
  const [RID, setRID] = useState(0);
  const [status, setStatus] = useState(0);
  const [disabledSeats, setDisabledSeats] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(0);
  const [selectedSeatId, setSelectedSeatId] = useState(0);
  const [inputSeatOrientation, setInputSeatOrientation] = useState("");
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [stageDraggable, setStageDraggable] = useState(true);
  const [selectedSeatType, setSelectedSeatType] = useState("");//新增連續放置座位和形狀的模式
  const [seatCount, setSeatCount] = useState(0); //seatCount主要是用於計算連續新增座位的數量
  const stageRef = useRef(null);
  const nextSeatIdRef = useRef(1);
  const nextIdRef = useRef(1); //useRef是React的Hook，用於在React組件的整個生命週期中保存數值。
  const newIdRef = useRef(0);
  const transformerRef = useRef(0);
  const [continuousAddSeat, setcontinuousAddSeat] = useState("inactive");
 
  const handleContiunuousAddSeat = (event) => { //event參數：當事件發生時該參數會自動被傳遞給這個函式，包含了事件的所有資訊，像是觸發的元素，如select元素一樣。
    setcontinuousAddSeat(event.target.value); //抓取select元素的值也就是value=active/inactive，並且設定為continuousAddSeat的值。
    // 這裡的event.target.value是指checkbox的值，當checkbox被選中時，event.target.value的值為true，否則為false
  }
 
// 將 handleTypeId 函數獨立出來，以便重用
function handleTypeId(type) {
  switch (type) {
    case 'leftSeat': return 1;
    case 'rightSeat': return 2;
    case 'frontSeat': return 3;
    case 'backSeat': return 4;
    case 'whiteBoard': return 5;
    case 'door': return 6;
    case 'window': return 7;
    default: return 0;
  }
}
 
  const handleDragStart = (type) => {
    setStageDraggable(false);
 
    const typeId = handleTypeId(type);
 
    const newComponents = {
      type: type,
      componentId: nextIdRef.current,
      typeId: typeId,
      x: 0,
      y: 0,
      RID: RID,
      seatId: null,
      studentName: '',
      studentId: '',
      macAddress: '',
      status: 0,
    };
   
    // 根據條件設定 SeatId，像下面的三元運算式
    // newIdRef是一個(ref)物件，通常於React中用於存取DOM node或是儲存可變的值而不會引起組件重新渲染/或是說ref儲存的數值在組件在重新渲染的過程中保持不變，除非自己改它。
    // newIdRef.current的主要作用是用來存放新的座位或形狀或是更新現有的值，...newComponent為將ref物件中的所有屬性複製到新物件中。
    setSeatNum((type === 'leftSeat' || type === 'rightSeat' || type === 'frontSeat' || type === 'backSeat') ? nextSeatIdRef.current : seatNum);
    newIdRef.current = {
      ...newComponents,
      seatId: (type === 'leftSeat' || type === 'rightSeat' || type === 'frontSeat' || type === 'backSeat') ? `${nextSeatIdRef.current++}` : 0
    };
  }
 
  //下面這一段是用作是新增component，當左側的座位被拖曳到stage上時，會在components陣列中新增一個元素，並且將newIdRef.current的值設為null。
  const handleStageMouseUp = (e) => {
    if(newIdRef.current && e.target === stageRef.current.getStage()){
      const stage = stageRef.current.getStage();
      const pointerPosition = stage.getRelativePointerPosition();
      newIdRef.current.x = Math.round(pointerPosition.x);
      newIdRef.current.y = Math.round(pointerPosition.y);
      setComponents([...components, newIdRef.current]);
      nextIdRef.current++;
      newIdRef.current = null;
      setStageDraggable(true);
    }
  };
 
  const handleSelectedSeatTypeChange = (e) => {
    setSelectedSeatType(e.target.value);
  }
 
  const handleComponentClick = (e, id) => {
    console.log('handleComponentClick', id);
    components.forEach(component => {
      if(component.componentId === id){
        console.log(component);
        console.log(nextIdRef.current);
        console.log(nextSeatIdRef.current);
        if((component.typeId === 1)||(component.typeId === 2)||(component.typeId === 3)||(component.typeId === 4)){
          setSelectedSeatId(component.seatId);
          setInputSeatOrientation(component.type);
        }else{
          setSelectedSeatId("");
          setInputSeatOrientation("");
        }
      }
    });
    setSelectedComponentId(id);
  };

  const [ghostSeats, setGhostSeats] = useState([]); // 虛影座位
  const handleStageMouseMove = (e) => {
    if (e.target === stageRef.current.getStage()) {
      const stage = stageRef.current.getStage();
      const pointerPosition = stage.getPointerPosition();
      if (continuousAddSeat === "active") {
        if (['leftSeat', 'rightSeat', 'frontSeat', 'backSeat'].includes(selectedSeatType)) {
          const newGhostSeats = [];
          for (let i = 0; i < seatCount; i++) {
            let x = pointerPosition.x;
            let y = pointerPosition.y;
            switch (selectedSeatType) {
              case 'leftSeat':
                y = y + i * 50;
                break;
              case 'rightSeat':
                y = y + i * 50;
                break;
              case 'frontSeat':
                x = x + i * 100;
                break;
              case 'backSeat':
                x = x + i * 100;
                break;
              default:
                break;
            }
            setGhostSeats([]);
            const newGhostSeat = {
              componentId: nextIdRef.current + i,
              type: selectedSeatType,
              typeId: handleTypeId(selectedSeatType),
              x: x,
              y: y,
              seatId: nextSeatIdRef.current + i,
              studentName: '',
              studentId: '',
              macAddress: '',
              status: 0,
            };
            newGhostSeats.push(newGhostSeat);
          }
          setGhostSeats(newGhostSeats); // 更新虛影座位
        }
      }else{
        setGhostSeats([]);
      }
    }
  };

  const handleGhostComponentsClick = (e, id) => {
    nextIdRef.current += parseInt(seatCount);
    nextSeatIdRef.current += parseInt(seatCount);
    setComponents([...components, ...ghostSeats]); // 添加座位
    setGhostSeats([]); // 清除虛影
  };

  //selectedSeatType 現在用做是之前新增的選項，當選擇了leftSeat、rightSeat、frontSeat、backSeat時，輸入座位數量，並且新增相應數量的座位。
  const handleStageClick = (e) => {
    if (e.target === stageRef.current.getStage()) {
      setSelectedComponentId(null);
      setSelectedSeatId("");
      setInputSeatOrientation("");
      const stage = stageRef.current.getStage();
      const pointerPosition = stage.getPointerPosition();
    }
  };
 
  const handleDragEnd = (e) => {
    const id = e.target.id();
    console.log("DragEnd-id: " + id);
    let newX = Math.round(e.target.x());
    let newY = Math.round(e.target.y());
 
    const newComponents = components.map(component => {
      if (component.componentId === id) {
        for (const element of components) {
          if (component.typeId === element.typeId && component.componentId !== element.componentId) {
              console.log("elementId: " + element.componentId);
              console.log("componentId: " + component.componentId);
              console.log("newX: " + newX);
              console.log("newY: " + newY);
              console.log("success");
              break;
          }
        }
        return { ...component, x: newX, y: newY };
      }
      return component;
    });
    setComponents(newComponents);
    setSelectedComponentId("");
    setSelectedSeatId("");
    setInputSeatOrientation("");
  };  
 
  const handleDragMove = () => {
  };
 
  //輸入座位坐號
  const handleTextDblClick = (componentId) => {
    const newSeatId = prompt('請輸入新的座位編號:');
    if (newSeatId) {
      const newComponents = components.map(component => {
        if (component.componentId === componentId) {
          return {
            ...component,
            seatId: newSeatId
          };
        }
        return component;
      });
      setComponents(newComponents);
    }
  };
  const handleDeleteObject = (id) => {
    const selectedComponent = components.find(component => component.componentId === selectedComponentId);
    if((selectedComponent.typeId === 5)||(selectedComponent.typeId === 6)||(selectedComponent.typeId === 7)){
      const updatedComponents = components.filter(component => component.componentId !== id);
      setComponents(updatedComponents);
      setSelectedComponentId("");
    }else{
      if(parseInt(selectedComponent.seatId) === parseInt(nextSeatIdRef.current-1)){
        const updatedComponents = components.filter(selectedComponent => selectedComponent.componentId !== id);
        setComponents(updatedComponents);
        nextSeatIdRef.current -= 1;
        if(nextSeatIdRef.current <= 0) nextSeatIdRef.current = 1;
        setSelectedComponentId("");
        setSelectedSeatId("");
        setInputSeatOrientation("");
      }else{
        Swal.fire({
          title: `請先刪除${nextSeatIdRef.current}座位`,
          icon: 'warning',
        });
      }
   };
  };
 
  const handleExportImg = () => {
    const stage = stageRef.current.getStage().content;
    html2canvas(stage).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'screenshot.png';
      link.click();
    });
  };
 
  const handleSaveDb = () => {
    if(RID===0){
      Swal.fire({
        title: `請輸入教室號碼在進行儲存`,
        icon: 'warning',  
      })
    }else{
      const data = {
        Width: Width,
        Height: Height,
        seatNum: seatNum,
        ComponentsArray: components,
      };
      console.log(data.ComponentsArray);
      const dataStr = JSON.stringify(data);
      $.ajax({
          url: 'http://localhost:8080/storeInDatabase_DesignSeatChart.php',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ ComponentsArray: data.ComponentsArray }),
          success: function (response) {
              console.log("Data transmitted to database.");
              console.log(response);
              Swal.fire({
                title: `資料已成功儲存至`+RID+`教室`,
                showCancelButton: true,
              })
          },
          error: function (error) {
              console.log("Error: ", error);
          },
      });
    }
};
 
const handleLoadFromDb = () => {
  Swal.fire({
    title: '輸入教室號碼',
    input: 'text',
    inputLabel: '教室號碼',
    inputPlaceholder: '請輸入教室號碼',
    showCancelButton: true,
    confirmButtonText: '載入座位表',
    cancelButtonText: '取消',
    inputValidator: (value) => {
      setRID(value);
      if (!value) {
        return '請輸入教室號碼';
      }
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      console.log("Click load btn");
      (async () => {
        try {
          const formData = new FormData();
          formData.append('RID', result.value);
          const response = await fetch("http://localhost:8080/loadFromDatabase_DesignSeatChart.php", {
            method: "POST",
            body: formData,
          });

          // Check if the response is ok
          if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
          }

          const data = await response.json();
          console.log("This is data: ");
          console.log(data);

          let newNextSeatId = 0;
          let newId = 0;
          for(let i=0; i<data.length; i++){
            if(newNextSeatId < parseInt(data[i]["seatId"]))
              newNextSeatId = data[i]["seatId"];
            if(newId<data[i]["componentId"])
              newId = data[i]["componentId"];
            console.log("data back to front:"+data[i]["seatId"]);
          }
          console.log(data);
          setComponents(data);
          nextIdRef.current = parseInt(newId) + 1;
          nextSeatIdRef.current = parseInt(newNextSeatId) + 1;


        } catch (error) {
          console.error("Error fetching data from db:", error);
          Swal.fire({
            title: `未有${result.value}教室座位表`,
            icon: 'warning',
          });
        }
      })();
    }
  });
};

  const handleDeleteDataSheet = () => {
    Swal.fire({
      title: '請輸入所欲刪除的教室號碼',
      input: 'number',
      inputLabel: '教室號碼',
      inputPlaceholder: '請輸入教室號碼',
      showCancelButton: true,
      confirmButtonText: '準備座位表',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if (!value) {
          return '請輸入教室號碼';
        }
      }
    }).then((result) => {
      if(result.isConfirmed && result.value){
        let deleteClassRoomID = result.value;
        Swal.fire({
          title: `請問是否刪除${deleteClassRoomID}教室的資料表`,
          text: "一旦刪除，現存的資料和已規劃之座位表，將全部淨空無法恢復！",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: "確認刪除",
          cancelButtonText: "取消刪除",
        }).then(async (result) => {
          if (result.isConfirmed) {
            setComponents([]);
            nextIdRef.current = 1;
            nextSeatIdRef.current = 1;
            try {
              const formData = new FormData();
              formData.append('RID', deleteClassRoomID);
              const response = await fetch("http://localhost:8080/deleteDataSheet.php", {
                method: 'POST',
                body: formData,
              });
              if (response.ok) {
                Swal.fire({
                  title: `成功刪除${deleteClassRoomID}教室的資料表`,
                  icon: 'success',
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: "確認",
                })
                console.log('座位表已成功刪除');
              } else {
                Swal.fire({
                  title: `無法刪除${deleteClassRoomID}教室的資料表，請回報錯誤!`,
                  icon: 'warnning',
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: "確認",
                })
                console.error('刪除座位表失敗');
              }
            } catch (error) {
              console.error('刪除座位表時發生錯誤', error);
            }
          }
        });
      }
    })
    
  };
 
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "classRoomId" && value.trim() === "") {
      alert("請輸入教室號碼");
      return;
    } else if (name === 'seatOrientation') {
      setInputSeatOrientation(value);
    } else if (name === "classRoomId") {
      setRID(value);
      const newComponents = handleAssignRID(components, value);
      setComponents(newComponents);
    }else if (name === 'mutiSeatSelected') {
      setSeatCount(value);
    }
  };
 
  const handleAssignRID = (components, value) => {
    return components.map(component => {
      return { ...component, RID: value };
    });
  };
 
  const handleAssignSeat = () => {
    if(inputSeatOrientation !== 'whiteBoard' || inputSeatOrientation !== 'door' || inputSeatOrientation !== 'window'){
      const updatedComponents = components.map(component => {
        // console.log('updatedComponents', component.id, selectedComponentId);
        const selectedTypeId = handleTypeId(inputSeatOrientation);        
        if (component.componentId === selectedComponentId) {
          return {
            ...component,
            type: inputSeatOrientation,
            typeId: selectedTypeId,
            status: 1,
          };
        }
        console.log('updateComponentTypeId:'+selectedTypeId);
        console.log('updateComponentType:'+inputSeatOrientation);
        return component;
      });
      setComponents(updatedComponents);
    }
  };

 
  useEffect(() => {
    setSeatNum(nextSeatIdRef.current-1);
    setRID(RID);
    if(selectedComponentId !== null){
      const selectedComponent = components.find(components => components.componentId === selectedComponentId);
      if(selectedComponent){
        // 遍歷 components 以找出所有 studentName 為 "電腦故障" 的組件
        const updatedDisabledSeats = components.filter(component => component.studentName === "電腦故障");
        // 使用找到的組件更新 disabledSeats 狀態
        setDisabledSeats(updatedDisabledSeats);
      }
    }
  }, [selectedComponentId, components]);
 
  const handleMouseDown = (e) => {
    if (e.target === stageRef.current.getStage()) {
      setIsDragging(true);
    }
  };
 
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = stagePosition.x + e.movementX;
    const newY = stagePosition.y + e.movementY;
    setStagePosition({ x: newX, y: newY });
    setStageDraggable(false);
  };
 
  const handleMouseUp = () => {
    setIsDragging(false);
  };
 
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 阻止 Enter 鍵，不然整個smartSeating會重新整理，ＱＡＱ。
    }
  }


  return (
    <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <nav className="navbar fixed-top bg-dark">
        <div className="container-fluid">
        <Link to="/HomePage" className="navbar-brand text-light">SmartSeating 座位管理系统</Link>          
        <ul className="navbar-nav d-flex flex-row align-items-center">
            <li className="nav-item">
              <button onClick={handleExportImg} className="btn btn-dark">
                <i className="bi bi-image"></i>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={handleLoadFromDb} className="btn btn-dark">
                <i className="bi bi-download"></i>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={handleSaveDb} className="btn btn-dark">
                <i className="bi bi-upload"></i>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={handleDeleteDataSheet} className="btn btn-dark">
                <i className="bi bi-trash"></i>
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <div className="row mt-5 pt-3">
        <div className="col-1">
          <div className="bg-light p-3" style={{ cursor: 'grab', height: '100vh' ,overflowY: 'auto' }}>
          <div
            draggable
            onDragStart={() => handleDragStart('leftSeat')}
            style={{ width: '50px', height: '50px', backgroundColor: 'grey', margin: '5px' }}
          >
            左座位
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('rightSeat')}
            style={{ width: '50px', height: '50px', backgroundColor: 'grey', margin: '5px' }}
          >
            右座位
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('frontSeat')}
            style={{ width: '50px', height: '50px', backgroundColor: 'grey', margin: '5px' }}
          >
            前座位
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('backSeat')}
            style={{ width: '50px', height: '50px', backgroundColor: 'grey', margin: '5px' }}
          >
            後座位
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('whiteBoard')}
            style={{width: '50px',height: '50px', backgroundColor: 'grey', margin: '5px'}}
          >
            白板
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('door')}
            style={{width: '50px',height: '50px', backgroundColor: 'grey', margin: '5px'}}
          >
            門
          </div>
          <div
            draggable
            onDragStart={() => handleDragStart('window')}
            style={{width: '50px',height: '50px', backgroundColor: 'grey', margin: '5px'}}
          >
            窗
          </div>
          </div>
        </div>
        <div className="col-9">
          <div
            onMouseDown={handleMouseDown}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              height: '100vh',
              overflow: 'hidden',
            }}
          >
            <Stage
              ref={stageRef}
              width={Width}
              height={Height}
              x={stagePosition.x}
              y={stagePosition.y}
              onClick={handleStageClick}
              onMouseUp={handleStageMouseUp}
              onMouseMove={handleStageMouseMove}
              style={{
                border: '2px solid black',  // 增加外框線
                padding: '10px'  // 增加內邊距
              }}
            >
              <Layer>
              {components.map((component) => (
                <Group
                  key={component.componentId}
                  id={component.componentId}
                  x={component.x}
                  y={component.y}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, component.componentId)}
                  onDragMove={handleDragMove}
                  onClick={(e) => handleComponentClick(e, component.componentId)}
                >
                  {component.type === 'rightSeat' && (
                    <>
                      <Rect width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Circle
                        x={135}
                        y={25}
                        radius={25}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Rect x={150} y={0} width={10} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={128}
                        y={20}
                        onDblClick={() => handleTextDblClick(component.componentId)}
                      />
                    </>
                  )}
                  {component.type === 'leftSeat' && (
                    <>
                      <Circle
                        x={25}
                        y={25}
                        radius={25}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Rect x={50} width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Rect x={0} y={0} width={10} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={18}
                        y={20}
                        onDblClick={() => handleTextDblClick(component.componentId)}
                      />
                    </>
                  )}
                  {component.type === 'frontSeat' && (
                    <>
                      <Rect width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Circle
                        x={55}
                        y={-25}
                        radius={25}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Rect x={30} y={-50} width={50} height={10} fill="white" stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={48}
                        y={-30}
                        onDblClick={() => handleTextDblClick(component.componentId)}
                      />
                    </>
                  )}
                  {component.type === 'backSeat' && (
                    <>
                      <Rect width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Circle
                        x={55}
                        y={75}
                        radius={25}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Rect x={30} y={90} width={50} height={10} fill="white" stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={48}
                        y={70}
                        onDblClick={() => handleTextDblClick(component.componentId)}
                      />
                    </>
                  )}
                  {component.type === 'whiteBoard' && (
                    <>
                      <Rect width={200} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Text text={`白板`} fontSize={12} fill="black" x={80} y={20} />
                    </>
                  )}
                  {component.type === 'door' && (
                    <>
                      <Rect width={60} height={100} fill="white" stroke="black" strokeWidth={2} />
                      <Line
                        points={[30, 0, 30, 100]} // Vertical line in the middle of the door
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Circle
                        x={15}
                        y={50}
                        radius={5}
                        fill="black"
                      />
                    </>
                  )}
                  {component.type === 'window' && (
                    <>
                      <Rect width={60} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Text text={`窗`} fontSize={12} fill="black" x={18} y={20} />
                    </>
                  )}
                </Group>
              ))}
              {ghostSeats.map((component) => (
                <Group
                  key={component.componentId}
                  id={component.componentId}
                  x={component.x}
                  y={component.y}
                  opacity={0.5}
                  onClick={(e) => handleGhostComponentsClick(e, component.componentId)}
                >
                  {component.type === 'rightSeat' && (
                    <>
                      <Rect width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Circle
                        x={135}
                        y={25}
                        radius={25}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Rect x={150} y={0} width={10} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={128}
                        y={20}
                        onDblClick={() => handleTextDblClick(component.componentId)}
                      />
                    </>
                  )}
                  {component.type === 'leftSeat' && (
                    <>
                      <Circle
                        x={25}
                        y={25}
                        radius={25}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Rect x={50} width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Rect x={0} y={0} width={10} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={18}
                        y={20}
                        onDblClick={() => handleTextDblClick(component.componentId)}
                      />
                    </>
                  )}
                  {component.type === 'frontSeat' && (
                    <>
                      <Rect width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Circle
                        x={55}
                        y={-25}
                        radius={25}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Rect x={30} y={-50} width={50} height={10} fill="white" stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={48}
                        y={-30}
                        onDblClick={() => handleTextDblClick(component.componentId)}
                      />
                    </>
                  )}
                  {component.type === 'backSeat' && (
                    <>
                      <Rect width={110} height={50} fill="white" stroke="black" strokeWidth={2} />
                      <Circle
                        x={55}
                        y={75}
                        radius={25}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Rect x={30} y={90} width={50} height={10} fill="white" stroke="black" strokeWidth={2} />
                      <Text
                        text={component.seatId}
                        fontSize={12}
                        fill="black"
                        x={48}
                        y={70}
                        onDblClick={() => handleTextDblClick(component.componentId)}
                      />
                    </>
                  )}
                </Group>
              ))}
                <Transformer ref={transformerRef} />
              </Layer>
            </Stage>
          </div>
        </div>
        <div className="col-2">
        {(
            <div>
              <div>
              <div>
                <label htmlFor="classRoomId">教室號碼:</label>
              </div>
              <div>
                <form>
                  <input
                    type="number"
                    id="classRoomId"
                    name="classRoomId"
                    className="form-control"
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    value={RID}
                  />
                </form>
              </div>
              <div>
              <label>座位總數:</label>
                  <input
                    type="number"
                    id="seatNum"
                    name="seatNum"
                    className="form-control"
                    value={seatNum}
                    disabled
                  />
              </div>
              <hr/>
              <form>
              <div>
                  <label>啟用連續新增座位：</label>
                  <select id='seatAddingOption' value={continuousAddSeat} onChange={handleContiunuousAddSeat}>
                    <option value="inactive">
                      否
                    </option>
                    <option value="active">
                      是
                    </option>
                  </select>
              </div>
                <div>
                    <label>
                      新增座位數量:
                    </label>
                    <input type="text"
                          className="form-control"
                          name="mutiSeatSelected"
                          id="addNewSeatNum"
                          onChange={handleInputChange}
                          onKeyDown={handleKeyPress}
                          // 主要是因為input位於form內，所以按下Enter時會觸發form的submit，所以要阻止enter。
                      />
                  </div>
              <div>
                <input type="radio"
                      name="mutiSeatSelected"
                      id="selectedLeftSeat"
                      value="leftSeat"
                      onChange={handleSelectedSeatTypeChange}
                />
                <label htmlFor="selectedLeftSeat">左座位</label>
                <input type="radio"
                      name="mutiSeatSelected"
                      id="selectedRightSeat"
                      value="rightSeat"
                      onChange={handleSelectedSeatTypeChange}
                />
                <label htmlFor="selectedRightSeat">右座位</label>
              </div>
              <div>
                <input type="radio"
                      name="mutiSeatSelected"
                      id="selectedfrontSeat"
                      value="frontSeat"
                      onChange={handleSelectedSeatTypeChange}
                />
                <label htmlFor="selectedFrontSeat">前座位</label>
                <input type="radio"
                      name="mutiSeatSelected"
                      id="selectedBackSeat"
                      value="backSeat"
                      onChange={handleSelectedSeatTypeChange}
                />
                <label htmlFor="selectedBackSeat">後座位</label>
              </div>
              </form>
              <hr/>
              </div>
              <div>
                所選取座位號碼:
                <input
                    type="number"
                    id="selectedSeatId"
                    name="selectedSeatId"
                    className="form-control"
                    value={selectedSeatId}
                    disabled
                  />
              </div>
              <div className="form-group mb-3">
                <label>座位方向</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <select
                    className="form-control"
                    name="seatOrientation"
                    value={inputSeatOrientation}
                    onChange={handleInputChange}
                    style={{width:'160px'}}
                  >
                    <option value="" onChange={handleInputChange}>請選擇</option>
                    <option value="leftSeat" onChange={handleInputChange}>向左</option>
                    <option value="rightSeat" onChange={handleInputChange}>向右</option>
                    <option value="frontSeat" onChange={handleInputChange}>向後</option>
                    <option value="backSeat" onChange={handleInputChange}>向前</option>
                  </select>
                  <button onClick={handleAssignSeat} className="btn btn-primary">
                    確認
                  </button>
                </div>
                <div>
                  <label>刪除座位/物件</label>
                  <div>
                    <button
                      onClick={() => handleDeleteObject(selectedComponentId)}
                      className="btn btn-primary"
                      disabled={!selectedComponentId} // 當未選擇座位或形狀時禁用按鈕
                    >
                      刪除
                    </button>
                  </div>
                </div>

              </div>
              <hr/>
              <div>
                <div>
                  <label>教室寬度:</label>                
                  <input
                    name = "Width"
                    value={Height}
                    onChange={handleInputChange}
                    style={{width: '150px'}}
                  />
                </div>
                <div>
                <label>教室高度:</label>      
                  <input
                    name = "Height"
                    value={Width}
                    onChange={handleInputChange}
                    style={{width: '150px'}}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default SeatChart;